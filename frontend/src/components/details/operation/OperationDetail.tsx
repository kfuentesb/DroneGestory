import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../../commons/ConfirmModal";
import ButtonProp from "../../commons/props/ButtonProp";
import { completeOperation, fetchAircraftOptions, fetchOperationDetail } from "../../operations/operation.api";
import type { AircraftOption } from "../../operations/operation.api";
import type { OperationDetailDTO } from "../../operations/operation.types";
import {
  formatDateTime,
  getAnexoColorStyle,
  getAnexoLabel,
  getOperationStatusStyle,
  OPERATION_ANEXOS,
} from "../../operations/operation.utils";

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

  const [operation, setOperation] = useState<OperationDetailDTO | null>(null);
  const [aircraftOptions, setAircraftOptions] = useState<AircraftOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4 flex-wrap">
        <div>
          <button className="btn btn-link ps-0 text-decoration-none" onClick={() => navigate(`/operations/details/mine`)}>
            Volver
          </button>
          <h2 className="mb-2">{operation.codigo}</h2>
          <div className="d-flex gap-2 flex-wrap">
            <Badge
                label={
                  operation.todosAnexosFirmados && !operation.completada
                    ? "CIERRE PENDIENTE"
                    : operation.estadoOperacion
                }
                style={
                  operation.todosAnexosFirmados && !operation.completada
                    ? getOperationStatusStyle("PENDIENTE")
                    : getOperationStatusStyle(operation.estadoOperacion)
                }
              />
            <Badge
              label={operation.completada ? "Completada" : "En edición"}
              style={operation.completada ? getAnexoColorStyle("VERDE") : getAnexoColorStyle("AMARILLO")}
            />
          </div>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <ButtonProp
            className="btn"
            style={{ backgroundColor: "#166534", color: "#FFFFFF", fontWeight: "bold" }}
            onClick={() => setShowCompleteConfirm(true)}
            disabled={operation.completada || !operation.todosAnexosFirmados || completing}
          >
            {completing ? "Completando..." : "Completar operación"}
          </ButtonProp>
        </div>
      </div>

      {operation.todosAnexosFirmados && !operation.completada && (
        <div className="alert alert-warning">
          Todos los anexos están firmados. Ya puedes completar la operación.
        </div>
      )}

      <div className="row mb-4">
        {resumen.map((item) => (
          <DetailCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

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
    </div>
  );
}