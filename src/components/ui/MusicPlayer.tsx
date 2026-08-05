import {useEffect, useRef, useState} from 'react'

export default function MusicPlayer({track}:{track?:any}){
  const audioRef = useRef<HTMLAudioElement|null>(null)
  const [playing,setPlaying] = useState(false)
  useEffect(()=>{
    if(track && audioRef.current){
      audioRef.current.src = track.url
      audioRef.current.load()
    }
  },[track])
  return (
    <div className="flex items-center gap-3 p-3 rounded-md bg-[linear-gradient(90deg,#070707,#0a0607)] border border-slate-800">
      <img src={track?.artwork} className="w-12 h-12 rounded" />
      <div className="flex-1">
        <div className="text-sm font-medium">{track?.title}</div>
        <div className="text-xs text-ash">{track?.artist}</div>
      </div>
      <div className="flex gap-2">
        <button onClick={()=>{ if(audioRef.current){ if(playing){audioRef.current.pause(); setPlaying(false)} else {audioRef.current.play(); setPlaying(true)} }}} className="px-3 py-1 bg-burgundy text-white rounded">
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
      <audio ref={audioRef} />
    </div>
  )
}
