import Head from 'next/head'
import PostCard from '../components/ui/PostCard'
import { useEffect, useState } from 'react'
import { getFollowingIds } from '../lib/follows'
import { supabase } from '../lib/supabaseClient'

export default function Home(){
  const [posts,setPosts] = useState<any[]>([])
  useEffect(()=>{ (async ()=>{
    // fetch following ids and include own posts
    const followIds = await getFollowingIds()
    const user = await supabase.auth.getUser()
    const ids = [...followIds, user.data?.user?.id].filter(Boolean)
    if(ids.length===0) return
    const { data } = await supabase.from('posts').select('*').in('author_id', ids).order('created_at',{ascending:false}).limit(50)
    setPosts(data || [])
  })() },[])

  return (
    <>
      <Head><title>Nocturne — Feed</title></Head>
      <section className="space-y-4">
        {posts.map(p=> <PostCard key={p.id} post={p} />)}
      </section>
    </>
  )
}
