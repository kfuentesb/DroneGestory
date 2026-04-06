import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { ReusableTable } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import Pagination from "../commons/props/Pagination";

import DronePlusIcon from "../../assets/commons/drone_plus_white.svg";

type Aircraft = {
  id: number;
  // Obligatorios
  manufacturer?: string;     // Sólo si ApplicantType es Manufacturer o To_the_Manufacturer
  model: string;
  serialNumber?: string;
  aircraftClass: "No" | "C0" | "C1" | "C2" | "C3" | "C4";
  mtom?: number;                 // Peso máximo, kg (BigDecimal)
  wingspan?: number;             // En metros (BigDecimal)
  maxSpeed?: number;             // En m/s (BigDecimal)
  config: "Avion" | "Multirrotor" | "Helicoptero" | "Hibrido" | "Ligero" | "Otro";
  impactEnergy?: number;         // En Julios (BigDecimal)
  hasCamera: boolean;
  
  // Opcionales -> Más detalles
  applicantType: "Manufacturer" | "Operator" | "To_the_Manufacturer";
  applicantName: string;
  operadorName?: string;         // Sólo si ApplicantType es Operator o To_the_Manufacturer
  operatorNumber?: number;       // Sólo si ApplicantType es Operator
  privatelyBuilt: boolean;
  maxAutonomy?: number;          // En minutos
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();


  useEffect(() => {
    const loadAircrafts = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/auth/aircraft`, {
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

  const filteredAircrafts = useSearchFilter(aircrafts, search, (a) => [
    a.manufacturer ?? "",
    a.model,
    a.serialNumber ?? "",
    a.aircraftClass,
    a.config,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, aircrafts.length]);

  const paginatedAircrafts = filteredAircrafts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container py-4">
      <div
        className="card shadow-sm"
        style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
      >
        <div className="card-body">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Aeronaves registradas
          </h2>

          {/* Barra búsqueda + Añadir aeronave */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Input de búsqueda */}
            <SearchBar value={search} onChange={setSearch} />

            {/* Botón añadir aeronave */}
            <ButtonProp onClick={() => navigate("/auth/register-aircraft")}>
              <img src={DronePlusIcon} style={{width: "40px", height:"40px"}}/>
            </ButtonProp>
          </div>

          <ReusableTable
            headers={[
              "Fabricante",
              "Modelo",
              "Nº Serie",
              "Clase",
              "MTOM (Kg)",
              "Dimensión (m)",
              "Velocidad (m/s)",
              "Configuración",
              "Energía impacto (J)",
              "Tiene cámara",
            ]}
            rows={paginatedAircrafts}
            renderRow={(a) => (
              <>
                <td>{a.manufacturer}</td>
                <td>{a.model}</td>
                <td>{a.serialNumber ?? "-"}</td>
                <td>{a.aircraftClass}</td>
                <td>{a.mtom ?? "-"}</td>
                <td>{a.wingspan ?? "-"}</td>
                <td>{a.maxSpeed ?? "-"}</td>
                <td>{a.config}</td>
                <td>{a.impactEnergy ?? "-"}</td>
                <td className = "text-center">
                  <span className={`badge ${a.hasCamera ? "bg-success" : "bg-secondary"}`}>
                    {a.hasCamera ? "Sí" : "No"}
                  </span>
                </td>
              </>
            )}
            onRowClick={(a) => navigate(`/auth/aircrafts/${a.id}`)}
            emptyText="No hay aeronaves registradas."
          />

          <Pagination
            totalItems={filteredAircrafts.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
          <p className="text-muted mt-3 mb-0" style={{ color: "#6B7280" }}></p>
        </div>
      </div>
    </div>
  );
}
