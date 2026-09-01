"use client"
import { useState } from "react"
import { Play } from "lucide-react"

interface VideoPlayerProps {
  videoId: string;
  thumbnailSrc: string;
  title: string;
}

export function VideoPlayer({ videoId, thumbnailSrc, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!isPlaying) {
    return (
      <div 
        className="relative w-full h-full cursor-pointer group"
        onClick={() => setIsPlaying(true)}
      >
        <img 
          src={thumbnailSrc} 
          alt={`Capa do vídeo: ${title}`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors duration-300">
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-primary/90 transition-all duration-300 shadow-2xl">
            <Play className="text-white fill-white ml-1.5" size={28} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <iframe
      className="w-full h-full"
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  )
}
