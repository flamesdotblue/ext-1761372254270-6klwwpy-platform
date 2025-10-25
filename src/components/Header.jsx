import { Rocket, Plus, Trash2, Building2 } from 'lucide-react'

export default function Header({ onAddCube, onClear, onCity }) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-900/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-6 h-6 text-emerald-400" />
          <span className="font-semibold tracking-tight">Luma3D Studio</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button onClick={onAddCube} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm">
            <Plus className="w-4 h-4" /> Add Cube
          </button>
          <button onClick={() => onCity(8)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-sm">
            <Building2 className="w-4 h-4" /> Generate City Blocks
          </button>
          <button onClick={onClear} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm border border-neutral-700">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>
    </header>
  )
}
