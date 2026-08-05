import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

export default function Messages(){
  const [threads,setThreads] = useState<any[]>([])
  useEffect(()=>{ (async ()=>{
    const user = supabase.auth.getUser()
    const { data } = await supabase.from('messages').select('id,sender_id,receiver_id,content,created_at').order('created_at',{ascending:false}).limit(50)
    setThreads(data || [])
  })() },[])

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-serif">Messages</h1>
      {threads.map(t=> (
        <Link key={t.id} href={`/messages/${t.id}`} className="block p-3 bg-deepPanel rounded-md border border-slate-800">
          <div className="text-sm text-ash">{t.content}</div>
          <div className="text-xs text-ash mt-1">{t.created_at}</div>
        </Link>
      ))}
    </div>
  )
}
