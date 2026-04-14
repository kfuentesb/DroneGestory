import { useEffect, useState } from "react";
import { saveAnexo7Data, type Anexo7Data } from "../operations/operation.api";

type FormOperationAnexo7DetailProps = {
  operationId: number;
  initialValues?: Anexo7Data | null;
  disabled?: boolean;
  readOnlyMessage?: React.ReactNode;
  onSaved?: (savedData: Anexo7Data | null) => void | Promise<void>;
};

const FORM_FIELDS = [
  "nombreConops",
  "fechaOp",
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
type FormValues = Record<FormKey, string>;

const DEFAULT_VALUES = FORM_FIELDS.reduce(
  (acc, key) => ({ ...acc, [key]: "" }),
  {} as FormValues
);

const BOOL_OPTIONS = [
  { value: "", label: "Sin especificar" },
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

function SectionTitle({ children }: { children: string }) {
  return <h4 className="fw-bold mt-5 mb-3 pb-2 border-bottom text-success">{children}</h4>;
}

export default function FormOperationAnexo7Detail({
  operationId,
  initialValues,
  disabled,
  readOnlyMessage,
  onSaved,
}: FormOperationAnexo7DetailProps) {
  const [formValues, setFormValues] = useState<FormValues>(DEFAULT_VALUES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialValues) return;

    const normalized = { ...DEFAULT_VALUES };
    FORM_FIELDS.forEach((key) => {
      const value = initialValues[key];
      if (value === null || value === undefined) {
        normalized[key] = "";
      } else if (typeof value === "boolean") {
        normalized[key] = String(value);
      } else {
        normalized[key] = String(value);
      }
    });

    setFormValues(normalized);
  }, [initialValues]);

  const handleChange = (key: FormKey, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
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
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <form>
          <SectionTitle>SECCIÓN 1: Verificación del estado de la aeronave</SectionTitle>
          <div className="bg-white border rounded p-3">
            {VERIFICACION_CONFIG.map(renderRow)}
          </div>

          <SectionTitle>SECCIÓN 2: Recogida y almacenaje de todos los elementos desplazados a campo</SectionTitle>
          <div className="bg-white border rounded p-3">
            {RECOGIDA_CONFIG.map(renderRow)}
          </div>
        </form>
      </div>
    </div>
  );
}