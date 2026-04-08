import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseForm, { type FieldConfig } from "./BaseForm";
import ProgressBar from "./ProgressBar";
import { createOperation, saveAnexo4 } from "../../operations/operation.api";
import Anexo4FormContent from "../../forms/Anexo4FormContent";
import { ANEXO4_INITIAL_FIELDS } from "../../forms/anexo4.constants";
import type { Anexo4Fields } from "../../operations/operation.types";

const TOTAL_STEPS = 2;

const createOperationFields: FieldConfig[] = [
  { name: "nombreOperacion", label: "Nombre de la operación", type: "text", required: true },
];

export default function MultiStepsForm() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data from step 1
  const [operationId, setOperationId] = useState<number | null>(null);

  // Data from step 2 (preserved on back)
  const [anexo4Fields, setAnexo4Fields] = useState<Anexo4Fields>(ANEXO4_INITIAL_FIELDS);

  // Step 1: Create operation
  const handleCreateOperation = async (data: { nombreOperacion: string }) => {
    setSubmitting(true);
    setError(null);

    try {
      const created = await createOperation(data.nombreOperacion.trim());

      if (!created) {
        setError("No se pudo crear la operación.");
        return;
      }

      setOperationId(created.idOperacion);
      setStep(1);
    } catch (err) {
      console.error("Error creando operación:", err);
      setError("No se pudo crear la operación.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Submit Anexo4
  const handleSaveAnexo4 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operationId) return;

    setSubmitting(true);
    setError(null);

    try {
      await saveAnexo4(operationId, anexo4Fields);
      navigate(`/operations/${operationId}`);
    } catch (err) {
      console.error("Error guardando Anexo 4:", err);
      setError("No se pudo guardar el Anexo 4.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStepButtonClass = (idx: number, currentStep: number) => {
    if (idx === currentStep) return "btn btn-sm btn-primary";
    if (idx < currentStep) return "btn btn-sm btn-success";
    return "btn btn-sm btn-outline-secondary";
  };

  const stepLabels = ["Datos de la operación", "Anexo 4"];

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card shadow p-4">
            <h3 className="mb-3 text-center">Registrar operación</h3>

            <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />

            {/* Step indicators */}
            <div className="d-flex justify-content-center gap-3 mb-4">
              {stepLabels.map((label, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={getStepButtonClass(idx, step)}
                  onClick={() => {
                    if (idx < step) setStep(idx);
                  }}
                  disabled={idx >= step}
                  title={idx < step ? `Volver a: ${label}` : label}
                >
                  {idx + 1}. {label}
                </button>
              ))}
            </div>

            {step === 0 && (
              <div>
                <p className="text-muted text-center mb-3">
                  Paso 1: Introduce el nombre de la nueva operación.
                </p>
                <BaseForm
                  fields={createOperationFields}
                  onSubmit={handleCreateOperation}
                  showGuardarButton={false}
                  submitButtonText={submitting ? "Creando..." : "Siguiente →"}
                />
              </div>
            )}

            {step === 1 && operationId !== null && (
              <div>
                <p className="text-muted text-center mb-3">
                  Paso 2: Rellena los datos del Anexo 4 para la operación <strong>#{operationId}</strong>.
                  Puedes omitir los campos opcionales y guardarlos después.
                </p>
                <Anexo4FormContent
                  fields={anexo4Fields}
                  setFields={setAnexo4Fields}
                  saving={submitting}
                  error={null}
                  onSubmit={handleSaveAnexo4}
                  onCancel={() => navigate(`/operations/${operationId}`)}
                  submitLabel={submitting ? "Guardando..." : "Guardar y ver operación"}
                  showCancel={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
