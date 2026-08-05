import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import { incrementStreak } from '../../lib/streaks'

export default function Thread(){
  const router = useRouter()
  const { thread } = router.query
  const [messages,setMessages] = useState<any[]>([])
  const [text,setText] = useState('')
  const listRef = useRef<HTMLDivElement|null>(null)

  useEffect(()=>{
    if(!thread) return
    ;(async ()=>{
      const { data } = await supabase.from('messages').select('*').eq('thread_id', thread).order('created_at',{ascending:true})
      setMessages(data || [])
    })()

    const sub = supabase.channel('public:messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload=>{
      if(payload.new.thread_id === thread) setMessages(m=>[...m, payload.new])
    }).subscribe()

    return ()=> { supabase.removeChannel(sub) }
  },[thread])

  const [isWhisper,setIsWhisper] = useState(false)

  async function send(){
    if(!text) return
    const userRes = await supabase.auth.getUser()
    const userId = userRes.data?.user?.id
    const receiverId = messages.length ? (messages[0].sender_id === userId ? messages[0].receiver_id : messages[0].sender_id) : null
    await supabase.from('messages').insert([{ thread_id: thread, content: text, is_whisper: isWhisper, sender_id: userId, receiver_id: receiverId }])
    setText('')
    if(userId && receiverId){
      incrementStreak(userId, receiverId)
      try{ await fetch('/api/notify/message', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ receiverId, actorId: userId, text }) }) }catch(e){ console.warn('notify message error', e) }
    }
  }

  return (
    <div className="flex flex-col h-[70vh]">
      <div ref={listRef} className="flex-1 overflow-auto space-y-2 p-3 bg-deepPanel rounded-t-md">
        {messages.map(m=> <div key={m.id} className="p-2 bg-black/40 rounded">{m.content}</div>)}
      </div>
      <div className="p-3 bg-deepPanel rounded-b-md border-t border-slate-800 flex items-center gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-2 rounded bg-transparent border border-slate-700" />
        <label className="flex items-center gap-2 text-xs text-ash">
          <input type="checkbox" checked={isWhisper} onChange={e=>setIsWhisper(e.target.checked)} /> Whisper
        </label>
        <button onClick={send} className="px-4 py-2 bg-wine text-white rounded">Send</button>
      </div>
    </div>
  )
}
