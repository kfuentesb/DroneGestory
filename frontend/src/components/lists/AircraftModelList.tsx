import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";

type AircraftModel = {
  id: number;
  manufacturer: string;
  model: string;
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
  ];

  return (
    <div className="container py-4">
      <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
        <div className="card-body">
          <button
            type="button"
            className="btn btn-link p-0 mb-3 d-flex align-items-center text-decoration-none text-muted"
            onClick={() => navigate("/aircrafts")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
            </svg>
            <span className="ms-2 fw-medium">Volver</span>
          </button>

          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Modelos registrados
          </h2>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <SearchBar value={search} placeholder="Buscar por fabricante o modelo..." onChange={setSearch} />
            <ButtonProp onClick={() => navigate("/register-model")}>+ Registrar modelo</ButtonProp>
          </div>

          <ReusableTable
            headers={headers}
            rows={paginatedModels}
            renderRow={(row) => (
              <>
                <td>{row.manufacturer || "-"}</td>
                <td>{row.model || "-"}</td>
              </>
            )}
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
