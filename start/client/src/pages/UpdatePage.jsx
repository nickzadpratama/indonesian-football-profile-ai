import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import FormField from "../components/FormField.jsx";
import { Loader, ErrorPanel } from "../components/Status.jsx";
import { API_BASE_URL, authHeaders } from "../api/auth.js";
import { toastifyError, toastifySuccess } from "../utils/toastify.js";

/**
 * Update a joined team (name / code / founded / stadium / city / capacity)
 * via the server's PUT /:id endpoint. Reached from the "✎ Update" button
 * on a MyTeamCard in My Teams. Current values are loaded first so the form
 * always starts from the saved data.
 */
export default function UpdatePage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    code: "",
    founded: "",
    stadium: "",
    city: "",
    capacity: "",
  });
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("loading"); // 'loading' | 'ok' | 'error'
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${API_BASE_URL}/${teamId}`, {
        headers: authHeaders(),
      })
      .then(({ data }) => {
        if (cancelled) return;
        const team = data.data ?? {};
        setTeamName(team.name ?? "");
        setForm({
          name: team.name ?? "",
          code: team.code ?? "",
          founded: team.founded ?? "",
          stadium: team.stadium ?? "",
          city: team.city ?? "",
          capacity: team.capacity ?? "",
        });
        setPhase("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err?.response?.data?.message ?? err?.message;
        setError(message);
        setPhase("error");
        toastifyError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [teamId, reloadKey]);

  const setField = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await axios.put(`${API_BASE_URL}/${teamId}`, form, {
        headers: authHeaders(),
      });
      toastifySuccess(data?.message ?? "Team updated successfully ✓");
      navigate("/myTeam");
    } catch (err) {
      const message =
        err?.response?.data?.message ?? err?.message ?? "Failed to update team";
      setError(message);
      toastifyError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="pt-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-slate-900/80 p-6 shadow-lg shadow-slate-950/40 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/myTeam")}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-200 ring-1 ring-white/20 transition hover:bg-white/20"
              aria-label="Back to my teams"
            >
              ←
            </button>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-emerald-500 text-xl shadow-md shadow-violet-500/20 ring-2 ring-white/20">
              ✎
            </span>
          </div>
          <h1 className="mt-3 text-center text-2xl font-black tracking-tight text-white">
            Update team
          </h1>
          <p className="mt-1 text-center text-sm text-slate-400">
            {teamName ? (
              <>
                Editing{" "}
                <span className="font-semibold text-emerald-300">
                  {teamName}
                </span>
              </>
            ) : (
              "Edit your joined team details."
            )}
          </p>

          {phase === "loading" && (
            <div className="mt-6">
              <Loader label="Loading team…" />
            </div>
          )}
          {phase === "error" && (
            <div className="mt-6">
              <ErrorPanel
                message={error}
                onRetry={() => {
                  setPhase("loading");
                  setReloadKey((key) => key + 1);
                }}
              />
            </div>
          )}
          {phase === "ok" && (
            <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
              <FormField
                id="update-name"
                label="Team name"
                type="text"
                value={form.name}
                onChange={setField("name")}
                placeholder="Team name"
              />
              <FormField
                id="update-code"
                label="Code"
                type="text"
                value={form.code}
                onChange={setField("code")}
                placeholder="e.g. PSB"
              />
              <FormField
                id="update-founded"
                label="Founded"
                type="text"
                value={form.founded}
                onChange={setField("founded")}
                placeholder="e.g. 1954"
              />
              <FormField
                id="update-stadium"
                label="Stadium"
                type="text"
                value={form.stadium}
                onChange={setField("stadium")}
                placeholder="Stadium name"
              />
              <FormField
                id="update-city"
                label="City"
                type="text"
                value={form.city}
                onChange={setField("city")}
                placeholder="City"
              />
              <FormField
                id="update-capacity"
                label="Capacity"
                type="text"
                value={form.capacity}
                onChange={setField("capacity")}
                placeholder="e.g. 38000"
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
                disabled={saving}
                className="w-full rounded-lg bg-emerald-500/20 py-2.5 text-sm font-black text-emerald-300 ring-1 ring-emerald-400/40 transition hover:bg-emerald-500/30 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
