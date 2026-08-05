import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { uploadFile } from '../../lib/storage'

export default function EditProfile(){
  const [profile,setProfile] = useState<any>(null)
  const [displayName,setDisplayName] = useState('')
  const [bio,setBio] = useState('')
  const [relationship,setRelationship] = useState('')
  const [avatar,setAvatar] = useState<File | null>(null)
  useEffect(()=>{ (async ()=>{
    const user = await supabase.auth.getUser()
    const { data } = await supabase.from('profiles').select('*').eq('id', user.data?.user?.id).single()
    setProfile(data)
    setDisplayName(data?.display_name || '')
    setBio(data?.bio || '')
    setRelationship(data?.relationship_status || 'Prefer Not to Say')
  })() },[])

  async function save(e:any){
    e.preventDefault()
    let avatarUrl = profile?.avatar_url
    if(avatar){
      const path = `avatars/${Date.now()}_${avatar.name}`
      avatarUrl = await uploadFile(path, avatar)
    }
    const user = await supabase.auth.getUser()
    await supabase.from('profiles').upsert({ id: user.data?.user?.id, display_name: displayName, bio, avatar_url: avatarUrl, relationship_status: relationship })
    alert('Saved')
  }

  if(!profile) return <div className="text-ash">Loading...</div>
  return (
    <div className="max-w-md mx-auto p-6 bg-deepPanel rounded-md border border-slate-800">
      <h2 className="text-xl font-serif mb-4">Edit Profile</h2>
      <form onSubmit={save} className="space-y-3">
        <input className="w-full p-3 rounded bg-transparent border border-slate-700" placeholder="Display name" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
        <textarea className="w-full p-3 rounded bg-transparent border border-slate-700" placeholder="Bio" value={bio} onChange={e=>setBio(e.target.value)} />
        <label className="block text-sm text-ash">Relationship status</label>
        <select value={relationship} onChange={e=>setRelationship(e.target.value)} className="w-full p-2 rounded bg-transparent border border-slate-700">
          <option>Prefer Not to Say</option>
          <option>Single</option>
          <option>In a Relationship</option>
          <option>It's Complicated</option>
          <option>Married</option>
          <option>Open Relationship</option>
        </select>
        <input type="file" accept="image/*" onChange={e=>setAvatar(e.target.files?.[0]||null)} />
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-goldAccent text-black rounded">Save</button>
        </div>
      </form>
    </div>
  )
}
