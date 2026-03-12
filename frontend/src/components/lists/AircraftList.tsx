import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";

type Aircraft = {
  id: number;
  applicantType: "Manufacturer" | "Operator" | "To_the_Manufacturer";
  applicantName: string;
  manufacturerName?: string;     // Sólo si ApplicantType es Manufacturer o To_the_Manufacturer
  operadorName?: string;         // Sólo si ApplicantType es Operator o To_the_Manufacturer
  operatorNumber?: number;       // Sólo si ApplicantType es Operator
  privatelyBuilt: boolean;
  model: string;
  type: "Avion" | "Multirrotor" | "Helicoptero" | "Hibrido" | "Ligero" | "Otro";
  serialNumber?: number;
  aircraftClass: "NO" | "C0" | "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
  mtom?: number;                 // Peso máximo, kg (BigDecimal)
  wingspan?: number;             // En metros (BigDecimal)
  maxSpeed?: number;             // En km/h (BigDecimal)
  impactEnergy?: number;         // En Julios (BigDecimal)
  maxAutonomy?: number;          // En minutos
  camera: boolean;
  tether: boolean;
  cableLenght?: number;          // En metros (BigDecimal)
  powerSource: "Electric" | "Non_Electric";
  powerSourceType?: "Hydrogen" | "Gasoline";
  accessories?: string;
  observations?: string;
  imagePath?: string;
  purchaseDate?: string;         // En formato 'YYYY-MM-DD'
};

export default function AircraftList() {
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [search, setSearch] = useState("");
  const [filteredAircrafts, setFilteredAircrafts] = useState<Aircraft[]>([]);
  const navigate = useNavigate();


  useEffect(() => {
      const loadAircrafts = async () => {
        try {
          const res = await apiFetch("http://localhost:8080/api/auth/aircraft", {
            headers: { "Content-Type": "application/json" }
          });

          if (!res) return; // happens if redirected (403/404)

          const data = await res.json();
          setAircrafts(data);
        } catch (err) {
          console.error(err);
        }
      };
      loadAircrafts();
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
            <SearchBar value={search} onChange={setSearch} />

            {/* Botón añadir aeronave */}
            <ButtonProp onClick={() => navigate("/auth/register-aircraft")}>
              + Añadir aeronave
            </ButtonProp>
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
                  <th>Dimensión</th>
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
                      <td>{a.aircraftClass}</td>
                      <td>{a.mtom}</td>
                      <td>{a.wingspan}</td>
                      <td>{a.maxSpeed}</td>
                      <td>{a.type}</td>
                      <td>{a.impactEnergy}</td>
                      <td>
                        <span
                          className={`badge ${
                            a.camera ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {a.camera ? "Sí" : "No"}
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