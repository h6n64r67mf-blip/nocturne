export default function NowPlaying({now}:{now:any}){
  if(!now) return <div className="text-ash">Not playing</div>
  return (
    <div className="flex items-center gap-3 p-3 bg-black/40 rounded-md border border-slate-800">
      {now.artwork_url && <img src={now.artwork_url} alt="Artwork" className="w-14 h-14 rounded" />}
      <div>
        <div className="text-sm font-medium">{now.track_title}</div>
        <div className="text-xs text-ash">{now.track_artist}</div>
      </div>
    </div>
  )
}
