import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useSessionToken from "../auth/useSessionToken.js";
import { isTokenValid } from "../auth/session.js";
import { changeMembership, fetchMemberships } from "../features/membership/membershipSlice.js";
import { toastifyError } from "../utils/toastify.js";
import LoadingIndicator from "./LoadingIndicator.jsx";

export default function MembershipButton({ teamId, name, allowLeave = false }) {
  const token = useSessionToken();
  const state = useSelector((store) => store.membership);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const joined = state.session === token && Boolean(state.items[teamId]);
  const loading = state.session !== token || state.phase === "idle" || state.phase === "loading";
  const pending = Boolean(state.pending[teamId]);
  const error = state.errors[teamId];

  const act = () => {
    if (!isTokenValid(token)) {
      toastifyError("Silakan login untuk bergabung dengan fan club.");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (state.phase === "error") {
      dispatch(fetchMemberships(token));
      return;
    }
    if (joined && (!allowLeave || !window.confirm(`Leave ${name} Fans Club?`))) return;
    dispatch(changeMembership({ token, teamId, leave: joined }));
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={act}
        disabled={loading || pending || (joined && !allowLeave) || !teamId}
        aria-busy={loading || pending}
        aria-label={`${joined ? (allowLeave ? "Leave Fans Club" : "Joined Fans Club") : "Join Fans Club"}: ${name}`}
        className="rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/30 transition hover:bg-emerald-500/25 disabled:cursor-default disabled:opacity-60"
      >
        {(loading || pending) && (
          <LoadingIndicator
            label={loading ? "Checking membership…" : joined ? "Leaving…" : "Joining…"}
            className="mr-1 h-8 w-8"
          />
        )}
        {loading ? "Checking membership…" : pending ? (joined ? "Leaving…" : "Joining…")
          : state.phase === "error" ? "Retry membership check"
            : joined ? (allowLeave ? "Leave Fans Club" : "Joined ✓") : "Join Fans Club"}
      </button>
      {joined && !allowLeave && (
        <Link to="/myTeam" className="text-xs font-semibold text-emerald-300 underline underline-offset-2">
          View My Teams →
        </Link>
      )}
      {error && <p role="alert" className="max-w-64 text-xs text-rose-300">{error} Membership may have changed; retry or refresh to verify.</p>}
      {state.phase === "error" && <p role="alert" className="max-w-64 text-xs text-rose-300">{state.error}</p>}
    </div>
  );
}
