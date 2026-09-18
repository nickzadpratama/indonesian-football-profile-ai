import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MyTeamCard from "../components/MyTeamCard.jsx";
import { Loader, ErrorPanel } from "../components/Status.jsx";
import { toastifyError } from "../utils/toastify.js";
import axios from "axios";
import { API_BASE_URL, authHeaders } from "../api/auth.js";
import { decodeToken } from "../auth/session.js";

/** Shows every team you joined (saved on the server) as a MyTeamCard. */
export default function MyTeamsPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("loading"); // 'loading' | 'ok' | 'error'
  const [reloadKey, setReloadKey] = useState(0);
  const userId = decodeToken()?.id;

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`http://localhost:3000`, {
        headers: {
          Authorization: `Bearer ${localStorage.access_token}`,
        },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setTeams(data.data ?? []);
        setPhase("ok");
      })
      .catch((error) => {
        if (cancelled) return;
        console.log(error?.response?.data);
        const message = error?.response?.data?.message ?? error?.message;
        setError(message);
        setPhase("error");
        toastifyError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setPhase("loading");
    setReloadKey((key) => key + 1);
  };

  const myTeams = teams.filter((team) => team.UserId === userId);

  return (
    <section className="pt-2">
      <header className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-2xl shadow-lg shadow-emerald-500/20 ring-2 ring-white/20">
          🏠
        </span>
        <h1 className="mt-4 bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-3xl font-black tracking-tight text-transparent">
          My Teams
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          The clubs you joined from the{" "}
          <span className="font-semibold text-slate-300">api-sports</span>{" "}
          list — saved on the server as your teams.
        </p>
      </header>

      <div className="mt-6 flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          My teams
        </span>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold tabular-nums text-emerald-300 ring-1 ring-emerald-400/30">
          {myTeams.length} team{myTeams.length === 1 ? "" : "s"}
        </span>
      </div>

      {phase === "loading" && (
        <div className="mt-6">
          <Loader label="Fetching your teams…" />
        </div>
      )}
      {phase === "error" && (
        <div className="mt-6">
          <ErrorPanel message={error} onRetry={reload} />
        </div>
      )}
      {phase === "ok" &&
        (myTeams.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-white/5 py-14 text-center ring-1 ring-white/10">
            <span aria-hidden="true" className="text-3xl">
              🗳️
            </span>
            <p className="text-sm font-semibold text-slate-300">
              No joined teams yet
            </p>
            <p className="text-xs text-slate-500">
              Open the Teams page and press the ▲ button on a team card — it
              will show up here.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-1 rounded-lg bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30 transition hover:bg-emerald-500/25"
            >
              Browse teams →
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {myTeams.map((team) => (
              <MyTeamCard
                key={team.id}
                team={team}
                onUpdate={() => navigate(`/myTeam/update/${team.id}`)}
              />
            ))}
          </div>
        ))}
    </section>
  );
}
