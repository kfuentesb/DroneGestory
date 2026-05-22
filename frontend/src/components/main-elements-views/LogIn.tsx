import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../commons/hooks/useAuth";
import { apiFetch } from "../../api";

function LogIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Control del Modal de recuperación
  const [showModal, setShowModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [modalMessage, setModalMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const navigate = useNavigate();
  const { login, setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res) {
        const data = await res.json();
        
        const cleanRoles = Array.isArray(data.roles) && data.roles.length > 0
          ? data.roles.map((rawRole: string) => rawRole.replace("ROLE_", ""))
          : ["PILOT"];

        login(data.id, data.username, cleanRoles); 
        setToken(data.token);
        // Inicializar UTC
        const savedTz = localStorage.getItem("userTimezone");
        if (savedTz) {
          localStorage.setItem("userTimezone", "+01:00");
        }
        
        navigate("/home");
      }
    } catch (err: any) {
      const errorMsg = err.message || "";
      if (
        errorMsg.includes("JSON.parse") || 
        errorMsg.includes("Unexpected character") || 
        errorMsg.includes("Failed to fetch") || 
        errorMsg.includes("fetch failed")
      ) {
        setError("No ha cargado el backend");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // MANEJO DEL ENVÍO AL NUEVO BACKEND
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setModalLoading(true);
    setModalMessage(null);

    try {
      const res = await apiFetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      if (res) {
        const data = await res.json();
        
        if (res.ok || data.ok) {
          setModalMessage({
            text: data.message || "Si el correo electrónico existe en nuestro sistema, recibirá un enlace para cambiar su contraseña.",
            isError: false,
          });
          setResetEmail(""); // Limpiamos el input tras el éxito empresarial
        } else {
          setModalMessage({
            text: data.message || "No se pudo procesar la solicitud.",
            isError: true,
          });
        }
      }
    } catch (err: any) {
      // Captura si el backend está caído o devuelve errores crudos de red
      const errorMsg = err.message || "";
      if (errorMsg.includes("fetch") || errorMsg.includes("JSON")) {
        setModalMessage({ text: "No se pudo conectar con el servidor.", isError: true });
      } else {
        setModalMessage({ text: errorMsg || "Error al procesar la solicitud.", isError: true });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setResetEmail("");
    setModalMessage(null);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", backgroundColor: "#F3F4F6" }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <h4 className="text-center mb-3 fw-normal fw-bold" style={{ color: "#1E1E1E" }}>
          Iniciar sesión en Drone Gestor
        </h4>

        <div
          className="card p-4 shadow-sm"
          style={{
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            backgroundColor: "#FFFFFF",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" style={{ color: "#1E1E1E" }}>
                Usuario o correo electrónico
              </label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
                required
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <label className="form-label" style={{ color: "#1E1E1E" }}>
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="btn btn-link p-0 text-decoration-none"
                  style={{ fontSize: "0.8rem", color: "#2F8F5B" }}
                >
                  ¿Olvidaste la contraseña?
                </button>
              </div>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
                required
              />
            </div>

            {error && <p className="text-danger small">{error}</p>}

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
              {loading ? "Cargando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>

      {/* --- MODAL DE RECUPERACIÓN DE CONTRASEÑA --- */}
      {showModal && (
        <>
          <div 
            className="modal-backdrop fade show" 
            onClick={closeModal} 
            style={{ zIndex: 1040 }}
          />
          
          <div 
            className="modal fade show d-block" 
            tabIndex={-1} 
            style={{ zIndex: 1050, top: "20%" }}
          >
            <div className="modal-dialog">
              <div className="modal-content" style={{ borderRadius: "8px" }}>
                <div className="modal-header">
                  <h5 className="modal-title" style={{ color: "#1E1E1E" }}>
                    Restablecer contraseña
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={closeModal}
                    aria-label="Close"
                  />
                </div>
                
                <form onSubmit={handleResetPasswordSubmit}>
                  <div className="modal-body">
                    <p style={{ color: "#4B5563", fontSize: "0.95rem" }}>
                      Introduzca su email y le enviaremos un correo para su cambio de contraseña.
                    </p>
                    
                    <div className="mb-3">
                      <label className="form-label" style={{ color: "#1E1E1E" }}>
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
                        required
                      />
                    </div>

                    {modalMessage && (
                      <div className={`alert ${modalMessage.isError ? "alert-danger" : "alert-success"} py-2 small`}>
                        {modalMessage.text}
                      </div>
                    )}
                  </div>
                  
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={closeModal}
                      disabled={modalLoading}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn" 
                      disabled={modalLoading}
                      style={{ backgroundColor: "#2F8F5B", color: "white" }}
                    >
                      {modalLoading ? "Enviando..." : "Enviar correo"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default LogIn;