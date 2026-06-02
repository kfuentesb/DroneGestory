import React, { type ReactNode } from "react";
import cancelIcon from "../../assets/commons/cancel_white.svg";

// para usar este componente, pon el propio componente abajo del todo para renderizarlo
// y luego le pones los titulos, mensajes, y metodos a hacer según confirme o cancele

interface ConfirmModalProps {
    show: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "primary" | "danger" | "warning";
    inputValue?: string;
    inputLabel?: string;
    inputPlaceholder?: string;
    inputHelperText?: string;
    onInputChange?: (value: string) => void;
    children?: ReactNode;
    confirmLabel?: string;
    confirmDisabled?: boolean;
    showCancelButton?: boolean;
}

export default function ConfirmModal({
    show,
    title,
    message,
    onConfirm,
    onCancel,
    variant = "primary",
    inputValue,
    inputLabel,
    inputPlaceholder,
    inputHelperText,
    onInputChange,
    children,
    confirmLabel,
    confirmDisabled,
    showCancelButton,
}: ConfirmModalProps) {
    if (!show) return null;

    // Mapeo de colores según la variante (usando clases de Bootstrap)
    const buttonClass = `btn btn-${variant}`;
    const titleClass = variant === "danger" ? "text-danger" : variant === "warning" ? "text-warning" : "text-primary";
    const shouldShowCancel = showCancelButton ?? variant !== "warning";
    const confirmButtonLabel = confirmLabel ?? (variant === "warning" ? "Entendido" : "Confirmar");

    return (
        <div className="modal-backdrop" style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 2000
        }}>
            <div className="card p-4 shadow-lg" style={{ minWidth: "350px", borderTop: `5px solid var(--bs-${variant})` }}>
                {title && <h5 className={`${titleClass} fw-bold`}>{title}</h5>}
                <p className="mt-2">{message}</p>
                {onInputChange && (
                    <div className="mt-3">
                        {inputLabel && <label className="form-label fw-semibold">{inputLabel}</label>}
                        <input
                            type="text"
                            className="form-control"
                            value={inputValue ?? ""}
                            onChange={(event) => onInputChange(event.target.value)}
                            placeholder={inputPlaceholder}
                            autoFocus
                        />
                        {inputHelperText && <div className="form-text mt-1">{inputHelperText}</div>}
                    </div>
                )}
                {children && <div className="mt-3">{children}</div>}
                <div className="d-flex justify-content-end gap-2 mt-3">
                    {/* Ocultamos cancelar si es solo un aviso de validación */}
                    {shouldShowCancel && (
                        <button className="btn btn-secondary px-3 py-2 d-inline-flex align-items-center justify-content-center gap-2" onClick={onCancel}>
                            <img
                                src={cancelIcon}
                                alt=""
                                aria-hidden="true"
                                className="d-inline d-md-none"
                                style={{ width: 16, height: 16 }}
                            />
                            <span className="d-none d-md-inline">Cancelar</span>
                        </button>
                    )}
                    <button
                        className={`${buttonClass} px-3 py-2 d-inline-flex align-items-center justify-content-center gap-2`}
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                    >
                        {confirmButtonLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
