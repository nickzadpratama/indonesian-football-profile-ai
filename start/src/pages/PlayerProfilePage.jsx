import { useEffect, useState } from 'react'
import { getPlayerStats } from '../api/football.js'
import Avatar from '../components/Avatar.jsx'
import SeasonScroller from '../components/SeasonScroller.jsx'
import { PREMIUM_ONLY_YEAR, SEASON_YEARS } from '../data/seasons.js'
import { Loader, ErrorPanel } from '../components/Status.jsx'

const positionStyles = {
  Goalkeeper: 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30',
  Defender: 'bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/30',
  Midfielder: 'bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/30',
  Forward: 'bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/30',
}

const DEFAULT_POSITION = 'bg-slate-400/15 text-slate-300 ring-1 ring-slate-400/30'

const fmt = (value) => (value === null || value === undefined ? '—' : String(value))

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="truncate text-xs font-semibold text-slate-200">{fmt(value)}</span>
    </div>
  )
}

function StatTile({ value, label, highlight = false }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-slate-950/50 px-2 py-2.5 ring-1 ring-white/5">
      <span className={`text-base font-black tabular-nums ${highlight ? 'text-emerald-300' : 'text-white'}`}>
        {fmt(value)}
      </span>
      <span className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-500">{label}</span>
    </div>
  )
}

function StatGroup({ title, tiles }) {
  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</h3>
      <div className="mt-2 grid grid-cols-4 gap-1.5">{tiles}</div>
    </div>
  )
}

export default function PlayerProfilePage({ player, team, onBack, season, onSelectSeason }) {
  const info = team?.team ?? {}
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const [phase, setPhase] = useState('loading') // 'loading' | 'ok' | 'error'
  const [reloadKey, setReloadKey] = useState(0)
  const [seasonYear, setSeasonYear] = useState(season ?? SEASON_YEARS.find((y) => y !== PREMIUM_ONLY_YEAR))

  useEffect(() => {
    let cancelled = false
    getPlayerStats(player.id, seasonYear)
      .then((entry) => {
        if (cancelled) return
        setError(null)
        setProfile(entry)
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
  }, [player.id, seasonYear, reloadKey])

  const reload = () => {
    setPhase('loading')
    setReloadKey((key) => key + 1)
  }

  const changeSeason = (year) => {
    setSeasonYear(year)
    setPhase('loading')
    onSelectSeason?.(year)
  }

  const detail = profile?.player ?? player
  const statistics = profile?.statistics ?? []
  const positionClass = positionStyles[player.position] ?? DEFAULT_POSITION

  return (
    <section className="pt-2">
      {/* ── Header / profile card ─────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 ring-1 ring-white/10 shadow-lg shadow-slate-950/40">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />

        <div className="relative flex items-center gap-4 px-5 py-6">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-200 ring-1 ring-white/20 transition hover:bg-white/20"
            aria-label="Back to squad"
          >
            ←
          </button>

          <Avatar
            src={detail.photo}
            name={detail.name ?? player.name}
            rounded="rounded-2xl"
            className="h-28 w-28 shrink-0 ring-2 ring-white/25"
          />

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              <span>Player profile</span>
              <span className="text-slate-700">·</span>
              <span>{info.name ?? '—'}</span>
            </p>
            <h1 className="mt-0.5 truncate text-2xl font-black tracking-tight text-white">
              {detail.name ?? player.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${positionClass}`}>
                {player.position ?? 'Squad member'}
              </span>
              {detail.injured ? (
                <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-300 ring-1 ring-rose-400/30">
                  ❗ Injured
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                  ✓ Fit
                </span>
              )}
              {player.number && (
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-black tabular-nums text-slate-200 ring-1 ring-white/15">
                  #{player.number}
                </span>
              )}
              {seasonYear && (
                <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-black tabular-nums text-sky-300 ring-1 ring-sky-400/30">
                  📅 {seasonYear} season
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal details */}
        <div className="relative grid grid-cols-2 gap-x-6 border-t border-white/10 px-5 pt-3 pb-4 sm:grid-cols-3">
          <InfoRow label="Nationality" value={detail.nationality ?? detail.birth?.country} />
          <InfoRow label="Age" value={detail.age} />
          <InfoRow label="Born" value={detail.birth?.date} />
          <InfoRow label="Place of birth" value={detail.birth?.place} />
          <InfoRow label="Height" value={detail.height ? `${detail.height} m` : null} />
          <InfoRow label="Weight" value={detail.weight ? `${detail.weight} kg` : null} />
          <InfoRow label="Season (stats)" value={profile?.season} />
        </div>
      </div>

      {/* ── Season scroller ───────────────────────── */}
      <SeasonScroller value={seasonYear} onChange={changeSeason} note="scroll — updates stats" />

      {/* ── Statistics ───────────────────────────── */}
      {phase === 'loading' && <div className="mt-6"><Loader label="Loading statistics…" /></div>}
      {phase === 'error' && <div className="mt-6"><ErrorPanel message={error} onRetry={reload} /></div>}
      {phase === 'ok' && (
        statistics.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white/5 py-12 text-center text-sm text-slate-400 ring-1 ring-white/10">
            No season statistics available for this player.
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {statistics.map((stat) => {
              const games = stat.games ?? {}
              return (
                <article key={stat.league?.id} className="rounded-2xl bg-slate-900/80 ring-1 ring-white/10">
                  {/* League header */}
                  <header className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                      {stat.league?.logo ? (
                        <img src={stat.league.logo} alt="" loading="lazy" className="h-7 w-7 object-contain" />
                      ) : (
                        <span aria-hidden="true" className="text-lg">🏆</span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-black tracking-tight text-white">{stat.league?.name}</h2>
                      <p className="text-[11px] text-slate-400">
                        {stat.team?.name ?? '—'} · {stat.league?.country} · Season {stat.league?.season}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
                      {games.position ?? '—'}
                    </span>
                    {games.captain && (
                      <span className="shrink-0 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300 ring-1 ring-amber-400/30">
                        👑 Captain
                      </span>
                    )}
                  </header>

                  {/* Stat tiles */}
                  <div className="flex flex-col gap-4 px-5 py-4">
                    <StatGroup
                      title="Season overview"
                      tiles={[
                        <StatTile key="apps" value={games.appearences} label="Apps" highlight />,
                        <StatTile key="lin" value={games.lineups} label="Lineups" />,
                        <StatTile key="min" value={games.minutes} label="Minutes" />,
                        <StatTile key="rat" value={games.rating != null ? `${games.rating}%` : null} label="Rating" />,
                      ]}
                    />
                    <StatGroup
                      title="Goals & shots"
                      tiles={[
                        <StatTile key="g" value={stat.goals?.total} label="Goals" highlight />,
                        <StatTile key="a" value={stat.goals?.assists} label="Assists" />,
                        <StatTile key="s" value={stat.shots?.total} label="Shots" />,
                        <StatTile key="sv" value={player.position === 'Goalkeeper' ? stat.goals?.saves : stat.shots?.on} label={player.position === 'Goalkeeper' ? 'Saves' : 'On target'} />,
                      ]}
                    />
                    <StatGroup
                      title="Discipline"
                      tiles={[
                        <StatTile key="y" value={stat.cards?.yellow} label="Yellow" />,
                        <StatTile key="yr" value={stat.cards?.yellowred} label="Y/r" />,
                        <StatTile key="r" value={stat.cards?.red} label="Red" />,
                        <StatTile key="p" value={stat.penalty?.commited} label="Fouls" />,
                      ]}
                    />
                    <StatGroup
                      title="Substitutes"
                      tiles={[
                        <StatTile key="si" value={stat.substitutes?.in} label="Sub in" />,
                        <StatTile key="so2" value={stat.substitutes?.out} label="Sub out" />,
                        <StatTile key="b" value={stat.substitutes?.bench} label="Bench" />,
                        <StatTile key="m" value={stat.duels?.total} label="Duels" />,
                      ]}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        )
      )}
    </section>
  )
}