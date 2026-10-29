
import React from "react";
import { properties, propertyStatus } from "./participation";

const statusColors = {
  "No Recorded Interest": "#a5b1aa",
  Interested: "#15966b",
  "Under Review": "#5183a0",
  "More Information Needed": "#ba8b43",
  "Site Assessment Recommended": "#667b47",
  Withdrawn: "#ad7777",
  Installed: "#103d32",
};

const statusLabels = {
  "No Recorded Interest": "No Application",
  Interested: "Interested",
  "Under Review": "Under Review",
  "More Information Needed": "More Details Needed",
  "Site Assessment Recommended": "Roof Check Suggested",
  Withdrawn: "Withdrawn",
  Installed: "Solar Installed",
};

// Keep the original township illustration.
function MapArtwork() {
  return (
    <g aria-hidden="true">
      <defs>
        <pattern
          id="grass"
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M2 5h2m9 10h2"
            stroke="#acbea5"
            strokeWidth=".7"
          />
        </pattern>

        <filter
          id="house-shadow"
          x="-30%"
          y="-40%"
          width="170%"
          height="200%"
        >
          <feDropShadow
            dx="8"
            dy="12"
            stdDeviation="5"
            floodColor="#344a3a"
            floodOpacity=".17"
          />
        </filter>
      </defs>

      <rect
        width="1080"
        height="410"
        fill="#dfe7d8"
      />

      <rect
        width="1080"
        height="410"
        fill="url(#grass)"
      />

      <path
        d="M0 208H1080M539 0V410"
        stroke="#ccd2c9"
        strokeWidth="70"
      />

      <path
        d="M0 208H1080M539 0V410"
        stroke="#8d9893"
        strokeWidth="54"
      />

      <path
        d="M0 208H1080M539 0V410"
        stroke="#e3e6dd"
        strokeWidth="1.5"
        strokeDasharray="12 12"
      />

      <path
        d="M0 179H1080M0 237H1080M508 0V410M570 0V410"
        stroke="#f4f1e8"
        strokeWidth="7"
      />

      <text
        x="48"
        y="210"
        fill="#f7f6ed"
        fontSize="10"
        letterSpacing="2"
      >
        JALAN SERI HIJAU
      </text>

      <g
        fill="#91aa8c"
        stroke="#789673"
        strokeWidth="3"
      >
        {[35, 500, 588, 1040].flatMap((x) =>
          [50, 110, 310, 370].map((y) => (
            <g key={`${x}-${y}`}>
              <circle
                cx={x}
                cy={y}
                r="14"
              />

              <circle
                cx={x - 3}
                cy={y - 4}
                r="9"
                fill="#a9bca0"
                stroke="none"
              />
            </g>
          ))
        )}
      </g>

      {properties.map((p) => (
        <g
          key={p.id}
          transform={`translate(${p.x},${p.y})`}
          filter="url(#house-shadow)"
        >
          <path
            d="M-48 -43H53V46H-48Z"
            fill="#eef0e6"
            stroke="#c6cfc1"
          />

          <path
            d="M-39 23L12 43L47 16V-21L12 -42L-39 -18Z"
            fill="#d9d6c7"
          />

          <path
            d="M12 43L47 16V-21L12 3Z"
            fill="#b6b7a8"
          />

          <path
            d="M-46 -23L11 -54L56 -26L12 8Z"
            fill="#666c65"
            stroke="#edeee4"
            strokeWidth="2"
          />

          <path
            d="M11 -54L12 8M-27 -34L29 -5M-8 -44L46 -17"
            fill="none"
            stroke="#90978c"
            strokeWidth="1"
          />

          <path
            d="M-29 7L-14 13V25L-29 19Z"
            fill="#7c9c99"
          />

          <path
            d="M20 14L32 6V18L20 26Z"
            fill="#728e88"
          />

          <path
            d="M-5 26L5 30V40L-5 36Z"
            fill="#9c917c"
          />

          <path
            d="M-30 46H30V60H-30Z"
            fill="#d0d3cb"
          />

          <rect
            x="-41"
            y="-40"
            width="10"
            height="8"
            rx="2"
            fill="#aab99b"
          />
        </g>
      ))}
    </g>
  );
}

export function TownshipMap({
  data,
  selected,
  onSelect,
  removed = null,
  replacement = null,
  portfolio = [],
  snapshot = false,
}) {
  return (
    <div className="township-map">
      {/* Layout improvements without replacing participation.css */}
      <style>{`
        .map-corner {
          font-size: 9px;
          letter-spacing: .8px;
        }

        .map-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          align-items: center;
          padding: 7px 3px;
        }

        .map-legend span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 500;
          color: #526b59;
          white-space: nowrap;
        }

        .map-legend i {
          width: 9px;
          height: 9px;
          border-radius: 3px;
          flex: 0 0 9px;
        }

        .map-legend .map-special-key {
          border-left: 1px solid #d3dfd0;
          padding-left: 10px;
        }

        .map-legend .map-special-key i {
          width: 11px;
          height: 11px;
          flex-basis: 11px;
        }

        .township-map {
          overflow: visible;
        }

        .planner-toolbar .house-query {
          display: none;
        }

        @media (min-width: 761px) {
          .page:has(.township-layout) {
            overflow-y: auto;
            overflow-x: hidden;
          }

          .page:has(.township-layout) .township-layout {
            flex: 0 0 auto;
            align-items: start;
            grid-template-columns:
              minmax(0, 1fr) minmax(300px, 335px);
          }

          .page:has(.township-layout) .planner-map-card,
          .page:has(.township-layout) .property-panel {
            min-height: 535px;
          }

          .page:has(.township-layout) .property-panel {
            overflow: visible;
          }
        }

        @media (min-width: 1100px) and (max-height: 800px) {
          .map-legend span {
            font-size: 9px;
          }

          .page:has(.township-layout) .planner-map-card,
          .page:has(.township-layout) .property-panel {
            min-height: 500px;
          }
        }

        @media (max-width: 760px) {
          .map-legend span {
            font-size: 9px;
            white-space: normal;
          }
        }
      `}</style>

      <div className="map-corner">
        <span className="live-dot" />

        {snapshot
          ? "ROOFRIPPLE · SOLAR PLAN"
          : "SERI HIJAU · ROOFTOP MAP"}
      </div>

      <svg
        viewBox="0 0 1080 410"
        role="group"
        aria-label="Interactive township map. Select a house to view its solar information."
      >
        <MapArtwork />

        <g className="property-overlays">
          {properties.map((p) => {
            const status = propertyStatus(data, p.id);

            const warning = data.cases?.some(
              (c) =>
                c.propertyId === p.id &&
                c.status !== "Closed"
            );

            const isRemoved = removed === p.id;
            const isAdded = replacement === p.id;
            const isSelected = selected === p.id;

            return (
              <g
                key={p.id}
                className="property-overlay"
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`House ${p.id}: ${
                  statusLabels[status] || status
                }${
                  isRemoved
                    ? ", removed from plan"
                    : ""
                }${
                  isAdded
                    ? ", added to plan"
                    : ""
                }`}
                onClick={() => onSelect?.(p.id)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    onSelect?.(p.id);
                  }
                }}
              >
                <rect
                  x={p.x - 57}
                  y={p.y - 62}
                  width="121"
                  height="126"
                  rx="9"
                  fill={
                    isRemoved
                      ? "#d86d6d30"
                      : isAdded
                        ? "#f0c76e40"
                        : isSelected
                          ? "#15966b15"
                          : "transparent"
                  }
                  stroke={
                    isRemoved
                      ? "#c66a65"
                      : isAdded
                        ? "#b48a35"
                        : isSelected
                          ? "#103d32"
                          : "transparent"
                  }
                  strokeWidth="3"
                  strokeDasharray={
                    isRemoved
                      ? "7 4"
                      : undefined
                  }
                />

                {portfolio.includes(p.id) && (
                  <circle
                    cx={p.x + 48}
                    cy={p.y - 46}
                    r="7"
                    fill="#f0c76e"
                    stroke="#a57d2a"
                    strokeWidth="1.5"
                  />
                )}

                <rect
                  x={p.x - 27}
                  y={p.y + 46}
                  width="58"
                  height="21"
                  rx="5"
                  fill={
                    statusColors[status] ||
                    "#a5b1aa"
                  }
                />

                <text
                  x={p.x + 2}
                  y={p.y + 60}
                  fill="white"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {p.id}
                </text>

                {warning && (
                  <g>
                    <circle
                      cx={p.x + 48}
                      cy={p.y - 43}
                      r="10"
                      fill="#b75545"
                    />

                    <text
                      x={p.x + 48}
                      y={p.y - 39}
                      fontSize="13"
                      textAnchor="middle"
                      fill="white"
                    >
                      !
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div
        className="map-legend"
        aria-label="Map colour guide"
      >
        {Object.entries(statusColors).map(
          ([status, color]) => (
            <span key={status}>
              <i
                style={{
                  background: color,
                }}
              />

              {statusLabels[status]}
            </span>
          )
        )}

        <span>
          <i
            style={{
              background: "#b75545",
            }}
          />

          Support Request (!)
        </span>

        {snapshot && (
          <>
            <span className="map-special-key">
              <i
                style={{
                  background: "#f0c76e",
                }}
              />

              In Plan
            </span>

            <span className="map-special-key">
              <i
                style={{
                  background: "#f9dddd",
                  border:
                    "1px dashed #c66a65",
                }}
              />

              Removed
            </span>

            <span className="map-special-key">
              <i
                style={{
                  background: "#fff2c5",
                  border:
                    "1px solid #b48a35",
                }}
              />

              Added
            </span>
          </>
        )}
      </div>
    </div>
  );
}
