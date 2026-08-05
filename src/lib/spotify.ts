import fetch from 'node-fetch'
import { supabaseAdmin } from './supabaseAdmin'

async function refreshAccessToken(refreshToken:string){
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken, client_id: clientId || '', client_secret: clientSecret || '' })
  const r = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', body })
  return r.json()
}

export async function syncUserNowPlaying(userId: string){
  const { data } = await supabaseAdmin.from('spotify_tokens').select('*').eq('user_id', userId).single()
  if(!data) throw new Error('no tokens')
  let accessToken = data.access_token
  const expiresAt = data.expires_at ? new Date(data.expires_at) : null
  if(!accessToken || (expiresAt && expiresAt.getTime() < Date.now())){
    const refreshed = await refreshAccessToken(data.refresh_token)
    if(refreshed.access_token){
      accessToken = refreshed.access_token
      const expiresIso = new Date(Date.now() + (refreshed.expires_in||0)*1000).toISOString()
      await supabaseAdmin.from('spotify_tokens').update({ access_token: refreshed.access_token, expires_at: expiresIso }).eq('user_id', userId)
    } else {
      throw new Error('failed refresh')
    }
  }
  const r = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers: { Authorization: `Bearer ${accessToken}` } })
  if(r.status === 204) return null
  if(!r.ok) {
    const body = await r.text()
    throw new Error(body)
  }
  const payload = await r.json()
  const track = payload.item
  const nowPlaying = {
    user_id: userId,
    track_title: track.name,
    track_artist: track.artists?.map((a:any)=>a.name).join(', '),
    artwork_url: track.album?.images?.[0]?.url || null,
    genre: null,
    started_at: new Date().toISOString()
  }
  await supabaseAdmin.from('now_playing').upsert(nowPlaying, { onConflict: ['user_id'] })
  return nowPlaying
}
