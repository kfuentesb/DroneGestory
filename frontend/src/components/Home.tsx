import React from "react";
import { NavLink } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useAuth } from "./AuthProvider";

const Home: React.FC = () => {
  const { username } = useAuth();

  if (username) {
    // Usuario conectado, mostrar dashboard
    return <main>
      <Dashboard />
    </main>;
  }
  
  return (
    <main style={{ backgroundColor: "#F3F4F6", minHeight: "100vh" }}>
      {/* HERO */}
      <section className="container py-5">
        <div className="d-flex justify-content-center g-5">
          <div className="col-md-6">
            <span
              className="badge mb-3"
              style={{
                backgroundColor: "#E6F4EC",
                color: "#1F6B43",
                padding: "0.4rem 0.8rem",
                borderRadius: "999px",
              }}
            >
              Plataforma corporativa
            </span>
            <h1 className="fw-bold card p-4 shadow-sm" style={{ color: "#1E1E1E" }}>
              Gestión profesional de drones
            </h1>
            <p className="" style={{ color: "#6B7280", fontSize: "1.05rem" }}>
              Controla pilotos, aeronaves, operaciones, documentación y trazabilidad
              con una interfaz moderna y segura.
            </p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <NavLink className="nav-link" to="/auth/login">
              <button
                className="btn px-4"
                style={{ backgroundColor: "#2F8F5B", color: "white" }}
              >
                Empezar ahora
              </button>
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;