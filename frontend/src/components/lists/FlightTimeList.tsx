import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import { ReusableTable, type  TableHeader } from "../commons/props/ReusableTable";

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
        alert("No se pudo abrir el documento. Intenta de nuevo más tarde.");
    }
};

export default function FlightTimeList() {
    const navigate = useNavigate();
    const { aircraftId } = useParams<{ aircraftId: string }>();
    const [flightTimes, setFlightTimes] = useState<FlightTimeDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
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

                console.log("Datos recibidos de la tabla:", parsedData);
                console.table(parsedData);

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
        flight.aircraftSerialNumber ?? ""
    ]);

    const paginatedFlights = filteredFlights.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const headers: TableHeader[] = [
        { label: "Fabricante", key: "aircraftManufacturer", sortable: true },
        { label: "Modelo", key: "aircraftModel", sortable: true },
        { label: "Nº Serie", key: "aircraftSerialNumber", sortable: true },
        { label: "Ref. Operación", key: "operationReference", sortable: true },
        { label: "Fecha vuelo", key: "flightDate", sortable: true },
        { label: "Duración", key: "durationMinutes", sortable: true },
        { label: "Total acumulado", key: "totalFlightTimeMinutes", sortable: true },
        { label: "Documentación", key: "documentation", sortable: false },
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
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
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
                    `}</style>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <SearchBar value={search} placeholder="Buscar..." onChange={setSearch} />
                        {aircraftId ? (
                            <ButtonProp onClick={() => navigate(`/flight-times/${aircraftId}/register`)}>
                                + Añadir horas
                            </ButtonProp>
                        ) : (
                            <ButtonProp onClick={() => {}} disabled>
                                + Añadir horas
                            </ButtonProp>
                        )}
                    </div>

                    <ReusableTable
                        headers={headers}
                        rows={paginatedFlights}
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
                                    {row.documentation?.documentationName || row.documentation?.filePath ? (
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => openDocumentationInNewTab(row.documentation as FlightTimeDocumentation)}
                                        >
                                            Ver documento
                                        </button>
                                    ) : (
                                        "No"
                                    )}
                                </td>
                            </>
                        )}
                        rowClassName={(row) => {
                            if (row.durationMinutes > 0) return "flight-time-positive-row";
                            if (row.durationMinutes < 0) return "flight-time-negative-row";
                            return "";
                        }}
                        emptyText={aircraftId ? "No hay registros de horas de vuelo para esta aeronave." : "No hay registros de horas de vuelo."}
                    />

                    <Pagination
                        totalItems={filteredFlights.length}
                        currentPage={currentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}