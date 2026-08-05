import {useEffect, useRef, useState} from 'react'

export default function DarkRealCapture({onCapture}:{onCapture:(frontBlob:Blob,backBlob:Blob)=>void}){
  const frontRef = useRef<HTMLVideoElement|null>(null)
  const backRef = useRef<HTMLVideoElement|null>(null)
  const [frontStream,setFrontStream] = useState<MediaStream|null>(null)
  const [backStream,setBackStream] = useState<MediaStream|null>(null)
  const [devices,setDevices] = useState<MediaDeviceInfo[]>([])

  useEffect(()=>{
    (async ()=>{
      const list = await navigator.mediaDevices.enumerateDevices()
      setDevices(list.filter(d=>d.kind==='videoinput'))
    })()
    return ()=>{
      frontStream?.getTracks().forEach(t=>t.stop())
      backStream?.getTracks().forEach(t=>t.stop())
    }
  },[])

  async function startStreams(){
    const cams = devices
    const frontCam = cams.find(d=>/front|user/i.test(d.label)) || cams[0]
    const backCam = cams.find(d=>/back|rear|environment/i.test(d.label)) || cams[cams.length-1]
    try{
      const f = await navigator.mediaDevices.getUserMedia({video:{deviceId: frontCam.deviceId}} as any)
      const b = await navigator.mediaDevices.getUserMedia({video:{deviceId: backCam.deviceId}} as any)
      setFrontStream(f); setBackStream(b)
      if(frontRef.current) frontRef.current.srcObject = f
      if(backRef.current) backRef.current.srcObject = b
    }catch(e){
      console.warn('Dual stream failed, will use sequential fallback', e)
    }
  }

  async function capture(){
    if(frontRef.current && backRef.current){
      const fCanvas = document.createElement('canvas')
      fCanvas.width = frontRef.current.videoWidth
      fCanvas.height = frontRef.current.videoHeight
      fCanvas.getContext('2d')!.drawImage(frontRef.current,0,0)
      const frontBlob = await new Promise<Blob|null>(resolve=>fCanvas.toBlob(b=>resolve(b)))

      const bCanvas = document.createElement('canvas')
      bCanvas.width = backRef.current.videoWidth
      bCanvas.height = backRef.current.videoHeight
      bCanvas.getContext('2d')!.drawImage(backRef.current,0,0)
      const backBlob = await new Promise<Blob|null>(resolve=>bCanvas.toBlob(b=>resolve(b)))

      if(frontBlob && backBlob) onCapture(frontBlob, backBlob)
    } else {
      // sequential fallback could be implemented here
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="relative">
        <video aria-label="Front camera preview" ref={frontRef} autoPlay muted playsInline className="w-full rounded-md bg-black" />
        <div className="absolute left-2 top-2 text-xs text-ash bg-black/40 px-2 py-1 rounded">Front</div>
      </div>
      <div className="relative">
        <video aria-label="Back camera preview" ref={backRef} autoPlay muted playsInline className="w-full rounded-md bg-black" />
        <div className="absolute left-2 top-2 text-xs text-ash bg-black/40 px-2 py-1 rounded">Back</div>
      </div>
      <div className="col-span-2 flex gap-2 mt-2 items-center">
        <button onClick={startStreams} className="px-4 py-2 bg-wine rounded text-white" aria-label="Start dual capture">Start Dual Capture</button>
        <button onClick={async ()=>{ document.body.classList.add('shutter'); setTimeout(()=>document.body.classList.remove('shutter'),220); await capture() }} className="px-4 py-2 bg-goldAccent rounded text-black" aria-label="Capture Dark Real">Capture Dark Real</button>
        <div aria-live="polite" className="text-xs text-ash">Tip: mobile devices may require permissions for each camera.</div>
      </div>
    </div>
  )
}
