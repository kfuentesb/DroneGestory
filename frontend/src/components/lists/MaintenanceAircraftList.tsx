import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api";
import { useAuth } from "../commons/hooks/useAuth";
import LoadingSpinner from "../commons/Loading";
import ButtonProp from "../commons/props/ButtonProp";
import Pagination from "../commons/props/Pagination";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import SearchBar from "../commons/props/SearchBar";
import { styles } from "../../global-const/styles";
import arroBackIcon from '../../assets/commons/arrow_back_white.svg';

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
            const response = await apiFetch(`/api/maintenance/aircraft/${aircraftId}`);
            const data = response ? await response.json() : [];
            setRecords(Array.isArray(data) ? data : []);
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
    const aircraftLabel = records.length > 0 ? `${records[0].aircraftManufacturer ?? ""} ${records[0].aircraftModel ?? ""}`.trim() : `Aeronave ${aircraftId ?? ""}`;

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">
                    <button 
                        className="btn d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                        onClick={() => navigate(-1)}
                        style={styles.backBtn}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 130, 69, 0.1)")}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        title="Volver"
                    >
                        <img src={arroBackIcon} alt="Back" style={styles.backIcon} />
                        <span className="ms-2 fw-medium text-muted" style={{ fontSize: '0.9rem' }}/>
                    </button>
                    <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>Mantenimientos de {aircraftLabel}</h2>
                    <style>{`.maintenance-row td{background-color:rgba(13,110,253,.04)!important}.maintenance-row td:first-child{border-left:4px solid #0d6efd!important}.maintenance-row td:last-child{border-right:4px solid #0d6efd!important}.text-truncate-custom{max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`}</style>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <SearchBar value={search} placeholder="Buscar..." onChange={setSearch} />
                        <ButtonProp type="button" onClick={() => navigate(`/register-maintenance?aircraftId=${aircraftId}`)}>+ Registrar mantenimiento</ButtonProp>
                    </div>
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
