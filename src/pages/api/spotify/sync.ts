import type { NextApiRequest, NextApiResponse } from 'next'
import { syncUserNowPlaying } from '../../lib/spotify'

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  const userId = String(req.query.user_id || '')
  if(!userId) return res.status(400).json({ error: 'missing user_id' })
  try{
    const nowPlaying = await syncUserNowPlaying(userId)
    if(!nowPlaying) return res.status(200).json({ status: 'no_content' })
    return res.status(200).json({ now_playing: nowPlaying })
  }catch(e:any){
    console.error('spotify sync error', e)
    return res.status(500).json({ error: String(e) })
  }
}
