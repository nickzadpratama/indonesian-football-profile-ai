import { PREMIUM_ONLY_YEAR, SEASON_YEARS } from '../data/seasons.js'

/**
 * Horizontally scrollable year picker — swipe / scroll to change season.
 * `value` = selected year, `onChange(year)` fires on click.
 */
export default function SeasonScroller({ value, onChange, note = 'applies to profiles' }) {
  return (
    <div className="mt-3 flex items-center gap-2 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
      <span className="shrink-0 px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Season
      </span>
      <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-2 scrollbar-thin">
        {SEASON_YEARS.map((year) => (
          <button
            key={year}
            type="button"
            disabled={year === PREMIUM_ONLY_YEAR}
            onClick={() => onChange(year)}
            aria-pressed={value === year}
            title={year === PREMIUM_ONLY_YEAR ? 'Premium plan only' : `Use ${year} season statistics`}
            className={`h-8 shrink-0 rounded-lg px-3 text-xs font-bold tabular-nums transition ${
              value === year
                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                : year === PREMIUM_ONLY_YEAR
                  ? 'bg-white/5 text-slate-600 opacity-60 ring-1 ring-white/10'
                  : 'bg-white/10 text-slate-200 ring-1 ring-white/15 hover:bg-white/20'
            }`}
          >
            {year}
            {year === PREMIUM_ONLY_YEAR && (
              <span aria-hidden="true" className="ml-0.5 text-[9px]">🔒</span>
            )}
          </button>
        ))}
      </div>
      <span className="shrink-0 hidden px-3 py-3 text-[10px] text-slate-500 sm:inline">{note}</span>
    </div>
  )
}