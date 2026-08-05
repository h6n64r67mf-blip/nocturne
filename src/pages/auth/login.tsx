import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function Login(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e:any){
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if(error) return alert(error.message)
    router.push('/')
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-deepPanel rounded-md border border-slate-800">
      <h2 className="text-2xl font-serif mb-4">Welcome back</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full p-3 rounded bg-transparent border border-slate-700" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-3 rounded bg-transparent border border-slate-700" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="flex justify-between items-center">
          <button className="px-4 py-2 bg-wine text-white rounded" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          <a className="text-sm text-ash" href="/auth/register">Create account</a>
        </div>
      </form>
    </div>
  )
}
