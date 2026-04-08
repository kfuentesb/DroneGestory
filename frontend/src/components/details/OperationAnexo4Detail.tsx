import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../commons/ConfirmModal";
import ButtonProp from "../commons/props/ButtonProp";
import { useAuth } from "../commons/hooks/useAuth";
import {
  fetchAnexo4Detail,
  fetchOperationDetail,
  remakeAnexo,
  saveAnexo4Full,
  signAnexo,
} from "../operations/operation.api";
import type { Anexo4Data, OperationDetailDTO } from "../operations/operation.types";
import {
  formatDateTime,
  getAnexoColorStyle,
  getAnexoLabel,
  getOperationStatusStyle,
} from "../operations/operation.utils";
import "../../styles/generic-form.css";

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

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-3 mt-4">
      <h5
        className="fw-bold"
        style={{ borderBottom: "2px solid #E5E7EB", paddingBottom: "0.4rem" }}
      >
        Sección {number}: {title}
      </h5>
    </div>
  );
}

type CheckboxRowProps = {
  id: string;
  label: string;
  checked: boolean | null | undefined;
  onChange: (val: boolean) => void;
  disabled?: boolean;
};

function CheckboxRow({ id, label, checked, onChange, disabled }: CheckboxRowProps) {
  return (
    <div className="form-check mb-2">
      <input
        className="form-check-input"
        type="checkbox"
        id={id}
        checked={checked === true}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}

const EMPTY_FORM: Anexo4Data = {
  descripcion: "",
  fechaHoraPrevista: "",
  personal: "",
  mediosMateriales: "",
  direccion: "",
  coords: "",
  imagenEspacioAereo: "",
  imagenZonaVuelo: "",
  espacioAereoControlado: false,
  estudioAeronauticoCoordinado: false,
  entornoAerodromos: false,
  distanciaMinimaInfraestructuras: false,
  zonasProhibidasFlexible: false,
  cumpleCondiciones: false,
  zonasSeguridad: false,
  permisoPrevioSeguridad: false,
  serviciosEsencialesComunidad: false,
  permisoPrevioServicios: false,
  entornosUrbanos: false,
  cumplenDistanciasEdificios: false,
  comunicacionMinisterioInterior: false,
  zonaResVueloFotografico: false,
  permisoCecaf: false,
  zonasProtMedioambiental: false,
  disponeCoordGestor: false,
  conopsYModeloSemantico: false,
  aplicaModelo: false,
  defineGeografiaVueloConops: false,
  defineVolContigencia: false,
  defineMargenRiesgoTierra: false,
  defineZonaTerrestreControlada: false,
  planificaUbicacionObservadores: false,
  calculaAreaYEvaluaRiesgo: false,
  notams: false,
  revisaNotams: false,
  tsaOCondicionada: false,
};

function toFormData(raw: Anexo4Data): Anexo4Data {
  return {
    ...EMPTY_FORM,
    ...raw,
    descripcion: raw.descripcion ?? "",
    fechaHoraPrevista: raw.fechaHoraPrevista ? raw.fechaHoraPrevista.slice(0, 16) : "",
    personal: raw.personal ?? "",
    mediosMateriales: raw.mediosMateriales ?? "",
    direccion: raw.direccion ?? "",
    coords: raw.coords ?? "",
    imagenEspacioAereo: raw.imagenEspacioAereo ?? "",
    imagenZonaVuelo: raw.imagenZonaVuelo ?? "",
  };
}

export default function OperationAnexo4Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [operation, setOperation] = useState<OperationDetailDTO | null>(null);
  const [form, setForm] = useState<Anexo4Data>({ ...EMPTY_FORM });
  const [fileEspacioAereo, setFileEspacioAereo] = useState<File | null>(null);
  const [fileZonaVuelo, setFileZonaVuelo] = useState<File | null>(null);
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
      const [opData, anexoData] = await Promise.all([
        fetchOperationDetail(id),
        fetchAnexo4Detail(id),
      ]);

      if (!opData) return;
      setOperation(opData);
      setForm(anexoData ? toFormData(anexoData) : { ...EMPTY_FORM });
    } catch (err) {
      console.error("Error cargando Anexo 4:", err);
      setError("No se pudo cargar el Anexo 4.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [id]);

  const anexo = operation?.anexos.find((a) => a.tipoAnexo === 4) ?? null;
  const actualIsSigned = anexo?.actual.estado === "FIRMADO";
  const canManageCompletedOperation = role === "ADMIN";
  const canCreate = !operation?.completada || canManageCompletedOperation;
  const canEdit = canCreate && (!actualIsSigned || (anexo?.actual.numeroVersion ?? 0) === 0);
  const canRemake = canCreate && actualIsSigned && !!anexo?.actual.id;
  const canSign = canCreate && !!anexo?.actual.id && anexo?.actual.estado === "BORRADOR";

  const setField = <K extends keyof Anexo4Data>(key: K, value: Anexo4Data[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!operation) return;
    try {
      setSaving(true);
      await saveAnexo4Full(operation.idOperacion, form, fileEspacioAereo, fileZonaVuelo);
      setFileEspacioAereo(null);
      setFileZonaVuelo(null);
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

      {/* Header */}
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
          <ButtonProp onClick={() => void handleSave()} disabled={!canEdit || saving}>
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

      {actualIsSigned && (
        <div className="alert alert-info">
          La versión actual está firmada. Para editar, crea antes una nueva versión con "Rehacer versión".
        </div>
      )}

      {/* FORMULARIO */}
      <div className="card shadow-sm mb-4" style={{ border: "1px solid #E5E7EB" }}>
        <div className="card-body">

          {/* SECCIÓN 1 */}
          <SectionHeader number="1" title="Información sobre las operaciones" />

          <div className="mb-3">
            <label className="form-label fw-bold" htmlFor="descripcion">
              Descripción y objetivos
            </label>
            <textarea
              id="descripcion"
              className="form-control"
              rows={4}
              value={form.descripcion ?? ""}
              disabled={!canEdit || saving}
              onChange={(e) => setField("descripcion", e.target.value)}
              placeholder="Descripción de los objetivos de la operación"
            />
          </div>

          <div className="row">
            <div className="col-md-6 col-12 mb-3">
              <label className="form-label fw-bold" htmlFor="fechaHoraPrevista">
                Fecha y hora prevista
              </label>
              <input
                id="fechaHoraPrevista"
                type="datetime-local"
                className="form-control"
                value={form.fechaHoraPrevista ?? ""}
                disabled={!canEdit || saving}
                onChange={(e) => setField("fechaHoraPrevista", e.target.value)}
              />
            </div>

            <div className="col-md-6 col-12 mb-3">
              <label className="form-label fw-bold" htmlFor="personal">
                Personal necesario
              </label>
              <input
                id="personal"
                type="text"
                className="form-control"
                value={form.personal ?? ""}
                disabled={!canEdit || saving}
                onChange={(e) => setField("personal", e.target.value)}
                placeholder="Personal necesario para la operación"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold" htmlFor="mediosMateriales">
              Medios materiales
            </label>
            <input
              id="mediosMateriales"
              type="text"
              className="form-control"
              value={form.mediosMateriales ?? ""}
              disabled={!canEdit || saving}
              onChange={(e) => setField("mediosMateriales", e.target.value)}
              placeholder="Medios materiales necesarios"
            />
          </div>

          {/* SECCIÓN 2 */}
          <SectionHeader number="2" title="Evaluación del escenario" />

          <div className="row">
            <div className="col-md-6 col-12 mb-3">
              <label className="form-label fw-bold" htmlFor="direccion">
                Dirección
              </label>
              <input
                id="direccion"
                type="text"
                className="form-control"
                value={form.direccion ?? ""}
                disabled={!canEdit || saving}
                onChange={(e) => setField("direccion", e.target.value)}
                placeholder="Dirección del escenario"
              />
            </div>

            <div className="col-md-6 col-12 mb-3">
              <label className="form-label fw-bold" htmlFor="coords">
                Coordenadas
              </label>
              <input
                id="coords"
                type="text"
                className="form-control"
                value={form.coords ?? ""}
                disabled={!canEdit || saving}
                onChange={(e) => setField("coords", e.target.value)}
                placeholder="Ej: 40.416775, -3.703790"
              />
            </div>
          </div>

          {/* SECCIÓN 3 */}
          <SectionHeader number="3" title="Espacio aéreo" />

          <div className="mb-3">
            <label className="form-label fw-bold">Archivo de espacio aéreo</label>
            <div className="d-flex align-items-center gap-2">
              <input
                type="text"
                className="form-control"
                value={form.imagenEspacioAereo ?? ""}
                disabled={!canEdit || saving}
                onChange={(e) => setField("imagenEspacioAereo", e.target.value)}
                placeholder="Ruta o nombre del archivo"
                style={{ flex: 1 }}
              />
              <label
                htmlFor="fileEspacioAereo"
                className={`btn btn-outline-secondary btn-sm mb-0${!canEdit || saving ? " disabled" : ""}`}
                style={{ whiteSpace: "nowrap", cursor: !canEdit || saving ? "not-allowed" : "pointer" }}
              >
                Seleccionar archivo
              </label>
              <input
                id="fileEspacioAereo"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.kml,.kmz"
                style={{ display: "none" }}
                disabled={!canEdit || saving}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFileEspacioAereo(file);
                    setField("imagenEspacioAereo", file.name);
                  }
                }}
              />
            </div>
            <small className="text-muted">Formatos aceptados: PDF, JPG, PNG, KML, KMZ</small>
          </div>

          {/* SECCIÓN 4 */}
          <SectionHeader number="4" title="Zonas geográficas UAS" />

          <div className="row">
            <div className="col-md-6 col-12">
              <CheckboxRow
                id="espacioAereoControlado"
                label="4.1 Espacio aéreo controlado"
                checked={form.espacioAereoControlado}
                onChange={(v) => setField("espacioAereoControlado", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="estudioAeronauticoCoordinado"
                label="4.1.1 Estudio aeronáutico coordinado"
                checked={form.estudioAeronauticoCoordinado}
                onChange={(v) => setField("estudioAeronauticoCoordinado", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="entornoAerodromos"
                label="4.2 Entorno de aeródromos"
                checked={form.entornoAerodromos}
                onChange={(v) => setField("entornoAerodromos", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="distanciaMinimaInfraestructuras"
                label="4.2.1 Distancia mínima a infraestructuras"
                checked={form.distanciaMinimaInfraestructuras}
                onChange={(v) => setField("distanciaMinimaInfraestructuras", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="zonasProhibidasFlexible"
                label="4.3 Zonas prohibidas / flexibles"
                checked={form.zonasProhibidasFlexible}
                onChange={(v) => setField("zonasProhibidasFlexible", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="cumpleCondiciones"
                label="4.3.1 Cumple condiciones"
                checked={form.cumpleCondiciones}
                onChange={(v) => setField("cumpleCondiciones", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="zonasSeguridad"
                label="4.4 Zonas de seguridad"
                checked={form.zonasSeguridad}
                onChange={(v) => setField("zonasSeguridad", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="permisoPrevioSeguridad"
                label="4.4.1 Permiso previo de seguridad"
                checked={form.permisoPrevioSeguridad}
                onChange={(v) => setField("permisoPrevioSeguridad", v)}
                disabled={!canEdit || saving}
              />
            </div>

            <div className="col-md-6 col-12">
              <CheckboxRow
                id="serviciosEsencialesComunidad"
                label="4.5 Servicios esenciales de la comunidad"
                checked={form.serviciosEsencialesComunidad}
                onChange={(v) => setField("serviciosEsencialesComunidad", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="permisoPrevioServicios"
                label="4.5.1 Permiso previo de servicios"
                checked={form.permisoPrevioServicios}
                onChange={(v) => setField("permisoPrevioServicios", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="entornosUrbanos"
                label="4.6 Entornos urbanos"
                checked={form.entornosUrbanos}
                onChange={(v) => setField("entornosUrbanos", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="cumplenDistanciasEdificios"
                label="4.6.1 Cumplen distancias a edificios"
                checked={form.cumplenDistanciasEdificios}
                onChange={(v) => setField("cumplenDistanciasEdificios", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="comunicacionMinisterioInterior"
                label="4.6.2 Comunicación al Ministerio del Interior"
                checked={form.comunicacionMinisterioInterior}
                onChange={(v) => setField("comunicacionMinisterioInterior", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="zonaResVueloFotografico"
                label="4.7 Zona reservada de vuelo fotográfico"
                checked={form.zonaResVueloFotografico}
                onChange={(v) => setField("zonaResVueloFotografico", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="permisoCecaf"
                label="4.7.1 Permiso CECAF"
                checked={form.permisoCecaf}
                onChange={(v) => setField("permisoCecaf", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="zonasProtMedioambiental"
                label="4.8 Zonas de protección medioambiental"
                checked={form.zonasProtMedioambiental}
                onChange={(v) => setField("zonasProtMedioambiental", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="disponeCoordGestor"
                label="4.8.1 Dispone de coordinación con el gestor"
                checked={form.disponeCoordGestor}
                onChange={(v) => setField("disponeCoordGestor", v)}
                disabled={!canEdit || saving}
              />
            </div>
          </div>

          {/* SECCIÓN 5 */}
          <SectionHeader number="5" title="Zona de vuelo" />

          <div className="mb-3">
            <label className="form-label fw-bold">Archivo de zona de vuelo</label>
            <div className="d-flex align-items-center gap-2">
              <input
                type="text"
                className="form-control"
                value={form.imagenZonaVuelo ?? ""}
                disabled={!canEdit || saving}
                onChange={(e) => setField("imagenZonaVuelo", e.target.value)}
                placeholder="Ruta o nombre del archivo"
                style={{ flex: 1 }}
              />
              <label
                htmlFor="fileZonaVuelo"
                className={`btn btn-outline-secondary btn-sm mb-0${!canEdit || saving ? " disabled" : ""}`}
                style={{ whiteSpace: "nowrap", cursor: !canEdit || saving ? "not-allowed" : "pointer" }}
              >
                Seleccionar archivo
              </label>
              <input
                id="fileZonaVuelo"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.kml,.kmz"
                style={{ display: "none" }}
                disabled={!canEdit || saving}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFileZonaVuelo(file);
                    setField("imagenZonaVuelo", file.name);
                  }
                }}
              />
            </div>
            <small className="text-muted">Formatos aceptados: PDF, JPG, PNG, KML, KMZ</small>
          </div>

          {/* SECCIÓN 6 */}
          <SectionHeader number="6" title="Requisitos y limitaciones" />

          <div className="row">
            <div className="col-md-6 col-12">
              <CheckboxRow
                id="conopsYModeloSemantico"
                label="6.1 ConOps y modelo semántico"
                checked={form.conopsYModeloSemantico}
                onChange={(v) => setField("conopsYModeloSemantico", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="aplicaModelo"
                label="6.1.1 Aplica modelo"
                checked={form.aplicaModelo}
                onChange={(v) => setField("aplicaModelo", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="defineGeografiaVueloConops"
                label="6.1.2 Define geografía de vuelo en ConOps"
                checked={form.defineGeografiaVueloConops}
                onChange={(v) => setField("defineGeografiaVueloConops", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="defineVolContigencia"
                label="6.1.3 Define volumen de contingencia"
                checked={form.defineVolContigencia}
                onChange={(v) => setField("defineVolContigencia", v)}
                disabled={!canEdit || saving}
              />
            </div>
            <div className="col-md-6 col-12">
              <CheckboxRow
                id="defineMargenRiesgoTierra"
                label="6.1.4 Define margen de riesgo en tierra"
                checked={form.defineMargenRiesgoTierra}
                onChange={(v) => setField("defineMargenRiesgoTierra", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="defineZonaTerrestreControlada"
                label="6.1.5 Define zona terrestre controlada"
                checked={form.defineZonaTerrestreControlada}
                onChange={(v) => setField("defineZonaTerrestreControlada", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="planificaUbicacionObservadores"
                label="6.1.6 Planifica ubicación de observadores"
                checked={form.planificaUbicacionObservadores}
                onChange={(v) => setField("planificaUbicacionObservadores", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="calculaAreaYEvaluaRiesgo"
                label="6.1.7 Calcula área y evalúa riesgo"
                checked={form.calculaAreaYEvaluaRiesgo}
                onChange={(v) => setField("calculaAreaYEvaluaRiesgo", v)}
                disabled={!canEdit || saving}
              />
            </div>

            <div className="col-12 mt-2">
            </div>
            <div className="col-md-6 col-12">
              <CheckboxRow
                id="notams"
                label="6.2 NOTAMs"
                checked={form.notams}
                onChange={(v) => setField("notams", v)}
                disabled={!canEdit || saving}
              />
            </div>
            <div className="col-md-6 col-12">
              <CheckboxRow
                id="revisaNotams"
                label="6.2.1 Revisa NOTAMs"
                checked={form.revisaNotams}
                onChange={(v) => setField("revisaNotams", v)}
                disabled={!canEdit || saving}
              />
              <CheckboxRow
                id="tsaOCondicionada"
                label="6.2.2 TSA o condicionada"
                checked={form.tsaOCondicionada}
                onChange={(v) => setField("tsaOCondicionada", v)}
                disabled={!canEdit || saving}
              />
            </div>
          </div>

          {/* Bottom save button */}
          <div className="d-flex gap-2 mt-4">
            <ButtonProp onClick={() => void handleSave()} disabled={!canEdit || saving}>
              {saving ? "Guardando..." : anexo.actual.id ? "Guardar borrador" : "Crear anexo"}
            </ButtonProp>
          </div>
        </div>
      </div>

      {/* Versiones históricas */}
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
                      <td>
                        {version.fechaFirma
                          ? new Date(version.fechaFirma).toLocaleDateString("es-ES")
                          : "-"}
                      </td>
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
