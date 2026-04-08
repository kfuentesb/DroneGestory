import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../commons/ConfirmModal";
import ButtonProp from "../commons/props/ButtonProp";
import { useAuth } from "../commons/hooks/useAuth";
import {
  fetchAnexo4Detail,
  fetchOperationDetail,
  remakeAnexo,
  saveAnexo4,
  signAnexo,
} from "../operations/operation.api";
import type {
  Anexo4Fields,
  Anexo4ResponseDTO,
  OperationDetailDTO,
} from "../operations/operation.types";
import {
  formatDate,
  formatDateTime,
  getAnexoColorStyle,
  getAnexoLabel,
  getOperationStatusStyle,
} from "../operations/operation.utils";
import Anexo4FormContent from "../forms/Anexo4FormContent";
import { ANEXO4_INITIAL_FIELDS, BOOLEAN_FIELD_LABELS } from "../forms/anexo4.constants";

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

function boolLabel(value: boolean | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value ? "Sí" : "No";
}

function responseToFields(data: Anexo4ResponseDTO): Anexo4Fields {
  const toStr = (v: boolean | null | undefined) =>
    v === null || v === undefined ? "" : String(v);
  return {
    descripcion: data.descripcion ?? "",
    fechaHoraPrevista: data.fechaHoraPrevista
      ? data.fechaHoraPrevista.slice(0, 16)
      : "",
    mediosMateriales: data.mediosMateriales ?? "",
    direccion: data.direccion ?? "",
    coords: data.coords ?? "",
    personal: data.personal ?? "",
    imagenEspacioAereo: data.imagenEspacioAereo ?? "",
    imagenZonaVuelo: data.imagenZonaVuelo ?? "",
    espacioAereoControlado: toStr(data.espacioAereoControlado),
    estudioAeronauticoCoordinado: toStr(data.estudioAeronauticoCoordinado),
    entornoAerodromos: toStr(data.entornoAerodromos),
    distanciaMinimaInfraestructuras: toStr(data.distanciaMinimaInfraestructuras),
    zonasProhibidasFlexible: toStr(data.zonasProhibidasFlexible),
    cumpleCondiciones: toStr(data.cumpleCondiciones),
    zonasSeguridad: toStr(data.zonasSeguridad),
    permisoPrevioSeguridad: toStr(data.permisoPrevioSeguridad),
    serviciosEsencialesComunidad: toStr(data.serviciosEsencialesComunidad),
    permisoPrevioServicios: toStr(data.permisoPrevioServicios),
    entornosUrbanos: toStr(data.entornosUrbanos),
    cumplenDistanciasEdificios: toStr(data.cumplenDistanciasEdificios),
    comunicacionMinisterioInterior: toStr(data.comunicacionMinisterioInterior),
    zonaResVueloFotografico: toStr(data.zonaResVueloFotografico),
    permisoCecaf: toStr(data.permisoCecaf),
    zonasProtMedioambiental: toStr(data.zonasProtMedioambiental),
    disponeCoordGestor: toStr(data.disponeCoordGestor),
    conopsYModeloSemantico: toStr(data.conopsYModeloSemantico),
    aplicaModelo: toStr(data.aplicaModelo),
    defineGeografiaVueloConops: toStr(data.defineGeografiaVueloConops),
    defineVolContigencia: toStr(data.defineVolContigencia),
    defineMargenRiesgoTierra: toStr(data.defineMargenRiesgoTierra),
    defineZonaTerrestreControlada: toStr(data.defineZonaTerrestreControlada),
    planificaUbicacionObservadores: toStr(data.planificaUbicacionObservadores),
    calculaAreaYEvaluaRiesgo: toStr(data.calculaAreaYEvaluaRiesgo),
    notams: toStr(data.notams),
    revisaNotams: toStr(data.revisaNotams),
    tsaOCondicionada: toStr(data.tsaOCondicionada),
    otrasLimitaciones: toStr(data.otrasLimitaciones),
  };
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="col-md-6 col-12 mb-2">
      <small className="text-muted d-block">{label}</small>
      <span className="fw-semibold">{value || "—"}</span>
    </div>
  );
}

export default function OperationAnexo4Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [operation, setOperation] = useState<OperationDetailDTO | null>(null);
  const [anexo4Data, setAnexo4Data] = useState<Anexo4ResponseDTO | null>(null);
  const [editFields, setEditFields] = useState<Anexo4Fields>(ANEXO4_INITIAL_FIELDS);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [remaking, setRemaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignConfirm, setShowSignConfirm] = useState(false);
  const [showRemakeConfirm, setShowRemakeConfirm] = useState(false);

  const loadData = async () => {
    if (!id) {
      setError("No se ha indicado la operación.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [opData, a4Data] = await Promise.all([
        fetchOperationDetail(id),
        fetchAnexo4Detail(id),
      ]);

      if (!opData) return;
      setOperation(opData);

      if (a4Data) {
        setAnexo4Data(a4Data);
        setEditFields(responseToFields(a4Data));
      }
    } catch (err) {
      console.error("Error cargando Anexo 4:", err);
      setError("No se pudo cargar el Anexo 4.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const anexo = useMemo(
    () => operation?.anexos.find((item) => item.tipoAnexo === 4) ?? null,
    [operation],
  );

  const actualIsSigned = anexo?.actual.estado === "FIRMADO";
  const canManageCompletedOperation = role === "ADMIN";
  const canCreate = !operation?.completada || canManageCompletedOperation;
  const canEdit = canCreate && (!actualIsSigned || (anexo?.actual.numeroVersion ?? 0) === 0);
  const canRemake = canCreate && actualIsSigned && !!anexo?.actual.id;
  const canSign = canCreate && !!anexo?.actual.id && anexo?.actual.estado === "BORRADOR";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operation) return;

    try {
      setSaving(true);
      await saveAnexo4(operation.idOperacion, editFields);
      setIsEditing(false);
      await loadData();
    } catch (err) {
      console.error("Error guardando Anexo 4:", err);
      alert("No se pudo guardar el Anexo 4.");
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    if (!operation || !anexo?.actual.id) return;

    try {
      setSigning(true);
      await signAnexo(operation.idOperacion, 4, anexo.actual.id);
      setShowSignConfirm(false);
      await loadData();
    } catch (err) {
      console.error("Error firmando Anexo 4:", err);
      alert("No se pudo firmar el Anexo 4.");
    } finally {
      setSigning(false);
    }
  };

  const handleRemake = async () => {
    if (!operation || !anexo?.actual.id) return;

    try {
      setRemaking(true);
      await remakeAnexo(operation.idOperacion, 4, anexo.actual.id);
      setShowRemakeConfirm(false);
      await loadData();
    } catch (err) {
      console.error("Error rehaciendo Anexo 4:", err);
      alert("No se pudo rehacer el Anexo 4.");
    } finally {
      setRemaking(false);
    }
  };

  if (loading) {
    return <div className="container py-4 text-center">Cargando Anexo 4...</div>;
  }

  if (error || !operation || !anexo) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error ?? "Anexo 4 no encontrado."}
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
          <h2 className="mb-2">{getAnexoLabel(4)}</h2>
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
          {!isEditing && canEdit && (
            <ButtonProp onClick={() => setIsEditing(true)}>
              {anexo.actual.id ? "Editar borrador" : "Crear Anexo 4"}
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

      {actualIsSigned && (
        <div className="alert alert-info">
          La versión actual está firmada. Para editar, crea antes una nueva versión con "Rehacer versión".
        </div>
      )}

      {/* Anexo4 data — edit mode */}
      {isEditing ? (
        <div className="card shadow-sm mb-4" style={{ border: "1px solid #E5E7EB" }}>
          <div className="card-body">
            <h4 className="mb-3">Editar Anexo 4</h4>
            <Anexo4FormContent
              fields={editFields}
              setFields={setEditFields}
              saving={saving}
              error={null}
              onSubmit={handleSave}
              onCancel={() => setIsEditing(false)}
              submitLabel={saving ? "Guardando..." : "Guardar borrador"}
              showCancel={true}
            />
          </div>
        </div>
      ) : (
        <div className="card shadow-sm mb-4" style={{ border: "1px solid #E5E7EB" }}>
          <div className="card-body">
            <h4 className="mb-3">Datos del Anexo 4</h4>

            {!anexo4Data ? (
              <p className="text-muted">Todavía no hay datos registrados para este anexo.</p>
            ) : (
              <>
                <div className="row mb-3">
                  <ReadOnlyField label="Descripción" value={anexo4Data.descripcion ?? ""} />
                  <ReadOnlyField
                    label="Fecha/Hora Prevista"
                    value={
                      anexo4Data.fechaHoraPrevista
                        ? formatDateTime(anexo4Data.fechaHoraPrevista)
                        : ""
                    }
                  />
                  <ReadOnlyField label="Medios materiales" value={anexo4Data.mediosMateriales ?? ""} />
                  <ReadOnlyField label="Dirección" value={anexo4Data.direccion ?? ""} />
                  <ReadOnlyField label="Coordenadas" value={anexo4Data.coords ?? ""} />
                  <ReadOnlyField label="Personal" value={anexo4Data.personal ?? ""} />
                  <ReadOnlyField label="Imagen espacio aéreo" value={anexo4Data.imagenEspacioAereo ?? ""} />
                  <ReadOnlyField label="Imagen zona de vuelo" value={anexo4Data.imagenZonaVuelo ?? ""} />
                </div>

                <h6 className="fw-bold mt-3 mb-2">Sección 4 — Zonas geográficas de UAS</h6>
                <div className="row mb-3">
                  {(
                    [
                      "espacioAereoControlado",
                      "estudioAeronauticoCoordinado",
                      "entornoAerodromos",
                      "distanciaMinimaInfraestructuras",
                      "zonasProhibidasFlexible",
                      "cumpleCondiciones",
                      "zonasSeguridad",
                      "permisoPrevioSeguridad",
                      "serviciosEsencialesComunidad",
                      "permisoPrevioServicios",
                      "entornosUrbanos",
                      "cumplenDistanciasEdificios",
                      "comunicacionMinisterioInterior",
                      "zonaResVueloFotografico",
                      "permisoCecaf",
                      "zonasProtMedioambiental",
                      "disponeCoordGestor",
                    ] as (keyof Anexo4ResponseDTO)[]
                  ).map((key) => (
                    <ReadOnlyField
                      key={key}
                      label={BOOLEAN_FIELD_LABELS[key] ?? key}
                      value={boolLabel(anexo4Data[key] as boolean | null)}
                    />
                  ))}
                </div>

                <h6 className="fw-bold mt-3 mb-2">Sección 6 — Requisitos y limitaciones</h6>
                <div className="row">
                  {(
                    [
                      "conopsYModeloSemantico",
                      "aplicaModelo",
                      "defineGeografiaVueloConops",
                      "defineVolContigencia",
                      "defineMargenRiesgoTierra",
                      "defineZonaTerrestreControlada",
                      "planificaUbicacionObservadores",
                      "calculaAreaYEvaluaRiesgo",
                      "notams",
                      "revisaNotams",
                      "tsaOCondicionada",
                      "otrasLimitaciones",
                    ] as (keyof Anexo4ResponseDTO)[]
                  ).map((key) => (
                    <ReadOnlyField
                      key={key}
                      label={BOOLEAN_FIELD_LABELS[key] ?? key}
                      value={boolLabel(anexo4Data[key] as boolean | null)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Version history */}
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
                    <th>Descripción</th>
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
        title="Firmar Anexo 4"
        message="Se firmará la versión actual en borrador. Después ya no podrás editarla sin crear una nueva versión."
        onConfirm={() => void handleSign()}
        onCancel={() => setShowSignConfirm(false)}
        variant="primary"
      />

      <ConfirmModal
        show={showRemakeConfirm}
        title="Rehacer Anexo 4"
        message="Se creará una nueva versión en borrador a partir de la versión firmada actual."
        onConfirm={() => void handleRemake()}
        onCancel={() => setShowRemakeConfirm(false)}
        variant="primary"
      />
    </div>
  );
}
