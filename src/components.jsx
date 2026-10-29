
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  Sun,
  LayoutDashboard,
  Building2,
  HeartPulse,
  ClipboardList,
  Leaf,
  ArrowUpRight,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Check,
  Info,
  Zap,
  Users,
  RotateCcw,
} from "lucide-react";

import { initial } from "./data";

import { useApp } from "./store";
import { sources } from "./participation";

// ========================================
// NAVIGATION
// ========================================

const navItems = [
  ["/home", "Township Dashboard", LayoutDashboard],
  ["/planner", "Township Solar Planner", Building2],
  ["/rescue", "Solar Rescue", HeartPulse],
  ["/review", "Management Review", ClipboardList],
];

// ========================================
// LOGO
// ========================================

export function Logo() {
  return (
    <div className="logo">
      <span className="logo-icon">
        <Sun size={25} />
      </span>

      <div>
        SolarShare<span className="ai"> AI</span>
        <small>EVERY KILOWATT COUNTS</small>
      </div>
    </div>
  );
}

// ========================================
// SOLAR COMMUNITY ILLUSTRATION
// ========================================

export function Art() {
  return (
    <svg
      className="community-art"
      viewBox="0 0 650 390"
      role="img"
      aria-label="Illustrated green community with solar rooftops"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dcefe4" />
          <stop offset="1" stopColor="#f3f8e9" />
        </linearGradient>
      </defs>

      <rect
        width="650"
        height="390"
        rx="32"
        fill="url(#sky)"
      />

      <circle cx="503" cy="82" r="39" fill="#f4c95d" />

      <path
        d="M0 285Q150 180 330 278T650 250V390H0Z"
        fill="#bbd6b4"
      />

      <path
        d="M0 335Q200 245 390 327T650 310V390H0Z"
        fill="#8eb99c"
      />

      <path
        d="M80 237L220 160L359 235L220 319Z"
        fill="#fafcf9"
      />

      <path
        d="M80 237V303L220 380V319Z"
        fill="#d6e8db"
      />

      <path
        d="M220 319L359 235V303L220 380Z"
        fill="#b3cebe"
      />

      <path
        d="M67 234L217 148L369 231L219 320Z"
        fill="#104738"
      />

      <path
        d="M111 232L218 171L322 230L216 292Z"
        fill="#275e67"
        stroke="#9cc3bf"
        strokeWidth="3"
      />

      <path
        d="M145 213L251 272M180 192L286 251M146 251L251 190M181 272L286 210"
        stroke="#9cc3bf"
        strokeWidth="2"
      />

      <path
        d="M390 230L480 179L572 229L480 282Z"
        fill="#fafcf9"
      />

      <path
        d="M390 230V296L480 347V282Z"
        fill="#d6e8db"
      />

      <path
        d="M480 282L572 229V296L480 347Z"
        fill="#b3cebe"
      />

      <path
        d="M378 226L479 167L583 224L480 285Z"
        fill="#104738"
      />

      <path
        d="M410 225L479 185L551 225L480 267Z"
        fill="#275e67"
        stroke="#9cc3bf"
        strokeWidth="2"
      />

      <path
        d="M433 212L503 253M457 198L527 239M445 245L516 204"
        stroke="#9cc3bf"
      />

      <g fill="#397c59">
        <circle cx="63" cy="300" r="30" />
        <circle cx="354" cy="322" r="25" />
        <circle cx="600" cy="305" r="29" />
      </g>

      <g stroke="#6a7654" strokeWidth="7">
        <path d="M63 302V354M354 324V369M600 309V360" />
      </g>

      <rect
        x="248"
        y="315"
        width="23"
        height="34"
        fill="#508778"
      />

      <path
        d="M35 123H170M90 102H199"
        stroke="#fff"
        strokeWidth="16"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ========================================
// REUSABLE BUTTON
// ========================================

export function Button({
  children,
  onClick,
  secondary = false,
  ...props
}) {
  return (
    <button
      className={
        secondary ? "button secondary" : "button"
      }
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

// ========================================
// STATUS BADGE
// ========================================

export function Badge({
  flagged = false,
  children,
}) {
  return (
    <span className={"badge " + (flagged ? "warn" : "good")}>
      {flagged ? <Info size={12} /> : <Check size={12} />}

      {" "}

      {children || (flagged ? "Needs Review" : "Working Well")}
    </span>
  );
}

// ========================================
// TABS
// ========================================

export function Tabs({
  items,
  value,
  onChange,
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((item) => (
        <button
          key={item}
          role="tab"
          aria-selected={value === item}
          className={value === item ? "active" : ""}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

// ========================================
// DASHBOARD STATISTICS
// ========================================

export function Stat({
  title,
  value,
  unit,
  icon: Icon = Zap,
  detail,
}) {
  return (
    <div className="stat card">
      <div className="stat-top">
        {title}
        <Icon size={18} />
      </div>

      <div className="stat-value">
        {value}
        <span>{unit}</span>
      </div>

      <small>{detail}</small>
    </div>
  );
}

// ========================================
// APPLICATION SHELL
// Sidebar and top header
// ========================================

export function Shell({
  resident = false,
  children,
}) {
  const {
    state,
    setModal,
    logout,
  } = useApp();

  const navigate = useNavigate();

  const links = resident
    ? [
        ["/resident", "My Solar Opportunity", Users],
        ["/community", "Community Information", Leaf],
      ]
    : navItems;

  return (
    <div className="app-shell">
      <aside>
        <Logo />

        <div className="workspace-label">
          {resident
            ? "RESIDENT"
            : "TOWNSHIP MANAGEMENT"}
        </div>

        <nav>
          {links.map(([url, label, Icon]) => (
            <NavLink key={url} to={url}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="solar-note">
            <Sun size={23} />

            <strong>
              Every kilowatt counts.
            </strong>

            <small>
              A little smarter,
              a little greener.
            </small>
          </div>

          <button
            onClick={() =>
              setModal("settings")
            }
          >
            <Settings size={18} />
            Profile & Settings
          </button>

          <button
            onClick={() =>
              setModal("sources")
            }
          >
            <HelpCircle size={18} />
            Data & Sources
          </button>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut size={18} />
            Switch Role
          </button>
        </div>

        <div className="sidebar-user">
          <span className="avatar">
            {resident ? "RS" : "TM"}
          </span>

          <div>
            <strong>
              {resident
                ? "Community Resident"
                : state.name === "Facility Manager"
                ? "Township Team"
                : state.name}
            </strong>

            <small>
              Seri Hijau Township
            </small>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="organisation">
            <span className="org-icon">
              <Building2 size={17} />
            </span>

            <div>
              <strong>
                Seri Hijau Township
              </strong>

              <small>
                Community rooftop solar
              </small>
            </div>
          </div>

          <div className="top-actions">
            <button
              className="avatar"
              aria-label="Open profile settings"
              onClick={() =>
                setModal("settings")
              }
            >
              {resident ? "RS" : "TM"}
            </button>
          </div>
        </header>

        <main className="page">
          {children}
        </main>

        <footer className="app-footer">
          <span>
            Seri Hijau Township · Synthetic data
          </span>

          <button
            onClick={() =>
              setModal("sources")
            }
          >
            Data & Sources
            <ArrowUpRight size={12} />
          </button>
        </footer>
      </div>
    </div>
  );
}

// ========================================
// PAGE HEADING
// ========================================

export function Heading({
  title,
  subtitle,
  tag,
}) {
  return (
    <div className="heading">
      <div>
        <div className="eyebrow">
          SERI HIJAU · COMMUNITY ENERGY
        </div>

        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {tag && (
        <span className="pill">
          <Sun size={14} />
          {tag}
        </span>
      )}
    </div>
  );
}

// ========================================
// MODAL
// Profile, reset and data sources
// ========================================

export function GlobalModal() {
  const {
    modal,
    setModal,
    state,
    update,
    setToast,
    logout,
  } = useApp();

  const navigate = useNavigate();

  const [name, setName] = useState(
    state.name === "Facility Manager"
      ? "Township Team"
      : state.name
  );

  useEffect(() => {
    if (modal === "settings") {
      setName(
        state.name === "Facility Manager"
          ? "Township Team"
          : state.name
      );
    }
  }, [modal, state.name]);

  useEffect(() => {
    if (!modal) return;

    const previouslyFocused =
      document.activeElement;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setModal(null);
      }

      if (event.key !== "Tab") {
        return;
      }

      const elements = [
        ...document.querySelectorAll(
          ".modal button, .modal a, .modal input, .modal select, .modal textarea"
        ),
      ].filter(
        (element) => !element.disabled
      );

      if (elements.length === 0) {
        return;
      }

      const first = elements[0];
      const last =
        elements[elements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      previouslyFocused?.focus();
    };
  }, [modal, setModal]);

  if (!modal) {
    return null;
  }

  const isSettings = modal === "settings";
  const isReset = modal === "reset";

  return (
    <div
      className="modal-backdrop"
      onClick={() =>
        setModal(null)
      }
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          className="close"
          aria-label="Close"
          autoFocus
          onClick={() =>
            setModal(null)
          }
        >
          <X size={21} />
        </button>

        <div className="eyebrow">
          SOLARSHARE AI · SERI HIJAU
        </div>

        <h2 id="modal-title">
          {isSettings
            ? "Profile & Settings"
            : isReset
            ? "Reset Application Data"
            : "Data & Sources"}
        </h2>

        {isSettings ? (
          <>
            <label>
              Display name

              <input
                value={name}
                maxLength={60}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            </label>

            <p>
              Workspace:{" "}
              <strong>
                {state.role === "manager"
                  ? "Township Management"
                  : "Resident"}
              </strong>
            </p>

            <p>
              Community: Seri Hijau Township
            </p>

            <Button
              onClick={() => {
                update({
                  name:
                    name.trim() ||
                    "Township Team",
                });

                setToast(
                  "Preferences saved."
                );

                setModal(null);
              }}
            >
              Save Changes
            </Button>

            <div className="danger-zone">
              <h3>
                Start with fresh data
              </h3>

              <p>
                Clear changes saved in this
                browser and restore the
                original synthetic township
                records.
              </p>

              <Button
                secondary
                onClick={() =>
                  setModal("reset")
                }
              >
                <RotateCcw size={16} />
                Reset Data
              </Button>
            </div>
          </>
        ) : isReset ? (
          <>
            <p>
              This will clear local applications,
              support reports, saved RoofRipple
              plans and other changes.
              Continue?
            </p>

            <div className="button-row">
              <Button
                secondary
                onClick={() =>
                  setModal("settings")
                }
              >
                Cancel
              </Button>

              <Button
                onClick={() => {
                  update({
                    ...initial,
                    tasks: [],
                  });

                  logout();
                  setModal(null);

                  setToast(
                    "Original township data restored."
                  );

                  navigate("/");
                }}
              >
                Reset Data
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="disclaimer">
              <strong>
                Data used:
              </strong>{" "}
              Seri Hijau Township, its
              properties, application
              records and existing solar
              systems use{" "}
              <strong>
                synthetic data
              </strong>
              . Changes entered here
              are saved in this browser,
              not a shared online database.
            </p>

            <h3>
              How the estimates work
            </h3>

            <p>
              <strong>
                SolarMatch:
              </strong>{" "}
              Estimated panel capacity =
              usable roof area × 0.17
              kWp/m². Estimated daily
              electricity = capacity ×
              3.5 × shading factor
              (low 1.0, medium 0.85,
              high 0.6).
              These are stated assumptions,
              not measurements of a
              specific roof.
            </p>

            <p>
              <strong>
                RoofRipple:
              </strong>{" "}
              Compares the estimated solar
              capacity of interested homes
              when a home is removed or
              another is added to a
              planning example. It does
              not change a homeowner's
              application or sign an
              agreement.
            </p>

            <p>
              <strong>
                Project status:
              </strong>{" "}
              Estimates support early
              planning. Roof checks,
              homeowner permission,
              electricity connection
              and programme approval
              are separate steps.
              SolarMatch and RoofRipple use
              stated calculation rules.
            </p>

            <h3>
              Public references
            </h3>

            <ul className="sources">
              {sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {source.title} ↗
                  </a>

                  <p>
                    {source.role}
                  </p>
                </li>
              ))}



            </ul>
          </>
        )}
      </section>
    </div>
  );
}
