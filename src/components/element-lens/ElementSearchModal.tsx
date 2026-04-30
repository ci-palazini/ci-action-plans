import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { PILLARS, PILLAR_ELEMENTS, PILLAR_COLORS } from '../../lib/constants'

type FlatItem = {
  pillar: string
  element: string
  pillarIndex: number
}

export function ElementSearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const allItems: FlatItem[] = useMemo(
    () =>
      PILLARS.flatMap((pillar, pi) =>
        PILLAR_ELEMENTS[pillar].map((element) => ({ pillar, element, pillarIndex: pi })),
      ),
    [],
  )

  const filtered: FlatItem[] = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return allItems
    return allItems.filter(
      (i) => i.element.toLowerCase().includes(q) || i.pillar.toLowerCase().includes(q),
    )
  }, [query, allItems])

  const grouped: [string, FlatItem[]][] = useMemo(() => {
    const map = new Map<string, FlatItem[]>()
    for (const item of filtered) {
      if (!map.has(item.pillar)) map.set(item.pillar, [])
      map.get(item.pillar)!.push(item)
    }
    return [...map.entries()]
  }, [filtered])

  useEffect(() => { setCursor(0) }, [query])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40)
    else setQuery('')
  }, [open])

  function goTo(item: FlatItem) {
    navigate(`/elements/${encodeURIComponent(item.pillar)}/${encodeURIComponent(item.element)}`)
    onClose()
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
      if (e.key === 'Enter' && filtered[cursor]) goTo(filtered[cursor])
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, filtered, cursor])

  if (!open) return null

  let itemIndex = 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search elements or pillars…"
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
          />
          <button onClick={onClose} className="rounded p-0.5 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[56vh] overflow-y-auto py-2">
          {grouped.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-400">No elements found</p>
          ) : (
            grouped.map(([pillar, items]) => {
              const color = PILLAR_COLORS[items[0].pillarIndex % PILLAR_COLORS.length]
              return (
                <div key={pillar}>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {pillar}
                  </p>
                  {items.map((item) => {
                    const idx = itemIndex++
                    const active = idx === cursor
                    return (
                      <button
                        key={item.element}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${active ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                        onClick={() => goTo(item)}
                        onMouseEnter={() => setCursor(idx)}
                      >
                        <span className="h-1.5 w-1.5 rounded-full shrink-0 mt-px" style={{ backgroundColor: color }} />
                        <span className="text-sm text-slate-700">{item.element}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex gap-4 text-[10px] text-slate-400">
          <span><kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500">↑ ↓</kbd> navigate</span>
          <span><kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500">↵</kbd> open</span>
          <span><kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500">esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
