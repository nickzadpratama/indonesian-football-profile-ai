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
    return
  }
}

function notify() {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch {
      return
    }
  })
}

export function getOverrides() {
  return read()
}

export function getOverride(teamId) {
  return read()[teamId]
}

export function saveOverride(teamId, values) {
  const map = read()
  map[teamId] = { ...(map[teamId] ?? {}), ...values }
  write(map)
  notify()
  return map[teamId]
}

export function clearOverride(teamId) {
  const map = read()
  if (map[teamId]) {
    delete map[teamId]
    write(map)
    notify()
  }
}

export function onOverridesChange(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
