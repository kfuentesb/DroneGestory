import React from "react";

// para usar este componente, pon el propio componente abajo del todo para renderizarlo
// y luego le pones los titulos, mensajes, y metodos a hacer según confirme o cancele

interface ConfirmModalProps {
    show: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ show, title, message, onConfirm, onCancel }: ConfirmModalProps) {
    if (!show) return null;

    return (
        <div className="modal-backdrop" style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000
        }}>
            <div className="card p-4" style={{ minWidth: "300px" }}>
                {title && <h5>{title}</h5>}
                <p>{message}</p>
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
                    <button className="btn btn-primary" onClick={onConfirm}>Confirmar</button>
                </div>
            </div>
        </div>
    )
}