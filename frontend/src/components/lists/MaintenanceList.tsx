import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import { ReusableTable, type  TableHeader } from "../commons/props/ReusableTable";

type MaintenanceSummary = {
    aircraftId: number;
    manufacturer?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    maintenanceCount: number;
    lastMaintenanceDate?: string | null;
};

type AircraftItem = {
    id: number;
    manufacturer?: string | null;
    model?: string | null;
    serialNumber?: string | null;
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
                    throw new Error("No se pudieron cargar los datos de mantenimiento.");
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
                    if (!aircraftId) {
                        return;
                    }

                    const maintenanceDate = item.maintenanceDate ? String(item.maintenanceDate) : null;
                    const existing = maintenanceMap.get(aircraftId);

                    if (!existing) {
                        maintenanceMap.set(aircraftId, {
                            count: 1,
                            lastMaintenanceDate: maintenanceDate,
                        });
                    } else {
                        existing.count += 1;
                        if (maintenanceDate) {
                            if (!existing.lastMaintenanceDate || new Date(maintenanceDate) > new Date(existing.lastMaintenanceDate)) {
                                existing.lastMaintenanceDate = maintenanceDate;
                            }
                        }
                    }
                });

                const summaries = aircraftItems.map((aircraft) => {
                    const aircraftId = Number(aircraft.id);
                    const maintenanceData = maintenanceMap.get(aircraftId);

                    return {
                        aircraftId,
                        manufacturer: aircraft.manufacturer,
                        model: aircraft.model,
                        serialNumber: aircraft.serialNumber,
                        maintenanceCount: maintenanceData?.count ?? 0,
                        lastMaintenanceDate: maintenanceData?.lastMaintenanceDate ?? null,
                    };
                });

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

    if (isLoading) {
        return <LoadingSpinner message="Cargando mantenimiento..." />;
    }

    const filteredMaintenance = useSearchFilter(maintenanceSummaries, search, (summary) => [
        summary.manufacturer ?? "",
        summary.model ?? "",
        summary.serialNumber ?? "",
        summary.maintenanceCount.toString(),
        summary.lastMaintenanceDate ? new Date(summary.lastMaintenanceDate).toLocaleDateString() : "",
    ]);

    const paginatedMaintenance = filteredMaintenance.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const headers: TableHeader[] = [
        { label: "Fabricante", key: "manufacturer", sortable: true },
        { label: "Modelo", key: "model", sortable: true },
        { label: "Nº serie", key: "serialNumber", sortable: true },
        { label: "Mantenimientos", key: "maintenanceCount", sortable: true },
        { label: "Último mantenimiento", key: "lastMaintenanceDate", sortable: true },
    ];

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">

                    <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
                        Mantenimiento de aeronaves
                    </h2>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <SearchBar value={search} placeholder="Buscar..." onChange={setSearch} />
                    </div>

                    <ReusableTable
                        headers={headers}
                        rows={paginatedMaintenance}
                        renderRow={(row: MaintenanceSummary) => (
                            <>
                                <td>{row.manufacturer || "N/A"}</td>
                                <td>{row.model || "N/A"}</td>
                                <td>{row.serialNumber || "N/A"}</td>
                                <td>{row.maintenanceCount}</td>
                                <td>{row.lastMaintenanceDate ? new Date(row.lastMaintenanceDate).toLocaleDateString() : "N/A"}</td>
                            </>
                        )}
                        onRowClick={(row: MaintenanceSummary) => navigate(`/maintenance/aircraft/${row.aircraftId}`)}
                        emptyText="No hay aeronaves registradas."
                    />

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