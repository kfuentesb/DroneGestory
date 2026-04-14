import { useEffect, useState } from "react";
import { saveAnexo6Data, type Anexo6Data } from "../operations/operation.api";

type FormOperationAnexo6DetailProps = {
  operationId: number;
  initialValues?: Anexo6Data | null;
  disabled?: boolean;
  readOnlyMessage?: React.ReactNode;
  onSaved?: (savedData: Anexo6Data | null) => void | Promise<void>;
};

const FORM_FIELDS = [
  "nombreConops",
  "fechaOp",
  "materialesAuxiliares",
  "sinImpacto",
  "centroGravedad",
  "integridadEstructural",
  "cableado",
  "verificacionLuces",
  "calibracion",
  "validarSalidaDatos",
  "giranLibremente",
  "sentidoGiroCorrecto",
  "sinImpactoMotores",
  "colocacionCorrecta",
  "sujetacionFirme",
  "sinImpactoHelices",
  "bateriaCarga",
  "movimientoFluidoMando",
  "sinImpactoPartesMoviles",
  "movimientoFluidoPartesMoviles",
  "antenasInstaladasYOrientadas",
  "calidadOnda",
  "recepcionAdecuada",
  "fuenteAlimentacion",
  "nivelFuenteAlimentacion",
  "fijacionCorrecta",
  "memoriaSuficienteParaDatos",
  "sinImpactoCargaPago",
  "conexionesCargaPago",
  "datosCargados",
  "transmisionDatos",
  "informacionActualizada",
  "sistemaActivado",
] as const;

type FormKey = (typeof FORM_FIELDS)[number];
type FormValues = Record<FormKey, string>;

const DEFAULT_VALUES = FORM_FIELDS.reduce(
  (acc, key) => ({ ...acc, [key]: "" }),
  {} as FormValues,
);

const BOOL_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "true", label: "Correcto" },
  { value: "false", label: "Incorrecto" },
];

type SectionItem = {
  num: string;
  title: string;
  key?: FormKey;
  level: number; // 0,1,2
  inputType?: "select" | "title"; // default: "select"
  bold?: boolean; // default: false
};

const SECCIONES_CONFIG: {
  seccion2: SectionItem[];
  seccion3: SectionItem[];
  seccion4: SectionItem[];
  seccion5: SectionItem[];
  seccion6: SectionItem[];
  seccion7: SectionItem[];
  seccion8: SectionItem[];
  seccion9: SectionItem[];
  seccion10: SectionItem[];
  seccion11: SectionItem[];
  seccion12: SectionItem[];
} = {
  seccion2: [
    { num: "2.1", title: "Sin impacto ni muescas", key: "sinImpacto", level: 0 },
    { num: "2.2", title: "Centro de gravedad", key: "centroGravedad", level: 0 },
    { num: "2.3", title: "Integridad estructural", key: "integridadEstructural", level: 0 },
    { num: "2.4", title: "Cableado/conexiones", key: "cableado", level: 0 },
    { num: "2.5", title: "Verificación de luces", key: "verificacionLuces", level: 0 },
  ],
  seccion3: [
    { num: "3.1", title: "Calibración", key: "calibracion", level: 0 },
    { num: "3.2", title: "Validar de salida de datos", key: "validarSalidaDatos", level: 0 },
  ],
  seccion4: [
    { num: "4.1", title: "Giran libremente", key: "giranLibremente", level: 0 },
    { num: "4.2", title: "Sentido de giro correcto", key: "sentidoGiroCorrecto", level: 0 },
    { num: "4.3", title: "Sin impacto ni muescas", key: "sinImpactoMotores", level: 0 },
  ],
  seccion5: [
    { num: "5.1", title: "Colocación correcta", key: "colocacionCorrecta", level: 0 },
    { num: "5.2", title: "Sujeción firme", key: "sujetacionFirme", level: 0 },
    { num: "5.3", title: "Sin impacto ni muescas", key: "sinImpactoHelices", level: 0 },
  ],
  seccion6: [
    { num: "6.1", title: "Batería con carga adecuada", key: "bateriaCarga", level: 0 },
    { num: "6.2", title: "Movimiento fluido de los mandos", key: "movimientoFluidoMando", level: 0 },
  ],
  seccion7: [
    { num: "7.1", title: "Sin impacto ni muescas", key: "sinImpactoPartesMoviles", level: 0 },
    { num: "7.2", title: "Movimiento fluido", key: "movimientoFluidoPartesMoviles", level: 0 },
  ],
  seccion8: [
    { num: "8.1", title: "Antenas instaladas y orientadas", key: "antenasInstaladasYOrientadas", level: 0 },
    { num: "8.2", title: "Calidad de la señal", key: "calidadOnda", level: 0 },
    { num: "8.3", title: "Recepción adecuada", key: "recepcionAdecuada", level: 0 },
  ],
  seccion9: [
    { num: "9.1", title: "Fuente de alimentación (Baterías, combustible, etc...)", key: "fuenteAlimentacion", level: 0 },
    { num: "9.2", title: "Nivel de fuente de alimentación", key: "nivelFuenteAlimentacion", level: 0 },
  ],
  seccion10: [
    { num: "10.1", title: "Fijación correcta", key: "fijacionCorrecta", level: 0 },
    { num: "10.2", title: "Memoria suficiente para almacenar datos", key: "memoriaSuficienteParaDatos", level: 0 },
    { num: "10.3", title: "Sin impacto ni muescas", key: "sinImpactoCargaPago", level: 0 },
    { num: "10.4", title: "Conexiones", key: "conexionesCargaPago", level: 0 },
  ],
  seccion11: [
    { num: "11.1", title: "Datos cargados", key: "datosCargados", level: 0 },
    { num: "11.2", title: "Transmisión de datos", key: "transmisionDatos", level: 0 },
  ],
  seccion12: [
    { num: "12.1", title: "Información actualizada", key: "informacionActualizada", level: 0 },
    { num: "12.2", title: "Sistema activado", key: "sistemaActivado", level: 0 },
  ],
};

function SectionTitle({ children }: { children: string }) {
  return <h4 className="fw-bold mt-5 mb-3 pb-2 border-bottom text-success">{children}</h4>;
}

export default function FormOperationAnexo6Detail({
  operationId,
  initialValues,
  disabled,
  readOnlyMessage,
  onSaved,
}: FormOperationAnexo6DetailProps) {
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
      if (key === "materialesAuxiliares" && Array.isArray(value)) {
        normalized[key] = value.join("\n");
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
        if (key === "materialesAuxiliares") {
          const items = value
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
          items.forEach((item) => formData.append("materialesAuxiliares", item));
          return;
        }
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      const savedData = await saveAnexo6Data(operationId, formData);
      alert("Anexo 6 guardado correctamente");
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
        <h3 className="fw-bold mb-1 text-dark">APÉNDICE 6</h3>
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

            <SectionTitle>SECCIÓN 1: Material auxiliar</SectionTitle>
            <div className="mb-3">
              <label className="form-label fw-bold small text-uppercase text-muted">Materiales auxiliares</label>
              <textarea
                className="form-control bg-white border"
                rows={4}
                value={formValues.materialesAuxiliares}
                onChange={(e) => handleChange("materialesAuxiliares", e.target.value)}
                disabled={disabled || saving}
                placeholder="Introduce un material por línea"
              />
            </div>

            <SectionTitle>SECCIÓN 2: Estructura</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion2.map(renderApartadoRow)}
            </div>

            <SectionTitle>SECCIÓN 3: Sensores</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion3.map(renderApartadoRow)}
            </div>

            <SectionTitle>SECCIÓN 4: Motores</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion4.map(renderApartadoRow)}
            </div>

            <SectionTitle>SECCIÓN 5: Hélices</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion5.map(renderApartadoRow)}
            </div>

            <SectionTitle>SECCIÓN 6: Unidad de control</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion6.map(renderApartadoRow)}
            </div>

            <SectionTitle>SECCIÓN 7: Partes móviles</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion7.map(renderApartadoRow)}
            </div>

            <SectionTitle>SECCIÓN 8: Comunicaciones</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion8.map(renderApartadoRow)}
            </div>

            <SectionTitle>SECCIÓN 9: Planta de potencia</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion9.map(renderApartadoRow)}
            </div>

            <SectionTitle>SECCIÓN 10: Carga de pago</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion10.map(renderApartadoRow)}
            </div>

            <SectionTitle>SECCIÓN 11: Identificación remota</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion11.map(renderApartadoRow)}
            </div>

            <SectionTitle>SECCIÓN 12: Sistema de geoconsciencia</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion12.map(renderApartadoRow)}
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
