import { useSelector } from "react-redux";
import Avatar from "./Avatar.jsx";
import { Link } from "react-router-dom";
import MembershipButton from "./MembershipButton.jsx";
import useSessionToken from "../auth/useSessionToken.js";

export default function TeamCard({ team, onUpdate }) {
  const info = team.team ?? {};
  const venue = team.venue ?? {};
  const teamId = info.id;

  const token = useSessionToken();
  const joined = useSelector((state) => state.membership.session === token && Boolean(state.membership.items[teamId]));

  return (
    <article
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl bg-slate-900/80 ring-1 shadow-lg shadow-slate-950/40 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/50 ${
        joined
          ? "ring-emerald-400/40"
          : "ring-white/10 hover:ring-emerald-400/30"
      }`}
    >
      {joined && (
        <span className="pointer-events-none absolute right-2.5 top-2.5 z-10 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/40">
          ✓ Joined Fans Club
        </span>
      )}

      {/* ── Clickable cover + details ─────────────── */}
      <button
        type="button"
        // onClick={onClick}
        className="block w-full text-left"
      >
        <div className="relative h-32 overflow-hidden">
          {venue.image ? (
            <img
              src={venue.image}
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
            src={info.logo}
            name={info.name}
            rounded="rounded-full"
            className="absolute right-3 top-3 h-11 w-11 ring-2 ring-white/30"
          />

          <div className="absolute bottom-2 left-3 right-3">
            <h3 className="truncate text-base font-black tracking-tight text-white">
              {info.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-300">
              {info.code && (
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-200">
                  {info.code}
                </span>
              )}
              <span className="truncate text-slate-400">
                {venue.city ?? "Indonesia"}
              </span>
              {info.national && (
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
              {info.founded ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Stadium</span>
            <span className="truncate font-semibold text-slate-200">
              {venue.name ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Capacity</span>
            <span className="font-semibold tabular-nums text-slate-200">
              {venue.capacity ? venue.capacity.toLocaleString("en-US") : "—"}
            </span>
          </div>
        </div>
      </button>

      {/* ── Footer: navigate + membership ───────────────── */}
      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-black/10 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link to={`/team/${info.id}`}>
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
              title={`Update ${info.name} details`}
              className="flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-2.5 py-1.5 text-[11px] font-bold text-violet-300 ring-1 ring-violet-400/30 transition hover:bg-violet-500/25"
            >
              ✎ Update
            </button>
          )}
        </div>

        <MembershipButton teamId={teamId} name={info.name} />
      </footer>
    </article>
  );
}
