import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { syncUserNowPlaying } from '../../lib/spotify'

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  const token = req.headers['x-sync-token'] as string | undefined
  if(!process.env.SYNC_TRIGGER_TOKEN) return res.status(500).json({ error: 'server not configured' })
  if(!token || token !== process.env.SYNC_TRIGGER_TOKEN) return res.status(401).json({ error: 'unauthorized' })

  try{
    const { data } = await supabaseAdmin.from('spotify_tokens').select('user_id')
    const users = data?.map((r:any)=>r.user_id) || []
    const results: any[] = []
    for(const u of users){
      try{
        const now = await syncUserNowPlaying(u)
        results.push({ user: u, status: 'ok', now })
      }catch(e:any){
        results.push({ user: u, status: 'error', error: String(e) })
      }
    }
    return res.status(200).json({ results })
  }catch(e:any){
    return res.status(500).json({ error: String(e) })
  }
}
