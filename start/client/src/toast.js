import Toastify from 'toastify-js'

const TYPES = {
  success: { klass: 'football-toast-success', icon: '✓' },
  error: { klass: 'football-toast-error', icon: '⚠' },
  neutral: { klass: 'football-toast-neutral', icon: '⚽' },
}

const DURATION_MS = 3200

/** Build the toast body (icon + message) so we can accent it per type. */
function buildBody(message, icon) {
  const wrap = document.createElement('div')
  wrap.setAttribute('class', 'football-toast-body')

  const iconEl = document.createElement('span')
  iconEl.setAttribute('class', 'football-toast-icon')
  iconEl.textContent = icon

  const textEl = document.createElement('span')
  textEl.setAttribute('class', 'football-toast-text')
  textEl.textContent = message

  wrap.appendChild(iconEl)
  wrap.appendChild(textEl)
  return wrap
}

/**
 * Show a toast notification for validation & user feedback.
 * Backed by toastify-js, styled to match the app's dark theme
 * via overrides in index.css. Type: 'success' | 'error' | 'neutral'.
 */
export function toast(message, type = 'neutral') {
  if (typeof window === 'undefined') return
  const config = TYPES[type] ?? TYPES.neutral
  Toastify({
    text: message,
    node: buildBody(message, config.icon),
    className: `football-toast ${config.klass}`,
    gravity: 'bottom',
    position: 'right',
    duration: DURATION_MS,
    close: true,
    stopOnFocus: true,
  }).showToast()
}