import { useState } from 'react'
import { motion } from 'framer-motion'

export default function PostCard({post}:{post:any}){
  const [liked,setLiked] = useState(post.liked)
  return (
    <motion.article whileHover={{ scale: 1.01 }} className="bg-[linear-gradient(180deg,#070707,rgba(10,10,10,0.6))] rounded-md p-4 shadow-md border border-slate-800">
      <header className="flex items-center gap-3">
        <img src={post.author.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"/>
        <div>
          <div className="text-sm font-medium">{post.author.name}</div>
          <div className="text-xs text-ash">{post.createdAt}</div>
        </div>
      </header>
      <div className="mt-3 text-sm text-gray-200">{post.content}</div>
      {post.image && <img src={post.image} className="mt-3 w-full rounded-md object-cover" />}
      <footer className="mt-4 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={()=>setLiked(!liked)} className="flex items-center gap-2 text-sm">
          <motion.span animate={{ scale: liked ? 1.15 : 1 }} transition={{ type: 'spring', stiffness: 400 }} className={`${liked ? 'text-wine' : 'text-ash'}`}>♥</motion.span>
          <span className="text-ash">{post.likes}</span>
        </motion.button>
        <button className="text-ash">💬 {post.comments}</button>
        <button className="text-ash">↻ Repost</button>
      </footer>
    </motion.article>
  )
}
