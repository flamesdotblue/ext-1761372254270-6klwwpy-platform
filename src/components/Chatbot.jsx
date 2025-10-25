import { useState } from 'react'
import { Bot, Send, MessageSquare, Settings, Wand2 } from 'lucide-react'

const starterSuggestions = [
  'add a cube',
  'reset scene',
  'generate city blocks',
  'set duration to 480',
  'animate a spin',
]

export default function Chatbot({ controls, duration, setDuration, setFrame, setIsPlaying }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I’m your animation guide. Ask me to add objects, create a simple city, set duration, or animate spins. I cannot replicate Blender or exact cities, but I can help you learn the basics interactively.' }
  ])
  const [input, setInput] = useState('')

  function reply(text) {
    setMessages(m => [...m, { role: 'assistant', content: text }])
  }

  function onSuggest(s) {
    setInput(s)
  }

  function parseCommand(text) {
    const t = text.trim().toLowerCase()

    if (/^add(\s+)?cube/.test(t)) {
      const id = controls.addCube()
      reply(`Added a cube (id ${id.slice(0,6)}). You can animate it by saying "animate a spin".`)
      return
    }

    if (t.includes('reset scene') || t === 'clear' || t === 'reset') {
      controls.clearScene()
      setFrame(0)
      setIsPlaying(false)
      reply('Scene reset. Timeline back to frame 0.')
      return
    }

    if (t.includes('generate city') || t.includes('make london') || t.includes('build city')) {
      controls.generateCityBlocks(8)
      reply('Generated a simple grid of varied-height blocks to evoke a city feel. Note: this is not an exact copy of any real city.')
      return
    }

    const durMatch = t.match(/(set|change).*duration.*?(\d{1,4})/)
    if (durMatch) {
      const d = Math.max(1, Math.min(2000, parseInt(durMatch[2], 10)))
      setDuration(d)
      reply(`Duration set to ${d} frames.`)
      return
    }

    if (t.includes('animate a spin') || t.includes('spin animation') || t.includes('spin the cube')) {
      reply('Animating spin: newly added cubes will rotate one full turn over the timeline. Press Play to preview!')
      return
    }

    if (t.includes('play')) {
      setIsPlaying(true)
      reply('Playing timeline at 30 FPS. Use Pause to stop.')
      return
    }

    if (t.includes('pause') || t.includes('stop')) {
      setIsPlaying(false)
      reply('Paused.')
      return
    }

    reply("I didn't understand that. Try: 'add a cube', 'generate city blocks', or 'set duration to 480'.")
  }

  function onSubmit(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setMessages(m => [...m, { role: 'user', content: trimmed }])
    setInput('')
    setTimeout(() => parseCommand(trimmed), 100)
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
        <Bot className="w-5 h-5 text-emerald-400" />
        <div className="text-sm font-medium">Assistant</div>
        <div className="ml-auto flex items-center gap-2 text-xs text-neutral-400">
          <Settings className="w-4 h-4" />
          <span>Duration: {duration}f</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto space-y-3 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] px-3 py-2 rounded-lg ${m.role === 'assistant' ? 'bg-neutral-800/70 text-neutral-100' : 'bg-emerald-600 text-white ml-auto'}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-2 pb-2">
          {starterSuggestions.map((s, i) => (
            <button key={i} onClick={() => onSuggest(s)} className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs border border-neutral-700">
              <MessageSquare className="w-3 h-3" />{s}
            </button>
          ))}
          <span className="inline-flex items-center gap-1 text-xs text-neutral-500"><Wand2 className="w-3 h-3" /> Pro tip: try "make london" to generate city-like blocks (not an exact copy).</span>
        </div>
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to add objects, set duration, or play..."
            className="flex-1 px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-sm"
          />
          <button type="submit" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm">
            <Send className="w-4 h-4" /> Send
          </button>
        </form>
      </div>
    </div>
  )
}
