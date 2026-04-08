import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../ConfirmModal";
import { createOperation } from "../../operations/operation.api";

export default function MultiStepsForm() {
  const navigate = useNavigate();
  const [nombreOperacion, setNombreOperacion] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSiguiente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreOperacion.trim()) return;
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const created = await createOperation(nombreOperacion.trim());

      if (!created) {
        setError("No se pudo crear la operación.");
        return;
      }

      navigate(`/operations/${created.idOperacion}`);
    } catch (err) {
      console.error("Error creando operación:", err);
      setError("No se pudo crear la operación.");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="container mt-4">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex justify-content-center align-items-center">
        <div className="card shadow p-4" style={{ maxWidth: 500, width: "100%" }}>
          <h3 className="mb-3 text-center">Registrar operación</h3>
          <form onSubmit={handleSiguiente}>
            <div className="mb-3">
              <label className="form-label fw-bold" htmlFor="nombreOperacion">
                Nombre de la operación
              </label>
              <input
                id="nombreOperacion"
                type="text"
                className="form-control"
                value={nombreOperacion}
                onChange={(e) => setNombreOperacion(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!nombreOperacion.trim() || submitting}
              >
                Siguiente
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        show={showConfirm}
        title="Crear operación"
        message={`¿Deseas crear la operación "${nombreOperacion}"?`}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setShowConfirm(false)}
        variant="primary"
      />
    </div>
  );
}
