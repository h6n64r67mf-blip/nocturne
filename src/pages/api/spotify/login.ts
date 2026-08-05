import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req:NextApiRequest, res:NextApiResponse){
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
  const redirect = process.env.NEXT_PUBLIC_SITE_URL + '/api/spotify/callback'
  const scope = 'user-read-playback-state user-read-currently-playing'
  const state = req.query.state ? `&state=${encodeURIComponent(String(req.query.state))}` : ''
  const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&scope=${encodeURIComponent(scope)}${state}`
  res.redirect(url)
}
