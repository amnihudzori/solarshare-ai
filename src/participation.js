// Fictional dataset and illustrative rules. No programme eligibility is inferred.
export const township = {
  id: "seri-hijau",
  name: "Seri Hijau Township",
  planningTarget: 24,
  coefficient: 0.17,
  sunHours: 3.5,
};
export const stages = [
  "Interested",
  "Under Review",
  "More Information Needed",
  "Site Assessment Recommended",
];
export const shadingMultipliers = { Low: 1, Medium: 0.85, High: 0.6 };
export function solarMatch(area, shading) {
  const n = Number(area);
  if (
    !Number.isFinite(n) ||
    n <= 0 ||
    n > 300 ||
    !Object.hasOwn(shadingMultipliers, shading)
  )
    return null;
  const capacity = n * township.coefficient;
  return {
    capacity,
    daily: capacity * township.sunHours * shadingMultipliers[shading],
  };
}
export const properties = [
  ["A11", 150, 130, 40, "Low", true],
  ["A12", 290, 130, 30, "Low", true],
  ["A13", 430, 130, 35, "Medium", true],
  ["A14", 150, 265, 32, "Low", false],
  ["A15", 290, 265, 28, "High", false],
  ["A16", 430, 265, 38, "Low", false],
  ["B11", 650, 130, 30, "Low", true],
  ["B12", 790, 130, 42, "Low", false],
  ["B13", 930, 130, 25, "Medium", false],
  ["B14", 650, 265, 33, "Low", false],
  ["B15", 790, 265, 36, "Low", false],
  ["B16", 930, 265, 45, "Low", false],
].map(([id, x, y, area, shading, planned]) => ({
  id,
  x,
  y,
  area,
  shading,
  planned,
  roofType: "Pitched tiles",
  address: `House ${id}, Jalan Seri Hijau`,
  townshipId: township.id,
}));
const seedStatuses = {
  A11: "Interested",
  A13: "Under Review",
  A14: "Interested",
  A16: "Site Assessment Recommended",
  B11: "Interested",
  B12: "Interested",
  B13: "More Information Needed",
  B14: "Withdrawn",
  B15: "Installed",
  B16: "Interested",
};
const initialProgressNotes = {
  Interested: "Interest received. The rooftop information is ready for review.",
  "Under Review": "Township management is reviewing the submitted roof details.",
  "More Information Needed": "More roof details are needed before the next step.",
  "Site Assessment Recommended": "A rooftop assessment is recommended as the next step.",
  Withdrawn: "The homeowner has withdrawn their interest.",
  Installed: "An existing solar installation is recorded for this home.",
};
export function freshParticipation() {
  return {
    selectedProperty: "A12",
    residentProperty: "A12",
    roofDrafts: {},
    rippleScenarios: [],
    cases: [],
    applications: properties
      .filter((p) => seedStatuses[p.id])
      .map((p) => ({
        reference: `SH-${p.id}-001`,
        propertyId: p.id,
        status: seedStatuses[p.id],
        area: p.area,
        shading: p.shading,
        roofType: p.roofType,
        complete: p.id !== "B13",
        optedIn: !["Withdrawn", "Installed"].includes(seedStatuses[p.id]),
        available: p.id !== "B16",
        binding: p.id === "B15",
        installedCapacity: p.id === "B15" ? 6.12 : 0,
        origin: "Synthetic seed record",
        revision: 1,
        events: [
          {
            stage: seedStatuses[p.id],
            note: initialProgressNotes[seedStatuses[p.id]],
            at: "2026-10-20T00:00:00.000Z",
          },
        ],
      })),
  };
}
export function applicationFor(state, id) {
  return state.applications.find((a) => a.propertyId === id);
}
export function propertyStatus(state, id) {
  return applicationFor(state, id)?.status || "No Recorded Interest";
}
export function eligible(a) {
  return Boolean(
    a &&
    a.optedIn &&
    a.available &&
    a.complete &&
    !a.binding &&
    stages.includes(a.status) &&
    solarMatch(a.area, a.shading),
  );
}
export function registerInterest(state, id, info) {
  const existing = applicationFor(state, id);
  if (
    !properties.some((p) => p.id === id) ||
    !solarMatch(info.area, info.shading) ||
    !info.roofType ||
    info.consent !== true
  )
    throw new Error(
      "Enter your roof details and confirm that you are interested first.",
    );
  if (existing && existing.status !== "Withdrawn")
    throw new Error("This property already has an application.");
  const revision = (existing?.revision || 0) + 1;
  const app = {
    reference: `SH-${id}-${String(revision).padStart(3, "0")}`,
    propertyId: id,
    area: Number(info.area),
    shading: info.shading,
    roofType: info.roofType,
    status: "Interested",
    complete: true,
    optedIn: true,
    available: true,
    binding: false,
    installedCapacity: 0,
    revision,
    origin: "User-entered fictional demo information",
    events: [
      ...(existing?.events || []),
      {
        stage: "Interested",
        note: "Your interest has been registered. Township management can now review your roof details.",
        at: new Date().toISOString(),
      },
    ],
  };
  return {
    ...state,
    applications: [
      ...state.applications.filter((a) => a.propertyId !== id),
      app,
    ],
  };
}
export function withdrawInterest(state, id) {
  const app = applicationFor(state, id);
  if (!app || app.binding || !stages.includes(app.status))
    throw new Error(
      "This application cannot be withdrawn here.",
    );
  return {
    ...state,
    applications: state.applications.map((a) =>
      a.propertyId === id
        ? {
            ...a,
            status: "Withdrawn",
            optedIn: false,
            available: false,
            events: [
              ...a.events,
              {
                stage: "Withdrawn",
                note: "The homeowner has withdrawn their interest.",
                at: new Date().toISOString(),
              },
            ],
          }
        : a,
    ),
  };
}
export function reviewApplication(state, id, status, note) {
  const app = applicationFor(state, id);
  if (
    !app ||
    app.binding ||
    !stages.includes(app.status) ||
    !stages.includes(status) ||
    !note.trim()
  )
    throw new Error(
      "Choose an active nonbinding application, a review stage, and a next step.",
    );
  return {
    ...state,
    applications: state.applications.map((a) =>
      a.propertyId === id
        ? {
            ...a,
            status,
            events: [
              ...a.events,
              {
                stage: status,
                note: note.trim(),
                at: new Date().toISOString(),
              },
            ],
          }
        : a,
    ),
  };
}
export function participationSummary(state) {
  const candidates = state.applications.filter(eligible);
  return {
    interested: state.applications.filter(
      (a) => a.optedIn && stages.includes(a.status),
    ).length,
    candidateCapacity: candidates.reduce(
      (n, a) => n + solarMatch(a.area, a.shading).capacity,
      0,
    ),
    installedCapacity: state.applications.reduce(
      (n, a) => n + (a.status === "Installed" ? a.installedCapacity : 0),
      0,
    ),
    withdrawn: state.applications.filter((a) => a.status === "Withdrawn")
      .length,
    openCases: state.cases.filter((c) => c.status !== "Closed").length,
  };
}
export function startRipple(state) {
  const snapshot = structuredClone(state.applications);
  const baseline = snapshot
    .filter(
      (a) =>
        eligible(a) && properties.find((p) => p.id === a.propertyId)?.planned,
    )
    .map((a) => a.propertyId);
  return {
    id: `RR-${String(state.rippleScenarios.length + 1).padStart(3, "0")}`,
    created: new Date().toISOString(),
    snapshot,
    baseline,
    removed: null,
    alternative: null,
    target: township.planningTarget,
  };
}
export function rippleResult(scenario) {
  const capacity = (id) =>
    solarMatch(
      scenario.snapshot.find((a) => a.propertyId === id).area,
      scenario.snapshot.find((a) => a.propertyId === id).shading,
    ).capacity;
  const before = scenario.baseline.reduce((n, id) => n + capacity(id), 0);
  const removed =
    scenario.removed && scenario.baseline.includes(scenario.removed)
      ? scenario.removed
      : null;
  const alternatives = scenario.snapshot
    .filter((a) => eligible(a) && !scenario.baseline.includes(a.propertyId))
    .sort(
      (a, b) =>
        solarMatch(b.area, b.shading).capacity -
          solarMatch(a.area, a.shading).capacity ||
        a.propertyId.localeCompare(b.propertyId),
    );
  const replacement = removed
    ? alternatives.find((a) => a.propertyId === scenario.alternative)
    : null;
  const after =
    before -
    (removed ? capacity(removed) : 0) +
    (replacement ? capacity(replacement.propertyId) : 0);
  return {
    before,
    after,
    delta: after - before,
    alternatives,
    removedCapacity: removed ? capacity(removed) : 0,
    replacementCapacity: replacement ? capacity(replacement.propertyId) : 0,
    ids: scenario.baseline
      .filter((id) => id !== removed)
      .concat(replacement ? [replacement.propertyId] : []),
  };
}
export function reportCase(state, id, issue) {
  if (applicationFor(state, id)?.status !== "Installed" || !issue.trim())
    throw new Error(
      "Choose a home with existing solar panels and describe the issue.",
    );
  if (state.cases.some((c) => c.propertyId === id && c.status !== "Closed"))
    throw new Error("This property already has an open support case.");
  const item = {
    id: `SR-${String(state.cases.length + 1).padStart(3, "0")}`,
    propertyId: id,
    issue: issue.trim(),
    status: "Reported",
    updates: [
      {
        status: "Reported",
        note: "Support request received. Township management will review the report.",
        at: new Date().toISOString(),
      },
    ],
  };
  return { ...state, cases: [...state.cases, item] };
}
export function updateCase(state, id, status, note) {
  if (
    !["Reported", "Reviewing", "Visit Planned", "Closed"].includes(status) ||
    !note.trim() ||
    !state.cases.some((c) => c.id === id)
  )
    throw new Error("Select a case, status, and resident-visible follow-up.");
  return {
    ...state,
    cases: state.cases.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            updates: [
              ...c.updates,
              { status, note: note.trim(), at: new Date().toISOString() },
            ],
          }
        : c,
    ),
  };
}
export const sources = [
  {
    title: "Energy Commission Malaysia — CREAM",
    url: "https://www.st.gov.my/sustainability/energy-transition-programmes/community-renewable-energy-aggregation-mechanism-cream",
    role: "Public programme reference. Scheme-specific requirements need professional review; no automated regulatory eligibility is claimed.",
  },
  {
    title: "Sime Darby Property — City of Elmina rooftop solar initiative",
    url: "https://www.simedarbyproperty.com/press-releases/sime-darby-property-launches-nations-first-residential-solar-project-under-netr",
    role: "Public initiative context only. Seri Hijau and its records are fictional and not corporate data.",
  },
  {
    title: "NASA POWER documentation",
    url: "https://power.larc.nasa.gov/docs/services/api/temporal/hourly/",
    role: "Weather and solar radiation reference; not connected to current estimates.",
  },
  {
    title: "PVWatts",
    url: "https://pvwatts.nlr.gov/pvwatts.php",
    role: "Public solar estimation reference; not integrated and not the source of our illustrative coefficients.",
  },
];
