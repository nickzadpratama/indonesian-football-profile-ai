import {
  BrowserRouter,
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
// import MyTeamsPage from "./pages/MyTeamsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

import BaseLayout from "./layouts/BaseLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";

const seasonFromParam = (raw) => {
  const year = Number(raw);
  return Number.isInteger(year) && year > 0 ? year : undefined;
};

/** /teams/:teamId — squad page. Deep links resolve the team entry from the cached API list. */

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
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<BaseLayout />}>
            <Route path="/" element={<TeamsPage />} />

            {/* <Route path="/:teamId" element={<SquadRoute />} /> */}
            <Route path="/team/:teamId" element={<PlayersPage />} />
            <Route path="/players/:playerId" element={<ProfileRoute />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
