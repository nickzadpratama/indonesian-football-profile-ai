import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import { GoogleLogin } from "@react-oauth/google";
import FormField from "../components/FormField.jsx";
import { loginUser, loginWithGoogle, loginWithFacebook } from "../api/auth.js";
import { saveToken } from "../auth/session.js";

/* ── Facebook OAuth (JS SDK) ─────────────────────────────── */
/* App ID dari developers.facebook.com (App Settings → Basic).
 * Bisa dioverride lewat file .env client: VITE_FACEBOOK_APP_ID=<app-id>. */
const FACEBOOK_APP_ID =
  import.meta.env.VITE_FACEBOOK_APP_ID || "1132411399455460";
const FB_SDK_URL = "https://connect.facebook.net/en_US/sdk.js";
const FB_SDK_VERSION = "v23.0";

let fbSdkPromise = null;

/** Lazy-load the Facebook JS SDK once, then FB.init() with the app id. */
function loadFacebookSdk() {
  if (fbSdkPromise) return fbSdkPromise;

  fbSdkPromise = new Promise((resolve, reject) => {
    const init = () => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: FB_SDK_VERSION,
      });
      resolve(window.FB);
    };

    if (window.FB) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.src = FB_SDK_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = init;
    script.onerror = () => {
      fbSdkPromise = null;
      reject(new Error("Failed to load the Facebook SDK."));
    };
    document.body.appendChild(script);
  });

  return fbSdkPromise;
}

/** Sign-in form backed by the local auth store. Redirects back to where the user came from. */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/";

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser({ email, password });

      saveToken(data.access_token);
      navigate("/");
      Toastify({
        text: "Success login",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true,
        style: {
          background: "#34D399",
          color: "black",
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    } catch (error) {
      console.log(error.response);
      setError(error.response?.data?.message || "Failed login");
      Toastify({
        text: "Failed login",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true,
        style: {
          background: "#F87171",
          color: "black",
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    }
  }

  async function handleGoogleLogin(credentialResponse) {
    setError("");
    try {
      const data = await loginWithGoogle(credentialResponse.credential);

      saveToken(data.access_token);
      navigate("/");
      Toastify({
        text: "Success login",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true,
        style: {
          background: "#34D399",
          color: "black",
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    } catch (error) {
      console.log(error.response);
      setError(error.response?.data?.message || "Failed login");
      Toastify({
        text: "Failed login",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true,
        style: {
          background: "#F87171",
          color: "black",
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    }
  }

  /* Preload the Facebook SDK so FB.login() still runs inside the
     click's user-activation window (avoids popup blockers). */
  useEffect(() => {
    if (FACEBOOK_APP_ID) loadFacebookSdk().catch(() => {});
  }, []);

  /**
   * Facebook OAuth login — mirrors handleGoogleLogin: FB.login() returns a
   * user access token which is sent to POST /facebook-login via the `token`
   * header; the server verifies it against the Graph API, find-or-creates
   * the user, and returns our own access_token.
   */
  async function handleFacebookLogin() {
    setError("");
    try {
      if (!FACEBOOK_APP_ID) {
        throw new Error("Facebook App ID is not configured yet.");
      }

      const FB = await loadFacebookSdk();
      const response = await new Promise((resolve, reject) => {
        FB.login(resolve, { scope: "public_profile,email" });
        // Popup diblokir / domain app belum diizinkan di Facebook Login
        // settings → SDK gagal diam tanpa callback. Timeout membuat
        // penyebabnya kelihatan jelas, bukan halaman diam selamanya.
        setTimeout(() => {
          reject(
            new Error(
              "Facebook popup did not respond — allow popups for this site, then re-check the Facebook Login 'JavaScript SDK' settings.",
            ),
          );
        }, 90000);
      });
      console.log(response);

      if (!response.authResponse)
        throw new Error(
          "Facebook login was cancelled or the popup was blocked.",
        );

      const data = await loginWithFacebook(
        response.authResponse.accessToken,
      );

      saveToken(data.access_token);
      navigate("/");
      Toastify({
        text: "Success login",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true,
        style: {
          background: "#34D399",
          color: "black",
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message || error.message || "Failed login",
      );
      Toastify({
        text: "Failed login",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true,
        style: {
          background: "#F87171",
          color: "black",
        },
        onClick: function () {}, // Callback after click
      }).showToast();
    }
  }

  return (
    <section className="pt-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-slate-900/80 p-6 shadow-lg shadow-slate-950/40 ring-1 ring-white/10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-xl shadow-md shadow-emerald-500/20 ring-2 ring-white/20">
            🔑
          </span>
          <h1 className="mt-3 text-center text-2xl font-black tracking-tight text-white">
            Sign in
          </h1>
          <p className="mt-1 text-center text-sm text-slate-400">
            Welcome back — access your Football Hub.
          </p>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <FormField
              id="login-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FormField
              id="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 ring-1 ring-rose-400/30"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500/20 py-2.5 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/40 transition hover:bg-emerald-500/30"
            >
              Sign in →
            </button>
            <GoogleLogin onSuccess={handleGoogleLogin} />
            <button
              type="button"
              onClick={handleFacebookLogin}
              className="w-full rounded-lg bg-sky-500/20 py-2.5 text-sm font-black text-sky-300 ring-1 ring-sky-400/40 transition hover:bg-sky-500/30"
            >
              Continue with Facebook
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            New here?{" "}
            <button
              type="button"
              onClick={() => navigate("/register", { state: { from } })}
              className="font-bold text-emerald-300 hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
