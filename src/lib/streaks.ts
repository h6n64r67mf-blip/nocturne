import { supabase } from './supabaseClient'

export async function incrementStreak(userA:string, userB:string){
  // normalize ordering to avoid duplicate pairs
  const [a,b] = userA < userB ? [userA, userB] : [userB, userA]
  const now = new Date().toISOString()
  const { data, error } = await supabase.from('streaks').upsert({ user_a: a, user_b: b, last_message_at: now }, { onConflict: ['user_a','user_b'] })
  if(error) console.warn('streak upsert error', error)
  // For simple increment logic, fetch current count and increment if last_message_at is yesterday or increment otherwise
  // This is a placeholder — consider implementing via RPC on the DB for atomicity
  return data
}
