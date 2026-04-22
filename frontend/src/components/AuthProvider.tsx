import React, { createContext, useState } from "react";
import { apiFetch } from "../api";

interface AuthContextType {
  username: string | null;
  token: string | null;
  role: string | null;
  roles: string[];
  login: (name: string, roles: string[]) => void;
  hasRole: (role: string) => boolean;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

// Crea el contexto
export const AuthContext = createContext<AuthContextType>({
  username: null,
  token: null,
  role: null,
  roles: [],
  login: () => {},
  hasRole: () => false,
  setToken: () => {},
  logout: async () => {},
});

// Provider para envolver la App
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const [roles, setRoles] = useState<string[]>(() => {
    const stored = localStorage.getItem("roles");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    const legacyRole = localStorage.getItem("role");
    return legacyRole ? [legacyRole] : [];
  });

  const role = roles[0] || null;

  const login = (name: string, userRoles: string[]) => {
    localStorage.setItem("username", name);
    localStorage.setItem("roles", JSON.stringify(userRoles));
    localStorage.setItem("role", userRoles[0] || "");
    setUsername(name);
    setRoles(userRoles);
  };

  const hasRole = (candidateRole: string) => roles.includes(candidateRole);

  const setToken = (value: string | null) => {
    if (value) {
      localStorage.setItem("token", value);
    } else {
      localStorage.removeItem("token");
    }
    setTokenState(value);
  };

  const logout = async () => {
    try {
      await apiFetch("/api/logout", { method: "POST" });
    } catch (error) {
      // Manejar error
    } finally {
      localStorage.removeItem("username");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("roles");
      setUsername(null);
      setTokenState(null);
      setRoles([]);
    }
  };
  

  return (
    <AuthContext.Provider value={{ username, token, role, roles, login, hasRole, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

