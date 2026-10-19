import { useEffect, useState } from "react";
import LoadingIndicator from "../components/LoadingIndicator.jsx";
import Toastify from "toastify-js";
import axios from "axios";
import { fetchTeams } from "../features/team/teamSlice.js";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { toastifyError } from "../utils/toastify.js";
import RunningData from "../components/RunningData.jsx";
import { getTeamDetails } from "../api/football.js";

const PAGE_STEP = 18;

export default function JoinClubsPage() {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_STEP);
  const [joined, setJoined] = useState([]);
  const { data, loading, error } = useSelector((state) => state.team);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center mt-28">
        <LoadingIndicator label="Loading clubs…" className="w-1/5 min-w-24 max-w-48" />
      </div>
    );
  }

  if (error) {
    console.log(error);
    return toastifyError(error);
  }

  const term = query.trim().toLowerCase();
  const clubs = (data ?? []).filter((t) => {
    if (!term) return true;
    const teamName = t.team?.name?.toLowerCase() || "";
    return teamName.includes(term);
  });

  async function handleJoin(e, infoId) {
    e.preventDefault();
    try {
      const teamDetails = await getTeamDetails(infoId);
      const joinedOk = await postJoin(e, teamDetails);

      if (joinedOk) {
        setJoined((prev) => [...prev, infoId]);
        Toastify({
          text: "Success Join Clubs",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "bottom",
          position: "right",
          stopOnFocus: true,
          style: {
            background: "#34D399",
            color: "black",
          },
          onClick: function () {},
        }).showToast();
      }
    } catch (error) {
      console.log(error?.response?.data);
      toastifyError(error?.response?.data?.message ?? error?.message);
    }
  }

  async function postJoin(e, response) {
    try {
      e.preventDefault();

      const info = response?.[0]?.team ?? {};
      const venue = response?.[0]?.venue ?? {};

      await axios.post(

        "http://localhost:3000/",
        {
          name: info.name,
          code: info.code,
          logo: info.logo,
          founded: info.founded,
          stadium: venue.name,
          city: venue.city,
          capacity: venue.capacity,
          image: venue.image,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        },
      );

      return true;
    } catch (error) {
      console.log(error.response.data);
      toastifyError(error.response.data.message);
      return false;
    }
  }

  return (
    <>
      <section className="pt-2">

        <header className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-2xl shadow-lg shadow-emerald-500/20 ring-2 ring-white/20">
            🤝
          </span>
          <h1 className="mt-4 bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-3xl font-black tracking-tight text-transparent">
            Join Clubs
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Pilih klub dari{" "}
            <span className="font-semibold text-slate-300">api-sports</span>{" "}
            football API lalu tekan <b>Join Club</b> untuk menyimpannya ke
            server sebagai Team milik kamu.
          </p>
        </header>

        <RunningData items={data} label="Clubs" />

        <form
          className="mt-6 flex flex-col gap-2 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 sm:flex-row sm:items-center"
          onSubmit={(e) => e.preventDefault()}
        >
          <label
            htmlFor="club-search"
            className="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Search
          </label>
          <input
            id="club-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_STEP);
            }}
            placeholder="Club name…"
            className="min-w-0 flex-1 rounded-lg bg-slate-950/70 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          />
          <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-bold tabular-nums text-slate-300 ring-1 ring-white/10">
            {clubs.length} clubs
          </span>
        </form>

        {clubs.length === 0 ? (
          <div className="rounded-2xl bg-white/5 py-12 text-center text-sm text-slate-400 ring-1 ring-white/10">
            No clubs match “{query}”.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.slice(0, visible).map((club) => {
              const isJoined = joined.includes(club.team?.id);
              return (
                <article
                  key={club.team?.id}
                  className="group relative flex w-full flex-col overflow-hidden rounded-2xl bg-slate-900/80 ring-1 shadow-lg shadow-slate-950/40 backdrop-blur-xl transition duration-300 ring-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/50 hover:ring-emerald-400/30"
                >
                  {isJoined && (
                    <span className="pointer-events-none absolute right-2.5 top-2.5 z-10 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-400/40">
                      ✓ Joined
                    </span>
                  )}

                  <div className="relative h-32 overflow-hidden">
                    {club.venue?.image ? (
                      <img
                        src={club.venue.image}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/60 via-teal-600/50 to-cyan-700/60" />
                    )}
                    <div className="absolute inset-0 bg-slate-950/55" />
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                    {club.team?.logo && (
                      <img
                        src={club.team.logo}
                        alt={club.team.name}
                        className="absolute bottom-3 left-4 h-12 w-12 rounded-full bg-white/10 object-contain p-1 ring-2 ring-white/20"
                      />
                    )}
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-200 ring-1 ring-white/20">
                      {club.team?.code ?? "—"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 px-4 py-3">
                    <h3 className="truncate text-sm font-black tracking-tight text-white">
                      {club.team?.name}
                    </h3>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Founded</span>
                      <span className="font-semibold tabular-nums text-slate-200">
                        {club.team?.founded ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Stadium</span>
                      <span className="truncate font-semibold text-slate-200">
                        {club.venue?.name ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">City</span>
                      <span className="truncate font-semibold text-slate-200">
                        {club.venue?.city ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Capacity</span>
                      <span className="font-semibold tabular-nums text-slate-200">
                        {club.venue?.capacity
                          ? club.venue.capacity.toLocaleString("en-US")
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <footer className="mt-auto border-t border-white/10 bg-black/10 px-3 py-2.5">
                    <button
                      type="button"
                      onClick={(e) => handleJoin(e, club.team?.id)}
                      disabled={isJoined}
                      aria-pressed={isJoined}
                      aria-label={`Join ${club.team?.name}`}
                      className={`w-full rounded-lg py-1.5 text-[11px] font-bold transition ${
                        isJoined
                          ? "cursor-default bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
                          : "bg-white/10 text-slate-300 ring-1 ring-white/20 hover:bg-emerald-500/15 hover:text-emerald-300"
                      }`}
                    >
                      {isJoined ? "Joined ✓" : "Join Club"}
                    </button>
                  </footer>
                </article>
              );
            })}
          </div>
        )}

        {clubs.length > visible && (
          <button
            type="button"
            onClick={() => setVisible(visible + PAGE_STEP)}
            className="mt-6 mx-auto flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-slate-200 ring-1 ring-white/20 transition hover:bg-white/20"
          >
            Show more clubs
            <span aria-hidden="true" className="text-slate-400">
              ({clubs.length - visible} remaining)
            </span>
          </button>
        )}
      </section>
    </>
  );
}
