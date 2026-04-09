import { useMemo, useState } from "react";
import { apiFetch } from "../../api";
import type { FieldConfig } from "../details/FieldConfig";
import { operationAnexo4DetailFields } from "../details/OperationsAnexo4DetailFields";

type FormOperationAnexo4DetailProps = {
  operationId: number;
  operationTitle: string; // Mostrar solo
  disabled?: boolean;
  onSaved?: () => void;
};

type ErrorsMap = Record<string, string | null>;

const BOOL_OPTIONS = [
  { value: "", label: "Sin especificar" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

function SectionTitle({ children }: { children: string }) {
  return <h4 className="fw-bold mt-4 mb-3">{children}</h4>;
}

export default function FormOperationAnexo4Detail({
  operationId,
  operationTitle,
  disabled,
  onSaved,
}: FormOperationAnexo4DetailProps) {
  const fields = useMemo<FieldConfig[]>(() => operationAnexo4DetailFields, []);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<ErrorsMap>({});
  const [saving, setSaving] = useState(false);

  const getField = (key: string) => fields.find((f) => f.key === key);

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const nextErrors: ErrorsMap = {};
    fields.forEach((field) => {
      if (field.validate) {
        const isValid = field.validate(formValues[field.key]);
        if (!isValid) {
          nextErrors[field.key] = field.error || "Campo inválido";
        }
      }
    });
    setErrors(nextErrors);
    return Object.values(nextErrors).every((e) => !e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    if (!validate()) return;

    setSaving(true);
    try {
      const formData = new FormData();

      fields.forEach((field) => {
        const value = formValues[field.key];

        if (field.type === "file") {
          if (value instanceof File) formData.append(field.key, value);
          return;
        }

        if (value === undefined || value === null || value === "") return;

        formData.append(field.key, value);
      });

      await apiFetch(`/api/operations/${operationId}/anexo4`, {
        method: "POST",
        body: formData,
      });

      alert("Anexo 4 guardado correctamente");
      onSaved?.();
    } catch (err: any) {
      alert(err?.message || "No se pudo guardar el anexo.");
    } finally {
      setSaving(false);
    }
  };

  const renderSelect = (key: string) => {
    const field = getField(key);
    if (!field) return null;

    const value = formValues[key] ?? "";
    const error = errors[key];

    return (
      <div className="flex-grow-1">
        <select
          className={`form-select ${error ? "is-invalid" : ""}`}
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          disabled={disabled || saving}
        >
          {BOOL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h3 className="fw-bold mb-1">Apéndice 4 - Lista de verificación planificación operacional</h3>
        <p className="text-muted mb-4">
          Operación: <strong>{operationTitle}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          {/* SECCIÓN 1 */}
          <SectionTitle>SECCIÓN 1: Información sobre las operaciones</SectionTitle>
          <div className="mb-3">
            <label className="form-label fw-bold">Descripción de objetivos</label>
            <textarea
              className="form-control"
              rows={4}
              value={formValues.descripcion ?? ""}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              disabled={disabled || saving}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Fechas y horas previstas</label>
            <input
              type="datetime-local"
              className="form-control"
              value={formValues.fechaHoraPrevista ?? ""}
              onChange={(e) => handleChange("fechaHoraPrevista", e.target.value)}
              disabled={disabled || saving}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">UAS previsto</label>
            <input type="text" className="form-control" disabled placeholder="Pendiente" />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Medios materiales</label>
            <input
              type="text"
              className="form-control"
              value={formValues.mediosMateriales ?? ""}
              onChange={(e) => handleChange("mediosMateriales", e.target.value)}
              disabled={disabled || saving}
            />
          </div>

          {/* SECCIÓN 2 */}
          <SectionTitle>SECCIÓN 2: Evaluación del escenario de operaciones</SectionTitle>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Dirección</label>
              <input
                type="text"
                className="form-control"
                value={formValues.direccion ?? ""}
                onChange={(e) => handleChange("direccion", e.target.value)}
                disabled={disabled || saving}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Coordenadas</label>
              <input
                type="text"
                className="form-control"
                value={formValues.coords ?? ""}
                onChange={(e) => handleChange("coords", e.target.value)}
                disabled={disabled || saving}
              />
            </div>
          </div>

          {/* SECCIÓN 3 */}
          <SectionTitle>SECCIÓN 3: Espacio aéreo</SectionTitle>
          <div className="mb-3">
            <label className="form-label fw-bold">Imagen del espacio aéreo</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => handleChange("imagenEspacioAereo", e.target.files?.[0] ?? null)}
              disabled={disabled || saving}
            />
          </div>

          {/* SECCIÓN 4 */}
          <SectionTitle>SECCIÓN 4: Zonas geográficas de UAS</SectionTitle>
          <div className="list-group mb-4">
            <div className="list-group-item">
              <div className="fw-bold mb-2">4.1 Espacio aéreo controlado</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.1</span>
                {renderSelect("espacioAereoControlado")}
              </div>
              <div className="ms-4 mt-2 d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.1.1</span>
                {renderSelect("estudioAeronauticoCoordinado")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.2 Entorno de aeródromos</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.2</span>
                {renderSelect("entornoAerodromos")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.3 Distancia mínima infraestructuras</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.3</span>
                {renderSelect("distanciaMinimaInfraestructuras")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.4 Zonas prohibidas / flexible</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.4</span>
                {renderSelect("zonasProhibidasFlexible")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.5 Cumple condiciones</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.5</span>
                {renderSelect("cumpleCondiciones")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.6 Zonas de seguridad</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.6</span>
                {renderSelect("zonasSeguridad")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.7 Permiso previo de seguridad</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.7</span>
                {renderSelect("permisoPrevioSeguridad")}
              </div>
              <div className="ms-4 mt-2 d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.7.1</span>
                {renderSelect("serviciosEsencialesComunidad")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.8 Permiso previo servicios</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.8</span>
                {renderSelect("permisoPrevioServicios")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.9 Entornos urbanos</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.9</span>
                {renderSelect("entornosUrbanos")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.10 Cumplen distancias edificios</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.10</span>
                {renderSelect("cumplenDistanciasEdificios")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.11 Comunicación Ministerio Interior</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.11</span>
                {renderSelect("comunicacionMinisterioInterior")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.12 Zona reserva vuelo fotográfico</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.12</span>
                {renderSelect("zonaResVueloFotografico")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.13 Permiso CECAF</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.13</span>
                {renderSelect("permisoCecaf")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.14 Zonas protegidas medioambiental</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.14</span>
                {renderSelect("zonasProtMedioambiental")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.15 Dispone coordinador gestor</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.15</span>
                {renderSelect("disponeCoordGestor")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.16 Conops y modelo semántico</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.16</span>
                {renderSelect("conopsYModeloSemantico")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.17 Aplica modelo</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.17</span>
                {renderSelect("aplicaModelo")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.18 Define geografía vuelo ConOps</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.18</span>
                {renderSelect("defineGeografiaVueloConops")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.19 Define vol contingencia</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.19</span>
                {renderSelect("defineVolContigencia")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.20 Define margen riesgo tierra</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.20</span>
                {renderSelect("defineMargenRiesgoTierra")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.21 Define zona terrestre controlada</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.21</span>
                {renderSelect("defineZonaTerrestreControlada")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.22 Planifica ubicación observadores</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.22</span>
                {renderSelect("planificaUbicacionObservadores")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.23 Calcula área y evalúa riesgo</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.23</span>
                {renderSelect("calculaAreaYEvaluaRiesgo")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.24 NOTAMs</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.24</span>
                {renderSelect("notams")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.25 Revisa NOTAMs</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.25</span>
                {renderSelect("revisaNotams")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.26 TSA o Condicionada</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.26</span>
                {renderSelect("tsaOCondicionada")}
              </div>
            </div>

            <div className="list-group-item">
              <div className="fw-bold mb-2">4.27 Otras limitaciones</div>
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold" style={{ width: 50 }}>4.27</span>
                {renderSelect("otrasLimitaciones")}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button type="submit" className="btn btn-primary" disabled={disabled || saving}>
              {saving ? "Guardando..." : "Guardar Anexo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}