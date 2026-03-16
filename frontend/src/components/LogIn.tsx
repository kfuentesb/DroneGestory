import React, { useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./commons/hooks/useAuth";

function LogIn() {
  // Tenemos que crear las llamadas al endpoint desde aquí
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Hook de navegación
  const navigate = useNavigate();
  // Uso login
  const { login, setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Credenciales incorrectas");
      }

      const data = await res.json();
      // console.log("Login OK:", data);

      if (data.ok) {
        login(data.username);
        setToken(data.token);
        navigate("/home")
      }

      // aquí puedes guardar token o userId
      // localStorage.setItem("userId", data.userId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", backgroundColor: "#F3F4F6" }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <h4 className="text-center mb-3 fw-normal" style={{ color: "#1E1E1E" }}>
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
          {/* añadido handleSubmit*/}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label" style={{ color: "#1E1E1E" }}>
                Usuario o correo electrónico
              </label>
              <input
                type="text"
                className="form-control"
                // Añadidos value y onchange
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <label className="form-label" style={{ color: "#1E1E1E" }}>
                  Contraseña
                </label>
                <a href="#" style={{ fontSize: "0.8rem", color: "#2F8F5B" }}>
                  ¿Olvidaste la contraseña?
                </a>
              </div>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
              />
            </div>
            {/* Añadido error */}
            {error && <p className="text-danger">{error}</p>}
            <button
              type="submit"
              className="btn w-100"
              // Añadido disabled loading
              disabled={loading}
              style={{
                backgroundColor: "#2F8F5B",
                color: "white",
                fontWeight: "500",
              }}
            >
              {/* Añadido */}
              {loading ? "Cargando..." : "Iniciar Sesión"}
              
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LogIn;

