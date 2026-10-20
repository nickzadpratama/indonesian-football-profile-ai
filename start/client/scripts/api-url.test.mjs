import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import axios from "axios";
import { createServer } from "vite";

// Load real API modules through Vite, but never send a network request.
const root = fileURLToPath(new URL("../", import.meta.url));
const cache = await mkdtemp(path.join(tmpdir(), "api-url-test-"));
const production = "https://football.nickz.online";
const cases = [
  [undefined, production],
  ["", production],
  ["   ", production],
  ["///", production],
  [production, production],
  [`${production}/`, production],
  [`  ${production}///  `, production],
  ["https://preview.example.test/", "https://preview.example.test"],
  ["http://localhost:3000/", "http://localhost:3000"],
];
const originalAdapter = axios.defaults.adapter;
const originalFetch = globalThis.fetch;
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
const token = `mock.${Buffer.from(JSON.stringify({ id: 1 })).toString("base64url")}.signature`;
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: { getItem: () => token },
});

try {
  for (const mode of ["development", "production"]) {
    for (const [env, expected] of cases) {
      const requests = [];
      axios.defaults.adapter = async config => {
        requests.push(config);
        return {
          data: config.url.endsWith("/genAI") ? "Mock reply" : { data: [], access_token: "mock-session" },
          status: 200, statusText: "OK", headers: {}, config,
        };
      };
      globalThis.fetch = async (url, options) => {
        requests.push({ url, method: "get", ...options });
        return { ok: true, json: async () => ({ response: [] }) };
      };
      const server = await createServer({
        root,
        configFile: false,
        envDir: false,
        cacheDir: cache,
        mode,
        define: {
          "import.meta.env.VITE_API_URL": env === undefined ? "undefined" : JSON.stringify(env),
        },
        server: { middlewareMode: true },
      });
      try {
        const auth = await server.ssrLoadModule("/src/api/auth.js");
        assert.equal(auth.API_BASE_URL, expected);
        await auth.registerUser({ username: "Mock", email: "mock@example.test", password: "mock-password" });
        await auth.loginUser({ email: "mock@example.test", password: "mock-password" });
        await auth.loginWithGoogle("mock-google-token");
        await auth.loginWithFacebook("mock-facebook-token");
        const sports = await server.ssrLoadModule("/src/api/football.js");
        await sports.getTeams("Indonesia");
        const memberships = await server.ssrLoadModule("/src/api/memberships.js");
        await memberships.membershipRequest(token, "post", "team/id");
        const gemini = await server.ssrLoadModule("/src/features/gemini/geminiSlice.js");
        const actions = [];
        assert.equal((await gemini.fetchAI("  Mock question  ")(action => actions.push(action))).ok, true);

        assert.deepEqual(requests.map(request => request.url), [
          `${expected}/register`, `${expected}/login`, `${expected}/google-login`,
          `${expected}/facebook-login`, `${expected}/sports/teams?country=Indonesia`,
          `${expected}/me/fan-clubs/team%2Fid`, `${expected}/genAI`,
        ]);
        assert.deepEqual(requests.map(request => request.method), ["post", "post", "post", "post", "get", "post", "get"]);
        assert.deepEqual(JSON.parse(requests[0].data), { username: "Mock", email: "mock@example.test", password: "mock-password" });
        assert.deepEqual(JSON.parse(requests[1].data), { email: "mock@example.test", password: "mock-password" });
        assert.equal(requests[2].data, "{}");
        assert.equal(requests[2].headers.token, "mock-google-token");
        assert.equal(requests[3].data, "{}");
        assert.equal(requests[3].headers.token, "mock-facebook-token");
        for (const request of requests.slice(4)) assert.equal(request.headers.Authorization, `Bearer ${token}`);
        assert.deepEqual(requests[6].params, { input: "Mock question" });
        assert.equal(requests[5].timeout, 15000);
        assert.equal(requests[6].timeout, 60000);
        assert.equal(actions.at(-1).payload, "Mock reply");
        console.log(`PASS ${mode}, env=${JSON.stringify(env)}: URL resolution and seven mocked API contracts`);
      } finally {
        await server.close();
      }
    }
  }
} finally {
  axios.defaults.adapter = originalAdapter;
  globalThis.fetch = originalFetch;
  if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
  else delete globalThis.localStorage;
  await rm(cache, { recursive: true, force: true });
}