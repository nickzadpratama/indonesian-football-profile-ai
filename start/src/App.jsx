import { useEffect, useState } from 'react'
import TeamsPage from './pages/TeamsPage.jsx'
import PlayersPage from './pages/PlayersPage.jsx'
import PlayerProfilePage from './pages/PlayerProfilePage.jsx'
import MyTeamsPage from './pages/MyTeamsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import UpdatePage from './pages/UpdatePage.jsx'
import ToastViewport from './components/ToastViewport.jsx'
import { getSession, logout } from './auth/store.js'
import { toast } from './toast.js'

export default function App() {
  // route: { name, team?, player?, season?, returnTo? }
  const [session, setSession] = useState(() => getSession())
  const [route, setRoute] = useState({ name: 'teams' })

  useEffect(() => {
    const refresh = () => setSession(getSession())
    window.addEventListener('football-hub-auth', refresh)
    return () => window.removeEventListener('football-hub-auth', refresh)
  }, [])

  const goTeams = () => setRoute({ name: 'teams' })
  const goPlayers = (team, season) => setRoute({ name: 'players', team, season })
  const goProfile = (player, team, season) => setRoute({ name: 'profile', player, team, season })

  const signOut = () => {
    logout()
    toast('Signed out. See you soon!', 'neutral')
    goTeams()
  }

  const navClass = (active) =>
    `rounded-lg px-3 py-1.5 text-xs font-bold transition ${
      active
        ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
        : 'bg-white/5 text-slate-300 ring-1 ring-white/10 hover:bg-white/10'
    }`

  let page
  switch (route.name) {
    case 'players':
      page = (
        <PlayersPage
          key={`${route.team.team?.id}-${route.season ?? 'auto'}`}
          team={route.team}
          season={route.season}
          onBack={goTeams}
          onSelect={(player, season) => goProfile(player, route.team, season)}
        />
      )
      break
    case 'profile':
      page = (
        <PlayerProfilePage
          key={`${route.player.id}-${route.season ?? 'auto'}`}
          player={route.player}
          team={route.team}
          season={route.season}
          onBack={() => setRoute({ name: 'players', team: route.team, season: route.season })}
          onSelectSeason={(season) => setRoute({ name: 'profile', player: route.player, team: route.team, season })}
        />
      )
      break
    case 'my-teams':
      page = <MyTeamsPage onSelect={goPlayers} onBrowse={goTeams} />
      break
    case 'login':
      page = (
        <LoginPage
          onSuccess={() => setRoute(route.returnTo ?? { name: 'teams' })}
          onNeedRegister={() => setRoute({ name: 'register', returnTo: route.returnTo })}
        />
      )
      break
    case 'register':
      page = (
        <RegisterPage
          onSuccess={() => setRoute(route.returnTo ?? { name: 'teams' })}
          onNeedLogin={() => setRoute({ name: 'login', returnTo: route.returnTo })}
        />
      )
      break
    case 'update':
      page = (
        <UpdatePage
          key={session?.email ?? 'guest'}
          user={session}
          onBack={goTeams}
          onNeedLogin={() => setRoute({ name: 'login', returnTo: { name: 'update' } })}
        />
      )
      break
    default:
      page = <TeamsPage onSelect={goPlayers} />
  }

  return (
    <div className="dark min-h-screen bg-[#07070c] text-slate-100">
<ToastViewport />
{/* Ambient glow backdrop */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        {/* Top bar */}
        <nav className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goTeams}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-3.5 py-2 text-sm font-black tracking-tight text-white ring-1 ring-white/10 transition hover:bg-white/10"
            >
              <span aria-hidden="true" className="text-base">⚽</span>
              Football Hub
            </button>
            <button type="button" onClick={goTeams} className={navClass(route.name === 'teams')}>
              Teams
            </button>
            <button type="button" onClick={() => setRoute({ name: 'my-teams' })} className={navClass(route.name === 'my-teams')}>
              My Teams
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {(route.name === 'players' || route.name === 'profile') && (
              <button type="button" onClick={goTeams} className={navClass(false)}>
                ← All teams
              </button>
            )}
            {session ? (
              <>
                <span className="hidden items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 ring-1 ring-white/10 sm:flex">
                  <span aria-hidden="true">👤</span>
                  <span className="max-w-[9rem] truncate">{session.name}</span>
                </span>
                <button type="button" onClick={() => setRoute({ name: 'update' })} className={navClass(route.name === 'update')} title="Edit your profile">
                  ✎ Edit
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-bold text-rose-300 ring-1 ring-rose-400/30 transition hover:bg-rose-500/20"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setRoute({ name: 'login', returnTo: { name: 'teams' } })} className={navClass(route.name === 'login')}>
                  Sign in
                </button>
                <button type="button" onClick={() => setRoute({ name: 'register', returnTo: { name: 'teams' } })} className={navClass(route.name === 'register')}>
                  Register
                </button>
              </>
            )}
          </div>
        </nav>

        {page}

        <footer className="mt-12 border-t border-white/10 pb-8 text-center text-xs text-slate-500">
          Data: v3.football.api-sports.io · Teams · Squads · Player statistics · Dark mode
        </footer>
      </div>
    </div>
  )
}