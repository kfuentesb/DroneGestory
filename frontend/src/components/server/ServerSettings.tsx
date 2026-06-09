import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import ConfirmModal from "../commons/ConfirmModal";
import LoadingSpinner from "../commons/Loading";
import { useAuth } from "../commons/hooks/useAuth";

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

type AvailableAuditLogMonth = {
    year: number;
    month: number;
    displayName: string;
};

type AvailableAuditLogsResponse = {
    years: number[];
    monthsByYear: Record<number, AvailableAuditLogMonth[]>;
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
    const [restoreAuditLogs, setRestoreAuditLogs] = useState(true);
    const [showAuditLogRestoreConfirm, setShowAuditLogRestoreConfirm] = useState(false);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [showEmptyAlert, setShowEmptyAlert] = useState(false);
    const [availableAuditLogs, setAvailableAuditLogs] = useState<AvailableAuditLogsResponse | null>(null);
    const [selectedAuditYear, setSelectedAuditYear] = useState<number | null>(null);
    const [selectedAuditMonth, setSelectedAuditMonth] = useState<number | null>(null);
    const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
    
    
    useEffect(() => {
        if (!canDownloadAuditLog) return;

        const loadAuditLogs = async () => {
            setIsLoadingAuditLogs(true);
            try {
                const res = await apiFetch("/api/audit-log/available");
                if (!res) return;

                const data: AvailableAuditLogsResponse = await res.json();
                setAvailableAuditLogs(data);
                
                // Set default selection to the latest month if available
                if (data.years.length > 0) {
                    const latestYear = data.years[0];
                    setSelectedAuditYear(latestYear);
                    const latestMonths = data.monthsByYear[latestYear];
                    if (latestMonths && latestMonths.length > 0) {
                        setSelectedAuditMonth(latestMonths[0].month);
                    }
                }
            } catch (err) {
                console.error("Error loading audit logs:", err);
            } finally {
                setIsLoadingAuditLogs(false);
            }
        };

        loadAuditLogs();
    }, [canDownloadAuditLog]);
    
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
        if (selectedAuditYear === null || selectedAuditMonth === null) {
            setError("Selecciona un año y mes para descargar.");
            return;
        }

        setIsDownloading(true);
        setError(null);
    
        try {
            const res = await apiFetch(`/api/audit-log/download?year=${selectedAuditYear}&month=${selectedAuditMonth}`);
            if (!res) return;
        
            const blob = await res.blob();
        
            if (blob.size === 0) {
                setShowEmptyAlert(true);
                return;
            }
        
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `AuditLog-${selectedAuditYear}-${String(selectedAuditMonth).padStart(2, "0")}.csv`;
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
        const shouldAskAboutAuditLogs = selectedRestoreFile.name.toLowerCase().endsWith(".zip");
        setRestoreAuditLogs(true);
        setRestoreCurrentBefore(true);
        if (shouldAskAboutAuditLogs) {
            setShowAuditLogRestoreConfirm(true);
            return;
        }
        setShowRestoreConfirm(true);
    };

    const openRestoreConfirm = (shouldRestoreAuditLogs: boolean) => {
        setRestoreAuditLogs(shouldRestoreAuditLogs);
        setShowAuditLogRestoreConfirm(false);
        setRestoreCurrentBefore(true);
        setShowRestoreConfirm(true);
    };
    
    const handleRestoreBackup = async () => {
        if (!selectedRestoreFile) {
        setError("Selecciona un archivo de backup antes de restaurar.");
        return;
        }
    
        setIsRestoring(true);
        setShowRestoreConfirm(false);
        setShowAuditLogRestoreConfirm(false);
        setError(null);
        setBackupMessage(null);
    
        try {
        const formData = new FormData();
        formData.append("backupFile", selectedRestoreFile);
        formData.append("saveCurrentBeforeRestore", String(restoreCurrentBefore));
        formData.append("restoreAuditLogs", String(restoreAuditLogs));
    
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
            setSelectedRestoreFile(null);
            setRestoreAuditLogs(true);
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
                        <div className="card shadow-sm border-light mb-4" style={{ backgroundColor: "#F9FAFB" }}>
                            <div className="card-body p-4">
                                <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-4">
                                    
                                    {/* Bloque de Texto e Información */}
                                    <div className="d-flex align-items-start gap-3">
                                        <div>
                                            <h6 className="fw-bold text-dark mb-1">Descargar Audit Log</h6>
                                            <p className="text-muted small mb-0">
                                                Descarga el fichero <code className="bg-light px-1 py-0.5 rounded text-dark border small fw-mono">AuditLog-YYYY-MM.csv</code> con el historial registrado de acciones del sistema.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bloque de Selectores y Botón */}
                                    <div className="w-100 style-selectors" style={{ maxWidth: "480px" }}>
                                        <div className="row g-2 align-items-center">
                                            <div className="col-12 col-sm-4">
                                                <select
                                                    className="form-select form-select-sm border-secondary-subtle"
                                                    value={selectedAuditYear ?? ""}
                                                    onChange={(e) => {
                                                        const year = e.target.value ? parseInt(e.target.value) : null;
                                                        setSelectedAuditYear(year);
                                                        if (year && availableAuditLogs?.monthsByYear[year]) {
                                                            const months = availableAuditLogs.monthsByYear[year];
                                                            setSelectedAuditMonth(months[0]?.month ?? null);
                                                        }
                                                    }}
                                                    disabled={isDownloading || isLoadingAuditLogs || !availableAuditLogs?.years.length}
                                                >
                                                    <option value="">Año</option>
                                                    {availableAuditLogs?.years.map((year) => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-12 col-sm-5">
                                                <select
                                                    className="form-select form-select-sm border-secondary-subtle"
                                                    value={selectedAuditMonth ?? ""}
                                                    onChange={(e) => setSelectedAuditMonth(e.target.value ? parseInt(e.target.value) : null)}
                                                    disabled={isDownloading || isLoadingAuditLogs || !selectedAuditYear}
                                                >
                                                    <option value="">Mes</option>
                                                    {selectedAuditYear && availableAuditLogs?.monthsByYear[selectedAuditYear]?.map((m) => (
                                                        <option key={m.month} value={m.month}>{m.displayName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-12 col-sm-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm d-inline-flex align-items-center justify-content-center w-100 gap-2"
                                                    onClick={handleDownloadAuditLog}
                                                    disabled={isDownloading || !selectedAuditYear || !selectedAuditMonth || isLoadingAuditLogs}
                                                >
                                                    {isDownloading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            <span className="d-sm-none d-md-inline">...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span>Descargar</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sección de Gestión de Backups */}
                    {canManageBackups && (
                        <div className="p-4 rounded" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                            {isRestoring ? (
                                <LoadingSpinner message="Restaurando backup..." />
                            ) : (
                                <>
                            
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
                                            onChange={(event) => {
                                                const file = event.target.files?.[0] ?? null;
                                                handleSelectRestoreFile(file);
                                                event.target.value = "";
                                            }}
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
                                </>
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
                show={showAuditLogRestoreConfirm}
                title="Restaurar backup"
                message="¿Quieres reescribir el AuditLog con el nuevo?"
                variant="warning"
                confirmLabel="Sí"
                cancelLabel="No"
                showCancelButton
                onConfirm={() => openRestoreConfirm(true)}
                onCancel={() => openRestoreConfirm(false)}
            />

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
                {selectedRestoreFile?.name.toLowerCase().endsWith(".zip") && (
                    <div className="text-muted small mt-2">
                        AuditLog: <span className="font-monospace">{restoreAuditLogs ? "se sobrescribirá" : "se conservará"}</span>
                    </div>
                )}
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
