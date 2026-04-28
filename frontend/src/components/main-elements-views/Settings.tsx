import { useState } from "react";
import { apiFetch } from "../../api";
import { useAuth } from "../commons/hooks/useAuth";

export default function Settings() {
  const { hasRole } = useAuth();
  const canDownloadAuditLog = hasRole("ADMIN") || hasRole("MANAGER");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadAuditLog = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      const res = await apiFetch("/api/audit-log/download");
      if (!res) return;

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "AuditLog.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo descargar el AuditLog.txt");
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
    </div>
  );
}
