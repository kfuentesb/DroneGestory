import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import ConfirmModal from "../commons/ConfirmModal";
import { useAuth } from "../commons/hooks/useAuth";
import { useUserTimezone } from "../commons/hooks/useUserTimezone";
import { InfoBadge } from "../commons/InfoBadge";

type BackupSettings = {
    scheduleDay: number;
    scheduleHour: number;
    lastRunDate: string | null;
    lastBackupPath: string | null;
    lastBackupSizeBytes: number | null;
};

type BackupRunResponse = {
    backupDate: string;
    backupPath: string;
    databaseFile: string;
    backupSizeBytes: number;
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


export default function ServerSettings (){

    const { hasRole } = useAuth();
    const canDownloadAuditLog = hasRole("ADMIN") || hasRole("MANAGER");
    const canManageBackups = hasRole("ADMIN") || hasRole("MANAGER");
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDownloadingBackupPackage, setIsDownloadingBackupPackage] = useState(false);
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

    const formatBackupSize = (bytes?: number | null) => {
        if (bytes === null || bytes === undefined) {
            return "-";
        }
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    const getFilenameFromContentDisposition = (contentDisposition: string | null) => {
        if (!contentDisposition) {
            return "DroneGestory_backup.zip";
        }
        const match = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
        return match?.[1] ?? "DroneGestory_backup.zip";
    };
    
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
            ? { ...current, lastRunDate: data.backupDate, lastBackupPath: data.backupPath, lastBackupSizeBytes: data.backupSizeBytes }
            : {
                scheduleDay: selectedBackupDay,
                scheduleHour: 2,
                lastRunDate: data.backupDate,
                lastBackupPath: data.backupPath,
                lastBackupSizeBytes: data.backupSizeBytes,
            }
        );
            setBackupMessage(`Backup creado en ${data.backupPath}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo ejecutar el backup");
        } finally {
            setIsRunningBackup(false);
        }
    };

    const handleDownloadBackupPackage = async () => {
        setIsDownloadingBackupPackage(true);
        setError(null);
        setBackupMessage(null);

        try {
            const res = await apiFetch("/api/backups/download", { method: "POST" });
            if (!res) return;

            const blob = await res.blob();
            if (blob.size === 0) {
                setError("No se pudo generar el backup descargable.");
                return;
            }

            const fileName = getFilenameFromContentDisposition(res.headers.get("content-disposition"));
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setBackupMessage(`Backup descargable generado: ${fileName}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo descargar el backup");
        } finally {
            setIsDownloadingBackupPackage(false);
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
                    {/* Sección del Audit Log */}
                    {canDownloadAuditLog && (
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 p-3 rounded mb-4"
                            style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                            <div>
                                <div className="fw-bold text-dark mb-1">Descargar Audit Log</div>
                                <div className="text-muted small">Descarga el fichero <code className="text-danger">AuditLog.csv</code> con el historial registrado del sistema.</div>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="btn btn-success d-inline-flex align-items-center px-3"
                                    onClick={handleDownloadAuditLog}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Descargando...
                                        </>
                                    ) : (
                                        "Descargar AuditLog.csv"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Sección de Gestión de Backups */}
                    {canManageBackups && (
                        <div className="p-4 rounded" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                            
                            {/* Cabecera e Información de Backups */}
                            <div className="row g-4 align-items-start">
                                <div className="col-12 col-xl-7">
                                    <div className="fw-bold text-dark mb-1 fs-5">Backups automáticos</div>
                                    <p className="text-muted small mb-3">
                                        Configura la periodicidad mensual y gestiona las copias de seguridad del servidor.
                                    </p>
                                    
                                    {/* Grid de Metadatos del Backup */}
                                    <div className="row g-2 bg-white p-3 rounded border border-light shadow-sm">
                                        <div className="col-sm-6 text-muted small">
                                            <span className="fw-semibold text-secondary d-block">Hora programada:</span>
                                            {String(backupSettings?.scheduleHour ?? 2).padStart(2, "0")}:00 hrs
                                        </div>
                                        {backupSettings?.lastRunDate && (
                                            <div className="col-sm-6 text-muted small">
                                                <span className="fw-semibold text-secondary d-block">Último backup realizado:</span>
                                                {backupSettings.lastRunDate}
                                            </div>
                                        )}
                                        <div className="col-sm-6 text-muted small">
                                            <span className="fw-semibold text-secondary d-block">Tamaño del archivo:</span>
                                            <span className="badge bg-light text-dark border">{formatBackupSize(backupSettings?.lastBackupSizeBytes)}</span>
                                        </div>
                                        {backupSettings?.lastBackupPath && (
                                            <div className="col-12 text-muted small mt-2 pt-2 border-top">
                                                <span className="fw-semibold text-secondary d-block mb-1">Ruta en servidor:</span>
                                                <span className="font-monospace text-break bg-light px-2 py-1 rounded small">{backupSettings.lastBackupPath}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Controles de Configuración y Ejecución */}
                                <div className="col-12 col-xl-5">
                                    <div className="card bg-white p-3 border shadow-sm">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold text-secondary small" htmlFor="backup-day">
                                                Programación (Día del mes)
                                            </label>
                                            <div className="input-group input-group-sm">
                                                <select
                                                    id="backup-day"
                                                    className="form-select"
                                                    value={selectedBackupDay}
                                                    onChange={(event) => setSelectedBackupDay(Number(event.target.value))}
                                                    disabled={isSavingBackupSettings || isRunningBackup}
                                                >
                                                    {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                                                        <option key={day} value={day}>Día {day}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="btn btn-primary px-3"
                                                    type="button"
                                                    onClick={handleSaveBackupSettings}
                                                    disabled={isSavingBackupSettings || isRunningBackup}
                                                >
                                                    {isSavingBackupSettings ? "Guardando..." : "Guardar"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="d-flex flex-column gap-2 mt-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-success w-100"
                                                onClick={handleRunBackup}
                                                disabled={isRunningBackup || isSavingBackupSettings}
                                            >
                                                {isRunningBackup ? "Ejecutando copia..." : "Ejecutar backup ahora"}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary w-100"
                                                onClick={handleDownloadBackupPackage}
                                                disabled={isDownloadingBackupPackage || isRunningBackup || isSavingBackupSettings}
                                            >
                                                {isDownloadingBackupPackage ? "Generando paquete..." : "Crear y descargar ZIP a local"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Zona de Restauración */}
                            <div className="mt-4 pt-4 border-top">
                                <div className="fw-bold text-dark mb-1">Restaurar copia de seguridad</div>
                                <div className="text-muted small mb-3">
                                    Sube un archivo de respaldo previo en formato <code className="text-primary">.zip</code> o <code className="text-primary">.sql</code>. <span className="text-warning fw-semibold">Atención: Esto reemplazará los datos actuales.</span>
                                </div>
                                
                                <div className="row g-2 align-items-center">
                                    <div className="col-12 col-md">
                                        <input
                                            type="file"
                                            className="form-control form-control-sm"
                                            accept=".zip,.sql"
                                            onChange={(event) => handleSelectRestoreFile(event.target.files?.[0] ?? null)}
                                            disabled={isRestoring}
                                        />
                                    </div>
                                    <div className="col-12 col-md-auto">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-warning w-100 px-4"
                                            onClick={handleOpenRestoreConfirm}
                                            disabled={!selectedRestoreFile || isRestoring}
                                        >
                                            {isRestoring ? "Restaurando sistema..." : "Restaurar archivo"}
                                        </button>
                                    </div>
                                </div>
                                
                                {selectedRestoreFile && (
                                    <div className="mt-2 bg-white p-2 rounded border small d-inline-block">
                                        <span className="text-secondary fw-medium">Preparado:</span> <code className="text-dark">{selectedRestoreFile.name}</code>
                                    </div>
                                )}
                            </div>

                            {/* Alertas de Estado del proceso */}
                            {backupMessage && (
                                <div className="alert alert-success d-flex align-items-center mt-4 mb-0 small" role="alert">
                                    <div>{backupMessage}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center mt-3 mb-0 small" role="alert">
                            <div>{error}</div>
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
