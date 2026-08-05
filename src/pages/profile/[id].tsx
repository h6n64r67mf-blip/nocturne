import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import PostCard from '../../components/ui/PostCard'
import StoryCarousel from '../../components/ui/StoryCarousel'
import NowPlaying from '../../components/ui/NowPlaying'
import { useAuth } from '../../lib/auth'
import { followUser, unfollowUser, getFollowingIds } from '../../lib/follows'

export default function Profile(){
  const router = useRouter()
  const { id } = router.query
  const [profile,setProfile] = useState<any>(null)
  const [posts,setPosts] = useState<any[]>([])
  const [stories,setStories] = useState<any[]>([])
  const [nowPlaying,setNowPlaying] = useState<any>(null)
  const { user } = useAuth()
  const [isFollowing,setIsFollowing] = useState(false)
  const [followerCount,setFollowerCount] = useState(0)
  const [followingCount,setFollowingCount] = useState(0)

  useEffect(()=>{ if(!id) return; (async ()=>{
    const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single()
    setProfile(p)
    const { data: ps } = await supabase.from('posts').select('*').eq('author_id', id).order('created_at', {ascending:false}).limit(20)
    setPosts(ps || [])
    const { data: sts } = await supabase.from('stories').select('*').eq('author_id', id).order('created_at', {ascending:false}).limit(10)
    setStories(sts || [])
    const { data: np } = await supabase.from('now_playing').select('*').eq('user_id', id).single()
    setNowPlaying(np)
    const { count: fcount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id)
    const { count: followingc } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id)
    setFollowerCount(Number(fcount || 0))
    setFollowingCount(Number(followingc || 0))
    if(user){
      const following = await getFollowingIds(user.id)
      setIsFollowing(following.includes(String(id)))
    }
  })() },[id])

  if(!profile) return <div className="text-ash">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-deepPanel p-4 rounded-md border border-slate-800">
        <img src={profile.avatar_url || '/avatar-placeholder.png'} className="w-24 h-24 rounded-full object-cover ring-2 ring-slate-700" />
        <div>
          <h1 className="text-2xl font-serif">{profile.display_name}</h1>
          <p className="text-ash mt-1">{profile.bio}</p>
          <p className="text-ash mt-1">Relationship: <span className="text-goldAccent">{profile.relationship_status || 'Prefer Not to Say'}</span></p>
          <div className="mt-3">
            <h3 className="text-sm font-medium">Now Playing</h3>
            <NowPlaying now={nowPlaying} />
          </div>
          <div className="mt-2 text-sm text-ash">{followerCount} Followers • {followingCount} Following</div>
          {user && user.id !== id && (
            <div className="mt-3">
              <button onClick={async ()=>{ if(isFollowing){ await unfollowUser(String(id)); setIsFollowing(false) } else { await followUser(String(id)); setIsFollowing(true) } }} className={`px-3 py-1 rounded ${isFollowing ? 'bg-slate-700 text-ash' : 'bg-goldAccent text-black'}`}>
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium">Stories</h2>
        <StoryCarousel stories={stories} />
      </div>

      <div className="space-y-4">
        {posts.map(p=> <PostCard key={p.id} post={{...p, author:{ name: profile.display_name, avatar: profile.avatar_url}}} />)}
      </div>
    </div>
  )
}
