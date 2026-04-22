import React, { useState } from "react";

export interface ItemTablaExpandible {
  descripcion: string;
  valor: string;
}

interface TablaExpandibleProps {
  label: string;
  selectLabel: string;
  valorPrincipal?: string;
  items: ItemTablaExpandible[];
  opciones: string[];
  onValorPrincipalChange?: (valor: string) => void;
  onItemsChange: (items: ItemTablaExpandible[]) => void;
  numeroBase: string;
  valoresQueHabilitan?: string[];
  mostrarSelectorPrincipal?: boolean;
  descripcionHeader?: string;
  valorHeader?: string;
  maxItems?: number;
  disabled?: boolean;
}

/**
 * Componente genérico reutilizable para tablas expandibles en anexos
 * con numeración configurable y opciones de select parametrizables.
 */
export function TablaExpandible({
  label,
  selectLabel,
  valorPrincipal = "N/A",
  items,
  opciones,
  onValorPrincipalChange,
  onItemsChange,
  numeroBase,
  valoresQueHabilitan = ["SI"],
  mostrarSelectorPrincipal = true,
  descripcionHeader = "Descripción",
  valorHeader = "Valor",
  maxItems = 8,
  disabled = false,
}: TablaExpandibleProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const handleAddItem = () => {
    if (items.length < maxItems) {
      onItemsChange([
        ...items,
        { descripcion: "", valor: opciones[0] ?? "N/A" },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
    setErrors(errors.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (
    index: number,
    field: keyof ItemTablaExpandible,
    value: string
  ) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onItemsChange(updated);

    // Validación: requerir descripción si hay valores
    const newErrors = [...errors];
    if (field === "descripcion" && value.trim() === "") {
      newErrors[index] = "La descripción es requerida";
    } else {
      newErrors[index] = "";
    }
    setErrors(newErrors);
  };

  const handleValuePrincipalChange = (value: string) => {
    onValorPrincipalChange?.(value);
    // Limpiar filas si deja de estar habilitado.
    if (mostrarSelectorPrincipal && !valoresQueHabilitan.includes(value)) {
      onItemsChange([]);
      setErrors([]);
    }
  };

  const isExpanded = !mostrarSelectorPrincipal || valoresQueHabilitan.includes(valorPrincipal);

  return (
    <div className="form-section mb-4">
      <label className="form-label fw-bold">{label}</label>

      {mostrarSelectorPrincipal && (
        <select
          value={valorPrincipal}
          onChange={(e) => handleValuePrincipalChange(e.target.value)}
          className="form-control mb-3"
          disabled={disabled}
        >
          {opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      )}

      {isExpanded && (
        <>
          <div className="table-responsive mb-3" style={items.length > 4 ? { maxHeight: "300px", overflowY: "auto" } : undefined}>
            <table className="table table-sm table-bordered align-middle">
              <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 1 }}>
                <tr>
                  <th style={{ width: "15%" }}>Punto</th>
                  <th style={{ width: "45%" }}>{descripcionHeader}</th>
                  <th style={{ width: "25%" }}>{valorHeader}</th>
                  <th style={{ width: "15%" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className={errors[index] ? "table-warning" : ""}>
                    <td className="text-nowrap fw-semibold">{numeroBase}.{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        value={item.descripcion}
                        onChange={(e) =>
                          handleUpdateItem(
                            index,
                            "descripcion",
                            e.target.value
                          )
                        }
                        placeholder={`${selectLabel} ${index + 1}`}
                        className={`form-control form-control-sm ${
                          errors[index] ? "is-invalid" : ""
                        }`}
                        disabled={disabled}
                      />
                      {errors[index] && (
                        <small className="text-danger d-block mt-1">
                          {errors[index]}
                        </small>
                      )}
                    </td>
                    <td>
                      <select
                        value={item.valor}
                        onChange={(e) =>
                          handleUpdateItem(index, "valor", e.target.value)
                        }
                        className="form-control form-control-sm"
                        disabled={disabled}
                      >
                        {opciones.map((opcion) => (
                          <option key={opcion} value={opcion}>
                            {opcion}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="btn btn-sm btn-danger"
                        title="Eliminar"
                        disabled={disabled}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {items.length === 0 && (
            <p className="text-muted small mb-2">
              No hay {selectLabel.toLowerCase()}s añadidas aún.
            </p>
          )}

          <button
            type="button"
            onClick={handleAddItem}
            disabled={disabled || items.length >= maxItems}
            className="btn btn-sm btn-outline-primary"
          >
            + Añadir {selectLabel.toLowerCase()} ({items.length}/{maxItems})
          </button>
        </>
      )}

      {mostrarSelectorPrincipal && !isExpanded && items.length > 0 && (
        <div className="alert alert-info alert-sm mt-2">
          <small>
            Se han limpiado {items.length} {selectLabel.toLowerCase()}(s)
            guardados anteriormente.
          </small>
        </div>
      )}
    </div>
  );
}
