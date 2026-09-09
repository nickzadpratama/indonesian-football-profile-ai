import { useState } from 'react'
import { login } from '../auth/store.js'
import FormField from '../components/FormField.jsx'
import { toast } from '../toast.js'

/** Sign-in form backed by the local auth store. */
export default function LoginPage({ onSuccess, onNeedRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const result = login({ email: email.trim(), password })
    if (!result.ok) {
      setError(result.error)
      toast(result.error, 'error')
      return
    }
    toast(`Welcome back, ${result.user.name}!`, 'success')
    onSuccess?.()
  }

  return (
    <section className="pt-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-slate-900/80 p-6 shadow-lg shadow-slate-950/40 ring-1 ring-white/10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-xl shadow-md shadow-emerald-500/20 ring-2 ring-white/20">
            🔑
          </span>
          <h1 className="mt-3 text-center text-2xl font-black tracking-tight text-white">Sign in</h1>
          <p className="mt-1 text-center text-sm text-slate-400">Welcome back — access your Football Hub.</p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
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
              <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 ring-1 ring-rose-400/30">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500/20 py-2.5 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/40 transition hover:bg-emerald-500/30"
            >
              Sign in →
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            New here?{' '}
            <button type="button" onClick={onNeedRegister} className="font-bold text-emerald-300 hover:underline">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}