// Auth API client — Football Hub server (football.nickz.online).
//
// SEMUA request auth lewat modul ini supaya base URL-nya cuma ada satu
// tempat. Sebelumnya URL http:// di-hardcode di tiap halaman, padahal app
// dibuka dari origin https (vite dev server memakai basicSsl) — browser
// MEMBLOKIR request http:// dari halaman https (mixed content), dan itulah
// penyebab login/register selalu gagal walau servernya hidup.
//
// Development uses the same-origin Vite /api proxy. Production defaults to
// HTTPS; VITE_API_URL can override either environment (see .env.example).
import axios from "axios";
import { getToken } from "../auth/session.js";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "/api" : "https://football.nickz.online")
).replace(/\/+$/, "");

/** Header Authorization untuk endpoint yang butuh login. */
export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** POST /register → { message, data: { id, username, email } }. */
export async function registerUser({ username, email, password }) {
  const { data } = await axios.post(`${API_BASE_URL}/register`, {
    username,
    email,
    password,
  });
  return data;
}

/** POST /login → { access_token }. */
export async function loginUser({ email, password }) {
  const { data } = await axios.post(`${API_BASE_URL}/login`, {
    email,
    password,
  });
  return data;
}

/** POST /google-login → { access_token } (credential = ID token Google). */
export async function loginWithGoogle(credential) {
  const { data } = await axios.post(
    `${API_BASE_URL}/google-login`,
    {},
    { headers: { token: credential } },
  );
  return data;
}

/** POST /facebook-login → { access_token } (accessToken dari FB.login). */
export async function loginWithFacebook(accessToken) {
  const { data } = await axios.post(
    `${API_BASE_URL}/facebook-login`,
    {},
    { headers: { token: accessToken } },
  );
  return data;
}