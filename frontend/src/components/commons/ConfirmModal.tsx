import React from "react";

// para usar este componente, pon el propio componente abajo del todo para renderizarlo
// y luego le pones los titulos, mensajes, y metodos a hacer según confirme o cancele

interface ConfirmModalProps {
    show: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "primary" | "danger" | "warning";
}

export default function ConfirmModal({ show, title, message, onConfirm, onCancel, variant = "primary" }: ConfirmModalProps) {
    if (!show) return null;

    // Mapeo de colores según la variante (usando clases de Bootstrap)
    const buttonClass = `btn btn-${variant}`;
    const titleClass = variant === "danger" ? "text-danger" : variant === "warning" ? "text-warning" : "text-primary";

    return (
        <div className="modal-backdrop" style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 2000
        }}>
            <div className="card p-4 shadow-lg" style={{ minWidth: "350px", borderTop: `5px solid var(--bs-${variant})` }}>
                {title && <h5 className={`${titleClass} fw-bold`}>{title}</h5>}
                <p className="mt-2">{message}</p>
                <div className="d-flex justify-content-end gap-2 mt-3">
                    {/* Ocultamos cancelar si es solo un aviso de validación */}
                    {variant !== "warning" && (
                        <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
                    )}
                    <button className={buttonClass} onClick={onConfirm}>
                        {variant === "warning" ? "Entendido" : "Confirmar"}
                    </button>
                </div>
            </div>
        </div>
    );
}