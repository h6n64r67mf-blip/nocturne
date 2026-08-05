import Link from 'next/link'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabaseClient'
import Notifications from './Notifications'
import { useState } from 'react'

export default function Header(){
  const { user } = useAuth()
  async function signOut(){
    await supabase.auth.signOut()
  }
  return (
    <header className="w-full border-b border-slate-800 bg-gradient-to-b from-transparent to-black/30">
      <div className="max-w-5xl mx-auto flex items-center justify-between py-4 px-4">
        <Link href="/" className="text-lg font-serif tracking-wider text-goldAccent">Nocturne</Link>
        <nav className="flex items-center gap-4">
          <Link href="/explore" className="text-sm text-ash hover:text-goldAccent">Explore</Link>
          <Link href="/messages" className="text-sm text-ash hover:text-goldAccent">Messages</Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href={`/profile/${user.id}`} className="text-sm text-ash hover:text-goldAccent">{user.user_metadata?.full_name || user.email}</Link>
              <div className="relative">
                <button onClick={()=>setShowNotifications(s=>!s)} className="text-ash">🔔</button>
                {showNotifications && <div className="absolute right-0 mt-2 w-80 p-3 bg-deepPanel rounded border border-slate-800"><Notifications /></div>}
              </div>
              <button onClick={signOut} className="text-sm text-ash">Sign out</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-ash hover:text-goldAccent">Sign in</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
