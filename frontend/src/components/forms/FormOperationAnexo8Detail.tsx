import { useEffect, useState } from "react";
import { apiFetch } from "../../api";

type FormOperationAnexo8DetailProps = {
  operationId: number;
  initialValue?: string;
  disabled?: boolean;
  onSaved?: () => void;
};

function SectionTitle({ children }: { children: string }) {
  return <h4 className="fw-bold mt-5 mb-3 pb-2 border-bottom text-success">{children}</h4>;
}

export default function FormOperationAnexo8Detail({
  operationId,
  initialValue = "",
  disabled,
  onSaved,
}: FormOperationAnexo8DetailProps) {
  const [textoPrueba, setTextoPrueba] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTextoPrueba(initialValue);
  }, [initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("textoPrueba", textoPrueba);

      await apiFetch(`/api/operations/${operationId}/anexo8`, {
        method: "POST",
        body: formData,
      });

      onSaved?.();
    } catch (err: any) {
      alert(err?.message || "Error al guardar el anexo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h3 className="fw-bold mb-1 text-dark">APÉNDICE 8</h3>

        <form onSubmit={handleSubmit}>
          <SectionTitle>Contenido</SectionTitle>
          <div className="mb-3">
            <label className="form-label fw-bold small text-uppercase text-muted">Texto</label>
            <textarea
              className="form-control bg-white border"
              rows={8}
              value={textoPrueba}
              onChange={(e) => setTextoPrueba(e.target.value)}
              disabled={disabled || saving}
              placeholder="Contenido del apéndice 8"
            />
          </div>

          <div className="d-flex justify-content-end mt-5 pt-3 border-top">
            <button
              type="submit"
              className="btn btn-success btn-lg px-5 shadow-sm"
              disabled={disabled || saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : "Guardar borrador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
