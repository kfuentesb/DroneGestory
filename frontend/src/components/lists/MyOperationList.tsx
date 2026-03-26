// MyOperationList.tsx
import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { ReusableTable } from "../commons/props/ReusableTable";
import Pagination from "../commons/props/Pagination";

import DronePlusIcon from "../../assets/commons/drone_plus_white.svg";

type Operation = {
  idOperacion: number;
  nombreOperacion: string;
  nombreCreador: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  estado: string;
  a4: string;
  a5: string;
  a6: string;
  a7: string;
  a8: string;
};

export default function MyOperationList() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [search, setSearch] = useState("");
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleString() : "-";

  useEffect(() => {
    const loadMyOperations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/auth/operations/details/mine`, {
          headers: { "Content-Type": "application/json" }
        });

        if (!res) return;

        const data = await res.json();
        setOperations(data);
      } catch (err) {
        console.error("Error cargando mis operaciones:", err);
        setError("No se pudieron cargar tus operaciones. Inténtalo de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };
    loadMyOperations();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredOperations(operations);
    } else {
      setFilteredOperations(
        operations.filter((o) =>
          o.nombreOperacion.toLowerCase().includes(search.trim().toLowerCase())
        )
      );
    }
  }, [search, operations]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, operations.length]);

  const paginatedOperations = filteredOperations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted">Cargando tus operaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
          <div className="card-body">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div
        className="card shadow-sm"
        style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
      >
        <div className="card-body">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Mis operaciones
          </h2>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <SearchBar 
              value={search} 
              placeholder="Buscar en mis operaciones..." 
              onChange={setSearch} 
            />

            <ButtonProp onClick={() => navigate("/auth/register-operation")}>
              <img src={DronePlusIcon} style={{ width: "40px", height: "40px" }} alt="Nueva operación" />
            </ButtonProp>
          </div>

          <ReusableTable
            headers={["Nombre", "F. Creación", "A4", "A5", "A6", "A7", "A8", "Última Actualización", "Estado"]}
            rows={paginatedOperations}
            renderRow={(o) => (
              <>
                <td>{o.nombreOperacion}</td>
                <td>{formatDate(o.fechaCreacion)}</td>
                <td>{o.a4 ?? "-"}</td>
                <td>{o.a5 ?? "-"}</td>
                <td>{o.a6 ?? "-"}</td>
                <td>{o.a7 ?? "-"}</td>
                <td>{o.a8 ?? "-"}</td>
                <td>{formatDate(o.fechaActualizacion)}</td>
                <td className= "text-center">
                  <span className={`badge bg-${getEstadoColor(o.estado)}`}>
                    {o.estado}
                  </span>
                </td>
              </>
            )}
            onRowClick={(o) => navigate(`/auth/operations/${o.idOperacion}`)}
            emptyText="No tienes operaciones registradas."
          />

          <Pagination
            totalItems={filteredOperations.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
          
          {operations.length > 0 && (
            <p className="text-muted mt-3 mb-0" style={{ color: "#6B7280", fontSize: "0.875rem" }}>
              Mostrando {filteredOperations.length} de {operations.length} operación{operations.length !== 1 ? 'es' : ''}
              {search.trim() && ` (filtradas de ${operations.length} total)`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function getEstadoColor(estado: string): string {
  switch (estado) {
    case "EN_CURSO":
      return "warning";
    case "COMPLETADA":
      return "success";
    case "CANCELADA":
      return "danger";
    case "PENDIENTE":
      return "info";
    default:
      return "secondary";
  }
}
