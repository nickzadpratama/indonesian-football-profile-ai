import { useEffect, useState } from "react";
import Avatar from "./Avatar.jsx";
import { hasVoted, onVotesChange } from "../data/votes.js";
import { Link } from "react-router-dom";

/**
 * Team card for the My Teams page. Displays a team saved on the server
 * (flat shape: name/code/founded/stadium/city/capacity/image directly on
 * team), with quick links to the squad page and the update form.
 */
export default function MyTeamCard({ team, onUpdate }) {
  const teamId = team.id;
  const [voted, setVoted] = useState();

  useEffect(() => onVotesChange(() => setVoted(hasVoted(teamId))), [teamId]);

  return (
    <article
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl bg-slate-900/80 ring-1 shadow-lg shadow-slate-950/40 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/50 ${
        voted
          ? "ring-emerald-400/40"
          : "ring-white/10 hover:ring-emerald-400/30"
      }`}
    >
      {voted && (
        <span className="pointer-events-none absolute right-2.5 top-2.5 z-10 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/40">
          ✓ My Teams
        </span>
      )}

      {/* ── Clickable cover + details ─────────────── */}
      <button
        type="button"
        // onClick={onClick}
        className="block w-full text-left"
      >
        <div className="relative h-32 overflow-hidden">
          {team.image ? (
            <img
              src={team.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/60 via-teal-600/50 to-cyan-700/60" />
          )}
          <div className="absolute inset-0 bg-slate-950/55" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          <Avatar
            src={team.logo}
            name={team.name}
            rounded="rounded-full"
            className="absolute right-3 top-3 h-11 w-11 ring-2 ring-white/30"
          />

          <div className="absolute bottom-2 left-3 right-3">
            <h3 className="truncate text-base font-black tracking-tight text-white">
              {team.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-300">
              {team.code && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-200">
                  {team.code}
                </span>
              )}
              <span className="truncate text-slate-400">
                {team.city ?? "Indonesia"}
              </span>
              {team.national && (
                <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                  National
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 px-4 py-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Founded</span>
            <span className="font-semibold tabular-nums text-slate-200">
              {team.founded ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Stadium</span>
            <span className="truncate font-semibold text-slate-200">
              {team.stadium ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Capacity</span>
            <span className="font-semibold tabular-nums text-slate-200">
              {team.capacity
                ? Number(team.capacity).toLocaleString("en-US")
                : "—"}
            </span>
          </div>
        </div>
      </button>

      {/* ── Footer: navigate + update ─────────────── */}
      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-black/10 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link to={`/team/${team.id}`}>
            <div
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-emerald-300"
            >
              View squad
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </div>
          </Link>
          {onUpdate && (
            <button
              type="button"
              onClick={onUpdate}
              title={`Update ${team.name} details`}
              className="flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-2.5 py-1.5 text-[11px] font-bold text-violet-300 ring-1 ring-violet-400/30 transition hover:bg-violet-500/25"
            >
              ✎ Update
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
