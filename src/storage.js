import { properties } from "./participation.js";

// Keep browser-only progress when possible, while safely falling back from
// incomplete data saved by earlier versions of the prototype.
const validIds = new Set(properties.map((home) => home.id));
const validRoles = new Set(["manager", "resident"]);
const validScenarios = new Set(["problem", "normal", "cloudy"]);

export function restoreSavedState(saved, defaults) {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) {
    return structuredClone(defaults);
  }

  const p = saved.participation;
  const validParticipation =
    p &&
    typeof p === "object" &&
    Array.isArray(p.applications) &&
    p.applications.every(
      (a) =>
        a && validIds.has(a.propertyId) && typeof a.status === "string" &&
        Array.isArray(a.events),
    ) &&
    Array.isArray(p.rippleScenarios) &&
    p.rippleScenarios.every(
      (s) => s && typeof s.id === "string" &&
        Array.isArray(s.snapshot) && Array.isArray(s.baseline),
    ) &&
    Array.isArray(p.cases) &&
    p.cases.every((c) => c && typeof c.id === "string" && Array.isArray(c.updates));

  const participation = validParticipation
    ? {
        ...structuredClone(defaults.participation),
        ...p,
        selectedProperty: validIds.has(p.selectedProperty)
          ? p.selectedProperty
          : defaults.participation.selectedProperty,
        residentProperty: ["A12", "B15"].includes(p.residentProperty)
          ? p.residentProperty
          : defaults.participation.residentProperty,
        roofDrafts:
          p.roofDrafts && typeof p.roofDrafts === "object" && !Array.isArray(p.roofDrafts)
            ? p.roofDrafts
            : {},
      }
    : structuredClone(defaults.participation);

  return {
    ...structuredClone(defaults),
    role: validRoles.has(saved.role) ? saved.role : defaults.role,
    scenario: validScenarios.has(saved.scenario) ? saved.scenario : defaults.scenario,
    building: Number.isInteger(saved.building) && saved.building >= 0 && saved.building < 3
      ? saved.building
      : defaults.building,
    tasks: Array.isArray(saved.tasks) ? saved.tasks : [],
    name: typeof saved.name === "string" && saved.name.trim()
      ? saved.name.slice(0, 60)
      : defaults.name,
    applied: Boolean(saved.applied),
    equipment: typeof saved.equipment === "string" ? saved.equipment : defaults.equipment,
    participation,
  };
}
