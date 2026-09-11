import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../auth/store.js";
import FormField from "../components/FormField.jsx";
import { toast } from "../toast.js";
import Toastify from "toastify-js";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

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
    try {
      const { data } = await axios.post(`https://football.nickz.online/login`, {
        email,
        password,
      });

      localStorage.setItem("access_token", data.access_token);
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
    try {
      const { data } = await axios.post(
        `/google-login`,
        {},
        {
          headers: {
            token: credentialResponse.credential,
          },
        },
      );

      localStorage.setItem("access_token", data.access_token);
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
    e.preventDefault();
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
            <input
              id="login-email"
              label="Email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <input
              id="login-password"
              label="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
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
