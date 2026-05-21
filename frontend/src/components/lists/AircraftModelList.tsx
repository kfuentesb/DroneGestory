import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import ButtonProp from "../commons/props/ButtonProp";
import { useAuth } from "../commons/hooks/useAuth";
import { InfoBadge } from "../commons/InfoBadge";

type AircraftModel = {
  id: number;
  manufacturer: string;
  model: string;
  aircraftClassDefault?: string | null;
  mtomDefault?: number | null;
  wingspanDefault?: number | null;
  maxSpeedDefault?: number | null;
  configDefault?: string | null;
  impactEnergyDefault?: number | null;
  hasCameraDefault?: boolean | null;
  privatelyBuiltDefault?: boolean | null;
  hasParachuteDefault?: boolean | null;
  hasEnsuranceDefault?: boolean | null;
  hasFTSDefault?: boolean | null;
  cautiveDefault?: string | null;
  accessoriesDefault?: string | null;
  powerSourceDefault?: string | null;
  powerSourceTypeDefault?: string | null;
};

export default function AircraftModelList() {
  const navigate = useNavigate();
  const [models, setModels] = useState<AircraftModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { roles } = useAuth();

  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch("/api/aircraft-models", {
          headers: { "Content-Type": "application/json" },
        });

        if (!res) return;
        const data = await res.json();
        setModels(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const filteredModels = useSearchFilter(models, search, (model) => [
    model.manufacturer ?? "",
    model.model ?? "",
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, models.length]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando modelos..." />;
  }

  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const headers: TableHeader[] = [
    { label: "Fabricante", key: "manufacturer", sortable: true },
    { label: "Modelo", key: "model", sortable: true },
    { label: "Default values", key: "hasDefaultValues", sortable: false },
  ];

  const hasDefaultValues = (row: AircraftModel) =>
    row.aircraftClassDefault != null ||
    row.mtomDefault != null ||
    row.wingspanDefault != null ||
    row.maxSpeedDefault != null ||
    row.configDefault != null ||
    row.impactEnergyDefault != null ||
    row.hasCameraDefault != null ||
    row.privatelyBuiltDefault != null ||
    row.hasParachuteDefault != null ||
    row.hasEnsuranceDefault != null ||
    row.hasFTSDefault != null ||
    row.cautiveDefault != null ||
    row.powerSourceDefault != null ||
    row.powerSourceTypeDefault != null ||
    (row.accessoriesDefault != null && row.accessoriesDefault.trim() !== "");

  const handleRowClick = (row: AircraftModel) => {
    navigate(`/aircraft-models/${row.id}`);
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
        <div className="card-body">

          <div className="mb-4">
            <style>{`
              .custom-hover-text {
                cursor: pointer;
                transition: all 0.2s ease-in-out;
              }
              .custom-hover-text:hover {
                color: #212529 !important;
              }
            `}</style>

            <div className="d-flex align-items-baseline flex-wrap">
              
              <h2 className="card-title fw-bold mb-0 me-3" style={{ color: "#1E1E1E", whiteSpace: "nowrap" }}>
                Plantillas registradas
              </h2>
              
              <div className="d-block d-md-none align-self-center">
                <InfoBadge text="Gestione las plantillas de aeronaves para estandarizar los datos técnicos y la documentación comunes a un mismo modelo." />
              </div>

              <div 
                className="d-none d-md-block text-truncate flex-grow-1" 
                style={{ 
                  maxWidth: "50vw",
                  minWidth: "350px"
                }}
              >
                <span 
                  className="text-muted small custom-hover-text"
                  style={{ fontSize: "0.875rem" }}
                  title="Gestione las plantillas de aeronaves para estandarizar los datos técnicos y la documentación comunes a un mismo modelo. Utilice plantillas para agilizar el registro de sus aeronaves."
                >
                  Gestione las plantillas de aeronaves para estandarizar los datos técnicos y la documentación comunes a un mismo modelo. Utilice plantillas para agilizar el registro de sus aeronaves.
                </span>
              </div>
              
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-3 mb-4">
            <SearchBar value={search} placeholder="Buscar por fabricante o modelo..." onChange={setSearch} />

            <div className="d-flex align-items-stretch gap-2">
              {(roles.includes("ADMIN") || roles.includes("MANAGER")) && (
                <ButtonProp onClick={() => navigate("/register-model", { state: { from: "/register-aircraft" } })}>
                  + Registrar nueva plantilla
                </ButtonProp>
              )}
            </div>
          </div>

          <Pagination
            totalItems={filteredModels.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />

          {/* DESKTOP VIEW: Table layout shown on medium screens and up */}
          <div className="d-none d-md-block">
            <ReusableTable
              headers={headers}
              rows={paginatedModels}
              renderRow={(row) => (
                <>
                  <td>{row.manufacturer || "-"}</td>
                  <td>{row.model || "-"}</td>
                  <td className="text-center">
                    <span className={`badge ${hasDefaultValues(row) ? "bg-success" : "bg-danger"}`}>
                      {hasDefaultValues(row) ? "Sí" : "No"}
                    </span>
                  </td>
                </>
              )}
              onRowClick={handleRowClick}
              emptyText="No hay modelos registrados."
            />
          </div>

          {/* MOBILE VIEW: Clickable card stack layout shown below medium break points */}
          <div className="d-block d-md-none">
            {paginatedModels.length === 0 ? (
              <div className="text-center text-muted py-4">
                No hay modelos registrados.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {paginatedModels.map((row, idx) => (
                  <div
                    key={row.id ?? idx}
                    className="card p-3 shadow-sm position-relative"
                    onClick={() => handleRowClick(row)}
                    style={{
                      cursor: "pointer",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      backgroundColor: "#FFFFFF",
                      transition: "transform 0.15s ease-in-out, background-color 0.15s ease-in-out"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="text-muted small fw-medium mb-1">
                          {row.manufacturer || "Fabricante desconocido"}
                        </div>
                        <h5 className="mb-0 fw-bold" style={{ color: "#111827", fontSize: "1.1rem" }}>
                          {row.model || "-"}
                        </h5>
                      </div>
                      
                      <div className="text-end">
                        <div className="text-muted small mb-1" style={{ fontSize: "0.75rem" }}>
                          Valores por defecto
                        </div>
                        <span className={`badge ${hasDefaultValues(row) ? "bg-success" : "bg-danger"}`}>
                          {hasDefaultValues(row) ? "Sí" : "No"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Tiny right arrow to imply clickability visually */}
                    <div className="d-flex justify-content-end mt-2 pt-2 border-top" style={{ borderColor: "#F3F4F6 !important" }}>
                      <span className="text-primary small d-flex align-items-center gap-1" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                        Ver detalles
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Pagination
            totalItems={filteredModels.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}