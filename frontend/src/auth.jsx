import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    if (localStorage.getItem("token")) {
      api("/auth/me/").then(setUser).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false));
    }
    const out = () => { localStorage.removeItem("token"); setUser(null); };
    window.addEventListener("unauthorized", out);
    return () => window.removeEventListener("unauthorized", out);
  }, []);

  const start = (data) => { localStorage.setItem("token", data.token); setUser(data.user); };
  const login = async (username, password) => start(await api("/auth/login/", { method: "POST", body: { username, password } }));
  const register = async (form) => start(await api("/auth/register/", { method: "POST", body: form }));
  const logout = async () => {
    try { await api("/auth/logout/", { method: "POST" }); } catch { /* ignore */ }
    localStorage.removeItem("token"); setUser(null);
  };
  const updateProfile = async (body) => setUser(await api("/auth/me/", { method: "PATCH", body }));

  return <AuthCtx.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}</AuthCtx.Provider>;
}
