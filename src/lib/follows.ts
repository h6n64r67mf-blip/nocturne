import { supabase } from './supabaseClient'

export async function followUser(followingId:string){
  const user = await supabase.auth.getUser()
  const followerId = user.data?.user?.id
  if(!followerId) throw new Error('not authenticated')
  const { data, error } = await supabase.from('follows').insert([{ follower_id: followerId, following_id: followingId }])
  if(error) throw error
  // create a notification for the followed user via admin API
  try{
    await fetch('/api/notify/follow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ followingId, actorId: followerId }) })
  }catch(e){ console.warn('notify error', e) }
  return data
}

export async function unfollowUser(followingId:string){
  const user = await supabase.auth.getUser()
  const followerId = user.data?.user?.id
  if(!followerId) throw new Error('not authenticated')
  const { error } = await supabase.from('follows').delete().match({ follower_id: followerId, following_id: followingId })
  if(error) throw error
  return true
}

export async function getFollowingIds(userId?:string){
  const uid = userId || (await supabase.auth.getUser()).data?.user?.id
  if(!uid) return []
  const { data } = await supabase.from('follows').select('following_id').eq('follower_id', uid)
  return (data || []).map((r:any)=>r.following_id)
}
