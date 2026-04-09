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
};

export const aircraftDocumentationFields: AircraftDocumentationFieldConfig[] = [
  {
    key: "caracterizacion",
    label: "Caracterización",
    enabledKey: "chkCaracterizacion",
    fileKey: "fileCaracterizacion",
    dateKey: "dateCaracterizacion",
    indefiniteKey: "indefiniteCaracterizacion",
  },
  {
    key: "manualUsuario",
    label: "Manual de usuario",
    enabledKey: "chkManualUsuario",
    fileKey: "fileManualUsuario",
    dateKey: "dateManualUsuario",
    indefiniteKey: "indefiniteManualUsuario",
  },
  {
    key: "manualMantenimiento",
    label: "Manual de mantenimiento",
    enabledKey: "chkManualMantenimiento",
    fileKey: "fileManualMantenimiento",
    dateKey: "dateManualMantenimiento",
    indefiniteKey: "indefiniteManualMantenimiento",
  },
  {
    key: "seguroResponsabilidadCivil",
    label: "Seguro de responsabilidad civil",
    enabledKey: "chkSeguroRC",
    fileKey: "fileSeguroRC",
    dateKey: "dateSeguroRC",
    indefiniteKey: "indefiniteSeguroRC",
  },
  {
    key: "manualUsuarioFTS",
    label: "Manual de usuario FTS",
    enabledKey: "chkManualUsuarioFTS",
    fileKey: "fileManualUsuarioFTS",
    dateKey: "dateManualUsuarioFTS",
    indefiniteKey: "indefiniteManualUsuarioFTS",
  },
  {
    key: "documentoTecnicoFTS",
    label: "Documento técnico FTS",
    enabledKey: "chkDocTecnicoFTS",
    fileKey: "fileDocTecnicoFTS",
    dateKey: "dateDocTecnicoFTS",
    indefiniteKey: "indefiniteDocTecnicoFTS",
  },
  {
    key: "manualUsuarioParacaidas",
    label: "Manual de usuario Paracaídas",
    enabledKey: "chkManualUsuarioParacaidas",
    fileKey: "fileManualUsuarioParacaidas",
    dateKey: "dateManualUsuarioParacaidas",
    indefiniteKey: "indefiniteManualUsuarioParacaidas",
  },
  {
    key: "documentoTecnicoParacaidas",
    label: "Documento técnico Paracaídas",
    enabledKey: "chkDocTecnicoParacaidas",
    fileKey: "fileDocTecnicoParacaidas",
    dateKey: "dateDocTecnicoParacaidas",
    indefiniteKey: "indefiniteDocTecnicoParacaidas",
  },
  {
    key: "otraDocumentacion",
    label: "Otra documentación",
    enabledKey: "chkOtraDocumentacion",
    fileKey: "fileOtraDocumentacion",
    dateKey: "dateOtraDocumentacion",
    indefiniteKey: "indefiniteOtraDocumentacion",
  },
];

type AircraftDocumentationSectionProps = {
  activeChecks: Record<string, boolean>;
  selectedFiles: Record<string, File | null>;
  formValues: Record<string, string>;
  onToggleCheck: (id: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onClearFile: (id: string, inputId: string) => void;
  onFormDateChange: (key: string, value: string) => void;
};

export default function AircraftDocumentationSection({
  activeChecks,
  selectedFiles,
  formValues,
  onToggleCheck,
  onFileChange,
  onClearFile,
  onFormDateChange,
}: AircraftDocumentationSectionProps) {
  const [showOptional, setShowOptional] = useState(false);

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
            {aircraftDocumentationFields.map((field) => (
              <div key={field.key} className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                <div className="d-flex align-items-center mb-3">
                  <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                    {field.label}
                  </h6>
                  <InfoBadge text={`Adjunta ${field.label.toLowerCase()} si aplica.`} />
                </div>

                <InsertDoc
                  className="mb-2"
                  checkboxLabel={field.label}
                  isChecked={Boolean(activeChecks[field.enabledKey])}
                  onToggleCheck={() => onToggleCheck(field.enabledKey)}
                  fileInputId={`file-upload-aircraft-${field.fileKey}`}
                  selectedFile={selectedFiles[field.fileKey] ?? null}
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
