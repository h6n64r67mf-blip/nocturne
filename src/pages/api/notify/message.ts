import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end()
  const { receiverId, actorId, text } = req.body
  if(!receiverId || !actorId) return res.status(400).json({ error: 'missing params' })
  try{
    const insertRes = await supabaseAdmin.from('notifications').insert([{ user_id: receiverId, actor_id: actorId, type: 'message', data: { message: text ? text.slice(0,140) : 'sent you a message' } }])
    try{ const { sendPushToUser } = await import('../../lib/push'); await sendPushToUser(receiverId, { title: 'New message', body: text?.slice(0,140) || 'sent you a message' }) }catch(e){ console.warn('push send failed', e) }
    return res.status(200).json({ status: 'ok' })
  }catch(e:any){
    console.error('notify message error', e)
    return res.status(500).json({ error: String(e) })
  }
}
