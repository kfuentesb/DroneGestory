import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import Pagination from "../commons/props/Pagination";

import LoadingSpinner from "../commons/Loading";

type AircraftFlightHours = {
    id: number;
    manufacturer: string;
    model: string;
    serialNumber?: string;
    lastFlightDate?: string | Date;
    totalMinutes?: number;
};

const formatTotalHours = (minutes?: number | null) => {
    if (minutes == null || Number.isNaN(minutes)) {
        return "0.0h";
    }
    return `${(minutes / 60).toFixed(1)}h`;
};

export default function FlightTimeList() {
    const [aircraftsFlightHours, setAircraftsFlightHours] = useState<AircraftFlightHours[]>([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAircraftsFlightHours = async () => {
            setIsLoading(true);
            try {
                const [aircraftResult, flightTimeResult] = await Promise.allSettled([
                    apiFetch("/api/aircraft"),
                    apiFetch("/api/flight-hours")
                ]);

                const aircraftRes =
                    aircraftResult.status === "fulfilled" ? aircraftResult.value : null;
                const flightTimeRes =
                    flightTimeResult.status === "fulfilled" ? flightTimeResult.value : null;

                const aircraftData = aircraftRes ? await aircraftRes.json() : [];
                const flightTimes = flightTimeRes ? await flightTimeRes.json() : [];

                const latestFlightForAircraft = new Map<number, { lastFlightDate: string; totalMinutes?: number }>();

                if (Array.isArray(flightTimes)) {
                    flightTimes.forEach((flight: any) => {
                        const aircraftId = Number(flight.aircraftId ?? flight.aircraft_id ?? flight.aircraft?.id);
                        if (!aircraftId) return;

                        const currentLastFlightDate = flight.flightDate ? new Date(flight.flightDate) : null;
                        if (!currentLastFlightDate || Number.isNaN(currentLastFlightDate.getTime())) return;

                        const existing = latestFlightForAircraft.get(aircraftId);
                        if (!existing || currentLastFlightDate > new Date(existing.lastFlightDate)) {
                            latestFlightForAircraft.set(aircraftId, {
                                lastFlightDate: currentLastFlightDate.toISOString(),
                                totalMinutes: flight.totalFlightTimeMinutes ?? flight.durationMinutes
                            });
                        }
                    });
                }

                const normalizedAircrafts = Array.isArray(aircraftData) ? aircraftData.map((aircraft: any) => {
                    const id = Number(aircraft.id ?? aircraft.aircraftId);
                    const summary = latestFlightForAircraft.get(id);
                    return {
                        id,
                        manufacturer: aircraft.manufacturer ?? "",
                        model: aircraft.model ?? "",
                        serialNumber: aircraft.serialNumber,
                        lastFlightDate: summary?.lastFlightDate,
                        totalMinutes: summary?.totalMinutes ?? aircraft.flightMinutes ?? 0
                    };
                }) : [];

                setAircraftsFlightHours(normalizedAircrafts);
            } catch (err) {
                console.error(err);
                setAircraftsFlightHours([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadAircraftsFlightHours();
    }, []);

    const filteredAircraftsFlightHours = useSearchFilter(aircraftsFlightHours, search, (a) => [
        a.manufacturer ?? "",
        a.model ?? "",
        a.serialNumber ?? "",
        a.lastFlightDate ? new Date(a.lastFlightDate).toLocaleDateString() : "",
        a.totalMinutes ?? "",
    ]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, aircraftsFlightHours.length]);

    if (isLoading) {
        return <LoadingSpinner message="Cargando horas de vuelo de aeronaves..." />;
    }

    const paginatedAircraftsFlightHours = filteredAircraftsFlightHours.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const modelHeaders: TableHeader[] = [
        { label: "Fabricante", key: "manufacturer", sortable: true },
        { label: "Modelo", key: "model", sortable: true },
        { label: "Nº Serie", key: "serialNumber", sortable: true },
        { label: "Última fecha de vuelo", key: "lastFlightDate", sortable: true },
        { label: "Horas de vuelo totales", key: "totalMinutes", sortable: true },
    ];

    return (
        <div className="container py-4">
            <div
                className="card shadow-sm"
                style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
            >
                <div className="card-body">
                    <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
                        Horas de Vuelo de Aeronaves
                    </h2>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <SearchBar value={search} onChange={setSearch} />
                    </div>

                    <Pagination
                        totalItems={filteredAircraftsFlightHours.length}
                        currentPage={currentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />

                    {/* VISTA DE ESCRITORIO (Muestra la tabla estándar) */}
                    <div className="d-none d-md-block">
                        <ReusableTable
                            headers={modelHeaders}
                            rows={paginatedAircraftsFlightHours}
                            renderRow={(a) => (
                                <>
                                    <td>{a.manufacturer || "N/A"}</td>
                                    <td>{a.model || "N/A"}</td>
                                    <td>{a.serialNumber ?? "-"}</td>
                                    <td>{a.lastFlightDate ? new Date(a.lastFlightDate).toLocaleDateString() : "N/A"}</td>
                                    <td>{formatTotalHours(a.totalMinutes)}</td>
                                </>
                            )}
                            onRowClick={(a) => navigate(`/flight-hours/${a.id}`)}
                            emptyText="No hay horas de vuelvo de aeronaves registradas."
                        />
                    </div>

                    {/* VISTA MÓVIL (Muestra las tarjetas adaptadas) */}
                    <div className="d-block d-md-none">
                        {paginatedAircraftsFlightHours.length === 0 ? (
                            <div className="text-center text-muted py-5" style={{ fontSize: "0.9rem" }}>
                                No hay horas de vuelvo de aeronaves registradas.
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {paginatedAircraftsFlightHours.map((row) => (
                                    <div
                                        key={row.id}
                                        className="card p-3 border"
                                        onClick={() => navigate(`/flight-hours/${row.id}`)}
                                        style={{
                                            cursor: "pointer",
                                            borderRadius: "12px",
                                            backgroundColor: "#FFFFFF",
                                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                                            borderColor: "#E5E7EB",
                                            transition: "transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#FAFAFA";
                                            e.currentTarget.style.transform = "translateY(-1px)";
                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.06)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "#FFFFFF";
                                            e.currentTarget.style.transform = "none";
                                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                                        }}
                                    >
                                        {/* Bloque Identificador */}
                                        <div className="mb-2">
                                            <span className="text-muted text-uppercase fw-bold tracking-wider d-block" style={{ fontSize: "0.68rem" }}>
                                                {row.manufacturer || "N/A"}
                                            </span>
                                            <h5 className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: "1.05rem", marginTop: "-2px" }}>
                                                {row.model || "N/A"}
                                            </h5>
                                        </div>

                                        {/* Número de Serie */}
                                        <div className="text-muted mb-3" style={{ fontSize: "0.75rem" }}>
                                            S/N: <span className="text-dark fw-mono">{row.serialNumber || "-"}</span>
                                        </div>

                                        {/* Grid de Horas y Último Vuelo */}
                                        <div className="row g-2 text-muted mb-3" style={{ fontSize: "0.78rem" }}>
                                            <div className="col-6">
                                                <div className="p-2 h-100" style={{ backgroundColor: "#F9FAFB", borderRadius: "6px", border: "1px solid #F3F4F6" }}>
                                                    <span className="d-block text-muted mb-0.5" style={{ fontSize: "0.65rem" }}>HORAS TOTALES</span>
                                                    <strong className="text-primary d-block text-truncate" style={{ fontSize: "0.95rem" }}>
                                                        {formatTotalHours(row.totalMinutes)}
                                                    </strong>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-2 h-100" style={{ backgroundColor: "#F9FAFB", borderRadius: "6px", border: "1px solid #F3F4F6" }}>
                                                    <span className="d-block text-muted mb-0.5" style={{ fontSize: "0.65rem" }}>ÚLTIMO VUELO</span>
                                                    <strong className="text-dark d-block text-truncate" style={{ fontSize: "0.75rem", paddingTop: "2px" }}>
                                                        {row.lastFlightDate ? new Date(row.lastFlightDate).toLocaleDateString() : "N/A"}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botón inferior con Flecha alineada en el eje Y */}
                                        <div className="d-flex justify-content-end pt-2 border-top" style={{ borderColor: "#F3F4F6" }}>
                                            <span className="text-primary small d-flex align-items-center" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                                                Ver detalles
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    className="ms-1" 
                                                    height="16px" 
                                                    viewBox="0 -960 960 960" 
                                                    width="16px" 
                                                    fill="currentColor"
                                                >
                                                    <path d="M560-120 160-520l400-400 71 71-329 329 329 329-71 71Z" transform="rotate(180 480 -480)"/>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Pagination
                        totalItems={filteredAircraftsFlightHours.length}
                        currentPage={currentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}