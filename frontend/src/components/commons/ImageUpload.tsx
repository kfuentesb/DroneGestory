// src/components/commons/ImageUploadField.tsx
import { useRef, type ChangeEvent } from "react";
import {
  useImageUpload,
  type ImageUploadConfig,
  type ImageUploadState,
  type ImageUploadHandlers,
} from "./hooks/useImageUpload";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ImageUploadFieldConfig extends ImageUploadConfig {
  /** Texto del label */
  label: string;
  /** Texto de ayuda */
  helpText?: string;
  /** URL base para imágenes ya guardadas */
  apiBaseUrl: string;
  /** Ruta del endpoint para ver imágenes guardadas (ej: /api/operations/anexo4/images/) */
  imageEndpointPath: string;
  /** Altura máxima de la imagen mostrada en px (por defecto 220) */
  maxHeight?: number;
  /** Ancho máximo de la imagen mostrada en px */
  maxWidth?: number;
}

// Re-exportar tipos del hook para conveniencia
export type { ImageUploadState, ImageUploadHandlers } from "./hooks/useImageUpload";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_MAX_HEIGHT = 220;
const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════════════

interface ImageUploadFieldProps extends ImageUploadFieldConfig {
  disabled?: boolean;
  saving?: boolean;
  /** Nombre del archivo guardado previamente (para mostrar la imagen existente) */
  savedFilename?: string | null;
  /** Error de validación externo */
  externalError?: string | null;
  /** Callback cuando cambia la selección */
  onChange?: (file: File | null, fieldName: string) => void;
}

export default function ImageUploadField({
  label,
  helpText,
  fieldName,
  apiBaseUrl,
  imageEndpointPath,
  maxSizeMB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxHeight = DEFAULT_MAX_HEIGHT,
  maxWidth,
  disabled = false,
  saving = false,
  savedFilename: initialSavedFilename,
  externalError,
  onChange,
}: ImageUploadFieldProps) {
  const [state, handlers] = useImageUpload(
    {
      fieldName,
      maxSizeMB,
      acceptedTypes,
    },
    initialSavedFilename
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handlers.onFileSelect(file);
    onChange?.(file, fieldName);
    // Resetear input para permitir seleccionar el mismo archivo otra vez
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClear = () => {
    handlers.onClear();
    onChange?.(null, fieldName);
  };

  const acceptString = acceptedTypes.join(",");

  // URL de la imagen guardada en el servidor
  const savedImageUrl = state.savedFilename
    ? `${apiBaseUrl}${imageEndpointPath}${state.savedFilename}`
    : null;

  const isDisabled = disabled || saving;

  // Construir estilos de imagen dinámicamente
  const imageStyle: React.CSSProperties = {
    maxHeight: `${maxHeight}px`,
    objectFit: "contain",
    ...(maxWidth && { maxWidth: `${maxWidth}px` }),
  };

  return (
    <div className="mb-3 border rounded p-3 bg-white">
      <label className="form-label fw-bold small text-uppercase text-muted d-flex justify-content-between align-items-center">
        <span>{label}</span>
        {state.file && (
          <span className="badge bg-success text-white" style={{ fontSize: "0.7rem" }}>
            Nuevo archivo seleccionado
          </span>
        )}
      </label>

      {/* Input de archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        className={`form-control ${state.error || externalError ? "is-invalid" : ""}`}
        onChange={handleFileChange}
        disabled={isDisabled}
        name={fieldName}
      />

      {/* Texto de ayuda */}
      {helpText && (
        <div className="form-text mt-2">
          {helpText}
        </div>
      )}

      {/* Errores */}
      {(state.error || externalError) && (
        <div className="invalid-feedback d-block mt-1">
          {state.error || externalError}
        </div>
      )}

      {/* Previsualización: archivo nuevo seleccionado */}
      {state.previewUrl && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-success fw-semibold">Vista previa:</span>
            {!isDisabled && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={handleClear}
              >
                Quitar imagen
              </button>
            )}
          </div>
          <img
            src={state.previewUrl}
            alt={`Vista previa ${label}`}
            className="img-fluid rounded border"
            style={imageStyle}
          />
        </div>
      )}

      {/* Imagen guardada previamente (sin cambios) */}
      {!state.previewUrl && savedImageUrl && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-muted">Imagen guardada:</span>
            {!isDisabled && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={handleClear}
              >
                Eliminar imagen
              </button>
            )}
          </div>
          <img
            src={savedImageUrl}
            alt={`${label} guardada`}
            className="img-fluid rounded border"
            style={{ maxHeight: "220px", objectFit: "contain" }}
          />
        </div>
      )}

      {/* Estado vacío */}
      {!state.previewUrl && !savedImageUrl && (
        <div className="mt-3 p-3 bg-light rounded text-center text-muted small">
          No hay imagen seleccionada
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIÓN AUXILIAR PARA INTEGRAR CON FORMDATA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Añade los archivos de imagen al FormData para enviar al backend.
 * Uso en el handleSubmit de tu formulario.
 */
export function appendImageToFormData(
  formData: FormData,
  fieldName: string,
  file: File | null,
  options?: { clearField?: boolean }
): void {
  if (file instanceof File) {
    formData.append(fieldName, file);
  } else if (options?.clearField) {
    // Si el backend necesita saber explícitamente que se eliminó la imagen
    formData.append(`${fieldName}_cleared`, "true");
  }
}