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
    fileLabel = "Certificado PDF",
    expirationLabel = "Vencimiento",
    indefiniteLabel = "Indefinido",
}: InsertDocProps) {

    const shouldShowContent = !showAddBtn || isChecked;

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
                                {selectedFile ? selectedFile.name : (existingFileName || "No hay archivo")}
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
                                    style={{ cursor: "pointer", borderTopRightRadius: selectedFile ? "0" : "4px", borderBottomRightRadius: selectedFile ? "0" : "4px" }}
                                >
                                    Seleccionar
                                </label>
                                {selectedFile && (
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={onClearFile}
                                        style={{ borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }}
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

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
                </div>
            )}
        </div>
    );
}
