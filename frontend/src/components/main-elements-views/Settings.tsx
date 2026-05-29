import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import ConfirmModal from "../commons/ConfirmModal";
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

type BackupSettings = {
  scheduleDay: number;
  scheduleHour: number;
  lastRunDate: string | null;
  lastBackupPath: string | null;
};

type BackupRunResponse = {
  backupDate: string;
  backupPath: string;
  databaseFile: string;
  uploadsCopied: boolean;
  auditLogsCopied: boolean;
};

type BackupRestoreResponse = {
  restoredBackupName: string;
  preRestoreBackupCreated: boolean;
  preRestoreBackupPath: string | null;
  restoredDatabaseFile: string;
  uploadsRestored: boolean;
  auditLogsRestored: boolean;
};

export default function Settings() {
  const { hasRole } = useAuth();
  const canDownloadAuditLog = hasRole("ADMIN") || hasRole("MANAGER");
  const canManageBackups = hasRole("ADMIN") || hasRole("MANAGER");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingBackupSettings, setIsSavingBackupSettings] = useState(false);
  const [isRunningBackup, setIsRunningBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [backupSettings, setBackupSettings] = useState<BackupSettings | null>(null);
  const [selectedBackupDay, setSelectedBackupDay] = useState(1);
  const [selectedRestoreFile, setSelectedRestoreFile] = useState<File | null>(null);
  const [restoreCurrentBefore, setRestoreCurrentBefore] = useState(true);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);
  const { timezone, saveTimezone, isLoading: tzLoading } = useUserTimezone();

  // Estado para controlar el tiempo real de los relojes
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!canManageBackups) return;

    const loadBackupSettings = async () => {
      try {
        const res = await apiFetch("/api/backups/settings");
        if (!res) return;

        const data: BackupSettings = await res.json();
        setBackupSettings(data);
        setSelectedBackupDay(data.scheduleDay);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar la configuracion de backups");
      }
    };

    loadBackupSettings();
  }, [canManageBackups]);

  // Helper para formatear cualquier hora basada en un string de offset "±HH:MM"
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

  const handleDownloadAuditLog = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      const res = await apiFetch("/api/audit-log/download");
      if (!res) return;

      const blob = await res.blob();

      if (blob.size === 0) {
        setShowEmptyAlert(true);
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "AuditLog.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      if (err.status === 404) {
        setShowEmptyAlert(true);
      } else {
        setError(err instanceof Error ? err.message : "No se pudo descargar el AuditLog.csv");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveBackupSettings = async () => {
    setIsSavingBackupSettings(true);
    setError(null);
    setBackupMessage(null);

    try {
      const res = await apiFetch("/api/backups/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleDay: selectedBackupDay }),
      });
      if (!res) return;

      const data: BackupSettings = await res.json();
      setBackupSettings(data);
      setBackupMessage("Configuracion de backup guardada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la configuracion de backup");
    } finally {
      setIsSavingBackupSettings(false);
    }
  };

  const handleRunBackup = async () => {
    setIsRunningBackup(true);
    setError(null);
    setBackupMessage(null);

    try {
      const res = await apiFetch("/api/backups/run", { method: "POST" });
      if (!res) return;

      const data: BackupRunResponse = await res.json();
      setBackupSettings((current) => current
        ? { ...current, lastRunDate: data.backupDate, lastBackupPath: data.backupPath }
        : {
            scheduleDay: selectedBackupDay,
            scheduleHour: 2,
            lastRunDate: data.backupDate,
            lastBackupPath: data.backupPath,
          }
      );
      setBackupMessage(`Backup creado en ${data.backupPath}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo ejecutar el backup");
    } finally {
      setIsRunningBackup(false);
    }
  };

  const handleSelectRestoreFile = (file: File | null) => {
    setSelectedRestoreFile(file);
    setError(null);
    setBackupMessage(null);
  };

  const handleOpenRestoreConfirm = () => {
    if (!selectedRestoreFile) {
      setError("Selecciona un archivo de backup antes de restaurar.");
      return;
    }
    setRestoreCurrentBefore(true);
    setShowRestoreConfirm(true);
  };

  const handleRestoreBackup = async () => {
    if (!selectedRestoreFile) {
      setError("Selecciona un archivo de backup antes de restaurar.");
      return;
    }

    setIsRestoring(true);
    setError(null);
    setBackupMessage(null);

    try {
      const formData = new FormData();
      formData.append("backupFile", selectedRestoreFile);
      formData.append("saveCurrentBeforeRestore", String(restoreCurrentBefore));

      const res = await apiFetch("/api/backups/restore", {
        method: "POST",
        body: formData,
      });
      if (!res) return;

      const data: BackupRestoreResponse = await res.json();
      const preRestoreText = data.preRestoreBackupCreated
        ? ` Se guardó un respaldo previo en ${data.preRestoreBackupPath}.`
        : "";

      setBackupMessage(
        `Backup restaurado desde ${data.restoredBackupName}.${preRestoreText} Recargando la página...`
      );
      setShowRestoreConfirm(false);
      setSelectedRestoreFile(null);
      window.setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo restaurar el backup");
    } finally {
      setIsRestoring(false);
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
          

          {/* Sección del Audit Log */}
          {canDownloadAuditLog && (
            <div
              className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-3 rounded"
              style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
            >
              <div>
                <div className="fw-semibold">Descargar Audit Log</div>
                <small className="text-muted">Descarga el fichero `AuditLog.csv` con el historial registrado.</small>
              </div>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleDownloadAuditLog}
                disabled={isDownloading}
              >
                {isDownloading ? "Descargando..." : "Descargar AuditLog.csv"}
              </button>
            </div>
          )}

          {canManageBackups && (
            <div
              className="p-3 rounded mt-3"
              style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
            >
              <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                <div>
                  <div className="fw-semibold">Backups automáticos</div>
                  <small className="text-muted">
                    Configura el dia del mes y ejecuta una copia manual cuando sea necesario.
                  </small>
                  <div className="text-muted small mt-2">
                    Hora programada: {String(backupSettings?.scheduleHour ?? 2).padStart(2, "0")}:00
                  </div>
                  {backupSettings?.lastRunDate && (
                    <div className="text-muted small">
                      Ultimo backup: {backupSettings.lastRunDate}
                    </div>
                  )}
                  {backupSettings?.lastBackupPath && (
                    <div className="text-muted small">
                      Ruta: <span className="font-monospace">{backupSettings.lastBackupPath}</span>
                    </div>
                  )}
                </div>

                <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-end gap-2">
                  <div style={{ minWidth: "150px" }}>
                    <label className="form-label small mb-1" htmlFor="backup-day">
                      Dia del mes
                    </label>
                    <select
                      id="backup-day"
                      className="form-select form-select-sm"
                      value={selectedBackupDay}
                      onChange={(event) => setSelectedBackupDay(Number(event.target.value))}
                      disabled={isSavingBackupSettings || isRunningBackup}
                    >
                      {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={handleSaveBackupSettings}
                    disabled={isSavingBackupSettings || isRunningBackup}
                  >
                    {isSavingBackupSettings ? "Guardando..." : "Guardar"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleRunBackup}
                    disabled={isRunningBackup || isSavingBackupSettings}
                  >
                    {isRunningBackup ? "Ejecutando..." : "Ejecutar backup"}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <div className="fw-semibold mb-2">Restaurar backup</div>
                <small className="text-muted d-block mb-3">
                  Sube un backup generado por el sistema en formato `.zip` o `.sql`.
                </small>
                <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center">
                  <input
                    type="file"
                    className="form-control"
                    accept=".zip,.sql"
                    onChange={(event) => handleSelectRestoreFile(event.target.files?.[0] ?? null)}
                    disabled={isRestoring}
                  />
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={handleOpenRestoreConfirm}
                    disabled={!selectedRestoreFile || isRestoring}
                  >
                    {isRestoring ? "Restaurando..." : "Restaurar backup"}
                  </button>
                </div>
                {selectedRestoreFile && (
                  <div className="text-muted small mt-2">
                    Archivo seleccionado: <span className="font-monospace">{selectedRestoreFile.name}</span>
                  </div>
                )}
              </div>

              {backupMessage && (
                <div className="alert alert-success mt-3 mb-0">
                  {backupMessage}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="alert alert-danger mt-3 mb-0">
              {error}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        show={showRestoreConfirm}
        title="Restaurar backup"
        message="La restauración sobrescribirá los datos actuales con el backup seleccionado."
        variant="warning"
        confirmLabel="Restaurar"
        showCancelButton
        onConfirm={() => void handleRestoreBackup()}
        onCancel={() => {
          if (!isRestoring) {
            setShowRestoreConfirm(false);
          }
        }}
      >
        <div className="form-check">
          <input
            id="save-current-before-restore"
            className="form-check-input"
            type="checkbox"
            checked={restoreCurrentBefore}
            onChange={(event) => setRestoreCurrentBefore(event.target.checked)}
            disabled={isRestoring}
          />
          <label className="form-check-label" htmlFor="save-current-before-restore">
            Guardar un backup del estado actual antes de restaurar
          </label>
        </div>
        <div className="text-muted small mt-2">
          Archivo: <span className="font-monospace">{selectedRestoreFile?.name ?? "-"}</span>
        </div>
      </ConfirmModal>

      {/* Modal Bootstrap */}
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
