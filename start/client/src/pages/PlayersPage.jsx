import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import PlayerCard from "../components/PlayerCard.jsx";
import Avatar from "../components/Avatar.jsx";
import { ErrorPanel } from "../components/Status.jsx";
import gifLoading from "../components/assets/vecteezy_loading-bar-progress-with-green-color-vector-illustration_14945926.svg";
import { fetchTeamPlayer } from "../features/team/teamSlice.js";
import { toastifyError } from "../utils/toastify.js";
import { useParams } from "react-router-dom";

export default function PlayersPage() {
  const { data, loading, error } = useSelector((state) => state.team);
  const { teamId } = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTeamPlayer(teamId));
  }, [dispatch, teamId]);

  useEffect(() => {
    if (error) toastifyError(error?.response?.data?.message ?? error);
  }, [error]);

  if (loading) {
    return (
      <div className="flex justify-center mt-28">
        <img src={gifLoading} className="w-1/5" alt="Loading squad" />
      </div>
    );
  }

  if (error) {
    console.log(error);
    return (
      <div className="mt-6">
        <ErrorPanel
          message={error?.response?.data?.message ?? error}
          onRetry={() => dispatch(fetchTeamPlayer(teamId))}
        />
      </div>
    );
  }

  // api-sports /players/squads menjawab: [{ team: {...}, players: [{...}] }]
  const squadList = Array.isArray(data) ? data : [];
  const entry = squadList.find(
    (item) => String(item?.team?.id) === String(teamId),
  ) ??
    squadList[0] ?? { team: {}, players: [] };
  const players = Array.isArray(entry.players) ? entry.players : [];
  const team = entry.team ?? {};

  return (
    <>
      <section className="relative pt-2">
        {/* ── Team banner ──────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 ring-1 ring-white/10 shadow-lg shadow-slate-950/40">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-950/40 to-slate-900/80" />

          <div className="relative flex flex-wrap items-center gap-4 px-5 py-5">
            <Avatar
              src={team.logo}
              name={team.name}
              rounded="rounded-full"
              className="h-16 w-16 shrink-0 ring-2 ring-white/30"
            />

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Squad
              </p>
              <h1 className="truncate text-2xl font-black tracking-tight text-white">
                {team.name ?? "Unknown team"}
              </h1>
              <p className="text-[11px] text-slate-400">
                {players.length} players in this squad
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold tabular-nums text-emerald-300 ring-1 ring-emerald-400/30">
              {players.length} player{players.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* ── Squad grid (satu PlayerCard per pemain) ── */}
        {players.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white/5 py-12 text-center text-sm text-slate-400 ring-1 ring-white/10">
            No squad players found for this team.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {players.map((player) => (
              <PlayerCard key={player.id} el={{ players: player }} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
