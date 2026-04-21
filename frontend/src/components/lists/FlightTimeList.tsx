import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";

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
    const { aircraftId } = useParams<{ aircraftId: string }>();
    const [flightTimes, setFlightTimes] = useState<FlightTimeDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedFlight, setSelectedFlight] = useState<FlightTimeDetail | null>(null);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchFlights = async () => {
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
        };
        fetchFlights();
    }, [aircraftId]);

    if (isLoading) {
        return <LoadingSpinner message="Cargando horas de vuelo..." />;
    }

    const filteredFlights = useSearchFilter(flightTimes, search, (flight) => [
        flight.operationReference ?? "",
        flight.flightDate?.toString() ?? "",
        flight.aircraftSerialNumber ?? "",
        flight.comments ?? "",
    ]);

    const paginatedFlights = filteredFlights.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const headers: TableHeader[] = [
        { label: "Fabricante", key: "aircraftManufacturer", sortable: true },
        { label: "Modelo", key: "aircraftModel", sortable: true },
        { label: "N Serie", key: "aircraftSerialNumber", sortable: true },
        { label: "Ref. Operacion", key: "operationReference", sortable: true },
        { label: "Fecha vuelo", key: "flightDate", sortable: true },
        { label: "Duracion", key: "durationMinutes", sortable: true },
        { label: "Total acumulado", key: "totalFlightTimeMinutes", sortable: true },
        { label: "Comentarios", key: "comments", sortable: false },
        { label: "Documentacion", key: "documentation", sortable: false },
    ];

    const heading = aircraftId ? `Horas de vuelo de la aeronave ${aircraftId}` : "Registro de Horas de Vuelo";

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
                        {aircraftId ? (
                            <ButtonProp onClick={() => navigate(`/flight-times/${aircraftId}/register`)}>
                                + Anadir horas
                            </ButtonProp>
                        ) : (
                            <ButtonProp onClick={() => {}} disabled>
                                + Anadir horas
                            </ButtonProp>
                        )}
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
