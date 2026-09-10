import { useEffect, useState } from "react";
// import { getTeams } from "../api/football.js";
import TeamCard from "../components/TeamCard.jsx";
import { Loader, ErrorPanel } from "../components/Status.jsx";
import gifLoading from "../components/assets/vecteezy_loading-bar-progress-with-green-color-vector-illustration_14945926.svg";
import Toastify from "toastify-js";
import axios from "axios";

const PAGE_STEP = 18;

export default function TeamsPage({ onSelect }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState("loading"); // 'loading' | 'ok' | 'error'
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_STEP);
  const [teamChoose, setTeamChoose] = useState({
    name: "",
    code: "",
    logo: "",
    founded: 0,
    stadium: "",
    city: "",
    capacity: 0,
    image: "",
  });
  // const [teamName, setTeamName] = useState()

  async function fetchTeams() {
    try {
      setLoading(true);
      const result = await fetch(
        "https://v3.football.api-sports.io/teams?country=indonesia",
        {
          method: "GET",
          headers: {
            "x-apisports-key": "51a6f63d7c6835b341a49be3985f148c", // <-- Ganti dengan API key Anda
          },
        },
      );

      const data = await result.json();
      setTeams(data.response);
      console.log(data.response, teams);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e, infoId) {
    try {
      // e.preventDefault();
      setLoading(true);
      const result = await fetch(
        `https://v3.football.api-sports.io/teams?id=${infoId}`,
        {
          method: "GET",
          headers: {
            "x-apisports-key": "51a6f63d7c6835b341a49be3985f148c", // <-- Ganti dengan API key Anda
          },
        },
      );

      const data = await result.json();
      postJoin(e, data.response);
      Toastify({
        text: "Success Join Clubs",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true,
        style: {
          background: "#34D399",
          color: "black",
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    } catch (error) {
      console.log(error);
      Toastify({
        text: "Data not found",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true,
        style: {
          background: "#F87171",
          color: "black",
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    }
  }

  async function postJoin(e, team) {
    try {
      e.preventDefault();
      setTeamChoose({ name: team.team.name });
      setTeamChoose({ code: team.team.code });
      setTeamChoose({ logo: team.team.logo });
      setTeamChoose({ founded: team.team.founded });
      setTeamChoose({ stadium: team.team.stadium });
      setTeamChoose({ city: team.team.city });
      setTeamChoose({ capacity: team.team.capacity });
      setTeamChoose({ image: team.team.image });

      await axios.post(
        `/`,
        { teamChoose },
        {
          headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
          },
        },
      );

      Toastify({
        text: "Success Join Clubs",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true,
        style: {
          background: "#34D399",
          color: "black",
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    } catch (error) {
      console.log(error);
      Toastify({
        text: "Data not found",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true,
        style: {
          background: "#F87171",
          color: "black",
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    }
  }

  // useEffect(() => {
  //   getTeams("Indonesia")
  //     .then((list) => {
  //       if (cancelled) return;
  //       setError(null);
  //       setTeams(list);
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
  // }, [reloadKey]);

  function handleSearch(e) {
    e.preventDefault();
    fetchTeams();
  }

  const reload = () => {
    setPhase("loading");
    setVisible(PAGE_STEP);
    setReloadKey((key) => key + 1);
  };

  const term = query.trim().toLowerCase();
  const filtered = (teams ?? []).filter((t) => {
    if (!term) return true;
    const teamName = t.team?.name?.toLowerCase() || "";
    return teamName.includes(term);
  });

  useEffect(() => {
    fetchTeams();
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
        <section className="pt-2">
          {/* Heading */}
          <header className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-2xl shadow-lg shadow-emerald-500/20 ring-2 ring-white/20">
              ⚽
            </span>
            <h1 className="mt-4 bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-3xl font-black tracking-tight text-transparent">
              Indonesian Football Teams
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              All clubs from the{" "}
              <span className="font-semibold text-slate-300">api-sports</span>{" "}
              football API. Pick a team to open its squad, then a player to see
              full profile &amp; statistics.
            </p>
          </header>

          <form
            className="mt-6 flex flex-col gap-2 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 sm:flex-row sm:items-center"
            onSubmit={handleSearch}
          >
            <label
              htmlFor="team-search"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Search
            </label>
            <input
              id="team-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisible(PAGE_STEP);
              }}
              placeholder="Team name, code or city…"
              className="min-w-0 flex-1 rounded-lg bg-slate-950/70 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
            />
            {/* <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-bold tabular-nums text-slate-300 ring-1 ring-white/10">
              {teams ? `${filtered.length} / ${teams.length} teams` : "…"}
            </span> */}
          </form>
          {/* Search */}
          {/* <div className="mt-6 flex flex-col gap-2 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 sm:flex-row sm:items-center">
            <label
              htmlFor="team-search"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Search
            </label>
            <input
              id="team-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisible(PAGE_STEP);
              }}
              placeholder="Team name, code or city…"
              className="min-w-0 flex-1 rounded-lg bg-slate-950/70 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
            />
            <span className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs font-bold tabular-nums text-slate-300 ring-1 ring-white/10">
              {teams ? `${filtered.length} / ${teams.length} teams` : "…"}
            </span>
          </div> */}

          {/* Content */}
          {/* {phase === "loading" && <Loader label="Fetching Indonesian teams…" />}
          {phase === "error" && <ErrorPanel message={error} onRetry={reload} />}
          {phase === "ok" && ( */}
          <>
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white/5 py-12 text-center text-sm text-slate-400 ring-1 ring-white/10">
                No teams match “{query}”.
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.slice(0, visible).map((team) => (
                  <TeamCard
                    // key={team.team?.id}
                    key={team.id}
                    team={team}
                    handleJoin={handleJoin}
                    onClick={() => onSelect(team)}
                  />
                ))}
              </div>
            )}

            {filtered.length > visible && (
              <button
                type="button"
                onClick={() => setVisible(visible + PAGE_STEP)}
                className="mt-6 mx-auto flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-slate-200 ring-1 ring-white/20 transition hover:bg-white/20"
              >
                Show more teams
                <span aria-hidden="true" className="text-slate-400">
                  ({filtered.length - visible} remaining)
                </span>
              </button>
            )}
          </>
          {/* )} */}
        </section>
      )}
    </>
  );
}
