// Local team-value edits store (persisted in localStorage, applied on My Teams page).
const OVERRIDES_KEY = 'football_hub_team_edits'
const listeners = new Set()

function read() {
  try {
    if (typeof localStorage === 'undefined') return {}
    const raw = localStorage.getItem(OVERRIDES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function write(map) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map))
    }
  } catch {
    /* ignore */
  }
}

function notify() {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch {
      /* ignore listener errors */
    }
  })
}

/** All saved overrides: { [teamId]: { name?, code?, founded?, city?, stadium?, capacity? } } */
export function getOverrides() {
  return read()
}

/** Single team override (or undefined). */
export function getOverride(teamId) {
  return read()[teamId]
}

/** Merge + persist values for a team. Returns the saved override. */
export function saveOverride(teamId, values) {
  const map = read()
  map[teamId] = { ...(map[teamId] ?? {}), ...values }
  write(map)
  notify()
  return map[teamId]
}

/** Remove any saved override for a team. */
export function clearOverride(teamId) {
  const map = read()
  if (map[teamId]) {
    delete map[teamId]
    write(map)
    notify()
  }
}

/** Subscribe to override changes. Returns an unsubscribe function. */
export function onOverridesChange(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}