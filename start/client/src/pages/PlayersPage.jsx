import { Loader, ErrorPanel } from "../components/Status.jsx";
import { getSquad } from "../api/football.js";
import { useEffect, useState } from "react";
import Avatar from "../components/Avatar.jsx";
import PlayerCard from "../components/PlayerCard.jsx";
import SeasonScroller from "../components/SeasonScroller.jsx";
import { PREMIUM_ONLY_YEAR, SEASON_YEARS } from "../data/seasons.js";
import gifLoading from "../components/assets/vecteezy_loading-bar-progress-with-green-color-vector-illustration_14945926.svg";
import { useSelector, useDispatch } from "react-redux";
// import {
//   getAllProducts,
//   setLoadingProduct,
//   setErrorProduct,
//   fetchData,
// } from "../features/product/productSlice";
import { fetchPlayers, fetchTeam } from "../features/todo/todoSlice.js";
import { useParams } from "react-router-dom";

// export default function PlayersPage({
//   team,
//   onBack,
//   onSelect,
//   season: initialSeason,
// }) {

export default function PlayersPage() {
  // const [players, setPlayers] = useState([]);

  const { todos, loading, error } = useSelector((state) => state.todo);
  console.log(todos);
  const players = todos.players;
  // console.log(todos);
  const info = todos.team ?? {};
  const venue = todos.venue ?? {};
  const [squad, setSquad] = useState(null);
  // const [error, setError] = useState(null);
  const [phase, setPhase] = useState("loading"); // 'loading' | 'ok' | 'error'
  const [reloadKey, setReloadKey] = useState(0);
  const [season, setSeason] = useState();

  // const [loading, setLoading] = useState(false);
  const { teamId } = useParams();
  const dispatch = useDispatch();

  // async function fetchPlayer() {
  //   try {
  //     console.log(teamId);
  //     setLoading(true);
  //     const result = await fetch(
  //       "https://v1.basketball.api-sports.io/players",
  //       {
  //         method: "GET",
  //         headers: {
  //           "x-apisports-key": "51a6f63d7c6835b341a49be3985f148c", // <-- Ganti dengan API key Anda
  //         },
  //       },
  //     );

  //     const data = await result.json();
  //     setPlayers(data.response);
  //     console.log(data.response);
  //   } catch (error) {
  //     console.error(error);
  //   }
  //   // finally {
  //   //   setLoading(false);
  //   // }
  // }

  // useEffect(() => {
  //   let cancelled = false;
  //   getSquad(info.id)
  //     .then((entry) => {
  //       if (cancelled) return;
  //       setError(null);
  //       setSquad(entry);
  //       setPhase("ok");
  //     })
  //     .catch((err) => {
  //       if (cancelled) return;
  //       setError(err.message);
  //       setPhase("error");
  //     });
  //   return () => {
  //     cancelled = true;
  //   };
  // }, [info.id, reloadKey]);

  // const reload = () => {
  //   setPhase("loading");
  //   setReloadKey((key) => key + 1);
  // };

  // const players = squad?.players ?? [];

  useEffect(() => {
    // fetchPlayer();
    // dispatch(fetchTeam(teamId));
    dispatch(fetchPlayers(teamId));
  }, []);

  return (
    <>
      {loading ? (
        <>
          <div className="flex justify-center mt-28">
            <img src={gifLoading} className="w-1/5" />
          </div>
        </>
      ) : (
        <section className="relative pt-2">
          {/* ── Full-page stadium photo background ───── */}
          {venue.image && (
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0"
            >
              <img
                src={venue.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover opacity-15"
              />
              <div className="absolute inset-0 bg-slate-950/70" />
            </div>
          )}

          {/* ── Team banner ──────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 ring-1 ring-white/10 shadow-lg shadow-slate-950/40">
            {venue.image && (
              <img
                src={venue.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-950/40 to-slate-900/80" />

            <div className="relative flex flex-wrap items-center gap-4 px-5 py-5">
              <button
                type="button"
                // onClick={onBack}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-200 ring-1 ring-white/20 transition hover:bg-white/20"
                aria-label="Back to teams"
              >
                ←
              </button>

              <Avatar
                src={info.logo}
                name={info.name}
                rounded="rounded-full"
                className="h-16 w-16 shrink-0 ring-2 ring-white/30"
              />

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Squad · {venue.city ?? "Indonesia"}
                </p>
                <h1 className="truncate text-2xl font-black tracking-tight text-white">
                  {info.name}
                </h1>
                <p className="text-[11px] text-slate-400">
                  {venue.name ?? "Stadium unknown"} ·{" "}
                  {venue.capacity
                    ? `${venue.capacity.toLocaleString("en-US")} seats`
                    : "capacity —"}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold tabular-nums text-emerald-300 ring-1 ring-emerald-400/30">
                {squad ? `${players.length} players` : "…"}
              </span>
            </div>
          </div>

          {/* ── Season scroller ──────────────────────── */}
          <SeasonScroller value={season} onChange={setSeason} />

          {/* ── Squad grid ───────────────────────────── */}
          {/* {phase === "loading" && (
            <div className="mt-6">
              <Loader label={`Loading ${info.name} squad…`} />
            </div>
          )}
          {phase === "error" && (
            <div className="mt-6">
              <ErrorPanel message={error} onRetry={reload} />
            </div>
          )}
          {phase === "ok" && ( */}
          <>
            {players.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-white/5 py-12 text-center text-sm text-slate-400 ring-1 ring-white/10">
                No squad players found for this team.
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    // onClick={() => onSelect(player, season)}
                  />
                ))}
              </div>
            )}
          </>
          {/* )} */}
        </section>
      )}
    </>
  );
}
