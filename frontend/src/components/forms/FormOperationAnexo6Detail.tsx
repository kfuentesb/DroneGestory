import { useEffect, useState } from "react";
import { saveAnexo6Data, type Anexo6Data } from "../operations/operation.api";
import { MaterialesAuxiliaresInput } from "../commons/MaterialesAuxiliaresInput";
import { SectionTitle } from "../commons/SectionTitle";
import { ApartadoRow, type SectionItem } from "../commons/ApartadoRow";
import { AnexoFormLayout } from "../commons/AnexoFormLayout";
import { useAnexoForm } from "../commons/hooks/useAnexoForm";
import OperationConopsField from "../commons/OperationConopsField";

type FormOperationAnexo6DetailProps = {
  operationId: number;
  initialValues?: Anexo6Data | null;
  operationConops?: string;
  disabled?: boolean;
  readOnlyMessage?: React.ReactNode;
  onSaved?: (savedData: Anexo6Data | null) => void | Promise<void>;
};

// Ojo: materialesAuxiliares lo gestionamos a parte como array.
const FORM_FIELDS = [
  "fechaOp",
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

const DEFAULT_VALUES = FORM_FIELDS.reduce((acc, key) => ({ ...acc, [key]: "" }), {} as Record<FormKey, string>);

const BOOL_OPTIONS = [
  { value: "", label: "N/A" },
  { value: "true", label: "Correcto" },
  { value: "false", label: "Incorrecto" },
];

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
  seccion13: SectionItem[];
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
  seccion13: [
        { num: "13.1", title: "Revisión de elementos auxiliares al CONOPS de la operación (Paracaídas, sistema cautivo, etc...)", level: 0, inputType: "title"},
  ]
};

export default function FormOperationAnexo6Detail({
  operationId,
  initialValues,
  operationConops,
  disabled,
  readOnlyMessage,
  onSaved,
}: FormOperationAnexo6DetailProps) {
  const { formValues, saving, setSaving, handleChange } = useAnexoForm({
    fields: FORM_FIELDS,
    defaultValues: DEFAULT_VALUES,
    initialValues: initialValues as Record<string, unknown> | null | undefined,
  });
  const [materialesAuxiliares, setMaterialesAuxiliares] = useState<string[]>([""]);

  useEffect(() => {
    if (!initialValues) {
      setMaterialesAuxiliares([""]);
      return;
    }
    if (Array.isArray(initialValues.materialesAuxiliares)) {
      setMaterialesAuxiliares(
        initialValues.materialesAuxiliares.length > 0
          ? initialValues.materialesAuxiliares
          : [""]
      );
    } else {
      setMaterialesAuxiliares([""]);
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    setSaving(true);
    try {
      const formData = new FormData();

      // Materiales auxiliares como array de strings
      materialesAuxiliares
        .map(m => m.trim())
        .filter(Boolean)
        .forEach(m => formData.append("materialesAuxiliares", m));

      // resto de campos
      FORM_FIELDS.forEach((key) => {
        const value = formValues[key];
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

  const renderApartadoRow = (item: SectionItem) => (
    <ApartadoRow
      key={item.key ?? `title-${item.num}-${item.title}`}
      item={item}
      value={item.key ? formValues[item.key as FormKey] ?? "" : ""}
      onChange={handleChange}
      disabled={disabled || saving}
      opciones={BOOL_OPTIONS}
    />
  );

  return (
    <AnexoFormLayout
      title="APÉNDICE 6 - LISTA VERIFICACIÓN PREVUELO UAS"
      disabled={disabled}
      saving={saving}
      readOnlyMessage={readOnlyMessage}
      onSubmit={handleSubmit}
    >
      <SectionTitle>SECCIÓN 0: Información general</SectionTitle>
      <div className="row">
        <div className="col-md-6 mb-3">
          <OperationConopsField value={operationConops} disabled={disabled || saving} />
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

      <SectionTitle>SECCIÓN 1: Material auxiliar necesario durante la operación</SectionTitle>
      <MaterialesAuxiliaresInput
        value={materialesAuxiliares}
        onChange={setMaterialesAuxiliares}
        disabled={disabled || saving}
      />

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

      <SectionTitle>SECCIÓN 13: CONOPS</SectionTitle>
      <div className="bg-white border rounded p-3 mb-4 text-start">
        {SECCIONES_CONFIG.seccion13.map(renderApartadoRow)}
      </div>

    </AnexoFormLayout>
  );
}
