// Lightweight localStorage-backed auth store (demo only — no real backend).
const USERS_KEY = "football_hub_users";
const SESSION_KEY = "football_hub_session";
const AUTH_EVENT = "football-hub-auth";

function read(key, fallback) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function dispatchAuth() {
  try {
    if (typeof window !== "undefined")
      window.dispatchEvent(new Event(AUTH_EVENT));
  } catch {
    /* ignore */
  }
}

function setSession(user) {
  if (typeof localStorage === "undefined") return;
  if (user) write(SESSION_KEY, user);
  else localStorage.removeItem(SESSION_KEY);
  dispatchAuth();
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export function getSession() {
  return read(SESSION_KEY, null);
}

function getUsers() {
  return read(USERS_KEY, []);
}

/** Create a new account → auto sign-in. Returns { ok, error?, user? }. */
export function register({ name, email, password, confirmPassword }) {
  name = (name ?? "").trim();
  email = (email ?? "").trim();
  if (name.length < 2)
    return {
      ok: false,
      error: "Please enter your full name (min 2 characters).",
    };
  if (!EMAIL_RE.test(email))
    return { ok: false, error: "Please enter a valid email address." };
  if ((password ?? "").length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  if (password !== confirmPassword)
    return { ok: false, error: "Passwords do not match." };
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user = { name, email, password };
  users.push(user);
  write(USERS_KEY, users);
  setSession({ name, email });
  return { ok: true, user: { name, email } };
}

/** Sign in with email + password. Returns { ok, error?, user? }. */
export function login({ email, password }) {
  email = (email ?? "").trim();
  const user = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (!user || user.password !== password)
    return { ok: false, error: "Invalid email or password." };
  setSession({ name: user.name, email: user.email });
  return { ok: true, user: { name: user.name, email: user.email } };
}

/** Clear the current session. */
export function logout() {
  try {
    if (typeof localStorage !== "undefined")
      localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  dispatchAuth();
}

/**
 * Edit the signed-in profile. Requires the current password to confirm.
 * Returns { ok, error?, user? }.
 */
export function updateUser({
  currentPassword,
  name,
  email,
  newPassword,
  confirmPassword,
}) {
  const session = getSession();
  if (!session)
    return {
      ok: false,
      error: "You must be signed in to update your profile.",
    };
  name = (name ?? "").trim();
  email = (email ?? "").trim();
  const users = getUsers();
  const index = users.findIndex(
    (u) => u.email.toLowerCase() === session.email.toLowerCase(),
  );
  if (index === -1) return { ok: false, error: "Account not found." };
  const user = users[index];
  if (user.password !== currentPassword)
    return { ok: false, error: "Current password is incorrect." };
  if (name.length < 2)
    return { ok: false, error: "Name must be at least 2 characters." };
  if (!EMAIL_RE.test(email))
    return { ok: false, error: "Please enter a valid email address." };
  if (
    email.toLowerCase() !== user.email.toLowerCase() &&
    users.some((u) => u.email.toLowerCase() === email.toLowerCase())
  ) {
    return { ok: false, error: "That email is already in use." };
  }
  if (newPassword && newPassword.length < 6)
    return { ok: false, error: "New password must be at least 6 characters." };
  if (newPassword && newPassword !== confirmPassword)
    return { ok: false, error: "New passwords do not match." };
  user.name = name;
  user.email = email;
  if (newPassword) user.password = newPassword;
  write(USERS_KEY, users);
  setSession({ name, email });
  return { ok: true, user: { name, email } };
}
