// Football API client — v3.football.api-sports.io
const API_KEY = '51a6f63d7c6835b341a49be3985f148c'
const BASE_URL = 'https://v3.football.api-sports.io'

// Free plan exposes seasons 2022 → 2024
export const SEASONS = [2024, 2023, 2022]

// Simple in-memory cache so back-navigation never refetches
const cache = new Map()

export function clearCache() {
  cache.clear()
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const REQUEST_TIMEOUT_MS = 15000

/** fetch() that never hangs — aborts/timeouts when the upstream stalls. */
async function fetchWithTimeout(path) {
  const signal =
    typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      : undefined
  const request = fetch(`${BASE_URL}${path}`, {
    headers: { 'x-apisports-key': API_KEY },
    signal,
  })
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('The request timed out after 15s.')), REQUEST_TIMEOUT_MS + 2000),
  )
  return Promise.race([request, timeout])
}

function errorMessage(data) {
  if (!data) return 'Unknown error'
  if (typeof data.errors === 'string') return data.errors
  if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors.join(', ')
  if (typeof data.errors === 'object' && data.errors !== null) {
    const values = Object.values(data.errors)
    if (values.length > 0) return values.map((v) => (Array.isArray(v) ? v.join(', ') : String(v))).join(', ')
  }
  return 'Unknown error'
}

async function fetchJSON(path) {
  if (cache.has(path)) return cache.get(path)

  let lastError
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetchWithTimeout(path)
      if (!response.ok) {
        let body = null
        try {
          body = await response.json()
        } catch {
          /* ignore non-JSON error body */
        }
        throw new Error(`HTTP ${response.status} — ${errorMessage(body)}`)
      }
      const data = await response.json()
      cache.set(path, data)
      return data
    } catch (error) {
      lastError = error
      // back off on transient failures / rate limits, then retry
      if (attempt < 2) await sleep(attempt === 0 ? 400 : 1500)
    }
  }
  throw lastError
}

/** GET /teams?country=… → list of { team, venue } */
export async function getTeams(country = 'Indonesia') {
  const data = await fetchJSON(`/teams?country=${encodeURIComponent(country)}`)
  return data.response ?? []
}

/** GET /players/squads?team=… → { team, players[] } */
export async function getSquad(teamId) {
  const data = await fetchJSON(`/players/squads?team=${teamId}`)
  const entry = (data.response ?? [])[0]
  return entry ?? { team: null, players: [] }
}

/**
 * GET /players?id=…&season=… → { season, player, statistics[] }
 * - Pass a `season` to lock the request to that year.
 * - Without a season, tries the most recent free season that has stats.
 */
export async function getPlayerStats(playerId, season) {
  if (season !== undefined) {
    const data = await fetchJSON(`/players?id=${playerId}&season=${season}`)
    const entry = (data.response ?? [])[0]
    return {
      season,
      player: entry?.player ?? null,
      statistics: entry?.statistics ?? [],
    }
  }
  for (const candidate of SEASONS) {
    const data = await fetchJSON(`/players?id=${playerId}&season=${candidate}`)
    const entry = (data.response ?? []).find(
      (item) => item.statistics && item.statistics.length > 0,
    )
    if (entry) return { season: candidate, ...entry }
  }
  return null
}