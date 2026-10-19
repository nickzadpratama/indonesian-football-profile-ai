import axios from "axios";
import { getToken } from "../auth/session.js";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "/api" : "https://football.nickz.online")
).replace(/\/+$/, "");

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerUser({ username, email, password }) {
  const { data } = await axios.post(`${API_BASE_URL}/register`, {
    username,
    email,
    password,
  });
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await axios.post(`${API_BASE_URL}/login`, {
    email,
    password,
  });
  return data;
}

export async function loginWithGoogle(credential) {
  const { data } = await axios.post(
    `${API_BASE_URL}/google-login`,
    {},
    { headers: { token: credential } },
  );
  return data;
}

export async function loginWithFacebook(accessToken) {
  const { data } = await axios.post(
    `${API_BASE_URL}/facebook-login`,
    {},
    { headers: { token: accessToken } },
  );
  return data;
}
