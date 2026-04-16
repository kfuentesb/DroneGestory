import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import { ReusableTable, type  TableHeader } from "../commons/props/ReusableTable";

type TrackingFlightTime = {
    id: number;
    operationReference?: string | null;
    flightDate: string | Date;
    flightHours: number;
    totalFlightHours: number;
    documentationFlight?: string | null;
}

export default function FlightTimeList() {
    const navigate = useNavigate();
    const [flightTimes, setFlightTimes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchFlights = async () => {
            try {
                const data = await apiFetch("/flight-times");

                if (data && Array.isArray(data)) {
                    setFlightTimes(data);
                } else {
                    setFlightTimes([]);
                }
            } catch (error) {
                console.error("Error cargando tracking de horas", error);
                
                // MOCK DATA: Representando la estructura de TrackingFlightTime
                setFlightTimes([
                    {
                        id: 1,
                        operationReference: "-",
                        flightDate: "2026-04-10",
                        flightHours: 2.00,      // 2h 00min
                        totalFlightHours: 150.50, // Horas totales de la aeronave en ese momento
                        documentationFlight: "doc_001.pdf"
                    },
                    {
                        id: 2,
                        operationReference: "CO22_01",
                        flightDate: "2026-04-12",
                        flightHours: 0.75,      // 45min
                        totalFlightHours: 151.25, // Incremento reflejado
                        documentationFlight: null
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFlights();
    }, []);

    if (isLoading) {
        return <LoadingSpinner message="Cargando horas de vuelo..." />;
    }

    const filteredFlights = useSearchFilter(flightTimes, search, (flight) => [
        flight.operationReference ?? "",
        flight.flightDate?.toString() ?? "",
    ]);

    const paginatedFlights = filteredFlights.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const headers: TableHeader[] = [
        { label: "Ref. Vuelo", key: "operationReference", sortable: true },
        { label: "Fecha vuelo", key: "flightDate", sortable: true },
        { label: "Horas vuelo", key: "flightHours", sortable: true },
        { label: "Horas totales", key: "totalFlightHours", sortable: true },
        { label: "Documentación", key: "documentationFlight", sortable: false },
    ];

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">

                    <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
                        Registro de Horas de Vuelo
                    </h2>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <SearchBar value={search} placeholder="Buscar..." onChange={setSearch} />
                        <ButtonProp onClick={() => navigate("/register-flight")}>+ Añadir horas</ButtonProp>
                    </div>

                    <ReusableTable
                        headers={headers}
                        rows={paginatedFlights}
                        renderRow={(row: TrackingFlightTime) => (
                            <>
                                <td>{row.operationReference || "N/A"}</td>
                                <td>{new Date(row.flightDate).toLocaleDateString()}</td>
                                {/* Mostramos los valores directamente del DTO/Entidad */}
                                <td className="fw-bold">{row.flightHours.toFixed(2)} h</td>
                                <td className="text-success fw-bold">{row.totalFlightHours.toFixed(2)} h</td>
                                <td>
                                    {row.documentationFlight ? (
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="text-success fw-medium">
                                                <i className="bi bi-check-circle-fill"></i> Disponible
                                            </span>
                                            <button 
                                                className="btn btn-sm btn-outline-secondary ms-2"
                                                title="Ver documento"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Evita navegar al detalle de la fila
                                                    window.open(`${import.meta.env.REACT_APP_API_URL}/uploads/${row.documentationFlight}`, '_blank');
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="text-muted small">No adjunta</span>
                                            <button 
                                                className="btn btn-sm btn-success d-flex align-items-center"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // ¡Crucial!
                                                    // Aquí abrirías tu modal de subida o navegarías al form
                                                    navigate(`/flight-times/${row.id}/upload`);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                                                </svg>
                                                Subir
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </>
                        )}
                        onRowClick={(row) => navigate(`/flight-times/${row.id}`)}
                        emptyText="No hay registros de tracking para esta aeronave."
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