import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";

const PASSWORD_POLICY = /^(?=.*\d).{8,}$/;

export default function FormResetPasswordWithToken() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Extraemos el token que viaja en la URL (?token=xxxx)
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!token || !email) {
            setError("El enlace de recuperación no es válido, faltan datos esenciales o ha expirado.");
            return;
        }

        if (!PASSWORD_POLICY.test(newPassword)) {
            setError("La contraseña debe tener 8 o más caracteres y al menos 1 número.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
        const res = await apiFetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, email, newPassword }),
        });

        if (res) {
            const data = await res.json();

            if (res.ok || data.ok) {
            setSuccess("Contraseña restablecida correctamente. Redirigiendo al login...");
            setTimeout(() => {
                navigate("/login");
            }, 3500);
            } else {
            setError(data.message || "No se pudo restablecer la contraseña.");
            }
        }
        } catch (err: any) {
        setError(err.message || "Error de red al intentar cambiar la contraseña.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", backgroundColor: "#F3F4F6" }}
        >
        <div style={{ width: "100%", maxWidth: "420px" }}>
            <h4 className="text-center mb-3 fw-normal" style={{ color: "#1E1E1E" }}>
            Establecer nueva contraseña
            </h4>

            <div
            className="card p-4 shadow-sm"
            style={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
            }}
            >
            {!token || !email ? (
                <div className="alert alert-danger mb-0">
                    Enlace de recuperación inválido o incompleto. Por favor, solicita uno nuevo.
                </div>
            ) : success ? (
                <div className="alert alert-success mb-0 py-3 text-center">
                    {success}
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                <p className="text-muted small mb-3">
                    Por favor, introduzca su nueva contraseña de acceso a DroneGestor.
                </p>

                <div className="mb-3">
                    <label className="form-label" style={{ color: "#1E1E1E" }}>
                    Nueva contraseña
                    </label>
                    <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
                    autoComplete="new-password"
                    required
                    />
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Mínimo 8 caracteres y al menos 1 número.
                    </small>
                </div>

                <div className="mb-3">
                    <label className="form-label" style={{ color: "#1E1E1E" }}>
                    Confirmar nueva contraseña
                    </label>
                    <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
                    autoComplete="new-password"
                    required
                    />
                </div>

                {error && <div className="alert alert-danger py-2 small">{error}</div>}

                <button
                    type="submit"
                    className="btn w-100"
                    disabled={loading}
                    style={{
                    backgroundColor: "#2F8F5B",
                    color: "white",
                    fontWeight: "500",
                    }}
                >
                    {loading ? "Guardando..." : "Cambiar contraseña"}
                </button>
                </form>
            )}
            </div>
        </div>
        </div>
    );
}