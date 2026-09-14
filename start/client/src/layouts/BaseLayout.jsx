import ChatBotWidget from "../components/ChatBotWidget.jsx";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

/** Sign-in form backed by the local auth store. Redirects back to where the user came from. */
export default function BaseLayout() {
  return (
    <>
      <div className="dark min-h-screen bg-[#07070c] text-slate-100">
        {/* Ambient glow backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
          {/* Top bar */}

          <Navbar />
          <Outlet />
          <ChatBotWidget />
          <footer className="mt-12 border-t border-white/10 pb-8 text-center text-xs text-slate-500">
            Data: v3.football.api-sports.io · Teams · Squads · Player statistics
            · Dark mode
          </footer>
        </div>
      </div>
    </>
  );
}
