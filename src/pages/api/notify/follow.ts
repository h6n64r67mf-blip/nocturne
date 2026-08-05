import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end()
  const { followingId, actorId } = req.body
  if(!followingId || !actorId) return res.status(400).json({ error: 'missing params' })
  try{
    const insertRes = await supabaseAdmin.from('notifications').insert([{ user_id: followingId, actor_id: actorId, type: 'follow', data: { message: 'started following you' } }])
    // send push if subscription exists
    try{ const { sendPushToUser } = await import('../../lib/push'); await sendPushToUser(followingId, { title: 'New follower', body: `${insertRes.data?.[0]?.actor_id} started following you` }) }catch(e){ console.warn('push send failed', e) }
    return res.status(200).json({ status: 'ok' })
  }catch(e:any){
    console.error('notify follow error', e)
    return res.status(500).json({ error: String(e) })
  }
}
