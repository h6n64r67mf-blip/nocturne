import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Notifications(){
  const [items,setItems] = useState<any[]>([])
  useEffect(()=>{
    let sub: any
    ;(async ()=>{
      const user = await supabase.auth.getUser()
      const uid = user.data?.user?.id
      if(!uid) return
      const { data } = await supabase.from('notifications').select('*').eq('user_id', uid).order('created_at',{ascending:false}).limit(20)
      setItems(data || [])

      // subscribe to realtime notifications for this user
      sub = supabase.channel('public:notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` }, payload=>{
          setItems(prev => [payload.new, ...prev])
        }).subscribe()
    })()
    return ()=>{ if(sub) supabase.removeChannel(sub) }
  },[])

  async function markRead(id:string){
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setItems(items.map(i=> i.id===id ? {...i, is_read:true} : i))
  }

  if(items.length===0) return <div className="text-ash">No notifications</div>
  return (
    <div className="space-y-2">
      {items.map(n=> (
        <div key={n.id} className={`p-2 rounded ${n.is_read ? 'bg-transparent' : 'bg-black/40'}`}>
          <div className="text-sm">{n.data?.message || n.type}</div>
          <div className="text-xs text-ash">{new Date(n.created_at).toLocaleString()}</div>
          {!n.is_read && <button onClick={()=>markRead(n.id)} className="text-xs text-goldAccent mt-1">Mark read</button>}
        </div>
      ))}
    </div>
  )
}
