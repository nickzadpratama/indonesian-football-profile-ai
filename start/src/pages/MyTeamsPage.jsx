import { useEffect, useState } from 'react'
import { getTeams } from '../api/football.js'
import EditTeamModal from '../components/EditTeamModal.jsx'
import TeamCard from '../components/TeamCard.jsx'
import { Loader, ErrorPanel } from '../components/Status.jsx'
import { getVotes, onVotesChange } from '../data/votes.js'
import { getOverrides, onOverridesChange, saveOverride } from '../data/overrides.js'
import { toast } from '../toast.js'

/** Merge a saved local override into an API team entry (falls back to original values). */
function applyOverride(entry, override) {
  if (!override) return entry
  const t = entry.team ?? {}
  const v = entry.venue ?? {}
  return {
    ...entry,
    team: {
      ...t,
      name: override.name ?? t.name,
      code: override.code ?? t.code,
      founded: override.founded ?? t.founded,
    },
    venue: {
      ...v,
      city: override.city ?? v.city,
      name: override.stadium ?? v.name,
      capacity: override.capacity ?? v.capacity,
    },
  }
}

/** Shows every team you voted for as a team card, with an update option. */
export default function MyTeamsPage({ onSelect, onBrowse }) {
  const [teams, setTeams] = useState(null)
  const [error, setError] = useState(null)
  const [phase, setPhase] = useState('loading') // 'loading' | 'ok' | 'error'
  const [reloadKey, setReloadKey] = useState(0)
  const [votes, setVotes] = useState(() => getVotes())
  const [overrides, setOverrides] = useState(() => getOverrides())
  const [editing, setEditing] = useState(null)

  useEffect(() => onVotesChange(() => setVotes(getVotes())), [])
  useEffect(() => onOverridesChange(() => setOverrides(getOverrides())), [])

  useEffect(() => {
    let cancelled = false
    getTeams('Indonesia')
      .then((list) => {
        if (cancelled) return
        setError(null)
        setTeams(list)
        setPhase('ok')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setPhase('error')
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = () => {
    setPhase('loading')
    setReloadKey((key) => key + 1)
  }

  const myTeams = (teams ?? [])
    .filter((entry) => votes.includes(entry.team?.id))
    .map((entry) => applyOverride(entry, overrides[entry.team?.id]))

  const saveEdit = (values) => {
    if (!editing) return
    saveOverride(editing.team.id, values)
    toast(`${values.name || editing.team.name} updated ✓`, 'success')
    setEditing(null)
  }

  return (
    <section className="pt-2">
      <header className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-2xl shadow-lg shadow-emerald-500/20 ring-2 ring-white/20">
          🏠
        </span>
        <h1 className="mt-4 bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-3xl font-black tracking-tight text-transparent">
          My Teams
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          The clubs you voted for. Press the ▲ Vote button on any team card to add it here.
        </p>
      </header>

      <div className="mt-6 flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your votes</span>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold tabular-nums text-emerald-300 ring-1 ring-emerald-400/30">
          {myTeams.length} team{myTeams.length === 1 ? '' : 's'}
        </span>
      </div>

      {phase === 'loading' && <div className="mt-6"><Loader label="Fetching Indonesian teams…" /></div>}
      {phase === 'error' && <div className="mt-6"><ErrorPanel message={error} onRetry={reload} /></div>}
      {phase === 'ok' &&
        (myTeams.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-white/5 py-14 text-center ring-1 ring-white/10">
            <span aria-hidden="true" className="text-3xl">🗳️</span>
            <p className="text-sm font-semibold text-slate-300">No voted teams yet</p>
            <p className="text-xs text-slate-500">Open a team card and press the ▲ Vote button — it will show up here.</p>
            <button
              type="button"
              onClick={onBrowse}
              className="mt-1 rounded-lg bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30 transition hover:bg-emerald-500/25"
            >
              Browse teams →
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {myTeams.map((entry) => (
              <TeamCard
                key={entry.team?.id}
                team={entry}
                onClick={() => onSelect(entry)}
                onUpdate={() => setEditing(entry)}
              />
            ))}
          </div>
        ))}
      {editing && (
        <EditTeamModal team={editing} onSave={saveEdit} onClose={() => setEditing(null)} />
      )}
    </section>
  )
}