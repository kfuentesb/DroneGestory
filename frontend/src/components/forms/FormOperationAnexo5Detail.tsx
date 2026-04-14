import { useEffect, useState } from "react";
import { saveAnexo5Data, type Anexo5Data } from "../operations/operation.api";

type FormOperationAnexo5DetailProps = {
  operationId: number;
  initialValues?: Anexo5Data | null;
  disabled?: boolean;
  readOnlyMessage?: React.ReactNode;
  onSaved?: (savedData: Anexo5Data | null) => void | Promise<void>;
};

const FORM_FIELDS = [
  "nombreConops",
  "fechaOp",
  "vlos",
  "ubicacionObservadores",
  "evaluacionVisibilidadYAlcance",
  "condicionantesAcordadosConGestor",
  "analisisEnFuncionConops",
  "evaluacionEntornoAereoAdyacente",
  "vueloTerrestreControlado",
  "notamActivos",
  "tsaPreviaNotam",
  "procedimientosATSP",
  "condicionesClimatologicas",
  "personalSabeFunciones",
  "comunicacionEntrePersonal",
  "comunicacion3Partes",
  "requisitosSeguridad",
  "requisitosMedioAmbiente",
  "requisitosRadioelectrico",
  "requisitosLocalesEspecificos",
  "atenuacionesGRC",
  "atenuacionesARC",
  "comprobacionesUasVuelo",
] as const;

type FormKey = (typeof FORM_FIELDS)[number];
type FormValues = Record<FormKey, string>;

const DEFAULT_VALUES = FORM_FIELDS.reduce((acc, key) => ({ ...acc, [key]: "" }), {} as FormValues);

const BOOL_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

// key es opcional para permitir filas tipo "title" sin select.
// bold es opcional; por defecto (undefined) => sin negrita.
type SectionItem = {
  num: string;
  title: string;
  key?: FormKey;
  level: number; // 0,1,2
  inputType?: "select" | "title"; // default: "select"
  bold?: boolean; // default: false
};

const SECCIONES_CONFIG: {
  seccion1: SectionItem[];
  seccion2: SectionItem[];
  seccion3: SectionItem[];
  seccion4: SectionItem[];
  seccion5: SectionItem[];
  seccion6: SectionItem[];
  seccion7: SectionItem[];
} = {
  seccion1: [
    { num: "1.1", title: "Evaluación del área de operación y área circundante", level: 0, inputType: "title", bold: true },
    { num: "1.1.1", title: "Terreno, obstáculos y obstrucciones", level: 1, inputType: "title", bold: true },
    { num: "1.1.1.1", title: "Los UA se mantendrán en VLOS/BVLOS según el perfil de vuelo", key: "vlos", level: 2 },
    { num: "1.1.1.2", title: "Los observadores están correctamente posicionados", key: "ubicacionObservadores", level: 2 },
    {
      num: "1.1.1.3",
      title: "Se ha realizado una evaluación del cumplimiento entre la visibilidad y el alcance planificado",
      key: "evaluacionVisibilidadYAlcance",
      level: 2,
    },
    { num: "1.1.2", title: "Si la operación se lleva a cabo próxima a aeropuertos, aeródromos y helipuertos", level: 1, inputType: "title", bold: true },
    {
      num: "1.1.2.1",
      title: "Se han aplicado los condicionantes con el gestor de la infraestructura(ej: notificación a usuarios, llamadas al gestor...)",
      key: "condicionantesAcordadosConGestor",
      level: 2,
    },
    { num: "1.1.3", title: "Otros", level: 1, inputType: "title", bold: true },
    { num: "1.1.3.1", title: "Analizar por parte del operador en función del CONOPS de la operación", key: "analisisEnFuncionConops", level: 2 },
    { num: "1.1.4.1", title: "Evaluación del entorno y del espacio aéreo adyacente", key: "evaluacionEntornoAereoAdyacente", level: 2 },
    { num: "1.1.5.1", title: "Se cumplen las condiciones para el vuelo en zona terrestre controlada", key: "vueloTerrestreControlado", level: 2 },
    { num: "1.2", title: "Evaluación del entorno y del espacio aéreo adyacente", level: 0, inputType: "title", bold: true },
    { num: "1.2.1", title: "NOTAM", level: 1, inputType: "title", bold: true },
    { num: "1.2.2.1", title: "Se revisan los NOTAMS activos y no existen limitaciones a la operación", key: "notamActivos", level: 2 },
    {
      num: "1.2.2.2",
      title:
        "Si la operación debe realizarse en TSA o está condicionada a la publicación previa de NOTAM, se confirma que la correcta publicación del NOTAM informado de la TSA o actividad con UAS",
      key: "tsaPreviaNotam",
      level: 2,
    },
    { num: "1.2.2", title: "Si la operación se lleva a cabo en espacio aéreo controlado o FIZ", level: 1, inputType: "title", bold: true },
    { num: "1.2.3.1", title: "Se cumplen con los procedimientos acorddados con el ATSP", key: "procedimientosATSP", level: 2 },
  ],
  seccion2: [
    { num: "2.1", title: "Se han comprobado las condiciones ambientales y climatológicas", level: 0, inputType: "title", bold: true },
    {
      num: "2.1.1",
      title:
        "Las condiciones climatológicas no exceden los máximos previtos por el operador y/o por el fabricante del UAS para llevar a cabo la operación",
      key: "condicionesClimatologicas",
      level: 1,
    },
  ],
  seccion3: [
    { num: "3.1", title: "Se dispone del número mínimo de miembros de la tripulación necesarios para realizar la operación", level: 0, inputType: "title", bold: true },
    { num: "3.1.1", title: "El personal conoce sus funciones y responsabilidades dentro de la operación prevista", key: "personalSabeFunciones", level: 1 },
  ],
  seccion4: [
    {
      num: "4.1",
      title:
        "Se dispone de los procedimientos y equipos requeridos para la comunicación entre el personal a cargo de las tareas esenciales para la operación del UAS y funcionan correctamente",
      key: "comunicacionEntrePersonal",
      level: 1,
    },
    {
      num: "4.2",
      title:
        "Se dispone de los procedimientos y equipso requeridos para la comunicaicón con terceras partes cuando sea necesario y funcionan correctamente",
      key: "comunicacion3Partes",
      level: 1,
    },
  ],
  seccion5: [
    {
      num: "5.1",
      title: "Se cumplen los requisitos específicos relacionados con la seguridad, la privacidad, los datos de carácter personal",
      key: "requisitosSeguridad",
      level: 1,
    },
    { num: "5.2", title: "Se cumplen los requisitos específicos relacionados con la protección del medio ambiente", key: "requisitosMedioAmbiente", level: 1 },
    { num: "5.3", title: "Se cumplen los requisitos específicos relacionados con el uso del espectro radioeléctrico", key: "requisitosRadioelectrico", level: 1 },
    { num: "5.4", title: "Si se realizan operaciones transfronterizas se cumplen los reqisitos locales específicos", key: "requisitosLocalesEspecificos", level: 1 },
  ],
  seccion6: [
    { num: "6.1", title: "Las atenuaciones del GRC están implementadas", key: "atenuacionesGRC", level: 0 },
    { num: "6.2", title: "Las atenuaciones del ARC están implementadas", key: "atenuacionesARC", level: 0 },
  ],
  seccion7: [
    { num: "7.1", title: "Se han realizado las comprobaciones necesarias (lista de verificación de la aeronave) y es apta para el vuelo", key: "comprobacionesUasVuelo", level: 0 },
  ],
};

function SectionTitle({ children }: { children: string }) {
  return <h4 className="fw-bold mt-5 mb-3 pb-2 border-bottom text-success">{children}</h4>;
}

function normalizeInitialValues(values: Anexo5Data | null | undefined): FormValues {
  if (!values) return { ...DEFAULT_VALUES };

  const normalizeDateTimeLocal = (value: string | null | undefined) => {
    if (!value) return "";
    const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
    return match ? match[1] : value;
  };

  const normalized = { ...DEFAULT_VALUES };
  FORM_FIELDS.forEach((key) => {
    const value = values[key];
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
  return normalized;
}

export default function FormOperationAnexo5Detail({
  operationId,
  initialValues,
  disabled,
  readOnlyMessage,
  onSaved,
}: FormOperationAnexo5DetailProps) {
  const [formValues, setFormValues] = useState<FormValues>(() => normalizeInitialValues(initialValues));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormValues(normalizeInitialValues(initialValues));
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

      const savedData = await saveAnexo5Data(operationId, formData);
      alert("Anexo 5 guardado correctamente");
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

  const renderApartadoRow = (item: SectionItem) => {
    const paddingLeft = item.level === 0 ? 0 : item.level === 1 ? "2rem" : "3.5rem";

    const bullet =
      item.level === 0 ? null : item.level === 1 ? (
        <span className="me-2 text-muted small">•</span>
      ) : (
        <span className="me-2 text-muted small">◦</span>
      );

    const baseTextClass =
      item.level === 0 ? "text-dark" : item.level === 2 ? "text-secondary small fst-italic" : "text-secondary small";

    const textClass = baseTextClass + (item.bold ? " fw-bold" : "");

    // ✅ modo "title" => solo texto, sin select
    if (item.inputType === "title") {
      return (
        <div
          key={`title-${item.num}-${item.title}`}
          className="d-flex align-items-center mb-1 py-2 border-bottom border-light"
          style={{ paddingLeft }}
        >
          <div className="d-flex align-items-baseline">
            {bullet}
            <div className={textClass}>
              {item.num}. {item.title}
            </div>
          </div>
        </div>
      );
    }

    const value = item.key ? formValues[item.key] ?? "" : "";

    return (
      <div
        key={item.key ?? `${item.num}-${item.title}`}
        className="d-flex align-items-center justify-content-between mb-1 py-2 border-bottom border-light"
        style={{ paddingLeft }}
      >
        <div className="d-flex align-items-baseline">
          {bullet}
          <div className={textClass}>
            {item.num}. {item.title}
          </div>
        </div>

        <div className="ms-3">
          {item.key ? (
            <select
              className="form-select form-select-sm d-inline-block w-auto"
              value={value}
              onChange={(e) => handleChange(item.key!, e.target.value)}
              disabled={disabled || saving}
              style={{ minWidth: "120px" }}
            >
              {BOOL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h3 className="fw-bold mb-1 text-dark">APÉNDICE 5 - LISTA VERIFICACIÓN PREVUELO OPERACIONAL</h3>
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
                <label className="form-label fw-bold small text-uppercase text-muted">CONOPS</label>
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

            <SectionTitle>SECCIÓN 1: Lugar de la operación</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">{SECCIONES_CONFIG.seccion1.map(renderApartadoRow)}</div>

            <SectionTitle>SECCIÓN 2: Condiciones ambientales y climatológicas</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">{SECCIONES_CONFIG.seccion2.map(renderApartadoRow)}</div>

            <SectionTitle>SECCIÓN 3: Personal</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">{SECCIONES_CONFIG.seccion3.map(renderApartadoRow)}</div>

            <SectionTitle>SECCIÓN 4: Procedimientos de comunicación</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">{SECCIONES_CONFIG.seccion4.map(renderApartadoRow)}</div>

            <SectionTitle>SECCIÓN 5: Requisitos adicionales</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">{SECCIONES_CONFIG.seccion5.map(renderApartadoRow)}</div>

            <SectionTitle>SECCIÓN 6: Atenuaciones al riesgo</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">{SECCIONES_CONFIG.seccion6.map(renderApartadoRow)}</div>

            <SectionTitle>SECCIÓN 7: El UAS está en condiciones adecuadas para operar</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">{SECCIONES_CONFIG.seccion7.map(renderApartadoRow)}</div>

            <SectionTitle>SECCIÓN 8: Aptitud para operar</SectionTitle>

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