import { useState } from "react";
import InsertDoc from "../commons/InsertDoc";
import { InfoBadge } from "../commons/InfoBadge";

export type AircraftDocumentationFieldConfig = {
  key: string;
  label: string;
  enabledKey: string;
  fileKey: string;
  dateKey: string;
  indefiniteKey: string;
  infoLabel: string;
};

export type AircraftSummaryItem = {
  key: string;
  certificateType: string;
  expireDate?: string;
  dateIndefinite?: boolean;
  hasFile?: boolean;
  onOpen?: () => void;
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
    key: "otraDocumentacion",
    label: "Otra documentación",
    enabledKey: "chkOtraDocumentacion",
    fileKey: "fileOtraDocumentacion",
    dateKey: "dateOtraDocumentacion",
    indefiniteKey: "indefiniteOtraDocumentacion",
    infoLabel: "Específica",
  },
];

type AircraftDocumentationSectionProps = {
  isExistingModel: boolean;
  showInsuranceDocumentation: boolean;
  showFTSDocumentation: boolean;
  showParachuteDocumentation: boolean;
  activeChecks: Record<string, boolean>;
  selectedFiles: Record<string, File | null>;
  formValues: Record<string, string>;
  existingFileNames?: Record<string, string>;
  onToggleCheck: (id: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onClearFile: (id: string, inputId: string) => void;
  onFormDateChange: (key: string, value: string) => void;
};

const EXISTING_MODEL_HIDDEN_KEYS = new Set([
  "manualUsuarioFTS",
  "documentoTecnicoFTS",
  "manualUsuarioParacaidas",
  "documentoTecnicoParacaidas",
]);

export function getVisibleAircraftDocumentationFields(
  isExistingModel: boolean,
  showInsuranceDocumentation: boolean,
  showFTSDocumentation: boolean,
  showParachuteDocumentation: boolean
): AircraftDocumentationFieldConfig[] {
  return aircraftDocumentationFields.filter((field) => {
    if (isExistingModel && EXISTING_MODEL_HIDDEN_KEYS.has(field.key)) {
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
  isExistingModel,
  showInsuranceDocumentation,
  showFTSDocumentation,
  showParachuteDocumentation,
  activeChecks,
  selectedFiles,
  formValues,
  existingFileNames = {},
  onToggleCheck,
  onFileChange,
  onClearFile,
  onFormDateChange,
}: AircraftDocumentationSectionProps) {
  const [showOptional, setShowOptional] = useState(false);
  const visibleFields = getVisibleAircraftDocumentationFields(isExistingModel, showInsuranceDocumentation, showFTSDocumentation, showParachuteDocumentation);

  return (
    <div
      className="mb-3"
      style={{
        marginLeft: "-30px",
        marginRight: "-30px",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      <div
        className="p-2 rounded-3 shadow-sm"
        style={{
          backgroundColor: "#F9FAFB",
          borderLeft: "2px solid #D1D5DB",
          borderBottom: "2px solid #D1D5DB",
          borderBottomLeftRadius: "12px",
          color: "#6B7280",
        }}
      >
        <button
          type="button"
          className="btn btn-success w-100 d-flex justify-content-center align-items-center py-2 shadow-sm border-0"
          style={{ borderRadius: "8px", fontWeight: "600" }}
          onClick={() => setShowOptional(!showOptional)}
        >
          <span className="me-2">{showOptional ? "−" : "+"}</span>
          {showOptional ? "Ocultar documentación" : "Documentación"}
        </button>

        {showOptional && (
          <div className="mt-3 animate__animated animate__fadeIn">
            {visibleFields.map((field) => (
              <div key={field.key} className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                <div className="d-flex align-items-center mb-3">
                  <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                    {field.label}
                  </h6>
                  <InfoBadge text={field.infoLabel} />
                </div>

                <InsertDoc
                  className="mb-2"
                  checkboxLabel={field.label}
                  isChecked={Boolean(activeChecks[field.enabledKey])}
                  onToggleCheck={() => onToggleCheck(field.enabledKey)}
                  fileInputId={`file-upload-aircraft-${field.fileKey}`}
                  selectedFile={selectedFiles[field.fileKey] ?? null}
                  existingFileName={existingFileNames[field.fileKey]}
                  onFileChange={(e) => onFileChange(e, field.fileKey)}
                  onClearFile={() => onClearFile(field.fileKey, `file-upload-aircraft-${field.fileKey}`)}
                  expirationDate={formValues[field.dateKey] || ""}
                  onExpirationDateChange={(value) => onFormDateChange(field.dateKey, value)}
                  indefiniteId={`indefinite-aircraft-${field.indefiniteKey}`}
                  isIndefinite={Boolean(activeChecks[field.indefiniteKey])}
                  onToggleIndefinite={() => onToggleCheck(field.indefiniteKey)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AircraftDocumentationSummarySection({ items }: { items: AircraftSummaryItem[] }) {
  return (
    <div className="mt-4 border-top pt-3">
      <h5 className="fw-bold mb-3" style={{ color: "#1E1E1E" }}>Documentaciones</h5>

      {items.length === 0 ? (
        <div className="p-3 bg-light rounded text-center border">
            <p className="text-muted mb-0">Sin documentaciones registradas.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col" style={{ width: "60%" }}>Documentación</th>
                <th scope="col" style={{ width: "40%" }}>Fecha de expiración</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.key}>
                  <td>
                    {item.hasFile && item.onOpen ? (
                      <button 
                        type="button" 
                        className="btn btn-link p-0 text-start text-success fw-medium text-decoration-none" 
                        onClick={item.onOpen} 
                        title="Abrir certificado"
                      >
                        <i className="bi bi-file-earmark-arrow-down me-2"></i>
                        {item.certificateType}
                      </button>
                    ) : (
                      <span className="text-dark">{item.certificateType}</span>
                    )}
                  </td>
                  <td>
                    {item.dateIndefinite ? (
                      <span className="badge bg-info text-dark">Indefinida</span>
                    ) : (
                      <span className="text-secondary">{item.expireDate || "No especificada"}</span>
                    )}
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
