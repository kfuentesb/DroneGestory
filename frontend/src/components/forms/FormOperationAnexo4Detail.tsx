import { useEffect, useMemo, useState } from "react";
import { saveAnexo4Data, type Anexo4Data } from "../operations/operation.api";
import type { FieldConfig } from "../details/FieldConfig";
import { operationAnexo4DetailFields } from "../details/operation/OperationsAnexo4DetailFields";
import { SectionTitle } from "../commons/SectionTitle";
import { ApartadoRow, type SectionItem } from "../commons/ApartadoRow";
import { AnexoFormLayout } from "../commons/AnexoFormLayout";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;

/** * CONFIGURACIÓN DE TEXTOS:
 * Modifica solo este objeto para cambiar los nombres de los puntos en el futuro.
 */
const SECCIONES_CONFIG: { seccion4: SectionItem[]; seccion6: SectionItem[] } = {
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
  readOnlyMessage?: React.ReactNode;
  onSaved?: (savedData: Anexo4Data | null) => void | Promise<void>;
};

type ErrorsMap = Record<string, string | null>;

const BOOL_OPTIONS = [
  { value: "", label: "N/A" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

export default function FormOperationAnexo4Detail({
  operationId,
  //operationTitle,
  initialValues,
  disabled,
  readOnlyMessage,
  onSaved,
}: FormOperationAnexo4DetailProps) {
  const fields = useMemo<FieldConfig[]>(() => operationAnexo4DetailFields, []);
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues ?? {});
  const [errors, setErrors] = useState<ErrorsMap>({});
  const [saving, setSaving] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string | null>>({});

  useEffect(() => {
  if (!initialValues) return;

  const normalizeDateTimeLocal = (value: any) => {
    if (!value) return "";
    if (typeof value !== "string") return value;

    // Si viene como "2026-04-09T10:30:00" -> "2026-04-09T10:30"
    // Si viene como "2026-04-09T10:30" lo deja igual.
    const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
    return match ? match[1] : value;
  };

  const normalized = Object.fromEntries(
      Object.entries(initialValues).map(([k, v]) => {
        if (k === "fechaHoraPrevista") {
          return [k, normalizeDateTimeLocal(v)];
        }
        return [
          k,
          v === null || v === undefined
            ? ""
            : v instanceof Boolean || typeof v === "boolean"
              ? String(v)
              : v,
        ];
      })
    );

    setFormValues(normalized);

    // Limpiar las URLs de previsualización previas para que se muestre
    // la imagen guardada en BD después de guardar, firmar o rehacer versión.
    setPreviewUrls((prev) => {
      Object.values(prev).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      return {};
    });
  }, [initialValues]);

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrls((prev) => {
        if (prev[key]) URL.revokeObjectURL(prev[key]!);
        return { ...prev, [key]: url };
      });
    } else if (value == null) {
      setPreviewUrls((prev) => {
        if (prev[key]) URL.revokeObjectURL(prev[key]!);
        return { ...prev, [key]: null };
      });
    }
  };

  // Revoke all object URLs when the component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      const savedData = await saveAnexo4Data(operationId, formData);

      alert("Anexo 4 guardado correctamente");
      await onSaved?.(savedData);
      // window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert(err?.message || "Error al guardar el anexo.");
    } finally {
      setSaving(false);
    }
  };

  const renderApartadoRow = (item: SectionItem) => (
    <ApartadoRow
      key={item.key ?? `title-${item.num}-${item.title}`}
      item={item}
      value={item.key ? formValues[item.key] ?? "" : ""}
      onChange={handleChange}
      disabled={disabled || saving}
      error={item.key ? errors[item.key] : undefined}
      opciones={BOOL_OPTIONS}
    />
  );

  return (
    <AnexoFormLayout
      title="APÉNDICE 4 - LISTA DE VERIFICACIÓN PLANIFICACIÓN OPERACIONAL"
      disabled={disabled}
      saving={saving}
      readOnlyMessage={readOnlyMessage}
      onSubmit={handleSubmit}
    >
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
          accept="image/jpeg,image/jpg,image/png"
          className="form-control"
          onChange={(e) => handleChange("imagenEspacioAereoFile", e.target.files?.[0] ?? null)}
          disabled={disabled || saving}
        />
        {errors.imagenEspacioAereoFile && (
          <div className="text-danger small mt-1">{errors.imagenEspacioAereoFile}</div>
        )}
        {/* Preview: newly selected file */}
        {previewUrls.imagenEspacioAereoFile && (
          <div className="mt-2">
            <img
              src={previewUrls.imagenEspacioAereoFile}
              alt="Vista previa espacio aéreo"
              className="img-fluid rounded border"
              style={{ maxHeight: "220px", objectFit: "contain" }}
            />
          </div>
        )}
        {/* Preview: existing saved image */}
        {!previewUrls.imagenEspacioAereoFile && formValues.imagenEspacioAereo && (
          <div className="mt-2">
            <p className="small text-muted mb-1">Imagen guardada:</p>
            <img
              src={`${API_BASE_URL}/api/operations/anexo4/images/${formValues.imagenEspacioAereo}`}
              alt="Espacio aéreo guardado"
              className="img-fluid rounded border"
              style={{ maxHeight: "220px", objectFit: "contain" }}
            />
          </div>
        )}
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
          accept="image/jpeg,image/jpg,image/png"
          className="form-control"
          onChange={(e) => handleChange("imagenZonaVueloFile", e.target.files?.[0] ?? null)}
          disabled={disabled || saving}
        />
        {errors.imagenZonaVueloFile && (
          <div className="text-danger small mt-1">{errors.imagenZonaVueloFile}</div>
        )}
        <div className="form-text mt-2">Adjunte el mapa detallado de la zona de operación.</div>
        {/* Preview: newly selected file */}
        {previewUrls.imagenZonaVueloFile && (
          <div className="mt-2">
            <img
              src={previewUrls.imagenZonaVueloFile}
              alt="Vista previa zona de vuelo"
              className="img-fluid rounded border"
              style={{ maxHeight: "220px", objectFit: "contain" }}
            />
          </div>
        )}
        {/* Preview: existing saved image */}
        {!previewUrls.imagenZonaVueloFile && formValues.imagenZonaVuelo && (
          <div className="mt-2">
            <p className="small text-muted mb-1">Imagen guardada:</p>
            <img
              src={`${API_BASE_URL}/api/operations/anexo4/images/${formValues.imagenZonaVuelo}`}
              alt="Zona de vuelo guardada"
              className="img-fluid rounded border"
              style={{ maxHeight: "220px", objectFit: "contain" }}
            />
          </div>
        )}
      </div>

      {/* SECCIÓN 6 */}
      <SectionTitle>SECCIÓN 6: Requisitos y limitaciones en la zona de vuelo</SectionTitle>
      <div className="bg-white border rounded p-3 mb-4 text-start">
        {SECCIONES_CONFIG.seccion6.map(renderApartadoRow)}
      </div>
    </AnexoFormLayout>
  );
}
