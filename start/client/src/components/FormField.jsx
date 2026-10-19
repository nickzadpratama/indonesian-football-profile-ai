export default function FormField({ id, label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg bg-slate-950/70 px-3 py-2 text-sm text-slate-200 ring-1 ring-white/10 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
      />
    </label>
  )
}
