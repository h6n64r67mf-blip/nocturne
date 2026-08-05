import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../lib/supabaseClient'

export default function Following(){
  const router = useRouter()
  const { id } = router.query
  const [items,setItems] = useState<any[]>([])
  useEffect(()=>{ if(!id) return; (async ()=>{
    const { data } = await supabase.from('follows').select('following_id').eq('follower_id', id).limit(100)
    const ids = (data||[]).map((r:any)=>r.following_id)
    if(ids.length===0) { setItems([]); return }
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids)
    setItems(profiles || [])
  })() },[id])

  if(!id) return null
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-serif">Following</h2>
      {items.map(p=> (
        <div key={p.id} className="p-3 bg-deepPanel rounded border border-slate-800 flex items-center gap-3">
          <img src={p.avatar_url || '/avatar-placeholder.png'} className="w-10 h-10 rounded-full" />
          <div>
            <div className="font-medium">{p.display_name}</div>
            <div className="text-xs text-ash">{p.bio}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
