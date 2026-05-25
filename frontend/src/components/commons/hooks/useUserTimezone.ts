import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "userTimezone";

export function useUserTimezone() {
  const [timezone, setTimezone] = useState<string>("+02:00");
  const [isLoading, setIsLoading] = useState(true);

  // Cargar de localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTimezone(saved);
    }
    setIsLoading(false);
  }, []);

  // Guardar en localStorage
  const saveTimezone = useCallback((newTz: string) => {
    setTimezone(newTz);
    localStorage.setItem(STORAGE_KEY, newTz);
  }, []);

  return { timezone, saveTimezone, isLoading };
}