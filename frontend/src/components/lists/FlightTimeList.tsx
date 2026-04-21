import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useAuth } from "../commons/hooks/useAuth";

type FlightTimeDocumentation = {
    id: number;
    flightTimeId?: number | null;
    documentationType?: string | null;
    documentationName?: string | null;
    filePath?: string | null;
};

type FlightTimeDetail = {
    id: number;
    aircraftId?: number;
    aircraftManufacturer?: string | null;
    aircraftModel?: string | null;
    aircraftSerialNumber?: string | null;
    operationId?: number | null;
    operationReference?: string | null;
    flightDate: string | Date;
    durationMinutes: number;
    totalFlightTimeMinutes: number;
    flightHours?: number | null;
    totalFlightHours?: number | null;
    comments?: string | null;
    documentation?: FlightTimeDocumentation | null;
};

const formatMinutes = (minutes: number | null | undefined) => {
    if (minutes == null || Number.isNaN(minutes)) {
        return "-";
    }
    const hours = Math.floor(minutes / 60);
    const remainderMinutes = minutes % 60;
    return `${hours}h ${remainderMinutes.toString().padStart(2, "0")}m`;
};

const formatDate = (value: string | Date) => {
    const date = typeof value === "string" ? new Date(value) : value;
    if (!date || Number.isNaN(date.getTime())) {
        return "N/A";
    }
    return date.toLocaleDateString();
};

const toInputDateValue = (value: string | Date) => {
    if (typeof value === "string") {
        return value.includes("T") ? value.split("T")[0] : value;
    }
    if (Number.isNaN(value.getTime())) {
        return "";
    }
    return value.toISOString().split("T")[0];
};

const openDocumentationInNewTab = async (documentation: FlightTimeDocumentation) => {
    const path = documentation.documentationName || documentation.filePath;
    if (!path) {
        return;
    }

    const encodedPath = path
        .split("/")
        .map(encodeURIComponent)
        .join("/");

    try {
        const response = await apiFetch(`/api/flight-time-documentation/files/${encodedPath}`);
        if (!response) {
            throw new Error("No se obtuvo respuesta del servidor");
        }
        const blob = await response.blob();
        const isPdfByExtension = path.toLowerCase().endsWith(".pdf");
        const fileBlob =
            isPdfByExtension && (!blob.type || blob.type === "application/octet-stream")
                ? new Blob([blob], { type: "application/pdf" })
                : blob;
        const objectUrl = URL.createObjectURL(fileBlob);
        window.open(objectUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (error) {
        console.error("No se pudo cargar el documento", error);
        alert("No se pudo abrir el documento. Intenta de nuevo mas tarde.");
    }
};


export default function FlightTimeList() {
    const navigate = useNavigate();
    const { role } = useAuth();
    const isAdmin = role === "ADMIN";
    const { aircraftId } = useParams<{ aircraftId: string }>();
    const [flightTimes, setFlightTimes] = useState<FlightTimeDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedFlight, setSelectedFlight] = useState<FlightTimeDetail | null>(null);
    const [editingFlight, setEditingFlight] = useState<FlightTimeDetail | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentationMarkedForDeletion, setDocumentationMarkedForDeletion] = useState(false);

    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const ITEMS_PER_PAGE = 10;

    const fetchFlights = useCallback(async () => {
        setIsLoading(true);
        try {
            const endpoint = aircraftId ? `/api/flight-times/aircraft/${aircraftId}` : "/api/flight-times";
            const response = await apiFetch(endpoint);
            const data = response ? await response.json() : [];
            const parsedData = Array.isArray(data) ? data : [];
            setFlightTimes(parsedData);
        } catch (error) {
            console.error("Error cargando tracking de horas", error);
            setFlightTimes([]);
        } finally {
            setIsLoading(false);
        }
    }, [aircraftId]);

    useEffect(() => {
        fetchFlights();
    }, [fetchFlights]);

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (window.confirm("¿Estás seguro de que deseas eliminar este registro de vuelo?")) {
            try {
                const response = await apiFetch(`/api/flight-times/${id}`, { method: "DELETE" });
                if (response?.ok) {
                    fetchFlights();
                }
            } catch (error) {
                console.error("Error al eliminar", error);
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateError(null);
        setUpdateSuccess(false);
        if (!editingFlight) return;

        if (
            editingFlight.durationMinutes == null ||
            Number.isNaN(editingFlight.durationMinutes) ||
            editingFlight.durationMinutes === 0
        ) {
            setUpdateError("La duracion debe ser un numero valido distinto de 0.");
            return;
        }

        setUpdateLoading(true);
        try {
            const response = await apiFetch(`/api/flight-times/${editingFlight.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    aircraftId: editingFlight.aircraftId,
                    operationId: editingFlight.operationId ?? null,
                    flightDate:
                        typeof editingFlight.flightDate === "string"
                            ? editingFlight.flightDate
                            : editingFlight.flightDate.toISOString().split("T")[0],
                    durationMinutes: editingFlight.durationMinutes,
                    comments: editingFlight.comments?.trim() || null,
                }),
            });

            if (!response) {
                throw new Error("Sin respuesta del servidor");
            }

            if (selectedFile) {
                const formData = new FormData();
                formData.append("documentationLabel", "Documentacion de horas de vuelo");
                formData.append("dateIndefinite", "true");
                formData.append("file", selectedFile);

                await apiFetch(`/api/flight-time-documentation/flight-time/${editingFlight.id}/upload`, {
                    method: "POST",
                    body: formData,
                });
            } else if (documentationMarkedForDeletion) {
                await apiFetch(`/api/flight-time-documentation/flight-time/${editingFlight.id}`, {
                    method: "DELETE",
                });
            }

            setEditingFlight(null);
            setSelectedFile(null);
            setDocumentationMarkedForDeletion(false);
            setUpdateSuccess(true);
            await fetchFlights();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Desconocido";
            setUpdateError("Error al actualizar: " + message);
            console.error("Error al actualizar", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const resetEditState = () => {
        setEditingFlight(null);
        setSelectedFile(null);
        setDocumentationMarkedForDeletion(false);
        setUpdateError(null);
        setUpdateSuccess(false);
        setUpdateLoading(false);
    };

    const handleEditStart = (flight: FlightTimeDetail) => {
        setEditingFlight(flight);
        setSelectedFile(null);
        setDocumentationMarkedForDeletion(false);
        setUpdateError(null);
        setUpdateSuccess(false);
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando horas de vuelo..." />;
    }

    const filteredFlights = useSearchFilter(flightTimes, search, (f) => [
        f.operationReference ?? "",
        f.aircraftSerialNumber ?? "",
    ]);

    const paginatedFlights = filteredFlights.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const headers: TableHeader[] = [
        { label: "Fabricante", key: "aircraftManufacturer", sortable: true },
        { label: "Modelo", key: "aircraftModel", sortable: true },
        { label: "N Serie", key: "aircraftSerialNumber", sortable: true },
        { label: "Ref. Operación", key: "operationReference", sortable: true },
        { label: "Fecha vuelo", key: "flightDate", sortable: true },
        { label: "Duración", key: "durationMinutes", sortable: true },
        { label: "Total horas", key: "totalFlightTimeMinutes", sortable: true },
        { label: "Comentarios", key: "comments", sortable: false },
        { label: "Documentación", key: "documentation", sortable: false },
    ];

    if (isAdmin) {
        headers.push({ label: "Acciones", key: "actions", sortable: false });
    }

    const aircraftSerial = aircraftId && flightTimes.length > 0 
        ? flightTimes[0].aircraftSerialNumber 
        : null;

    const heading = aircraftId 
        ? `Horas de vuelo de la aeronave: ${aircraftSerial || aircraftId}` 
        : "Registro de Horas de Vuelo";

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">
                    <button
                        type="button"
                        className="btn btn-link p-0 mb-3 d-flex align-items-center text-decoration-none text-muted"
                        onClick={() => navigate("/flight-times")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                        <span className="ms-2 fw-medium">Volver</span>
                    </button>

                    <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
                        {heading}
                    </h2>

                    <style>{`
                        .flight-time-positive-row td {
                            background-color: rgba(25, 135, 84, 0.05) !important;
                        }
                        .flight-time-negative-row td {
                            background-color: rgba(220, 53, 69, 0.05) !important;
                        }
                        .flight-time-positive-row td:first-child {
                            border-left: 4px solid #198754 !important;
                        }
                        .flight-time-positive-row td:last-child {
                            border-right: 4px solid #198754 !important;
                        }
                        .flight-time-negative-row td:first-child {
                            border-left: 4px solid #dc3545 !important;
                        }
                        .flight-time-negative-row td:last-child {
                            border-right: 4px solid #dc3545 !important;
                        }
                        .text-truncate-custom {
                            max-width: 200px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        @media (min-width: 992px) {
                            .text-truncate-custom {
                                max-width: 200px;
                            }
                        }
                    `}</style>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <SearchBar value={search} placeholder="Buscar..." onChange={setSearch} />
                        <ButtonProp onClick={() => navigate(`/flight-times/${aircraftId}/register`)}>
                            + Añadir horas
                        </ButtonProp>
                    </div>

                    <ReusableTable
                        headers={headers}
                        rows={paginatedFlights}
                        onRowClick={(row: FlightTimeDetail) => setSelectedFlight(row)}
                        rowClassName={(row) => {
                            const base = "cursor-pointer ";
                            if (row.durationMinutes > 0) return base + "flight-time-positive-row";
                            if (row.durationMinutes < 0) return base + "flight-time-negative-row";
                            return base;
                        }}
                        renderRow={(row: FlightTimeDetail) => (
                            <>
                                <td>{row.aircraftManufacturer ?? "N/A"}</td>
                                <td>{row.aircraftModel ?? "N/A"}</td>
                                <td>{row.aircraftSerialNumber ?? "N/A"}</td>
                                <td>{row.operationReference ?? "N/A"}</td>
                                <td>{formatDate(row.flightDate)}</td>
                                <td>{formatMinutes(row.durationMinutes)}</td>
                                <td>{formatMinutes(row.totalFlightTimeMinutes)}</td>
                                <td>
                                    <div className="text-truncate-custom" title={row.comments ?? ""}>
                                        {row.comments?.trim() ? row.comments : "N/A"}
                                    </div>
                                </td>
                                <td className="fw-medium">
                                    {row.documentation?.documentationName || row.documentation?.filePath ? (
                                        <span className="text-success">Sí</span>
                                    ) : (
                                        <span className="text-muted">No</span>
                                    )}
                                </td>
                                {isAdmin && (
                                    <td>
                                        <div className="d-flex gap-1">
                                            <button 
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={(e) => { e.stopPropagation(); handleEditStart(row); }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={(e) => handleDelete(e, row.id)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </>
                        )}
                        emptyText={aircraftId ? "No hay registros de horas de vuelo para esta aeronave." : "No hay registros de horas de vuelo."}
                    />

                    <Pagination
                        totalItems={filteredFlights.length}
                        currentPage={currentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />

                    {editingFlight && (
                        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <form className="modal-content border-0 shadow-lg" onSubmit={handleUpdate}>
                                    <div className="modal-header bg-dark text-white">
                                        <h5 className="modal-title fw-bold">Modificar Registro</h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={resetEditState}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        {/* Error or success feedback */}
                                        {updateError && (
                                            <div className="alert alert-danger py-2 small" role="alert">{updateError}</div>
                                        )}
                                        {updateSuccess && (
                                            <div className="alert alert-success py-2 small" role="alert">Guardado correctamente.</div>
                                        )}
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label small fw-bold text-muted">FECHA DE VUELO</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={toInputDateValue(editingFlight.flightDate)}
                                                    onChange={(e) => setEditingFlight({ ...editingFlight, flightDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label small fw-bold text-muted">DURACIÓN (MINUTOS)</label>
                                                <input type="number" className="form-control" value={editingFlight.durationMinutes} onChange={(e) => setEditingFlight({...editingFlight, durationMinutes: parseInt(e.target.value)})} required />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label small fw-bold text-muted">COMENTARIOS</label>
                                                <textarea className="form-control" rows={3} value={editingFlight.comments || ""} onChange={(e) => setEditingFlight({...editingFlight, comments: e.target.value})} />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small fw-bold text-muted">DOCUMENTACIÓN ADJUNTA</label>
                                                {editingFlight.documentation?.documentationName ? (
                                                    <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded border mb-2">
                                                        <span className="small text-truncate">{editingFlight.documentation.documentationName}</span>
                                                        <button
                                                            type="button"
                                                            className="btn border-0 d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: "32px",
                                                                height: "32px",
                                                                backgroundColor: "#dc3545",
                                                                color: "#ffffff",
                                                                borderRadius: "6px",
                                                                padding: 0,
                                                                flexShrink: 0,
                                                            }}
                                                            onClick={() => {
                                                                setEditingFlight({ ...editingFlight, documentation: null });
                                                                setSelectedFile(null);
                                                                setDocumentationMarkedForDeletion(true);
                                                            }}
                                                            aria-label="Eliminar documentacion"
                                                        >
                                                            <span style={{ fontSize: "20px", lineHeight: 1, fontWeight: 700 }}>X</span>
                                                        </button>
                                                    </div>
                                                ) : null}
                                                <div className="input-group">
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        onChange={(e) => {
                                                            setSelectedFile(e.target.files?.[0] || null);
                                                            if (e.target.files?.[0]) {
                                                                setDocumentationMarkedForDeletion(false);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                {documentationMarkedForDeletion && !selectedFile && (
                                                    <small className="text-danger d-block mt-2">
                                                        La documentacion actual se eliminara al guardar.
                                                    </small>
                                                )}
                                                {selectedFile && (
                                                    <small className="text-muted d-block mt-2">
                                                        Se subira: {selectedFile.name}
                                                    </small>
                                                )}
                                                {!selectedFile && !editingFlight.documentation && !documentationMarkedForDeletion && (
                                                    <small className="text-muted d-block mt-2">
                                                        Puedes adjuntar un archivo opcional.
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer bg-light border-0">
                                        <button type="button" className="btn btn-outline-secondary" onClick={resetEditState}>Cancelar</button>
                                        <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={updateLoading}>
                                            {updateLoading ? "Guardando..." : "Guardar"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* POPUP / MODAL */}
                    {selectedFlight && (
                        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content border-0">
                                    <div className={`modal-header text-white ${selectedFlight.durationMinutes >= 0 ? "bg-success" : "bg-danger"}`}>
                                        <h5 className="modal-title">Detalle del Registro</h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedFlight(null)}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Aeronave</label>
                                                <span className="fw-bold">{selectedFlight.aircraftManufacturer} {selectedFlight.aircraftModel}</span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Nº Serie</label>
                                                <span className="fw-bold">{selectedFlight.aircraftSerialNumber}</span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Fecha</label>
                                                <span>{formatDate(selectedFlight.flightDate)}</span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Referencia</label>
                                                <span>{selectedFlight.operationReference || "N/A"}</span>
                                            </div>
                                            <hr />
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Duración sesión</label>
                                                <span className={`fw-bold ${selectedFlight.durationMinutes >= 0 ? "text-success" : "text-danger"}`}>
                                                    {formatMinutes(selectedFlight.durationMinutes)}
                                                </span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Total Acumulado</label>
                                                <span className="fw-bold">{formatMinutes(selectedFlight.totalFlightTimeMinutes)}</span>
                                            </div>
                                            <div className="col-12">
                                                <label className="text-muted small d-block">Comentarios</label>
                                                <p className="bg-light p-2 rounded small" style={{ minHeight: "60px" }}>
                                                    {selectedFlight.comments || "Sin comentarios."}
                                                </p>
                                            </div>
                                            
                                            {/* DOCUMENTACIÓN DENTRO DEL MODAL */}
                                            <div className="col-12 border-top pt-3 mt-2">
                                                <label className="text-muted small d-block mb-2">Documentación adjunta</label>
                                                {selectedFlight.documentation?.documentationName || selectedFlight.documentation?.filePath ? (
                                                    <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded border">
                                                        <span className="small text-truncate me-2">
                                                            {selectedFlight.documentation?.documentationName || "Archivo adjunto"}
                                                        </span>
                                                        <button 
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => openDocumentationInNewTab(selectedFlight.documentation as FlightTimeDocumentation)}
                                                        >
                                                            Ver Documento
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small italic">No hay documentos cargados.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedFlight(null)}>Cerrar</button>
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
