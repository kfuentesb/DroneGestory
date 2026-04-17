import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";

type MaintenanceRecord = {
    id: number;
    aircraftId: number;
    aircraftClass?: string | null;
    aircraftManufacturer?: string | null;
    aircraftModel?: string | null;
    aircraftSerialNumber?: string | null;
    aircraftFlightMinutes?: number | null;
    reviewType?: string | null;
    monthsRequired?: number | null;
    hoursFlightRequired?: number | null;
    maintenanceDate?: string | null;
    comments?: string | null;
};

export default function MaintenanceAircraftList() {
    const { aircraftId } = useParams<{ aircraftId: string }>();
    const navigate = useNavigate();
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const loadRecords = async () => {
            if (!aircraftId) {
                setError("Aeronave no seleccionada.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await apiFetch(`/api/maintenance/aircraft/${aircraftId}`);
                if (!response) {
                    throw new Error("No se pudo cargar los registros de mantenimiento.");
                }
                const data = await response.json();
                setRecords(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error cargando mantenimientos de aeronave", err);
                setError("No se pudieron cargar los mantenimientos. Intente de nuevo.");
            } finally {
                setIsLoading(false);
            }
        };

        loadRecords();
    }, [aircraftId]);

    const aircraftLabel = records.length > 0
        ? `${records[0].aircraftManufacturer ?? ""} ${records[0].aircraftModel ?? ""}`.trim()
        : "Aeronave";

    const filteredRecords = useSearchFilter(records, search, (record) => [
        record.reviewType ?? "",
        record.comments ?? "",
        record.aircraftSerialNumber ?? "",
        record.aircraftManufacturer ?? "",
        record.aircraftModel ?? "",
    ]);

    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const headers: TableHeader[] = [
        { label: "Fecha", key: "maintenanceDate", sortable: true },
        { label: "Revisión", key: "reviewType", sortable: true },
        { label: "Meses requeridos", key: "monthsRequired", sortable: true },
        { label: "Horas requeridas", key: "hoursFlightRequired", sortable: true },
        { label: "Comentarios", key: "comments", sortable: false },
    ];

    if (isLoading) {
        return <LoadingSpinner message="Cargando mantenimientos..." />;
    }

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">
                    <button
                        type="button"
                        className="btn btn-link p-0 mb-3 d-flex align-items-center text-decoration-none text-muted"
                        onClick={() => navigate("/maintenance")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                        <span className="ms-2 fw-medium">Volver</span>
                    </button>

                    <h2 className="card-title mb-1" style={{ color: "#1E1E1E" }}>
                        Mantenimientos de {aircraftLabel}
                    </h2>
                    <p className="text-muted mb-4">
                        {records.length} registro{records.length === 1 ? "" : "s"} de mantenimiento encontrado{records.length === 1 ? "" : "s"}.
                    </p>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-column flex-md-row">
                        <SearchBar value={search} placeholder="Buscar mantenimiento..." onChange={setSearch} />
                        <ButtonProp
                            type="button"
                            className="btn btn-primary"
                            onClick={() => navigate(`/register-maintenance?aircraftId=${aircraftId}`)}
                        >
                            + Registrar mantenimiento
                        </ButtonProp>
                    </div>

                    <ReusableTable
                        headers={headers}
                        rows={paginatedRecords}
                        renderRow={(record: MaintenanceRecord) => (
                            <>
                                <td>{record.maintenanceDate ? new Date(record.maintenanceDate).toLocaleDateString() : "N/A"}</td>
                                <td>{record.reviewType || "N/A"}</td>
                                <td>{record.monthsRequired ?? "N/A"}</td>
                                <td>{record.hoursFlightRequired ?? "N/A"}</td>
                                <td>{record.comments || "-"}</td>
                            </>
                        )}
                        emptyText={records.length === 0 ? "No hay datos de mantenimiento para esta aeronave." : "No hay resultados para la búsqueda."}
                    />

                    <Pagination
                        totalItems={filteredRecords.length}
                        currentPage={currentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}
