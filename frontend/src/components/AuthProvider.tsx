import React, { createContext, useState } from "react";
import { apiFetch } from "../api";

interface AuthContextType {
  username: string | null;
  token: string | null;
  role: string | null;
  login: (name: string, role: string) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
}

// Crea el contexto
export const AuthContext = createContext<AuthContextType>({
  username: null,
  token: null,
  role: null,
  login: () => {},
  setToken: () => {},
  logout: async () => {},
});

// Provider para envolver la App
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));

  const login = (name: string, userRole: string) => {
    localStorage.setItem("username", name);
    localStorage.setItem("role", userRole);
    setUsername(name);
    setRole(userRole);
  };

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
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      // Manejar error
    } finally {
      localStorage.removeItem("username");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setUsername(null);
      setTokenState(null);
    }
  };
  

  return (
    <AuthContext.Provider value={{ username, token, role, login, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

