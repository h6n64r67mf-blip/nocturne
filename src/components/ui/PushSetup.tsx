import { useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function PushSetup({ vapidPublicKey }:{vapidPublicKey:string}){
  useEffect(()=>{
    if(!('serviceWorker' in navigator) || !('PushManager' in window)) return
    let registration: ServiceWorkerRegistration | null = null
    ;(async ()=>{
      try{
        registration = await navigator.serviceWorker.register('/sw.js')
        const sub = await registration.pushManager.getSubscription()
        if(!sub){
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
          const newSub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: convertedVapidKey })
          // send subscription to server
          const userRes = await supabase.auth.getUser()
          const userId = userRes.data?.user?.id
          if(userId){
            await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, subscription: newSub }) })
          }
        }
      }catch(e){ console.warn('push setup failed', e) }
    })()
  },[vapidPublicKey])

  function urlBase64ToUint8Array(base64String:string){
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for(let i=0;i<rawData.length;++i) outputArray[i] = rawData.charCodeAt(i)
    return outputArray
  }

  return null
}
