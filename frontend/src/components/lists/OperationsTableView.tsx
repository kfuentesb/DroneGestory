import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { ReusableTable } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import FlyDroneIconPlus from "../../assets/sidebar/fly_drone_white.svg";
import { fetchOperations } from "../operations/operation.api";
import type { OperationListDTO } from "../operations/operation.types";
import Pagination from "../commons/props/Pagination";
import {
  formatDateTime,
  getAnexoColorStyle,
  getOperationStatusStyle,
} from "../operations/operation.utils";

type OperationsTableViewProps = {
  title: string;
  endpoint: string;
  emptyText: string;
};

function StatusBadge({ label, style }: { label: string; style: CSSProperties }) {
  return (
    <span
      className="badge"
      style={{
        ...style,
        border: "1px solid currentColor",
        minWidth: "74px",
      }}
    >
      {label}
    </span>
  );
}

function AnexoBadge({ version, color }: { version: string; color: OperationListDTO["anexo4Color"] }) {
  return (
    <StatusBadge
      label={version}
      style={getAnexoColorStyle(color)}
    />
  );
}

export default function OperationsTableView({
  title,
  endpoint,
  emptyText,
}: OperationsTableViewProps) {
  const navigate = useNavigate();

  // 1. Estados (Hooks siempre arriba)
  const [operations, setOperations] = useState<OperationListDTO[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 2. Custom Hooks (Deben ir antes de cualquier return condicional)
  const filteredOperations = useSearchFilter(operations, search, (op) => [
    op.nombreOperacion,
    op.nombreCreador,
    op.estado,
    op.anexo4Version,
    op.anexo5Version,
    op.anexo6Version,
    op.anexo7Version,
    op.anexo8Version,
  ]);

  // 3. Efectos
  useEffect(() => {
    const loadOperations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchOperations(endpoint);
        setOperations(data);
      } catch (err) {
        console.error("Error cargando operaciones:", err);
        setError("No se pudieron cargar las operaciones.");
      } finally {
        setIsLoading(false);
      }
    };
    loadOperations();
  }, [endpoint]);

  // Resetear página al buscar o cambiar datos
  useEffect(() => {
    setCurrentPage(1);
  }, [search, operations.length]);

  // 4. Lógica de cálculo (No son hooks, pueden ir aquí)
  const paginatedOperations = filteredOperations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 5. RENDERS CONDICIONALES (Solo después de declarar todos los hooks)
  if (isLoading) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3 mb-0 text-muted">Cargando operaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
          <div className="card-body text-center">
            <div className="alert alert-danger mb-3">{error}</div>
            <ButtonProp onClick={() => window.location.reload()}>Reintentar</ButtonProp>
          </div>
        </div>
      </div>
    );
  }

  // 6. RENDER PRINCIPAL
  return (
    <div className="container py-4">
      <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
        <div className="card-body">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>{title}</h2>

          <div className="d-flex justify-content-between align-items-center gap-3 mb-4 flex-wrap">
            <SearchBar
              value={search}
              placeholder="Buscar por nombre, creador o estado..."
              onChange={setSearch}
            />
            <ButtonProp onClick={() => navigate("/auth/register-operation")}>
              <img src={FlyDroneIconPlus} style={{ width: "32px", height: "32px" }} alt="Nueva" />
            </ButtonProp>
          </div>

          <ReusableTable
            headers={[
              "Nombre", "Creador", "Creación", "Anexo 4", "Anexo 5", 
              "Anexo 6", "Anexo 7", "Anexo 8", "Estado"
            ]}
            rows={paginatedOperations} // Usamos la lista paginada
            renderRow={(operation) => (
              <>
                <td>{operation.nombreOperacion}</td>
                <td>{operation.nombreCreador}</td>
                <td>{formatDateTime(operation.fechaCreacion)}</td>
                <td className="text-center"><AnexoBadge version={operation.anexo4Version} color={operation.anexo4Color} /></td>
                <td className="text-center"><AnexoBadge version={operation.anexo5Version} color={operation.anexo5Color} /></td>
                <td className="text-center"><AnexoBadge version={operation.anexo6Version} color={operation.anexo6Color} /></td>
                <td className="text-center"><AnexoBadge version={operation.anexo7Version} color={operation.anexo7Color} /></td>
                <td className="text-center"><AnexoBadge version={operation.anexo8Version} color={operation.anexo8Color} /></td>
                <td className="text-center">
                  {operation.todosFirmadosPendiente ? (
                    <StatusBadge label="CIERRE PENDIENTE" style={getOperationStatusStyle("PENDIENTE")} />
                  ) : (
                    <StatusBadge label={operation.estado} style={getOperationStatusStyle(operation.estado)} />
                  )}
                </td>
              </>
            )}
            onRowClick={(operation) => navigate(`/auth/operations/${operation.idOperacion}`)}
            emptyText={emptyText}
          />

          <Pagination
              totalItems={filteredOperations.length}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}