import { test } from "node:test";
import assert from "node:assert/strict";
import { buildingsFor, totals, savings } from "./data.js";
test("deterministic scenario totals and weather-aware review", () => {
  assert.deepEqual(totals("normal"), {
    actual: 123,
    expected: 123,
    alerts: 0,
    shortfall: 0,
  });
  assert.deepEqual(totals("cloudy"), {
    actual: 57,
    expected: 59,
    alerts: 0,
    shortfall: 0,
  });
  assert.deepEqual(totals("problem"), {
    actual: 99,
    expected: 123,
    alerts: 1,
    shortfall: 24,
  });
  assert.equal(buildingsFor("problem")[1].percent, 60);
});
test("solar conservation and incremental financial benefit", () => {
  for (const applied of [false, true]) {
    const s = savings(applied);
    assert.equal(s.used + s.exported, 42);
  }
  assert.equal(savings(false).benefit, 0);
  assert.ok(Math.abs(savings(true).benefit - 3) < 1e-9);
});
