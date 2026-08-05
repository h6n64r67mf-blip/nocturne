import { useState } from 'react'
import { uploadFile } from './lib/storage'
import { supabase } from './lib/supabaseClient'

export default function Create(){
  const [content,setContent] = useState('')
  const [file,setFile] = useState<File | null>(null)
  const [loading,setLoading] = useState(false)

  async function submit(e:any){
    e.preventDefault()
    setLoading(true)
    let imageUrl = null
    if(file){
      const path = `posts/${Date.now()}_${file.name}`
      imageUrl = await uploadFile(path, file)
    }
    const user = await supabase.auth.getUser()
    await supabase.from('posts').insert([{ author_id: user.data?.user?.id, content, image_url: imageUrl }])
    setLoading(false)
    setContent('')
    setFile(null)
    alert('Posted')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-deepPanel rounded-md border border-slate-800">
      <h2 className="text-xl font-serif mb-4">Create a Post</h2>
      <form onSubmit={submit} className="space-y-3">
        <textarea value={content} onChange={e=>setContent(e.target.value)} className="w-full p-3 rounded bg-transparent border border-slate-700" rows={4} />
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-goldAccent text-black rounded" disabled={loading}>{loading? 'Posting...' : 'Post'}</button>
        </div>
      </form>
    </div>
  )
}
