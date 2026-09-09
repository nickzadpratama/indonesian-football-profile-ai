// Tiny event-based toast dispatcher. The viewport lives in components/ToastViewport.jsx.
const EVENT = 'football-hub-toast'
let counter = 0

/** Show a toast. Type: 'success' | 'error' | 'neutral'. */
export function toast(message, type = 'neutral') {
  if (typeof window === 'undefined') return
  counter += 1
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { id: counter, message, type } }))
}