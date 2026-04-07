import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../commons/ConfirmModal";
import ButtonProp from "../commons/props/ButtonProp";
import { useAuth } from "../commons/hooks/useAuth";
import {
  fetchOperationDetail,
  remakeAnexo,
  saveAnexo,
  signAnexo,
} from "../operations/operation.api";
import type {
  OperationAnexoDetailDTO,
  OperationDetailDTO,
} from "../operations/operation.types";
import {
  formatDate,
  formatDateTime,
  getAnexoColorStyle,
  getAnexoLabel,
  getOperationStatusStyle,
} from "../operations/operation.utils";

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
  const latest = anexo?.versiones[0];
  return latest?.textoPrueba ?? "";
}

export default function OperationAnexoDetail({ tipoAnexo }: OperationAnexoDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [operation, setOperation] = useState<OperationDetailDTO | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [remaking, setRemaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignConfirm, setShowSignConfirm] = useState(false);
  const [showRemakeConfirm, setShowRemakeConfirm] = useState(false);

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
      const anexo = data.anexos.find((item) => item.tipoAnexo === tipoAnexo) ?? null;
      setDraftValue(buildDraft(anexo));
    } catch (err) {
      console.error("Error cargando anexo:", err);
      setError("No se pudo cargar el anexo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOperation();
  }, [id, tipoAnexo]);

  const anexo = useMemo(
    () => operation?.anexos.find((item) => item.tipoAnexo === tipoAnexo) ?? null,
    [operation, tipoAnexo],
  );

  const actualIsSigned = anexo?.actual.estado === "FIRMADO";
  const canManageCompletedOperation = role === "ADMIN";
  const canCreate = !operation?.completada || canManageCompletedOperation;
  const canEditDraft = canCreate && (!actualIsSigned || (anexo?.actual.numeroVersion ?? 0) === 0);
  const canRemake = canCreate && actualIsSigned && !!anexo?.actual.id;
  const canSign = canCreate && !!anexo?.actual.id && anexo?.actual.estado === "BORRADOR";

  const handleSave = async () => {
    if (!operation || !draftValue.trim()) {
      return;
    }

    try {
      setSaving(true);
      await saveAnexo(operation.idOperacion, tipoAnexo, draftValue.trim());
      await loadOperation();
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
        onClick={() => navigate(`/auth/operations/${operation.idOperacion}`)}
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
          </div>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <ButtonProp
              onClick={() => void handleSave()}
              disabled={!canEditDraft || saving || !draftValue.trim()}
            >
              {saving ? "Guardando..." : anexo.actual.id ? "Guardar borrador" : "Crear anexo"}
            </ButtonProp>
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

      {actualIsSigned && (
        <div className="alert alert-info">
          La versión actual está firmada. Para editar, crea antes una nueva versión con "Rehacer versión".
        </div>
      )}

      <div className="card shadow-sm mb-4" style={{ border: "1px solid #E5E7EB" }}>
        <div className="card-body">
          <h4 className="mb-3">Documento actual</h4>
          <label className="form-label fw-bold" htmlFor={`draft-anexo-${tipoAnexo}`}>
            Texto de prueba
          </label>
          <textarea
            id={`draft-anexo-${tipoAnexo}`}
            className="form-control"
            rows={8}
            value={draftValue}
            disabled={!canEditDraft || saving}
            onChange={(event) => setDraftValue(event.target.value)}
            placeholder={`Contenido de ${getAnexoLabel(tipoAnexo)}`}
          />

          <div className="d-flex gap-2 flex-wrap mt-3">
            <ButtonProp
              onClick={() => void handleSave()}
              disabled={!canEditDraft || saving || !draftValue.trim()}
            >
              {saving ? "Guardando..." : anexo.actual.id ? "Guardar borrador" : "Crear anexo"}
            </ButtonProp>
          </div>
        </div>
      </div>

      <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <div className="card-body">
          <h4 className="mb-3">Versiones registradas</h4>

          {anexo.versiones.length === 0 ? (
            <p className="text-muted mb-0">Todavía no existe ninguna versión para este anexo.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Versión</th>
                    <th>Estado</th>
                    <th>Firmado por</th>
                    <th>Fecha firma</th>
                    <th>Texto</th>
                  </tr>
                </thead>
                <tbody>
                  {anexo.versiones.map((version) => (
                    <tr key={version.id}>
                      <td>{`v${version.numeroVersion}`}</td>
                      <td>
                        <Badge label={version.estado} style={getAnexoColorStyle(version.color)} />
                      </td>
                      <td>{version.firmadoPor ?? "-"}</td>
                      <td>{formatDate(version.fechaFirma)}</td>
                      <td style={{ minWidth: "280px" }}>{version.textoPrueba ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
