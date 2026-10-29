import React, { createContext, useContext, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { initial } from "./data";
import { restoreSavedState } from "./storage";
const Context = createContext();
export const useApp = () => useContext(Context);
export function Provider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem("solarshare-v1");
      return restoreSavedState(raw ? JSON.parse(raw) : null, initial);
    } catch {
      return restoreSavedState(null, initial);
    }
  });
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [access, setAccess] = useState(
    () => {
      const role = sessionStorage.getItem("solarshare-access");
      return role === "manager" || role === "resident" ? role : "";
    },
  );
  useEffect(() => {
    localStorage.setItem("solarshare-v1", JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(id);
    }
  }, [toast]);
  const update = (patch) =>
    setState((s) => ({
      ...s,
      ...(typeof patch === "function" ? patch(s) : patch),
    }));
  const login = () => {
    sessionStorage.setItem("solarshare-access", state.role);
    setAccess(state.role);
  };
  const logout = () => {
    sessionStorage.removeItem("solarshare-access");
    setAccess("");
  };
  return (
    <Context.Provider
      value={{
        state,
        update,
        modal,
        setModal,
        toast,
        setToast,
        access,
        login,
        logout,
      }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
    </Context.Provider>
  );
}
