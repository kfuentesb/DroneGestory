import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch, API_BASE_URL } from "../../api";

const initialFields = {
  descripcion: "",
  fechaHoraPrevista: "",
  mediosMateriales: "",
  direccion: "",
  coords: "",
  personal: "",
  imagenEspacioAereo: "",
  imagenZonaVuelo: "",
  espacioAereoControlado: "",
  estudioAeronauticoCoordinado: "",
  entornoAerodromos: "",
  distanciaMinimaInfraestructuras: "",
  zonasProhibidasFlexible: "",
  cumpleCondiciones: "",
  zonasSeguridad: "",
  permisoPrevioSeguridad: "",
  serviciosEsencialesComunidad: "",
  permisoPrevioServicios: "",
  entornosUrbanos: "",
  cumplenDistanciasEdificios: "",
  comunicacionMinisterioInterior: "",
  zonaResVueloFotografico: "",
  permisoCecaf: "",
  zonasProtMedioambiental: "",
  disponeCoordGestor: "",
  conopsYModeloSemantico: "",
  aplicaModelo: "",
  defineGeografiaVueloConops: "",
  defineVolContigencia: "",
  defineMargenRiesgoTierra: "",
  defineZonaTerrestreControlada: "",
  planificaUbicacionObservadores: "",
  calculaAreaYEvaluaRiesgo: "",
  notams: "",
  revisaNotams: "",
  tsaOCondicionada: "",
  otrasLimitaciones: "",
};

const booleanFields = [
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
];

export default function FormAnexo4() {
  const { id: operationId } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState(initialFields);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operationId) return setError("Falta el ID de operación.");

    setSaving(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        if (
          booleanFields.includes(key)
        ) {
          // Solo enviamos si el valor no es vacío
          if (value !== "") formData.append(key, value);
        } else {
          // Strings, fechas, imágenes, personal...
          if (value !== "") formData.append(key, value);
        }
      });

      // Cambia a POST si es edición/creación (ajusta path si usas edit/{id})
      const res = await apiFetch(
        `/api/operations/${operationId}/anexo4`,
        {
          method: "POST",
          // NO pongas Content-Type, FormData lo autogestiona
          body: formData,
        }
      ).then((r) => r.json());

      setResult(res);
      alert("Anexo 4 guardado correctamente");
      navigate(`/operations/${operationId}/anexo4`);
    } catch (err: any) {
      setError(err.message || "No se pudo guardar el anexo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card p-4">
            <h3 className="mb-3">Registro Anexo 4</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="fw-bold">Descripción</label>
                <textarea
                  name="descripcion"
                  value={fields.descripcion}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="fw-bold">Fecha/Hora Prevista</label>
                <input
                  type="datetime-local"
                  name="fechaHoraPrevista"
                  value={fields.fechaHoraPrevista}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="fw-bold">Medios materiales</label>
                <input
                  type="text"
                  name="mediosMateriales"
                  value={fields.mediosMateriales}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="fw-bold">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={fields.direccion}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="fw-bold">Coordenadas</label>
                <input
                  type="text"
                  name="coords"
                  value={fields.coords}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="fw-bold">Personal</label>
                <input
                  type="text"
                  name="personal"
                  value={fields.personal}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              {/* Puedes repetir este patrón para el resto de campos string/fechas/imágenes */}

              <div className="row">
                <div className="col-12">
                  <h5 className="mb-2 mt-3">Zonas y requisitos (booleanos)</h5>
                </div>
                {booleanFields.map((field) => (
                  <div key={field} className="col-md-6 col-12 mb-2">
                    <label className="fw-bold">{field}</label>
                    <select
                      name={field}
                      value={fields[field as keyof typeof fields]}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Sin especificar</option>
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(`/operations/${operationId}`)}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>

              {error && <p className="text-danger mt-3">{error}</p>}
              {result && (
                <pre style={{ background: "#FCF7E9", marginTop: 20 }}>{JSON.stringify(result, null, 2)}</pre>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}