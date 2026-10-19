import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormField from "../components/FormField.jsx";
import Toastify from "toastify-js";
import { registerUser } from "../api/auth.js";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/";

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    try {
      await registerUser({ username, email, password });

      navigate("/login", { state: { from } });
      Toastify({
        text: "Success register",
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
      const message =
        error.response?.data?.message ?? error.message ?? "Failed register";
      setError(message);
      Toastify({
        text: message,
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
    <section className="pt-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-slate-900/80 p-6 shadow-lg shadow-slate-950/40 ring-1 ring-white/10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-xl shadow-md shadow-cyan-500/20 ring-2 ring-white/20">
            ✍️
          </span>
          <h1 className="mt-3 text-center text-2xl font-black tracking-tight text-white">
            Create account
          </h1>
          <p className="mt-1 text-center text-sm text-slate-400">
            Join Football Hub — it takes a few seconds.
          </p>

          <form
            onSubmit={handleRegister}
            className="mt-6 flex flex-col gap-4"
          >
            <FormField
              id="register-name"
              label="Username"
              type="text"
              value={username}
              onChange={setUsername}
              placeholder="Your name"
              autoComplete="name"
            />
            <FormField
              id="register-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FormField
              id="register-password"
              label="Password (min 6 chars)"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete="new-password"
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
              className="w-full rounded-lg bg-cyan-500/20 py-2.5 text-sm font-black text-cyan-300 ring-1 ring-cyan-400/40 transition hover:bg-cyan-500/30"
            >
              Register →
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login", { state: { from } })}
              className="font-bold text-emerald-300 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
