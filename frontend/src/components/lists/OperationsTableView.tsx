import React, { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../commons/hooks/useAuth";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import FlyDroneIconPlus from "../../assets/commons/fly_drone_add_white.svg";
import DeleteIcon from "../../assets/commons/delete_white.svg";
import { createOperation, fetchNextOperationName, fetchOperations } from "../operations/operation.api";
import type { OperationListDTO } from "../operations/operation.types";
import Pagination from "../commons/props/Pagination";
import { deleteOperation } from "../operations/operation.api";

import {
  formatDateTime,
  getAnexoColorStyle,
  getOperationStatusStyle,
} from "../operations/operation.utils";
import LoadingSpinner from "../commons/Loading";

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

function AnexoBadge({
  version,
  color,
}: {
  version: string;
  color: OperationListDTO["anexo4Color"];
}) {
  return <StatusBadge label={version} style={getAnexoColorStyle(color)} />;
}

export default function OperationsTableView({
  title,
  endpoint,
  emptyText,
}: OperationsTableViewProps) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";

  const [operations, setOperations] = useState<OperationListDTO[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredOperations = useSearchFilter(operations, search, (op) => [
    op.nombreOperacion,
    op.nombreCreador,
    op.todosFirmadosPendiente ? "CIERRE PENDIENTE" : op.estado,
    op.anexo4Version,
    op.anexo5Version,
    op.anexo6Version,
    op.anexo7Version,
    op.anexo8Version,
  ]);

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

  const paginatedOperations = filteredOperations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Manejar el borrado
  const handleDelete = async (operationId: number) => {
  if (
    window.confirm(
      "¿Estás seguro que quieres borrar esta operación y todos sus anexos? Esta acción no se puede deshacer."
    )
  ) {
    try {
      await deleteOperation(operationId);
      setOperations((ops) =>
        ops.filter((op) => op.idOperacion !== operationId)
      );
    } catch (err: any) {
      alert(err.message || "Error inesperado");
    }
  }
};

  const handleCreate = async () => {
    try {
      const nextNameData = await fetchNextOperationName();
      if (!nextNameData?.nombreAsignado) {
        alert("No se pudo obtener el nombre de la operación.");
        return;
      }

      const confirmed = window.confirm(
        `Se va a crear una nueva operación con el nombre ${nextNameData.nombreAsignado}. ¿Deseas continuar?`
      );

      if (!confirmed) {
        return;
      }

      const created = await createOperation();
      if (!created) {
        return;
      }

      navigate(`/operations/${created.idOperacion}`);
    } catch (err: any) {
      alert(err.message || "No se pudo crear la operación.");
    }
  };

  // Encabezados, añade la columna del botón borrar solo si eres admin
  const opHeaders: TableHeader[] = [
    { label: "Nombre", key: "nombreOperacion", sortable: true },
    { label: "Creador", key: "nombreCreador", sortable: true },
    { label: "Creación", key: "fechaCreacion", sortable: true },
    { label: "Anexo 4", key: "anexo4Version", sortable: false },
    { label: "Anexo 5", key: "anexo5Version", sortable: false },
    { label: "Anexo 6", key: "anexo6Version", sortable: false },
    { label: "Anexo 7", key: "anexo7Version", sortable: false },
    { label: "Anexo 8", key: "anexo8Version", sortable: false },
    { label: "Estado", key: "estado", sortable: true },
    ...(isAdmin ? [{ label: "", key: "borrar", sortable: false }] : []),
  ];

  if (isLoading) {
    return <LoadingSpinner message="Cargando operaciones..." />;
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
            <ButtonProp onClick={handleCreate}>
              <img src={FlyDroneIconPlus} style={{ width: "32px", height: "32px" }} alt="Nueva" />
            </ButtonProp>
          </div>
          <ReusableTable
            headers={opHeaders}
            rows={paginatedOperations}
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
                {isAdmin && (
                  <td className="text-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(operation.idOperacion);
                      }}
                      title="Borrar operación"
                      style={{
                        background: "#DC2626",
                        border: "none",
                        padding: 6,
                        borderRadius: 8,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        boxShadow: "0 1px 4px #db464633",
                      }}
                    >
                      <img src={DeleteIcon} alt="Borrar" style={{ width: 20, height: 20 }} />
                    </button>
                  </td>
                )}
              </>
            )}
            onRowClick={operation =>
              navigate(`/operations/${operation.idOperacion}`)
            }
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
