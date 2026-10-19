import LoadingIndicator from './LoadingIndicator.jsx';

export function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/5 py-20 ring-1 ring-white/10">
      <LoadingIndicator label={label} />
      <p className="text-sm font-medium text-slate-300">{label}</p>
    </div>
  )
}

export function ErrorPanel({ message = 'Something went wrong while fetching the API.', onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-rose-500/10 py-12 text-center ring-1 ring-rose-400/30">
      <span aria-hidden="true" className="text-3xl">⚠️</span>
      <p className="text-sm font-semibold text-rose-300">Failed to load data</p>
      <p className="max-w-md break-words text-xs text-slate-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 ring-1 ring-white/20 transition hover:bg-white/20"
        >
          ↻ Try again
        </button>
      )}
    </div>
  )
}
