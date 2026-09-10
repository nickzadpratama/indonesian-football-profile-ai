import { useState } from 'react'

function initials(name) {
  return String(name ?? '?')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Renders an `<img>` with a graceful initials-fallback when the API image
 * is missing or fails to load. `className` must include the sizing classes.
 */
export default function Avatar({ src, name, rounded = 'rounded-full', className = '' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`${className} ${rounded} flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 text-lg font-black text-slate-200 ring-1 ring-white/10`}
      >
        {initials(name)}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name ?? 'avatar'}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} ${rounded} object-cover bg-slate-900 ring-1 ring-white/20`}
    />
  )
}