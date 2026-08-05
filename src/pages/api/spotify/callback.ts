import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req:NextApiRequest, res:NextApiResponse){
  const code = req.query.code as string
  const state = req.query.state as string | undefined
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const redirect = process.env.NEXT_PUBLIC_SITE_URL + '/api/spotify/callback'

  if(!code) return res.status(400).send('Missing code')

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirect,
    client_id: clientId || '',
    client_secret: clientSecret || ''
  })

  const r = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', body })
  const data = await r.json()

  if(data.access_token && state){
    try{
      // state is expected to be the user_id from Supabase auth
      await supabaseAdmin.from('spotify_tokens').upsert({ user_id: state, access_token: data.access_token, refresh_token: data.refresh_token, scope: data.scope, expires_at: new Date(Date.now() + (data.expires_in||0)*1000).toISOString() }, { onConflict: ['user_id'] })
    }catch(e){
      console.error('Failed to store spotify tokens', e)
    }
  }

  res.redirect('/')
}
