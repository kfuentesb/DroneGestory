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
  const [search, setSearch] = useState("");
  const [filteredAircrafts, setFilteredAircrafts] = useState<Aircraft[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulación de datos de ejemplo
    const data: Aircraft[] = [
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
      {
    id: 4,
    model: "Yuneec Breeze",
    serialNumber: 334455,
    class: "C1",
    mtom: 0.385,
    dimension: "0.24m",
    velocity: 50,
    configuration: "Quadcopter",
    impactEnergy: 6,
    hasCamera: true,
  },
  {
    id: 5,
    model: "DJI Inspire 2",
    serialNumber: 776655,
    class: "C3",
    mtom: 4.0,
    dimension: "0.60m",
    velocity: 94,
    configuration: "Quadcopter",
    impactEnergy: 27,
    hasCamera: true,
  },
  {
    id: 6,
    model: "Parrot Disco",
    serialNumber: 123789,
    class: "C1",
    mtom: 0.75,
    dimension: "1.15m",
    velocity: 80,
    configuration: "Fixed Wing",
    impactEnergy: 15,
    hasCamera: false,
  },
  {
    id: 7,
    model: "HubSan Zino",
    serialNumber: 998877,
    class: "C0",
    mtom: 0.7,
    dimension: "0.24m",
    velocity: 60,
    configuration: "Quadcopter",
    impactEnergy: 7,
    hasCamera: true,
  },
  {
    id: 8,
    model: "Ryze Tello",
    serialNumber: 556644,
    class: "C0",
    mtom: 0.08,
    dimension: "0.10m",
    velocity: 28,
    configuration: "Quadcopter",
    impactEnergy: 1,
    hasCamera: false,
  },
  {
    id: 9,
    model: "Parrot Anafi",
    serialNumber: 119911,
    class: "C1",
    mtom: 0.32,
    dimension: "0.25m",
    velocity: 55,
    configuration: "Quadcopter",
    impactEnergy: 5,
    hasCamera: false,
  },
  {
    id: 10,
    model: "DJI Mavic Mini",
    serialNumber: 432198,
    class: "C0",
    mtom: 0.249,
    dimension: "0.14m",
    velocity: 45,
    configuration: "Quadcopter",
    impactEnergy: 3,
    hasCamera: true,
  },
  {
    id: 11,
    model: "Walkera Voyager 4",
    serialNumber: 654321,
    class: "C3",
    mtom: 3.5,
    dimension: "0.67m",
    velocity: 81,
    configuration: "Quadcopter",
    impactEnergy: 22,
    hasCamera: true,
  },
  {
    id: 12,
    model: "DJI Phantom 4",
    serialNumber: 876543,
    class: "C1",
    mtom: 1.38,
    dimension: "0.35m",
    velocity: 72,
    configuration: "Quadcopter",
    impactEnergy: 11,
    hasCamera: true,
  },
  {
    id: 13,
    model: "PowerVision PowerEgg",
    serialNumber: 246813,
    class: "C2",
    mtom: 2.1,
    dimension: "0.45m",
    velocity: 64,
    configuration: "Quadcopter",
    impactEnergy: 13,
    hasCamera: true,
  },
  {
    id: 14,
    model: "Holy Stone HS720",
    serialNumber: 187654,
    class: "C0",
    mtom: 0.225,
    dimension: "0.11m",
    velocity: 35,
    configuration: "Quadcopter",
    impactEnergy: 2,
    hasCamera: true,
  },
  {
    id: 15,
    model: "Syma X5C",
    serialNumber: 135791,
    class: "C0",
    mtom: 0.1,
    dimension: "0.12m",
    velocity: 15,
    configuration: "Quadcopter",
    impactEnergy: 1,
    hasCamera: false,
  },
  {
    id: 16,
    model: "DJI FPV",
    serialNumber: 108642,
    class: "C1",
    mtom: 0.795,
    dimension: "0.29m",
    velocity: 140,
    configuration: "Quadcopter",
    impactEnergy: 19,
    hasCamera: true,
  },
  {
    id: 17,
    model: "JJRC X12",
    serialNumber: 192837,
    class: "C0",
    mtom: 0.437,
    dimension: "0.20m",
    velocity: 45,
    configuration: "Quadcopter",
    impactEnergy: 5,
    hasCamera: true,
  },
  {
    id: 18,
    model: "Eachine E511S",
    serialNumber: 564738,
    class: "C0",
    mtom: 0.281,
    dimension: "0.18m",
    velocity: 16,
    configuration: "Quadcopter",
    impactEnergy: 2,
    hasCamera: true,
  },
  {
    id: 19,
    model: "Wingsland S6",
    serialNumber: 192837,
    class: "C0",
    mtom: 0.260,
    dimension: "0.13m",
    velocity: 35,
    configuration: "Quadcopter",
    impactEnergy: 1,
    hasCamera: false,
  },
  {
    id: 20,
    model: "Parrot Bebop 2",
    serialNumber: 719283,
    class: "C1",
    mtom: 0.5,
    dimension: "0.28m",
    velocity: 65,
    configuration: "Quadcopter",
    impactEnergy: 6,
    hasCamera: true,
  },
  {
    id: 21,
    model: "DJI Air 2S",
    serialNumber: 852963,
    class: "C1",
    mtom: 0.595,
    dimension: "0.22m",
    velocity: 68,
    configuration: "Quadcopter",
    impactEnergy: 8,
    hasCamera: true,
  },
  {
    id: 22,
    model: "Yuneec Typhoon H",
    serialNumber: 415263,
    class: "C2",
    mtom: 1.85,
    dimension: "0.36m",
    velocity: 70,
    configuration: "Hexacopter",
    impactEnergy: 18,
    hasCamera: true,
  },
  {
    id: 23,
    model: "Parrot Swing",
    serialNumber: 963852,
    class: "C0",
    mtom: 0.295,
    dimension: "0.32m",
    velocity: 30,
    configuration: "Fixed Wing",
    impactEnergy: 3,
    hasCamera: false,
  }
    ];
    setAircrafts(data);
    setFilteredAircrafts(data);
    // Si deseas cargar desde backend, sustituye por:
    // const res = await apiFetch(...), luego setAircrafts(setFilteredAircrafts(res.json()));
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredAircrafts(aircrafts);
    } else {
      setFilteredAircrafts(
        aircrafts.filter((a) =>
          a.model.toLowerCase().includes(search.trim().toLowerCase())
        )
      );
    }
  }, [search, aircrafts]);

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

          {/* Barra búsqueda + Añadir aeronave */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Input de búsqueda */}
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por modelo..."
              style={{
                backgroundColor: "#F3F4F6",
                borderColor: "#D1D5DB",
                maxWidth: 400,
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              onClick={() => navigate("/auth/register-aircraft")}
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
                {filteredAircrafts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center text-muted">
                      No hay aeronaves registradas.
                    </td>
                  </tr>
                ) : (
                  filteredAircrafts.map((a) => (
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
                          className={`badge ${
                            a.hasCamera ? "bg-success" : "bg-secondary"
                          }`}
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