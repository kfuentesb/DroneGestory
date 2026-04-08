import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import FormAircraft from "./FormAircraft";

type Mode = "new" | "existing";

type AircraftApiItem = {
  manufacturer?: string;
  model?: string;
};

type AircraftModelOption = {
  value: string;
  label: string;
  manufacturer: string;
  model: string;
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
    const loadAircrafts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch("/api/aircraft", {
          headers: { "Content-Type": "application/json" },
        });
        if (!res) return;

        const aircrafts: AircraftApiItem[] = await res.json();
        const uniqueMap = new Map<string, AircraftModelOption>();

        aircrafts.forEach((aircraft) => {
          const manufacturer = (aircraft.manufacturer ?? "").trim();
          const model = (aircraft.model ?? "").trim();
          if (!manufacturer || !model) return;

          const key = `${manufacturer.toLowerCase()}::${model.toLowerCase()}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, {
              value: key,
              label: `${manufacturer} - ${model}`,
              manufacturer,
              model,
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

    loadAircrafts();
  }, []);

  const isContinueDisabled = useMemo(() => {
    if (mode === "new") return false;
    return !selectedOption;
  }, [mode, selectedOption]);

  if (showForm) {
    return (
      <>
        <div className="container py-3" style={{ maxWidth: "1000px" }}>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowForm(false)}
          >
            Volver a selección
          </button>
        </div>

        <FormAircraft
          key={mode === "existing" && selectedOption ? selectedOption.value : "new-aircraft"}
          initialValues={
            mode === "existing" && selectedOption
              ? { manufacturer: selectedOption.manufacturer, model: selectedOption.model }
              : undefined
          }
        />
      </>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Cargando modelos de aeronave..." />;
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
        <div className="card-body" style={{ maxWidth: "780px", margin: "0 auto" }}>
          <h2 className="mb-2" style={{ color: "#1E1E1E" }}>Registrar aeronave</h2>
          <p className="text-muted mb-4">Elige si quieres crear un modelo nuevo o partir de uno existente.</p>

          <div className="d-flex gap-2 mb-3">
            <button
              type="button"
              className={`btn ${mode === "new" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setMode("new")}
            >
              Nuevo modelo
            </button>
            <button
              type="button"
              className={`btn ${mode === "existing" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setMode("existing")}
            >
              Modelo existente
            </button>
          </div>

          {mode === "existing" && (
            <div className="mb-3">
              <label className="form-label d-block text-start ps-1">Seleccionar fabricante y modelo</label>
              <Select
                options={modelOptions}
                value={selectedOption}
                onChange={(value) => setSelectedOption(value as AircraftModelOption)}
                placeholder="Selecciona un modelo existente"
                isClearable
                noOptionsMessage={() => "No hay modelos disponibles"}
              />
              {modelOptions.length === 0 && (
                <div className="text-muted small mt-2">
                  No hay aeronaves registradas todavía. Puedes continuar con "Nuevo modelo".
                </div>
              )}
            </div>
          )}

          {error && <p className="text-danger mb-3">{error}</p>}

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-success"
              disabled={isContinueDisabled}
              onClick={() => setShowForm(true)}
            >
              Continuar
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/aircrafts")}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
