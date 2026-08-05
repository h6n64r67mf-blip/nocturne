import webpush from 'web-push'
import { supabaseAdmin } from './supabaseAdmin'

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''

if(VAPID_PUBLIC && VAPID_PRIVATE){
  webpush.setVapidDetails('mailto:admin@nocturne.app', VAPID_PUBLIC, VAPID_PRIVATE)
} else {
  console.warn('VAPID keys not set — web push disabled')
}

export async function sendPushToUser(userId:string, payload: any){
  if(!VAPID_PUBLIC || !VAPID_PRIVATE) return
  const { data } = await supabaseAdmin.from('push_subscriptions').select('*').eq('user_id', userId)
  if(!data || data.length===0) return
  for(const s of data){
    try{
      const sub = {
        endpoint: s.endpoint,
        keys: { p256dh: s.p256dh, auth: s.auth }
      }
      await webpush.sendNotification(sub, JSON.stringify(payload))
    }catch(e){
      console.warn('push send failed', e)
      // Clean up subscription if it's no longer valid (410 Gone or 404 Not Found)
      const status = (e as any)?.statusCode || (e as any)?.status
      if(status === 410 || status === 404){
        try{
          await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
        }catch(err){ console.warn('failed to remove stale subscription', err) }
      }
    }
  }
}
