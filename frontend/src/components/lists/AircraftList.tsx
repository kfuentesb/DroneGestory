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

  const filteredAircrafts = useSearchFilter(aircrafts, search, (a) => [
    a.manufacturer ?? "",
    a.model ?? "",
    a.serialNumber ?? "",
    a.aircraftClass,
    a.config,
    a.fechaFab ?? "",
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, aircrafts.length]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando aeronaves..." />;
  }

  const paginatedAircrafts = filteredAircrafts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getImageUrl = (path?: string | null) => {
    if (!path) return DefaultDroneImage;

    const trimmedPath = path.trim();
    if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
      return trimmedPath;
    }

    const marker = "/api/aircraft/images/";
    let relativePath = trimmedPath;
    if (trimmedPath.includes(marker)) {
      relativePath = trimmedPath.substring(trimmedPath.indexOf(marker) + marker.length);
    }

    if (relativePath.startsWith("/")) {
      relativePath = relativePath.slice(1);
    }

    const encodedPath = relativePath
      .split("/")
      .filter(Boolean)
      .map(encodeURIComponent)
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
    { label: "Velocidad", key: "maxSpeed", sortable: true },
    { label: "Configuración", key: "config", sortable: true },
    { label: "Energia impacto", key: "impactEnergy", sortable: true },
    { label: "Fecha fabricación", key: "fechaFab", sortable: true },
    { label: "Camara", key: "hasCamera", sortable: true },
  ];

  const handleRowClick = (a: Aircraft) => {
    navigate(`/aircrafts/${a.id}`);
  };

  return (
    <div className="container py-4">
      <div
        className="card shadow-sm"
        style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
      >
        <div className="card-body">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Aeronaves registradas
          </h2>

          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-3 mb-4">
            <SearchBar value={search} onChange={setSearch} />

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
            <ReusableTable
              headers={modelHeaders}
              rows={paginatedAircrafts}
              renderRow={(a) => (
                <>
                  {/* Put the image inside a <td> cell so it aligns with the headers */}
                  <td>
                    <img
                      src={getImageUrl(a.imagePath)}
                      alt={`${a.manufacturer} ${a.model}`}
                      style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                      onError={(e) => {
                        e.currentTarget.src = DefaultDroneImage;
                      }}
                    />
                  </td>
                  <td>{a.manufacturer || "N/A"}</td>
                  <td>{a.model || "N/A"}</td>
                  <td>{a.serialNumber ?? "-"}</td>
                  <td>{a.aircraftClass}</td>
                  <td>{a.mtom ?? "-"} <b> Kg</b></td>
                  <td>{a.wingspan ?? "-"} <b>m</b></td>
                  <td>{a.maxSpeed ?? "-"} <b>m/s</b></td>
                  <td>{a.config}</td>
                  <td>{a.impactEnergy ?? "-"} <b>J</b></td>
                  <td>{formatMonthYear(a.fechaFab)}</td>
                  <td className="text-center">
                    <span className={`badge ${a.hasCamera ? "bg-success" : "bg-secondary"}`}>
                      {a.hasCamera ? "Si" : "No"}
                    </span>
                  </td>
                </>
              )}
              onRowClick={handleRowClick}
              emptyText="No hay aeronaves registradas."
            />
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
                    {/* Top Info Header Block */}
                    <div className="d-flex gap-3 align-items-start mb-3">
                      {/* Expanded & Cleaned Image Frame */}
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

                      {/* Core Text Info */}
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
                          
                          {/* Badges Stacked Right */}
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

                    {/* Premium Parameters Grid */}
                    <div className="row g-2 text-muted mb-3" style={{ fontSize: "0.78rem" }}>
                      {[
                        { label: "MTOM", value: `${a.mtom ?? "-"} Kg` },
                        { label: "Dimensión", value: `${a.wingspan ?? "-"} m` },
                        { label: "Velocidad", value: `${a.maxSpeed ?? "-"} m/s` },
                        { label: "Energía", value: `${a.impactEnergy ?? "-"} J` },
                        { label: "Fabricación", value: formatMonthYear(a.fechaFab) },
                        { 
                          label: "Cámara", 
                          value: (
                            <span className={`badge ${a.hasCamera ? "bg-success-subtle text-success" : "bg-light text-secondary"} border`} style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                              {a.hasCamera ? "Sí" : "No"}
                            </span>
                          ) 
                        }
                      ].map((stat, i) => (
                        <div className="col-4" key={i}>
                          <div className="p-2" style={{ backgroundColor: "#F9FAFB", borderRadius: "6px", border: "1px solid #F3F4F6" }}>
                            <span className="d-block text-muted mb-0.5" style={{ fontSize: "0.68rem" }}>{stat.label}</span>
                            <strong className="text-dark d-block text-truncate">{stat.value}</strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer Action Anchor */}
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