import { Play, Pause, Clock } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function Timeline({ frame, setFrame, duration, setDuration, isPlaying, setIsPlaying }) {
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setFrame(prev => (prev + 1) % (duration + 1))
      }, 1000/30) // 30 FPS
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, duration, setFrame])

  return (
    <div className="max-w-7xl mx-auto flex items-center gap-4">
      <button
        onClick={() => setIsPlaying(p => !p)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border ${isPlaying ? 'bg-red-600 border-red-500 text-white' : 'bg-emerald-600 border-emerald-500 text-white'}`}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} {isPlaying ? 'Pause' : 'Play'}
      </button>
      <div className="flex items-center gap-2 text-neutral-300">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Frame {frame} / {duration}</span>
      </div>
      <input
        type="range"
        min={0}
        max={duration}
        step={1}
        value={frame}
        onChange={(e) => setFrame(parseInt(e.target.value))}
        className="w-full accent-emerald-500"
      />
      <div className="flex items-center gap-2 text-sm">
        <label className="text-neutral-400">Duration</label>
        <input
          type="number"
          value={duration}
          min={1}
          max={2000}
          onChange={(e) => setDuration(parseInt(e.target.value || '1'))}
          className="w-24 px-2 py-1 rounded-md bg-neutral-800 border border-neutral-700"
        />
      </div>
    </div>
  )
}
