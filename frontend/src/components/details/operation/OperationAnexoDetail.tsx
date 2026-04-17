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
  fetchAnexo6VersionData,
  fetchAnexo7Data,
  fetchAnexo7VersionData,
  fetchAnexo8Data,
  fetchAnexo8VersionData,
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
  type Anexo4Data,
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
  const actualIsSigned = anexo?.actual.estado === "FIRMADO";
  const canManageCompletedOperation = role === "ADMIN";
  const canOperate = operation?.puedeGestionar ?? false;
  const canCreate = canOperate && (!operation?.completada || canManageCompletedOperation);
  const canEditDraft =
    !isViewingHistoricalVersion &&
    canCreate &&
    (!actualIsSigned || (anexo?.actual.numeroVersion ?? 0) === 0);
  const canRemake = !isViewingHistoricalVersion && canCreate && actualIsSigned && !!anexo?.actual.id;
  const canSign =
    !isViewingHistoricalVersion &&
    canCreate &&
    !!anexo?.actual.id &&
    anexo?.actual.estado === "BORRADOR";

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
              data = await fetchAnexo6VersionData(operation.idOperacion, selectedVersionId);
              break;
            case 7:
              data = await fetchAnexo7VersionData(operation.idOperacion, selectedVersionId);
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
              data = await fetchAnexo6Data(operation.idOperacion);
              break;
            case 7:
              data = await fetchAnexo7Data(operation.idOperacion);
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
  }, [operation, selectedVersionId, tipoAnexo]);

  const handleSign = async () => {
    if (!operation || !anexo?.actual.id) {
      return;
    }

    try {
      setSigning(true);
      let signedData: AnexoData | null = null;
      switch (tipoAnexo) {
        case 4:
          signedData = await signAnexo4Data(operation.idOperacion, anexo.actual.id);
          break;
        case 5:
          signedData = await signAnexo5Data(operation.idOperacion, anexo.actual.id);
          break;
        case 6:
          signedData = await signAnexo6Data(operation.idOperacion, anexo.actual.id);
          break;
        case 7:
          signedData = await signAnexo7Data(operation.idOperacion, anexo.actual.id);
          break;
        case 8:
          signedData = await signAnexo8Data(operation.idOperacion, anexo.actual.id);
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
    } catch (err) {
      console.error(`Error firmando ${getAnexoLabel(tipoAnexo)}:`, err);
      alert(`No se pudo firmar ${getAnexoLabel(tipoAnexo)}.`);
    } finally {
      setSigning(false);
    }
  };

  const handleRemake = async () => {
    if (!operation || !anexo?.actual.id) {
      return;
    }

    try {
      setRemaking(true);
      let remadeData: AnexoData | null = null;
      switch (tipoAnexo) {
        case 4:
          remadeData = await remakeAnexo4Data(operation.idOperacion, anexo.actual.id);
          break;
        case 5:
          remadeData = await remakeAnexo5Data(operation.idOperacion, anexo.actual.id);
          break;
        case 6:
          remadeData = await remakeAnexo6Data(operation.idOperacion, anexo.actual.id);
          break;
        case 7:
          remadeData = await remakeAnexo7Data(operation.idOperacion, anexo.actual.id);
          break;
        case 8:
          remadeData = await remakeAnexo8Data(operation.idOperacion, anexo.actual.id);
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
                anexo.actual.numeroVersion > 0
                  ? `v${anexo.actual.numeroVersion}`
                  : "Sin versión"
              }
              style={getAnexoColorStyle(anexo.actual.color)}
            />
            <Badge
              label={anexo.actual.estado ?? "SIN DATOS"}
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

      {!canOperate && (
        <div className="alert alert-danger">
          No tienes permisos para gestionar esta operación y sus anexos.
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
                  canEditPersonalSeleccionado={operation.puedeEditarPersonalSeleccionado}
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
              {tipoAnexo === 7 && (
                <FormOperationAnexo7Detail
                  key={selectedVersionId ?? anexo.actual.id ?? "current"}
                  operationId={operation.idOperacion}
                  initialValues={anexoData as Anexo7Data | null}
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
