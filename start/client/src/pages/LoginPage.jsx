import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import { GoogleLogin } from "@react-oauth/google";
import FacebookLoginModule, {
  FacebookLoginClient,
  isFacebookApp,
} from "@greatsumini/react-facebook-login";
import FormField from "../components/FormField.jsx";
import LoadingIndicator from "../components/LoadingIndicator.jsx";
import { loginUser, loginWithGoogle, loginWithFacebook } from "../api/auth.js";
import { saveToken } from "../auth/session.js";

// Vite 8 can expose this CommonJS package's module.exports as the default.
const FacebookLogin = FacebookLoginModule.default ?? FacebookLoginModule;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID?.trim();
const FB_SDK_URL = "https://connect.facebook.net/en_US/sdk.js";
const FB_SDK_VERSION = "v23.0";
const FB_SDK_SCRIPT_ID = "facebook-jssdk";

let fbSdkPromise = null;

function loadFacebookSdk() {
  if (!FACEBOOK_APP_ID) {
    return Promise.reject(
      new Error("Facebook login is not configured. Set VITE_FACEBOOK_APP_ID."),
    );
  }
  if (fbSdkPromise) return fbSdkPromise;

  fbSdkPromise = new Promise((resolve, reject) => {
    let script;
    const timeout = setTimeout(() => {
      fail(new Error("Timed out loading the Facebook SDK. Please try again."));
    }, 15000);
    const fail = (error) => {
      clearTimeout(timeout);
      if (script) {
        script.onload = null;
        script.onerror = null;
        script.remove();
      }
      reject(error);
    };
    const init = () => {
      try {
        if (!window.FB) throw new Error("Facebook SDK did not initialize.");
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: false,
          version: FB_SDK_VERSION,
        });
        clearTimeout(timeout);
        resolve(window.FB);
      } catch (error) {
        fail(error);
      }
    };

    if (window.FB) {
      init();
      return;
    }

    // Share the script ID with the component so it cannot inject a second SDK.
    script = document.createElement("script");
    script.id = FB_SDK_SCRIPT_ID;
    script.src = FB_SDK_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = init;
    script.onerror = () => {
      fail(new Error("Failed to load the Facebook SDK."));
    };
    document.body.appendChild(script);
  });

  fbSdkPromise = fbSdkPromise.catch((error) => {
    fbSdkPromise = null;
    throw error;
  });
  return fbSdkPromise;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() =>
    FACEBOOK_APP_ID
      ? ""
      : "Facebook login is not configured. Set VITE_FACEBOOK_APP_ID.",
  );
  const [facebookSdkStatus, setFacebookSdkStatus] = useState(
    FACEBOOK_APP_ID ? "loading" : "unconfigured",
  );
  const [facebookLoginPending, setFacebookLoginPending] = useState(false);
  const [facebookAttemptId, setFacebookAttemptId] = useState(0);
  const facebookAttempt = useRef(null);
  const facebookPending = useRef(false);
  const mounted = useRef(false);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(() =>
    Math.max(1, Math.min(400, window.innerWidth - 80)),
  );
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/";

  useEffect(() => {
    function updateGoogleButtonWidth() {
      setGoogleButtonWidth(
        Math.max(1, Math.min(400, window.innerWidth - 80)),
      );
    }

    window.addEventListener("resize", updateGoogleButtonWidth);
    return () => window.removeEventListener("resize", updateGoogleButtonWidth);
  }, []);

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
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "#34D399",
          color: "black",
        },
        onClick: function () {},
      }).showToast();
    } catch (error) {
      console.log(error.response);
      setError(error.response?.data?.message || "Failed login");
      Toastify({
        text: "Failed login",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "#F87171",
          color: "black",
        },
        onClick: function () {},
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
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "#34D399",
          color: "black",
        },
        onClick: function () {},
      }).showToast();
    } catch (error) {
      console.log(error.response);
      setError(error.response?.data?.message || "Failed login");
      Toastify({
        text: "Failed login",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "#F87171",
          color: "black",
        },
        onClick: function () {},
      }).showToast();
    }
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (facebookAttempt.current) {
        clearTimeout(facebookAttempt.current.timeout);
        facebookAttempt.current.reject(new Error("Facebook login was interrupted."));
        facebookAttempt.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!FACEBOOK_APP_ID) return;

    let active = true;
    loadFacebookSdk()
      .then(() => {
        if (active) setFacebookSdkStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setFacebookSdkStatus("error");
        setError(error.message || "Could not load Facebook login.");
      });

    return () => {
      active = false;
    };
  }, []);

  function settleFacebookLogin(response, failure) {
    const attempt = facebookAttempt.current;
    // A timed-out or unmounted component must not authenticate a later attempt.
    if (!attempt || attempt.id !== facebookAttemptId) return;
    facebookAttempt.current = null;
    clearTimeout(attempt.timeout);
    if (failure) attempt.reject(failure);
    else attempt.resolve(response);
  }

  function handleFacebookFailure(failure) {
    settleFacebookLogin(
      null,
      new Error(
        failure?.status === "facebookNotLoaded"
          ? "Facebook SDK is not ready. Please reload the page and try again."
          : "Facebook login was cancelled or the popup was blocked.",
      ),
    );
  }

  async function handleFacebookLogin(onClick) {
    setError("");
    if (facebookPending.current) return;
    facebookPending.current = true;

    try {
      if (!FACEBOOK_APP_ID) {
        throw new Error(
          "Facebook login is not configured. Set VITE_FACEBOOK_APP_ID.",
        );
      }

      if (facebookSdkStatus !== "ready") {
        setFacebookSdkStatus("loading");
        await loadFacebookSdk();
        if (!mounted.current) return;
        setFacebookSdkStatus("ready");
        setError("Facebook is ready. Click the button again to continue.");
        return;
      }

      setFacebookLoginPending(true);
      const response = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          settleFacebookLogin(
            null,
            new Error(
              "Facebook did not respond. Check popup permissions and the Facebook Login JavaScript SDK settings.",
            ),
          );
        }, 60000);

        facebookAttempt.current = { id: facebookAttemptId, resolve, reject, timeout };
        try {
          // The component forces OAuth redirects in Facebook/Instagram browsers.
          // Keep our existing SDK login flow there: the backend accepts tokens,
          // not authorization codes. Do not introduce a new redirect protocol.
          if (isFacebookApp()) {
            FacebookLoginClient.login((result) => {
              if (result?.authResponse) settleFacebookLogin(result.authResponse);
              else handleFacebookFailure({ status: "loginCancelled" });
            }, { scope: "public_profile,email" });
          } else {
            onClick();
          }
        } catch (error) {
          settleFacebookLogin(null, error);
        }
      });

      if (!mounted.current) return;
      if (typeof response?.accessToken !== "string" || !response.accessToken.trim()) {
        throw new Error(
          "Facebook did not return an access token. Please try again.",
        );
      }

      const data = await loginWithFacebook(response.accessToken);
      if (!mounted.current) return;
      if (typeof data?.access_token !== "string" || !data.access_token.trim()) {
        throw new Error("The server did not return a login session. Please try again.");
      }

      saveToken(data.access_token);
      navigate(from, { replace: true });
      Toastify({
        text: "Success login",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "#34D399",
          color: "black",
        },
        onClick: function () {},
      }).showToast();
    } catch (error) {
      if (!mounted.current) return;
      if (FACEBOOK_APP_ID && facebookSdkStatus !== "ready") {
        setFacebookSdkStatus("error");
      }
      setError(
        error.response?.data?.message || error.message || "Failed login",
      );
      Toastify({
        text: "Failed login",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "bottom",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "#F87171",
          color: "black",
        },
        onClick: function () {},
      }).showToast();
    } finally {
      facebookPending.current = false;
      if (mounted.current) {
        setFacebookLoginPending(false);
        // Old library callbacks retain their previous ID and are ignored.
        setFacebookAttemptId((id) => id + 1);
      }
    }
  }

  function renderFacebookButton(onClick) {
    return (
      <button
        type="button"
        onClick={() => handleFacebookLogin(onClick)}
        disabled={
          facebookLoginPending ||
          facebookSdkStatus === "loading" ||
          facebookSdkStatus === "unconfigured"
        }
        aria-busy={facebookLoginPending || facebookSdkStatus === "loading"}
        className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#1877f2]/70 bg-[#1877f2] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-950/20 transition hover:bg-[#166fe5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-wait disabled:opacity-60"
      >
        {facebookLoginPending || facebookSdkStatus === "loading" ? (
          <>
            <LoadingIndicator label="Connecting to Facebook…" className="h-8 w-8" />
            Connecting to Facebook…
          </>
        ) : facebookSdkStatus === "error" ? (
          "Retry Facebook connection"
        ) : facebookSdkStatus === "unconfigured" ? (
          "Facebook login not configured"
        ) : (
          <>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.023 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.49 0-1.956.931-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.096 24 18.092 24 12.073Z" />
            </svg>
            Continue with Facebook
          </>
        )}
      </button>
    );
  }

  return (
    <section className="px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl shadow-slate-950/50 sm:p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-xl shadow-md shadow-emerald-500/20 ring-2 ring-white/20">
            🔑
          </span>
          <h1 className="mt-3 text-center text-2xl font-black tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-center text-sm leading-6 text-slate-400">
            Sign in to continue to your Football Hub.
          </p>

          <form onSubmit={handleLogin} className="mt-7 flex flex-col gap-4">
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 ring-1 ring-rose-400/30"
              >
                {error}
              </p>
            )}
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
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500/20 py-2.5 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/40 transition hover:bg-emerald-500/30"
            >
              Sign in →
            </button>
            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-medium text-slate-500">
                or continue with
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google sign-in failed. Please try again.")}
                width={String(googleButtonWidth)}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                logo_alignment="center"
              />
            </div>
            {facebookSdkStatus === "ready" ? (
              <FacebookLogin
                key={facebookAttemptId}
                appId={FACEBOOK_APP_ID}
                language="en_US"
                scope="public_profile,email"
                initParams={{ version: FB_SDK_VERSION, cookie: true, xfbml: false }}
                autoLoad={false}
                useRedirect={false}
                onSuccess={settleFacebookLogin}
                onFail={handleFacebookFailure}
                render={({ onClick }) => renderFacebookButton(onClick)}
              />
            ) : renderFacebookButton()}
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
