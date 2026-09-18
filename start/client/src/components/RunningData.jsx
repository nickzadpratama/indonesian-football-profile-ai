import "./RunningData.css";

/**
 * ============================================================================
 * RunningData — tampilan data berjalan (running text / marquee)  (FILE BARU)
 * ============================================================================
 * Menampilkan daftar klub (bentuk data sama dengan api-sports: { team, venue })
 * bergulir secara horizontal tanpa terputus, seperti ticker skor di TV.
 *
 * FILE BARU — tidak mengubah satu baris pun kode aplikasi yang sudah ada.
 *
 * Props:
 *   - items : array of { team, venue }  (mis. hasil fetchTeams / data redux)
 *   - label : teks kecil di pinggir kiri (default "Live")
 *   - speed : durasi 1 siklus dalam detik (default 30, makin kecil makin cepat)
 *
 * Cara pakai:
 *   import RunningData from "../components/RunningData.jsx";
 *   <RunningData items={data} label="Clubs" />
 * ==========================================================================*/

export default function RunningData({ items = [], label = "Live", speed = 30 }) {
  // Tidak ada data -> jangan render apa-apa
  if (!items || items.length === 0) return null;

  // Data diduplikasi 2x supaya loop -50% terlihat mulus tanpa "lompatan"
  const loop = [...items, ...items];

  return (
    <div
      className="running-data mt-4 flex items-center gap-3 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10"
      title="Data berjalan — arahkan kursor untuk berhenti sementara"
    >
      {/* Label statis di kiri */}
      <span className="z-10 shrink-0 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/40">
        {label}
      </span>

      {/* Area data berjalan */}
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div
          className="running-data-track flex w-max items-center gap-8 py-2"
          style={{ animationDuration: `${speed}s` }}
        >
          {loop.map((item, index) => {
            const team = item.team ?? {};
            const venue = item.venue ?? {};
            return (
              <span
                key={`${team.id}-${index}`}
                className="flex items-center gap-2 text-xs"
              >
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt={team.name ?? "club"}
                    loading="lazy"
                    className="h-5 w-5 rounded-full bg-white/10 object-contain p-0.5"
                  />
                ) : (
                  <span aria-hidden="true" className="text-sm">
                    ⚽
                  </span>
                )}
                <span className="font-bold text-slate-100">{team.name}</span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="text-slate-400">{venue.city ?? "—"}</span>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="tabular-nums text-slate-400">
                  {venue.capacity
                    ? `${venue.capacity.toLocaleString("en-US")} seats`
                    : "—"}
                </span>
              </span>
            );
          })}
        </div>

        {/* Pudar di tepi kiri & kanan supaya data "masuk" dengan halus */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/40 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/40 to-transparent"
        />
      </div>
    </div>
  );
}
