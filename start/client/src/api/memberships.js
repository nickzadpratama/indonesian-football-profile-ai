import axios from "axios";
import { API_BASE_URL } from "./auth.js";

export async function membershipRequest(token, method, teamId) {
  const { data } = await axios({
    method,
    url: `${API_BASE_URL}/me/fan-clubs${teamId == null ? "" : `/${encodeURIComponent(teamId)}`}`,
    headers: { Authorization: `Bearer ${token}` },
    timeout: 15000,
  });
  return data?.data;
}