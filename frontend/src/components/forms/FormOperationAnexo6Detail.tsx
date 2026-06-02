import { useEffect, useState } from "react";
import {
  saveAnexo6Data,
  type Anexo6Data,
  type ExpandableTableItem,
} from "../operations/operation.api";
import { MaterialesAuxiliaresInput } from "../commons/MaterialesAuxiliaresInput";
import { SectionTitle } from "../commons/SectionTitle";
import { ApartadoRow, type SectionItem } from "../commons/ApartadoRow";
import { AnexoFormLayout } from "../commons/AnexoFormLayout";
import { useAnexoForm } from "../commons/hooks/useAnexoForm";
import { TablaExpandible } from "./TablaExpandible";
import ConfirmModal from "../commons/ConfirmModal";

type FormOperationAnexo6DetailProps = {
  operationId: number;
  initialValues?: Anexo6Data | null;
  selectedAircraftId?: number | null;
  sharedConops?: string;
  fallbackFechaOp?: string;
  disabled?: boolean;
  readOnlyMessage?: React.ReactNode;
  onSaved?: (savedData: Anexo6Data | null) => void | Promise<void>;
  onSaveSettled?: () => void;
  suppressSuccessAlert?: boolean;
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

export default function FormOperationAnexo6Detail({
  operationId,
  initialValues,
  selectedAircraftId,
  sharedConops,
  fallbackFechaOp,
  disabled,
  readOnlyMessage,
  onSaved,
  onSaveSettled,
  suppressSuccessAlert,
}: FormOperationAnexo6DetailProps) {
  const { formValues, setFormValues, saving, setSaving, handleChange } = useAnexoForm({
    fields: FORM_FIELDS,
    defaultValues: DEFAULT_VALUES,
    initialValues: initialValues as Record<string, unknown> | null | undefined,
  });
  const [materialesAuxiliares, setMaterialesAuxiliares] = useState<string[]>([""]);
  const [elementosAuxiliaresItems, setElementosAuxiliaresItems] =
    useState<ExpandableTableItem[]>([]);
  const [alertModal, setAlertModal] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!fallbackFechaOp) return;
    setFormValues((prev) => (prev.fechaOp ? prev : { ...prev, fechaOp: fallbackFechaOp }));
  }, [fallbackFechaOp, setFormValues]);

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

  useEffect(() => {
    if (!initialValues || !Array.isArray(initialValues.elementosAuxiliaresItems)) {
      setElementosAuxiliaresItems([]);
      return;
    }

    const parsedItems = initialValues.elementosAuxiliaresItems
      .map((item) => ({
        descripcion: item?.descripcion ?? "",
        valor: item?.valor ?? "N/A",
      }))
      .slice(0, 8);

    setElementosAuxiliaresItems(parsedItems);
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    setSaving(true);
    try {
      const formData = new FormData();
      if (selectedAircraftId) {
        formData.append("aircraftId", String(selectedAircraftId));
      }

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

      elementosAuxiliaresItems.slice(0, 8).forEach((item, index) => {
        formData.append(
          `elementosAuxiliaresItems[${index}].descripcion`,
          item.descripcion,
        );
        formData.append(`elementosAuxiliaresItems[${index}].valor`, item.valor);
      });

      const savedData = await saveAnexo6Data(operationId, formData);
      if (!suppressSuccessAlert) {
        setAlertModal({ show: true, title: "Anexo 6", message: "Anexo 6 guardado correctamente." });
      }
      await onSaved?.(savedData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAlertModal({ show: true, title: "Error", message: err.message || "Error al guardar el anexo." });
      } else {
        setAlertModal({ show: true, title: "Error", message: "Error al guardar el anexo." });
      }
    } finally {
      setSaving(false);
      onSaveSettled?.();
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
      <TablaExpandible
        label="13.1 - Elementos auxiliares de verificación del CONOPS"
        selectLabel="Elemento"
        items={elementosAuxiliaresItems}
        opciones={["N/A", "Correcto", "Incorrecto"]}
        onItemsChange={setElementosAuxiliaresItems}
        numeroBase="13.1"
        mostrarSelectorPrincipal={false}
        mostrarColumnaValor={false}
        descripcionHeader="Elemento auxiliar"
        valorHeader="Resultado"
        maxItems={8}
        disabled={disabled || saving}
      />
      <ConfirmModal
        show={alertModal.show}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={() => setAlertModal({ show: false, title: "", message: "" })}
        onCancel={() => setAlertModal({ show: false, title: "", message: "" })}
        variant="warning"
      />

    </AnexoFormLayout>
  );
}
