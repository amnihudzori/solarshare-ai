
import React from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Building2,
  Check,
  Leaf,
  Sun,
  Users,
} from "lucide-react";

import { useApp } from "./store";

import {
  Art,
  Button,
  Heading,
  Logo,
  Shell,
  Stat,
} from "./components";

import {
  participationSummary,
} from "./participation";

// ========================================
// 1. WELCOME PAGE
// ========================================

export function Welcome() {
  const { state, update, login } = useApp();
  const navigate = useNavigate();

  const isManager = state.role === "manager";

  function continueToWorkspace() {
    login();

    navigate(
      isManager ? "/home" : "/resident"
    );
  }

  return (
    <div className="public">
      <header>
        <Logo />

        <span className="pill">
          COMMUNITY ROOFTOP SOLAR · MALAYSIA
        </span>
      </header>

      <main className="welcome-grid">
        <section>
          <div className="eyebrow">
            <Leaf size={15} />
            SMARTER ENERGY. STRONGER COMMUNITIES.
          </div>

          <h1>
            Good energy.
            <br />
            <em>Shared by everyone.</em>
          </h1>

          <h2>Welcome to SolarShare AI</h2>

          <p>
            Discover rooftop solar opportunities,
            connect homeowners with township
            management, and plan a greener
            neighbourhood.
          </p>

          <div className="role-grid">
            <button
              type="button"
              className={
                "role-card " +
                (isManager ? "selected" : "")
              }
              aria-pressed={isManager}
              onClick={() =>
                update({
                  role: "manager",
                })
              }
            >
              <Building2 size={25} />

              <strong>
                Township Management
              </strong>

              <small>
                Explore neighbourhood rooftops,
                review applications, and plan
                community solar projects.
              </small>

              <span className="selection-dot">
                {isManager && (
                  <Check size={12} />
                )}
              </span>
            </button>

            <button
              type="button"
              className={
                "role-card " +
                (!isManager ? "selected" : "")
              }
              aria-pressed={!isManager}
              onClick={() =>
                update({
                  role: "resident",
                })
              }
            >
              <Users size={25} />

              <strong>
                Homeowner / Resident
              </strong>

              <small>
                Check rooftop potential,
                register your interest,
                and track your application.
              </small>

              <span className="selection-dot">
                {!isManager && (
                  <Check size={12} />
                )}
              </span>
            </button>
          </div>

          <Button onClick={continueToWorkspace}>
            Continue as{" "}
            {isManager
              ? "Township Management"
              : "Resident"}

            <ArrowRight size={17} />
          </Button>
        </section>

        <section className="hero-art">
          <Art />

          <div className="art-note">
            <span className="icon-box">
              <Sun />
            </span>

            <div>
              <strong>
                A brighter way to plan
                community solar.
              </strong>

              <small>
                From individual rooftops
                to township-wide progress.
              </small>
            </div>
          </div>
        </section>
      </main>

      <footer>
        Built for greener communities
        across Malaysia

        <span>
          Seri Hijau uses synthetic township data.
        </span>
      </footer>
    </div>
  );
}

// ========================================
// 4. COMMUNITY INFORMATION
// ========================================

export function Resident() {
  const { state } = useApp();

  const navigate = useNavigate();

  const summary = participationSummary(
    state.participation
  );

  return (
    <Shell resident>
      <Heading
        title="Community Information"
        subtitle="Learn how rooftop solar participation works in Seri Hijau."
        tag="Community solar"
      />

      <div
        className="resident-home"
        style={{
          overflowY: "auto",
          paddingRight: 5,
        }}
      >
        {/* COMMUNITY HERO */}

        <section
          className="resident-hero"
          style={{
            flexShrink: 0,
            minHeight: 220,
          }}
        >
          <div>
            <div className="eyebrow">
              YOUR COMMUNITY, YOUR ROOFTOP
            </div>

            <h2>
              More rooftops.
              <br />
              A greener neighbourhood.
            </h2>

            <p>
              SolarShare helps residents
              explore rooftop solar and
              lets township management
              plan projects based on
              homeowners' interest.
            </p>

            <Button
              onClick={() =>
                navigate("/resident")
              }
            >
              Check My Rooftop
              <ArrowRight size={16} />
            </Button>
          </div>

          <Art />
        </section>

        {/* COMMUNITY PROGRESS */}

        <div
          className="resident-bottom"
          style={{
            flexShrink: 0,
          }}
        >
          <Stat
            title="Interested Homes"
            value={summary.interested}
            detail="Homeowners who have registered interest"
            icon={Users}
          />

          <Stat
            title="Estimated Solar Potential"
            value={Number(
              summary.candidateCapacity
            ).toFixed(1)}
            unit="kWp"
            detail="Based on interested homes' roof details"
            icon={Sun}
          />

          <section className="card community-update">
            <Leaf size={24} />

            <h3>
              Already have solar panels?
            </h3>

            <p>
              Use Solar Rescue to report
              a problem and follow up
              with township management
              through My Solar Opportunity.
            </p>
          </section>
        </div>

        {/* HOW IT WORKS */}

        <section
          className="card tips"
          style={{
            flexShrink: 0,
          }}
        >
          <h2>
            How SolarShare works
          </h2>

          {[
            [
              "Check your roof",
              "See an estimate using your roof's size and sunlight exposure.",
            ],
            [
              "Register your interest",
              "Tell township management you would like to know more. This does not sign a contract.",
            ],
            [
              "Follow your application",
              "Check the next step and updates from township management.",
            ],
          ].map(
            ([title, description], index) => (
              <div key={title}>
                <span>
                  {index + 1}
                </span>

                <div>
                  <h3>
                    {title}
                  </h3>

                  <p>
                    {description}
                  </p>
                </div>
              </div>
            )
          )}

          <small>
            Community figures use
            synthetic data for Seri Hijau.
            Roof calculations are estimates;
            details are available under
            Data Sources & Assumptions.
          </small>
        </section>
      </div>
    </Shell>
  );
}
