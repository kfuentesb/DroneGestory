import React, { useState,  } from 'react';
import InsertDoc from "../commons/InsertDoc";
import { InfoBadge } from "../commons/InfoBadge";

type CertificateFieldPayload = {
    certificate: File | null;
    dateExpire: string | null;
    dateIndefinite: boolean | null;
};

type Category = {
    id: string;
    label: string;
};

type UserCertificatesSectionProps = {
    activeChecks: Record<string, boolean>;
    selectedFiles: Record<string, File | null>;
    formValues: Record<string, string>;
    onToggleCheck: (id: string) => void;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
    onClearFile: (id: string, inputId: string) => void;
    conopsCategories: Category[];
    selectedCategories: string[];
    currentSelection: string;
    onCurrentSelectionChange: (value: string) => void;
    onAddCategory: () => void;
    onRemoveCategory: (id: string) => void;
    conopsDocs: Record<string, CertificateFieldPayload>;
    onConopsFileChange: (catId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
    onConopsClearFile: (catId: string) => void;
    onConopsDateChange: (catId: string, value: string) => void;
    onConopsToggleIndefinite: (catId: string) => void;
    onFormDateChange: (key: string, value: string) => void;
    existingStaticFileNames?: Record<string, string>;
    existingConopsFileNames?: Record<string, string>;
};

export type CertificateSummaryItem = {
    id: number | string;
    certificateType: string;
    expireDate: string | null;
    dateIndefinite: boolean | null;
    hasFile: boolean;
    onOpen?: () => void;
};

const infoText = (
    <>
        En caso de que se disponga <b>de los tres certificados de piloto a distancia</b>, 
        con fechas de caducidad distintas en cada uno de ellos, <b>será la del certificado 
        de piloto a distancia en STS la que dará validez a todos los certificados anteriores, 
        unificando la fecha de caducidad al del nivel superior</b>.
    </>
);

export default function UserCertificatesSection({
    activeChecks,
    selectedFiles,
    formValues,
    onToggleCheck,
    onFileChange,
    onClearFile,
    conopsCategories,
    selectedCategories,
    currentSelection,
    onCurrentSelectionChange,
    onAddCategory,
    onRemoveCategory,
    conopsDocs,
    onConopsFileChange,
    onConopsClearFile,
    onConopsDateChange,
    onConopsToggleIndefinite,
    onFormDateChange,
    existingStaticFileNames = {},
    existingConopsFileNames = {},
}: UserCertificatesSectionProps) {

    const [showOptional, setShowOptional] = useState(false);
    return (
        <div className="mb-3"
            style={{ 
                marginLeft: "-30px", 
                marginRight: "-30px",
                paddingLeft: "20px",
                paddingRight: "20px"
            }}
        >
            <div 
                className="p-2 rounded-3 shadow-sm" 
                style={{ 
                    backgroundColor: "#F9FAFB", 
                    borderLeft: "2px solid #D1D5DB",
                    borderBottom: "2px solid #D1D5DB",
                    borderBottomLeftRadius: "12px",
                    color: "#6B7280" 
                }}
            >
                <button
                    type="button"
                    className="btn btn-success w-100 d-flex justify-content-center align-items-center py-2 shadow-sm border-0"
                    style={{ borderRadius: "8px", fontWeight: "600" }}
                    onClick={() => setShowOptional(!showOptional)}
                >
                    <span className="me-2">{showOptional ? "−" : "+"}</span>
                    {showOptional ? "Ocultar certificados" : "Certificados"}
                </button>

                {showOptional && (
                    <div className="mt-3 animate__animated animate__fadeIn">
                        <div className="p-3 mb-3 border rounded-3 drone-check" style={{ backgroundColor: "#f1f2f3" }}>
                            <div className="d-flex align-items-center mb-3">
                                <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                    Categoria Abierta
                                </h6>
                                <InfoBadge text={infoText} />
                            </div>

                            <InsertDoc
                                className="mb-4"
                                checkboxLabel="A1 / A3 (Prueba de superacion)"
                                isChecked={activeChecks.chkA1A3}
                                onToggleCheck={() => onToggleCheck("chkA1A3")}
                                fileInputId="file-upload-a1a3"
                                selectedFile={selectedFiles.fileA1A3}
                                existingFileName={existingStaticFileNames.fileA1A3}
                                onFileChange={(e) => onFileChange(e, "fileA1A3")}
                                onClearFile={() => onClearFile("fileA1A3", "file-upload-a1a3")}
                                expirationDate={formValues.dateA1A3}
                                onExpirationDateChange={(value) => onFormDateChange("dateA1A3", value)}
                                indefiniteId="indefiniteA1A3"
                                isIndefinite={activeChecks.indefiniteA1A3}
                                onToggleIndefinite={() => onToggleCheck("indefiniteA1A3")}
                            />

                            <InsertDoc
                                className="mb-2"
                                checkboxLabel="A2 (Certificado de aptitud)"
                                isChecked={activeChecks.chkA2}
                                onToggleCheck={() => onToggleCheck("chkA2")}
                                fileInputId="file-upload-a2"
                                selectedFile={selectedFiles.fileA2}
                                existingFileName={existingStaticFileNames.fileA2}
                                onFileChange={(e) => onFileChange(e, "fileA2")}
                                onClearFile={() => onClearFile("fileA2", "file-upload-a2")}
                                expirationDate={formValues.dateA2}
                                onExpirationDateChange={(value) => onFormDateChange("dateA2", value)}
                                indefiniteId="indefiniteA2"
                                isIndefinite={activeChecks.indefiniteA2}
                                onToggleIndefinite={() => onToggleCheck("indefiniteA2")}
                            />
                        </div>

                        <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                            <div className="d-flex align-items-center mb-3">
                                <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                    Categoria especifica escenarios estandar
                                </h6>
                                <InfoBadge text={infoText} />
                            </div>

                            <InsertDoc
                                checkboxLabel="STS europeo"
                                isChecked={activeChecks.chkSTS01}
                                onToggleCheck={() => onToggleCheck("chkSTS01")}
                                fileInputId="file-upload-sts"
                                selectedFile={selectedFiles.fileSTS}
                                existingFileName={existingStaticFileNames.fileSTS}
                                onFileChange={(e) => onFileChange(e, "fileSTS")}
                                onClearFile={() => onClearFile("fileSTS", "file-upload-sts")}
                                expirationDate={formValues.dateSTS}
                                onExpirationDateChange={(value) => onFormDateChange("dateSTS", value)}
                                indefiniteId="indefiniteSTS"
                                isIndefinite={activeChecks.indefiniteSTS}
                                onToggleIndefinite={() => onToggleCheck("indefiniteSTS")}
                            />
                        </div>

                        <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                            <div className="d-flex align-items-center mb-3">
                                <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                    Categoria especifica bajo autorizacion
                                </h6>
                                <InfoBadge text={"info"} />
                            </div>

                            <InsertDoc
                                className="mb-4"
                                checkboxLabel="Formacion teorica generica"
                                isChecked={activeChecks.chkFormcnTeoricaGen}
                                onToggleCheck={() => onToggleCheck("chkFormcnTeoricaGen")}
                                fileInputId="file-upload-ftg"
                                selectedFile={selectedFiles.fileFTG}
                                existingFileName={existingStaticFileNames.fileFTG}
                                onFileChange={(e) => onFileChange(e, "fileFTG")}
                                onClearFile={() => onClearFile("fileFTG", "file-upload-ftg")}
                                expirationDate={formValues.dateFTG}
                                onExpirationDateChange={(value) => onFormDateChange("dateFTG", value)}
                                indefiniteId="indefiniteFTG"
                                isIndefinite={activeChecks.indefiniteFTG}
                                onToggleIndefinite={() => onToggleCheck("indefiniteFTG")}
                            />

                            <InsertDoc
                                className="mb-2"
                                checkboxLabel="Formacion practica generica"
                                isChecked={activeChecks.chkFormcnPracticaGen}
                                onToggleCheck={() => onToggleCheck("chkFormcnPracticaGen")}
                                fileInputId="file-upload-fpg"
                                selectedFile={selectedFiles.fileFPG}
                                existingFileName={existingStaticFileNames.fileFPG}
                                onFileChange={(e) => onFileChange(e, "fileFPG")}
                                onClearFile={() => onClearFile("fileFPG", "file-upload-fpg")}
                                expirationDate={formValues.dateFPG}
                                onExpirationDateChange={(value) => onFormDateChange("dateFPG", value)}
                                indefiniteId="indefiniteFPG"
                                isIndefinite={activeChecks.indefiniteFPG}
                                onToggleIndefinite={() => onToggleCheck("indefiniteFPG")}
                            />

                            <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                                <div className="d-flex align-items-center mb-3">
                                    <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                        Formaciones especifica Concepto de Operaciones (ConOps)
                                    </h6>
                                </div>

                                <div className="d-flex gap-2 mb-4">
                                    <select
                                        className="form-select"
                                        value={currentSelection}
                                        onChange={(e) => onCurrentSelectionChange(e.target.value)}
                                    >
                                        <option value="">Seleccionar formacion especifica...</option>
                                        {conopsCategories
                                            .filter((cat) => !selectedCategories.includes(cat.id))
                                            .map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.label}
                                                </option>
                                            ))}
                                    </select>
                                    <button type="button" className="btn btn-success" onClick={onAddCategory} disabled={!currentSelection}>
                                        Anadir
                                    </button>
                                </div>

                                {selectedCategories.map((catId) => {
                                    const categoryData = conopsCategories.find((c) => c.id === catId);
                                    if (!categoryData) return null;

                                    return (
                                        <div key={catId} className="border-bottom pb-3 mb-3">
                                            <InsertDoc
                                                showAddBtn={true}
                                                checkboxLabel={categoryData.label}
                                                isChecked={true}
                                                onToggleCheck={() => onRemoveCategory(catId)}
                                                fileInputId={`file-${catId}`}
                                                selectedFile={conopsDocs[catId]?.certificate ?? null}
                                                existingFileName={existingConopsFileNames[catId]}
                                                onFileChange={(e) => onConopsFileChange(catId, e)}
                                                onClearFile={() => onConopsClearFile(catId)}
                                                expirationDate={conopsDocs[catId]?.dateExpire ?? ""}
                                                onExpirationDateChange={(val) => onConopsDateChange(catId, val)}
                                                indefiniteId={`indefinite-${catId}`}
                                                isIndefinite={conopsDocs[catId]?.dateIndefinite ?? false}
                                                onToggleIndefinite={() => onConopsToggleIndefinite(catId)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                            <div className="d-flex align-items-center mb-3">
                                <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                    Certificados adicionales
                                </h6>
                                <InfoBadge text={"info"} />
                            </div>
                        </div>

                        <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                            <div className="d-flex align-items-center mb-3">
                                <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                    Radiofonista UAS
                                </h6>
                                <InfoBadge text={"info"} />
                            </div>

                            <InsertDoc
                                className="mb-4"
                                checkboxLabel="Certificado teorico"
                                isChecked={activeChecks.chkFormCertTeor}
                                onToggleCheck={() => onToggleCheck("chkFormCertTeor")}
                                fileInputId="file-upload-fct"
                                selectedFile={selectedFiles.fileCT}
                                existingFileName={existingStaticFileNames.fileCT}
                                onFileChange={(e) => onFileChange(e, "fileCT")}
                                onClearFile={() => onClearFile("fileCT", "file-upload-fct")}
                                expirationDate={formValues.dateCT}
                                onExpirationDateChange={(value) => onFormDateChange("dateCT", value)}
                                indefiniteId="indefiniteCT"
                                isIndefinite={activeChecks.indefiniteCT}
                                onToggleIndefinite={() => onToggleCheck("indefiniteCT")}
                            />

                            <InsertDoc
                                
                                className="mb-4"
                                checkboxLabel="Certificado practico"
                                isChecked={activeChecks.chkFormCertPract}
                                onToggleCheck={() => onToggleCheck("chkFormCertPract")}
                                fileInputId="file-upload-fcp"
                                selectedFile={selectedFiles.fileCP}
                                existingFileName={existingStaticFileNames.fileCP}
                                onFileChange={(e) => onFileChange(e, "fileCP")}
                                onClearFile={() => onClearFile("fileCP", "file-upload-fcp")}
                                expirationDate={formValues.dateCP}
                                onExpirationDateChange={(value) => onFormDateChange("dateCP", value)}
                                indefiniteId="indefiniteCP"
                                isIndefinite={activeChecks.indefiniteCP}
                                onToggleIndefinite={() => onToggleCheck("indefiniteCP")}
                            />
                        </div>

                        <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                            <div className="d-flex align-items-center mb-3">
                                <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                    Certificados Medicos
                                </h6>
                                <InfoBadge text={"info"} />
                            </div>

                            <InsertDoc
                                className="mb-4"
                                checkboxLabel="Clase 2 (MED.A.030 de Reglamento (UE) 1178/2011) / Drones o RPAS > 25Kg"
                                isChecked={activeChecks.chkFormCMClase2}
                                onToggleCheck={() => onToggleCheck("chkFormCMClase2")}
                                fileInputId="file-upload-fcmc2"
                                selectedFile={selectedFiles.fileCMC2}
                                existingFileName={existingStaticFileNames.fileCMC2}
                                onFileChange={(e) => onFileChange(e, "fileCMC2")}
                                onClearFile={() => onClearFile("fileCMC2", "file-upload-fcmc2")}
                                expirationDate={formValues.dateCMC2}
                                onExpirationDateChange={(value) => onFormDateChange("dateCMC2", value)}
                                indefiniteId="indefiniteCMC2"
                                isIndefinite={activeChecks.indefiniteCMC2}
                                onToggleIndefinite={() => onToggleCheck("indefiniteCMC2")}
                            />

                            <InsertDoc
                                className="mb-4"
                                checkboxLabel="Clase LAPL (MED.A.030 de Reglamento (UE) 1178/2011) / Drones o RPAS < 25Kg"
                                isChecked={activeChecks.chkFormCMClaseLAPL}
                                onToggleCheck={() => onToggleCheck("chkFormCMClaseLAPL")}
                                fileInputId="file-upload-fcmclapl"
                                selectedFile={selectedFiles.fileCMCLAPL}
                                existingFileName={existingStaticFileNames.fileCMCLAPL}
                                onFileChange={(e) => onFileChange(e, "fileCMCLAPL")}
                                onClearFile={() => onClearFile("fileCMCLAPL", "file-upload-fcmclapl")}
                                expirationDate={formValues.dateCMCLAPL}
                                onExpirationDateChange={(value) => onFormDateChange("dateCMCLAPL", value)}
                                indefiniteId="indefiniteCMCLAPL"
                                isIndefinite={activeChecks.indefiniteCMCLAPL}
                                onToggleIndefinite={() => onToggleCheck("indefiniteCMCLAPL")}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function UserCertificatesSummarySection({ items }: { items: CertificateSummaryItem[] }) {
    return (
        <div className="mt-3">
            <h5 className="fw-bold mb-3">Certificados</h5>

            {items.length === 0 && <p className="text-muted mb-0">Sin certificados registrados.</p>}

            {items.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                        <thead>
                            <tr>
                                <th scope="col">Certificado</th>
                                <th scope="col">Fecha de expiracion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        {item.hasFile && item.onOpen ? (
                                            <button type="button" className="btn btn-link p-0 text-start" onClick={item.onOpen} title="Abrir certificado">
                                                {item.certificateType}
                                            </button>
                                        ) : (
                                            <span>{item.certificateType}</span>
                                        )}
                                    </td>
                                    <td>{item.dateIndefinite ? "Indefinida" : item.expireDate || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
