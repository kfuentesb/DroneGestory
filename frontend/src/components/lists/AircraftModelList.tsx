import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";

import { styles } from "../../global-const/styles";
import arroBackIcon from '../../assets/commons/arrow_back_white.svg';

type AircraftModel = {
  id: number;
  manufacturer: string;
  model: string;
  aircraftClassDefault?: string | null;
  mtomDefault?: number | null;
  wingspanDefault?: number | null;
  maxSpeedDefault?: number | null;
  configDefault?: string | null;
  impactEnergyDefault?: number | null;
  hasCameraDefault?: boolean | null;
  privatelyBuiltDefault?: boolean | null;
  hasParachuteDefault?: boolean | null;
  hasEnsuranceDefault?: boolean | null;
  hasFTSDefault?: boolean | null;
  cautiveDefault?: string | null;
  accessoriesDefault?: string | null;
  powerSourceDefault?: string | null;
  powerSourceTypeDefault?: string | null;
};

export default function AircraftModelList() {
  const navigate = useNavigate();
  const [models, setModels] = useState<AircraftModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch("/api/aircraft-models", {
          headers: { "Content-Type": "application/json" },
        });

        if (!res) return;
        const data = await res.json();
        setModels(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  const filteredModels = useSearchFilter(models, search, (model) => [
    model.manufacturer ?? "",
    model.model ?? "",
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, models.length]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando modelos..." />;
  }

  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const headers: TableHeader[] = [
    { label: "Fabricante", key: "manufacturer", sortable: true },
    { label: "Modelo", key: "model", sortable: true },
    { label: "Default values", key: "hasDefaultValues", sortable: false },
  ];

  const hasDefaultValues = (row: AircraftModel) =>
    row.aircraftClassDefault != null ||
    row.mtomDefault != null ||
    row.wingspanDefault != null ||
    row.maxSpeedDefault != null ||
    row.configDefault != null ||
    row.impactEnergyDefault != null ||
    row.hasCameraDefault != null ||
    row.privatelyBuiltDefault != null ||
    row.hasParachuteDefault != null ||
    row.hasEnsuranceDefault != null ||
    row.hasFTSDefault != null ||
    row.cautiveDefault != null ||
    row.powerSourceDefault != null ||
    row.powerSourceTypeDefault != null ||
    (row.accessoriesDefault != null && row.accessoriesDefault.trim() !== "");

  return (
    <div className="container py-4">
      <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
        <div className="card-body">

          <button 
            className="btn d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
            onClick={() => navigate("/aircrafts")}
            style={styles.backBtn}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 130, 69, 0.1)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            title="Volver"
          >
              <img src={arroBackIcon} alt="Back" style={styles.backIcon} />
              <span className="ms-2 fw-medium text-muted" style={{ fontSize: '0.9rem' }}/>
          </button>

          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Modelos registrados
          </h2>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <SearchBar value={search} placeholder="Buscar por fabricante o modelo..." onChange={setSearch} />
          </div>

          <ReusableTable
            headers={headers}
            rows={paginatedModels}
            renderRow={(row) => (
              <>
                <td>{row.manufacturer || "-"}</td>
                <td>{row.model || "-"}</td>
                <td className="text-center">
                  <span className={`badge ${hasDefaultValues(row) ? "bg-success" : "bg-danger"}`}>
                    {hasDefaultValues(row) ? "Sí" : "No"}
                  </span>
                </td>
              </>
            )}
            onRowClick={(row) => navigate(`/aircraft-models/${row.id}`)}
            emptyText="No hay modelos registrados."
          />

          <Pagination
            totalItems={filteredModels.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
