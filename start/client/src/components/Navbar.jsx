// import { Link, NavLink } from "react-router";
import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
// import TeamsPage from "./pages/TeamsPage.jsx";
// import PlayersPage from "./pages/PlayersPage.jsx";
// import PlayerProfilePage from "./pages/PlayerProfilePage.jsx";
// import MyTeamsPage from "./pages/MyTeamsPage.jsx";
// import LoginPage from "./pages/LoginPage.jsx";
// import RegisterPage from "./pages/RegisterPage.jsx";
// import UpdatePage from "./pages/UpdatePage.jsx";
import { clearToken, getCurrentUser } from "../auth/session.js";
import { toast } from "../toast.js";

/** Shared dark-mode form input with floating label. */
export default function Navbar() {
  // Sesi asli dari JWT di localStorage (sebelumnya memakai store demo
  // src/auth/store.js, sehingga header tetap "Sign in" walau sudah login).
  const [user, setUser] = useState(() => getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  const signOut = () => {
    clearToken();
    setUser(null);
    toast("Signed out. See you soon!", "neutral");
    navigate("/login");
  };

  const navClass = (active) =>
    `rounded-lg px-3 py-1.5 text-xs font-bold transition ${
      active
        ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
        : "bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10"
    }`;

  const isViewingTeamPages =
    location.pathname.startsWith("/teams") ||
    location.pathname.startsWith("/players");
  return (
    <>
      <nav className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex items-center gap-1.5">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2 text-sm font-black tracking-tight text-white ring-1 ring-white/10 transition hover:bg-white/10"
          >
            <span aria-hidden="true" className="text-base">
              ⚽
            </span>
            Football Hub
          </Link>
          <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
            Teams
          </NavLink>
          <NavLink
            to="/myTeam"
            className={({ isActive }) => navClass(isActive)}
          >
            My Teams
          </NavLink>
        </div>

        <div className="flex items-center gap-1.5">
          {isViewingTeamPages && (
            <Link to="/" className={navClass(false)}>
              ← All teams
            </Link>
          )}
          {user ? (
            <>
              <span className="hidden items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 ring-1 ring-white/10 sm:flex">
                <span aria-hidden="true">👤</span>
                <span className="max-w-[9rem] truncate">{session.name}</span>
              </span>
              <NavLink
                to="/update"
                className={({ isActive }) => navClass(isActive)}
                title="Edit your profile"
              >
                ✎ Edit
              </NavLink>
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-bold text-rose-300 ring-1 ring-rose-400/30 transition hover:bg-rose-500/20"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => navClass(isActive)}
              >
                Sign in
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) => navClass(isActive)}
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
