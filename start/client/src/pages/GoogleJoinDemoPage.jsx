import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Toastify from "toastify-js";
import axios from "axios";
import JoinClubsPage from "./JoinClubsPage.jsx";
import { toastifyError } from "../utils/toastify.js";

export default function GoogleJoinDemoPage() {
  const [accessToken, setAccessToken] = useState(localStorage.access_token);

  async function handleGoogleLogin(credentialResponse) {
    try {
      const { data } = await axios.post(

        "http://localhost:3000/google-login",
        {},
        {
          headers: {
            token: credentialResponse.credential,
          },
        },
      );

      localStorage.setItem("access_token", data.access_token);
      setAccessToken(data.access_token);
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

  return (
    <div className="min-h-screen bg-[#07070c] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {!accessToken ? (
          <section className="pt-10">
            <div className="mx-auto max-w-md">
              <div className="rounded-2xl bg-slate-900/80 p-6 shadow-lg shadow-slate-950/40 ring-1 ring-white/10">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-xl shadow-md shadow-emerald-500/20 ring-2 ring-white/20">
                  🔑
                </span>
                <h1 className="mt-3 text-center text-2xl font-black tracking-tight text-white">
                  Sign in with Google
                </h1>
                <p className="mt-1 text-center text-sm text-slate-400">
                  Demo GoogleOAuthProvider — lanjut ke halaman Join Clubs.
                </p>

                <div className="mt-6 flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => toastifyError("Google login failed")}
                  />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("access_token");
                setAccessToken(null);
              }}
              className="absolute right-0 top-0 rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-bold text-rose-300 ring-1 ring-rose-400/30 transition hover:bg-rose-500/20"
            >
              Sign out
            </button>
            <JoinClubsPage />
          </div>
        )}
      </div>
    </div>
  );
}
