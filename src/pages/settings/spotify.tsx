import { useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SpotifySettings(){
  async function connect(){
    const user = await supabase.auth.getUser()
    const userId = user.data?.user?.id
    // redirect to API route with state set to user id
    window.location.href = `/api/spotify/login?state=${encodeURIComponent(userId || '')}`
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-deepPanel rounded-md border border-slate-800">
      <h2 className="text-xl font-serif mb-4">Connect Spotify</h2>
      <p className="text-ash mb-4">Connect your Spotify account to display Now Playing and sync moods.</p>
      <button onClick={connect} className="px-4 py-2 bg-goldAccent rounded text-black">Connect Spotify</button>
    </div>
  )
}
