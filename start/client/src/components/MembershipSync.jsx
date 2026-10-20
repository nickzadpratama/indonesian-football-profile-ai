import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import useSessionToken from "../auth/useSessionToken.js";
import { isTokenValid } from "../auth/session.js";
import { fetchMemberships, setMembershipSession } from "../features/membership/membershipSlice.js";

export default function MembershipSync() {
  const token = useSessionToken();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const session = isTokenValid(token) ? token : "";
    dispatch(setMembershipSession(session));
    const refresh = () => {
      if (session) dispatch(fetchMemberships(session));
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [dispatch, token, pathname]);

  return null;
}
