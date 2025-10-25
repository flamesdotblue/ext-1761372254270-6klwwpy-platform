import { useState, useMemo, useCallback } from 'react'
import Header from './components/Header'
import Viewport3D from './components/Viewport3D'
import Timeline from './components/Timeline'
import Chatbot from './components/Chatbot'

export default function App() {
  const [objects, setObjects] = useState([])
  const [frame, setFrame] = useState(0) // 0..240 by default
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(240)

  const addCube = useCallback((opts = {}) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const position = opts.position || [Math.random() * 4 - 2, 0.5, Math.random() * 4 - 2]
    const color = opts.color || `hsl(${Math.floor(Math.random()*360)} 70% 55%)`
    setObjects(prev => ([...prev, { id, type: 'cube', position, rotation: [0, 0, 0], scale: [1,1,1], color, keyframes: { rotationY: [{ f: 0, v: 0 }, { f: duration, v: Math.PI * 2 }] } }]))
    return id
  }, [duration])

  const clearScene = useCallback(() => setObjects([]), [])

  const generateCityBlocks = useCallback((size = 6) => {
    // Create a simple grid of varied-height blocks to evoke a city feel (not an exact copy of any real city)
    const blocks = []
    const spacing = 2
    const start = -Math.floor(size/2) * spacing
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const height = 0.5 + Math.random() * 3
        blocks.push({
          id: `b_${x}_${z}_${Math.random().toString(36).slice(2,5)}`,
          type: 'cube',
          position: [start + x * spacing, height/2, start + z * spacing],
          rotation: [0,0,0],
          scale: [1, height, 1],
          color: `hsl(${(x*30+z*20)%360} 30% ${40 + Math.random()*20}%)`,
          keyframes: { rotationY: [] }
        })
      }
    }
    setObjects(blocks)
  }, [])

  const updateObject = useCallback((id, patch) => {
    setObjects(prev => prev.map(o => (o.id === id ? { ...o, ...patch } : o)))
  }, [])

  const controls = useMemo(() => ({ addCube, clearScene, generateCityBlocks, updateObject }), [addCube, clearScene, generateCityBlocks, updateObject])

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Header onAddCube={() => addCube()} onClear={clearScene} onCity={generateCityBlocks} />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        <div className="col-span-1 lg:col-span-3 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/40 backdrop-blur">
          <Viewport3D objects={objects} frame={frame} duration={duration} isPlaying={isPlaying} />
        </div>
        <div className="col-span-1">
          <Chatbot controls={controls} duration={duration} setDuration={setDuration} setFrame={setFrame} setIsPlaying={setIsPlaying} />
        </div>
      </div>
      <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
        <Timeline frame={frame} setFrame={setFrame} duration={duration} setDuration={setDuration} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
      </div>
    </div>
  )
}
