import React from "react";

interface InsertDocProps {
    className?: string;
    showCheckbox?: boolean;
    checkboxId: string;
    checkboxLabel: string;
    isChecked: boolean;
    onToggleCheck: () => void;
    fileInputId: string;
    selectedFile: File | null;
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
}

export default function InsertDoc({
    className,
    showCheckbox = true,
    checkboxId,
    checkboxLabel,
    isChecked,
    onToggleCheck,
    fileInputId,
    selectedFile,
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

    const shouldShowContent = !showCheckbox || isChecked;

    return (
        <div className={className}>
            {showCheckbox && (
                <div className="row">
                    <div className="col-12 text-start">
                        <div className="form-check">
                            <input
                                className="form-check-input shadow-none"
                                type="checkbox"
                                id={checkboxId}
                                checked={isChecked}
                                onChange={onToggleCheck}
                            />
                            <label className="form-check-label small fw-bold" htmlFor={checkboxId}>
                                {checkboxLabel}
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {shouldShowContent && (
                <div className={`row g-2 mt-1 ${showCheckbox ? "ms-3" : ""} fade-in-input text-start`}>
                    {!showCheckbox && (
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
                                {selectedFile ? selectedFile.name : "No hay archivo"}
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