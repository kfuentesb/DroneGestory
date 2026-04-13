import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";

export default function FormAircraftModel() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from ?? "/aircraft-models";
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ manufacturer: false, model: false });

  const manufacturerError = touched.manufacturer && !manufacturer.trim();
  const modelError = touched.model && !model.trim();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ manufacturer: true, model: true });
    setError(null);

    if (!manufacturer.trim() || !model.trim()) {
      setError("Fabricante y modelo son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/aircraft-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manufacturer: manufacturer.trim(),
          model: model.trim(),
        }),
      });

      if (!res) return;
      navigate(returnTo);
    } catch (err: any) {
      setError(err?.message ?? "No se pudo registrar el modelo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
        <div className="card-body">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Registrar modelo
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label">Fabricante</label>
                <input
                  type="text"
                  className="form-control"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, manufacturer: true }))}
                  style={{ border: manufacturerError ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {manufacturerError && <small className="text-danger">Campo requerido</small>}
              </div>
              <div className="col-12 col-md">
                <label className="form-label">Modelo</label>
                <input
                  type="text"
                  className="form-control"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, model: true }))}
                  style={{ border: modelError ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {modelError && <small className="text-danger">Campo requerido</small>}
              </div>
            </div>

            {error && <p className="text-danger mb-3">{error}</p>}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? "Guardando..." : "Registrar modelo"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(returnTo)}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
