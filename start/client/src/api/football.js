import { API_BASE_URL, authHeaders } from "./auth.js";

export const SEASONS = [2024, 2023, 2022];

async function requestSports(path) {
  const response = await fetch(`${API_BASE_URL}/sports/${path}`, {
    headers: authHeaders(),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? `Football data request failed (${response.status})`);
  }
  if (!Array.isArray(data?.response)) {
    throw new Error("Football data service returned an invalid response");
  }

  return data.response;
}

/** GET /sports/teams?country=… → list of { team, venue }. */
export function getTeams(country = "Indonesia") {
  return requestSports(`teams?country=${encodeURIComponent(country)}`);
}

/** GET /sports/teams?id=… → list containing the matching { team, venue }. */
export function getTeamDetails(teamId) {
  return requestSports(`teams?id=${encodeURIComponent(teamId)}`);
}

/** GET /sports/squads?team=… → { team, players[] }. */
export async function getSquad(teamId) {
  const entries = await requestSports(`squads?team=${encodeURIComponent(teamId)}`);
  return entries[0] ?? { team: null, players: [] };
}

/** GET /sports/players?id=…&season=… → API-Sports response entries. */
export function getPlayerStatistics(playerId, season) {
  return requestSports(
    `players?id=${encodeURIComponent(playerId)}&season=${encodeURIComponent(season)}`,
  );
}

/** Return player details for the requested season or the newest available season. */
export async function getPlayerStats(playerId, season) {
  const seasons = season === undefined ? SEASONS : [season];
  for (const candidate of seasons) {
    const entries = await getPlayerStatistics(playerId, candidate);
    const entry = entries.find((item) => item.statistics?.length > 0);
    if (entry) return { season: candidate, ...entry };
  }
  return null;
}
