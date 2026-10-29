import { test } from "node:test";
import assert from "node:assert/strict";
import {
  freshParticipation,
  solarMatch,
  registerInterest,
  withdrawInterest,
  reviewApplication,
  applicationFor,
  startRipple,
  rippleResult,
  eligible,
  participationSummary,
  reportCase,
  updateCase,
} from "./participation.js";
const info = {
  area: 30,
  shading: "Low",
  roofType: "Pitched tiles",
  consent: true,
};
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
test("SolarMatch coefficients, shading and invalid input", () => {
  near(solarMatch(30, "Low").capacity, 5.1);
  assert.equal(solarMatch(30, "Low").daily.toFixed(1), "17.9");
  near(solarMatch(30, "Medium").daily, 17.85 * 0.85);
  near(solarMatch(30, "High").daily, 17.85 * 0.6);
  for (const area of [0, -1, "bad", 301, Infinity])
    assert.equal(solarMatch(area, "Low"), null);
  assert.equal(solarMatch(30, "Unknown"), null);
});
test("nonbinding application review, withdrawal and agreement restriction", () => {
  const seed = freshParticipation();
  const original = JSON.stringify(seed);
  assert.throws(() =>
    registerInterest(seed, "A12", { ...info, consent: false }),
  );
  let state = registerInterest(seed, "A12", info);
  assert.equal(applicationFor(state, "A12").reference, "SH-A12-001");
  assert.equal(JSON.stringify(seed), original);
  assert.throws(() => registerInterest(state, "A12", info));
  state = reviewApplication(
    state,
    "A12",
    "Under Review",
    "Please verify roof information.",
  );
  assert.equal(
    applicationFor(state, "A12").events.at(-1).note,
    "Please verify roof information.",
  );
  state = withdrawInterest(state, "A12");
  assert.equal(applicationFor(state, "A12").status, "Withdrawn");
  assert.equal(applicationFor(state, "A12").optedIn, false);
  assert.throws(() =>
    reviewApplication(state, "A12", "Interested", "Re-enrol"),
  );
  assert.throws(() => withdrawInterest(state, "B15"));
  state = registerInterest(state, "A12", info);
  assert.equal(applicationFor(state, "A12").reference, "SH-A12-002");
});
test("RoofRipple snapshots never mutate participation and alternatives require consent", () => {
  let state = registerInterest(freshParticipation(), "A12", info);
  const source = JSON.stringify(state);
  const scenario = startRipple(state);
  assert.ok(scenario.baseline.includes("A12"));
  const removed = { ...scenario, removed: "A12" };
  let result = rippleResult(removed);
  near(result.before, 22.95);
  near(result.after, 17.85);
  near(result.removedCapacity, 5.1);
  for (const a of result.alternatives) {
    assert.ok(eligible(a));
    assert.equal(a.optedIn, true);
    assert.ok(!scenario.baseline.includes(a.propertyId));
  }
  assert.equal(result.alternatives[0].propertyId, "B12");
  assert.ok(
    !result.alternatives.some((a) =>
      ["A15", "B13", "B14", "B15", "B16"].includes(a.propertyId),
    ),
  );
  result = rippleResult({ ...removed, alternative: "B12" });
  near(result.after, 24.99);
  near(result.delta, 2.04);
  assert.equal(JSON.stringify(state), source);
  near(rippleResult({ ...removed, alternative: "A15" }).after, 17.85);
  state = { ...state, rippleScenarios: [scenario] };
  const old = JSON.stringify(scenario);
  state = withdrawInterest(state, "A12");
  const next = startRipple(state);
  assert.ok(!next.baseline.includes("A12"));
  assert.equal(JSON.stringify(scenario), old);
  assert.equal(applicationFor(state, "B12").status, "Interested");
});
test("RoofRipple explicitly supports no eligible alternatives and empty baseline", () => {
  const state = freshParticipation();
  state.applications = state.applications.filter((a) =>
    ["A11", "A13", "B11"].includes(a.propertyId),
  );
  const s = startRipple(state);
  assert.deepEqual(rippleResult({ ...s, removed: "A11" }).alternatives, []);
  state.applications = [];
  const empty = rippleResult(startRipple(state));
  assert.equal(empty.before, 0);
  assert.equal(empty.after, 0);
});
test("installed resident support and capacity consistency", () => {
  let state = freshParticipation();
  const seed = JSON.stringify(state);
  assert.throws(() => reportCase(state, "A12", "Help"));
  state = reportCase(state, "B15", "Demo inverter display needs checking.");
  assert.equal(state.cases[0].id, "SR-001");
  assert.throws(() => reportCase(state, "B15", "Duplicate"));
  state = updateCase(
    state,
    "SR-001",
    "Visit Planned",
    "We will arrange a qualified inspection.",
  );
  assert.equal(
    state.cases[0].updates.at(-1).note,
    "We will arrange a qualified inspection.",
  );
  const before = participationSummary(state);
  state = updateCase(
    state,
    "SR-001",
    "Closed",
    "Inspection recorded; repair not verified.",
  );
  const after = participationSummary(state);
  near(before.candidateCapacity, after.candidateCapacity);
  near(before.installedCapacity, 6.12);
  assert.equal(after.openCases, 0);
  assert.equal(freshParticipation().cases.length, 0);
  assert.equal(JSON.stringify(freshParticipation()), seed);
});
