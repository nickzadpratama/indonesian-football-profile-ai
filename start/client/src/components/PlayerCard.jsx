import Avatar from "./Avatar.jsx";
import { Link } from "react-router-dom";

const positionStyles = {
  Goalkeeper: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30",
  Defender: "bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/30",
  Midfielder: "bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/30",
  Forward: "bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/30",
};

const DEFAULT_POSITION =
  "bg-slate-400/15 text-slate-300 ring-1 ring-slate-400/30";

/**
 * Player card for the squad list. Middle-size photo (96 px) with an
 * initials fallback. Clicking anywhere on the card opens the player profile
 * & statistics page (/players/:playerId). The player object rides along in
 * location.state so the profile header shows instantly while the statistics
 * are still being fetched (ProfileRoute reads it as location.state.player).
 */
export default function PlayerCard({ el }) {
  const player = el.players ?? {};
  const positionClass = positionStyles[player.position] ?? DEFAULT_POSITION;
  const profilePath = player.id ? `/players/${player.id}` : "/";

  return (
    <Link
      to={profilePath}
      state={{ player }}
      title={`Open ${player.name ?? "player"} profile & stats`}
      className="group flex w-full flex-col overflow-hidden rounded-2xl bg-slate-900/80 text-left ring-1 ring-white/10 shadow-lg shadow-slate-950/40 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/50 hover:ring-emerald-400/30"
    >
      {/* ── Photo (middle size) ───────────────────── */}
      <div className="flex flex-col items-center gap-1.5 py-4">
        <Avatar
          src={player.photo}
          name={player.name}
          rounded="rounded-2xl"
          className="flex h-24 w-24 items-center justify-center ring-2 ring-white/20"
        />
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${positionClass}`}
        >
          {player.position ?? "Squad"}
        </span>
      </div>

      {/* ── Name + number ────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-black tracking-tight text-white">
            {player.name}
          </h3>
          <p className="mt-0.5 text-[11px] tabular-nums text-slate-400">
            {player.age ?? "—"} years old
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-black leading-none tabular-nums text-emerald-300 ring-1 ring-emerald-400/30">
          {player.number ?? "#"}
        </span>
      </div>

      {/* ── Footer ────────────────────────────────── */}
      <div className="mt-auto flex items-center justify-center gap-1.5 border-t border-white/10 bg-black/10 py-2.5 text-xs font-bold text-emerald-300 transition group-hover:gap-2">
        View profile &amp; stats
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </Link>
  );
}
