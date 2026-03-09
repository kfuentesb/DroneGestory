import React from "react";

const Home: React.FC = () => {
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
            <h1 className="fw-bold" style={{ color: "#1E1E1E" }}>
              Gestión profesional de drones en un solo lugar
            </h1>
            <p style={{ color: "#6B7280", fontSize: "1.05rem" }}>
              Controla pilotos, aeronaves, operaciones, documentación y trazabilidad
              con una interfaz moderna y segura.
            </p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button
                className="btn px-4"
                style={{ backgroundColor: "#2F8F5B", color: "white" }}
              >
                Empezar ahora
              </button>
              <button
                className="btn px-4"
                style={{
                  border: "1px solid #2F8F5B",
                  color: "#2F8F5B",
                  background: "transparent",
                }}
              >
                Solicitar demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="container py-5">
        <h3 className="fw-bold text-center mb-4" style={{ color: "#1E1E1E" }}>
          ¿Por qué elegirnos?
        </h3>
        <div className="row g-4">
          {[
            "Gestión centralizada y trazable",
            "Cumplimiento normativo y documental",
            "Informes automáticos para auditorías",
          ].map((text, i) => (
            <div className="col-md-4" key={i}>
              <div
                className="p-4 h-100"
                style={{
                  background: "#FFFFFF",
                  borderRadius: "10px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <h6 className="fw-semibold" style={{ color: "#1E1E1E" }}>
                  {text}
                </h6>
                <p className="small text-muted">
                  Optimiza operaciones de vuelo con un sistema fiable y diseñado
                  para organizaciones profesionales.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        className="py-5"
        style={{ backgroundColor: "#1E1E1E", color: "white" }}
      >
        <div className="container text-center">
          <h3 className="fw-bold">Lleva tu operación al siguiente nivel</h3>
          <p className="text-muted">
            Digitaliza tu gestión de drones con una plataforma corporativa segura.
          </p>
          <button
            className="btn mt-3 px-4"
            style={{ backgroundColor: "#2F8F5B", color: "white" }}
          >
            Solicitar acceso
          </button>
        </div>
      </section>
    </main>
  );
};

export default Home;