# React + Vite

## Backend API URL

Development and production now call `https://football.nickz.online` directly.
Auth, sports, membership, chatbot, and the standalone Google/Join Clubs demo
share `API_BASE_URL`. No local Vite API proxy is required; local HTTPS stays enabled.

Set `VITE_API_URL=https://football.nickz.online` in your ignored local `.env`
and in Vercel Preview/Production. Remove any stale `/api` override. Restart
the development server after env changes; rebuild/redeploy for Vercel changes.
An absent, empty, whitespace-only, or slash-only value uses the production
default. Surrounding whitespace and trailing slashes are removed from overrides.
Endpoint paths are appended without an extra `/api` prefix.

For intentional local-backend development, explicitly set
`VITE_API_URL=http://localhost:3000` (or a suitable HTTPS backend). All services,
including chatbot, use that override directly. An HTTPS frontend cannot safely
call an HTTP backend in browsers that block mixed content: use HTTPS on the
local backend rather than disabling browser security. Relative `/api` is no
longer a supported local proxy setup.

Run `npm run test:api-url` to test URL resolution in development/production and
mocked auth, sports, membership, and chatbot request contracts. This test loads
real modules through Vite without env files and mocks Axios/fetch; it sends no
requests to production and needs no new dependency. The Facebook browser smoke
tests remain local by design.

Before release, manually verify the actual backend deployment's CORS/preflight
for your frontend origin and headers `Authorization`, `token`, and `Content-Type`.
The repository backend uses `cors()`, but deployed configuration is unverified.
Do not use `no-cors`, change OAuth redirect domains, or change backend/database/
PM2 settings just to switch the API URL. Test writes and paid chatbot requests
only with explicit approval and designated test data/accounts.

Deploy Preview first, check browser Network destinations and auth regression,
then approve Production. Changing the API URL does not change the frontend host
or Google/Facebook redirect origin. To roll back, restore the relevant source
and env settings together, rebuild, or restore the last verified deployment.

## Facebook Login migration

Facebook Login uses `@greatsumini/react-facebook-login` (lockfile: 3.4.0).
The custom button, SDK v23.0, `public_profile,email` scope, and application
session behavior are preserved. The existing SDK loader handles loading,
15-second SDK timeout, errors, and retries; it shares the `facebook-jssdk`
script ID with the component to avoid loading a second SDK.

The component's `onSuccess` receives `accessToken` directly. The frontend
sends it to `POST /facebook-login`, with body `{}` and header `token`.
Only the backend's `access_token` (application JWT) is stored. The frontend
does not request or trust Facebook profile data for authentication.

The package's CommonJS default export is normalized for Vite 8 compatibility.
In Facebook/Instagram in-app browsers, its exported `FacebookLoginClient.login`
keeps the existing SDK login flow instead of the component's forced OAuth
redirect, since the backend does not implement authorization-code exchange.
Actual popup support in these browsers still requires manual verification.

### Local checks

From `/home/nickzad/Public/hacktiv8/phase2/week3/IP-nickzadpratama/start/client`:

```bash
npm ci
npm run test:facebook
FACEBOOK_SMOKE_SDK_MODE=fail npm run test:facebook
FACEBOOK_SMOKE_SDK_MODE=timeout npm run test:facebook
FACEBOOK_SMOKE_SDK_MODE=unconfigured npm run test:facebook
npm run lint
npm run build
```

The smoke test uses the installed Vite/React packages and an installed Chrome
or Chromium (`CHROME_BIN` overrides `/usr/bin/google-chrome`). It opens a
temporary headless browser profile, mocks the SDK and authentication API,
disables env-file loading, and never uses a Facebook account, real token,
backend, or database. It covers success, token mapping, redirect, cancel,
duplicate clicks, StrictMode/remount, missing tokens/session, API errors,
timeouts, stale callbacks, unmount, SDK failure/retry, and missing App ID.
No extra testing dependency is needed. It is not a real Facebook integration
test or a visual comparison test.

Use an isolated checkout/workspace for `npm ci` and builds: this repository
currently tracks some dependency/build artifacts. Do not stage them with
`git add .`. The repository-wide lint command also scans the backend example
folder and currently has existing errors; do not change unrelated code to
silence them. The migrated Login page must pass targeted lint.

### Manual verification before deployment

- Verify `VITE_FACEBOOK_APP_ID`, `VITE_API_URL`, and `VITE_GOOGLE_CLIENT_ID`
  for each Vercel environment. Never put App Secret in a `VITE_` variable.
- Verify allowed HTTPS domains, JavaScript SDK configuration, email permission,
  app mode, and tester access in Meta Developers. Do not share env values.
- Confirm real Facebook success/cancel, missing email, SDK blocking, retries,
  refresh persistence, and logout/re-login on desktop/mobile/in-app browsers.
- Confirm email/password, Register, Google, protected routes, and Login/Register
  appearance are unchanged. Verify direct-route refresh on the deployed site.
- Deploy Preview first, inspect logs, then approve Production and repeat tests.
- Backend auth tests are destructive (`sync({ force: true })`/`drop()`): never
  run them against production/Supabase data. They require a disposable test DB.

No backend changes are required for the migration. Existing security findings
(Facebook token App ID validation, token logging in Google login, JWT expiry,
and Google-created account passwords) require separate security review.

### Rollback

If component integration fails, revert only the Login page migration to the
previous manual SDK flow; do not restore the incompatible old dependency.
For a production incident, restore the last verified Vercel deployment before
attempting a rebuild. Do not change database, port, PM2, or backend settings as
part of this frontend rollback.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
