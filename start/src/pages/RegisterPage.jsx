import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { register } from '../auth/store.js'
import FormField from '../components/FormField.jsx'
import { toast } from '../toast.js'

/** Registration form backed by the local auth store (auto sign-in on success). */
export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/'

  const submit = (event) => {
    event.preventDefault()
    const result = register({ name, email, password, confirmPassword })
    if (!result.ok) {
      setError(result.error)
      toast(result.error, 'error')
      return
    }
    toast(`Welcome, ${result.user.name}! Your account is ready 🎉`, 'success')
    navigate(from, { replace: true })
  }

  return (
    <section className="pt-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-slate-900/80 p-6 shadow-lg shadow-slate-950/40 ring-1 ring-white/10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-xl shadow-md shadow-cyan-500/20 ring-2 ring-white/20">
            ✍️
          </span>
          <h1 className="mt-3 text-center text-2xl font-black tracking-tight text-white">Create account</h1>
          <p className="mt-1 text-center text-sm text-slate-400">Join Football Hub — it takes a few seconds.</p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <FormField
              id="register-name"
              label="Full name"
              type="text"
              value={name}
              onChange={setName}
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
            <FormField
              id="register-confirm"
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {error && (
              <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 ring-1 ring-rose-400/30">
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
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login', { state: { from } })} className="font-bold text-emerald-300 hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}