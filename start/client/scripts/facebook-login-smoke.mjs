import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

// No real SDK, account, API, env file, or database is used by this test.
const root = fileURLToPath(new URL("../", import.meta.url));
const profile = await mkdtemp(path.join(tmpdir(), "facebook-smoke-chrome-"));
const mocks = `
export function GoogleLogin() { return null; }
export default function Toastify() { return { showToast() {} }; }
export async function loginUser() { throw new Error("Unexpected email login"); }
export async function loginWithGoogle() { throw new Error("Unexpected Google login"); }
export async function loginWithFacebook(token) {
  window.testState.requests.push(token);
  if (window.testState.apiError) throw window.testState.apiError;
  if (window.testState.deferApi) return new Promise(resolve => { window.testState.resolveApi = resolve; });
  return window.testState.apiResponse;
}
export function saveToken(token) { window.testState.saved.push(token); }
`;
const harness = `
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "/src/pages/LoginPage.jsx";

const results = [];
let app;
let sdkMode = "ready";
let fastLoginTimeout = false;
const nativeTimeout = window.setTimeout.bind(window);
window.setTimeout = (fn, ms, ...args) => nativeTimeout(fn,
  ms === 15000 || (ms === 60000 && fastLoginTimeout) ? 80 : ms, ...args);
const delay = ms => new Promise(resolve => nativeTimeout(resolve, ms));
const check = (ok, message) => { if (!ok) throw new Error(message); };
const waitFor = async predicate => {
  for (let i = 0; i < 200; i++) {
    if (predicate()) return;
    await delay(10);
  }
  throw new Error("Timed out waiting for UI: " + document.body.textContent.slice(-800));
};
const state = window.testState = {};
const fb = {
  init(options) { state.inits.push(options); },
  login(callback, options) { state.callbacks.push(callback); state.scopes.push(options.scope); },
};
// Intercept the application's script insertion: never contact Facebook.
const append = document.body.appendChild.bind(document.body);
document.body.appendChild = element => {
  if (element.id !== "facebook-jssdk") return append(element);
  state.scripts++;
  // An inert script keeps the real library's duplicate-script guard exercised.
  element.type = "application/json";
  element.removeAttribute("src");
  const result = append(element);
  if (sdkMode !== "timeout") nativeTimeout(() => {
    if (sdkMode === "fail") element.onerror?.(new Event("error"));
    else { window.FB = fb; element.onload?.(new Event("load")); }
  }, 0);
  return result;
};
function Destination() {
  return <p data-destination={useLocation().pathname}>Logged in</p>;
}
const button = () => [...document.querySelectorAll("button")].find(node =>
  /Facebook/.test(node.textContent));
const reset = async (userAgent = "Smoke desktop") => {
  app?.unmount();
  await delay(0);
  Object.assign(state, {
    requests: [], saved: [], callbacks: [], scopes: [], inits: [], scripts: 0,
    apiError: null, apiResponse: { access_token: "mock-application-jwt" }, deferApi: false,
  });
  Object.defineProperty(navigator, "userAgent", { configurable: true, value: userAgent });
  app = createRoot(document.getElementById("root"));
  app.render(<StrictMode><MemoryRouter initialEntries={[{
    pathname: "/login", state: { from: "/after-login" },
  }]}><Routes><Route path="/login" element={<LoginPage />} />
    <Route path="/after-login" element={<Destination />} />
  </Routes></MemoryRouter></StrictMode>);
  await waitFor(() => button() && !button().disabled);
};
const start = async () => {
  const count = state.callbacks.length;
  button().click();
  await waitFor(() => state.callbacks.length === count + 1);
  return state.callbacks.at(-1);
};
const run = async (name, fn) => {
  try { await fn(); results.push({ name, passed: true }); }
  catch (error) { results.push({ name, passed: false, error: error.message }); }
};
try {
  sdkMode = ${JSON.stringify(process.env.FACEBOOK_SMOKE_SDK_MODE || "ready")};
  if (sdkMode === "unconfigured") {
    app = createRoot(document.getElementById("root"));
    app.render(<StrictMode><MemoryRouter><LoginPage /></MemoryRouter></StrictMode>);
    await run("missing App ID disables Facebook login without loading SDK", async () => {
      await waitFor(() => button()?.textContent === "Facebook login not configured");
      check(button().disabled && !document.getElementById("facebook-jssdk"), "Unconfigured login enabled");
    });
  } else if (sdkMode === "fail" || sdkMode === "timeout") {
    app = createRoot(document.getElementById("root"));
    Object.assign(state, { requests: [], saved: [], callbacks: [], scopes: [], inits: [], scripts: 0 });
    app.render(<StrictMode><MemoryRouter><LoginPage /></MemoryRouter></StrictMode>);
    await run("SDK failure/timeout exposes a safe retry", async () => {
      await waitFor(() => button()?.textContent === "Retry Facebook connection");
      check(!button().disabled && state.requests.length === 0, "Unsafe SDK failure");
      check(!document.getElementById("facebook-jssdk"), "Failed script not removed");
      sdkMode = "ready";
      button().click();
      await waitFor(() => button()?.textContent.includes("Continue with Facebook"));
      check(state.scripts === 2, "Retry did not insert a fresh SDK");
      check(state.callbacks.length === 0, "Retry unexpectedly opened a popup");
    });
  } else {
    await run("success preserves token mapping, scope, redirect and single SDK under StrictMode", async () => {
      await reset();
      check(state.scripts === 1, "Duplicate SDK");
      check(state.inits[0].version === "v23.0" && state.inits[0].cookie, "SDK options changed");
      const callback = await start();
      button().click();
      check(state.callbacks.length === 1, "Double click opened two logins");
      callback({ authResponse: { accessToken: "mock-facebook-token", userID: "mock-user" } });
      await waitFor(() => document.querySelector("[data-destination]"));
      check(state.requests.join() === "mock-facebook-token", "Incorrect backend token");
      check(state.saved.join() === "mock-application-jwt", "Incorrect saved session");
      check(state.scopes[0] === "public_profile,email", "Scope changed");
      check(document.querySelector("[data-destination]").dataset.destination === "/after-login", "Wrong redirect");
    });
    await run("cancel is recoverable; remount does not inject SDK again", async () => {
      await reset();
      check(state.scripts === 0 && document.querySelectorAll("#facebook-jssdk").length === 1, "Duplicate SDK on remount");
      (await start())({ status: "unknown" });
      await waitFor(() => button() && !button().disabled);
      check(document.body.textContent.includes("cancelled"), "Missing cancel message");
      check(state.requests.length === 0 && state.saved.length === 0, "Cancel authenticated");
    });
    await run("missing access token cannot call backend", async () => {
      await reset();
      (await start())({ authResponse: { userID: "mock-user" } });
      await waitFor(() => button() && !button().disabled);
      check(state.requests.length === 0 && document.body.textContent.includes("did not return an access token"), "Invalid token accepted");
    });
    await run("missing SDK and synchronous popup errors release pending state", async () => {
      await reset();
      window.FB = undefined;
      try {
        button().click();
        await waitFor(() => document.body.textContent.includes("SDK is not ready") && !button().disabled);
        check(state.requests.length === 0, "Missing SDK called backend");
      } finally { window.FB = fb; }
      await delay(20);
      const login = fb.login;
      fb.login = () => { throw new Error("Popup could not be opened"); };
      try {
        button().click();
        await waitFor(() => document.body.textContent.includes("Popup could not be opened") && !button().disabled);
        check(state.requests.length === 0 && document.body.textContent.includes("Popup could not be opened"), "Popup exception not handled");
      } finally { fb.login = login; }
    });
    await run("backend rejection and missing session do not authenticate", async () => {
      await reset();
      state.apiError = { response: { data: { message: "Facebook email permission required" } } };
      (await start())({ authResponse: { accessToken: "mock-facebook-token" } });
      await waitFor(() => button() && !button().disabled);
      check(state.saved.length === 0 && document.body.textContent.includes("email permission required"), "Backend failure ignored");
      state.apiError = null;
      state.apiResponse = {};
      (await start())({ authResponse: { accessToken: "mock-facebook-token" } });
      await waitFor(() => button() && !button().disabled);
      check(state.saved.length === 0 && document.body.textContent.includes("did not return a login session"), "Empty session accepted");
    });
    await run("timeout ignores old callbacks during a new attempt", async () => {
      await reset();
      fastLoginTimeout = true;
      const oldCallback = await start();
      await waitFor(() => button() && !button().disabled);
      fastLoginTimeout = false;
      const currentCallback = await start();
      oldCallback({ authResponse: { accessToken: "stale-token" } });
      await delay(20);
      check(state.requests.length === 0, "Stale callback authenticated new attempt");
      currentCallback({ status: "unknown" });
      await waitFor(() => button() && !button().disabled);
    });
    await run("late callback after unmount is ignored", async () => {
      await reset();
      const callback = await start();
      app.unmount(); app = null;
      callback({ authResponse: { accessToken: "stale-token" } });
      await delay(20);
      check(state.requests.length === 0 && state.saved.length === 0, "Unmounted login authenticated");
    });
    await run("backend response after unmount cannot save a session", async () => {
      await reset();
      state.deferApi = true;
      (await start())({ authResponse: { accessToken: "mock-facebook-token" } });
      await waitFor(() => state.resolveApi);
      app.unmount(); app = null;
      state.resolveApi({ access_token: "late-session" });
      await delay(20);
      check(state.saved.length === 0, "Unmounted API response saved a session");
    });
    await run("Facebook/Instagram browser preserves SDK flow without OAuth redirect", async () => {
      await reset("Smoke FBAN Instagram");
      (await start())({ status: "unknown" });
      await waitFor(() => button() && !button().disabled);
      check(location.pathname === "/__facebook-smoke.html", "Unexpected OAuth redirect");
    });
  }
} catch (error) { results.push({ name: "harness", passed: false, error: error.message }); }
app?.unmount();
window.smokeResults = results;
`;

let chrome;
let socket;
const pending = new Map();
const server = await createServer({
  root,
  configFile: false,
  envDir: false,
  cacheDir: path.join(profile, "vite-cache"),
  define: {
    "import.meta.env.VITE_FACEBOOK_APP_ID": JSON.stringify(
      process.env.FACEBOOK_SMOKE_SDK_MODE === "unconfigured" ? "" : "smoke-test-app",
    ),
  },
  plugins: [
    {
      name: "facebook-smoke-mocks",
      enforce: "pre",
      transform(code, id) {
        if (!id.endsWith("/src/pages/LoginPage.jsx")) return;
        return code
          .replace('from "@react-oauth/google"', 'from "/__facebook-mocks.jsx"')
          .replace('from "toastify-js"', 'from "/__facebook-mocks.jsx"')
          .replace('from "../api/auth.js"', 'from "/__facebook-mocks.jsx"')
          .replace('from "../auth/session.js"', 'from "/__facebook-mocks.jsx"');
      },
      resolveId(id) {
        if (id === "/__facebook-mocks.jsx" || id === "/__facebook-harness.jsx") return id;
      },
      load(id) {
        if (id === "/__facebook-mocks.jsx") return mocks;
        if (id === "/__facebook-harness.jsx") return harness;
      },
      configureServer(vite) {
        vite.middlewares.use(async (req, res, next) => {
          if (req.url !== "/__facebook-smoke.html") return next();
          res.setHeader("Content-Type", "text/html");
          res.end(await vite.transformIndexHtml(req.url,
            '<html><body><div id="root"></div><script type="module" src="/__facebook-harness.jsx"></script></body></html>'));
        });
      },
    },
    react(),
  ],
  server: { host: "127.0.0.1", port: 0 },
});

try {
  await server.listen();
  const port = server.httpServer.address().port;
  chrome = spawn(process.env.CHROME_BIN || "/usr/bin/google-chrome", [
    "--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
    "--remote-debugging-port=0", "--remote-allow-origins=*", `--user-data-dir=${profile}`, "about:blank",
  ], { stdio: "ignore" });
  chrome.on("error", error => console.error(error.message));
  let debuggingPort;
  for (let i = 0; i < 100; i++) {
    try { debuggingPort = (await readFile(path.join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]; break; }
    catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  assert.ok(debuggingPort, "Chrome unavailable; set CHROME_BIN to an installed Chrome/Chromium executable");
  const pages = await (await fetch(`http://127.0.0.1:${debuggingPort}/json/list`)).json();
  socket = new WebSocket(pages.find(page => page.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") {
      console.error("Browser error:", message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    }
    if (message.id) { pending.get(message.id)?.(message); pending.delete(message.id); }
  };
  const send = (method, params = {}) => new Promise(resolve => {
    pending.set(++id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
  await send("Runtime.enable");
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/__facebook-smoke.html` });
  let results;
  for (let i = 0; i < 300; i++) {
    const response = await send("Runtime.evaluate", { expression: "window.smokeResults", returnByValue: true });
    results = response.result?.result?.value;
    if (results) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(results?.length, "Browser harness did not finish");
  for (const result of results) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.error ? `: ${result.error}` : ""}`);
  assert.ok(results.every(result => result.passed), "Facebook smoke test failed");
} finally {
  socket?.close();
  chrome?.kill();
  await server.close();
  await new Promise(resolve => setTimeout(resolve, 300));
  await rm(profile, { recursive: true, force: true, maxRetries: 3 });
}