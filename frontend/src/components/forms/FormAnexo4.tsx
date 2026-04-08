import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { saveAnexo4 } from "../operations/operation.api";
import type { Anexo4Fields } from "../operations/operation.types";
import Anexo4FormContent from "./Anexo4FormContent";
import { ANEXO4_INITIAL_FIELDS } from "./anexo4.constants";

type Props = {
  operationId?: string | number;
  initialFields?: Partial<Anexo4Fields>;
  onSaved?: (result: unknown) => void;
  submitLabel?: string;
  showCancel?: boolean;
};

export default function FormAnexo4({
  operationId: propOperationId,
  initialFields: propInitial,
  onSaved,
  submitLabel,
  showCancel,
}: Props) {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const operationId = propOperationId ?? paramId;

  const [fields, setFields] = useState<Anexo4Fields>({
    ...ANEXO4_INITIAL_FIELDS,
    ...(propInitial ?? {}),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operationId) return setError("Falta el ID de operación.");

    setSaving(true);
    setError(null);

    try {
      const result = await saveAnexo4(operationId, fields);
      if (onSaved) {
        onSaved(result);
      } else {
        alert("Anexo 4 guardado correctamente");
        navigate(`/operations/${operationId}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el anexo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card p-4">
            <h3 className="mb-3">Registro Anexo 4</h3>
            <Anexo4FormContent
              fields={fields}
              setFields={setFields}
              saving={saving}
              error={error}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/operations/${operationId}`)}
              submitLabel={submitLabel}
              showCancel={showCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}