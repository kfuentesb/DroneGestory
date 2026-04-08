import type { Anexo4Fields } from "../operations/operation.types";
import {
  BOOLEAN_FIELD_LABELS,
  BOOLEAN_FIELDS_SECTION4,
  BOOLEAN_FIELDS_SECTION6,
} from "./anexo4.constants";

type Props = {
  fields: Anexo4Fields;
  setFields: React.Dispatch<React.SetStateAction<Anexo4Fields>>;
  saving: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitLabel?: string;
  showCancel?: boolean;
};

export default function Anexo4FormContent({
  fields,
  setFields,
  saving,
  error,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  showCancel = true,
}: Props) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <label className="fw-bold">Descripción</label>
        <textarea
          name="descripcion"
          value={fields.descripcion}
          onChange={handleChange}
          className="form-control"
          rows={3}
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
          placeholder="Nombres del personal implicado"
        />
      </div>
      <div className="mb-3">
        <label className="fw-bold">Imagen espacio aéreo</label>
        <input
          type="text"
          name="imagenEspacioAereo"
          value={fields.imagenEspacioAereo}
          onChange={handleChange}
          className="form-control"
          placeholder="URL o referencia de la imagen"
        />
      </div>
      <div className="mb-3">
        <label className="fw-bold">Imagen zona de vuelo</label>
        <input
          type="text"
          name="imagenZonaVuelo"
          value={fields.imagenZonaVuelo}
          onChange={handleChange}
          className="form-control"
          placeholder="URL o referencia de la imagen"
        />
      </div>

      <fieldset className="border rounded p-3 mb-3">
        <legend className="float-none w-auto px-2 fw-bold fs-6">
          Sección 4 — Zonas geográficas de UAS
        </legend>
        <div className="row">
          {BOOLEAN_FIELDS_SECTION4.map((field) => (
            <div key={field} className="col-md-6 col-12 mb-2">
              <label className="fw-bold small">{BOOLEAN_FIELD_LABELS[field]}</label>
              <select
                name={field}
                value={fields[field]}
                onChange={handleChange}
                className="form-select form-select-sm"
              >
                <option value="">Sin especificar</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="border rounded p-3 mb-3">
        <legend className="float-none w-auto px-2 fw-bold fs-6">
          Sección 6 — Requisitos y limitaciones en zona de vuelo
        </legend>
        <div className="row">
          {BOOLEAN_FIELDS_SECTION6.map((field) => (
            <div key={field} className="col-md-6 col-12 mb-2">
              <label className="fw-bold small">{BOOLEAN_FIELD_LABELS[field]}</label>
              <select
                name={field}
                value={fields[field]}
                onChange={handleChange}
                className="form-select form-select-sm"
              >
                <option value="">Sin especificar</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Guardando..." : submitLabel}
        </button>
        {showCancel && onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>
        )}
      </div>

      {error && <p className="text-danger mt-3">{error}</p>}
    </form>
  );
}
