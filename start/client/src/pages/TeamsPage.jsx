import { useEffect, useState } from "react";
// import { getTeams } from "../api/football.js";
import TeamCard from "../components/TeamCard.jsx";
import { fetchTeams } from "../features/team/teamSlice.js";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const PAGE_STEP = 18;

export default function TeamsPage() {
  // const [teams, setTeams] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_STEP);
  const { data } = useSelector((state) => state.team);
  // console.log(object);

  const dispatch = useDispatch();
  // const [teamName, setTeamName] = useState()

  // if (loading) {
  //   return (
  //     <div className="flex justify-center mt-28">
  //       <img src={gifLoading} className="w-1/5" />
  //     </div>
  //   );
  // }

  // if (error) {
  //   console.log(error?.response);
  //   return toastifyError(error?.response?.data?.message);
  // }

  // async function handleJoin(e, infoId) {
  //   e.preventDefault();
  //   try {
  //     console.log(infoId);
  //     const result = await fetch(
  //       `https://v3.football.api-sports.io/teams?id=${infoId}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "x-apisports-key": "51a6f63d7c6835b341a49be3985f148c", // <-- Ganti dengan API key Anda
  //         },
  //       },
  //     );

  //     const data = await result.json();
  //     postJoin(e, data.response);
  //     Toastify({
  //       text: "Success Join Clubs",
  //       duration: 3000,
  //       newWindow: true,
  //       close: true,
  //       gravity: "bottom", // `top` or `bottom`
  //       position: "right", // `left`, `center` or `right`
  //       stopOnFocus: true,
  //       style: {
  //         background: "#34D399",
  //         color: "black",
  //       },
  //       onClick: function () {}, // Callback after click
  //     }).showToast();
  //   } catch (error) {
  //     console.log(error?.response?.data);
  //     toastifyError(error?.response?.data);
  //   }
  // }

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

  // const reload = () => {
  //   setPhase("loading");
  //   setVisible(PAGE_STEP);
  //   setReloadKey((key) => key + 1);
  // };

  // const term = query.trim().toLowerCase();
  // const data = (data ?? []).filter((t) => {
  //   if (!term) return true;
  //   const teamName = t.team?.name?.toLowerCase() || "";
  //   return teamName.includes(term);
  // });

  // useEffect(() => {
  //   fetchTeams();
  // }, []);

  useEffect(() => {
    // fetchPlayer();
    dispatch(fetchTeams());
  }, [dispatch]);

  return (
    <>
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
          // onSubmit={handleSearch}
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
              {teams ? `${data.length} / ${teams.length} teams` : "…"}
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
              {teams ? `${data.length} / ${teams.length} teams` : "…"}
            </span>
          </div> */}

        {/* Content */}
        {/* {phase === "loading" && <Loader label="Fetching Indonesian teams…" />}
          {phase === "error" && <ErrorPanel message={error} onRetry={reload} />}
          {phase === "ok" && ( */}
        <>
          {data.length === 0 ? (
            <div className="rounded-2xl bg-white/5 py-12 text-center text-sm text-slate-400 ring-1 ring-white/10">
              No teams match “{query}”.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.slice(0, visible).map((team) => (
                <TeamCard
                  // key={team.team?.id}
                  key={team.team?.id}
                  team={team}
                  // onClick={() => onSelect(team)}
                />
              ))}
            </div>
          )}

          {data.length > visible && (
            <button
              type="button"
              onClick={() => setVisible(visible + PAGE_STEP)}
              className="mt-6 mx-auto flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-slate-200 ring-1 ring-white/20 transition hover:bg-white/20"
            >
              Show more teams
              <span aria-hidden="true" className="text-slate-400">
                ({data.length - visible} remaining)
              </span>
            </button>
          )}
        </>
        {/* )} */}
      </section>
    </>
  );
}
