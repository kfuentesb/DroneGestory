import { useState } from "react";
import InsertDoc from "../commons/InsertDoc";
import { InfoBadge } from "../commons/InfoBadge";
import MultipleAdditionalsComponent from "../commons/MultipleAdditionalsComponent";

export type AircraftDocumentationFieldConfig = {
  key: string;
  label: string;
  enabledKey: string;
  fileKey: string;
  dateKey: string;
  indefiniteKey: string;
  infoLabel: string;
};

export const OTHER_AIRCRAFT_DOCUMENTATION_KEY = "otraDocumentacion";


export type AircraftSummaryItem = {
  key: string;
  certificateType: string;
  expireDate?: string;
  dateIndefinite?: boolean;
  hasFile?: boolean;
  onOpen?: () => void;
  isModelDefault?: boolean;
  fileName?: string;
};

export type AdditionalDoc = {
  id: string;
  existingDocumentationId?: number;
  label: string;
  certificate: File | null;
  dateExpire: string | null;
  dateIndefinite: boolean | null;
};

export const aircraftDocumentationFields: AircraftDocumentationFieldConfig[] = [
  {
    key: "caracterizacion",
    label: "Caracterización",
    enabledKey: "chkCaracterizacion",
    fileKey: "fileCaracterizacion",
    dateKey: "dateCaracterizacion",
    indefiniteKey: "indefiniteCaracterizacion",
    infoLabel: "Siempre | Expecifica",
  },
  {
    key: "manualUsuario",
    label: "Manual de usuario",
    enabledKey: "chkManualUsuario",
    fileKey: "fileManualUsuario",
    dateKey: "dateManualUsuario",
    indefiniteKey: "indefiniteManualUsuario",
    infoLabel: "Siempre | Modelo",
  },
  {
    key: "manualMantenimiento",
    label: "Manual de mantenimiento",
    enabledKey: "chkManualMantenimiento",
    fileKey: "fileManualMantenimiento",
    dateKey: "dateManualMantenimiento",
    indefiniteKey: "indefiniteManualMantenimiento",
    infoLabel: "Siempre | Modelo",
  },
  {
    key: "seguroResponsabilidadCivil",
    label: "Seguro de responsabilidad civil",
    enabledKey: "chkSeguroRC",
    fileKey: "fileSeguroRC",
    dateKey: "dateSeguroRC",
    indefiniteKey: "indefiniteSeguroRC",
    infoLabel: "Condicional | Específica",
  },
  {
    key: "manualUsuarioFTS",
    label: "Manual de usuario FTS",
    enabledKey: "chkManualUsuarioFTS",
    fileKey: "fileManualUsuarioFTS",
    dateKey: "dateManualUsuarioFTS",
    indefiniteKey: "indefiniteManualUsuarioFTS",
    infoLabel: "Condicional | Modelo",
  },
  {
    key: "documentoTecnicoFTS",
    label: "Documento técnico FTS",
    enabledKey: "chkDocTecnicoFTS",
    fileKey: "fileDocTecnicoFTS",
    dateKey: "dateDocTecnicoFTS",
    indefiniteKey: "indefiniteDocTecnicoFTS",
    infoLabel: "Condicional | Modelo",
  },
  {
    key: "manualUsuarioParacaidas",
    label: "Manual de usuario Paracaídas",
    enabledKey: "chkManualUsuarioParacaidas",
    fileKey: "fileManualUsuarioParacaidas",
    dateKey: "dateManualUsuarioParacaidas",
    indefiniteKey: "indefiniteManualUsuarioParacaidas",
    infoLabel: "Condicional | Modelo",
  },
  {
    key: "documentoTecnicoParacaidas",
    label: "Documento técnico Paracaídas",
    enabledKey: "chkDocTecnicoParacaidas",
    fileKey: "fileDocTecnicoParacaidas",
    dateKey: "dateDocTecnicoParacaidas",
    indefiniteKey: "indefiniteDocTecnicoParacaidas",
    infoLabel: "Condicional | Modelo",
  },
  {
    key: OTHER_AIRCRAFT_DOCUMENTATION_KEY,
    label: "Otra documentación",
    enabledKey: "chkOtraDocumentacion",
    fileKey: "fileOtraDocumentacion",
    dateKey: "dateOtraDocumentacion",
    indefiniteKey: "indefiniteOtraDocumentacion",
    infoLabel: "Específica",
  },
];

// Fields that ONLY belong to a specific physical drone
export const AIRCRAFT_SPECIFIC_KEYS = new Set([
  "caracterizacion",
  "seguroResponsabilidadCivil",
  OTHER_AIRCRAFT_DOCUMENTATION_KEY,
]);

// Fields that ONLY belong to the general drone model
export const MODEL_SPECIFIC_KEYS = new Set([
  "manualUsuario",
  "manualMantenimiento",
  "manualUsuarioFTS",
  "documentoTecnicoFTS",
  "manualUsuarioParacaidas",
  "documentoTecnicoParacaidas",
]);

type AircraftDocumentationSectionProps = {
  context: "model" | "aircraft";
  isExistingModel: boolean;
  showInsuranceDocumentation: boolean;
  showFTSDocumentation: boolean;
  showParachuteDocumentation: boolean;
  onlyInsuranceHasDates?: boolean;
  activeChecks: Record<string, boolean>;
  selectedFiles: Record<string, File | null>;
  formValues: Record<string, string>;
  existingFileNames?: Record<string, string>;
  modelDefaultByType?: Record<string, boolean>;
  modelDefaultFileNames?: Record<string, string>;
  onToggleCheck: (id: string, isModel?: boolean) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, id: string, isModel?: boolean) => void;
  onClearFile: (id: string, inputId: string, isModel?: boolean) => void;
  onFormDateChange: (key: string, value: string, isModel?: boolean) => void;
  onRestoreModelDefault?: (fieldKey: string, isModel?: boolean) => void;

  additionalDocs?: AdditionalDoc[];
  existingAdditionalFileNames?: Record<string, string>;
  onAddAdditionalDoc?: () => void;
  onRemoveAdditionalDoc?: (id: string) => void;
  onAdditionalFieldChange?: (id: string, field: keyof AdditionalDoc, value: any) => void;
};

const EXISTING_MODEL_HIDDEN_KEYS = new Set([
  "manualUsuarioFTS",
  "documentoTecnicoFTS",
  "manualUsuarioParacaidas",
  "documentoTecnicoParacaidas",
]);

export function getVisibleAircraftDocumentationFields(
  context: "model" | "aircraft",
  isExistingModel: boolean,
  showInsuranceDocumentation: boolean,
  showFTSDocumentation: boolean,
  showParachuteDocumentation: boolean
): AircraftDocumentationFieldConfig[] {
  return aircraftDocumentationFields.filter((field) => {

    // Si es contexto MODELO, ocultamos lo que es específico de la unidad física
    if (context === "model" && AIRCRAFT_SPECIFIC_KEYS.has(field.key)) {
      return false;
    }

    // si el modelo ya existe. En context "aircraft" queremos que se vean.
    if (context === "model" && isExistingModel && EXISTING_MODEL_HIDDEN_KEYS.has(field.key)) {
      return false;
    }

    // Lógica de Flags (Estos deben mandar en el contexto "aircraft")
    if (!showInsuranceDocumentation && field.key === "seguroResponsabilidadCivil") {
      return false;
    }

    if (!showInsuranceDocumentation && field.key === "seguroResponsabilidadCivil") {
      return false;
    }

    if (!showFTSDocumentation && (field.key === "manualUsuarioFTS" || field.key === "documentoTecnicoFTS")) {
      return false;
    }

    if (!showParachuteDocumentation && (field.key === "manualUsuarioParacaidas" || field.key === "documentoTecnicoParacaidas")) {
      return false;
    }

    return true;
  });
}

export default function AircraftDocumentationSection({
  context,
  isExistingModel,
  showInsuranceDocumentation,
  showFTSDocumentation,
  showParachuteDocumentation,
  onlyInsuranceHasDates = false,
  activeChecks,
  selectedFiles,
  formValues,
  existingFileNames = {},
  modelDefaultByType = {},
  modelDefaultFileNames = {},
  onToggleCheck,
  onFileChange,
  onClearFile,
  onFormDateChange,
  onRestoreModelDefault,

  additionalDocs = [],
  existingAdditionalFileNames = {},
  onAddAdditionalDoc,
  onRemoveAdditionalDoc,
  onAdditionalFieldChange,
}: AircraftDocumentationSectionProps) {
  const [showOptional, setShowOptional] = useState(false);
  const visibleFields = getVisibleAircraftDocumentationFields(context, isExistingModel, showInsuranceDocumentation, showFTSDocumentation, showParachuteDocumentation);
  const isModelContext = context === "model";
  const inputPrefix = isModelContext ? "model" : "aircraft";

  return (
    <div className="mb-3" style={{ marginLeft: "-30px", marginRight: "-30px", paddingLeft: "20px", paddingRight: "20px" }}>
      <div className="p-2 rounded-3 shadow-sm" style={{ backgroundColor: "#F9FAFB", borderLeft: "2px solid #D1D5DB", borderBottom: "2px solid #D1D5DB", borderBottomLeftRadius: "12px", color: "#6B7280" }}>
        
        <button type="button" className="btn btn-success w-100 d-flex justify-content-center align-items-center py-2 shadow-sm border-0"
          style={{ borderRadius: "8px", fontWeight: "600" }}
          onClick={() => setShowOptional(!showOptional)}>
          <span className="me-2">{showOptional ? "−" : "+"}</span>
          {showOptional ? "Ocultar documentación" : "Documentación"}
        </button>

        {showOptional && (
          <div className="mt-3 animate__animated animate__fadeIn">
            {visibleFields.map((field) => {
              // --- LÓGICA ESPECIAL PARA "OTRA DOCUMENTACIÓN" ---
              if (field.key === OTHER_AIRCRAFT_DOCUMENTATION_KEY) {
                return (
                  <MultipleAdditionalsComponent
                    title="Otros"
                    infoText={field.infoLabel}
                    emptyText="No se han añadido documentos adicionales."
                    inputPlaceholder="Nombre del documento (ej: Certificado de Pesaje)"
                    items={additionalDocs}
                    existingFileNames={existingAdditionalFileNames}
                    onAdd={() => onAddAdditionalDoc?.()}
                    onRemove={(id) => onRemoveAdditionalDoc?.(id)}
                    onFieldChange={(id, changedField, value) => onAdditionalFieldChange?.(id, changedField as keyof AdditionalDoc, value)}
                    showDateControls={false}
                  />
                );
              }

              // --- RENDER ESTÁNDAR PARA EL RESTO DE CAMPOS ---
              return (
                <div key={field.key} className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                  <div className="d-flex align-items-center mb-3">
                    <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>{field.label}</h6>
                    <InfoBadge text={field.infoLabel} />
                  </div>
                  <InsertDoc
                    className="mb-2"
                    checkboxLabel={field.label}
                    isChecked={Boolean(activeChecks[field.enabledKey])}
                    onToggleCheck={() => onToggleCheck(field.enabledKey, isModelContext)}
                    fileInputId={`file-upload-${inputPrefix}-${field.fileKey}`}
                    selectedFile={selectedFiles[field.fileKey] ?? null}
                    existingFileName={existingFileNames[field.fileKey]}
                    onFileChange={(e) => onFileChange(e, field.fileKey, isModelContext)}
                    onClearFile={() => onClearFile(field.fileKey, `file-upload-${inputPrefix}-${field.fileKey}`, isModelContext)}
                    expirationDate={formValues[field.dateKey] || ""}
                    onExpirationDateChange={(value) => onFormDateChange(field.dateKey, value, isModelContext)}
                    indefiniteId={`indefinite-${inputPrefix}-${field.indefiniteKey}`}
                    isIndefinite={Boolean(activeChecks[field.indefiniteKey])}
                    onToggleIndefinite={() => onToggleCheck(field.indefiniteKey, isModelContext)}
                    showDateControls={!onlyInsuranceHasDates || field.key === "seguroResponsabilidadCivil"}
                    isModelDefault={Boolean(modelDefaultByType[field.key])}
                    modelDefaultFileName={modelDefaultFileNames[field.fileKey]}
                    isModelSection={isModelContext}
                    onRestoreModelDefault={!isModelContext && onRestoreModelDefault ? () => onRestoreModelDefault(field.fileKey, isModelContext) : undefined}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function AircraftDocumentationSummarySection({ items }: { items: AircraftSummaryItem[] }) {
  return (
    <div className="mt-4 border-top pt-3">

      {items.length === 0 ? (
        <div className="p-3 bg-light rounded text-center border">
          <p className="text-muted mb-0">Sin documentaciones registradas.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Documentación</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.key}>
                  <td className="py-2">
                    <div className="d-flex align-items-center flex-wrap">
                      {/* 1. Categoría/Tipo de Documento */}
                      <span className="text-secondary fw-bold me-2" style={{ fontSize: '0.9rem' }}>
                        {item.certificateType}:
                      </span>

                      {/* 2. Nombre del archivo (clickable si tiene onOpen) */}
                      {item.hasFile && item.onOpen ? (
                        <button
                          type="button"
                          className="btn btn-link p-0 text-start text-success fw-medium text-decoration-none shadow-none me-2"
                          onClick={item.onOpen}
                        >
                          <i className="bi bi-file-earmark-arrow-down me-1"></i>
                          {item.fileName || "Ver documento"}
                        </button>
                      ) : (
                        <span className="text-muted small me-2">Sin archivo</span>
                      )}

                      {/* 3. Badge de "Valor por defecto" */}
                      {item.isModelDefault && (
                        <span className="badge bg-secondary fw-normal me-2" style={{ fontSize: '0.75rem' }}>
                          Doc. del modelo
                        </span>
                      )}

                      {/* 4. Fecha de Expiración (Solo si hay datos reales) */}
                      {((item.expireDate && item.expireDate.trim() !== "-") || item.dateIndefinite) && (
                        <span 
                          className={`badge fw-normal ${
                            item.dateIndefinite ? "bg-info text-dark" : "bg-light text-secondary border"
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className="bi bi-calendar3 me-1"></i>
                          {item.dateIndefinite ? "Indefinida" : `Expira: ${item.expireDate}`}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
