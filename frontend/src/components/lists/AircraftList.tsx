import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import Pagination from "../commons/props/Pagination";
import { useAuth } from "../commons/hooks/useAuth";

import DronePlusIcon from "../../assets/commons/drone_plus_white.svg";
import LoadingSpinner from "../commons/Loading";

type Aircraft = {
  id: number;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  aircraftClass: "No" | "C0" | "C1" | "C2" | "C3" | "C4" | "Legacy";
  mtom?: number;
  wingspan?: number;
  maxSpeed?: number;
  config: "Avion" | "Multirrotor" | "Helicoptero" | "Hibrido" | "Ligero" | "Otro";
  impactEnergy?: number;
  fechaFab?: string;
  hasCamera: boolean;
  powerSource: "Electric" | "Non_Electric";
  powerSourceType?: "Hydrogen" | "Gasoline";
};

export default function AircraftList() {
  const formatMonthYear = (value?: string | null) => {
    if (!value) return "-";
    const [year, month] = value.split("-");
    return year && month ? `${month}/${year}` : value;
  };

  const { roles } = useAuth();

  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAircrafts = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/aircraft`, {
          headers: { "Content-Type": "application/json" }
        });

        if (!res) return;

        const data = await res.json();
        setAircrafts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAircrafts();
  }, []);

  const filteredAircrafts = useSearchFilter(aircrafts, search, (a) => [
    a.manufacturer ?? "",
    a.model ?? "",
    a.serialNumber ?? "",
    a.aircraftClass,
    a.config,
    a.fechaFab ?? "",
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, aircrafts.length]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando aeronaves..." />;
  }

  const paginatedAircrafts = filteredAircrafts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const modelHeaders: TableHeader[] = [
    { label: "Fabricante", key: "manufacturer", sortable: true },
    { label: "Modelo", key: "model", sortable: true },
    { label: "Nº Serie", key: "serialNumber", sortable: true },
    { label: "Clase", key: "aircraftClass", sortable: true },
    { label: "MTOM", key: "mtom", sortable: true },
    { label: "Dimension", key: "wingspan", sortable: true },
    { label: "Velocidad", key: "maxSpeed", sortable: true },
    { label: "Configuracion", key: "config", sortable: true },
    { label: "Energia impacto", key: "impactEnergy", sortable: true },
    { label: "Fecha fabricacion", key: "fechaFab", sortable: true },
    { label: "Camara", key: "hasCamera", sortable: true },
  ];

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

          <div className="d-flex justify-content-between align-items-center mb-4">
            <SearchBar value={search} onChange={setSearch} />

            <div className="d-flex align-items-stretch gap-2">
              {(roles.includes("ADMIN") || roles.includes("MANAGER")) && (
                <ButtonProp onClick={() => navigate("/aircraft-models")}>
                  Listar modelos
                </ButtonProp>
              )}
            </div>
          </div>

          <ReusableTable
            headers={modelHeaders}
            rows={paginatedAircrafts}
            renderRow={(a) => (
              <>
                <td>{a.manufacturer || "N/A"}</td>
                <td>{a.model || "N/A"}</td>
                <td>{a.serialNumber ?? "-"}</td>
                <td>{a.aircraftClass}</td>
                <td>
                  {a.mtom ?? "-"} <b> Kg</b>
                </td>
                <td>{a.wingspan ?? "-"} <b>m</b></td>
                <td>{a.maxSpeed ?? "-"} <b>m/s</b></td>
                <td>{a.config}</td>
                <td>{a.impactEnergy ?? "-"} <b>J</b></td>
                <td>{formatMonthYear(a.fechaFab)}</td>
                <td className="text-center">
                  <span className={`badge ${a.hasCamera ? "bg-success" : "bg-secondary"}`}>
                    {a.hasCamera ? "Si" : "No"}
                  </span>
                </td>
              </>
            )}
            onRowClick={(a) => navigate(`/aircrafts/${a.id}`)}
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
