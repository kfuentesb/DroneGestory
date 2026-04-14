import { useEffect, useState } from "react";
import { saveAnexo8Data, type Anexo8Data } from "../operations/operation.api";

type FormOperationAnexo8DetailProps = {
  operationId: number;
  initialValues?: Anexo8Data | null;
  disabled?: boolean;
  readOnlyMessage?: React.ReactNode;
  onSaved?: (savedData: Anexo8Data | null) => void | Promise<void>;
};

const FORM_FIELDS = [
  "nombreConops",
  "fechaOp",
  "condicionesATSP",
  "comunicacion3FinalizacionOperacion",
  "comunicacionZrvfCecaf",
  "anotacionTiempoVueloAeronave",
  "anotacionTIempoActividadPersonal",
  "anotacionEventosOcurridosOperacion",
  "comunicacionIncidentes",
] as const;

type FormKey = (typeof FORM_FIELDS)[number];
type FormValues = Record<FormKey, string>;

const DEFAULT_VALUES = FORM_FIELDS.reduce(
  (acc, key) => ({ ...acc, [key]: "" }),
  {} as FormValues,
);

const BOOL_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

type SectionItem = { num: string; title: string; key: FormKey; level: number };

const SECCIONES_CONFIG: { seccion1: SectionItem[]; seccion2: SectionItem[] } = {
  seccion1: [
    { num: "1.1", title: "Condiciones ATSP", key: "condicionesATSP", level: 0 },
    {
      num: "1.2",
      title: "Comunicación a terceros finalización operación",
      key: "comunicacion3FinalizacionOperacion",
      level: 0,
    },
    { num: "1.3", title: "Comunicación ZRVF CECAF", key: "comunicacionZrvfCecaf", level: 0 },
  ],
  seccion2: [
    { num: "2.1", title: "Anotación tiempo vuelo aeronave", key: "anotacionTiempoVueloAeronave", level: 0 },
    { num: "2.2", title: "Anotación tiempo actividad personal", key: "anotacionTIempoActividadPersonal", level: 0 },
    {
      num: "2.3",
      title: "Anotación eventos ocurridos en operación",
      key: "anotacionEventosOcurridosOperacion",
      level: 0,
    },
    { num: "2.4", title: "Comunicación de incidentes", key: "comunicacionIncidentes", level: 0 },
  ],
};

function SectionTitle({ children }: { children: string }) {
  return <h4 className="fw-bold mt-5 mb-3 pb-2 border-bottom text-success">{children}</h4>;
}

export default function FormOperationAnexo8Detail({
  operationId,
  initialValues,
  disabled,
  readOnlyMessage,
  onSaved,
}: FormOperationAnexo8DetailProps) {
  const [formValues, setFormValues] = useState<FormValues>(DEFAULT_VALUES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialValues) return;

    const normalizeDateTimeLocal = (value: string | null | undefined) => {
      if (!value) return "";
      const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
      return match ? match[1] : value;
    };

    const normalized = { ...DEFAULT_VALUES };
    FORM_FIELDS.forEach((key) => {
      const value = initialValues[key];
      if (key === "fechaOp") {
        normalized[key] = normalizeDateTimeLocal(value as string | null | undefined);
        return;
      }
      if (value === null || value === undefined) {
        normalized[key] = "";
        return;
      }
      if (typeof value === "boolean") {
        normalized[key] = String(value);
        return;
      }
      normalized[key] = String(value);
    });

    setFormValues(normalized);
  }, [initialValues]);

  const handleChange = (key: FormKey, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    setSaving(true);
    try {
      const formData = new FormData();
      FORM_FIELDS.forEach((key) => {
        const value = formValues[key];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      const savedData = await saveAnexo8Data(operationId, formData);
      alert("Anexo 8 guardado correctamente");
      await onSaved?.(savedData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || "Error al guardar el anexo.");
      } else {
        alert("Error al guardar el anexo.");
      }
    } finally {
      setSaving(false);
    }
  };

  const renderApartadoRow = (item: { num: string; title: string; key: FormKey; level: number }) => {
    const value = formValues[item.key] ?? "";
    return (
      <div
        key={item.key}
        className="d-flex align-items-center justify-content-between mb-1 py-2 border-bottom border-light"
        style={{ paddingLeft: item.level === 0 ? 0 : "2rem" }}
      >
        <div className="d-flex align-items-baseline">
          {item.level > 0 && <span className="me-2 text-muted small">•</span>}
          <div className={item.level === 0 ? "fw-bold text-dark" : "text-secondary small"}>
            {item.num}. {item.title}
          </div>
        </div>
        <div className="ms-3">
          <select
            className="form-select form-select-sm d-inline-block w-auto"
            value={value}
            onChange={(e) => handleChange(item.key, e.target.value)}
            disabled={disabled || saving}
            style={{ minWidth: "120px" }}
          >
            {BOOL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h3 className="fw-bold mb-1 text-dark">APÉNDICE 8</h3>
        <div
          style={
            disabled
              ? {
                  filter: "grayscale(1)",
                  opacity: 0.7,
                  pointerEvents: "none",
                  userSelect: "none",
                }
              : undefined
          }
        >
          <form onSubmit={handleSubmit}>
            <SectionTitle>SECCIÓN 0: Información general</SectionTitle>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small text-uppercase text-muted">Nombre CONOPS</label>
                <input
                  type="text"
                  className="form-control bg-white border"
                  value={formValues.nombreConops}
                  onChange={(e) => handleChange("nombreConops", e.target.value)}
                  disabled={disabled || saving}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small text-uppercase text-muted">Fecha operación</label>
                <input
                  type="datetime-local"
                  className="form-control bg-white border"
                  value={formValues.fechaOp}
                  onChange={(e) => handleChange("fechaOp", e.target.value)}
                  disabled={disabled || saving}
                />
              </div>
            </div>

            <SectionTitle>SECCIÓN 1: Condiciones y limitaciones</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion1.map(renderApartadoRow)}
            </div>

            <SectionTitle>SECCIÓN 2: Registro de datos de vuelo y eventos</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion2.map(renderApartadoRow)}
            </div>

            <div className="d-flex justify-content-end mt-5 pt-3 border-top">
              <button type="submit" className="btn btn-success btn-lg px-5 shadow-sm" disabled={disabled || saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  "Guardar borrador"
                )}
              </button>
            </div>
          </form>
        </div>
        {disabled && (
          <div className="alert alert-secondary mt-4">
            {readOnlyMessage ? (
              readOnlyMessage
            ) : (
              <>
                El anexo está firmado. No se puede editar. Pulsa <strong>Rehacer versión</strong> para poder modificar.
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
