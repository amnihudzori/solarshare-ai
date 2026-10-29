import { test } from "node:test";
import assert from "node:assert/strict";
import { initial } from "./data.js";
import { restoreSavedState } from "./storage.js";
import { registerInterest, freshParticipation, applicationFor } from "./participation.js";

test("fresh browser uses independent default data", () => {
  const a = restoreSavedState(null, initial);
  const b = restoreSavedState(null, initial);
  a.participation.applications[0].events[0].note = "Edited";
  assert.notEqual(b.participation.applications[0].events[0].note, "Edited");
});
test("existing valid resident applications survive a reload", () => {
  const p = registerInterest(freshParticipation(), "A12", {
    area: 30, shading: "Low", roofType: "Pitched tiles", consent: true,
  });
  const persisted = { ...initial, role: "resident", participation: p };
  const restored = restoreSavedState(JSON.parse(JSON.stringify(persisted)), initial);
  assert.equal(restored.role, "resident");
  assert.equal(applicationFor(restored.participation, "A12").status, "Interested");
});
test("incomplete or malformed old saved data repairs safely", () => {
  let r = restoreSavedState({ role: "manager", scenario: "normal", tasks: [] }, initial);
  assert.ok(Array.isArray(r.participation.applications));
  assert.equal(r.scenario, "normal");
  r = restoreSavedState({ role: "wrong", building: -1, participation: { cases: [] } }, initial);
  assert.equal(r.role, "manager");
  assert.equal(r.building, initial.building);
  assert.equal(r.participation.selectedProperty, "A12");
});
