import { useEffect, useState } from "react";
import {
  saveAnexo8Data,
  type Anexo8Data,
  type ExpandableTableItem,
} from "../operations/operation.api";
import { SectionTitle } from "../commons/SectionTitle";
import { ApartadoRow, type SectionItem } from "../commons/ApartadoRow";
import { AnexoFormLayout } from "../commons/AnexoFormLayout";
import { useAnexoForm } from "../commons/hooks/useAnexoForm";
import { TablaExpandible } from "./TablaExpandible";
import ConfirmModal from "../commons/ConfirmModal";

type FormOperationAnexo8DetailProps = {
  operationId: number;
  initialValues?: Anexo8Data | null;
  sharedConops?: string;
  fallbackFechaOp?: string;
  disabled?: boolean;
  readOnlyMessage?: React.ReactNode;
  onSaved?: (savedData: Anexo8Data | null) => void | Promise<void>;
};

const FORM_FIELDS = [
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

const DEFAULT_VALUES = FORM_FIELDS.reduce(
  (acc, key) => ({ ...acc, [key]: "" }),
  {} as Record<FormKey, string>,
);

const SECCIONES_CONFIG: { seccion1: SectionItem[]; seccion2: SectionItem[] } = {
  seccion1: [
    { num: "1.1", title: "Si la operación se lleva a cabo en espacio aéreo controlado o FIZ", inputType: "title", level: 0, bold: true},
    { num: "1.1.1", title: "Se cierran las operaciones confomre a las condiciones acordadas con el ATSP", key: "condicionesATSP", level: 1},
    { num: "1.2", title: "Otras condiciones", inputType: "title", level: 0, bold: true},
    {
      num: "1.2.1",
      title: "Comunicación a terceros de la finalización de operaciones",
      key: "comunicacion3FinalizacionOperacion",
      level: 1,
    },
    { num: "1.2.2", title: "Comunicación imágenes tomadas en ZRVF al CECAF", key: "comunicacionZrvfCecaf", level: 1 },
  ],
  seccion2: [
    { num: "2.1", title: "Registros de actividad de vuelo", inputType: "title", level: 0, bold: true},
    { num: "2.1.1", title: "Anotación de tiempos de vuelo de aeronave", key: "anotacionTiempoVueloAeronave", level: 1 },
    { num: "2.1.2", title: "Anotación de tiempos de actividad del personal", key: "anotacionTIempoActividadPersonal", level: 1 },
    { num: "2.2", title: "Registro y comunicación de eventos significativos", inputType: "title", level: 0, bold: true},
    {
      num: "2.2.1",
      title: "Anotación eventos ocurridos en operación",
      key: "anotacionEventosOcurridosOperacion",
      level: 1,
    },
    { num: "2.2.2", title: "Comunicación de incidentes", key: "comunicacionIncidentes", level: 1 },
  ],
};

export default function FormOperationAnexo8Detail({
  operationId,
  initialValues,
  sharedConops,
  fallbackFechaOp,
  disabled,
  readOnlyMessage,
  onSaved,
}: FormOperationAnexo8DetailProps) {
  const { formValues, setFormValues, saving, setSaving, handleChange } = useAnexoForm({
    fields: FORM_FIELDS,
    defaultValues: DEFAULT_VALUES,
    initialValues: initialValues as Record<string, unknown> | null | undefined,
  });
  const [otrasLimitacionesItems, setOtrasLimitacionesItems] =
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
    if (!initialValues || !Array.isArray(initialValues.otrasLimitacionesItems)) {
      setOtrasLimitacionesItems([]);
      return;
    }

    const parsedItems = initialValues.otrasLimitacionesItems
      .map((item) => ({
        descripcion: item?.descripcion ?? "",
        valor: item?.valor ?? "N/A",
      }))
      .slice(0, 8);

    setOtrasLimitacionesItems(parsedItems);
  }, [initialValues]);

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

      otrasLimitacionesItems.slice(0, 8).forEach((item, index) => {
        formData.append(
          `otrasLimitacionesItems[${index}].descripcion`,
          item.descripcion,
        );
        formData.append(`otrasLimitacionesItems[${index}].valor`, item.valor);
      });

      const savedData = await saveAnexo8Data(operationId, formData);
      setAlertModal({ show: true, title: "Anexo 8", message: "Anexo 8 guardado correctamente." });
      await onSaved?.(savedData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAlertModal({ show: true, title: "Error", message: err.message || "Error al guardar el anexo." });
      } else {
        setAlertModal({ show: true, title: "Error", message: "Error al guardar el anexo." });
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
      boolLabels={{ unspecified: "N/A" }}
    />
  );

  return (
    <AnexoFormLayout
      title="APÉNDICE 8 - LISTA VERIFICACIÓN POSVUELO OPERACIONAL"
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

      <SectionTitle>SECCIÓN 1: Condiciones y limitaciones de zonas geográficas de UAS</SectionTitle>
      <div className="bg-white border rounded p-3 mb-4 text-start">
        {SECCIONES_CONFIG.seccion1.map(renderApartadoRow)}
      </div>

      <SectionTitle>SECCIÓN 2: Registro de datos de vuelo y eventos</SectionTitle>
      <div className="bg-white border rounded p-3 mb-4 text-start">
        {SECCIONES_CONFIG.seccion2.map(renderApartadoRow)}
      </div>

      <TablaExpandible
        label="2.3 - Otros"
        selectLabel="Elemento"
        items={otrasLimitacionesItems}
        opciones={["N/A", "SI", "NO"]}
        onItemsChange={setOtrasLimitacionesItems}
        numeroBase="2.3"
        mostrarSelectorPrincipal={false}
        mostrarColumnaValor={false}
        descripcionHeader="Descripción"
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
