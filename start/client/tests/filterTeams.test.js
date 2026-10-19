import { test } from "node:test";
import assert from "node:assert/strict";
import filterTeams from "../src/utils/filterTeams.js";

const teams = [
  { team: { id: 1, name: "Persija Jakarta", code: "PSJ" }, venue: { city: "Jakarta" } },
  { team: { id: 2, name: "Persib Bandung", code: "PSB" }, venue: { city: "Bandung" } },
  { team: { id: 3, name: "Bali United", code: null }, venue: { city: "Gianyar" } },
];

test("matches names without case sensitivity or surrounding whitespace", () => {
  assert.deepEqual(filterTeams(teams, "  PERSIJA  "), [teams[0]]);
});

test("matches team codes and venue cities", () => {
  assert.deepEqual(filterTeams(teams, "psb"), [teams[1]]);
  assert.deepEqual(filterTeams(teams, "gianyar"), [teams[2]]);
});

test("matches multiple words across searchable fields", () => {
  assert.deepEqual(filterTeams(teams, "  bali   gianyar "), [teams[2]]);
  assert.deepEqual(filterTeams(teams, "persija bandung"), []);
});

test("empty searches restore all entries without mutating the input", () => {
  assert.deepEqual(filterTeams(teams, "   "), teams);
  assert.equal(teams.length, 3);
});

test("handles unavailable data and missing fields safely", () => {
  assert.deepEqual(filterTeams(null, "persija"), []);
  assert.deepEqual(filterTeams([null, {}, { team: {} }], "persija"), []);
});

test("filters the full list before pagination", () => {
  const entries = [...Array.from({ length: 18 }, () => teams[0]), teams[1]];
  assert.deepEqual(filterTeams(entries, "bandung").slice(0, 18), [teams[1]]);
});