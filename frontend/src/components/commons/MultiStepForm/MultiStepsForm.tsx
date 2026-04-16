import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseForm, { type FieldConfig } from "./BaseForm";
import { createOperation } from "../../operations/operation.api";

const createOperationFields: FieldConfig[] = [
  { name: "nombreOperacion", label: "Nombre de la operación", type: "text", required: true },
  { name: "conops", label: "CONOPS", type: "text", required: true },
];

export default function MultiStepsForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateOperation = async (data: { nombreOperacion: string, conops: string }) => {
    setSubmitting(true);
    setError(null);

    try {
      const created = await createOperation(data.nombreOperacion.trim(), data.conops.trim());

      if (!created) {
        return;
      }

      navigate(`/operations/${created.idOperacion}`);
    } catch (err) {
      console.error("Error creando operación:", err);
      setError("No se pudo crear la operación.");
    } finally {
      setSubmitting(false);
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
          <p className="text-muted text-center">
            La operación se crea primero y los anexos se gestionan después desde su detalle específico.
          </p>
          <BaseForm
            fields={createOperationFields}
            onSubmit={handleCreateOperation}
            showGuardarButton={false}
            submitButtonText={submitting ? "Creando..." : "Crear operación"}
          />
        </div>
      </div>
    </div>
  );
}
