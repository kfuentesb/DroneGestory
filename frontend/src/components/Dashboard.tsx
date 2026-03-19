// Dashboard.js
import React, { useEffect, useState } from "react";
import { useAuth } from "./commons/hooks/useAuth";
import { apiFetch } from "../api";

export default function Dashboard() {
  const { username } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("http://localhost:8080/api/auth/dashboard")
      .then((res) => {
        if (!res) return; // apiFetch maneja redirecciones
        if (!res.ok) throw new Error("Error cargando resumen");
        return res.json();
      })
      .then((data) => setSummary(data))
      .catch((err) => setSummary({ error: err.message }))
      .finally(() => setLoading(false));
  }, []);


  return (
    <main style={{ backgroundColor: "#F3F4F6", minHeight: "100vh" }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="text-primary mb-0">
            <i className="bi bi-speedometer2 me-2" />
            Panel Principal
          </h2>
          <p className="text-muted mt-2">
            {username ? `Bienvenido, ${username}` : "Bienvenido"}
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <h5 className="mb-3 text-muted">Resumen del Sistema</h5>
      <div className="row g-4 mb-4">
        {loading ? (
          <div className="col-12 text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : summary?.error ? (
          <div className="col-12 text-center text-danger my-5">
            Error: {summary.error}
          </div>
        ) : (
          <>
            {/* Usuarios */}
            <div className="col-md-3 col-lg-2">
              <div className="card stat-card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-person fs-1 mb-2"></i>
                  <h3 className="mb-1">{summary.totalUsuarios}</h3>
                  <p className="mb-0">Usuarios</p>
                </div>
              </div>
            </div>
            {/* Pilotos */}
            <div className="col-md-3 col-lg-2">
              <div className="card stat-card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-person-badge fs-1 mb-2"></i>
                  <h3 className="mb-1">{summary.totalPilotos}</h3>
                  <p className="mb-0">Pilotos</p>
                </div>
              </div>
            </div>
            {/* Operaciones */}
            <div className="col-md-3 col-lg-2">
              <div className="card stat-card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-list-task fs-1 mb-2"></i>
                  <h3 className="mb-1">{summary.totalOperaciones}</h3>
                  <p className="mb-0">Operaciones</p>
                </div>
              </div>
            </div>
            {/* Drones/Aeronaves */}
            <div className="col-md-3 col-lg-2">
              <div className="card stat-card h-100">
                <div className="card-body text-center">
                  <i className="bi bi-airplane fs-1 mb-2"></i>
                  <h3 className="mb-1">{summary.totalDrones}</h3>
                  <p className="mb-0">Drones</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}