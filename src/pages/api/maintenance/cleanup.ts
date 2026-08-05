import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  const token = req.headers['x-admin-token'] as string | undefined
  if(!process.env.MAINTENANCE_TOKEN) return res.status(500).json({ error: 'server not configured' })
  if(!token || token !== process.env.MAINTENANCE_TOKEN) return res.status(401).json({ error: 'unauthorized' })
  try{
    await supabaseAdmin.rpc('cleanup_old_notifications')
    return res.status(200).json({ status: 'ok' })
  }catch(e:any){
    console.error('cleanup error', e)
    return res.status(500).json({ error: String(e) })
  }
}
