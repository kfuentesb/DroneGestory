import { useEffect, useState } from "react";
import { saveAnexo5Data, signAnexo5Data, type Anexo5Data } from "../operations/operation.api";
import { SectionTitle } from "../commons/SectionTitle";
import { ApartadoRow, type SectionItem } from "../commons/ApartadoRow";
import { AnexoFormLayout } from "../commons/AnexoFormLayout";
import { useAnexoForm } from "../commons/hooks/useAnexoForm";
import { useAuth } from "../commons/hooks/useAuth";
import ConfirmModal from "../commons/ConfirmModal";

type FormOperationAnexo5DetailProps = {
  operationId: number;
  initialValues?: Anexo5Data | null;
  sharedConops?: string;
  fallbackFechaOp?: string;
  disabled?: boolean;
  readOnlyMessage?: React.ReactNode;
  onSaved?: (savedData: Anexo5Data | null) => void | Promise<void>;
};

const FORM_FIELDS = [
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

const DEFAULT_VALUES = FORM_FIELDS.reduce((acc, key) => ({ ...acc, [key]: "" }), {} as Record<FormKey, string>);

const BOOL_OPTIONS = [
  { value: "", label: "N/A" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

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

export default function FormOperationAnexo5Detail({
  operationId,
  initialValues,
  sharedConops,
  fallbackFechaOp,
  disabled,
  readOnlyMessage,
  onSaved,
}: FormOperationAnexo5DetailProps) {
  const { username } = useAuth();
  const { formValues, setFormValues, saving, setSaving, handleChange } = useAnexoForm({
    fields: FORM_FIELDS,
    defaultValues: DEFAULT_VALUES,
    initialValues: initialValues as Record<string, unknown> | null | undefined,
  });
  const [signingAptitud, setSigningAptitud] = useState(false);
  const [alertModal, setAlertModal] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!fallbackFechaOp) return;
    setFormValues((prev) => (prev.fechaOp ? prev : { ...prev, fechaOp: fallbackFechaOp }));
  }, [fallbackFechaOp, setFormValues]);

  const assignedPersonnel = initialValues?.assignedPersonnel ?? [];
  const currentUserAssignedEntry = assignedPersonnel.find((person) => person.username === username);

  const handleSignCurrentUser = async () => {
    if (disabled || !initialValues?.id) {
      return;
    }

    setSigningAptitud(true);
    try {
      const signedData = await signAnexo5Data(operationId, initialValues.id);
      setAlertModal({ show: true, title: "Anexo 5", message: "Firma registrada correctamente." });
      await onSaved?.(signedData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAlertModal({ show: true, title: "Error", message: err.message || "Error al registrar la firma." });
      } else {
        setAlertModal({ show: true, title: "Error", message: "Error al registrar la firma." });
      }
    } finally {
      setSigningAptitud(false);
    }
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
      setAlertModal({ show: true, title: "Anexo 5", message: "Anexo 5 guardado correctamente." });
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
      boolLabels={{ unspecified: "N/A"}}
    />
  );

  return (
    <AnexoFormLayout
      title="APÉNDICE 5 - LISTA VERIFICACIÓN PREVUELO OPERACIONAL"
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
      <div className="bg-white border rounded p-3 mb-4 text-start">
        {assignedPersonnel.length === 0 ? (
          <div className="alert alert-secondary mb-0">
            No hay personal asignado en Anexo 4 para firmar la aptitud para operar.
          </div>
        ) : (
          <>
            <div className="table-responsive mb-3">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Personal asignado</th>
                    <th>Roles</th>
                    <th>Estado de firma</th>
                    <th>Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedPersonnel.map((person) => (
                    <tr key={person.id}>
                      <td>{person.fullName}</td>
                      <td>{person.roles.join(", ")}</td>
                      <td>
                        <span className="d-inline-flex align-items-center gap-2">
                          {person.signed ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <circle cx="8" cy="8" r="7" stroke="#16A34A" strokeWidth="1.5" fill="#DCFCE7" />
                              <path d="M5 8.2l1.9 1.9L11 6" stroke="#166534" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <circle cx="8" cy="8" r="7" stroke="#D97706" strokeWidth="1.5" fill="#FEF3C7" />
                              <path d="M8 4.6v3.7l2.2 1.2" stroke="#92400E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          <span>{person.signed ? "Firmado" : "Pendiente"}</span>
                        </span>
                      </td>
                      <td>
                        {currentUserAssignedEntry?.id === person.id && initialValues?.id && !person.signed ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => void handleSignCurrentUser()}
                            disabled={disabled || saving || signingAptitud}
                          >
                            {signingAptitud ? "Firmando..." : "Firmar"}
                          </button>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!initialValues?.id ? (
              <div className="text-muted small">
                Guarda el borrador para habilitar la firma en esta sección.
              </div>
            ) : !currentUserAssignedEntry ? (
              <div className="text-muted small">
                Solo el personal asignado en Anexo 4 puede firmar su recuadro.
              </div>
            ) : currentUserAssignedEntry.signed ? (
              <span
                className="badge"
                style={{ backgroundColor: "#DBEAFE", color: "#1D4ED8", border: "1px solid #93C5FD" }}
              >
                Ya has firmado tu aptitud para operar
              </span>
            ) : (
              <div className="text-muted small">
                Usa el boton "Firmar" de tu fila para registrar la aptitud.
              </div>
            )}
          </>
        )}
      </div>
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
