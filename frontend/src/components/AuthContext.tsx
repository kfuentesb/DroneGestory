import React, { createContext, useContext, useState } from "react";

// Define la forma del contexto.
// TO DO pendiente de rehacer
interface AuthContextType {
  username: string | null;
  login: (name: string) => void;
  logout: () => void;
}

// Crea el contexto
const AuthContext = createContext<AuthContextType>({
  username: null,
  login: () => {},
  logout: () => {},
});

// Provider para envolver la App
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));

  const login = (name: string) => {
    localStorage.setItem("username", name);
    setUsername(name);
  };

  const logout = () => {
    localStorage.removeItem("username");
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto en cualquier componente
export function useAuth() {
  return useContext(AuthContext);
}