import { saveAnexo7Data, type Anexo7Data } from "../operations/operation.api";
import { SectionTitle } from "../commons/SectionTitle";
import { AnexoFormLayout } from "../commons/AnexoFormLayout";
import { ReadOnlyConopsField } from "../commons/ReadOnlyConopsField";
import { createDefaultFormValues, useAnexoForm } from "../commons/hooks/useAnexoForm";

type FormOperationAnexo7DetailProps = {
  operationId: number;
  initialValues?: Anexo7Data | null;
  sharedConops?: string;
  disabled?: boolean;
  readOnlyMessage?: React.ReactNode;
  onSaved?: (savedData: Anexo7Data | null) => void | Promise<void>;
  aircraftSerial?: string;
  aircraftOptions?: string[];
  onAircraftSerialChange?: (serial: string) => void;
};

const FORM_FIELDS = [
  "fechaOp",
  "tiempoDeVuelo",
  "ciclosDeAterrizaje",
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

const DEFAULT_VALUES = createDefaultFormValues<FormKey>(FORM_FIELDS);

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

export default function FormOperationAnexo7Detail({
  operationId,
  initialValues,
  sharedConops,
  disabled,
  readOnlyMessage,
  onSaved,
  aircraftSerial,
  aircraftOptions = [],
  onAircraftSerialChange,
}: FormOperationAnexo7DetailProps) {
  const { formValues, saving, setSaving, handleChange } = useAnexoForm({
    fields: FORM_FIELDS,
    defaultValues: DEFAULT_VALUES,
    initialValues: initialValues as Record<string, unknown> | null | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (!aircraftSerial) {
      alert("Debes seleccionar una aeronave para gestionar el Anexo 7.");
      return;
    }
    if (!/^\d+$/.test(String(formValues.tiempoDeVuelo ?? ""))) {
      alert("El campo tiempo de vuelo es obligatorio y debe ser un número entero.");
      return;
    }
    if (!/^\d+$/.test(String(formValues.ciclosDeAterrizaje ?? ""))) {
      alert("El campo ciclos de aterrizaje es obligatorio y debe ser un número entero.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("serialAeronave", aircraftSerial);
      FORM_FIELDS.forEach((key) => {
        const value = formValues[key];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      const savedData = await saveAnexo7Data(operationId, formData);
      alert("Anexo 7 guardado correctamente");
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

  const renderRow = (item: CheckItem) => {
    return (
      <div key={item.key} className="border-bottom py-3">
        <div className="fw-bold mb-2">
          {item.num}. {item.title}
        </div>

        <div className="d-flex flex-column flex-md-row gap-3">
          <select
            className="form-select form-select-sm"
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
        <div className="col-md-12 mb-3">
          <label className="form-label fw-bold small text-uppercase text-muted">Aeronave (serial)</label>
          <select
            className="form-select"
            value={aircraftSerial ?? ""}
            onChange={(e) => onAircraftSerialChange?.(e.target.value)}
            disabled={disabled || saving}
            required
          >
            <option value="">Seleccionar aeronave</option>
            {aircraftOptions.map((serial) => (
              <option key={serial} value={serial}>
                {serial}
              </option>
            ))}
          </select>
        </div>
        <ReadOnlyConopsField value={sharedConops ?? initialValues?.nombreConops ?? ""} />
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
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold small text-uppercase text-muted">Tiempo de vuelo (minutos)</label>
          <input
            type="number"
            min={0}
            className="form-control bg-white border"
            value={formValues.tiempoDeVuelo}
            onChange={(e) => handleChange("tiempoDeVuelo", e.target.value)}
            disabled={disabled || saving}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold small text-uppercase text-muted">Ciclos de aterrizaje</label>
          <input
            type="number"
            min={0}
            className="form-control bg-white border"
            value={formValues.ciclosDeAterrizaje}
            onChange={(e) => handleChange("ciclosDeAterrizaje", e.target.value)}
            disabled={disabled || saving}
            required
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
}
