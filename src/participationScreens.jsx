
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Building2,
  Leaf,
  ShieldCheck,
  Sun,
  Users,
  ClipboardList,
  LifeBuoy,
} from "lucide-react";

import { useApp } from "./store";

import {
  Shell,
  Heading,
  Tabs,
  Stat,
  Button,
} from "./components";

import { TownshipMap } from "./TownshipMap";

import {
  properties,
  stages,
  solarMatch,
  applicationFor,
  propertyStatus,
  eligible,
  participationSummary,
  registerInterest,
  withdrawInterest,
  reviewApplication,
  startRipple,
  rippleResult,
  reportCase,
  updateCase,
} from "./participation";

const fmt = (n) =>
  Number(n)
    .toFixed(2)
    .replace(/0$/, "")
    .replace(/\.0$/, "");

function Status({ status }) {
  return (
    <span
      className={`participation-status status-${status
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      {status}
    </span>
  );
}

// ========================================
// 1. TOWNSHIP OVERVIEW
// ========================================

export function ManagementHome() {
  const { state, update } = useApp();
  const p = state.participation;
  const summary = participationSummary(p);
  const nav = useNavigate();

  const selected =
    properties.find(
      (home) => home.id === p.selectedProperty
    ) || properties[1];

  const selectedApplication = applicationFor(
    p,
    selected.id
  );

  return (
    <Shell>
      <Heading
        title="Township Overview"
        subtitle="Track homeowner interest, explore rooftop potential and respond to community support requests."
      />

      <div className="stats">
        <Stat
          title="Homes Interested"
          value={summary.interested}
          detail="Homeowners who registered their interest"
          icon={Users}
        />

        <Stat
          title="Estimated Solar Capacity"
          value={fmt(summary.candidateCapacity)}
          unit="kWp"
          detail="Potential from interested, available homes"
          icon={Sun}
        />

        <Stat
          title="Existing Solar Capacity"
          value={fmt(summary.installedCapacity)}
          unit="kWp"
          detail="Solar systems already installed"
          icon={Building2}
        />

        <Stat
          title="Open Support Requests"
          value={summary.openCases}
          detail="Resident issues waiting for follow-up"
          icon={LifeBuoy}
        />
      </div>

      <div className="township-layout">
        <section className="card planner-map-card">
          <div className="section-title">
            <div>
              <h2>Neighbourhood Rooftop Map</h2>
              <p>
                Select a house to see its solar
                participation details.
              </p>
            </div>

            <button
              className="text-button"
              onClick={() => nav("/planner")}
            >
              Open Planner
              <ArrowRight size={15} />
            </button>
          </div>

          <TownshipMap
            data={p}
            selected={p.selectedProperty}
            onSelect={(id) =>
              update({
                participation: {
                  ...p,
                  selectedProperty: id,
                },
              })
            }
          />
        </section>

        <section className="card property-panel">
          <span className="eyebrow">
            SELECTED HOME
          </span>

          <h2>House {selected.id}</h2>
          <p>{selected.address}</p>

          <Status
            status={propertyStatus(p, selected.id)}
          />

          <div className="property-fact">
            <small>Application ID</small>

            <strong>
              {selectedApplication?.reference ||
                "No application yet"}
            </strong>
          </div>

          {selectedApplication ? (
            <>
              <p>
                View this homeowner's application
                and update their next step.
              </p>

              <Button onClick={() => nav("/review")}>
                Review This Application
                <ArrowRight size={15} />
              </Button>
            </>
          ) : (
            <>
              <p>
                No interest has been registered
                for this home yet.
              </p>

              <Button onClick={() => nav("/planner")}>
                View in Planner
                <ArrowRight size={15} />
              </Button>
            </>
          )}

          <Button
            secondary
            onClick={() =>
              nav("/planner?tab=RoofRipple")
            }
          >
            Plan with RoofRipple
          </Button>
        </section>
      </div>
    </Shell>
  );
}

// ========================================
// 2. TOWNSHIP SOLAR PLANNER
// ========================================

export function Planner() {
  const { state, update } = useApp();
  const p = state.participation;
  const nav = useNavigate();

  const [tab, setTab] = useState(() =>
    window.location.hash.includes("RoofRipple")
      ? "RoofRipple"
      : "Township Map"
  );

  const [scenarioId, setScenarioId] = useState(
    () => p.rippleScenarios.at(-1)?.id
  );

  const scenario = p.rippleScenarios.find(
    (item) => item.id === scenarioId
  );

  const result = scenario
    ? rippleResult(scenario)
    : null;

  const outdated =
    scenario &&
    JSON.stringify(scenario.snapshot) !==
      JSON.stringify(p.applications);

  const olderPlan =
    scenario &&
    scenario.id !==
      p.rippleScenarios.at(-1)?.id;

  const readOnly = outdated || olderPlan;

  const selected =
    properties.find(
      (home) => home.id === p.selectedProperty
    ) || properties[1];

  const app = applicationFor(p, selected.id);

  const estimate = app
    ? solarMatch(app.area, app.shading)
    : null;

  function selectHome(id) {
    update({
      participation: {
        ...p,
        selectedProperty: id,
      },
    });
  }

  function createPlan() {
    const next = startRipple(p);

    update({
      participation: {
        ...p,
        rippleScenarios: [
          ...p.rippleScenarios,
          next,
        ],
      },
    });

    setScenarioId(next.id);
  }

  function editPlan(changes) {
    if (readOnly || !scenario) return;

    update({
      participation: {
        ...p,
        rippleScenarios: p.rippleScenarios.map(
          (item) =>
            item.id === scenario.id
              ? { ...item, ...changes }
              : item
        ),
      },
    });
  }

  const hasSelection = Boolean(scenario?.removed);
  const hasAlternative = Boolean(scenario?.alternative);

  return (
    <Shell>
      <Heading
        title="Township Solar Planner"
        subtitle="Explore rooftop opportunities and plan for changes in homeowner participation."
      />

      <div className="planner-toolbar">
        <Tabs
          items={["Township Map", "RoofRipple"]}
          value={tab}
          onChange={setTab}
        />

        {tab === "Township Map" && (
          <label className="house-search">
            Find a home

            <select
              aria-label="Choose a house"
              value={p.selectedProperty}
              onChange={(event) =>
                selectHome(event.target.value)
              }
            >
              {properties.map((home) => (
                <option key={home.id} value={home.id}>
                  House {home.id}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="township-layout">
        <section className="card planner-map-card">
          <div className="section-title">
            <div>
              <h2>
                {tab === "RoofRipple"
                  ? "RoofRipple — Explore Changes"
                  : "Neighbourhood Rooftop Map"}
              </h2>

              <p>
                {tab === "RoofRipple"
                  ? "See how changing the homes in your plan affects estimated solar capacity."
                  : "Select a house to view its solar potential and application status."}
              </p>
            </div>
          </div>

          <TownshipMap
            data={
              tab === "RoofRipple" && scenario
                ? {
                    ...p,
                    applications: scenario.snapshot,
                  }
                : p
            }
            selected={p.selectedProperty}
            onSelect={selectHome}
            removed={
              tab === "RoofRipple"
                ? scenario?.removed
                : null
            }
            replacement={
              tab === "RoofRipple"
                ? scenario?.alternative
                : null
            }
            portfolio={
              tab === "RoofRipple"
                ? result?.ids || []
                : []
            }
            snapshot={
              tab === "RoofRipple" &&
              Boolean(scenario)
            }
          />

          {tab === "RoofRipple" &&
            scenario &&
            result && (
              <div className="ripple-figures">
                <div>
                  <small>Before changes</small>
                  <strong>
                    {fmt(result.before)} kWp
                  </strong>
                </div>

                <div>
                  <small>After changes</small>
                  <strong>
                    {fmt(result.after)} kWp
                  </strong>
                </div>

                <div>
                  <small>Capacity change</small>
                  <strong>
                    {result.delta > 0 ? "+" : ""}
                    {fmt(result.delta)} kWp
                  </strong>
                </div>

                <div>
                  <small>Your planning goal</small>
                  <strong>
                    {fmt(scenario.target)} kWp
                  </strong>
                </div>
              </div>
            )}

          {tab === "RoofRipple" &&
            scenario &&
            result && (
              <div className="info-note compact">
                <ShieldCheck size={16} />

                <span>
                  {!hasSelection
                    ? "First, choose a home on the right to see what happens if it leaves the plan."
                    : !hasAlternative
                    ? `Removing House ${scenario.removed} reduces estimated capacity by ${fmt(result.removedCapacity)} kWp. Choose another interested home to see if it helps.`
                    : `With House ${scenario.alternative} added, the plan reaches ${fmt(result.after)} kWp. ${
                        result.after >= scenario.target
                          ? "Your planning goal is met."
                          : "Your planning goal is not reached yet."
                      }`}
                </span>
              </div>
            )}
        </section>

        <section className="card property-panel planner-side">
          {tab === "Township Map" ? (
            <>
              <span className="eyebrow">
                HOME DETAILS
              </span>

              <h2>House {selected.id}</h2>
              <p>{selected.address}</p>

              <Status
                status={propertyStatus(p, selected.id)}
              />

              {app ? (
                <>
                  <div className="property-fact">
                    <small>Roof details</small>

                    <strong>
                      {app.area} m² · {app.shading} shading
                      · {app.roofType}
                    </strong>
                  </div>

                  <div className="property-fact">
                    <small>
                      {app.status === "Installed"
                        ? "Existing solar capacity"
                        : "Estimated solar capacity"}
                    </small>

                    <strong>
                      {fmt(
                        app.status === "Installed"
                          ? app.installedCapacity
                          : estimate?.capacity || 0
                      )}{" "}
                      kWp
                    </strong>
                  </div>

                  <p>
                    {app.status === "Installed"
                      ? "This home already has a solar installation recorded."
                      : eligible(app)
                      ? "This homeowner is interested and has provided basic roof details."
                      : app.status === "Withdrawn"
                      ? "This homeowner has withdrawn their interest."
                      : "This home's application needs further review."}
                  </p>

                  <Button
                    onClick={() => nav("/review")}
                  >
                    View Application
                  </Button>
                </>
              ) : (
                <>
                  <p>
                    No interest has been registered
                    for this home yet.
                  </p>

                  <p>
                    Residents can check their
                    rooftop potential and register
                    interest from My Solar Opportunity.
                  </p>
                </>
              )}

              <Button
                secondary
                onClick={() => setTab("RoofRipple")}
              >
                Open RoofRipple
              </Button>
            </>
          ) : (
            <>
              <span className="eyebrow">
                ROOFRIPPLE · TOWNSHIP PLANNING
              </span>

              <h2>Plan for a change</h2>

              <p>
                What if a homeowner leaves the solar
                programme? Try another interested
                home and compare the results.
              </p>

              <Button onClick={createPlan}>
                Create New Plan
              </Button>

              {p.rippleScenarios.length > 0 && (
                <label>
                  Saved plans

                  <select
                    aria-label="Select saved RoofRipple plan"
                    value={scenarioId || ""}
                    onChange={(event) =>
                      setScenarioId(event.target.value)
                    }
                  >
                    {p.rippleScenarios.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.id} ·{" "}
                        {item.baseline.length} starting homes
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {!scenario && (
                <p>
                  Choose Create New Plan to get started.
                </p>
              )}

              {scenario && (
                <>
                  {readOnly && (
                    <p className="ripple-warning">
                      {olderPlan
                        ? "This is an older saved plan. Create a new plan to make changes."
                        : "Homeowner applications have changed. Create a new plan to use the latest information."}
                    </p>
                  )}

                  <label>
                    Your solar planning goal (kWp)

                    <input
                      type="number"
                      aria-label="Solar planning goal"
                      min="1"
                      max="500"
                      step="0.5"
                      disabled={readOnly}
                      value={scenario.target}
                      onChange={(event) => {
                        const value = Number(
                          event.target.value
                        );

                        if (
                          Number.isFinite(value) &&
                          value >= 1 &&
                          value <= 500
                        ) {
                          editPlan({ target: value });
                        }
                      }}
                    />

                    <small>
                      This is a goal chosen for
                      your plan, not an official
                      programme requirement.
                    </small>
                  </label>

                  {scenario.baseline.length > 0 ? (
                    <label>
                      What if this home leaves?

                      <select
                        aria-label="Choose home to remove from plan"
                        disabled={readOnly}
                        value={scenario.removed || ""}
                        onChange={(event) =>
                          editPlan({
                            removed:
                              event.target.value || null,
                            alternative: null,
                          })
                        }
                      >
                        <option value="">
                          Choose a home
                        </option>

                        {scenario.baseline.map((id) => (
                          <option
                            key={id}
                            value={id}
                          >
                            House {id}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p>
                      There are no interested
                      homes in this plan yet.
                    </p>
                  )}

                  {hasSelection && !readOnly && (
                    <div className="alternative-list">
                      <h3>Other Interested Homes</h3>

                      <p>
                        Try another home to see
                        whether it can help replace
                        the lost solar capacity.
                      </p>

                      {result.alternatives.length > 0 ? (
                        result.alternatives.map(
                          (home) => {
                            const isAdded =
                              scenario.alternative ===
                              home.propertyId;

                            return (
                              <button
                                key={home.propertyId}
                                type="button"
                                className={
                                  isAdded ? "chosen" : ""
                                }
                                onClick={() =>
                                  editPlan({
                                    alternative: isAdded
                                      ? null
                                      : home.propertyId,
                                  })
                                }
                              >
                                <strong>
                                  House {home.propertyId} ·{" "}
                                  {fmt(
                                    solarMatch(
                                      home.area,
                                      home.shading
                                    ).capacity
                                  )}{" "}
                                  kWp
                                </strong>

                                <small>
                                  Homeowner is interested.
                                  Roof details are provided.
                                  A roof assessment is still
                                  needed.
                                </small>

                                <span>
                                  {isAdded
                                    ? "Remove from Plan"
                                    : "Add to Plan"}{" "}
                                  →
                                </span>
                              </button>
                            );
                          }
                        )
                      ) : (
                        <p>
                          No other interested homes
                          are currently available
                          for this plan.
                        </p>
                      )}
                    </div>
                  )}

                  <small>
                    Changes here affect this plan
                    only. Homeowner applications
                    remain unchanged.
                  </small>
                </>
              )}
            </>
          )}
        </section>
      </div>
    </Shell>
  );
}

// ========================================
// 3. RESIDENT SOLARMATCH + APPLICATION
// ========================================

export function Opportunity() {
  const { state, update, setToast } = useApp();
  const p = state.participation;
  const id = p.residentProperty;
  const app = applicationFor(p, id);

  const property =
    properties.find((home) => home.id === id) ||
    properties[0];

  const [tab, setTab] = useState("SolarMatch");
  const [consent, setConsent] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const existingSolar = app?.status === "Installed";

  const roof = p.roofDrafts[id] || {
    area: app?.area ?? property.area,
    shading: app?.shading ?? property.shading,
    roofType: app?.roofType ?? property.roofType,
  };

  const estimate = solarMatch(
    roof.area,
    roof.shading
  );

  function editRoof(changes) {
    update({
      participation: {
        ...p,
        roofDrafts: {
          ...p.roofDrafts,
          [id]: { ...roof, ...changes },
        },
      },
    });
  }

  function register() {
    try {
      update({
        participation: registerInterest(
          p,
          id,
          { ...roof, consent }
        ),
      });

      setError("");
      setTab("My Application");

      setToast(
        "Your interest has been registered."
      );
    } catch (e) {
      setError(e.message);
    }
  }

  function withdraw() {
    try {
      update({
        participation: withdrawInterest(p, id),
      });

      setConfirm(false);
      setError("");

      setToast(
        "Your interest has been withdrawn."
      );
    } catch (e) {
      setError(e.message);
    }
  }

  function changeTab(next) {
    setTab(next);
    setConfirm(false);
    setError("");
  }

  return (
    <Shell resident>
      <Heading
        title="My Solar Opportunity"
        subtitle="Check your rooftop potential, register your interest and follow your application."
      />

      <div className="planner-toolbar">
        <Tabs
          items={[
            "SolarMatch",
            "My Application",
            "Solar Rescue",
          ]}
          value={tab}
          onChange={changeTab}
        />

        <label className="persona-select">
          Choose a home

          <select
            aria-label="Choose a resident home"
            value={id}
            onChange={(e) => {
              update({
                participation: {
                  ...p,
                  residentProperty: e.target.value,
                },
              });

              setConsent(false);
              setConfirm(false);
              setError("");
            }}
          >
            <option value="A12">
              House A12 · Rooftop enquiry
            </option>

            <option value="B15">
              House B15 · Solar already installed
            </option>
          </select>
        </label>

        <button
          className="text-button"
          onClick={() => navigate("/community")}
        >
          About Community Solar
          <ArrowRight size={14} />
        </button>
      </div>

      {tab === "SolarMatch" ? (
        <div className="opportunity-layout">
          <section className="card opportunity-form">
            <span className="eyebrow">
              SOLARMATCH · ROOFTOP CHECK
            </span>

            <h2>
              Explore the solar potential
              of House {id}
            </h2>

            <p>
              Tell us about the roof. The estimate
              updates as you make changes.
            </p>

            <div className="roof-fields">
              <label>
                Usable roof space (m²)

                <input
                  aria-label="Usable roof space"
                  type="number"
                  min="1"
                  max="300"
                  value={roof.area}
                  onChange={(e) =>
                    editRoof({
                      area: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Roof shade

                <select
                  aria-label="Roof shade"
                  value={roof.shading}
                  onChange={(e) =>
                    editRoof({
                      shading: e.target.value,
                    })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>

              <label>
                Roof type

                <select
                  aria-label="Roof type"
                  value={roof.roofType}
                  onChange={(e) =>
                    editRoof({
                      roofType: e.target.value,
                    })
                  }
                >
                  <option>Pitched tiles</option>
                  <option>Metal roof</option>
                  <option>Flat roof</option>
                  <option>Unsure</option>
                </select>
              </label>
            </div>

            <div className="estimate-equations">
              <strong>How this works</strong>

              <p>
                SolarMatch estimates how much
                solar equipment could fit on the
                usable part of your roof, taking
                shade into account.
              </p>

              <small>
                Low shade means more sunlight
                reaches the panels. Calculation
                details are available in
                Data &amp; Sources.
              </small>
            </div>

            {existingSolar ? (
              <div
                className="info-note"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <span>
                  House {id} already has a solar
                  system. Need assistance?
                  Use Solar Rescue to submit
                  a support request.
                </span>

                <button
                  className="text-button"
                  onClick={() =>
                    changeTab("Solar Rescue")
                  }
                >
                  Open Solar Rescue →
                </button>
              </div>
            ) : app && app.status !== "Withdrawn" ? (
              <div
                className="info-note"
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <span>
                  This home already has application{" "}
                  {app.reference}. You can check
                  its latest progress under
                  My Application.
                </span>

                <button
                  className="text-button"
                  onClick={() =>
                    changeTab("My Application")
                  }
                >
                  View Application →
                </button>
              </div>
            ) : (
              <>
                <label className="consent-check">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) =>
                      setConsent(e.target.checked)
                    }
                  />

                  I would like to know more
                  about joining the solar
                  programme. I understand
                  that registering interest
                  is not a contract.
                </label>

                <Button
                  disabled={!estimate || !consent}
                  onClick={register}
                >
                  Register My Interest
                  <ArrowRight size={15} />
                </Button>
              </>
            )}

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </section>

          <section className="card opportunity-result">
            <span className="icon-box">
              <Sun />
            </span>

            <span className="eyebrow">
              YOUR ROOFTOP ESTIMATE
            </span>

            {estimate ? (
              <>
                <strong>
                  {fmt(estimate.capacity)}

                  <span>
                    kWp · Potential solar system size
                  </span>
                </strong>

                <strong>
                  {estimate.daily.toFixed(1)}

                  <span>
                    kWh · Estimated electricity per day
                  </span>
                </strong>
              </>
            ) : (
              <p role="alert">
                Enter a usable roof area
                between 1 and 300 m².
              </p>
            )}

            <p>
              This is an early estimate based
              on your roof details. An installer
              would need to check the actual
              site before confirming a system.
            </p>

            <small>
              Estimates use stated calculation
              assumptions. See Data &amp; Sources.
            </small>
          </section>
        </div>
      ) : tab === "My Application" ? (
        <div className="opportunity-layout">
          <section className="card application-card">
            <span className="eyebrow">
              HOUSE {id} · APPLICATION PROGRESS
            </span>

            <h2>
              {app
                ? app.reference
                : "No application yet"}
            </h2>

            <Status
              status={
                app?.status ||
                "No Recorded Interest"
              }
            />

            {app ? (
              <>
                <div className="application-details">
                  <div>
                    <small>Roof space</small>
                    <strong>{app.area} m²</strong>
                  </div>

                  <div>
                    <small>Roof condition</small>

                    <strong>
                      {app.shading} shade ·{" "}
                      {app.roofType}
                    </strong>
                  </div>

                  <div>
                    <small>Latest update</small>

                    <strong>
                      {app.events.at(-1)?.note ||
                        "No update yet"}
                    </strong>
                  </div>
                </div>

                <h3>Application Updates</h3>

                <div className="record-history">
                  {app.events.map(
                    (event, index) => (
                      <div key={index}>
                        <Status status={event.stage} />
                        <p>{event.note}</p>
                      </div>
                    )
                  )}
                </div>

                {existingSolar ? (
                  <>
                    <p>
                      This home has an existing
                      solar system. Need help
                      with it?
                    </p>

                    <Button
                      onClick={() =>
                        changeTab("Solar Rescue")
                      }
                    >
                      Open Solar Rescue
                    </Button>
                  </>
                ) : app.status === "Withdrawn" ? (
                  <div className="info-note">
                    Your interest has been
                    withdrawn. You can start
                    a new enquiry from SolarMatch.
                  </div>
                ) : stages.includes(app.status) ? (
                  confirm ? (
                    <div
                      className="withdraw-confirm"
                      role="alert"
                    >
                      <h3>
                        Withdraw your interest
                        for House {id}?
                      </h3>

                      <p>
                        The application will
                        show as Withdrawn.
                        This does not change
                        old saved RoofRipple plans.
                      </p>

                      <div className="button-row">
                        <Button
                          secondary
                          onClick={() =>
                            setConfirm(false)
                          }
                        >
                          Keep My Interest
                        </Button>

                        <Button onClick={withdraw}>
                          Confirm Withdrawal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      secondary
                      onClick={() =>
                        setConfirm(true)
                      }
                    >
                      Withdraw My Interest
                    </Button>
                  )
                ) : null}
              </>
            ) : (
              <>
                <p>
                  Want to explore solar for
                  this home? Start by checking
                  its rooftop potential.
                </p>

                <Button
                  onClick={() =>
                    changeTab("SolarMatch")
                  }
                >
                  Check My Rooftop
                </Button>
              </>
            )}

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </section>

          <section className="card resident-next">
            <Leaf size={42} />

            <h2>Your home, your decision.</h2>

            <p>
              You can explore solar and follow
              your application here. Registering
              interest does not commit you to
              installing solar panels.
            </p>

            <p>
              If management needs more details,
              the next step will appear in
              your application updates.
            </p>
          </section>
        </div>
      ) : (
        <RescueWorkspace resident />
      )}
    </Shell>
  );
}

// ========================================
// 4. SOLAR RESCUE
// ========================================

function RescueWorkspace({
  resident = false,
}) {
  const { state, update, setToast } = useApp();
  const p = state.participation;
  const id = p.residentProperty;

  const available = resident
    ? p.cases.filter(
        (c) => c.propertyId === id
      )
    : p.cases;

  const [selectedId, setSelectedId] =
    useState("");

  const activeCase =
    available.find(
      (c) => c.id === selectedId
    ) || available[0];

  const [issue, setIssue] = useState("");
  const [note, setNote] = useState("");

  const [stage, setStage] = useState(
    activeCase?.status || "Reviewing"
  );

  const [error, setError] = useState("");

  const installedHome =
    applicationFor(p, id)?.status ===
    "Installed";

  useEffect(() => {
    setStage(
      activeCase?.status || "Reviewing"
    );
  }, [
    activeCase?.id,
    activeCase?.status,
  ]);

  function submitReport() {
    try {
      update({
        participation: reportCase(
          p,
          id,
          issue
        ),
      });

      setIssue("");
      setError("");

      setToast(
        "Support request saved. Track its progress here."
      );
    } catch (e) {
      setError(e.message);
    }
  }

  function saveUpdate() {
    if (!activeCase) return;

    try {
      update({
        participation: updateCase(
          p,
          activeCase.id,
          stage,
          note
        ),
      });

      setNote("");
      setError("");

      setToast(
        "Support request update saved."
      );
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="rescue-layout">
      <section className="card support-list">
        <span className="eyebrow">
          {resident
            ? `HOUSE ${id}`
            : "COMMUNITY SUPPORT"}
        </span>

        <h2>
          {resident
            ? "Report a Solar Problem"
            : "Support Requests"}
        </h2>

        {resident ? (
          installedHome ? (
            <>
              <p>
                Having trouble with an
                existing solar system?
                Describe the problem and
                follow updates from township
                management here.
              </p>

              <label>
                What is the problem?

                <textarea
                  aria-label="Describe your solar problem"
                  value={issue}
                  onChange={(e) =>
                    setIssue(e.target.value)
                  }
                  maxLength={1000}
                  placeholder="For example: The solar inverter is showing an error light."
                />
              </label>

              <Button
                disabled={!issue.trim()}
                onClick={submitReport}
              >
                Send Support Request
              </Button>
            </>
          ) : (
            <div className="info-note">
              Solar Rescue is for homes with
              installed solar panels.
              Select House B15 to see how
              support requests work.
            </div>
          )
        ) : (
          <p>
            Select a request to see the
            problem and send an update
            to the resident.
          </p>
        )}

        <h3>
          {resident
            ? "My Requests"
            : "All Requests"}{" "}
          ({available.length})
        </h3>

        {available.length ? (
          available.map((item) => (
            <button
              key={item.id}
              className={
                "case-item " +
                (activeCase?.id === item.id
                  ? "selected"
                  : "")
              }
              onClick={() => {
                setSelectedId(item.id);
                setNote("");
                setError("");
              }}
            >
              <strong>
                {item.id} · House{" "}
                {item.propertyId}
              </strong>

              <Status status={item.status} />
              <p>{item.issue}</p>
            </button>
          ))
        ) : (
          <div className="info-note">
            {resident
              ? "You have no support requests yet."
              : "No support requests have been received yet."}
          </div>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="card support-detail">
        {activeCase ? (
          <>
            <div className="section-title">
              <div>
                <span className="eyebrow">
                  {activeCase.id} · HOUSE{" "}
                  {activeCase.propertyId}
                </span>

                <h2>Request Details</h2>
              </div>

              <Status status={activeCase.status} />
            </div>

            <p className="case-issue">
              {activeCase.issue}
            </p>

            <h3>Updates</h3>

            <div className="record-history">
              {activeCase.updates.map(
                (change, index) => (
                  <div key={index}>
                    <Status
                      status={change.status}
                    />
                    <p>{change.note}</p>
                  </div>
                )
              )}
            </div>

            {!resident && (
              <>
                <label>
                  Request status

                  <select
                    aria-label="Request status"
                    value={stage}
                    onChange={(e) =>
                      setStage(e.target.value)
                    }
                  >
                    {[
                      "Reported",
                      "Reviewing",
                      "Visit Planned",
                      "Closed",
                    ].map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Message to resident

                  <textarea
                    aria-label="Message to resident"
                    value={note}
                    onChange={(e) =>
                      setNote(e.target.value)
                    }
                    maxLength={1000}
                    placeholder="For example: We will arrange a technician visit next week."
                  />
                </label>

                <Button
                  disabled={!note.trim()}
                  onClick={saveUpdate}
                >
                  Save Update
                </Button>
              </>
            )}

            <small>
              Closing a request records progress, not a confirmed repair.
            </small>
          </>
        ) : (
          <div className="empty">
            <LifeBuoy size={45} />

            <h2>
              Solar support in one place.
            </h2>

            <p>
              {resident
                ? "Your submitted requests and replies will appear here."
                : "When a resident reports a problem, review it and record the next step here."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export function Rescue() {
  return (
    <Shell>
      <Heading
        title="Solar Rescue"
        subtitle="Follow up on solar problems reported by residents and keep every request moving."
      />

      <RescueWorkspace />
    </Shell>
  );
}

// ========================================
// 5. MANAGEMENT REVIEW
// ========================================

export function Review() {
  const { state, update, setToast } = useApp();
  const p = state.participation;

  const [tab, setTab] = useState(
    "Applications"
  );

  const [stage, setStage] = useState(
    "Under Review"
  );

  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const selected = applicationFor(
    p,
    p.selectedProperty
  );

  const summary = participationSummary(p);

  useEffect(() => {
    setStage(
      stages.includes(selected?.status)
        ? selected.status
        : "Under Review"
    );
  }, [
    selected?.reference,
    selected?.status,
  ]);

  function saveApplication() {
    try {
      update({
        participation: reviewApplication(
          p,
          p.selectedProperty,
          stage,
          note
        ),
      });

      setNote("");
      setError("");

      setToast(
        "Application update saved. It is now visible in My Application on this browser."
      );
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <Shell>
      <Heading
        title="Management Review"
        subtitle="Review homeowner applications, reply to support requests and track community progress."
      />

      <Tabs
        items={["Applications", "Community Summary"]}
        value={tab}
        onChange={setTab}
      />

      {tab === "Applications" ? (
        <div className="review-layout">
          <section className="card application-table">
            <div className="section-title">
              <div>
                <h2>
                  Homeowner Applications
                </h2>

                <p>
                  Select a house to check its
                  details and update the next step.
                </p>
              </div>

              <span className="pill">
                {p.applications.length} Records
              </span>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>
                      House / Application
                    </th>
                    <th>Status</th>
                    <th>Interest</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {p.applications.map(
                    (application) => (
                      <tr
                        key={application.reference}
                        className={
                          p.selectedProperty ===
                          application.propertyId
                            ? "selected"
                            : ""
                        }
                      >
                        <td>
                          <strong>
                            House{" "}
                            {application.propertyId}
                          </strong>

                          <small>
                            {application.reference}
                          </small>
                        </td>

                        <td>
                          <Status
                            status={application.status}
                          />
                        </td>

                        <td>
                          {application.binding
                            ? "Solar installed"
                            : application.optedIn
                            ? "Interested"
                            : "Withdrawn"}
                        </td>

                        <td>
                          <button
                            className="text-button"
                            onClick={() => {
                              update({
                                participation: {
                                  ...p,
                                  selectedProperty:
                                    application.propertyId,
                                },
                              });

                              setNote("");
                              setError("");
                            }}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card property-panel">
            <span className="eyebrow">
              HOUSE {p.selectedProperty} · APPLICATION
            </span>

            <h2>
              {selected?.reference ||
                "No application yet"}
            </h2>

            {selected ? (
              <>
                <Status
                  status={selected.status}
                />

                <div className="property-fact">
                  <small>Roof details</small>

                  <strong>
                    {selected.area} m² ·{" "}
                    {selected.shading} shade ·{" "}
                    {selected.roofType}
                  </strong>
                </div>

                <p>
                  {selected.complete
                    ? "Basic roof details have been provided."
                    : "More roof details are needed."}
                </p>

                <div className="info-note compact">
                  <span>
                    Last message:{" "}
                    {selected.events.at(-1)?.note ||
                      "No updates yet"}
                  </span>
                </div>

                {!selected.binding &&
                stages.includes(selected.status) ? (
                  <>
                    <label>
                      Update application status

                      <select
                        aria-label="Update application status"
                        value={stage}
                        onChange={(e) =>
                          setStage(e.target.value)
                        }
                      >
                        {stages.map((status) => (
                          <option key={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Message to homeowner

                      <textarea
                        aria-label="Message to homeowner"
                        value={note}
                        onChange={(e) =>
                          setNote(e.target.value)
                        }
                        maxLength={1000}
                        placeholder="For example: Please provide a photo of your roof."
                      />
                    </label>

                    <Button
                      disabled={!note.trim()}
                      onClick={saveApplication}
                    >
                      Save Update
                    </Button>
                  </>
                ) : (
                  <p>
                    {selected.binding
                      ? "This house has an existing installation. See Solar Rescue for support requests."
                      : "The homeowner withdrew their interest. Only they can register again."}
                  </p>
                )}
              </>
            ) : (
              <p>
                Select a homeowner application
                from the table to view it here.
              </p>
            )}

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </section>
        </div>
      ) : (
        <div className="card insights-card">
          <div className="stats">
            <Stat
              title="Homes Interested"
              value={summary.interested}
              detail="Registered interest"
              icon={Users}
            />

            <Stat
              title="Estimated Solar Capacity"
              value={fmt(summary.candidateCapacity)}
              unit="kWp"
              detail="Potential from interested homes"
              icon={Sun}
            />

            <Stat
              title="Existing Solar Capacity"
              value={fmt(summary.installedCapacity)}
              unit="kWp"
              detail="Recorded installed systems"
              icon={Building2}
            />

            <Stat
              title="Withdrawn Interest"
              value={summary.withdrawn}
              detail="Homeowners who withdrew"
              icon={ClipboardList}
            />
          </div>

          <div className="insight-body">
            <div>
              <span className="eyebrow">
                COMMUNITY PROGRESS
              </span>

              <h2>
                See how the neighbourhood
                is progressing.
              </h2>

              <p>
                {summary.openCases} open
                support requests ·{" "}
                {p.rippleScenarios.length} saved
                RoofRipple plans.
              </p>

              <p>
                Interested homes contribute
                to the estimated rooftop
                potential. RoofRipple plans
                help management explore
                changes without altering
                homeowner applications.
              </p>

              <p>
                Township figures use synthetic
                records and the calculation
                assumptions in Data &amp; Sources.
              </p>
            </div>

            <Leaf size={100} />
          </div>
        </div>
      )}
    </Shell>
  );
}
