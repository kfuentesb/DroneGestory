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

      // Redirigimos a la vista del formulario inyectando los datos requeridos en el state
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

  const modelHeaders: TableHeader[] = [
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

          <div className="d-flex justify-content-between align-items-center mb-4">
            <SearchBar value={search} onChange={setSearch} />

            <div className="d-flex align-items-stretch gap-2">
              {(roles.includes("ADMIN") || roles.includes("MANAGER")) && (
                <ButtonProp onClick={() => setIsModalOpen(true)}>
                  + Registrar nueva aeronave
                </ButtonProp>
              )}
            </div>
          </div>

          <ReusableTable
            headers={modelHeaders}
            rows={paginatedAircrafts}
            renderRow={(a) => (
              <>
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
            onRowClick={(a) => navigate(`/aircrafts/${a.id}`)}
            emptyText="No hay aeronaves registradas."
          />

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