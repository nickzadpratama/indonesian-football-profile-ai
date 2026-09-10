// Local team-votes store (persisted in localStorage, shared across pages).
const VOTES_KEY = 'football_hub_votes'
const listeners = new Set()

function read() {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(VOTES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(ids) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(VOTES_KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}

/** Ordered list of voted team ids. */
export function getVotes() {
  return read()
}

export function hasVoted(teamId) {
  return read().includes(teamId)
}

/** Subscribe to vote changes. Returns an unsubscribe function. */
export function onVotesChange(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Toggle a vote for a team id; returns the new voted state (true = voted). */
export function toggleVote(teamId) {
  const ids = read()
  const index = ids.indexOf(teamId)
  const nowVoted = index === -1
  if (nowVoted) ids.push(teamId)
  else ids.splice(index, 1)
  write(ids)
  listeners.forEach((listener) => {
    try {
      listener()
    } catch {
      /* ignore listener errors */
    }
  })
  return nowVoted
}

/** Deterministic pseudo-random popularity baseline so counts look real but stay stable. */
export function baseVoteCount(teamId) {
  return 86 + ((teamId * 1103515245 + 12345) % 760)
}