import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";

type MaintenanceSummary = {
    aircraftId: number;
    manufacturer?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    maintenanceCount: number;
    lastMaintenanceDate?: string | null;
    fechaFab?: string | null;
    config?: string | null;
};

type AircraftItem = {
    id: number;
    manufacturer?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    fechaFab?: string | null;
    config?: string | null;
};

type MaintenanceRecord = {
    aircraftId: number;
    maintenanceDate?: string | null;
};

export default function MaintenanceList() {
    const navigate = useNavigate();
    const [maintenanceSummaries, setMaintenanceSummaries] = useState<MaintenanceSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aircraftResponse, maintenanceResponse] = await Promise.all([
                    apiFetch("/api/aircraft"),
                    apiFetch("/api/maintenance"),
                ]);

                if (!aircraftResponse || !maintenanceResponse) {
                    throw new Error("No se pudieron cargar los datos.");
                }

                const [aircraftData, maintenanceData] = await Promise.all([
                    aircraftResponse.json(),
                    maintenanceResponse.json(),
                ]);

                const aircraftItems: AircraftItem[] = Array.isArray(aircraftData) ? aircraftData : [];
                const maintenanceItems: MaintenanceRecord[] = Array.isArray(maintenanceData) ? maintenanceData : [];

                const maintenanceMap = new Map<number, { count: number; lastMaintenanceDate?: string | null }>();

                maintenanceItems.forEach((item) => {
                    const aircraftId = Number(item.aircraftId);
                    if (!aircraftId) return;

                    const mDate = item.maintenanceDate ? String(item.maintenanceDate) : null;
                    const existing = maintenanceMap.get(aircraftId);

                    if (!existing) {
                        maintenanceMap.set(aircraftId, {
                            count: 1,
                            lastMaintenanceDate: mDate,
                        });
                    } else {
                        existing.count += 1;
                        if (mDate) {
                            if (!existing.lastMaintenanceDate || new Date(mDate) > new Date(existing.lastMaintenanceDate)) {
                                existing.lastMaintenanceDate = mDate;
                            }
                        }
                    }
                });

                const summaries = aircraftItems.map((aircraft) => ({
                    aircraftId: Number(aircraft.id),
                    manufacturer: aircraft.manufacturer,
                    model: aircraft.model,
                    serialNumber: aircraft.serialNumber,
                    fechaFab: aircraft.fechaFab,
                    config: aircraft.config,
                    maintenanceCount: maintenanceMap.get(Number(aircraft.id))?.count ?? 0,
                    lastMaintenanceDate: maintenanceMap.get(Number(aircraft.id))?.lastMaintenanceDate ?? null,
                }));

                summaries.sort((a, b) => {
                    const dateA = a.lastMaintenanceDate ? new Date(a.lastMaintenanceDate).getTime() : 0;
                    const dateB = b.lastMaintenanceDate ? new Date(b.lastMaintenanceDate).getTime() : 0;
                    return dateB - dateA;
                });

                setMaintenanceSummaries(summaries);
            } catch (error) {
                console.error("Error cargando mantenimiento", error);
                setMaintenanceSummaries([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatMonthYear = (value?: string | null) => {
        if (!value) return "-";
        const [year, month] = value.split("-");
        return year && month ? `${month}/${year}` : value;
    };

    const filteredMaintenance = useSearchFilter(maintenanceSummaries, search, (summary) => [
        summary.manufacturer ?? "",
        summary.model ?? "",
        summary.serialNumber ?? "",
        summary.config ?? "",
        summary.maintenanceCount.toString()
    ]);

    const paginatedMaintenance = filteredMaintenance.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const headers: TableHeader[] = [
        { label: "Fabricante", key: "manufacturer", sortable: true },
        { label: "Modelo", key: "model", sortable: true },
        { label: "Configuración", key: "config", sortable: true },
        { label: "Nº serie", key: "serialNumber", sortable: true },
        { label: "Fecha Fabric.", key: "fechaFab", sortable: true },
        { label: "Mantenimientos", key: "maintenanceCount", sortable: true },
        { label: "Último mantenimiento", key: "lastMaintenanceDate", sortable: true },
    ];

    if (isLoading) return <LoadingSpinner message="Cargando mantenimiento..." />;

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">
                    <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
                        Mantenimiento de Aeronaves
                    </h2>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <SearchBar value={search} placeholder="Buscar por modelo, serie o configuración..." onChange={setSearch} />
                    </div>

                    <Pagination
                        totalItems={filteredMaintenance.length}
                        currentPage={currentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />

                    {/* VISTA DE ESCRITORIO (Muestra Tabla Reutilizable) */}
                    <div className="d-none d-md-block">
                        <ReusableTable
                            headers={headers}
                            rows={paginatedMaintenance}
                            renderRow={(row: MaintenanceSummary) => (
                                <>
                                    <td>{row.manufacturer || "N/A"}</td>
                                    <td>{row.model || "N/A"}</td>
                                    <td>{row.config || "N/A"}</td>
                                    <td>{row.serialNumber || "N/A"}</td>
                                    <td>{formatMonthYear(row.fechaFab)}</td>
                                    <td className="text-center">{row.maintenanceCount}</td>
                                    <td>{row.lastMaintenanceDate ? new Date(row.lastMaintenanceDate).toLocaleDateString() : "N/A"}</td>
                                </>
                            )}
                            onRowClick={(row: MaintenanceSummary) => navigate(`/maintenance/aircraft/${row.aircraftId}`)}
                            emptyText="No hay aeronaves registradas."
                        />
                    </div>

                    {/* VISTA MÓVIL (Muestra Tarjetas Modernas Ajustadas) */}
                    <div className="d-block d-md-none">
                        {paginatedMaintenance.length === 0 ? (
                            <div className="text-center text-muted py-5" style={{ fontSize: "0.9rem" }}>
                                No hay aeronaves registradas.
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {paginatedMaintenance.map((row) => (
                                    <div
                                        key={row.aircraftId}
                                        className="card p-3 border"
                                        onClick={() => navigate(`/maintenance/aircraft/${row.aircraftId}`)}
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
                                        {/* Bloque Superior: Modelo y Fabricante */}
                                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                            <div className="text-truncate">
                                                <span className="text-muted text-uppercase fw-bold tracking-wider d-block" style={{ fontSize: "0.68rem" }}>
                                                    {row.manufacturer || "N/A"}
                                                </span>
                                                <h5 className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: "1.05rem", marginTop: "-2px" }}>
                                                    {row.model || "N/A"}
                                                </h5>
                                            </div>
                                            <span className="badge bg-dark fw-semibold px-2 py-1 flex-shrink-0" style={{ fontSize: "0.7rem", borderRadius: "4px" }}>
                                                {row.config || "N/A"}
                                            </span>
                                        </div>

                                        {/* Nº de Serie */}
                                        <div className="text-muted mb-3" style={{ fontSize: "0.75rem" }}>
                                            S/N: <span className="text-dark fw-mono">{row.serialNumber || "-"}</span>
                                        </div>

                                        {/* Grid de especificaciones de Mantenimiento */}
                                        <div className="row g-2 text-muted mb-3" style={{ fontSize: "0.78rem" }}>
                                            <div className="col-4">
                                                <div className="p-2 h-100" style={{ backgroundColor: "#F9FAFB", borderRadius: "6px", border: "1px solid #F3F4F6" }}>
                                                    <span className="d-block text-muted mb-0.5" style={{ fontSize: "0.65rem" }}>MANTENIMIENTOS</span>
                                                    <strong className="text-dark d-block text-truncate text-center" style={{ fontSize: "0.9rem" }}>{row.maintenanceCount}</strong>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="p-2 h-100" style={{ backgroundColor: "#F9FAFB", borderRadius: "6px", border: "1px solid #F3F4F6" }}>
                                                    <span className="d-block text-muted mb-0.5" style={{ fontSize: "0.65rem" }}>ÚLTIMO MANT.</span>
                                                    <strong className="text-dark d-block text-truncate pt-2" style={{ fontSize: "0.72rem"}}>
                                                        {row.lastMaintenanceDate ? new Date(row.lastMaintenanceDate).toLocaleDateString() : "N/A"}
                                                    </strong>
                                                </div>
                                            </div>
                                            <div className="col-4">
                                                <div className="p-2 h-100" style={{ backgroundColor: "#F9FAFB", borderRadius: "6px", border: "1px solid #F3F4F6" }}>
                                                    <span className="d-block text-muted mb-0.5" style={{ fontSize: "0.65rem" }}>FECHA FAB.</span>
                                                    <strong className="text-dark d-block text-truncate pt-2" style={{ fontSize: "0.75rem"}}>{formatMonthYear(row.fechaFab)}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enlace inferior con Icono Corregido en el Eje Y */}
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
                        totalItems={filteredMaintenance.length}
                        currentPage={currentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}