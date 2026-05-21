import { useCallback, useEffect, useState } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api";
import { useAuth } from "../commons/hooks/useAuth";
import LoadingSpinner from "../commons/Loading";
import ButtonProp from "../commons/props/ButtonProp";
import Pagination from "../commons/props/Pagination";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import SearchBar from "../commons/props/SearchBar";
import { styles } from "../../styles/styles";
import arroBackIcon from '../../assets/commons/arrow_back_white.svg';
import downloadIcon from '../../assets/commons/download.svg';
import { MaintenanceHistoryPdf } from "../pdf/MaintanceHistoryPdf";

type MaintenanceDocumentation = {
    id: number;
    maintenanceId?: number | null;
    documentationType?: string | null;
    documentationName?: string | null;
    filePath?: string | null;
    expireDate?: string | null;
    dateIndefinite?: boolean | null;
};

type MaintenanceRecord = {
    id: number;
    aircraftId: number;
    aircraftManufacturer?: string | null;
    aircraftModel?: string | null;
    aircraftSerialNumber?: string | null;
    reviewType?: string | null;
    monthsRequired?: number | null;
    hoursFlightRequired?: number | null;
    maintenanceDate?: string | null;
    nextMaintenanceDate?: string | null;
    comments?: string | null;
    documentation?: MaintenanceDocumentation | null;
};

const formatDate = (value?: string | null) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
};

const formatMinutes = (minutes?: number | null) => {
    if (minutes == null || Number.isNaN(minutes)) return "-";
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours}h ${remainder.toString().padStart(2, "0")}m`;
};

const toInputDateValue = (value?: string | null) => {
    if (!value) return "";
    return value.includes("T") ? value.split("T")[0] : value;
};

const encodeDocumentPath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

const getFileNameFromPath = (path: string) => {
    const parts = path.split("/").filter(Boolean);
    return parts[parts.length - 1] || "documento";
};

const sanitizeFileName = (value: string) => value.replace(/[\\/:*?"<>|]+/g, "_");

const buildSafeFileToken = (value?: string | null) => {
    if (!value) return "aeronave";
    return value.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
};

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = sanitizeFileName(fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
};

async function openDocumentationInNewTab(documentation: MaintenanceDocumentation) {
    const path = documentation.documentationName || documentation.filePath;
    if (!path) return;
    const newTab = window.open("about:blank", "_blank");
    
    if (!newTab) {
        alert("El bloqueador de ventanas emergentes impidió abrir el documento.");
        return;
    }
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    try {
        const response = await apiFetch(`/api/maintenance-documentation/files/${encodedPath}`);
        if (!response) throw new Error("No se obtuvo respuesta del servidor");
        const blob = await response.blob();
        const isPdf = path.toLowerCase().endsWith(".pdf");
        const fileBlob = isPdf && (!blob.type || blob.type === "application/octet-stream")
            ? new Blob([blob], { type: "application/pdf" })
            : blob;

        const objectUrl = URL.createObjectURL(fileBlob);
        newTab.location.href = objectUrl;

        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (error) {
        newTab.close();
        console.error("No se pudo cargar el documento", error);
        alert("No se pudo abrir el documento. Intenta de nuevo más tarde.");
    }
}

export default function MaintenanceAircraftList() {
    const { aircraftId } = useParams<{ aircraftId: string }>();
    const navigate = useNavigate();
    const { role } = useAuth();
    const isAdmin = role === "ADMIN";
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [aircraftData, setAircraftData] = useState<{ manufacturer?: string; serialNumber?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null);
    const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);
    const [editingHours, setEditingHours] = useState(0);
    const [editingMinutes, setEditingMinutes] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentationMarkedForDeletion, setDocumentationMarkedForDeletion] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [isPdfDownloading, setIsPdfDownloading] = useState(false);
    const ITEMS_PER_PAGE = 10;

    const fetchRecords = useCallback(async () => {
        if (!aircraftId) {
            setError("Aeronave no seleccionada.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const [maintenanceResponse, aircraftResponse] = await Promise.all([
                apiFetch(`/api/maintenance/aircraft/${aircraftId}`),
                apiFetch(`/api/aircraft/${aircraftId}`)
            ]);
            const maintenanceData = maintenanceResponse ? await maintenanceResponse.json() : [];
            const aircraft = aircraftResponse ? await aircraftResponse.json() : null;
            
            setRecords(Array.isArray(maintenanceData) ? maintenanceData : []);
            if (aircraft) {
                setAircraftData({
                    manufacturer: aircraft.aircraftModel?.manufacturer || aircraft.manufacturer,
                    serialNumber: aircraft.serialNumber
                });
            }
        } catch (err) {
            console.error("Error cargando mantenimientos de aeronave", err);
            setRecords([]);
            setError("No se pudieron cargar los mantenimientos. Intente de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, [aircraftId]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!window.confirm("Estas seguro de que deseas eliminar este mantenimiento?")) return;
        try {
            const response = await apiFetch(`/api/maintenance/${id}`, { method: "DELETE" });
            if (response?.ok) {
                if (selectedMaintenance?.id === id) setSelectedMaintenance(null);
                setCurrentPage(1);
                await fetchRecords();
            }
        } catch (err) {
            console.error("Error al eliminar mantenimiento", err);
            alert("No se pudo eliminar el mantenimiento.");
        }
    };

    const resetEditState = () => {
        setEditingMaintenance(null);
        setEditingHours(0);
        setEditingMinutes(0);
        setSelectedFile(null);
        setDocumentationMarkedForDeletion(false);
        setUpdateError(null);
        setUpdateLoading(false);
        setCurrentPage(1);
    };

    const handleEditStart = (record: MaintenanceRecord) => {
        setEditingMaintenance(record);
        setEditingHours(Math.floor((record.hoursFlightRequired ?? 0) / 60));
        setEditingMinutes((record.hoursFlightRequired ?? 0) % 60);
        setSelectedFile(null);
        setDocumentationMarkedForDeletion(false);
        setUpdateError(null);
    };

    const handleEditingFieldChange = (field: keyof MaintenanceRecord, value: unknown) => {
        setEditingMaintenance((prev) => prev ? { ...prev, [field]: value } : prev);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateError(null);
        if (!editingMaintenance) return;
        const totalMinutes = editingHours * 60 + editingMinutes;
        if (totalMinutes < 0) {
            setUpdateError("Las horas de vuelo deben ser un valor valido mayor que 0.");
            return;
        }
        setUpdateLoading(true);
        try {
            const metadata = {
                aircraftId: editingMaintenance.aircraftId,
                reviewType: editingMaintenance.reviewType?.trim() || "",
                monthsRequired: editingMaintenance.monthsRequired ?? 0,
                hoursFlightRequired: totalMinutes,
                maintenanceDate: toInputDateValue(editingMaintenance.maintenanceDate),
                nextMaintenanceDate: toInputDateValue(editingMaintenance.nextMaintenanceDate) || null,
                comments: editingMaintenance.comments?.trim() || null,
                documentation: selectedFile || editingMaintenance.documentation ? {
                    documentationLabel: editingMaintenance.documentation?.documentationType || "Documentacion de mantenimiento",
                    documentationType: editingMaintenance.documentation?.documentationType || "Documentacion de mantenimiento",
                    expireDate: editingMaintenance.documentation?.dateIndefinite ? null : (editingMaintenance.documentation?.expireDate || null),
                    dateIndefinite: editingMaintenance.documentation?.dateIndefinite ?? true,
                } : null,
                removeDocumentation: documentationMarkedForDeletion,
            };
            const formData = new FormData();
            formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
            if (selectedFile) formData.append("file", selectedFile);
            await apiFetch(`/api/maintenance/${editingMaintenance.id}`, { method: "PUT", body: formData });
            resetEditState();
            await fetchRecords();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Desconocido";
            setUpdateError(`Error al actualizar: ${message}`);
            console.error("Error al actualizar mantenimiento", err);
        } finally {
            setUpdateLoading(false);
        }
    };

    if (isLoading) return <LoadingSpinner message="Cargando mantenimientos..." />;

    const filteredRecords = records.filter((record) =>
        [record.reviewType, record.comments, record.aircraftSerialNumber, record.aircraftManufacturer, record.aircraftModel, record.documentation?.documentationType]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const recordsForReport = filteredRecords;

    const getAircraftForReport = (recordsList: MaintenanceRecord[]) => {
        if (recordsList.length > 0) {
            const first = recordsList[0];
            return {
                manufacturer: first.aircraftManufacturer ?? "Aeronave",
                model: first.aircraftModel ?? "",
                serialNumber: first.aircraftSerialNumber ?? aircraftId ?? "",
            };
        }
        return {
            manufacturer: "Aeronave",
            model: "",
            serialNumber: aircraftId ?? "",
        };
    };

    const buildReportToken = (recordsList: MaintenanceRecord[]) => {
        const serial = recordsList[0]?.aircraftSerialNumber ?? aircraftId ?? "aeronave";
        return buildSafeFileToken(serial);
    };

    const downloadPdfBlob = async (
        pdfDocument: React.ReactElement<DocumentProps>, 
        fileName: string
    ) => {
        const blob = await pdf(pdfDocument).toBlob();
        downloadBlob(blob, fileName);
    };

    const downloadMaintenanceAttachments = async (recordsList: MaintenanceRecord[], fileToken: string) => {
        const attachments = recordsList
            .map((record) => {
                const doc = record.documentation;
                if (!doc) return null;
                const path = doc.filePath || doc.documentationName;
                if (!path) return null;
                const name = sanitizeFileName(doc.documentationName || getFileNameFromPath(path));
                return { path, name };
            })
            .filter((item): item is { path: string; name: string } => Boolean(item));

        if (attachments.length === 0) {
            return;
        }

        if (attachments.length === 1) {
            const response = await apiFetch(`/api/maintenance-documentation/files/${encodeDocumentPath(attachments[0].path)}`);
            if (!response) throw new Error("Sin respuesta del servidor");
            const blob = await response.blob();
            downloadBlob(blob, attachments[0].name);
            return;
        }

        const nameCount = new Map<string, number>();

        const results = await Promise.allSettled(
            attachments.map(async (attachment) => {
                const response = await apiFetch(`/api/maintenance-documentation/files/${encodeDocumentPath(attachment.path)}`);
                if (!response) throw new Error("Sin respuesta del servidor");
                const blob = await response.blob();
                return { name: attachment.name, blob };
            })
        );

        results.forEach((result) => {
            if (result.status !== "fulfilled") return;
            const baseName = result.value.name || "documento";
            const current = nameCount.get(baseName) ?? 0;
            nameCount.set(baseName, current + 1);
            const extIndex = baseName.lastIndexOf(".");
            const hasExt = extIndex > 0;
            const base = hasExt ? baseName.slice(0, extIndex) : baseName;
            const ext = hasExt ? baseName.slice(extIndex) : "";
            const uniqueName = current === 0 ? baseName : `${base}_${current + 1}${ext}`;
            downloadBlob(result.value.blob, uniqueName);
        });
    };

    const handleDownloadHistory = async () => {
        if (isPdfDownloading) return;
        if (recordsForReport.length === 0) {
            alert("No hay registros de mantenimiento para descargar.");
            return;
        }
        setIsPdfDownloading(true);
        try {
            const aircraft = getAircraftForReport(recordsForReport);
            const fileToken = buildReportToken(recordsForReport);
            await downloadPdfBlob(
                <MaintenanceHistoryPdf aircraft={aircraft} maintenanceRecords={recordsForReport} />,
                `Historial_Mantenimiento_${fileToken}.pdf`
            );
            await downloadMaintenanceAttachments(recordsForReport, fileToken);
        } catch (err) {
            console.error("Error descargando historial de mantenimiento", err);
            alert("No se pudo descargar el historial de mantenimiento.");
        } finally {
            setIsPdfDownloading(false);
        }
    };

    const paginatedRecords = filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const headers: TableHeader[] = [
        { label: "Fecha", key: "maintenanceDate", sortable: true },
        { label: "Proximo mantenimiento", key: "nextMaintenanceDate", sortable: true },
        { label: "Revision", key: "reviewType", sortable: true },
        { label: "Meses", key: "monthsRequired", sortable: true },
        { label: "Horas de vuelo", key: "hoursFlightRequired", sortable: true },
        { label: "Comentarios", key: "comments", sortable: false },
        { label: "Documentacion", key: "documentation", sortable: false },
    ];
    if (isAdmin) headers.push({ label: "Acciones", key: "actions", sortable: false });
    const aircraftLabel = aircraftData?.manufacturer || (records.length > 0 ? records[0].aircraftManufacturer : null)
        ? `${(aircraftData?.manufacturer?.trim() || records[0]?.aircraftManufacturer?.trim() || "Aeronave")} (S/N: ${(aircraftData?.serialNumber?.trim() || records[0]?.aircraftSerialNumber?.trim() || "N/A")})`.trim()
        : `Aeronave ${aircraftId ?? ""}`;

    return (
        <div className="container py-4">
            <div className="card shadow-sm border-0" style={{ borderRadius: "12px", overflow: "hidden" }}>
                {/* Header unificado y responsive */}
                <div className="card-header bg-white border-bottom py-3">
                    <div className="d-flex align-items-center">
                        <button 
                            className="btn d-flex align-items-center justify-content-center flex-shrink-0 position-absolute p-2 me-2" 
                            onClick={() => navigate("/maintenance")}
                            style={styles.backBtn}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 130, 69, 0.1)")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            title="Volver"
                        >
                            <img 
                            src={arroBackIcon} 
                            alt="Volver" 
                            style={styles.backIcon} 
                            />
                        </button>
                        <h2 className="h4 mb-0 fw-bold text-dark flex-grow-1">
                            Mantenimientos de <span className="text-primary">{aircraftLabel}</span>
                        </h2>
                    </div>
                </div>

                <div className="card-body p-3 p-md-4">
                    {error && <div className="alert alert-danger rounded-3">{error}</div>}

                    {/* Barra de Herramientas: Buscador + Acciones */}
                    <div className="row g-3 mb-4 align-items-center">
                        <div className="col-12 col-md-6">
                            <SearchBar value={search} placeholder="Buscar por tipo o comentario..." onChange={setSearch} />
                        </div>
                        <div className="col-12 col-md-6 d-flex justify-content-md-end gap-2">
                            <button
                                type="button"
                                className="btn btn-dark d-flex align-items-center gap-2 px-3 shadow-sm"
                                style={{ borderRadius: "8px" }}
                                onClick={() => void handleDownloadHistory()}
                                disabled={isPdfDownloading}
                            >
                                <img src={downloadIcon} alt="" style={{ width: 16, height: 16, filter: "brightness(0) invert(1)" }} />
                                <span>{isPdfDownloading ? "Generando..." : "Descargar"}</span>
                            </button>
                            
                            {(role === "ADMIN" || role === "MAINTAINER") && (
                                <ButtonProp 
                                    type="button" 
                                    onClick={() => navigate(`/register-maintenance?aircraftId=${aircraftId}`)}
                                >
                                    <span className="d-none d-sm-inline">+ Registrar</span>
                                    <span className="d-sm-none">+ Nuevo</span>
                                </ButtonProp>
                            )}
                        </div>
                    </div>
                    <style>{`.maintenance-row td{background-color:rgba(13,110,253,.04)!important}.maintenance-row td:first-child{border-left:4px solid #0d6efd!important}.maintenance-row td:last-child{border-right:4px solid #0d6efd!important}.text-truncate-custom{max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`}</style>

                    {/* --- VISTA ESCRITORIO (TABLA) --- */}
                    <div className="d-none d-md-block">
                        <ReusableTable
                            headers={headers}
                            rows={paginatedRecords}
                            onRowClick={(row: MaintenanceRecord) => setSelectedMaintenance(row)}
                            rowClassName={() => "cursor-pointer maintenance-row"}
                            renderRow={(row: MaintenanceRecord) => (
                                <>
                                    <td className="fw-medium">{formatDate(row.maintenanceDate)}</td>
                                    <td className="text-muted">{formatDate(row.nextMaintenanceDate)}</td>
                                    <td><span className="badge bg-light text-dark border">{row.reviewType || "N/A"}</span></td>
                                    <td>{row.monthsRequired ?? "N/A"} m</td>
                                    <td>{formatMinutes(row.hoursFlightRequired)}</td>
                                    <td><div className="text-truncate-custom text-muted small" title={row.comments ?? ""}>{row.comments || "N/A"}</div></td>
                                    <td>
                                        {row.documentation?.documentationName || row.documentation?.filePath 
                                            ? <span className="badge bg-success-subtle text-success">Sí</span> 
                                            : <span className="badge bg-light text-muted">No</span>}
                                    </td>
                                    {isAdmin && <td>
                                        <div className="d-flex gap-1">
                                            <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); handleEditStart(row); }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={(e) => handleDelete(e, row.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>}
                            </>

                        )} 
                            emptyText="No hay datos de mantenimiento."
                        />
                    </div>

                    {/* --- VISTA MÓVIL (CARDS) --- */}
                    <div className="d-md-none">
                        {paginatedRecords.length > 0 ? (
                            <div className="d-flex flex-column gap-3">
                                {paginatedRecords.map((row) => (
                                    <div 
                                        key={row.id} 
                                        className="card-mobile bg-white rounded-3 p-3 shadow-sm"
                                        onClick={() => setSelectedMaintenance(row)}
                                    >
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <span className="small text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Tipo de Revisión</span>
                                                <span className="fw-bold text-primary">{row.reviewType || "General"}</span>
                                            </div>
                                            <span className={`badge ${row.documentation?.filePath ? 'bg-success-subtle text-success' : 'bg-light text-muted'}`}>
                                                {row.documentation?.filePath ? 'Con Doc' : 'Sin Doc'}
                                            </span>
                                        </div>
                                        
                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <span className="text-muted small d-block">Fecha</span>
                                                <span className="small fw-medium">{formatDate(row.maintenanceDate)}</span>
                                            </div>
                                            <div className="col-6 text-end">
                                                <span className="text-muted small d-block">Siguiente</span>
                                                <span className="small fw-medium text-danger">{formatDate(row.nextMaintenanceDate)}</span>
                                            </div>
                                            <div className="col-6">
                                                <span className="text-muted small d-block">Horas Vuelo</span>
                                                <span className="small">{formatMinutes(row.hoursFlightRequired)}</span>
                                            </div>
                                            <div className="col-6 text-end">
                                                <span className="text-muted small d-block">Meses</span>
                                                <span className="small">{row.monthsRequired ?? "0"} meses</span>
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="d-flex gap-2 border-top pt-2 mt-2" onClick={(e) => e.stopPropagation()}>
                                                <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={(e) => { e.stopPropagation(); handleEditStart(row); }}>Editar</button>
                                                <button className="btn btn-sm btn-outline-danger flex-grow-1" onClick={(e) => { e.stopPropagation(); handleDelete(e, row.id); }}>Eliminar</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-5 text-muted small">No hay datos para mostrar.</div>
                        )}
                    </div>

                    {/* Paginación común */}
                    <div className="mt-4 d-flex justify-content-center">
                        <Pagination 
                            totalItems={filteredRecords.length} 
                            currentPage={currentPage} 
                            itemsPerPage={ITEMS_PER_PAGE} 
                            onPageChange={setCurrentPage} 
                        />
                    </div>
                </div>
            </div>

            {/* --- MODALES DE DETALLE Y EDICIÓN --- */}
            {selectedMaintenance && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedMaintenance(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow rounded-4">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold text-dark">Detalle del Mantenimiento</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedMaintenance(null)}></button>
                            </div>
                            <div className="modal-body py-3">
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Tipo de Revisión</label>
                                    <span className="fw-semibold text-dark">{selectedMaintenance.reviewType || "N/A"}</span>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <label className="text-muted small d-block">Fecha Mantenimiento</label>
                                        <span className="fw-medium">{formatDate(selectedMaintenance.maintenanceDate)}</span>
                                    </div>
                                    <div className="col-6">
                                        <label className="text-muted small d-block">Próxima Fecha</label>
                                        <span className="fw-medium text-danger">{formatDate(selectedMaintenance.nextMaintenanceDate)}</span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small d-block">Comentarios</label>
                                    <p className="bg-light p-3 rounded-3 text-muted small mb-0" style={{ whiteSpace: "pre-wrap" }}>
                                        {selectedMaintenance.comments || "Sin comentarios adicionales."}
                                    </p>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pt-0">
                                <button type="button" className="btn btn-light rounded-3 w-100" onClick={() => setSelectedMaintenance(null)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingMaintenance && (
                <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={resetEditState}>
                    <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow rounded-4">
                            <form onSubmit={handleUpdate}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold text-dark">Editar Mantenimiento</h5>
                                    <button type="button" className="btn-close" onClick={resetEditState}></button>
                                </div>
                                <div className="modal-body py-3">
                                    {updateError && <div className="alert alert-danger rounded-3">{updateError}</div>}

                                    <div className="row g-3 mb-3">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label">Tipo de Revisión</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingMaintenance.reviewType ?? ""}
                                                onChange={(e) => handleEditingFieldChange("reviewType", e.target.value)}
                                            />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <label className="form-label">Fecha</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={toInputDateValue(editingMaintenance.maintenanceDate)}
                                                onChange={(e) => handleEditingFieldChange("maintenanceDate", e.target.value)}
                                            />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <label className="form-label">Próxima Fecha</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={toInputDateValue(editingMaintenance.nextMaintenanceDate)}
                                                onChange={(e) => handleEditingFieldChange("nextMaintenanceDate", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-6 col-md-3">
                                            <label className="form-label">Meses</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                value={editingMaintenance.monthsRequired ?? 0}
                                                onChange={(e) => handleEditingFieldChange("monthsRequired", Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <label className="form-label">Horas</label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                value={editingHours}
                                                onChange={(e) => setEditingHours(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <label className="form-label">Minutos</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                className="form-control"
                                                value={editingMinutes}
                                                onChange={(e) => setEditingMinutes(Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <label className="form-label">Documento</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Comentarios</label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={editingMaintenance.comments ?? ""}
                                            onChange={(e) => handleEditingFieldChange("comments", e.target.value)}
                                        />
                                    </div>

                                    {editingMaintenance.documentation && (
                                        <div className="form-check form-switch mb-3">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={documentationMarkedForDeletion}
                                                onChange={(e) => setDocumentationMarkedForDeletion(e.target.checked)}
                                                id="deleteDocumentationSwitch"
                                            />
                                            <label className="form-check-label" htmlFor="deleteDocumentationSwitch">
                                                Eliminar documentación existente
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-secondary rounded-3" onClick={resetEditState}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary rounded-3" disabled={updateLoading}>
                                        {updateLoading ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
