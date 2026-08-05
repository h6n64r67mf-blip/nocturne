import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end()
  const { userId, subscription } = req.body
  if(!userId || !subscription || !subscription.endpoint) return res.status(400).json({ error: 'missing params' })
  try{
    const { endpoint, keys } = subscription
    await supabaseAdmin.from('push_subscriptions').upsert({ user_id: userId, endpoint, p256dh: keys.p256dh, auth: keys.auth })
    return res.status(200).json({ status: 'ok' })
  }catch(e:any){
    console.error('subscribe error', e)
    return res.status(500).json({ error: String(e) })
  }
}
