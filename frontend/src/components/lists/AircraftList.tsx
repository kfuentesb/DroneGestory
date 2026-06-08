import { useEffect, useState } from "react";
import { apiFetch, API_BASE_URL } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import Pagination from "../commons/props/Pagination";
import { useAuth } from "../commons/hooks/useAuth";
import Select from "react-select";
import DefaultDroneImage from '../../../public/default-drone.png';

import LoadingSpinner from "../commons/Loading";
import { InfoBadge } from "../commons/InfoBadge";

type Aircraft = {
  id: number;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  aircraftClass: "No" | "C0" | "C1" | "C2" | "C3" | "C4" | "Legacy";
  mtom?: number;
  wingspan?: number;
  maxSpeed?: number;
  config: "Avion" | "Multirrotor" | "Helicoptero" | "Hibrido" | "Ligero" | "Otro";
  impactEnergy?: number;
  fechaFab?: string;
  hasCamera: boolean;
  powerSource: "Electric" | "Non_Electric";
  powerSourceType?: "Hydrogen" | "Gasoline";
  imagePath?: string | null;
  observations?: string | null;
};

export default function AircraftList() {
  const formatMonthYear = (value?: string | null) => {
    if (!value) return "-";
    const [year, month] = value.split("-");
    return year && month ? `${month}/${year}` : value;
  };

  const { roles } = useAuth();
  const navigate = useNavigate();

  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Cargar lista principal de aeronaves
  useEffect(() => {
    const loadAircrafts = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/aircraft`, {
          headers: { "Content-Type": "application/json" }
        });

        if (!res) return;

        const data = await res.json();
        setAircrafts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAircrafts();
  }, []);

  // Cargar opciones del Select dinámicamente cuando se abre el Pop-up
  useEffect(() => {
    if (!isModalOpen) return;
    const loadModels = async () => {
      setModalError(null);
      try {
        const res = await apiFetch("/api/aircraft-models", {
          headers: { "Content-Type": "application/json" },
        });
        if (!res) return;
        const models = await res.json();
        const uniqueMap = new Map();

        models.forEach((modelItem: any) => {
          const manufacturer = (modelItem.manufacturer ?? "").trim();
          const model = (modelItem.model ?? "").trim();
          if (!manufacturer || !model) return;

          const key = `${manufacturer.toLowerCase()}::${model.toLowerCase()}`;
          if (!uniqueMap.has(key) && modelItem.id != null) {
            uniqueMap.set(key, {
              id: modelItem.id,
              value: key,
              label: `${manufacturer} - ${model}`,
              manufacturer,
              model,
              imagePath: modelItem.imagePath,
              aircraftClassDefault: modelItem.aircraftClassDefault,
              mtomDefault: modelItem.mtomDefault,
              wingspanDefault: modelItem.wingspanDefault,
              maxSpeedDefault: modelItem.maxSpeedDefault,
              configDefault: modelItem.configDefault,
              impactEnergyDefault: modelItem.impactEnergyDefault,
              hasCameraDefault: modelItem.hasCameraDefault,
              privatelyBuiltDefault: modelItem.privatelyBuiltDefault,
              hasParachuteDefault: modelItem.hasParachuteDefault,
              hasEnsuranceDefault: modelItem.hasEnsuranceDefault,
              hasFTSDefault: modelItem.hasFTSDefault,
              powerSourceDefault: modelItem.powerSourceDefault,
              powerSourceTypeDefault: modelItem.powerSourceTypeDefault,
              cautiveDefault: modelItem.cautiveDefault,
              accessoriesDefault: modelItem.accessoriesDefault,
              observationsDefault: modelItem.observationsDefault,
            });
          }
        });
        setModelOptions(Array.from(uniqueMap.values()).sort((a, b) => a.label.localeCompare(b.label)));
      } catch (err) {
        setModalError("No se pudieron cargar los modelos de aeronave.");
      }
    };
    loadModels();
  }, [isModalOpen]);

  const handleContinueExisting = async () => {
    if (!selectedOption) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const res = await apiFetch(`/api/aircraft-models/${selectedOption.id}/documentation`, {
        headers: { "Content-Type": "application/json" },
      });
      const modelDocs = res ? await res.json() : [];
      
      setIsModalOpen(false);

      navigate("/register-aircraft", {
        state: {
          flowMode: "existing",
          selectedModelData: selectedOption,
          selectedDocumentation: modelDocs
        }
      });

    } catch (err) {
      setModalError("Error al cargar la documentación del modelo.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOption(null);
    setModalError(null);
  };

  // Filtrado que incluye todas las propiedades menos las observaciones
  const filteredAircrafts = useSearchFilter(aircrafts, search, (a) => [
    a.manufacturer ?? "",
    a.model ?? "",
    a.serialNumber ?? "",
    a.aircraftClass ?? "",
    a.mtom ? String(a.mtom) : "",
    a.wingspan ? String(a.wingspan) : "",
    a.maxSpeed ? String(a.maxSpeed) : "",
    a.config ?? "",
    a.impactEnergy ? String(a.impactEnergy) : "",
    formatMonthYear(a.fechaFab),
    a.powerSource ?? "",
    a.powerSourceType ?? "",
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, aircrafts.length]);

  const handleRequestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedFilteredAircrafts = (() => {
    if (!sortConfig) return filteredAircrafts;
    const items = [...filteredAircrafts];
    items.sort((a: any, b: any) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? -1 : 1;
      if (bValue == null) return sortConfig.direction === "asc" ? 1 : -1;
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return items;
  })();

  const paginatedAircrafts = sortedFilteredAircrafts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getImageUrl = (path?: string | null) => {
    if (!path) return DefaultDroneImage;

    const cleanedPath = path.trim().replace(/\\/g, "/");
    if (/^https?:\/\//.test(cleanedPath) || cleanedPath.startsWith("//")) {
      return cleanedPath;
    }

    const marker = "/api/aircraft/images/";
    const markerNoLeadingSlash = "api/aircraft/images/";
    let relativePath = cleanedPath;

    if (cleanedPath.includes(marker)) {
      relativePath = cleanedPath.substring(cleanedPath.indexOf(marker) + marker.length);
    } else if (cleanedPath.includes(markerNoLeadingSlash)) {
      relativePath = cleanedPath.substring(cleanedPath.indexOf(markerNoLeadingSlash) + markerNoLeadingSlash.length);
    }

    relativePath = relativePath.replace(/^\/+/, "");
    const encodedPath = relativePath
      .split("/")
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    return `${API_BASE_URL}/api/aircraft/images/${encodedPath}`;
  };

  const modelHeaders: TableHeader[] = [
    { label: "Imagen", key: "image", sortable: false },
    { label: "Fabricante", key: "manufacturer", sortable: true },
    { label: "Modelo", key: "model", sortable: true },
    { label: "Nº Serie", key: "serialNumber", sortable: true },
    { label: "Clase", key: "aircraftClass", sortable: true },
    { label: "MTOM", key: "mtom", sortable: true },
    { label: "Dimensión", key: "wingspan", sortable: true },
    { label: "Configuración", key: "config", sortable: true },
    { label: "Fabricación", key: "fechaFab", sortable: true },
    { label: "Observaciones", key: "observations", sortable: false },
  ];

  const handleRowClick = (a: Aircraft) => {
    navigate(`/aircrafts/${a.id}`);
  };

  const customText = roles.includes("ADMIN") || roles.includes("MANAGER") 
    ? "Registre y modifique" 
    : "Vea";

  // Función reutilizable para campos de texto largos de la tabla
  const renderTruncatedCell = (value: string | number | null | undefined, maxChars = 10) => {
    const str = value?.toString() || "";
    if (!str) return "-";
    if (str.length <= maxChars) return str;

    return (
      <div className="d-flex align-items-center justify-content-between" style={{ gap: "0px" }}>
        <span 
          className="text-truncate d-inline-block flex-grow-1" 
          style={{ maxWidth: `${maxChars * 8}px`, paddingRight: "0px" }} 
          title={str}
        >
          {str}
        </span>
        <div 
          className="info-badge-container" 
          style={{ zIndex: 10, display: "inline-flex", marginLeft: "0px" }} 
          onClick={(e) => e.stopPropagation()}
        >
          <InfoBadge text={str} />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando aeronaves..." />;
  }

  return (
    <div className="container py-4">
      <div
        className="card shadow-sm"
        style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
      >
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
                Aeronaves registradas
              </h2>
              
              <div className="d-block d-md-none align-self-center">
                <InfoBadge text={`${customText} aeronaves a partir de plantillas existentes y personalice sus datos individuales.`} />
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
                  title={`${customText} aeronaves a partir de plantillas existentes y personalice sus datos individuales.`}
                >
                  {customText} aeronaves a partir de plantillas existentes y personalice sus datos individuales.
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-3 mb-4">
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar aeronaves..." />

            <div className="d-flex align-items-stretch gap-2">
              {(roles.includes("ADMIN") || roles.includes("MANAGER")) && (
                <ButtonProp onClick={() => setIsModalOpen(true)}>
                  + Registrar nueva aeronave
                </ButtonProp>
              )}
            </div>
          </div>

          <Pagination
            totalItems={filteredAircrafts.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />

          {/* DESKTOP VIEW: Standard Table layout */}
          <div className="d-none d-md-block">
            <div 
              className="table-responsive" 
              style={{ 
                overflowX: "auto", 
                width: "100%",
                display: "block",
                marginRight: "auto",
                marginLeft: "0" /* Pulls layout tightly to the left side */
              }}
            >
              <div style={{ display: "inline-block", verticalAlign: "top", maxWidth: "100%" }}>
                <style>{`
                  /* Target the table directly to drop loose percentage sizing */
                  .table-responsive table {
                    width: auto !important; /* Forces the table to shrink-wrap its exact data width */
                    max-width: 100% !important;
                    table-layout: auto !important;
                    margin-bottom: 0 !important;
                  }
                  
                  /* Make sure table headers/cells do not stretch unnecessarily */
                  .table-responsive table th,
                  .table-responsive table td {
                    white-space: nowrap; /* Prevents text elements from breaking awkwardly */
                  }

                  /* Enforce tight constraints for the final observations column */
                  .table-responsive table td:last-child, 
                  .table-responsive table th:last-child {
                    width: 100px !important;
                    min-width: 100px !important;
                    max-width: 100px !important;
                  }
                  
                  .info-badge-container .info-tooltip-text {
                    visibility: hidden;
                    opacity: 0;
                    transition: opacity 0.15s ease-in-out;
                  }
                  .info-badge-container:hover .info-tooltip-text {
                    visibility: visible;
                    opacity: 1;
                  }
                `}</style>

                <ReusableTable
                  headers={modelHeaders}
                  rows={paginatedAircrafts}
                  sortConfig={sortConfig}
                  onRequestSort={handleRequestSort}
                  renderRow={(a) => (
                    <>
                      <td style={{ verticalAlign: "middle" }}>
                        <img
                          src={getImageUrl(a.imagePath)}
                          alt={`${a.manufacturer} ${a.model}`}
                          style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                          onError={(e) => {
                            e.currentTarget.src = DefaultDroneImage;
                          }}
                        />
                      </td>
                      <td style={{ verticalAlign: "middle" }}>{a.manufacturer}</td>
                      <td style={{ verticalAlign: "middle" }}>{renderTruncatedCell(a.model, 10)}</td>
                      <td style={{ verticalAlign: "middle" }}>{renderTruncatedCell(a.serialNumber, 10)}</td>
                      <td style={{ verticalAlign: "middle" }}>{a.aircraftClass}</td>
                      
                      <td style={{ verticalAlign: "middle" }}>
                        {a.mtom ?? "-"} <b> Kg</b>
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        {a.wingspan ?? "-"} <b>m</b>
                      </td>
                      
                      <td style={{ verticalAlign: "middle" }}>{a.config}</td>
                      <td style={{ verticalAlign: "middle" }}>{formatMonthYear(a.fechaFab)}</td>
                      
                      {/* Rigged absolute constraints on observations */}
                      <td 
                        className="text-muted small" 
                        style={{ 
                          width: "100px",
                          maxWidth: "100px", 
                          position: "relative", 
                          verticalAlign: "middle",
                          overflow: "hidden"
                        }}
                      >
                        {renderTruncatedCell(a.observations, 10)}
                      </td>
                    </>
                  )}
                  onRowClick={handleRowClick}
                  emptyText="No hay aeronaves registradas."
                />
              </div>
            </div>
          </div>

          {/* MOBILE VIEW: Clickable Mobile Cards layout */}
          <div className="d-block d-md-none">
            {paginatedAircrafts.length === 0 ? (
              <div className="text-center text-muted py-5" style={{ fontSize: "0.9rem" }}>
                No hay aeronaves registradas.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {paginatedAircrafts.map((a, idx) => (
                  <div
                    key={a.id ?? idx}
                    className="card p-3 shadow-sm border-0"
                    onClick={() => handleRowClick(a)}
                    style={{
                      cursor: "pointer",
                      borderRadius: "12px",
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                      border: "1px solid #E5E7EB",
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
                    <div className="d-flex gap-3 align-items-start mb-3">
                      <img
                        src={getImageUrl(a.imagePath)}
                        alt={`${a.manufacturer} ${a.model}`}
                        style={{
                          width: "75px",
                          height: "75px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #F3F4F6",
                          backgroundColor: "#F9FAFB"
                        }}
                        onError={(e) => {
                          e.currentTarget.src = DefaultDroneImage;
                        }}
                      />

                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div className="text-truncate">
                            <span className="text-muted text-uppercase fw-bold tracking-wider" style={{ fontSize: "0.7rem" }}>
                              {a.manufacturer || "N/A"}
                            </span>
                            <h5 className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: "1.05rem", marginTop: "-2px" }}>
                              {a.model || "N/A"}
                            </h5>
                          </div>
                          
                          <div className="text-end flex-shrink-0">
                            <span className="badge bg-dark fw-semibold px-2 py-1" style={{ fontSize: "0.7rem", borderRadius: "4px" }}>
                              {a.aircraftClass}
                            </span>
                            <div className="text-muted small mt-1 fw-medium" style={{ fontSize: "0.7rem" }}>
                              {a.config}
                            </div>
                          </div>
                        </div>

                        <div className="text-muted mt-2" style={{ fontSize: "0.75rem" }}>
                          S/N: <span className="text-dark fw-mono">{a.serialNumber ?? "-"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="row g-2 text-muted mb-3" style={{ fontSize: "0.78rem" }}>
                      {[
                        { label: "MTOM", value: `${a.mtom ?? "-"} Kg` },
                        { label: "Dimensión", value: `${a.wingspan ?? "-"} m` },
                        { label: "Fabricación", value: formatMonthYear(a.fechaFab) }
                      ].map((stat, i) => (
                        <div className="col-4" key={i}>
                          <div className="p-2" style={{ backgroundColor: "#F9FAFB", borderRadius: "6px", border: "1px solid #F3F4F6" }}>
                            <span className="d-block text-muted mb-0.5" style={{ fontSize: "0.68rem" }}>{stat.label}</span>
                            <strong className="text-dark d-block text-truncate">{stat.value}</strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    {a.observations && (
                      <div className="mb-3 p-2 bg-light rounded" style={{ border: "1px dashed #E5E7EB" }}>
                        <span className="d-block text-muted fw-medium mb-1" style={{ fontSize: "0.68rem" }}>Observaciones:</span>
                        <p className="text-dark mb-0 small lh-sm text-clamp-2" style={{ fontSize: "0.75rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {a.observations}
                        </p>
                      </div>
                    )}

                    <div className="d-flex justify-content-end pt-2 border-top" style={{ borderColor: "#F3F4F6" }}>
                      <span className="text-primary small d-flex align-items-center gap-1" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                        Ver detalles
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16" style={{ transition: "transform 0.15s ease" }}>
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
            totalItems={filteredAircrafts.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Pop-up / Modal */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={handleCloseModal}></div>
          <div className="modal fade show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "500px" }}>
              <div className="modal-content" style={{ borderRadius: "12px", border: "none" }}>
                <div className="modal-header border-0 pb-0">
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                
                <div className="modal-body px-4 pb-4 pt-2">
                  <h4 className="fw-bold mb-3 text-center" style={{ color: "#1E1E1E" }}>Registrar aeronave</h4>

                  {modalError && <div className="alert alert-danger py-2 small">{modalError}</div>}

                  <div className="text-start">
                    <label className="form-label small fw-medium ps-1" style={{ color: "#4B5563" }}>
                      Buscar fabricante y modelo
                    </label>
                    <Select
                      options={modelOptions}
                      value={selectedOption}
                      onChange={(val) => setSelectedOption(val)}
                      placeholder="Escribe para buscar..."
                      isClearable
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                    
                    <div className="d-flex gap-2 mt-4">
                      <button 
                        type="button" 
                        className="btn btn-light w-50" 
                        onClick={handleCloseModal}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-success w-50 fw-bold"
                        disabled={!selectedOption || modalLoading}
                        onClick={handleContinueExisting}
                      >
                        {modalLoading ? "Cargando..." : "Continuar"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}