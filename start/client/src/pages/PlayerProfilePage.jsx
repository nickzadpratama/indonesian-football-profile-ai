"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../components/Avatar.jsx";
import SeasonScroller from "../components/SeasonScroller.jsx";
import { PREMIUM_ONLY_YEAR, SEASON_YEARS } from "../data/seasons.js";
import { Loader, ErrorPanel } from "../components/Status.jsx";
import { fetchPlayerStatistic } from "../features/player/playerSlice.js";

/* ── Position badge colour mapping ── */
const positionStyles = {
  Goalkeeper: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30",
  Defender: "bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/30",
  Midfielder: "bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/30",
  Forward: "bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/30",
};

const DEFAULT_POSITION =
  "bg-slate-400/15 text-slate-300 ring-1 ring-slate-400/30";

/** Render a value or an em-dash placeholder when missing. */
const fmt = (value) =>
  value === null || value === undefined ? "—" : String(value);

/**
 * A two-column label / value row used in the personal-details section.
 * @param={{ label: string, value: * }} props
 */
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="truncate text-xs font-semibold text-slate-200">
        {fmt(value)}
      </span>
    </div>
  );
}

/**
 * A single numeric stat tile.
 * @param={{ value: *, label: string, highlight?: boolean }} props
 */
function StatTile({ value, label, highlight = false }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-slate-950/50 px-2 py-2.5 ring-1 ring-white/5">
      <span
        className={`text-base font-black tabular-nums ${highlight ? "text-emerald-300" : "text-white"}`}
      >
        {fmt(value)}
      </span>
      <span className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}

/**
 * A labelled 4-column grid of `StatTile`s.
 * @param={{ title: string, tiles: React.ReactNode }} props
 */
function StatGroup({ title, tiles }) {
  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {title}
      </h3>
      <div className="mt-2 grid grid-cols-4 gap-1.5">{tiles}</div>
    </div>
  );
}

/**
 * Player profile & statistics page.
 *
 * Data sources (see ../features/player/playerSlice.js):
 *  1. **playerSlice.js** (Redux) — `fetchPlayerStatistic(playerId, season)`
 *     hits `/players?id=ID&season=YEAR` and stores the response entries
 *     `[{ player, statistics[] }]` in `state.player.data`.  Each
 *     statistics entry describes one competition (league) the player
 *     featured in that season.
 *
 * The two sources are merged: the slice supplies player identity while
 * `fetchPlayerStatistic` supplies the per-season statistics that are
 * rendered below.  If the slice ever carries `statistics[]` entries
 * (future-proof), those take priority over the API response.
 *
 * Statistics rendering follows the `example` folder conventions
 * (JSDoc, defensive defaults, explicit error/empty states): a season
 * totals strip (appearances / goals / assists / minutes / average
 * rating) plus per-competition cards, each split into grouped tiles —
 * season overview, goals & shooting, passing & duels, defence &
 * dribbles, discipline and substitutes.
 *
 * @param={{
 *   player:  { id: number, name?: string, position?: string, [k:string]: any }
 *   team:    { team?: { name?: string } } | null
 *   onBack:  () => void
 *   season:  number | undefined
 *   onSelectSeason: (year: number) => void
 * }} props
 */
export default function PlayerProfilePage({
  player,
  team,
  onBack,
  season,
  onSelectSeason,
}) {
  const dispatch = useDispatch();
  const {
    data: sliceData,
    loading: sliceLoading,
    error: sliceError,
  } = useSelector((state) => state.player);

  const info = team?.team ?? {};
  const [reloadKey, setReloadKey] = useState(0);
  const [seasonYear, setSeasonYear] = useState(
    season ?? SEASON_YEARS.find((y) => y !== PREMIUM_ONLY_YEAR),
  );

  /* ── 2. playerSlice.js ─ load per-season statistics into Redux ── */
  useEffect(() => {
    if (player.id && seasonYear)
      dispatch(fetchPlayerStatistic(player.id, seasonYear));
  }, [dispatch, player.id, seasonYear, reloadKey]);

  const reload = () => {
    setReloadKey((key) => key + 1);
  };

  const changeSeason = (year) => {
    setSeasonYear(year);
    onSelectSeason?.(year);
  };

  /* ── Merge data sources ───────────────────────────── */
  /* playerSlice.js — state.player.data is an array of squad
     entries ({ team, players[] }) and / or statistic entries
     ({ player, statistics[] }).  We look up the squad entry that
     contains this player to recover identity data that may be
     richer than the shallow `player` prop received via routing. */
  const squadList = Array.isArray(sliceData) ? sliceData : [];
  const squadEntry = squadList.find((entry) =>
    (entry.players ?? []).some((member) => member.id === player.id),
  );
  const squadPlayer = squadEntry?.players?.find(
    (member) => member.id === player.id,
  );

  /* Statistic entries from `fetchPlayerStatistic` live in the same
     state.player.data array — pick the one matching this player. */
  const statEntry = squadList.find(
    (entry) => entry.player?.id != null && entry.player.id === player.id,
  );
  const sliceStatistics =
    squadList.find((entry) => (entry.statistics?.length ?? 0) > 0)
      ?.statistics ?? [];

  /* Player identity: statistic payload → squad info → routing props. */
  const playerInfo = { ...squadPlayer, ...player };
  const detail = statEntry?.player ?? playerInfo;
  const statsSeason = statEntry?.statistics?.[0]?.league?.season;
  const statistics =
    sliceStatistics.length > 0
      ? sliceStatistics
      : (statEntry?.statistics ?? []);

  /* Slice keeps `loading === true` after fetchFailed — error wins. */
  const statsError =
    typeof sliceError === "string" ? sliceError : (sliceError?.message ?? null);

  // Total gabungan dari semua kompetisi yang tampil pada musim ini.
  // Rating dikumpulkan terpisah agar bisa dirata-rata (bukan dijumlah).
  const totals = statistics.reduce(
    (acc, stat) => {
      const rating = Number(stat.games?.rating);
      return {
        appearances: acc.appearances + (stat.games?.appearences ?? 0),
        goals: acc.goals + (stat.goals?.total ?? 0),
        assists: acc.assists + (stat.goals?.assists ?? 0),
        minutes: acc.minutes + (stat.games?.minutes ?? 0),
        ratings:
          Number.isFinite(rating) && stat.games?.rating != null
            ? [...acc.ratings, rating]
            : acc.ratings,
      };
    },
    { appearances: 0, goals: 0, assists: 0, minutes: 0, ratings: [] },
  );
  const avgRating =
    totals.ratings.length > 0
      ? (
          totals.ratings.reduce((sum, rating) => sum + rating, 0) /
          totals.ratings.length
        ).toFixed(2)
      : null;
  const positionClass = positionStyles[playerInfo.position] ?? DEFAULT_POSITION;

  return (
    <section className="pt-2">
      {/* ── Header / profile card ─────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 ring-1 ring-white/10 shadow-lg shadow-slate-950/40">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />

        <div className="relative flex items-center gap-4 px-5 py-6">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-200 ring-1 ring-white/20 transition hover:bg-white/20"
            aria-label="Back to squad"
          >
            ←
          </button>

          <Avatar
            src={detail.photo}
            name={detail.name ?? player.name}
            rounded="rounded-2xl"
            className="h-28 w-28 shrink-0 ring-2 ring-white/25"
          />

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              <span>Player profile</span>
              <span className="text-slate-700">·</span>
              <span>{info.name ?? squadEntry?.team?.name ?? "—"}</span>
            </p>
            <h1 className="mt-0.5 truncate text-2xl font-black tracking-tight text-white">
              {detail.name ?? player.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${positionClass}`}
              >
                {playerInfo.position ?? "Squad member"}
              </span>
              {detail.injured ? (
                <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-300 ring-1 ring-rose-400/30">
                  ❗ Injured
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
                  ✓ Fit
                </span>
              )}
              {playerInfo.number && (
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-black tabular-nums text-slate-200 ring-1 ring-white/15">
                  #{playerInfo.number}
                </span>
              )}
              {seasonYear && (
                <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-black tabular-nums text-sky-300 ring-1 ring-sky-400/30">
                  📅 {seasonYear} season
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal details */}
        <div className="relative grid grid-cols-2 gap-x-6 border-t border-white/10 px-5 pt-3 pb-4 sm:grid-cols-3">
          <InfoRow
            label="Nationality"
            value={detail.nationality ?? detail.birth?.country}
          />
          <InfoRow label="Age" value={detail.age} />
          <InfoRow label="Born" value={detail.birth?.date} />
          <InfoRow label="Place of birth" value={detail.birth?.place} />
          <InfoRow
            label="Height"
            value={detail.height ? `${detail.height} m` : null}
          />
          <InfoRow
            label="Weight"
            value={detail.weight ? `${detail.weight} kg` : null}
          />
          <InfoRow label="Season (stats)" value={statsSeason} />
        </div>
      </div>

      {/* ── Season scroller ───────────────────────── */}
      <SeasonScroller
        value={seasonYear}
        onChange={changeSeason}
        note="scroll — updates stats"
      />

      {/* ── Statistics ───────────────────────────── */}
      {statistics.length === 0 && statsError !== null && (
        <div className="mt-6">
          <ErrorPanel message={statsError} onRetry={reload} />
        </div>
      )}
      {statistics.length === 0 && statsError === null && sliceLoading && (
        <div className="mt-6">
          <Loader label="Loading statistics…" />
        </div>
      )}
      {statistics.length === 0 && statsError === null && !sliceLoading && (
        <div className="mt-6 rounded-2xl bg-white/5 py-12 text-center text-sm text-slate-400 ring-1 ring-white/10">
          No season statistics available for this player.
        </div>
      )}
      {statistics.length > 0 && (
        <div className="mt-6 space-y-6">
          {/* Total gabungan semua kompetisi pada musim terpilih */}
          <div className="rounded-2xl bg-slate-900/80 px-5 py-4 ring-1 ring-white/10">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Season totals · {statsSeason ?? seasonYear}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
              <StatTile
                value={totals.appearances}
                label="Appearances"
                highlight
              />
              <StatTile value={totals.goals} label="Goals" />
              <StatTile value={totals.assists} label="Assists" />
              <StatTile value={totals.minutes} label="Minutes" />
              <StatTile value={avgRating} label="Avg rating" />
            </div>
          </div>

          {statistics.map((stat) => {
            const games = stat.games ?? {};
            return (
              <article
                key={stat.league?.id}
                className="rounded-2xl bg-slate-900/80 ring-1 ring-white/10"
              >
                {/* League header */}
                <header className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    {stat.league?.logo ? (
                      <img
                        src={stat.league.logo}
                        alt=""
                        loading="lazy"
                        className="h-7 w-7 object-contain"
                      />
                    ) : (
                      <span aria-hidden="true" className="text-lg">
                        🏆
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-black tracking-tight text-white">
                      {stat.league?.name}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {stat.team?.name ?? "—"} · {stat.league?.country} · Season{" "}
                      {stat.league?.season}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
                    {games.position ?? "—"}
                  </span>
                  {games.captain && (
                    <span className="shrink-0 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300 ring-1 ring-amber-400/30">
                      👑 Captain
                    </span>
                  )}
                </header>

                {/* Stat tiles */}
                <div className="flex flex-col gap-4 px-5 py-4">
                  <StatGroup
                    title="Season overview"
                    tiles={[
                      <StatTile
                        key="apps"
                        value={games.appearences}
                        label="Apps"
                        highlight
                      />,
                      <StatTile
                        key="lin"
                        value={games.lineups}
                        label="Lineups"
                      />,
                      <StatTile
                        key="min"
                        value={games.minutes}
                        label="Minutes"
                      />,
                      <StatTile
                        key="rat"
                        value={
                          games.rating != null
                            ? Number(games.rating).toFixed(2)
                            : null
                        }
                        label="Rating"
                      />,
                    ]}
                  />
                  <StatGroup
                    title="Goals & shots"
                    tiles={[
                      <StatTile
                        key="g"
                        value={stat.goals?.total}
                        label="Goals"
                        highlight
                      />,
                      <StatTile
                        key="a"
                        value={stat.goals?.assists}
                        label="Assists"
                      />,
                      <StatTile
                        key="s"
                        value={stat.shots?.total}
                        label="Shots"
                      />,
                      <StatTile
                        key="sv"
                        value={
                          playerInfo.position === "Goalkeeper"
                            ? stat.goals?.saves
                            : stat.shots?.on
                        }
                        label={
                          playerInfo.position === "Goalkeeper"
                            ? "Saves"
                            : "On target"
                        }
                      />,
                    ]}
                  />
                  <StatGroup
                    title="Passing & duels"
                    tiles={[
                      <StatTile
                        key="pt"
                        value={stat.passes?.total}
                        label="Passes"
                      />,
                      <StatTile
                        key="pk"
                        value={stat.passes?.key}
                        label="Key passes"
                      />,
                      <StatTile
                        key="pa"
                        value={
                          stat.passes?.accuracy != null
                            ? `${stat.passes.accuracy}%`
                            : null
                        }
                        label="Accuracy"
                      />,
                      <StatTile
                        key="dw"
                        value={stat.duels?.won}
                        label="Duels won"
                      />,
                    ]}
                  />
                  <StatGroup
                    title="Defence & dribbles"
                    tiles={[
                      <StatTile
                        key="tk"
                        value={stat.tackles?.total}
                        label="Tackles"
                      />,
                      <StatTile
                        key="it"
                        value={stat.tackles?.interceptions}
                        label="Intercepts"
                      />,
                      <StatTile
                        key="bl"
                        value={stat.tackles?.blocks}
                        label="Blocks"
                      />,
                      <StatTile
                        key="dr"
                        value={stat.dribbles?.success}
                        label="Dribbles"
                      />,
                    ]}
                  />
                  <StatGroup
                    title="Discipline"
                    tiles={[
                      <StatTile
                        key="y"
                        value={stat.cards?.yellow}
                        label="Yellow"
                      />,
                      <StatTile
                        key="yr"
                        value={stat.cards?.yellowred}
                        label="Y/r"
                      />,
                      <StatTile key="r" value={stat.cards?.red} label="Red" />,
                      <StatTile
                        key="pc"
                        value={stat.penalty?.commited}
                        label="Pens"
                      />,
                    ]}
                  />
                  <StatGroup
                    title="Substitutes"
                    tiles={[
                      <StatTile
                        key="si"
                        value={stat.substitutes?.in}
                        label="Sub in"
                      />,
                      <StatTile
                        key="so2"
                        value={stat.substitutes?.out}
                        label="Sub out"
                      />,
                      <StatTile
                        key="b"
                        value={stat.substitutes?.bench}
                        label="Bench"
                      />,
                      <StatTile
                        key="pw"
                        value={stat.penalty?.won}
                        label="Pens won"
                      />,
                    ]}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
