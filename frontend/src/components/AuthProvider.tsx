import React, { createContext, useContext, useState } from "react";

// Define la forma del contexto.
// TO DO pendiente de rehacer
interface AuthContextType {
  username: string | null;
  login: (name: string) => void;
  logout: () => Promise<void>; // async
}

// Crea el contexto
const AuthContext = createContext<AuthContextType>({
  username: null,
  login: () => {},
  logout: async () => {},
});

// Provider para envolver la App
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));
  //console.log("AuthProvider render username =", username); TESTING

  const login = (name: string) => {
    //console.log("AuthProvider.login(name) =", name); TESTING
    localStorage.setItem("username", name);
    setUsername(name);
  };

  const logout = async () => {
  try {
    await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    // Manejar error
  } finally {
    localStorage.removeItem("username");
    setUsername(null);
  }
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