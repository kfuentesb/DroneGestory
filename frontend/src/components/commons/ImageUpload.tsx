// src/components/commons/ImageUploadField.tsx
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  useImageUpload,
  type ImageUploadConfig,
  type ImageUploadState,
  type ImageUploadHandlers,
} from "./hooks/useImageUpload";
import { apiFetch, apiFetchRaw } from "../../api";

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

const ensureTrailingSlash = (value: string) => (value.endsWith("/") ? value : `${value}/`);

const resolveEndpointBase = (apiBaseUrl: string, imageEndpointPath: string) => {
  if (!imageEndpointPath) return "";
  if (imageEndpointPath.startsWith("http://") || imageEndpointPath.startsWith("https://")) {
    return imageEndpointPath;
  }
  const base = apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  const path = imageEndpointPath.startsWith("/") ? imageEndpointPath : `/${imageEndpointPath}`;
  return `${base}${path}`;
};

const getRemoveImageEndpoint = (
  apiBaseUrl: string,
  imageEndpointPath: string,
  normalizedPath: string
) => {
  const endpoint = imageEndpointPath.toLowerCase();

  if (endpoint.includes("/api/users/images")) {
    const match = normalizedPath.match(/^(?:database-relationed\/)?users\/(\d+)(?:-[^/]*)?\/profile(?:\/.*)?$/);
    if (match) return `${ensureTrailingSlash(resolveEndpointBase(apiBaseUrl, "/api/users"))}${match[1]}`;
  }

  if (endpoint.includes("/api/aircraft-models/images")) {
    const match = normalizedPath.match(
      /^(?:database-relationed\/)?aircraft-model\/[^/]+\/profile\/aircraft_model_(\d+)_profile\.[^/]+$/
    );
    if (match) return `${ensureTrailingSlash(resolveEndpointBase(apiBaseUrl, "/api/aircraft-models"))}${match[1]}`;
  }

  if (endpoint.includes("/api/aircraft/images")) {
    const match = normalizedPath.match(
      /^(?:database-relationed\/)?aircraft\/[^/]+\/profile\/aircraft_(\d+)_profile\.[^/]+$/
    );
    if (match) return `${ensureTrailingSlash(resolveEndpointBase(apiBaseUrl, "/api/aircraft"))}${match[1]}`;
  }

  return null;
};

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
  const [serverImageBlobUrl, setServerImageBlobUrl] = useState<string | null>(null);
  const [serverImageLoading, setServerImageLoading] = useState(false);
  const [serverImageError, setServerImageError] = useState(false);

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

  const handleDeleteSaved = async () => {
    if (!state.savedFilename) {
      handleClear();
      return;
    }

    const normalized = normalizeImagePath(state.savedFilename);
    const removeEndpoint = getRemoveImageEndpoint(apiBaseUrl, imageEndpointPath, normalized);

    try {
      setServerImageLoading(true);

      if (removeEndpoint) {
        // ✅ Users, aircraft-models y aircraft → PUT con removeImage=true
        const formData = new FormData();
        formData.append("removeImage", "true");

        await apiFetch(removeEndpoint, {
          method: "PUT",
          body: formData,
        });

        handlers.onClear();
        onChange?.(null, fieldName);
        return;
      }

      // Por defecto, intentar DELETE directo sobre el recurso (para endpoints que soporten DELETE)
      const encoded = normalized.split("/").map((s) => encodeURIComponent(s)).join("/");
      const deleteUrl = `${ensureTrailingSlash(endpointBase)}${encoded}`;
      await apiFetch(deleteUrl, { method: "DELETE" });

      // Al borrar en servidor, limpiar estado local y notificar al padre
      handlers.onClear();
      onChange?.(null, fieldName);
    } catch (err: any) {
      console.error("Error al eliminar la imagen:", err);
      alert(err?.message || "No se pudo eliminar la imagen en el servidor.");
    } finally {
      setServerImageLoading(false);
    }
  };

  const acceptString = acceptedTypes.join(",");

  const normalizeImagePath = (filename: string) => {
    const clean = filename.trim().replace(/^\/+/, "");
    const usesOperations = imageEndpointPath.includes("/api/operations/");
    if (!usesOperations) return clean;
    return clean.startsWith("operations/") || clean.startsWith("database-relationed/operations/")
      ? clean
      : `operations/${clean}`;
  };

  // URL de la imagen guardada en el servidor
  const endpointBase = resolveEndpointBase(apiBaseUrl, imageEndpointPath);
  const savedImageUrl = state.savedFilename && endpointBase
    ? `${ensureTrailingSlash(endpointBase)}${normalizeImagePath(state.savedFilename)}`
    : null;

  useEffect(() => {
    let cancelled = false;
    let createdUrl: string | null = null;

    const loadServerImage = async () => {
      if (!savedImageUrl || state.previewUrl) {
        setServerImageBlobUrl(null);
        setServerImageLoading(false);
        setServerImageError(false);
        return;
      }
      setServerImageLoading(true);
      setServerImageError(false);
      try {
        const response = await apiFetchRaw(savedImageUrl);
        if (!response.ok) {
          setServerImageBlobUrl(null);
          if (!cancelled) {
            setServerImageError(true);
          }
          return;
        }
        const blob = await response.blob();
        createdUrl = URL.createObjectURL(blob);
        if (!cancelled) {
          setServerImageBlobUrl(createdUrl);
        }
      } catch {
        if (!cancelled) {
          setServerImageBlobUrl(null);
          setServerImageError(true);
        }
      } finally {
        if (!cancelled) {
          setServerImageLoading(false);
        }
      }
    };

    void loadServerImage();

    return () => {
      cancelled = true;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [savedImageUrl, state.previewUrl]);

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
                onClick={handleDeleteSaved}
              >
                Eliminar imagen
              </button>
            )}
          </div>
          {serverImageBlobUrl ? (
            <img
              src={serverImageBlobUrl}
              alt={`${label} guardada`}
              className="img-fluid rounded border"
              style={{ maxHeight: "220px", objectFit: "contain" }}
            />
          ) : serverImageLoading ? (
            <div className="text-muted small">Cargando imagen...</div>
          ) : serverImageError ? (
            <div className="text-muted small">No se pudo cargar la imagen.</div>
          ) : null}
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
