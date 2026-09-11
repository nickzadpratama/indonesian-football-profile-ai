import { useEffect, useState } from 'react'
import FormField from './FormField.jsx'
import { toast } from '../toast.js'

/**
 * Modal dialog to update one team's value fields. The team entry is
 * populated into the form; onSave receives cleaned { name, code, founded,
 * city, stadium, capacity }. Closes via backdrop click or Escape.
 */
export default function EditTeamModal({ team, onSave, onClose }) {
  const info = team.team ?? {}
  const venue = team.venue ?? {}

  const [name, setName] = useState(info.name ?? '')
  const [code, setCode] = useState(info.code ?? '')
  const [founded, setFounded] = useState(info.founded ? String(info.founded) : '')
  const [city, setCity] = useState(venue.city ?? '')
  const [stadium, setStadium] = useState(venue.name ?? '')
  const [capacity, setCapacity] = useState(venue.capacity ? String(venue.capacity) : '')
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (event) => {
    event.preventDefault()
    const cleanedName = name.trim()
    if (cleanedName.length < 2) {
      const message = 'Team name must be at least 2 characters.'
      setError(message)
      toast(message, 'error')
      return
    }
    const foundedNum = founded.trim() === '' ? null : Number(founded)
    if (foundedNum !== null && (Number.isNaN(foundedNum) || foundedNum < 1800 || foundedNum > 2100)) {
      const message = 'Founded year looks invalid (1800–2100).'
      setError(message)
      toast(message, 'error')
      return
    }
    const capacityNum = capacity.trim() === '' ? null : Number(capacity)
    if (capacityNum !== null && (Number.isNaN(capacityNum) || capacityNum < 0)) {
      const message = 'Capacity must be a positive number.'
      setError(message)
      toast(message, 'error')
      return
    }
    onSave({
      name: cleanedName,
      code: code.trim().toUpperCase(),
      founded: foundedNum,
      city: city.trim(),
      stadium: stadium.trim(),
      capacity: capacityNum,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Update ${info.name}`}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900/95 shadow-2xl shadow-slate-950/60 ring-1 ring-white/15"
      >
        <header className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-base ring-1 ring-violet-400/30">
              ✎
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-black tracking-tight text-white">Update {info.name}</h2>
              <p className="text-[11px] text-slate-400">Edit team value details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-200 ring-1 ring-white/20 transition hover:bg-white/20"
          >
            ✕
          </button>
        </header>

        <form onSubmit={submit} className="mt-4 flex flex-col gap-3 px-5 pb-5">
          <FormField
            id="edit-name"
            label="Team name"
            type="text"
            value={name}
            onChange={setName}
            placeholder="e.g. Arema FC"
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="edit-code"
              label="Code"
              type="text"
              value={code}
              onChange={setCode}
              placeholder="ARE"
            />
            <FormField
              id="edit-founded"
              label="Founded"
              type="number"
              value={founded}
              onChange={setFounded}
              placeholder="1987"
            />
          </div>
          <FormField
            id="edit-city"
            label="City"
            type="text"
            value={city}
            onChange={setCity}
            placeholder="Kepanjen"
          />
          <FormField
            id="edit-stadium"
            label="Stadium"
            type="text"
            value={stadium}
            onChange={setStadium}
            placeholder="Stadion Kanjuruhan"
          />
          <FormField
            id="edit-capacity"
            label="Capacity"
            type="number"
            value={capacity}
            onChange={setCapacity}
            placeholder="44912"
          />

          {error && (
            <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 ring-1 ring-rose-400/30">
              {error}
            </p>
          )}

          <div className="mt-1 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-white/10 px-3.5 py-2 text-xs font-bold text-slate-200 ring-1 ring-white/20 transition hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-500/20 px-4 py-2 text-xs font-black text-emerald-300 ring-1 ring-emerald-400/40 transition hover:bg-emerald-500/30"
            >
              Save changes →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}