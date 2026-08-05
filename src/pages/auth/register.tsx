import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function Register(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [displayName,setDisplayName] = useState('')
  const [loading,setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e:any){
    e.preventDefault(); setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if(error){ setLoading(false); return alert(error.message) }
    // create profile row
    if(data.user){
      await supabase.from('profiles').insert([{ id: data.user.id, display_name: displayName }])
    }
    setLoading(false)
    router.push('/')
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-deepPanel rounded-md border border-slate-800">
      <h2 className="text-2xl font-serif mb-4">Create an account</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full p-3 rounded bg-transparent border border-slate-700" placeholder="Display name" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
        <input className="w-full p-3 rounded bg-transparent border border-slate-700" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-3 rounded bg-transparent border border-slate-700" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-goldAccent text-black rounded" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        </div>
      </form>
    </div>
  )
}
