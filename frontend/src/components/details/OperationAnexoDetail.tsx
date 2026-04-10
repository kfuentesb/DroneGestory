import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../commons/ConfirmModal";
import ButtonProp from "../commons/props/ButtonProp";
import { useAuth } from "../commons/hooks/useAuth";
import {
  fetchAnexo4Data,
  fetchAnexo4VersionData,
  fetchOperationDetail,
  remakeAnexo,
  saveAnexo,
  signAnexo,
} from "../operations/operation.api";
import type {
  AnexoHistoricoDTO,
  OperationAnexoDetailDTO,
  OperationDetailDTO,
} from "../operations/operation.types";
import {
  formatDateTime,
  getAnexoColorStyle,
  getAnexoLabel,
  getOperationStatusStyle,
} from "../operations/operation.utils";
import FormOperationAnexo4Detail from "../forms/FormOperationAnexo4Detail";

type OperationAnexoDetailProps = {
  tipoAnexo: 4 | 5 | 6 | 7 | 8;
};

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

function buildDraft(anexo: OperationAnexoDetailDTO | null) {
  return anexo?.versiones[0]?.textoPrueba ?? "";
}

export default function OperationAnexoDetail({ tipoAnexo }: OperationAnexoDetailProps) {
  const { id, versionId } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [operation, setOperation] = useState<OperationDetailDTO | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [anexo4Data, setAnexo4Data] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingVersionData, setLoadingVersionData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [remaking, setRemaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignConfirm, setShowSignConfirm] = useState(false);
  const [showRemakeConfirm, setShowRemakeConfirm] = useState(false);

  const isAnexo4 = tipoAnexo === 4;

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
  const canCreate = !operation?.completada || canManageCompletedOperation;
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
      const anexoData = data.anexos.find((item) => item.tipoAnexo === tipoAnexo) ?? null;
      if (!isAnexo4) {
        setDraftValue(buildDraft(anexoData));
      }
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
    if (!isAnexo4 || !operation) {
      return;
    }

    const loadSelectedAnexo4Data = async () => {
      setLoadingVersionData(true);
      try {
        const data = selectedVersionId
          ? await fetchAnexo4VersionData(operation.idOperacion, selectedVersionId)
          : await fetchAnexo4Data(operation.idOperacion);
        setAnexo4Data(data);
      } catch (err) {
        console.error("Error cargando datos del Anexo 4:", err);
        setAnexo4Data(null);
      } finally {
        setLoadingVersionData(false);
      }
    };

    void loadSelectedAnexo4Data();
  }, [isAnexo4, operation, selectedVersionId]);

  const handleSave = async () => {
    if (!operation || !draftValue.trim()) {
      return;
    }

    try {
      setSaving(true);
      await saveAnexo(operation.idOperacion, tipoAnexo, draftValue.trim());
      navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`);
      await loadOperation();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(`Error guardando ${getAnexoLabel(tipoAnexo)}:`, err);
      alert(`No se pudo guardar ${getAnexoLabel(tipoAnexo)}.`);
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    if (!operation || !anexo?.actual.id) {
      return;
    }

    try {
      setSigning(true);
      await signAnexo(operation.idOperacion, tipoAnexo, anexo.actual.id);
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
      await remakeAnexo(operation.idOperacion, tipoAnexo, anexo.actual.id);
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

      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
        <div>
          <h2 className="mb-2">{getAnexoLabel(tipoAnexo)}</h2>
          <p className="text-muted mb-2">{operation.nombreOperacion}</p>
          <div className="d-flex gap-2 flex-wrap">
            <Badge
              label={operation.estadoOperacion}
              style={getOperationStatusStyle(operation.estadoOperacion)}
            />
            <Badge
              label={anexo.actual.numeroVersion > 0 ? `v${anexo.actual.numeroVersion}` : "Sin versión"}
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
          {!isAnexo4 && (
            <ButtonProp
              onClick={() => void handleSave()}
              disabled={!canEditDraft || saving || !draftValue.trim()}
            >
              {saving ? "Guardando..." : anexo.actual.id ? "Guardar borrador" : "Crear anexo"}
            </ButtonProp>
          )}
          <ButtonProp
            className="btn"
            style={{ backgroundColor: "#92400E", color: "#FFFFFF", fontWeight: "bold" }}
            onClick={() => setShowRemakeConfirm(true)}
            disabled={!canRemake || remaking}
          >
            {remaking ? "Rehaciendo..." : "Rehacer versión"}
          </ButtonProp>
          <ButtonProp
            className="btn"
            style={{ backgroundColor: "#1D4ED8", color: "#FFFFFF", fontWeight: "bold" }}
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
            <small className="text-muted d-block mb-1">Creación operación</small>
            <strong>{formatDateTime(operation.fechaCreacion)}</strong>
          </div>
        </div>
        <div className="col-md-6 col-12 mb-3">
          <div className="border rounded p-3 h-100">
            <small className="text-muted d-block mb-1">Última actualización</small>
            <strong>{formatDateTime(operation.fechaActualizacion)}</strong>
          </div>
        </div>
      </div>

      {operation.completada && !canManageCompletedOperation && (
        <div className="alert alert-warning">
          La operación está completada. Solo un administrador puede modificar anexos.
        </div>
      )}

      {operation.completada && canManageCompletedOperation && (
        <div className="alert alert-info">
          La operación está completada, pero tienes permisos de administrador para gestionar versiones del anexo.
        </div>
      )}

      {actualIsSigned && !isViewingHistoricalVersion && (
        <div className="alert alert-info">
          La versión actual está firmada. Para editar, crea antes una nueva versión con "Rehacer versión".
        </div>
      )}

      {isViewingHistoricalVersion && selectedVersion && (
        <div className="alert alert-secondary">
          Estás consultando la versión histórica v{selectedVersion.numeroVersion}. Esta vista es solo lectura.
        </div>
      )}

      <div className="card shadow-sm mb-4" style={{ border: "1px solid #E5E7EB" }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
            <h4 className="mb-0">
              {isViewingHistoricalVersion && selectedVersion
                ? `Detalle versión v${selectedVersion.numeroVersion}`
                : "Detalle versión actual"}
            </h4>
            {isViewingHistoricalVersion && (
              <ButtonProp onClick={() => navigate(`/operations/${operation.idOperacion}`)}>
                Volver a la operación
              </ButtonProp>
            )}
          </div>

          {isAnexo4 ? (
            loadingVersionData ? (
              <div className="text-center py-4">Cargando versión...</div>
            ) : (
              <FormOperationAnexo4Detail
                operationId={operation.idOperacion}
                initialValues={anexo4Data ?? {}}
                disabled={isViewingHistoricalVersion || !canEditDraft}
                readOnlyMessage={
                  isViewingHistoricalVersion
                    ? "Estás consultando una versión histórica. Esta vista es solo lectura."
                    : undefined
                }
                onSaved={async () => {
                  navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`);
                  await loadOperation();
                }}
              />
            )
          ) : (
            <>
              <label className="form-label fw-bold" htmlFor={`draft-anexo-${tipoAnexo}`}>
                Texto
              </label>
              <textarea
                id={`draft-anexo-${tipoAnexo}`}
                className="form-control"
                rows={10}
                value={isViewingHistoricalVersion ? selectedVersion?.textoPrueba ?? "" : draftValue}
                disabled={isViewingHistoricalVersion || saving || !canEditDraft}
                onChange={(event) => setDraftValue(event.target.value)}
                placeholder={`Contenido de ${getAnexoLabel(tipoAnexo)}`}
              />

              {!isViewingHistoricalVersion && (
                <div className="d-flex gap-2 flex-wrap mt-3">
                  <ButtonProp
                    onClick={() => void handleSave()}
                    disabled={!canEditDraft || saving || !draftValue.trim()}
                  >
                    {saving ? "Guardando..." : anexo.actual.id ? "Guardar borrador" : "Crear anexo"}
                  </ButtonProp>
                </div>
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
