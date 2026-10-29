import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useApp } from "./store";
import { GlobalModal } from "./components";
import { Welcome, Resident } from "./screens";
import "./styles.css";
import "./participation.css";
import {
  ManagementHome,
  Planner,
  Opportunity,
  Rescue,
  Review,
} from "./participationScreens";
function Guard({ resident = false, children }) {
  const { access } = useApp();
  if (!access) return <Navigate to="/" replace />;
  if ((resident ? "resident" : "manager") !== access)
    return (
      <Navigate to={access === "resident" ? "/resident" : "/home"} replace />
    );
  return children;
}
function App() {
  return (
    <HashRouter>
      <Provider>
        <GlobalModal />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          {[
            ["home", ManagementHome],
            ["planner", Planner],
            ["review", Review],
            ["rescue", Rescue],
          ].map(([p, C]) => (
            <Route
              key={p}
              path={"/" + p}
              element={
                <Guard>
                  <C />
                </Guard>
              }
            />
          ))}
          {[
            "/monitoring", "/buildings", "/health", "/tasks", "/green",
          ].map((path) => (
            <Route
              key={path}
              path={path}
              element={<Guard><Navigate to="/home" replace /></Guard>}
            />
          ))}
          <Route
            path="/resident"
            element={
              <Guard resident>
                <Opportunity />
              </Guard>
            }
          />
          <Route
            path="/community"
            element={
              <Guard resident>
                <Resident />
              </Guard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Provider>
    </HashRouter>
  );
}
createRoot(document.getElementById("root")).render(<App />);
