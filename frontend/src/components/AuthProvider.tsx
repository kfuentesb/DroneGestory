import React, { createContext, useContext, useState } from "react";

// Define la forma del contexto.
// TO DO pendiente de rehacer
interface AuthContextType {
  username: string | null;
  token: string | null;
  login: (name: string) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>; // async
}

// Crea el contexto
const AuthContext = createContext<AuthContextType>({
  username: null,
  token: null,
  login: () => {},
  setToken: () => {},
  logout: async () => {},
});

// Provider para envolver la App
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("token"));
  //console.log("AuthProvider render username =", username); TESTING

  const login = (name: string) => {
    //console.log("AuthProvider.login(name) =", name); TESTING
    localStorage.setItem("username", name);
    setUsername(name);
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
    await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    // Manejar error
  } finally {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    setUsername(null);
    setTokenState(null);
  }
};
  

  return (
    <AuthContext.Provider value={{ username, token, login, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto en cualquier componente
export function useAuth() {
  return useContext(AuthContext);
}
