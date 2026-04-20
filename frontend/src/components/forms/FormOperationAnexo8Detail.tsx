import { saveAnexo8Data, type Anexo8Data } from "../operations/operation.api";
import { SectionTitle } from "../commons/SectionTitle";
import { ApartadoRow, type SectionItem } from "../commons/ApartadoRow";
import { AnexoFormLayout } from "../commons/AnexoFormLayout";
import { ReadOnlyConopsField } from "../commons/ReadOnlyConopsField";
import { createDefaultFormValues, useAnexoForm } from "../commons/hooks/useAnexoForm";

type FormOperationAnexo8DetailProps = {
  operationId: number;
  initialValues?: Anexo8Data | null;
  sharedConops?: string;
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

const DEFAULT_VALUES = createDefaultFormValues<FormKey>(FORM_FIELDS);

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
    { num: "2.3", title: "Otros", inputType: "title", level: 0, bold: true},
  ],
};

export default function FormOperationAnexo8Detail({
  operationId,
  initialValues,
  sharedConops,
  disabled,
  readOnlyMessage,
  onSaved,
}: FormOperationAnexo8DetailProps) {
  const { formValues, saving, setSaving, handleChange } = useAnexoForm({
    fields: FORM_FIELDS,
    defaultValues: DEFAULT_VALUES,
    initialValues: initialValues as Record<string, unknown> | null | undefined,
  });

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

      const savedData = await saveAnexo8Data(operationId, formData);
      alert("Anexo 8 guardado correctamente");
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
      </div>

      <SectionTitle>SECCIÓN 1: Condiciones y limitaciones de zonas geográficas de UAS</SectionTitle>
      <div className="bg-white border rounded p-3 mb-4 text-start">
        {SECCIONES_CONFIG.seccion1.map(renderApartadoRow)}
      </div>

      <SectionTitle>SECCIÓN 2: Registro de datos de vuelo y eventos</SectionTitle>
      <div className="bg-white border rounded p-3 mb-4 text-start">
        {SECCIONES_CONFIG.seccion2.map(renderApartadoRow)}
      </div>
    </AnexoFormLayout>
  );
}
