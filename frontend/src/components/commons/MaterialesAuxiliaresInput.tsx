import React from "react";

export function MaterialesAuxiliaresInput({
  value,
  onChange,
  disabled,
  label = "Materiales auxiliares"
}: {
  value: string[];
  onChange: (arr: string[]) => void;
  disabled?: boolean;
  label?: string;
}) {
  // Siempre al menos 1 input en la lista
  const addMaterial = () => onChange([...value, ""]);
  const updateMaterial = (idx: number, newVal: string) => {
    const copy = [...value];
    copy[idx] = newVal;
    onChange(copy);
  };
  const removeMaterial = (idx: number) => {
    const copy = value.slice();
    copy.splice(idx, 1);
    onChange(copy.length === 0 ? [""] : copy);
  };
  return (
    <div className="mb-3">
      <label className="form-label fw-bold small text-uppercase text-muted">{label}</label>
      <div className="d-flex flex-column gap-2">
        {value.map((mat, i) => (
          <div key={i} className="d-flex align-items-center gap-2">
            <input
              type="text"
              className="form-control"
              disabled={disabled}
              placeholder={`Material ${i + 1}`}
              value={mat}
              onChange={e => updateMaterial(i, e.target.value)}
            />
            {value.length > 1 && (
              <button
                onClick={e => { e.preventDefault(); removeMaterial(i); }}
                className="btn btn-outline-danger btn-sm"
                disabled={disabled}
                aria-label="Eliminar material"
                type="button"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline-primary btn-sm mt-1"
          onClick={addMaterial}
          disabled={disabled}
        >
          Añadir material
        </button>
      </div>
    </div>
  );
}