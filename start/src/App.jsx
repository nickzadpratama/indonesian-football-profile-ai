import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import TeamsPage from "./pages/TeamsPage.jsx";
import PlayersPage from "./pages/PlayersPage.jsx";
import PlayerProfilePage from "./pages/PlayerProfilePage.jsx";
import MyTeamsPage from "./pages/MyTeamsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import UpdatePage from "./pages/UpdatePage.jsx";
import { getSession, logout } from "./auth/store.js";
import { getTeams } from "./api/football.js";
import { toast } from "./toast.js";
import BaseLayout from "./pages/BaseLayout.jsx";

const seasonFromParam = (raw) => {
  const year = Number(raw);
  return Number.isInteger(year) && year > 0 ? year : undefined;
};

/** /teams/:teamId — squad page. Deep links resolve the team entry from the cached API list. */
function SquadRoute() {
  const { teamId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [fetched, setFetched] = useState(null);

  // Team handed over via navigation state is used directly; deep links fall back
  // to resolving the entry from the (cached) teams list.
  const passed = location.state?.team ?? null;

  useEffect(() => {
    if (passed) return;
    let cancelled = false;
    getTeams("Indonesia")
      .then((list) => {
        if (cancelled) return;
        setFetched(
          list.find((entry) => String(entry.team?.id) === String(teamId)) ??
            null,
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [teamId, passed]);

  const season = seasonFromParam(
    new URLSearchParams(location.search).get("season"),
  );
  const team = passed ?? fetched ?? { team: { id: Number(teamId) }, venue: {} };

  return (
    <PlayersPage
      key={`${teamId}-${season ?? "auto"}`}
      team={team}
      season={season}
      onBack={() => (location.key === "default" ? navigate("/") : navigate(-1))}
      onSelect={(player, picked) =>
        navigate(`/players/${player.id}?season=${picked}`, {
          state: { player, team },
        })
      }
    />
  );
}

/** /players/:playerId — profile & statistics. Supports ?season= and deep links without state. */
function ProfileRoute() {
  const { playerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const season = seasonFromParam(searchParams.get("season"));
  const { player, team } = location.state ?? {};

  return (
    <PlayerProfilePage
      key={`${playerId}-${season ?? "auto"}`}
      player={player ?? { id: Number(playerId) }}
      team={team ?? null}
      season={season}
      onBack={() =>
        location.key === "default"
          ? navigate(team ? `/teams/${team.team?.id}` : "/")
          : navigate(-1)
      }
      onSelectSeason={(year) => setSearchParams({ season: String(year) })}
    />
  );
}

export default function App() {
  return (
    <>
      <Routes>
        {/* <Route path="/" element={<TeamsPage onSelect={openSquad} />} /> */}
        <Route element={<BaseLayout />}>
          <Route path="/" element={<TeamsPage />} />

          <Route path="/teams/:teamId" element={<SquadRoute />} />
          <Route path="/players/:playerId" element={<ProfileRoute />} />
          <Route
            path="/my-teams"
            element={<MyTeamsPage />}
            // element={<MyTeamsPage onSelect={openSquad} onBrowse={goTeams} />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* <Route
            path="/update"
            element={
              <UpdatePage
                key={session?.email ?? "guest"}
                user={session}
                onBack={() => navigate(-1)}
                onNeedLogin={() =>
                  navigate("/login", { state: { from: "/update" } })
                }
              />
            }
          /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}
