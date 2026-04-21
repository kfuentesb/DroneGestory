import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../../commons/ConfirmModal";
import ButtonProp from "../../commons/props/ButtonProp";
import { useAuth } from "../../commons/hooks/useAuth";
import {
  fetchAnexo4Data,
  fetchAnexo4VersionData,
  fetchAnexo5Data,
  fetchAnexo5VersionData,
  fetchAnexo6Data,
  fetchAnexo6VersionByNumero,
  fetchAnexo6AircraftsInVersion,
  fetchAnexo7Data,
  fetchAnexo7VersionByNumero,
  fetchAnexo7AircraftsInVersion,
  fetchAnexo8Data,
  fetchAnexo8VersionData,
  fetchAircraftOptions,
  fetchOperationDetail,
  remakeAnexo4Data,
  remakeAnexo5Data,
  remakeAnexo6Data,
  remakeAnexo7Data,
  remakeAnexo8Data,
  signAnexo4Data,
  signAnexo5Data,
  signAnexo6Data,
  signAnexo7Data,
  signAnexo8Data,
  signAnexo6Version,
  signAnexo7Version,
  saveAnexo6Data,
  saveAnexo7Data,
  type Anexo4Data,
  type AircraftOption,
  type Anexo5Data,
  type Anexo6Data,
  type Anexo7Data,
  type Anexo8Data,
} from "../../operations/operation.api";
import type {
  AnexoHistoricoDTO,
  OperationDetailDTO,
} from "../../operations/operation.types";
import {
  formatDateTime,
  getAnexoColorStyle,
  getAnexoLabel,
  getOperationStatusStyle,
} from "../../operations/operation.utils";
import FormOperationAnexo4Detail from "../../forms/FormOperationAnexo4Detail";
import FormOperationAnexo5Detail from "../../forms/FormOperationAnexo5Detail";
import FormOperationAnexo6Detail from "../../forms/FormOperationAnexo6Detail";
import FormOperationAnexo7Detail from "../../forms/FormOperationAnexo7Detail";
import FormOperationAnexo8Detail from "../../forms/FormOperationAnexo8Detail";
import StepProgressBar from "../../commons/MultiStepForm/StepProgressBar";

type OperationAnexoDetailProps = {
  tipoAnexo: 4 | 5 | 6 | 7 | 8;
};

type AnexoData = Anexo4Data | Anexo5Data | Anexo6Data | Anexo7Data | Anexo8Data;

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

export default function OperationAnexoDetail({ tipoAnexo }: OperationAnexoDetailProps) {
  const { id, versionId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  // Barra de pasos superior
  const ANEXOS_STEPS = [
    { label: "Anexo 4", anexo: 4, name: "Anexo 4" },
    { label: "Anexo 5", anexo: 5, name: "Anexo 5" },
    { label: "Anexo 6", anexo: 6, name: "Anexo 6" },
    { label: "Anexo 7", anexo: 7, name: "Anexo 7" },
    { label: "Anexo 8", anexo: 8, name: "Anexo 8" },
  ];

  const currentStep = Math.max(0, ANEXOS_STEPS.findIndex(s => s.anexo === tipoAnexo));

  const [operation, setOperation] = useState<OperationDetailDTO | null>(null);
  const [anexoData, setAnexoData] = useState<AnexoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingVersionData, setLoadingVersionData] = useState(false);
  const [signing, setSigning] = useState(false);
  const [remaking, setRemaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignConfirm, setShowSignConfirm] = useState(false);
  const [showRemakeConfirm, setShowRemakeConfirm] = useState(false);
  const [anexoAircraftOptions, setAnexoAircraftOptions] = useState<AircraftOption[]>([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState<number | null>(null);
  const [aircraftsInVersion, setAircraftsInVersion] = useState<Anexo6Data[] | Anexo7Data[]>([]);
  const [autoSaving, setAutoSaving] = useState(false);

  const anexo = useMemo(
    () => operation?.anexos.find((item) => item.tipoAnexo === tipoAnexo) ?? null,
    [operation, tipoAnexo],
  );

  const selectedVersionId = useMemo(() => {
    if (!versionId) {
      return null;
    }

    const parsedVersionId = Number(versionId);
    return Number.isNaN(parsedVersionId) ? null : parsedVersionId;
  }, [versionId]);

  const selectedVersion = useMemo<AnexoHistoricoDTO | null>(() => {
    if (!selectedVersionId || !anexo) {
      return null;
    }

    return anexo.versiones.find((version) => version.id === selectedVersionId) ?? null;
  }, [anexo, selectedVersionId]);

  const isViewingHistoricalVersion = selectedVersion !== null;
  const requiresAircraftSelection = tipoAnexo === 6 || tipoAnexo === 7;
  
  // Para anexos 6 y 7, el estado se determina por la versión completa, no por aeronave individual
  const currentAnexoId = anexoData?.id ?? anexo?.actual.id ?? null;
  const currentAnexoVersion = anexoData?.numeroVersion ?? anexo?.actual.numeroVersion ?? 0;
  const currentAnexoStatus = anexoData?.estado ?? anexo?.actual.estado ?? null;
  const actualIsSigned = currentAnexoStatus === "FIRMADO";
  const canManageCompletedOperation = role === "ADMIN";
  const canCreate = !operation?.completada || canManageCompletedOperation;
  
  // Para anexos 6 y 7: en borrador se puede editar, en firmado solo lectura
  const canEditDraft = !isViewingHistoricalVersion && canCreate && !actualIsSigned;
  const canRemake = !isViewingHistoricalVersion && canCreate && actualIsSigned;
  const canSign = !isViewingHistoricalVersion && canCreate && actualIsSigned === false && currentAnexoVersion > 0;

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
        setError("No se pudo cargar la operación.");
        return;
      }

      setOperation(data);
    } catch (err) {
      console.error("Error cargando anexo:", err);
      setError("No se pudo cargar el anexo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOperation();
  }, [id, tipoAnexo, versionId]);

  useEffect(() => {
    if (!operation || !requiresAircraftSelection) {
      setAnexoAircraftOptions([]);
      setSelectedAircraftId(null);
      return;
    }

    const loadAircraftFromAnexo4 = async () => {
      try {
        const [anexo4, aircraftOptions] = await Promise.all([
          fetchAnexo4Data(operation.idOperacion),
          fetchAircraftOptions(),
        ]);

        const selectedIds = new Set(anexo4?.aircraftIds ?? []);
        const filtered = aircraftOptions.filter((aircraft) => selectedIds.has(aircraft.id));
        setAnexoAircraftOptions(filtered);
        setSelectedAircraftId((prev) => {
          if (prev && filtered.some((aircraft) => aircraft.id === prev)) {
            return prev;
          }
          return filtered[0]?.id ?? null;
        });
      } catch (err) {
        console.error("Error cargando aeronaves de Anexo 4:", err);
        setAnexoAircraftOptions([]);
        setSelectedAircraftId(null);
      }
    };

    void loadAircraftFromAnexo4();
  }, [operation, requiresAircraftSelection]);

  useEffect(() => {
    if (!operation) {
      return;
    }

    const loadSelectedAnexoData = async () => {
      setLoadingVersionData(true);
      try {
        let data: AnexoData | null = null;

        if (selectedVersionId) {
          switch (tipoAnexo) {
            case 4:
              data = await fetchAnexo4VersionData(operation.idOperacion, selectedVersionId);
              break;
            case 5:
              data = await fetchAnexo5VersionData(operation.idOperacion, selectedVersionId);
              break;
            case 6:
              if (!selectedAircraftId || !selectedVersion) {
                data = null;
              } else {
                data = await fetchAnexo6VersionByNumero(
                  operation.idOperacion,
                  selectedVersion.numeroVersion,
                  selectedAircraftId,
                );
              }
              break;
            case 7:
              if (!selectedAircraftId || !selectedVersion) {
                data = null;
              } else {
                data = await fetchAnexo7VersionByNumero(
                  operation.idOperacion,
                  selectedVersion.numeroVersion,
                  selectedAircraftId,
                );
              }
              break;
            case 8:
              data = await fetchAnexo8VersionData(operation.idOperacion, selectedVersionId);
              break;
            default:
              data = null;
          }
        } else {
          switch (tipoAnexo) {
            case 4:
              data = await fetchAnexo4Data(operation.idOperacion);
              break;
            case 5:
              data = await fetchAnexo5Data(operation.idOperacion);
              break;
            case 6:
              data = selectedAircraftId ? await fetchAnexo6Data(operation.idOperacion, selectedAircraftId) : null;
              break;
            case 7:
              data = selectedAircraftId ? await fetchAnexo7Data(operation.idOperacion, selectedAircraftId) : null;
              break;
            case 8:
              data = await fetchAnexo8Data(operation.idOperacion);
              break;
            default:
              data = null;
          }
        }

        setAnexoData(data);
      } catch (err) {
        console.error(`Error cargando datos del Anexo ${tipoAnexo}:`, err);
        setAnexoData(null);
      } finally {
        setLoadingVersionData(false);
      }
    };

    void loadSelectedAnexoData();
  }, [operation, selectedVersion, selectedVersionId, selectedAircraftId, tipoAnexo]);

  const handleSign = async () => {
    if (!operation) {
      return;
    }

    try {
      setSigning(true);
      
      // Para anexos 6 y 7, firmar toda la versión completa
      if (tipoAnexo === 6 || tipoAnexo === 7) {
        const success = tipoAnexo === 6 
          ? await signAnexo6Version(operation.idOperacion, currentAnexoVersion)
          : await signAnexo7Version(operation.idOperacion, currentAnexoVersion);
        
        if (success) {
          setShowSignConfirm(false);
          navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`);
          await loadOperation();
        } else {
          alert(`No se pudo firmar ${getAnexoLabel(tipoAnexo)}.`);
        }
      } else {
        // Para otros anexos, firmar individualmente
        let signedData: AnexoData | null = null;
        switch (tipoAnexo) {
          case 4:
            signedData = await signAnexo4Data(operation.idOperacion, currentAnexoId!);
            break;
          case 5:
            signedData = await signAnexo5Data(operation.idOperacion, currentAnexoId!);
            break;
          case 8:
            signedData = await signAnexo8Data(operation.idOperacion, currentAnexoId!);
            break;
          default:
            signedData = null;
        }
        if (signedData) {
          setAnexoData(signedData);
        }
        setShowSignConfirm(false);
        navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`);
        await loadOperation();
      }
    } catch (err) {
      console.error(`Error firmando ${getAnexoLabel(tipoAnexo)}:`, err);
      alert(`No se pudo firmar ${getAnexoLabel(tipoAnexo)}.`);
    } finally {
      setSigning(false);
    }
  };

  const handleRemake = async () => {
    if (!operation || !currentAnexoId) {
      return;
    }

    try {
      setRemaking(true);
      let remadeData: AnexoData | null = null;
      switch (tipoAnexo) {
        case 4:
          remadeData = await remakeAnexo4Data(operation.idOperacion, currentAnexoId);
          break;
        case 5:
          remadeData = await remakeAnexo5Data(operation.idOperacion, currentAnexoId);
          break;
        case 6:
          remadeData = await remakeAnexo6Data(operation.idOperacion, currentAnexoId);
          break;
        case 7:
          remadeData = await remakeAnexo7Data(operation.idOperacion, currentAnexoId);
          break;
        case 8:
          remadeData = await remakeAnexo8Data(operation.idOperacion, currentAnexoId);
          break;
        default:
          remadeData = null;
      }
      if (remadeData) {
        setAnexoData(remadeData);
      }
      setShowRemakeConfirm(false);
      navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`);
      await loadOperation();
    } catch (err) {
      console.error(`Error rehaciendo ${getAnexoLabel(tipoAnexo)}:`, err);
      alert(`No se pudo rehacer ${getAnexoLabel(tipoAnexo)}.`);
    } finally {
      setRemaking(false);
    }
  };

  const handleSaved = async (savedData: AnexoData | null) => {
    setAnexoData(savedData);
    if (!operation) return null;
    navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`);
    await loadOperation();
  };

  // Función para auto-guardar antes de cambiar de aeronave
  const autoSaveBeforeSwitch = async (): Promise<boolean> => {
    if (!operation || !selectedAircraftId || !canEditDraft) return true;
    if (tipoAnexo !== 6 && tipoAnexo !== 7) return true;

    // Solo auto-guardar si hay datos en el formulario actual
    const currentForm = document.querySelector('form');
    if (!currentForm) return true;

    setAutoSaving(true);
    try {
      const formData = new FormData(currentForm);
      
      if (tipoAnexo === 6) {
        await saveAnexo6Data(operation.idOperacion, formData);
      } else if (tipoAnexo === 7) {
        await saveAnexo7Data(operation.idOperacion, formData);
      }
      return true;
    } catch (err) {
      console.error('Error auto-guardando:', err);
      // Continuar con el cambio de aeronave aunque falle el auto-guardado
      return true;
    } finally {
      setAutoSaving(false);
    }
  };

  const handleAircraftChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAircraftId = e.target.value === "" ? null : Number(e.target.value);
    
    // Auto-guardar antes de cambiar
    if (newAircraftId !== selectedAircraftId) {
      await autoSaveBeforeSwitch();
    }
    
    setSelectedAircraftId(newAircraftId);
  };

  if (loading) {
    return <div className="container py-4 text-center">Cargando anexo...</div>;
  }

  if (error || !operation || !anexo) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error ?? "Anexo no encontrado."}
        </div>
        <ButtonProp onClick={() => navigate(-1)}>Volver</ButtonProp>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button
        className="btn btn-link ps-0 text-decoration-none mb-2"
        onClick={() => navigate(`/operations/${operation.idOperacion}`)}
      >
        Volver a la operación
      </button>

      <StepProgressBar
        steps={ANEXOS_STEPS}
        currentStep={currentStep}
        onStepClick={(step) => {
          if (operation) navigate(`/operations/${operation.idOperacion}/anexo${step.anexo}`);
        }}
      />

      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
        <div>
          <h2 className="mb-2">{getAnexoLabel(tipoAnexo)}</h2>
          <p className="text-muted mb-2">{operation.codigo}</p>
          <div className="d-flex gap-2 flex-wrap">
            <Badge
              label={operation.estadoOperacion}
              style={getOperationStatusStyle(operation.estadoOperacion)}
            />
            <Badge
              label={
                currentAnexoVersion > 0
                  ? `v${currentAnexoVersion}`
                  : "Sin versión"
              }
              style={getAnexoColorStyle(anexo.actual.color)}
            />
            <Badge
              label={currentAnexoStatus ?? "SIN DATOS"}
              style={getAnexoColorStyle(anexo.actual.color)}
            />
            {isViewingHistoricalVersion && selectedVersion && (
              <Badge
                label={`Consultando v${selectedVersion.numeroVersion}`}
                style={getAnexoColorStyle(selectedVersion.color)}
              />
            )}
          </div>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <ButtonProp
            className="btn"
            style={{
              backgroundColor: "#92400E",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
            onClick={() => setShowRemakeConfirm(true)}
            disabled={!canRemake || remaking}
          >
            {remaking ? "Rehaciendo..." : "Rehacer versión"}
          </ButtonProp>
          <ButtonProp
            className="btn"
            style={{
              backgroundColor: "#1D4ED8",
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
            onClick={() => setShowSignConfirm(true)}
            disabled={!canSign || signing}
          >
            {signing ? "Firmando..." : "Firmar"}
          </ButtonProp>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 col-12 mb-3">
          <div className="border rounded p-3 h-100">
            <small className="text-muted d-block mb-1">
              Creación operación
            </small>
            <strong>{formatDateTime(operation.fechaCreacion)}</strong>
          </div>
        </div>
        <div className="col-md-6 col-12 mb-3">
          <div className="border rounded p-3 h-100">
            <small className="text-muted d-block mb-1">
              Última actualización
            </small>
            <strong>{formatDateTime(operation.fechaActualizacion)}</strong>
          </div>
        </div>
      </div>

      {operation.completada && !canManageCompletedOperation && (
        <div className="alert alert-warning">
          La operación está completada. Solo un administrador puede modificar
          anexos.
        </div>
      )}

      {operation.completada && canManageCompletedOperation && (
        <div className="alert alert-info">
          La operación está completada, pero tienes permisos de administrador
          para gestionar versiones del anexo.
        </div>
      )}

      {actualIsSigned && !isViewingHistoricalVersion && (
        <div className="alert alert-info">
          La versión actual está firmada. Para editar, crea antes una nueva
          versión con "Rehacer versión".
        </div>
      )}

      {isViewingHistoricalVersion && selectedVersion && (
        <div className="alert alert-secondary">
          Estás consultando la versión histórica v
          {selectedVersion.numeroVersion}. Esta vista es solo lectura.
        </div>
      )}

      {requiresAircraftSelection && (
        <div className="card shadow-sm mb-4" style={{ border: "1px solid #E5E7EB" }}>
          <div className="card-body">
            <label className="form-label fw-bold small text-uppercase text-muted">
              Aeronave seleccionada desde Anexo 4
            </label>
            {anexoAircraftOptions.length === 0 ? (
              <div className="alert alert-warning mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.952.223 2.085 1.96 2.085h13.71c1.737 0 2.417-1.133 1.96-2.085L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                No hay drones asignados a esta operación. Vuelve al{" "}
                <button
                  className="btn btn-link p-0 m-0 align-baseline text-decoration-underline"
                  onClick={() => navigate(`/operations/${operation.idOperacion}/anexo4`)}
                  style={{ fontSize: "inherit" }}
                >
                  Anexo 4
                </button>{" "}
                para asignar drones desde el formulario.
              </div>
            ) : (
              <select
                className="form-select"
                value={selectedAircraftId ?? ""}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setSelectedAircraftId(null);
                    return;
                  }
                  setSelectedAircraftId(Number(e.target.value));
                }}
                disabled={isViewingHistoricalVersion}
              >
                {anexoAircraftOptions.map((aircraft) => (
                  <option key={aircraft.id} value={aircraft.id}>
                    {`${aircraft.manufacturer ?? ""} ${aircraft.model ?? ""}`.trim()}
                    {aircraft.serialNumber ? ` (${aircraft.serialNumber})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      <div
        className="card shadow-sm mb-4"
        style={{ border: "1px solid #E5E7EB" }}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
            <h4 className="mb-0">
              {isViewingHistoricalVersion && selectedVersion
                ? `Detalle versión v${selectedVersion.numeroVersion}`
                : "Detalle versión actual"}
            </h4>
            {isViewingHistoricalVersion && (
              <ButtonProp
                onClick={() => navigate(`/operations/${operation.idOperacion}`)}
              >
                Volver a la operación
              </ButtonProp>
            )}
          </div>

          {loadingVersionData ? (
            <div className="text-center py-4">Cargando versión...</div>
          ) : (
            <>
              {tipoAnexo === 4 && (
                <FormOperationAnexo4Detail
                  key={selectedVersionId ?? anexo.actual.id ?? "current"}
                  operationId={operation.idOperacion}
                  initialValues={(anexoData as Anexo4Data | null) ?? {}}
                  disabled={isViewingHistoricalVersion || !canEditDraft}
                  readOnlyMessage={
                    isViewingHistoricalVersion
                      ? "Estás consultando una versión histórica. Esta vista es solo lectura."
                      : undefined
                  }
                  onSaved={async (savedData) => {
                    await handleSaved(savedData as AnexoData | null);
                  }}
                />
              )}
              {tipoAnexo === 5 && (
                <FormOperationAnexo5Detail
                  key={selectedVersionId ?? anexo.actual.id ?? "current"}
                  operationId={operation.idOperacion}
                  initialValues={anexoData as Anexo5Data | null}
                  disabled={isViewingHistoricalVersion || !canEditDraft}
                  readOnlyMessage={
                    isViewingHistoricalVersion
                      ? "Estás consultando una versión histórica. Esta vista es solo lectura."
                      : undefined
                  }
                  onSaved={async (savedData) => {
                    await handleSaved(savedData as AnexoData | null);
                  }}
                />
              )}
              {tipoAnexo === 6 && (
                <FormOperationAnexo6Detail
                  key={selectedVersionId ?? anexo.actual.id ?? "current"}
                  operationId={operation.idOperacion}
                  initialValues={anexoData as Anexo6Data | null}
                  selectedAircraftId={selectedAircraftId}
                  disabled={isViewingHistoricalVersion || !canEditDraft || !selectedAircraftId}
                  readOnlyMessage={
                    isViewingHistoricalVersion
                      ? "Estás consultando una versión histórica. Esta vista es solo lectura."
                      : undefined
                  }
                  onSaved={async (savedData) => {
                    await handleSaved(savedData as AnexoData | null);
                  }}
                />
              )}
              {tipoAnexo === 7 && (
                <FormOperationAnexo7Detail
                  key={selectedVersionId ?? anexo.actual.id ?? "current"}
                  operationId={operation.idOperacion}
                  initialValues={anexoData as Anexo7Data | null}
                  selectedAircraftId={selectedAircraftId}
                  disabled={isViewingHistoricalVersion || !canEditDraft || !selectedAircraftId}
                  readOnlyMessage={
                    isViewingHistoricalVersion
                      ? "Estás consultando una versión histórica. Esta vista es solo lectura."
                      : undefined
                  }
                  onSaved={async (savedData) => {
                    await handleSaved(savedData as AnexoData | null);
                  }}
                />
              )}
              {tipoAnexo === 8 && (
                <FormOperationAnexo8Detail
                  key={selectedVersionId ?? anexo.actual.id ?? "current"}
                  operationId={operation.idOperacion}
                  initialValues={anexoData as Anexo8Data | null}
                  disabled={isViewingHistoricalVersion || !canEditDraft}
                  readOnlyMessage={
                    isViewingHistoricalVersion
                      ? "Estás consultando una versión histórica. Esta vista es solo lectura."
                      : undefined
                  }
                  onSaved={async (savedData) => {
                    await handleSaved(savedData as AnexoData | null);
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        show={showSignConfirm}
        title={`Firmar ${getAnexoLabel(tipoAnexo)}`}
        message="Se firmará la versión actual en borrador. Después ya no podrás editarla sin crear una nueva versión."
        onConfirm={() => void handleSign()}
        onCancel={() => setShowSignConfirm(false)}
        variant="primary"
      />

      <ConfirmModal
        show={showRemakeConfirm}
        title={`Rehacer ${getAnexoLabel(tipoAnexo)}`}
        message="Se creará una nueva versión en borrador a partir de la versión firmada actual."
        onConfirm={() => void handleRemake()}
        onCancel={() => setShowRemakeConfirm(false)}
        variant="primary"
      />
    </div>
  );
}
