import React from "react";
import { useAuth } from "./commons/hooks/useAuth";
// Si tienes iconos de Bootstrap instalados, puedes usar <i className="bi ..." />
// o puedes reemplazar por SVGs/otros iconos

export default function Dashboard() {
  const { username } = useAuth();

  // Ejemplo de totales para demo, reemplaza por props o llamadas API si luego tienes datos reales
  const totalUsuarios = 3;
  const totalAircrafts = 3;

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
        {/* Usuarios */}
        <div className="col-md-4 col-lg-2">
          <div className="card stat-card h-100">
            <div className="card-body text-center">
              <i className="bi bi-person fs-1 mb-2"></i>
              <h3 className="mb-1">{totalUsuarios}</h3>
              <p className="mb-0">Usuarios</p>
            </div>
          </div>
        </div>
        {/* Aeronaves */}
        <div className="col-md-4 col-lg-2">
          <div className="card stat-card h-100">
            <div className="card-body text-center">
              <i className="bi bi-airplane fs-1 mb-2"></i>
              <h3 className="mb-1">{totalAircrafts}</h3>
              <p className="mb-0">Aeronaves</p>
            </div>
          </div>
        </div>
        {/* Aquí podrás añadir los siguientes elementos (empresas, operaciones, etc) más adelante */}
      </div>
    </main>
  );
}
