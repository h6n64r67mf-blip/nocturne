import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }:{children:any}){
  const [user, setUser] = useState<any>(null)
  useEffect(()=>{
    let mounted = true
    ;(async ()=>{
      const { data } = await supabase.auth.getUser()
      if(mounted) setUser(data?.user || null)
    })()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session)=>{
      setUser(session?.user || null)
    })
    return ()=>{ mounted = false; listener.subscription.unsubscribe() }
  },[])
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
}

export function useAuth(){ return useContext(AuthContext) }
