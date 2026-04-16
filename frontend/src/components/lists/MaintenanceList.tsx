import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import { ReusableTable, type  TableHeader } from "../commons/props/ReusableTable";

type Maintenance = {
    id: number;
    aircraftType: string;
    aicraftModel: string;
    aicraftSerialNumber: string;
    aircraftManufacturedYear: string | Date;
}

export default function MaintenanceList() {
    const navigate = useNavigate();
    const [maintenance, setMaintenance] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchMaintenance = async () => {
            try {
                const data = await apiFetch("/maintenance");

                if (data && Array.isArray(data)) {
                    setMaintenance(data);
                } else {
                    setMaintenance([]);
                }
            } catch (error) {
                console.error("Error cargando mantenimiento", error);
                
                // MOCK DATA: Representando la estructura de TrackingFlightTime
                setMaintenance([
                    {
                        id: 1,
                        aircraftType: "Multirotor",
                        aicraftModel: "Model X",
                        aicraftSerialNumber: "SN-001",
                        aircraftManufacturedYear: "2020",
                    },
                    {
                        id: 2,
                        aircraftType: "Fixed-wing",
                        aicraftModel: "Model Y",
                        aicraftSerialNumber: "SN-002",
                        aircraftManufacturedYear: "2019",
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMaintenance();
    }, []);

    if (isLoading) {
        return <LoadingSpinner message="Cargando mantenimiento..." />;
    }

    const filteredMaintenance = useSearchFilter(maintenance, search, (maintenance) => [
        maintenance.aircraftType ?? "",
        maintenance.aicraftModel ?? "",
        maintenance.aicraftSerialNumber ?? "",
        maintenance.aircraftManufacturedYear?.toString() ?? "",
    ]);

    const paginatedMaintenance = filteredMaintenance.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const headers: TableHeader[] = [
        { label: "Tipo de aeronave", key: "aircraftType", sortable: true },
        { label: "Modelo", key: "aicraftModel", sortable: true },
        { label: "Número de serie", key: "aicraftSerialNumber", sortable: true },
        { label: "Año de fabricación", key: "aircraftManufacturedYear", sortable: true },
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
                        <ButtonProp onClick={() => navigate("/register-maintenance")}>+ Añadir mantenimiento</ButtonProp>
                    </div>

                    <ReusableTable
                        headers={headers}
                        rows={paginatedMaintenance}
                        renderRow={(row: Maintenance) => (
                            <>
                                <td>{row.aircraftType || "N/A"}</td>
                                <td>{row.aicraftModel}</td>
                                <td >{row.aicraftSerialNumber || "N/A"}</td>
                                <td>{new Date(row.aircraftManufacturedYear).toLocaleDateString()}</td>
                            </>
                        )}
                        onRowClick={(row) => navigate(`/flight-times/${row.id}`)}
                        emptyText="No hay registros de mantenimiento para esta aeronave."
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