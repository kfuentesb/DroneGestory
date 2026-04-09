import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";
import type { FieldConfig } from "../commons/fields/FieldConfig";
import { operationAnexo4DetailFields } from "../commons/fields/OperationsAnexo4DetailFields";

/** * CONFIGURACIÓN DE TEXTOS:
 * Modifica solo este objeto para cambiar los nombres de los puntos en el futuro.
 */
const SECCIONES_CONFIG = {
  seccion4: [
    { num: "4.1", title: "Espacio aéreo controlado y en zonas de información de vuelo (FIZ)", key: "espacioAereoControlado", level: 0 },
    { num: "4.1.1", title: "Se cuenta con un estudio aeronáutico coordinado de seguridad específico con el ATSP.", key: "estudioAeronauticoCoordinado", level: 1 },
    { num: "4.2", title: "Entorno aeródromos o helipuertos, civiles o militares", key: "entornoAerodromos", level: 0 },
    { num: "4.2.1", title: "Se mantiene distancia mínima a dichas infraestructuras o se ha realizado una coordinación previa con el gestor de la infraestructura y proveedor ATS si lo hubiera.", key: "distanciaMinimaInfraestructuras", level: 1 },
    { num: "4.3", title: "Zonas prohibidas, restringidas y asociadas a la gestión flexible del espacio aéreo", key: "zonasProhibidasFlexible", level: 0 },
    { num: "4.3.1", title: "Se cumple con las condiciones y limitaciones o se cuenta con la autorización pertinente del gestor del área.", key: "cumpleCondiciones", level: 1 },
    { num: "4.4", title: "Zonas de seguridad militar, de la Defensa Nacional y de la seguridad del Estado", key: "zonasSeguridad", level: 0 },
    { num: "4.4.1", title: "Se cuenta con permiso previo y expreso del titular de la zona o del gestor responsable.", key: "permisoPrevioSeguridad", level: 1 },
    { num: "4.5", title: "Instalaciones que prestan servicios esenciales para la comunidad", key: "serviciosEsencialesComunidad", level: 0 },
    { num: "4.5.1", title: "Se cuenta con el permiso previo y expreso del titular de la zona o del gestor responsable.", key: "permisoPrevioServicios", level: 1 },
    { num: "4.6", title: "Entornos urbanos", key: "entornosUrbanos", level: 0 },
    { num: "4.6.1", title: "Se cumplen con las distancias a edificios determinadas en la declaración operacional o autorización.", key: "cumplenDistanciasEdificios", level: 1 },
    { num: "4.6.2", title: "Se ha realizado la comunicación al Ministerio del Interior al menos con 5 días de antelación a la operación.", key: "comunicacionMinisterioInterior", level: 1 },
    { num: "4.7", title: "Zona Restringida al Vuelo Fotográfico (ZRVF)", key: "zonaResVueloFotografico", level: 0 },
    { num: "4.7.1", title: "Se cuenta con el permiso del CECAF para la toma de imágenes.", key: "permisoCecaf", level: 1 },
    { num: "4.8", title: "Zonas de protección medioambiental", key: "zonasProtMedioambiental", level: 0 },
    { num: "4.8.1", title: "Se dispone de coordinación con el gestor del espacio.", key: "disponeCoordGestor", level: 1 },
  ],
  seccion6: [
    { num: "6.1", title: "CONOPS y modelo semántico", key: "conopsYModeloSemantico", level: 0 },
    { num: "6.1.1", title: "Se aplica e identifica el modelo semántico en la zona de vuelo y este se ajusta al CONOPS autorizado.", key: "aplicaModelo", level: 1 },
    { num: "6.1.2", title: "Se define la geografía del vuelo junto con el perfil de vuelos en función del CONOPS (alcance máximo, altura máxima, VLOS/BVLOS...) y los obstáculos y orografía.", key: "defineGeografiaVueloConops", level: 1 },
    { num: "6.1.3", title: "Se define el volumen de contingencia.", key: "defineVolContigencia", level: 1 },
    { num: "6.1.4", title: "Se define el margen por riesgo en tierra.", key: "defineMargenRiesgoTierra", level: 1 },
    { num: "6.1.5", title: "Se define la zona terrestre controlada y contempla el control de accesos si fuera necesario.", key: "defineZonaTerrestreControlada", level: 1 },
    { num: "6.1.6", title: "Se planifica la ubicación de observadores y/o asistentes.", key: "planificaUbicacionObservadores", level: 1 },
    { num: "6.1.7", title: "Se calcula el área adyacente y se evalúa en riesgo en tierra y en aire.", key: "calculaAreaYEvaluaRiesgo", level: 1 },
    { num: "6.2", title: "NOTAMS", key: "notams", level: 0 },
    { num: "6.2.1", title: "Se revisa los NOTAMS activos y no existen limitaciones a la operación.", key: "revisaNotams", level: 1 },
    { num: "6.2.2", title: "Si la operación debe realizarse en TSA o está condicionada a la publicación  previa de NOTAM, se solicita al COOP de ENAIRE su promulgación", key: "tsaOCondicionada", level: 1 },
    { num: "6.3", title: "Otras limitaciones", key: "otrasLimitaciones", level: 0 },
  ]
};

type FormOperationAnexo4DetailProps = {
  operationId: number;
  operationTitle?: string;
  initialValues?: Record<string, any>;
  disabled?: boolean;
  onSaved?: () => void;
};

type ErrorsMap = Record<string, string | null>;

const BOOL_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

function SectionTitle({ children }: { children: string }) {
  return <h4 className="fw-bold mt-5 mb-3 pb-2 border-bottom text-success">{children}</h4>;
}

export default function FormOperationAnexo4Detail({
  operationId,
  //operationTitle,
  initialValues,
  disabled,
  onSaved,
}: FormOperationAnexo4DetailProps) {
  const fields = useMemo<FieldConfig[]>(() => operationAnexo4DetailFields, []);
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues ?? {});
  const [errors, setErrors] = useState<ErrorsMap>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setFormValues(
        Object.fromEntries(
          Object.entries(initialValues).map(([k, v]) => [
            k,
            v === null || v === undefined ? "" : v instanceof Boolean || typeof v === "boolean" ? String(v) : v,
          ])
        )
      );
    }
  }, [initialValues]);

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const nextErrors: ErrorsMap = {};
    fields.forEach((field) => {
      if (field.validate) {
        const isValid = field.validate(formValues[field.key]);
        if (!isValid) nextErrors[field.key] = field.error || "Campo inválido";
      }
    });
    setErrors(nextErrors);
    return Object.values(nextErrors).every((e) => !e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || !validate()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(formValues).forEach(([key, value]) => {
        if (value instanceof File) {
            formData.append(key, value);
        } else if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
        }
      });

      await apiFetch(`/api/operations/${operationId}/anexo4`, {
        method: "POST",
        body: formData,
      });

      alert("Anexo 4 guardado correctamente");
      onSaved?.();
      // window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert(err?.message || "Error al guardar el anexo.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Renderiza una fila basándose en el objeto de configuración.
   * Mantiene el texto pegado a la izquierda y subniveles con sangría.
   */
  const renderApartadoRow = (item: any) => {
    const value = formValues[item.key] ?? "";
    const error = errors[item.key];
    
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
            className={`form-select form-select-sm d-inline-block w-auto ${error ? "is-invalid" : ""}`}
            value={value}
            onChange={(e) => handleChange(item.key, e.target.value)}
            disabled={disabled || saving}
            style={{ minWidth: "120px" }}
          >
            {BOOL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))} 
          </select>
          {error && <div className="invalid-feedback d-block small">{error}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h3 className="fw-bold mb-1 text-dark">APÉNDICE 4 - LISTA DE VERIFICACIÓN PLANIFICACIÓN OPERACIONAL</h3>
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
            {/* SECCIÓN 1 */}
            <SectionTitle>SECCIÓN 1: Información sobre las operaciones</SectionTitle>
            <div className="mb-3">
              <label className="form-label fw-bold small text-uppercase text-muted">Descripción de objetivos</label>
              <textarea
                className="form-control bg-white border"
                rows={3}
                value={formValues.descripcion ?? ""}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                disabled={disabled || saving}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold small text-uppercase text-muted">Personal necesario</label>
              <input
                  type="text"
                  className="form-control bg-white border"
                  value={formValues.personal ?? ""}
                  onChange={(e) => handleChange("personal", e.target.value)}
                  disabled={disabled || saving}
                />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small text-uppercase text-muted">Fechas y horas previstas</label>
                <input
                  type="datetime-local"
                  className="form-control bg-white border"
                  value={formValues.fechaHoraPrevista ?? ""}
                  onChange={(e) => handleChange("fechaHoraPrevista", e.target.value)}
                  disabled={disabled || saving}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small text-uppercase text-muted">Medios materiales</label>
                <input
                  type="text"
                  className="form-control bg-white border"
                  value={formValues.mediosMateriales ?? ""}
                  onChange={(e) => handleChange("mediosMateriales", e.target.value)}
                  disabled={disabled || saving}
                />
              </div>
            </div>

            {/* SECCIÓN 2 */}
            <SectionTitle>SECCIÓN 2: Evaluación del escenario de operaciones</SectionTitle>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small text-uppercase text-muted">Dirección</label>
                <input
                  type="text"
                  className="form-control bg-white border"
                  value={formValues.direccion ?? ""}
                  onChange={(e) => handleChange("direccion", e.target.value)}
                  disabled={disabled || saving}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small text-uppercase text-muted">Coordenadas</label>
                <input
                  type="text"
                  className="form-control bg-white border"
                  value={formValues.coords ?? ""}
                  onChange={(e) => handleChange("coords", e.target.value)}
                  disabled={disabled || saving}
                />
              </div>
            </div>

            {/* SECCIÓN 3 */}
            <SectionTitle>SECCIÓN 3: Espacio aéreo</SectionTitle>
            <div className="mb-3 border rounded p-3 bg-white">
              <label className="form-label fw-bold small text-uppercase text-muted">Imagen del espacio aéreo</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => handleChange("imagenEspacioAereo", e.target.files?.[0] ?? null)}
                disabled={disabled || saving}
              />
            </div>

            {/* SECCIÓN 4 */}
            <SectionTitle>SECCIÓN 4: Zonas geográficas de UAS</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion4.map(renderApartadoRow)}
            </div>

            {/* SECCIÓN 5 */}
            <SectionTitle>SECCIÓN 5: Zona de vuelo</SectionTitle>
            <div className="mb-3 p-3 bg-white rounded border shadow-none">
              <label className="form-label fw-bold text-uppercase small text-muted">Imagen zona de vuelo</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => handleChange("imagenZonaVuelo", e.target.files?.[0] ?? null)}
                disabled={disabled || saving}
              />
              <div className="form-text mt-2">Adjunte el mapa detallado de la zona de operación.</div>
            </div>

            {/* SECCIÓN 6 */}
            <SectionTitle>SECCIÓN 6: Requisitos y limitaciones en la zona de vuelo</SectionTitle>
            <div className="bg-white border rounded p-3 mb-4 text-start">
              {SECCIONES_CONFIG.seccion6.map(renderApartadoRow)}
            </div>

            <div className="d-flex justify-content-end mt-5 pt-3 border-top">
              <button type="submit" className="btn btn-success btn-lg px-5 shadow-sm" disabled={disabled || saving}>
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
        {disabled && (
          <div className="alert alert-secondary mt-4">
            El anexo está firmado. No se puede editar. Pulsa <strong>Rehacer versión</strong> para poder modificar.
          </div>
        )}
      </div>
    </div>
  );
}