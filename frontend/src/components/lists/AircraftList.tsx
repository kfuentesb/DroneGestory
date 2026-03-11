import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";

type Aircraft = {
  id: number;
  model: string;
  serialNumber: number;
  class: string;
  mtom: number; // Peso máximo al despegue en kg
  dimension: string;
  velocity: number;
  configuration: string;
  impactEnergy: number;
  hasCamera: boolean;
};

export default function AircraftList() {
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Ejemplo de lista sin paginación ni errores:
    setAircrafts([
      {
        id: 1,
        model: "DJI Matrice 300",
        serialNumber: 123456,
        class: "C2",
        mtom: 6.3,
        dimension: "0.82m",
        velocity: 80,
        configuration: "Quadcopter",
        impactEnergy: 20,
        hasCamera: true,
      },
      {
        id: 2,
        model: "Parrot Anafi",
        serialNumber: 654321,
        class: "C1",
        mtom: 0.32,
        dimension: "0.25m",
        velocity: 55,
        configuration: "Quadcopter",
        impactEnergy: 5,
        hasCamera: false,
      },
      {
        id: 3,
        model: "Autel Evo II",
        serialNumber: 112233,
        class: "C2",
        mtom: 1.2,
        dimension: "0.3m",
        velocity: 72,
        configuration: "Hexacopter",
        impactEnergy: 12,
        hasCamera: true,
      },
    ]);
    // Si deseas cargar desde backend, sustituye lo de arriba por una llamada a la API y usa setAircrafts con el resultado.
  }, []);

  return (
    <div className="container py-4">
      <div
        className="card shadow-sm"
        style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
      >
        <div className="card-body">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Lista de Aeronaves
          </h2>

          {/* Barra búsqueda + Añadir usuario */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Solo text area (input) */}
            <input
              type="text"
              className="form-control"
              placeholder="Buscar usuario..."
              style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB", maxWidth: 400 }}
            />

            {/* Botón añadir dron */}
            <button
              className="btn"
              style={{
                backgroundColor: "#2F8F5B",
                color: "#FFFFFF",
                fontWeight: "bold",
                minWidth: "135px",
              }}
              onClick={() => navigate("/auth/register-user")}
            >
              + Añadir aeronave
            </button>
          </div>

          <div className="table-responsive">
            <table
              className="table table-hover align-middle"
              style={{ borderColor: "#E5E7EB" }}
            >
              <thead className="table-dark">
                <tr>
                  <th>Modelo</th>
                  <th>Nº Serie</th>
                  <th>Clase</th>
                  <th>MTOM (Kg)</th>
                  <th>Dimensión Característica</th>
                  <th>Velocidad (Km/h)</th>
                  <th>Configuración</th>
                  <th>Energía impacto (J)</th>
                  <th>Tiene cámara</th>
                </tr>
              </thead>
              <tbody>
                {aircrafts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">
                      No hay aeronaves registradas.
                    </td>
                  </tr>
                ) : (
                  aircrafts.map((a) => (
                    <tr
                      key={a.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/auth/aircraft/${a.id}`)}
                    >
                      <td>{a.model}</td>
                      <td>{a.serialNumber}</td>
                      <td>{a.class}</td>
                      <td>{a.mtom}</td>
                      <td>{a.dimension}</td>
                      <td>{a.velocity}</td>
                      <td>{a.configuration}</td>
                      <td>{a.impactEnergy}</td>
                      <td>
                        <span
                          className={`badge ${a.hasCamera ? "bg-success" : "bg-secondary"}`}
                        >
                          {a.hasCamera ? "Sí" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-muted mt-3 mb-0" style={{ color: "#6B7280" }}></p>
        </div>
      </div>
    </div>
  );
}