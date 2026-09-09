import { useEffect, useState } from 'react'

const EVENT = 'football-hub-toast'
const DURATION_MS = 3200

const TYPES = {
  success: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40',
  error: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/40',
  neutral: 'bg-slate-500/15 text-slate-200 ring-1 ring-white/20',
}

const ICONS = { success: '✓', error: '⚠', neutral: '⚽' }

/** Global toast viewport — renders toasts dispatched via toast(). */
export default function ToastViewport() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const handler = (event) => {
      const item = event.detail
      setItems((prev) => [...prev, item])
      setTimeout(() => {
        setItems((prev) => prev.filter((candidate) => candidate.id !== item.id))
      }, DURATION_MS)
    }
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          className={`toast-in flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold shadow-lg shadow-slate-950/50 ${TYPES[item.type] ?? TYPES.neutral}`}
        >
          <span aria-hidden="true" className="text-sm">
            {ICONS[item.type] ?? ICONS.neutral}
          </span>
          <span className="min-w-0 flex-1 truncate">{item.message}</span>
        </div>
      ))}
    </div>
  )
}