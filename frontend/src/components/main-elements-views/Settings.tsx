import { useState } from "react";
import { apiFetch } from "../../api";
import { useAuth } from "../commons/hooks/useAuth";
import { useUserTimezone } from "../commons/hooks/useUserTimezone";

const TIMEZONES = [
  { label: "UTC-12:00 — Línea internacional de fecha oeste", value: "-12:00" },
  { label: "UTC-11:00 — Isla Midway, Samoa", value: "-11:00" },
  { label: "UTC-10:00 — Hawái", value: "-10:00" },
  { label: "UTC-09:00 — Alaska", value: "-09:00" },
  { label: "UTC-08:00 — Hora del Pacífico (Los Ángeles, Vancouver)", value: "-08:00" },
  { label: "UTC-07:00 — Hora de la Montaña (Denver, Phoenix)", value: "-07:00" },
  { label: "UTC-06:00 — Hora Central (Chicago, Ciudad de México)", value: "-06:00" },
  { label: "UTC-05:00 — Hora del Este (Nueva York, Lima, Bogotá)", value: "-05:00" },
  { label: "UTC-04:00 — Caracas, La Paz, Santiago", value: "-04:00" },
  { label: "UTC-03:00 — Buenos Aires, São Paulo, Montevideo", value: "-03:00" },
  { label: "UTC-02:00 — Islas Georgias del Sur", value: "-02:00" },
  { label: "UTC-01:00 — Azores", value: "-01:00" },
  { label: "UTC+00:00 — Londres, Lisboa, Reikiavik", value: "+00:00" },
  { label: "UTC+01:00 — Madrid, París, Berlín, Roma, Lagos", value: "+01:00" },
  { label: "UTC+02:00 — Atenas, El Cairo, Johannesburgo, Jerusalén", value: "+02:00" },
  { label: "UTC+03:00 — Moscú, Estambul, Nairobi, Riad", value: "+03:00" },
  { label: "UTC+04:00 — Dubai, Bakú, Tiflis", value: "+04:00" },
  { label: "UTC+05:00 — Islamabad, Taskent", value: "+05:00" },
  { label: "UTC+05:30 — Nueva Delhi, Bombay, Colombo", value: "+05:30" },
  { label: "UTC+06:00 — Dacca, Astana", value: "+06:00" },
  { label: "UTC+07:00 — Bangkok, Yakarta, Hanói", value: "+07:00" },
  { label: "UTC+08:00 — Pekín, Singapur, Perth, Hong Kong", value: "+08:00" },
  { label: "UTC+09:00 — Tokio, Seúl", value: "+09:00" },
  { label: "UTC+10:00 — Sídney (invierno), Guam", value: "+10:00" },
  { label: "UTC+11:00 — Islas Salomón, Nueva Caledonia", value: "+11:00" },
  { label: "UTC+12:00 — Fiyi, Nueva Zelanda (Auckland)", value: "+12:00" },
];

export default function Settings() {
  const { hasRole } = useAuth();
  const canDownloadAuditLog = hasRole("ADMIN") || hasRole("MANAGER");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);
  const { timezone, saveTimezone, isLoading: tzLoading } = useUserTimezone();

  const handleDownloadAuditLog = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      const res = await apiFetch("/api/audit-log/download");
      if (!res) return;

      const blob = await res.blob();

      // Si el archivo está vacío mostramos modal bonito
      if (blob.size === 0) {
        setShowEmptyAlert(true);
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "AuditLog.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      if (err.status = 404) {
        setShowEmptyAlert(true);
      } else {
        setError(err instanceof Error ? err.message : "No se pudo descargar el AuditLog.txt");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "12px" }}>
        <div className="card-body p-4">
          <h2 className="mb-3" style={{ color: "#1E1E1E" }}>Configuración</h2>
          <p className="text-muted mb-4">Opciones generales del sistema.</p>

          {/* Card: Zona horaria */}
          <div
            className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-3 rounded mb-3"
            style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
          >
            <div>
              <div className="fw-semibold">Zona horaria</div>
              <small className="text-muted">Selecciona la zona horaria de tu país para mostrar las fechas correctamente.</small>
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

          {canDownloadAuditLog ? (
            <div
              className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-3 rounded"
              style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
            >
              <div>
                <div className="fw-semibold">Descargar Audit Log</div>
                <small className="text-muted">Descarga el fichero `AuditLog.txt` con el historial registrado.</small>
              </div>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleDownloadAuditLog}
                disabled={isDownloading}
              >
                {isDownloading ? "Descargando..." : "Descargar AuditLog.txt"}
              </button>
            </div>
          ) : (
            <div className="alert alert-light border mb-0">
              No hay opciones disponibles para tu perfil.
            </div>
          )}

          {error && (
            <div className="alert alert-danger mt-3 mb-0">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Modal bonito Bootstrap - se muestra solo si showEmptyAlert es true */}
      {showEmptyAlert && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Archivo vacío</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Cerrar"
                  onClick={() => setShowEmptyAlert(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>El archivo de auditoría está vacío.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEmptyAlert(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showEmptyAlert && (
        <div
          className="modal-backdrop fade show"
          style={{ zIndex: 1040 }}
        ></div>
      )}
    </div>
  );
}