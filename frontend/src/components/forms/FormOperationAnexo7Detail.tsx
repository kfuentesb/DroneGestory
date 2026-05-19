import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { saveAnexo7Data, type Anexo7Data } from "../operations/operation.api";
import { SectionTitle } from "../commons/SectionTitle";
import { AnexoFormLayout } from "../commons/AnexoFormLayout";
import { useAnexoForm } from "../commons/hooks/useAnexoForm";

type FormOperationAnexo7DetailProps = {
  operationId: number;
  initialValues?: Anexo7Data | null;
  selectedAircraftId?: number | null;
  sharedConops?: string;
  fallbackFechaOp?: string;
  disabled?: boolean;
  readOnlyMessage?: React.ReactNode;
  onSaved?: (savedData: Anexo7Data | null) => void | Promise<void>;
};

export type FormOperationAnexo7DetailRef = {
  validateFechaOp: () => boolean;
  validateTiempoVuelo: () => boolean;
};

const FORM_FIELDS = [
  "fechaOp",
  "tiempoVueloMinutos",
  "ciclosAterrizaje",
  "estructuraCorrecto",
  "estructuraObservaciones",
  "bateriasCorrecto",
  "bateriasObservaciones",
  "sensoresCorrecto",
  "sensoresObservaciones",
  "motoresCorrecto",
  "motoresObservaciones",
  "helicesCorrecto",
  "helicesObservaciones",
  "partesMovilesCorrecto",
  "partesMovilesObservaciones",
  "comunicacionesCorrecto",
  "comunicacionesObservaciones",
  "plantaPotenciaCorrecto",
  "plantaPotenciaObservaciones",
  "cargaPagoCorrecto",
  "cargaPagoObservaciones",
  "identificacionRemotaCorrecto",
  "identificacionRemotaObservaciones",
  "sistemaGeoconscienciaCorrecto",
  "sistemaGeoconscienciaObservaciones",
  "datosVueloCorrecto",
  "datosVueloObservaciones",
  "otrosVerificacionCorrecto",
  "otrosVerificacionObservaciones",
  "aeronaveCorrecto",
  "aeronaveObservaciones",
  "unidadControlCorrecto",
  "unidadControlObservaciones",
  "sensoresRecogidaCorrecto",
  "sensoresRecogidaObservaciones",
  "antenasCorrecto",
  "antenasObservaciones",
  "otrosRecogidaCorrecto",
  "otrosRecogidaObservaciones",
] as const;

type FormKey = (typeof FORM_FIELDS)[number];

const DEFAULT_VALUES = FORM_FIELDS.reduce(
  (acc, key) => ({ ...acc, [key]: "" }),
  {} as Record<FormKey, string>
);

const BOOL_OPTIONS = [
  { value: "", label: "N/A" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

type CheckItem = { num: string; title: string; key: FormKey; obsKey: FormKey };

const VERIFICACION_CONFIG: CheckItem[] = [
  { num: "1.1", title: "Estructura", key: "estructuraCorrecto", obsKey: "estructuraObservaciones" },
  { num: "1.2", title: "Baterías", key: "bateriasCorrecto", obsKey: "bateriasObservaciones" },
  { num: "1.3", title: "Sensores", key: "sensoresCorrecto", obsKey: "sensoresObservaciones" },
  { num: "1.4", title: "Motores", key: "motoresCorrecto", obsKey: "motoresObservaciones" },
  { num: "1.5", title: "Hélices", key: "helicesCorrecto", obsKey: "helicesObservaciones" },
  { num: "1.6", title: "Partes móviles", key: "partesMovilesCorrecto", obsKey: "partesMovilesObservaciones" },
  { num: "1.7", title: "Comunicaciones", key: "comunicacionesCorrecto", obsKey: "comunicacionesObservaciones" },
  { num: "1.8", title: "Planta de potencia", key: "plantaPotenciaCorrecto", obsKey: "plantaPotenciaObservaciones" },
  { num: "1.9", title: "Carga de pago", key: "cargaPagoCorrecto", obsKey: "cargaPagoObservaciones" },
  { num: "1.10", title: "Identificación remota", key: "identificacionRemotaCorrecto", obsKey: "identificacionRemotaObservaciones" },
  { num: "1.11", title: "Sistema de geoconsciencia", key: "sistemaGeoconscienciaCorrecto", obsKey: "sistemaGeoconscienciaObservaciones" },
  { num: "1.12", title: "Datos obtenidos durante el vuelo", key: "datosVueloCorrecto", obsKey: "datosVueloObservaciones" },
  { num: "1.13", title: "Otros", key: "otrosVerificacionCorrecto", obsKey: "otrosVerificacionObservaciones" },
];

const RECOGIDA_CONFIG: CheckItem[] = [
  { num: "2.1", title: "Aeronave", key: "aeronaveCorrecto", obsKey: "aeronaveObservaciones" },
  { num: "2.2", title: "Unidad de control", key: "unidadControlCorrecto", obsKey: "unidadControlObservaciones" },
  { num: "2.3", title: "Sensores", key: "sensoresRecogidaCorrecto", obsKey: "sensoresRecogidaObservaciones" },
  { num: "2.4", title: "Antenas", key: "antenasCorrecto", obsKey: "antenasObservaciones" },
  { num: "2.5", title: "Otros (generadores, herramientas, manga, viento, etc)", key: "otrosRecogidaCorrecto", obsKey: "otrosRecogidaObservaciones" },
];

const FormOperationAnexo7Detail = forwardRef<FormOperationAnexo7DetailRef, FormOperationAnexo7DetailProps>(function FormOperationAnexo7Detail({
  operationId,
  initialValues,
  selectedAircraftId,
  sharedConops,
  fallbackFechaOp,
  disabled,
  readOnlyMessage,
  onSaved,
}: FormOperationAnexo7DetailProps, ref) {
  const { formValues, setFormValues, saving, setSaving, handleChange } = useAnexoForm({
    fields: FORM_FIELDS,
    defaultValues: DEFAULT_VALUES,
    initialValues: initialValues as Record<string, unknown> | null | undefined,
  });
  const [fechaOpError, setFechaOpError] = useState(false);
  const [tiempoVueloError, setTiempoVueloError] = useState(false);
  const fechaOpInputRef = useRef<HTMLInputElement | null>(null);
  const tiempoVueloInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!fallbackFechaOp) return;
    setFormValues((prev) => (prev.fechaOp ? prev : { ...prev, fechaOp: fallbackFechaOp }));
  }, [fallbackFechaOp, setFormValues]);

  const validateFechaOp = () => {
    if (!formValues.fechaOp) {
      setFechaOpError(true);
      if (fechaOpInputRef.current) {
        fechaOpInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        fechaOpInputRef.current.focus();
      }
      return false;
    }
    return true;
  };

  const validateTiempoVuelo = () => {
    if (formValues.tiempoVueloMinutos === null || formValues.tiempoVueloMinutos === undefined || formValues.tiempoVueloMinutos === "") {
      setTiempoVueloError(true);
      if (tiempoVueloInputRef.current) {
        tiempoVueloInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        tiempoVueloInputRef.current.focus();
      }
      return false;
    }
    return true;
  };

  useImperativeHandle(ref, () => ({
    validateFechaOp,
    validateTiempoVuelo,
  }), [formValues.fechaOp, formValues.tiempoVueloMinutos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (!validateFechaOp() || !validateTiempoVuelo()) {
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      if (selectedAircraftId) {
        formData.append("aircraftId", String(selectedAircraftId));
      }
      FORM_FIELDS.forEach((key) => {
        const value = formValues[key];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      const savedData = await saveAnexo7Data(operationId, formData);
      await onSaved?.(savedData);
    } catch (err: unknown) {
      console.error("Error al guardar el anexo 7:", err);
    } finally {
      setSaving(false);
    }
  };

  const renderRow = (item: CheckItem) => {
    return (
      <div key={item.key} className="border-bottom py-3">
        <div className="fw-bold mb-2">
          {item.num}. {item.title}
        </div>

        <div className="d-flex flex-column flex-md-row gap-3">
          <select
            className="anexo7-check-select form-select form-select-sm"
            value={formValues[item.key]}
            onChange={(e) => handleChange(item.key, e.target.value)}
            disabled={disabled || saving}
            style={{ maxWidth: "160px" }}
          >
            {BOOL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <textarea
            className="form-control form-control-sm"
            value={formValues[item.obsKey]}
            onChange={(e) => handleChange(item.obsKey, e.target.value)}
            disabled={disabled || saving}
            placeholder="Observaciones"
            rows={1}
            style={{ resize: "vertical" }}
          />
        </div>
      </div>
    );
  };

  return (
    <AnexoFormLayout
      title="APÉNDICE 7 - LISTA VERIFICACIÓN POSVUELO UAS"
      disabled={disabled}
      saving={saving}
      readOnlyMessage={readOnlyMessage}
      onSubmit={handleSubmit}
    >
      <SectionTitle>SECCIÓN 0: Información general</SectionTitle>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold small text-uppercase text-muted">CONOPS</label>
          <div style={{ position: "relative" }}>
          <input /** PARA VISUALIZAR QUE NO SE PUEDE EDITAR */
            type="text"
            className="form-control"
            value={sharedConops ?? initialValues?.nombreConops ?? ""}
            disabled
            readOnly
            style={{
              background: "#f5f6fa",           // Gris muy claro
              color: "#888",                   // Texto gris
              fontStyle: "italic",             // Opcional: cursiva para más claridad
              border: "1px solid #e0e0e0",     // Borde suavizado
              boxShadow: "none",               // Sin shadow
              paddingRight: "2.2em",           // Espacio para el candado
            }}
          />
          <span
            style={{
              position: "absolute",
              top: "50%",
              right: "14px",
              transform: "translateY(-50%)",
              color: "#bcbcbc",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center"
            }}
            title="Campo solo lectura"
            aria-label="Campo solo lectura"
          >
            {/* Ícono candado en SVG, 18x18 */}
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 1.5A3.5 3.5 0 0 0 4.5 5v3H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-.5V5A3.5 3.5 0 0 0 8 1.5Zm-2 3.5A2 2 0 0 1 8 3a2 2 0 0 1 2 2v3H6V5Zm-2 5h8a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"/>
            </svg>
          </span>
        </div>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold small text-uppercase text-muted">Fecha operación</label>
          <input
            type="datetime-local"
            className={`form-control bg-white border${fechaOpError ? " is-invalid" : ""}`}
            value={formValues.fechaOp}
            onChange={(e) => {
              if (fechaOpError) {
                setFechaOpError(false);
              }
              handleChange("fechaOp", e.target.value);
            }}
            disabled={disabled || saving}
            ref={fechaOpInputRef}
            aria-invalid={fechaOpError}
            aria-describedby={fechaOpError ? "anexo7-fechaop-error" : undefined}
          />
          {fechaOpError && (
            <div id="anexo7-fechaop-error" className="text-danger small mt-1">
              La fecha de operación es obligatoria.
            </div>
          )}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold small text-uppercase text-muted">Tiempo de vuelo (minutos)</label>
          <input
            type="number"
            min={0}
            className={`form-control bg-white border${tiempoVueloError ? " is-invalid" : ""}`}
            value={formValues.tiempoVueloMinutos ?? ""}
            onChange={(e) => {
              if (tiempoVueloError) {
                setTiempoVueloError(false);
              }
              handleChange("tiempoVueloMinutos", e.target.value);
            }}
            disabled={disabled || saving}
            ref={tiempoVueloInputRef}
            aria-invalid={tiempoVueloError}
            aria-describedby={tiempoVueloError ? "anexo7-tiempovuelo-error" : undefined}
          />
          {tiempoVueloError && (
            <div id="anexo7-tiempovuelo-error" className="text-danger small mt-1">
              El tiempo de vuelo es obligatorio.
            </div>
          )}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold small text-uppercase text-muted">Ciclos de aterrizaje</label>
          <input
            type="number"
            min={0}
            className="form-control bg-white border"
            value={formValues.ciclosAterrizaje ?? ""}
            onChange={(e) => handleChange("ciclosAterrizaje", e.target.value)}
            disabled={disabled || saving}
          />
        </div>
      </div>
      <SectionTitle>SECCIÓN 1: Verificación del estado de la aeronave</SectionTitle>
      <div className="bg-white border rounded p-3">
        {VERIFICACION_CONFIG.map(renderRow)}
      </div>

      <SectionTitle>SECCIÓN 2: Recogida y almacenaje de todos los elementos desplazados a campo</SectionTitle>
      <div className="bg-white border rounded p-3">
        {RECOGIDA_CONFIG.map(renderRow)}
      </div>
    </AnexoFormLayout>
  );
});

export default FormOperationAnexo7Detail;
