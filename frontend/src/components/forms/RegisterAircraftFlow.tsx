import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import FormAircraft from "./FormAircraft";

type Mode = "new" | "existing";

type AircraftModelApiItem = {
  id?: number;
  manufacturer?: string;
  model?: string;
  aircraftClassDefault?: string;
  mtomDefault?: number;
  wingspanDefault?: number;
  maxSpeedDefault?: number;
  configDefault?: string;
  impactEnergyDefault?: number;
  hasCameraDefault?: boolean;
  privatelyBuiltDefault?: boolean;
  hasParachuteDefault?: boolean;
  hasEnsuranceDefault?: boolean;
  hasFTSDefault?: boolean;
  cautiveDefault?: string;
  accessoriesDefault?: string;
};

type AircraftModelOption = {
  value: string;
  label: string;
  manufacturer: string;
  model: string;
  aircraftClassDefault?: string;
  mtomDefault?: number;
  wingspanDefault?: number;
  maxSpeedDefault?: number;
  configDefault?: string;
  impactEnergyDefault?: number;
  hasCameraDefault?: boolean;
  privatelyBuiltDefault?: boolean;
  hasParachuteDefault?: boolean;
  hasEnsuranceDefault?: boolean;
  hasFTSDefault?: boolean;
  cautiveDefault?: string;
  accessoriesDefault?: string;
};

export default function RegisterAircraftFlow() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("new");
  const [selectedOption, setSelectedOption] = useState<AircraftModelOption | null>(null);
  const [modelOptions, setModelOptions] = useState<AircraftModelOption[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch("/api/aircraft-models", {
          headers: { "Content-Type": "application/json" },
        });
        if (!res) return;

        const models: AircraftModelApiItem[] = await res.json();
        const uniqueMap = new Map<string, AircraftModelOption>();

        models.forEach((modelItem) => {
          const manufacturer = (modelItem.manufacturer ?? "").trim();
          const model = (modelItem.model ?? "").trim();
          if (!manufacturer || !model) return;

          const key = `${manufacturer.toLowerCase()}::${model.toLowerCase()}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, {
              value: key,
              label: `${manufacturer} - ${model}`,
              manufacturer,
              model,
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
              cautiveDefault: modelItem.cautiveDefault,
              accessoriesDefault: modelItem.accessoriesDefault,
            });
          }
        });

        const options = Array.from(uniqueMap.values()).sort((a, b) => a.label.localeCompare(b.label));
        setModelOptions(options);
      } catch (err: any) {
        setError(err?.message ?? "No se pudieron cargar los modelos de aeronave.");
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  const isContinueDisabled = useMemo(() => {
    if (mode === "new") return false;
    return !selectedOption;
  }, [mode, selectedOption]);

  if (showForm) {
    return (
      <>
        <div className="container" style={{ maxWidth: "1000px" }}>
          <button
            type="button"
            className="btn btn-link p-0 mb-3 d-flex align-items-center text-decoration-none text-muted hover-dark"
            onClick={() => setShowForm(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            <span className="ms-2 fw-medium">Volver</span>
          </button>
        </div>

        <FormAircraft
          key={mode === "existing" && selectedOption ? selectedOption.value : "new-aircraft"}
          initialValues={
            mode === "existing" && selectedOption
              ? {
                  manufacturer: selectedOption.manufacturer,
                  model: selectedOption.model,
                  aircraftClassDefault: selectedOption.aircraftClassDefault,
                  mtomDefault: selectedOption.mtomDefault,
                  wingspanDefault: selectedOption.wingspanDefault,
                  maxSpeedDefault: selectedOption.maxSpeedDefault,
                  configDefault: selectedOption.configDefault,
                  impactEnergyDefault: selectedOption.impactEnergyDefault,
                  hasCameraDefault: selectedOption.hasCameraDefault,
                  privatelyBuiltDefault: selectedOption.privatelyBuiltDefault,
                  hasParachuteDefault: selectedOption.hasParachuteDefault,
                  hasEnsuranceDefault: selectedOption.hasEnsuranceDefault,
                  hasFTSDefault: selectedOption.hasFTSDefault,
                  cautiveDefault: selectedOption.cautiveDefault,
                  accessoriesDefault: selectedOption.accessoriesDefault,
                }
              : undefined
          }
        />
      </>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Cargando modelos de aeronave..." />;
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger mb-0">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4 position-relative">
      {/* Static Volver Arrow */}
      <button
        type="button"
        className="btn btn-link p-0 mb-3 d-flex align-items-center text-decoration-none text-muted hover-dark"
        style={{ position: "absolute", top: "10px", left: "20px", zIndex: 10 }}
        onClick={() => navigate("/aircrafts")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
        </svg>
        <span className="ms-2 fw-medium">Volver</span>
      </button>

      <div className="card shadow-sm mt-5" style={{ border: "1px solid #E5E7EB", borderRadius: "12px" }}>
        <div className="card-body py-5" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <h2 className="mb-2 fw-bold" style={{ color: "#1E1E1E" }}>Registrar aeronave</h2>
          <p className="text-muted mb-4">Selecciona el método de registro para comenzar.</p>

          {/* Main Selection Buttons */}
          <div className="d-flex justify-content-center gap-3 mb-2">
            <button
              type="button"
              className="btn btn-outline-success px-4 py-2 fw-semibold transition-btn"
              onClick={() => navigate("/register-model", { state: { from: "/register-aircraft" } })}
            >
              Nuevo modelo
            </button>
            
            <button
              type="button"
              className="btn btn-outline-success px-4 py-2 fw-semibold transition-btn"
              onClick={() => setMode("existing")}
            >
              Modelo existente
            </button>
          </div>

          {/* Existing Model Selection View */}
          {mode === "existing" && (
            <div className="mt-4 text-start animate__animated animate__fadeInUp">
              <hr className="mb-4" style={{ opacity: 0.1 }} />
              <label className="form-label fw-medium ps-1">Buscar fabricante y modelo</label>
              <Select
                options={modelOptions}
                value={selectedOption}
                onChange={(value) => setSelectedOption(value as AircraftModelOption)}
                placeholder="Escribe para buscar..."
                isClearable
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: base => ({ ...base, zIndex: 9999 })
                }}
              />
              
              <button
                type="button"
                className="btn btn-success w-100 mt-3 py-2 fw-bold"
                disabled={!selectedOption}
                onClick={() => setShowForm(true)}
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS for the Hover Transition */}
      <style>{`
        .transition-btn {
          transition: all 0.3s ease !important;
          border-width: 2px !important;
        }
        .transition-btn:hover {
          color: white !important;
          background-color: #198754 !important; /* Bootstrap Success Green */
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
