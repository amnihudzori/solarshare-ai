import { freshParticipation } from "./participation.js";
export const scenarios = {
  problem: "Possible Problem",
  normal: "Normal Sunny Day",
  cloudy: "Cloudy Weather",
};
export const names = ["Community Hall", "Township Library", "Community Centre"];
const readings = {
  normal: [
    [42, 42],
    [40, 40],
    [41, 41],
  ],
  cloudy: [
    [19, 20],
    [18, 19],
    [20, 20],
  ],
  problem: [
    [42, 42],
    [16, 40],
    [41, 41],
  ],
};
export function buildingsFor(scenario) {
  return names.map((name, id) => {
    const [actual, expected] = readings[scenario][id];
    const shortfall = expected - actual;
    return {
      id,
      name,
      actual,
      expected,
      shortfall,
      percent: Math.round((shortfall / expected) * 100),
      flagged: shortfall / expected > 0.25,
    };
  });
}
export function totals(scenario) {
  return buildingsFor(scenario).reduce(
    (a, b) => ({
      actual: a.actual + b.actual,
      expected: a.expected + b.expected,
      alerts: a.alerts + Number(b.flagged),
      shortfall: a.shortfall + (b.flagged ? b.shortfall : 0),
    }),
    { actual: 0, expected: 0, alerts: 0, shortfall: 0 },
  );
}
export const checklist = [
  "Verify monitoring readings",
  "Check visible shading or dirt",
  "Review equipment status",
  "Record findings",
  "Contact a qualified technician if necessary",
];
export function savings(applied) {
  const shifted = applied ? 10 : 0;
  return {
    used: 24 + shifted,
    exported: 18 - shifted,
    shifted,
    benefit: shifted * (0.4 - 0.1),
  };
}
export const initial = {
  role: "manager",
  scenario: "problem",
  building: 1,
  tasks: [],
  applied: false,
  equipment: "EV Charger",
  name: "Township Team",
  participation: freshParticipation(),
};
export const solarHours = [
  { time: "7 AM", solar: 2 },
  { time: "9 AM", solar: 15 },
  { time: "11 AM", solar: 35 },
  { time: "12 PM", solar: 42 },
  { time: "2 PM", solar: 36 },
  { time: "4 PM", solar: 18 },
  { time: "6 PM", solar: 2 },
  { time: "8 PM", solar: 0 },
];
