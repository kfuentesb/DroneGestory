import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../commons/hooks/useAuth";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import ConfirmModal from "../commons/ConfirmModal";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import DeleteIcon from "../../assets/commons/delete_white.svg";
import CancelIcon from "../../assets/commons/cancel_white.svg";
import { cancelOperation, createOperation, deleteOperation, fetchNextOperationCodigo, fetchOperations } from "../operations/operation.api";
import type { OperationListDTO } from "../operations/operation.types";
import Pagination from "../commons/props/Pagination";
import { formatDateTime, getAnexoColorStyle, getOperationStatusStyle } from "../operations/operation.utils";
import LoadingSpinner from "../commons/Loading";
import { useFormatDate } from "../commons/hooks/useFormatDate";
import { useUserTimezone } from "../commons/hooks/useUserTimezone";

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
  const { hasRole } = useAuth();
  const isAdmin = hasRole("ADMIN");
  const isManager = hasRole("MANAGER");
  const isPrivileged = isAdmin || isManager;

  const [operations, setOperations] = useState<OperationListDTO[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [nextCodigo, setNextCodigo] = useState<string | null>(null);
  const [operationCodeInput, setOperationCodeInput] = useState("");
  const [creatingOperation, setCreatingOperation] = useState(false);
  const [pendingDeleteOperationId, setPendingDeleteOperationId] = useState<number | null>(null);
  const [pendingCancelOperationId, setPendingCancelOperationId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const ITEMS_PER_PAGE = 10;
  const { format } = useFormatDate();

  const { timezone } = useUserTimezone();

  const filteredOperations = useSearchFilter(operations, search, (op) => [
    op.codigo,
    op.nombreCreador,
    op.todosFirmadosPendiente && op.estado !== "CANCELADA" ? "CIERRE PENDIENTE" : op.estado,
    op.anexo4Version,
    op.anexo5Version,
    op.anexo6Version,
    op.anexo7Version,
    op.anexo8Version,
    op.asignadoAlUsuarioActual ? "ASIGNADO" : "",
  ]);

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

  useEffect(() => {
    void loadOperations();
  }, [endpoint]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, operations.length]);

  const paginatedOperations = filteredOperations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenCreateModal = async () => {
    try {
      const codigo = await fetchNextOperationCodigo();
      if (!codigo) {
        alert("No se pudo obtener el código de operación.");
        return;
      }
      setNextCodigo(codigo);
      setOperationCodeInput(codigo);
      setShowCreateConfirm(true);
    } catch (err) {
      console.error("Error obteniendo código de operación:", err);
      alert("No se pudo obtener el código de operación.");
    }
  };

  const handleConfirmCreate = async () => {
    try {
      setCreatingOperation(true);
      const operationCode = operationCodeInput.trim() || nextCodigo || "";
      const created = await createOperation("", operationCode);
      if (!created) {
        alert("No se pudo crear la operación.");
        return;
      }
      await loadOperations();
      setShowCreateConfirm(false);
      setNextCodigo(null);
      setOperationCodeInput("");
    } catch (err) {
      console.error("Error creando operación:", err);
      alert("No se pudo crear la operación.");
    } finally {
      setCreatingOperation(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteOperationId) return;
    try {
      setIsDeleting(true);
      await deleteOperation(pendingDeleteOperationId);
      setOperations((ops) => ops.filter((op) => op.idOperacion !== pendingDeleteOperationId));
      setPendingDeleteOperationId(null);
    } catch (err: any) {
      alert(err.message || "Error inesperado");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!pendingCancelOperationId) return;
    try {
      setIsCancelling(true);
      const cancelled = await cancelOperation(pendingCancelOperationId);
      if (!cancelled) {
        alert("No se pudo cancelar la operación.");
        return;
      }
      setOperations((ops) =>
        ops.map((op) =>
          op.idOperacion === pendingCancelOperationId
            ? { ...op, estado: "CANCELADA", completada: false, todosFirmadosPendiente: false }
            : op
        )
      );
      setPendingCancelOperationId(null);
    } catch (err: any) {
      alert(err.message || "No se pudo cancelar la operación.");
    } finally {
      setIsCancelling(false);
    }
  };

  const opHeaders: TableHeader[] = [
    { label: "Código", key: "codigo", sortable: true },
    { label: "Creador", key: "nombreCreador", sortable: true },
    { label: "Creación", key: "fechaCreacion", sortable: true },
    { label: "Anexo 4", key: "anexo4Version", sortable: false },
    { label: "Anexo 5", key: "anexo5Version", sortable: false },
    { label: "Anexo 6", key: "anexo6Version", sortable: false },
    { label: "Anexo 7", key: "anexo7Version", sortable: false },
    { label: "Anexo 8", key: "anexo8Version", sortable: false },
    { label: "Estado", key: "estado", sortable: true },
    ...(isPrivileged ? [{ label: "Acciones", key: "acciones", sortable: false }] : []),
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
    <div className="container py-4 px-2 px-md-3">
      <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
        <div className="card-body p-3 p-md-4">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E", fontSize: "calc(1.3rem + 0.6vw)" }}>{title}</h2>
          
          {/* Barra de herramientas adaptada: columna en móvil, fila en desktop */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
            <div className="flex-grow-1">
              <SearchBar
                value={search}
                placeholder="Buscar código, creador..."
                onChange={setSearch}
              />
            </div>
            <ButtonProp onClick={() => void handleOpenCreateModal()}>
              + Registrar nueva operación
            </ButtonProp>
          </div>

          <Pagination
            totalItems={filteredOperations.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />

          {/* --- VISTA DESKTOP: Tabla Reutilizable --- */}
          <div className="d-none d-xl-block">
            <ReusableTable
              headers={opHeaders}
              rows={paginatedOperations}
              rowStyle={(operation) =>
                operation.estado === "CANCELADA"
                  ? { backgroundColor: "#FEE2E2", color: "#7F1D1D" }
                  : {}
              }
              renderRow={(operation) => (
                <>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span>{operation.codigo}</span>
                      {operation.asignadoAlUsuarioActual && (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: "#DBEAFE",
                            color: "#1D4ED8",
                            border: "1px solid #93C5FD",
                          }}
                        >
                          Asignado
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{operation.nombreCreador}</td>
                  {formatDateTime(operation.fechaCreacion, timezone)}
                  <td className="text-center"><AnexoBadge version={operation.anexo4Version} color={operation.anexo4Color} /></td>
                  <td className="text-center"><AnexoBadge version={operation.anexo5Version} color={operation.anexo5Color} /></td>
                  <td className="text-center"><AnexoBadge version={operation.anexo6Version} color={operation.anexo6Color} /></td>
                  <td className="text-center"><AnexoBadge version={operation.anexo7Version} color={operation.anexo7Color} /></td>
                  <td className="text-center"><AnexoBadge version={operation.anexo8Version} color={operation.anexo8Color} /></td>
                  <td className="text-center">
                    {operation.todosFirmadosPendiente && operation.estado !== "CANCELADA" ? (
                      <StatusBadge label="CIERRE PENDIENTE" style={getOperationStatusStyle("PENDIENTE")} />
                    ) : (
                      <StatusBadge label={operation.estado} style={getOperationStatusStyle(operation.estado)} />
                    )}
                  </td>
                  {isPrivileged && (
                    <td className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingCancelOperationId(operation.idOperacion);
                          }}
                          title="Cancelar operación"
                          disabled={operation.estado === "CANCELADA"}
                          style={{
                            background: "#9A3412",
                            border: "none",
                            padding: 6,
                            borderRadius: 8,
                            cursor: operation.estado === "CANCELADA" ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto",
                            opacity: operation.estado === "CANCELADA" ? 0.5 : 1,
                            boxShadow: "0 1px 4px #9a341233",
                          }}
                        >
                          <img src={CancelIcon} alt="Cancelar" style={{ width: 20, height: 20 }} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingDeleteOperationId(operation.idOperacion);
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
                        )}
                      </div>
                    </td>
                  )}
                </>
              )}
              onRowClick={(operation) => navigate(`/operations/${operation.idOperacion}`)}
              emptyText={emptyText}
            />
          </div>

          {/* --- VISTA MÓVIL/TABLET: Tarjetas en bloque --- */}
          <div className="d-block d-xl-none">
            {paginatedOperations.length === 0 ? (
              <div className="text-center text-muted py-4">{emptyText}</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {paginatedOperations.map((operation) => {
                  const isCancelada = operation.estado === "CANCELADA";
                  return (
                    <div
                      key={operation.idOperacion}
                      onClick={() => navigate(`/operations/${operation.idOperacion}`)}
                      className="p-3 border rounded shadow-sm position-relative"
                      style={{
                        cursor: "pointer",
                        backgroundColor: isCancelada ? "#FEE2E2" : "#FFFFFF",
                        color: isCancelada ? "#7F1D1D" : "inherit",
                        borderColor: isCancelada ? "#FCA5A5" : "#E5E7EB",
                      }}
                    >
                      {/* Fila superior: Código y Estado */}
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <strong style={{ fontSize: "1.1rem" }}>{operation.codigo}</strong>
                          {operation.asignadoAlUsuarioActual && (
                            <span
                              className="badge ms-2"
                              style={{
                                backgroundColor: "#DBEAFE",
                                color: "#1D4ED8",
                                border: "1px solid #93C5FD",
                                fontSize: "0.75rem"
                              }}
                            >
                              Asignado
                            </span>
                          )}
                        </div>
                        <div>
                          {operation.todosFirmadosPendiente && !isCancelada ? (
                            <StatusBadge label="CIERRE PENDIENTE" style={getOperationStatusStyle("PENDIENTE")} />
                          ) : (
                            <StatusBadge label={operation.estado} style={getOperationStatusStyle(operation.estado)} />
                          )}
                        </div>
                      </div>

                      {/* Datos del creador y fecha */}
                      <div className="text-muted small mb-3">
                        <div><strong>Creador:</strong> {operation.nombreCreador}</div>
                        <div><strong>Fecha:</strong> {format(operation.fechaCreacion)}</div>
                      </div>

                      <div className="bg-light p-2 rounded mb-3 border" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
                        <div className="d-flex flex-column align-items-center">
                          <span className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "bold" }}>Anexo 4</span>
                          <AnexoBadge version={operation.anexo4Version} color={operation.anexo4Color} />
                        </div>
                        <div className="d-flex flex-column align-items-center">
                          <span className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "bold" }}>Anexo 5</span>
                          <AnexoBadge version={operation.anexo5Version} color={operation.anexo5Color} />
                        </div>
                        <div className="d-flex flex-column align-items-center">
                          <span className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "bold" }}>Anexo 6</span>
                          <AnexoBadge version={operation.anexo6Version} color={operation.anexo6Color} />
                        </div>
                        <div className="d-flex flex-column align-items-center">
                          <span className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "bold" }}>Anexo 7</span>
                          <AnexoBadge version={operation.anexo7Version} color={operation.anexo7Color} />
                        </div>
                        <div className="d-flex flex-column align-items-center">
                          <span className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "bold" }}>Anexo 8</span>
                          <AnexoBadge version={operation.anexo8Version} color={operation.anexo8Color} />
                        </div>
                      </div>

                      {/* Acciones flotantes en la esquina inferior derecha si tiene permisos */}
                      {isPrivileged && (
                        <div className="d-flex justify-content-end gap-2 pb-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setPendingCancelOperationId(operation.idOperacion)}
                            disabled={isCancelada}
                            style={{
                              background: "#9A3412",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: 6,
                              cursor: isCancelada ? "not-allowed" : "pointer",
                              opacity: isCancelada ? 0.5 : 1,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              color: "#FFF",
                              fontSize: "0.85rem"
                            }}
                          >
                            <img src={CancelIcon} alt="" style={{ width: 16, height: 16 }} />
                            Cancelar
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setPendingDeleteOperationId(operation.idOperacion)}
                              style={{
                                background: "#DC2626",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: 6,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "#FFF",
                                fontSize: "0.85rem"
                              }}
                            >
                              <img src={DeleteIcon} alt="" style={{ width: 16, height: 16 }} />
                              Borrar
                            </button>
                          )}
                        </div>
                      )}
                      <div className="d-flex justify-content-end pt-2 border-top" style={{ borderColor: "#F3F4F6" }}>
                          <span className="text-primary small d-flex align-items-center" style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                              Ver detalles
                              <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="ms-1" 
                                  height="16px" 
                                  viewBox="0 -960 960 960" 
                                  width="16px" 
                                  fill="currentColor"
                              >
                                  <path d="M560-120 160-520l400-400 71 71-329 329 329 329-71 71Z" transform="rotate(180 480 -480)"/>
                              </svg>
                          </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Pagination
            totalItems={filteredOperations.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* --- Modals de Confirmación (Inalterados) --- */}
      <ConfirmModal
        show={showCreateConfirm}
        title="Crear operación"
        message="Puedes confirmar el código sugerido o escribir uno propio para la operación."
        inputValue={operationCodeInput}
        inputLabel="Código de la operación"
        inputPlaceholder="Escribe el código de la operación"
        inputHelperText={`Código sugerido: ${nextCodigo ?? "-"}`}
        onInputChange={setOperationCodeInput}
        onConfirm={() => void handleConfirmCreate()}
        onCancel={() => {
          if (!creatingOperation) {
            setShowCreateConfirm(false);
            setNextCodigo(null);
            setOperationCodeInput("");
          }
        }}
        variant="primary"
      />
      <ConfirmModal
        show={pendingCancelOperationId !== null}
        title="Cancelar operación"
        message="La operación quedaría cancelada y pasaría a modo solo lectura."
        onConfirm={() => void handleConfirmCancel()}
        onCancel={() => {
          if (!isCancelling) {
            setPendingCancelOperationId(null);
          }
        }}
        variant="danger"
      />
      <ConfirmModal
        show={pendingDeleteOperationId !== null}
        title="Eliminar operación"
        message="Se borraría la operación y todos sus anexos. Esta acción no se puede deshacer."
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!isDeleting) {
            setPendingDeleteOperationId(null);
          }
        }}
        variant="danger"
      />
    </div>
  );
}