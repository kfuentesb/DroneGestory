import { useState, useEffect } from "react";
import { useAuth } from "../commons/hooks/useAuth";
import { useUserTimezone } from "../commons/hooks/useUserTimezone";
import { InfoBadge } from "../commons/InfoBadge";

const TIMEZONES = [
  { label: "UTC-12:00", value: "-12:00" },
  { label: "UTC-11:00", value: "-11:00" },
  { label: "UTC-10:00", value: "-10:00" },
  { label: "UTC-09:00", value: "-09:00" },
  { label: "UTC-08:00", value: "-08:00" },
  { label: "UTC-07:00", value: "-07:00" },
  { label: "UTC-06:00", value: "-06:00" },
  { label: "UTC-05:00", value: "-05:00" },
  { label: "UTC-04:00", value: "-04:00" },
  { label: "UTC-03:00", value: "-03:00" },
  { label: "UTC-02:00", value: "-02:00" },
  { label: "UTC-01:00", value: "-01:00" },
  { label: "UTC+00:00", value: "+00:00" },
  { label: "UTC+01:00", value: "+01:00" },
  { label: "UTC+02:00", value: "+02:00" },
  { label: "UTC+03:00", value: "+03:00" },
  { label: "UTC+04:00", value: "+04:00" },
  { label: "UTC+05:00", value: "+05:00" },
  { label: "UTC+06:00", value: "+06:00" },
  { label: "UTC+07:00", value: "+07:00" },
  { label: "UTC+08:00", value: "+08:00" },
  { label: "UTC+09:00", value: "+09:00" },
  { label: "UTC+10:00", value: "+10:00" },
  { label: "UTC+11:00", value: "+11:00" },
  { label: "UTC+12:00", value: "+12:00" },
];

export default function Settings() {
  const { hasRole } = useAuth();
  const { timezone, saveTimezone, isLoading: tzLoading } = useUserTimezone();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeWithOffset = (offsetString: string) => {
    if (!offsetString) return "--:--:--";
    try {
      const sign = offsetString.startsWith("-") ? -1 : 1;
      const [hoursPart, minutesPart] = offsetString.replace(/[+-]/, "").split(":");
      const offsetMinutes = sign * (parseInt(hoursPart, 10) * 60 + parseInt(minutesPart, 10));

      // Obtener hora UTC actual y sumarle el offset elegido
      const utc = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
      const targetDate = new Date(utc + offsetMinutes * 60000);

      return targetDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return "--:--:--";
    }
  };

  const userTimeStr = formatTimeWithOffset(timezone);

  return (
    <div className="container py-4">
      <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "12px" }}>
        <div className="card-body p-4">
          <h2 className="mb-3" style={{ color: "#1E1E1E" }}>Configuración</h2>
          <p className="text-muted mb-4">Opciones generales del sistema.</p>

          {/* Card: Zona horaria */}
          <div
            className="p-3 rounded mb-3"
            style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
          >
            {/* Fila superior: Texto y Selector */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
              <div>
                <div className="fw-semibold">
                  Zona horaria{" "}
                  <InfoBadge text="El servidor se encuentra en UTC+01:00. Cada vez que se inicie sesión, se establecerá por defecto la zona horaria UTC+02:00." />
                </div>
                <small className="text-muted">Seleccione su zona horaria para ajustar el uso horario de la web.</small>
              </div>
              <div style={{ minWidth: "260px", maxWidth: "100%" }}>
                <select
                  className="form-select form-select-sm"
                  value={timezone}
                  disabled={tzLoading}
                  onChange={(e) => saveTimezone(e.target.value)}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div 
              className="p-3 rounded text-center" 
              style={{ backgroundColor: "#F3F4F6", border: "1px solid #E5E7EB" }}
            >
              <div className="text-uppercase text-success fw-bold small mb-1">
                Hora Ajustada ({timezone || "Seleccionada"})
              </div>
              <h4 className="font-monospace mb-0 fw-bold text-success">{userTimeStr}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
