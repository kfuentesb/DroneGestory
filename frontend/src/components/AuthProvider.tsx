import React, { createContext, useState } from "react";
import { apiFetch } from "../api";

interface AuthContextType {
  id: string | null;
  username: string | null;
  token: string | null;
  role: string | null;
  roles: string[];
  login: (idValue: string, name: string, roles: string[]) => void;
  hasRole: (role: string) => boolean;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

// Crea el contexto
export const AuthContext = createContext<AuthContextType>({
  id: null,
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
  const [id, setId] = useState<string | null>(localStorage.getItem("userId"));
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
    if (legacyRole) {
      
      console.warn("[LEGACY DETECTED] -> Sesión de usuario recuperada usando la propiedad singular antigua 'role':", legacyRole);
      
      return [legacyRole];
    }
    
    return [];
  });

  const role = roles[0] || null;

  const login = (idValue: string, name: string, userRoles: string[]) => {
    localStorage.setItem("userId", idValue);
    localStorage.setItem("username", name);
    localStorage.setItem("roles", JSON.stringify(userRoles));
    localStorage.setItem("role", userRoles[0] || "");
    setId(idValue);
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
      localStorage.removeItem("userId");
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
    <AuthContext.Provider value={{ id, username, token, role, roles, login, hasRole, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}