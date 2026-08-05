import {useEffect, useState} from 'react'
import { motion } from 'framer-motion'

export default function StoryCarousel({stories}:{stories:any[]}){
  const [index,setIndex] = useState(0)
  useEffect(()=>{
    if(!stories || stories.length===0) return
    const t = setInterval(()=> setIndex(i=> (i+1) % stories.length), 5000)
    return ()=> clearInterval(t)
  },[stories])

  if(!stories || stories.length===0) return <div className="text-ash">No stories</div>
  return (
    <div className="flex items-center gap-3" role="list" aria-label="Stories">
      {stories.map((s,i)=> (
        <motion.div key={s.id} role="listitem" initial={{ opacity: 0.8 }} animate={{ opacity: i===index ? 1 : 0.7, scale: i===index ? 1.03 : 1 }} transition={{ duration: 0.4 }} className={`w-20 h-32 rounded-md overflow-hidden border ${i===index ? 'ring-2 ring-goldAccent' : 'border-slate-800'}`}>
          <img src={s.media_url} alt={s.caption || 'Story'} className="w-full h-full object-cover"/>
        </motion.div>
      ))}
    </div>
  )
}
