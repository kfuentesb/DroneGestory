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
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">
                    <div className="position-relative d-flex align-items-center justify-content-center mb-2 pb-3 w-100">
                        <button 
                            className="btn d-flex align-items-center justify-content-center flex-shrink-0 position-absolute start-0" 
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
                        
                        <h2 className="mb-0 fw-bold text-center" style={{ color: "#1E1E1E", paddingLeft: "60px", paddingRight: "60px"}}>
                            Mantenimientos de {aircraftLabel}
                        </h2>
                    
                    </div>
                    <style>{`
                    .maintenance-row td{background-color:rgba(13,110,253,.04)!important}.maintenance-row 
                    td:first-child{border-left:4px solid #0d6efd!important}
                    .maintenance-row td:last-child{border-right:4px solid #0d6efd!important}
                    .text-truncate-custom{max-width:220px;white-space:nowrap;overflow:hidden;
                    text-overflow:ellipsis}`}</style>
                    {error && <div className="alert alert-danger">{error}</div>}

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
                    <div className="d-none d-md-block">
                        <ReusableTable
                            headers={headers}
                            rows={paginatedRecords}
                            onRowClick={(row: MaintenanceRecord) => setSelectedMaintenance(row)}
                            rowClassName={() => "cursor-pointer maintenance-row"}
                            renderRow={(row: MaintenanceRecord) => (
                                <>
                                    <td>{formatDate(row.maintenanceDate)}</td>
                                    <td>{formatDate(row.nextMaintenanceDate)}</td>
                                    <td>{row.reviewType || "N/A"}</td>
                                    <td>{row.monthsRequired ?? "N/A"}</td>
                                    <td>{formatMinutes(row.hoursFlightRequired)}</td>
                                    <td><div className="text-truncate-custom" title={row.comments ?? ""}>{row.comments?.trim() ? row.comments : "N/A"}</div></td>
                                    <td className="fw-medium">{row.documentation?.documentationName || row.documentation?.filePath ? <span className="text-success">Si</span> : <span className="text-muted">No</span>}</td>
                                    {isAdmin && <td><div className="d-flex gap-1"><button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); handleEditStart(row); }}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button><button className="btn btn-sm btn-outline-danger" onClick={(e) => handleDelete(e, row.id)}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button></div></td>}
                                </>
                            )}
                            emptyText="No hay datos de mantenimiento para esta aeronave."
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

                    <Pagination totalItems={filteredRecords.length} currentPage={currentPage} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />

                    {editingMaintenance && (
                        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <form className="modal-content border-0 shadow-lg" onSubmit={handleUpdate}>
                                    <div className="modal-header bg-dark text-white">
                                        <h5 className="modal-title fw-bold">Modificar mantenimiento</h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={resetEditState}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        {updateError && <div className="alert alert-danger py-2 small">{updateError}</div>}
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label small fw-bold text-muted">TIPO DE REVISION</label>
                                                <input type="text" className="form-control" value={editingMaintenance.reviewType || ""} onChange={(e) => setEditingMaintenance({ ...editingMaintenance, reviewType: e.target.value })} required />
                                            </div>
                                            <div className="col-6 mb-3">
                                                <label className="form-label small fw-bold text-muted">FECHA DE MANTENIMIENTO</label>
                                                <input type="date" className="form-control" value={toInputDateValue(editingMaintenance.maintenanceDate)} onChange={(e) => setEditingMaintenance({ ...editingMaintenance, maintenanceDate: e.target.value })} required />
                                            </div>
                                            <div className="col-6 mb-3">
                                                <label className="form-label small fw-bold text-muted">PROXIMO MANTENIMIENTO</label>
                                                <input type="date" className="form-control" value={toInputDateValue(editingMaintenance.nextMaintenanceDate)} onChange={(e) => setEditingMaintenance({ ...editingMaintenance, nextMaintenanceDate: e.target.value })} />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label small fw-bold text-muted">MESES REQUERIDOS</label>
                                                <input type="number" className="form-control" value={editingMaintenance.monthsRequired ?? 0} min={0} onChange={(e) => setEditingMaintenance({ ...editingMaintenance, monthsRequired: Number(e.target.value) })} required />
                                            </div>
                                            <div className="col-6 mb-3">
                                                <label className="form-label small fw-bold text-muted">HORAS DE VUELO</label>
                                                <input type="number" className="form-control" value={editingHours} min={0} onChange={(e) => setEditingHours(Number(e.target.value))} required />
                                            </div>
                                            <div className="col-6 mb-3">
                                                <label className="form-label small fw-bold text-muted">MINUTOS</label>
                                                <input type="number" className="form-control" value={editingMinutes} min={0} max={59} onChange={(e) => setEditingMinutes(Math.max(0, Math.min(59, Number(e.target.value))))} required />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label small fw-bold text-muted">COMENTARIOS</label>
                                                <textarea className="form-control" rows={3} value={editingMaintenance.comments || ""} onChange={(e) => setEditingMaintenance({ ...editingMaintenance, comments: e.target.value })} />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small fw-bold text-muted">DOCUMENTACION ADJUNTA</label>
                                                {editingMaintenance.documentation?.documentationName && (
                                                    <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded border mb-2">
                                                        <span className="small text-truncate">{editingMaintenance.documentation.documentationName}</span>
                                                        <button
                                                            type="button"
                                                            className="btn border-0 d-flex align-items-center justify-content-center"
                                                            style={{ width: "32px", height: "32px", backgroundColor: "#dc3545", color: "#ffffff", borderRadius: "6px", padding: 0, flexShrink: 0 }}
                                                            onClick={() => {
                                                                setEditingMaintenance({ ...editingMaintenance, documentation: null });
                                                                setSelectedFile(null);
                                                                setDocumentationMarkedForDeletion(true);
                                                            }}
                                                        >
                                                            <span style={{ fontSize: "20px", lineHeight: 1, fontWeight: 700 }}>X</span>
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="input-group">
                                                    <input type="file" className="form-control" onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); if (e.target.files?.[0]) setDocumentationMarkedForDeletion(false); }} />
                                                </div>
                                                {documentationMarkedForDeletion && !selectedFile && <small className="text-danger d-block mt-2">La documentacion actual se eliminara al guardar.</small>}
                                                {selectedFile && <small className="text-muted d-block mt-2">Se subira: {selectedFile.name}</small>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer bg-light border-0">
                                        <button type="button" className="btn btn-outline-secondary" onClick={resetEditState}>Cancelar</button>
                                        <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={updateLoading}>{updateLoading ? "Guardando..." : "Guardar"}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {selectedMaintenance && (
                        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content border-0">
                                    <div className="modal-header text-white bg-primary">
                                        <h5 className="modal-title">Detalle del mantenimiento</h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedMaintenance(null)}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Aeronave</label>
                                                <span className="fw-bold">{selectedMaintenance.aircraftManufacturer} {selectedMaintenance.aircraftModel}</span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">N Serie</label>
                                                <span className="fw-bold">{selectedMaintenance.aircraftSerialNumber}</span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Fecha mantenimiento</label>
                                                <span>{formatDate(selectedMaintenance.maintenanceDate)}</span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Proximo mantenimiento</label>
                                                <span>{formatDate(selectedMaintenance.nextMaintenanceDate)}</span>
                                            </div>
                                            <hr />
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Tipo de revision</label>
                                                <span className="fw-bold">{selectedMaintenance.reviewType || "N/A"}</span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Meses requeridos</label>
                                                <span className="fw-bold">{selectedMaintenance.monthsRequired ?? "N/A"}</span>
                                            </div>
                                            <div className="col-12">
                                                <label className="text-muted small d-block">Horas de vuelo</label>
                                                <span className="fw-bold">{formatMinutes(selectedMaintenance.hoursFlightRequired)}</span>
                                            </div>
                                            <div className="col-12">
                                                <label className="text-muted small d-block">Comentarios</label>
                                                <p className="bg-light p-2 rounded small" style={{ minHeight: "60px" }}>{selectedMaintenance.comments || "Sin comentarios."}</p>
                                            </div>
                                            <div className="col-12 border-top pt-3 mt-2">
                                                <label className="text-muted small d-block mb-2">Documentacion adjunta</label>
                                                {selectedMaintenance.documentation?.documentationName || selectedMaintenance.documentation?.filePath ? (
                                                    <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded border">
                                                        <span className="small text-truncate me-2">{selectedMaintenance.documentation?.documentationName || "Archivo adjunto"}</span>
                                                        <button className="btn btn-primary btn-sm" onClick={() => openDocumentationInNewTab(selectedMaintenance.documentation as MaintenanceDocumentation)}>Ver documento</button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small italic">No hay documentos cargados.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedMaintenance(null)}>Cerrar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
