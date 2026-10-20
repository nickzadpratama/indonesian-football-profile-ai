function normalize(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export default function filterTeams(teams, query) {
  const entries = Array.isArray(teams) ? teams : [];
  const terms = normalize(query).split(" ").filter(Boolean);

  return entries.filter((entry) => {
    const fields = [entry?.team?.name, entry?.team?.code, entry?.venue?.city].map(normalize);
    return terms.every((term) => fields.some((field) => field.includes(term)));
  });
}