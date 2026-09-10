import { useState } from 'react'
import { updateUser } from '../auth/store.js'
import FormField from '../components/FormField.jsx'
import { toast } from '../toast.js'

/** Edit the signed-in profile (name / email / password). Requires current password. */
export default function UpdatePage({ user, onNeedLogin, onBack }) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [updated, setUpdated] = useState(false)

  if (!user) {
    return (
      <section className="pt-16 text-center">
        <span aria-hidden="true" className="text-3xl">🔒</span>
        <p className="mt-3 text-lg font-bold text-slate-200">Please sign in to edit your profile.</p>
        <button
          type="button"
          onClick={onNeedLogin}
          className="mt-4 rounded-lg bg-emerald-500/15 px-5 py-2.5 text-sm font-bold text-emerald-300 ring-1 ring-emerald-400/30 transition hover:bg-emerald-500/25"
        >
          Sign in →
        </button>
      </section>
    )
  }

  const submit = (event) => {
    event.preventDefault()
    setUpdated(false)
    const result = updateUser({ currentPassword, name, email, newPassword, confirmPassword })
    if (!result.ok) {
      setError(result.error)
      toast(result.error, 'error')
      return
    }
    setError('')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setUpdated(true)
    toast('Profile updated successfully ✓', 'success')
  }

  return (
    <section className="pt-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-slate-900/80 p-6 shadow-lg shadow-slate-950/40 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-200 ring-1 ring-white/20 transition hover:bg-white/20"
              aria-label="Back"
            >
              ←
            </button>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500 text-xl shadow-md shadow-violet-500/20 ring-2 ring-white/20">
              ✎
            </span>
          </div>
          <h1 className="mt-3 text-center text-2xl font-black tracking-tight text-white">Update profile</h1>
          <p className="mt-1 text-center text-sm text-slate-400">
            Signed in as <span className="font-semibold text-emerald-300">{user.email}</span>
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <FormField
              id="update-name"
              label="Full name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Your name"
              autoComplete="name"
            />
            <FormField
              id="update-email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FormField
              id="update-current"
              label="Current password (required)"
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <FormField
              id="update-new"
              label="New password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Leave blank to keep"
              autoComplete="new-password"
            />
            <FormField
              id="update-confirm"
              label="Confirm new password"
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
            {updated && (
              <p role="status" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                ✓ Your profile has been updated.
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500/20 py-2.5 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/40 transition hover:bg-emerald-500/30"
            >
              Save changes →
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}