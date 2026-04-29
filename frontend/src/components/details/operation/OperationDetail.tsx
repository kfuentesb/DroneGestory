import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../../commons/ConfirmModal";
import ButtonProp from "../../commons/props/ButtonProp";
import { useAuth } from "../../commons/hooks/useAuth";
import { cancelOperation, completeOperation, fetchAircraftOptions, fetchOperationDetail } from "../../operations/operation.api";
import type { AircraftOption } from "../../operations/operation.api";
import type { OperationDetailDTO } from "../../operations/operation.types";
import {
  formatDateTime,
  getAnexoColorStyle,
  getAnexoLabel,
  getOperationStatusStyle,
  OPERATION_ANEXOS,
} from "../../operations/operation.utils";
import { styles } from "../../../global-const/styles";
import arroBackIcon from '../../../assets/commons/arrow_back_white.svg';

function Badge({ label, style }: { label: string; style: CSSProperties }) {
  return (
    <span
      className="badge"
      style={{
        ...style,
        border: "1px solid currentColor",
        padding: "0.45rem 0.6rem",
      }}
    >
      {label}
    </span>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="col-md-6 col-12 mb-3">
      <div className="rounded h-100" style={{ border: "1px solid #D1D5DB", padding: "12px 16px" }}>
        <small className="text-muted d-block mb-1">{label}</small>
        <span className="fw-bold">{value}</span>
      </div>
    </div>
  );
}

export default function OperationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [operation, setOperation] = useState<OperationDetailDTO | null>(null);
  const [aircraftOptions, setAircraftOptions] = useState<AircraftOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const canCancelByRole = hasRole("ADMIN") || hasRole("MANAGER");

  const [isSticky, setIsSticky] = useState(false);

  const loadOperation = async () => {
    if (!id) {
      setError("No se ha indicado la operación.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchOperationDetail(id);

      if (!data) {
        return;
      }

      setOperation(data);
    } catch (err) {
      console.error("Error cargando operación:", err);
      setError("No se pudo cargar el detalle de la operación.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOperation();
  }, [id]);

  useEffect(() => {
    const loadAircraftOptions = async () => {
      try {
        const options = await fetchAircraftOptions();
        setAircraftOptions(options);
      } catch (err) {
        console.error("Error cargando aeronaves:", err);
      }
    };

    void loadAircraftOptions();
  }, []);

  // Cambiado: ahora muestra solo "modelo · serial"
  const aircraftLabelById = useMemo(() => {
    const map = new Map<number, string>();
    aircraftOptions.forEach((aircraft) => {
      const base = (aircraft.model ?? "").trim();
      const serial = aircraft.serialNumber ?? "";
      const label =
        base && serial ? `${base} · ${serial}`
        : base ? base
        : serial ? serial
        : `Aeronave ${aircraft.id}`;
      map.set(aircraft.id, label);
    });
    return map;
  }, [aircraftOptions]);

  const resumen = useMemo(() => {
    if (!operation) {
      return [];
    }

    return [
      { label: "Creador", value: operation.nombreCreador },
      { label: "Creación", value: formatDateTime(operation.fechaCreacion) },
      { label: "Todos los anexos firmados", value: operation.todosAnexosFirmados ? "Sí" : "No" },
      { label: "Actualización", value: formatDateTime(operation.fechaActualizacion) },
    ];
  }, [operation]);

  const handleComplete = async () => {
    if (!operation) {
      return;
    }

    try {
      setCompleting(true);
      await completeOperation(operation.idOperacion);
      setShowCompleteConfirm(false);
      await loadOperation();
    } catch (err) {
      console.error("Error completando operación:", err);
      alert("No se pudo completar la operación.");
    } finally {
      setCompleting(false);
    }
  };

  const handleCancelOperation = async () => {
    if (!operation) {
      return;
    }

    try {
      setCancelling(true);
      const cancelled = await cancelOperation(operation.idOperacion);
      if (!cancelled) {
        alert("No se pudo cancelar la operación.");
        return;
      }
      setShowCancelConfirm(false);
      await loadOperation();
    } catch (err) {
      console.error("Error cancelando operación:", err);
      alert("No se pudo cancelar la operación.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="container py-4 text-center">Cargando operación...</div>;
  }

  if (error || !operation) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error ?? "Operación no encontrada."}
        </div>
        <ButtonProp onClick={() => navigate(-1)}>Volver</ButtonProp>
      </div>
    );
  }

  return (
    <div className="container py-2" style={{ maxWidth: '1100px' }}>
      {/* --- STICKY HEADER --- */}
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1050,
          // backgroundColor: isSticky ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          margin: isSticky ? '0 -20px 1rem -20px' : '0 -20px 2rem -20px',
          padding: isSticky ? '0.6rem 20px' : '1.25rem 20px',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: isSticky ? '0 10px 15px -3px rgba(0, 0, 0, 0.07)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            {/* Back Button */}
            <button 
              className="btn d-flex align-items-center justify-content-center me-2 flex-shrink-0" 
              onClick={() => navigate(`/operations`)}
              style={{
                ...styles.backBtn,
                transform: isSticky ? 'scale(0.9)' : 'scale(1)',
                transition: 'transform 0.2s'
              }}
            >
              <img src={arroBackIcon} alt="Back" style={styles.backIcon} />
            </button>

            {/* Title and Badges */}
            <div>
              <h4 
                className="fw-bold mb-0 text-dark"
                style={{ 
                  fontSize: isSticky ? '1.1rem' : '1.5rem',
                  transition: 'font-size 0.2s' 
                }}
              >
                {operation.codigo}
              </h4>
              {!isSticky && (
                <div className="d-flex gap-2 mt-2">
                  <Badge
                    label={
                      operation.todosAnexosFirmados &&
                      !operation.completada &&
                      operation.estadoOperacion !== "CANCELADA"
                        ? "CIERRE PENDIENTE"
                        : operation.estadoOperacion
                    }
                    style={
                      operation.todosAnexosFirmados &&
                      !operation.completada &&
                      operation.estadoOperacion !== "CANCELADA"
                        ? getOperationStatusStyle("PENDIENTE")
                        : getOperationStatusStyle(operation.estadoOperacion)
                    }
                  />
                  <Badge
                    label={operation.completada ? "Completada" : "En edición"}
                    style={operation.completada ? getAnexoColorStyle("VERDE") : getAnexoColorStyle("AMARILLO")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            {operation.estadoOperacion !== "CANCELADA" && canCancelByRole && (
              <ButtonProp
                className="btn btn-sm px-3"
                style={{ 
                  backgroundColor: "#B91C1C", 
                  color: "#FFFFFF", 
                  fontWeight: "bold",
                  transform: isSticky ? 'scale(0.9)' : 'scale(1)'
                }}
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
              >
                {cancelling ? "..." : "Cancelar"}
              </ButtonProp>
            )}
            <ButtonProp
              className="btn btn-sm px-3"
              style={{ 
                backgroundColor: "#166534", 
                color: "#FFFFFF", 
                fontWeight: "bold",
                transform: isSticky ? 'scale(0.9)' : 'scale(1)'
              }}
              onClick={() => setShowCompleteConfirm(true)}
              disabled={
                operation.completada ||
                !operation.todosAnexosFirmados ||
                completing ||
                operation.estadoOperacion === "CANCELADA" ||
                !operation.puedeEditarUsuarioActual
              }
            >
              {completing ? "..." : isSticky ? "Completar" : "Completar operación"}
            </ButtonProp>
          </div>
        </div>
      </div>

      <div 
        className="card border-0 shadow-sm mb-4" 
        style={{ borderRadius: '12px', overflow: 'hidden' }}
      >        
        <div className="card-body p-4">
          <div className="row g-4">
            {resumen.map((item, index) => (
              <div key={item.label} className="col-md-6 col-lg-3">
                <div className="p-3 rounded-3 bg-light h-100 border border-white" style={{ transition: 'transform 0.2s' }}>
                  <label className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {item.label}
                  </label>
                  <div className="h6 fw-bold text-dark mb-0" style={{ wordBreak: 'break-word' }}>
                    {item.value || <span className="text-muted fw-normal">No definido</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {operation.todosAnexosFirmados && !operation.completada && operation.estadoOperacion !== "CANCELADA" && (
        <div className="alert alert-warning">
          Todos los anexos están firmados. Ya puedes completar la operación.
        </div>
      )}

      <div className="row g-4">
        {OPERATION_ANEXOS.map((tipoAnexo) => {
          const anexo = operation.anexos.find((item) => item.tipoAnexo === tipoAnexo);

          if (!anexo) {
            return null;
          }

          return (
            <div key={tipoAnexo} className="col-12">
              <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                    <div>
                      <h4 className="mb-1">{getAnexoLabel(tipoAnexo)}</h4>
                      <div className="d-flex gap-2 flex-wrap">
                        <Badge
                          label={anexo.actual.numeroVersion > 0 ? `v${anexo.actual.numeroVersion}` : "Sin versión"}
                          style={getAnexoColorStyle(anexo.actual.color)}
                        />
                        <Badge
                          label={anexo.actual.estado ?? "SIN DATOS"}
                          style={getAnexoColorStyle(anexo.actual.color)}
                        />
                      </div>
                    </div>

                        <ButtonProp style={{ backgroundColor: "rgb(254, 243, 199)", color: "rgb(146, 64, 14)", border: "1px solid", padding: "0.45rem 0.6rem" }} onClick={() => navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`)}>
                      Ver borrador
                    </ButtonProp>
                  </div>

                  {anexo.versiones.length === 0 ? (
                    <p className="text-muted mb-0">Aún no hay versiones registradas.</p>
                  ) : (
                    <div className="table-responsive" style={anexo.versiones.length > 8 ? { maxHeight: "300px", overflowY: "auto" } : undefined}>
                      <table className="table table-sm align-middle mb-0">
                        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                          <tr>
                            <th>Versión</th>
                            <th>Estado</th>
                            {(tipoAnexo === 6 || tipoAnexo === 7) && <th>Aeronave</th>}
                            <th>Firmado por</th>
                            <th>Fecha firma</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {anexo.versiones.map((version) => (
                            <tr key={version.id}>
                              <td>{`v${version.numeroVersion}`}</td>
                              <td>
                                <Badge label={version.estado} style={getAnexoColorStyle(version.color)} />
                              </td>
                              {(tipoAnexo === 6 || tipoAnexo === 7) && (
                                <td>
                                  {version.aircraftId
                                    ? (aircraftLabelById.get(version.aircraftId) ?? `Aeronave ${version.aircraftId}`)
                                    : "-"}
                                </td>
                              )}
                              <td>{version.firmadoPor ?? "-"}</td>
                              <td>{formatDateTime(version.fechaFirma)}</td>
                              <td>
                                {version.estado === "FIRMADO" ? (
                                  <ButtonProp
                                  onClick={() =>
                                    navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}/version/${version.id}`)
                                  }
                                >
                                  Ver versión
                                  </ButtonProp>
                                ) : (
                                  <span className="text-muted">No disponible</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        show={showCompleteConfirm}
        title="Completar operación"
        message="La operación pasará a estado completada. Asegúrate de que todos los anexos estén revisados y firmados."
        onConfirm={() => void handleComplete()}
        onCancel={() => setShowCompleteConfirm(false)}
        variant="primary"
      />
      <ConfirmModal
        show={showCancelConfirm}
        title="Cancelar operación"
        message="La operación pasará a estado cancelada y quedarán en modo solo lectura."
        onConfirm={() => void handleCancelOperation()}
        onCancel={() => setShowCancelConfirm(false)}
        variant="danger"
      />
    </div>
  );
}
