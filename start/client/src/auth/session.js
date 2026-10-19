const TOKEN_KEY = "access_token";
const AUTH_CHANGE_EVENT = "football-hub:auth-change";

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export function getToken() {
  try {
    if (typeof localStorage === "undefined") return "";
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveToken(token) {
  try {
    if (typeof localStorage === "undefined" || !token) return;
    localStorage.setItem(TOKEN_KEY, token);
    notifyAuthChange();
  } catch {
    return;
  }
}

export function clearToken() {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    notifyAuthChange();
  } catch {
    return;
  }
}

export function subscribeToAuthChanges(callback) {
  if (typeof window === "undefined") return () => {};

  let expiryTimer;
  const sync = () => {
    clearTimeout(expiryTimer);
    callback();
    const token = getToken();
    if (token && !isTokenValid(token)) {
      purgeInvalidToken();
      return;
    }
    const exp = decodeToken(token)?.exp;
    if (token && typeof exp === "number" && Number.isFinite(exp)) {
      const remaining = exp * 1000 - Date.now();
      expiryTimer = setTimeout(sync, Math.min(Math.max(remaining, 0), 2147483647));
    }
  };
  const onStorage = (event) => {
    if (event.key === TOKEN_KEY || event.key === null) sync();
  };
  window.addEventListener(AUTH_CHANGE_EVENT, sync);
  window.addEventListener("storage", onStorage);
  sync();
  return () => {
    clearTimeout(expiryTimer);
    window.removeEventListener(AUTH_CHANGE_EVENT, sync);
    window.removeEventListener("storage", onStorage);
  };
}

export function decodeToken(token = getToken()) {
  try {
    const part = String(token).split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenValid(token = getToken()) {
  const payload = decodeToken(token);
  if (!payload) return false;
  if (!payload.exp) return true;
  return payload.exp * 1000 > Date.now();
}

export function getCurrentUser(token = getToken()) {
  const payload = decodeToken(token);
  if (!payload || !isTokenValid(token)) return null;
  const email = payload.email ?? "";
  return {
    id: payload.id,
    email,
    name: payload.username ?? email.split("@")[0] ?? "Player",
  };
}

export function purgeInvalidToken() {
  const token = getToken();
  if (token && !isTokenValid(token)) clearToken();
}
