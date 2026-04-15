import React from "react";

interface InsertDocProps {
    className?: string;
    showAddBtn?: boolean;
    hideHeader?: boolean;
    checkboxLabel: string;
    isChecked: boolean;
    onToggleCheck: () => void;
    fileInputId: string;
    selectedFile: File | null;
    existingFileName?: string | null;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearFile: () => void;
    expirationDate: string;
    onExpirationDateChange: (value: string) => void;
    indefiniteId: string;
    isIndefinite: boolean;
    onToggleIndefinite: () => void;
    accept?: string;
    fileLabel?: string;
    expirationLabel?: string;
    indefiniteLabel?: string;
    mode?: 'register' | 'edit';
    showDateControls?: boolean;
    isModelDefault?: boolean;
    modelDefaultFileName?: string | null;
    onRestoreModelDefault?: () => void;
    isModelSection?: boolean;
}

export default function InsertDoc({
    className,
    showAddBtn = true,
    hideHeader = false,
    checkboxLabel,
    isChecked,
    onToggleCheck,
    fileInputId,
    selectedFile,
    existingFileName,
    onFileChange,
    onClearFile,
    expirationDate,
    onExpirationDateChange,
    indefiniteId,
    isIndefinite,
    onToggleIndefinite,
    accept = ".pdf,.jpg,.jpeg,.png",
    fileLabel = "Documentación PDF",
    expirationLabel = "Vencimiento",
    indefiniteLabel = "Indefinido",
    showDateControls = true,
    isModelDefault = false,
    modelDefaultFileName = null,
    isModelSection = false,
    onRestoreModelDefault,
}: InsertDocProps) {

    const shouldShowContent = !showAddBtn || isChecked;

    const canRestore = !isModelSection && 
                    Boolean(modelDefaultFileName) && 
                    Boolean(onRestoreModelDefault) &&
                    (
                        selectedFile !== null || 
                        !existingFileName || 
                        existingFileName !== modelDefaultFileName
                    );

    return (
        <div className={className}>
            {!hideHeader && showAddBtn && (
                <div className="row mb-2">
                    <div className="col-12 text-start d-flex align-items-center gap-2">
                        {/* 1. THE ACTION BUTTON */}
                        <button
                            type="button"
                            className="btn btn-sm d-flex align-items-center justify-content-center shadow-none p-0"
                            style={{ 
                                width: "32px",
                                height: "32px",
                                backgroundColor: isChecked ? "#FEE2E2" : "#ffffff", 
                                color: isChecked ? "#DC2626" : "#2F8F5B", 
                                border: isChecked ? "1px solid #FECACA" : "1px solid #2F8F5B",
                                borderRadius: "8px", 
                                transition: "all 0.2s ease"
                            }}
                            onClick={onToggleCheck}
                            title={isChecked ? "Eliminar certificado" : "Añadir certificado"}
                        >
                            {isChecked ? (
                                /* Trash Icon */
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                                </svg>
                            ) : (
                                /* Plus Icon */
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                </svg>
                            )}
                        </button>

                        {/* 2. THE TITLE (Static Label) */}
                        <label 
                            className={`small fw-bold mb-0 ${isChecked ? "text-dark" : "text-muted"}`} 
                            style={{ cursor: "default" }}
                        >
                            {checkboxLabel}
                        </label>


                        {!canRestore &&isModelDefault && isChecked && (
                            <span
                                className="badge"
                                style={{
                                    backgroundColor: "#FEF3C7",
                                    color: "#92400E",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    border: "1px solid #FCD34D"
                                }}
                            >
                                Predeterminado del modelo
                            </span>
                        )}
                        {/* 3. RESTORE MODEL DEFAULT BUTTON */}
                        {canRestore &&(
                            <button
                                type="button"
                                className="btn btn-sm d-flex align-items-center gap-1 shadow-none ms-auto"
                                style={{
                                    backgroundColor: "#F3F4F6",
                                    color: "#374151",
                                    border: "1px solid #D1D5DB",
                                    borderRadius: "6px",
                                    padding: "4px 8px",
                                    fontSize: "0.72rem",
                                    fontWeight: 600,
                                    transition: "all 0.2s ease"
                                }}
                                onClick={onRestoreModelDefault}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = "#E5E7EB";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1a.5.5 0 0 1-1 0V2a.5.5 0 0 1 .5-.5h2.5a.5.5 0 0 1 0 1H8V3z"/>
                                    <path d="m8.5 5.5v2.793l1.146-1.147a.5.5 0 0 1 .708.708l-2.5 2.5a.5.5 0 0 1-.708 0l-2.5-2.5a.5.5 0 0 1 .708-.708L7.5 8.293V5.5a.5.5 0 0 1 1 0z"/>
                                </svg>
                                Restaurar archivo del modelo
                            </button>
                        )}
                    </div>
                </div>
            )}

            {shouldShowContent && (
                <div className={`row g-2 mt-1 ${showAddBtn ? "ms-3" : ""} fade-in-input text-start`}>
                    {!showAddBtn && (
                        <div className="col-12 mb-1">
                        <span className="small fw-bold text-secondary">{checkboxLabel}</span>
                        </div>
                    )}
                    <div className="col-12 col-md-5">
                        <small className="text-muted d-block mb-1 text-start" style={{ fontSize: "0.65rem" }}>
                            {fileLabel}
                        </small>
                        <div className="d-flex align-items-center rounded" style={{ backgroundColor: "#F3F4F6", border: "1px solid #D1D5DB", paddingLeft: "10px" }}>
                            <span className="text-truncate" style={{ maxWidth: "150px" }}>
                                {selectedFile 
                                    ? selectedFile.name 
                                    : (existingFileName || (modelDefaultFileName ? "Pendiente: Doc. Modelo" : "No hay archivo"))}
                            </span>
                            <input
                                id={fileInputId}
                                type="file"
                                accept={accept}
                                onChange={onFileChange}
                                style={{ display: "none" }}
                            />
                            <div className="ms-auto d-flex">
                                <label
                                    htmlFor={fileInputId}
                                    className="btn btn-success btn-sm"
                                    style={{ cursor: "pointer", borderTopRightRadius: (selectedFile || existingFileName) ? "0" : "4px", borderBottomRightRadius: (selectedFile || existingFileName) ? "0" : "4px" }}
                                >
                                    Seleccionar
                                </label>
                                {(selectedFile || existingFileName) && (
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={onClearFile}
                                        style={{ borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }}
                                        title="Eliminar este archivo"
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {showDateControls && (
                        <div className="col-12 col-md-4">
                            <small className="text-muted d-block mb-1 text-start" style={{ fontSize: "0.65rem" }}>
                                {expirationLabel}
                            </small>
                            <div className="input-group input-group-sm mb-1">
                                <input
                                    type="date"
                                    className="form-control"
                                    disabled={isIndefinite}
                                    value={isIndefinite ? "" : expirationDate}
                                    onChange={(e) => onExpirationDateChange(e.target.value)}
                                />
                            </div>
                            <div className="form-check text-start">
                                <input
                                    className="form-check-input shadow-none"
                                    type="checkbox"
                                    id={indefiniteId}
                                    checked={isIndefinite}
                                    onChange={onToggleIndefinite}
                                />
                                <label className="form-check-label text-muted text-start" htmlFor={indefiniteId} style={{ fontSize: "0.65rem" }}>
                                    {indefiniteLabel}
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
