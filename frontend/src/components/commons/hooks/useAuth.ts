import { useContext } from "react";
import { AuthContext } from "../../AuthProvider";

// Hook para usar el contexto en cualquier componente
export function useAuth() {
  return useContext(AuthContext);
}
