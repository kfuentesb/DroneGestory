import { useState, useCallback, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ImageUploadConfig {
  /** Tamaño máximo en MB (por defecto 5) */
  maxSizeMB?: number;
  /** Tipos MIME permitidos (por defecto JPG/PNG) */
  acceptedTypes?: string[];
  /** Nombre del campo en el FormData */
  fieldName: string;
}

export interface ImageUploadState {
  file: File | null;
  previewUrl: string | null;
  savedFilename: string | null;
  error: string | null;
}

export interface ImageUploadHandlers {
  onFileSelect: (file: File | null) => void;
  onClear: () => void;
  getFileForUpload: () => File | null;
  hasChanges: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const BYTES_PER_MB = 1024 * 1024;

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK PERSONALIZADO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook para gestionar la subida de imágenes con preview local y sincronización de archivo guardado.
 *
 * @param config Configuración del upload (maxSizeMB, acceptedTypes, fieldName)
 * @param initialSavedFilename Nombre del archivo guardado previamente en el servidor (ej: "imagen.jpg")
 *
 * @returns [state, handlers] - Estado actual y funciones para interactuar
 *
 * **Flujo de uso:**
 * 1. Usuario selecciona archivo → onFileSelect(file) → crea blob URL para preview
 * 2. Usuario hace submit → getFileForUpload() → devuelve File para enviar al servidor
 * 3. Backend guarda → devuelve filename (ej: "imagen123.jpg")
 * 4. Frontend actualiza initialSavedFilename → hook sincroniza automaticamente
 * 5. Próxima carga del formulario → initialSavedFilename ya tiene el filename guardado
 *
 * **CRÍTICO:** El useEffect sincroniza `savedFilename` cuando cambia la prop initial.
 * Revoca blob URLs locales si existen para evitar mostrar archivos previos.
 */
export function useImageUpload(
  config: ImageUploadConfig,
  initialSavedFilename?: string | null
): [ImageUploadState, ImageUploadHandlers] {
  const [state, setState] = useState<ImageUploadState>({
    file: null,
    previewUrl: null,
    savedFilename: initialSavedFilename ?? null,
    error: null,
  });

  // ✅ CRÍTICO: Sincronizar savedFilename cuando cambia la prop inicial
  // Esto permite que cuando se carga un nuevo formulario (ej: cargar operación existente),
  // el componente muestre la imagen guardada en el servidor.
  useEffect(() => {
    setState((prev) => {
      // Si el savedFilename cambió (carga de nuevo formulario), revocar preview local
      // si existe para evitar mostrar el archivo anterior
      if (prev.previewUrl && prev.savedFilename !== initialSavedFilename) {
        URL.revokeObjectURL(prev.previewUrl);
      }

      return {
        ...prev,
        savedFilename: initialSavedFilename ?? null,
        // Si hay un nuevo savedFilename, limpiar el archivo local y preview
        ...(initialSavedFilename && {
          file: null,
          previewUrl: null,
        }),
      };
    });
  }, [initialSavedFilename]);

  const validateFile = useCallback(
    (file: File): string | null => {
      const maxSize = (config.maxSizeMB ?? DEFAULT_MAX_SIZE_MB) * BYTES_PER_MB;
      const accepted = config.acceptedTypes ?? DEFAULT_ACCEPTED_TYPES;

      if (!accepted.includes(file.type)) {
        const typeNames = accepted
          .map((t) => t.replace("image/", "").toUpperCase())
          .join(" o ");
        return `Solo se permiten imágenes ${typeNames}`;
      }

      if (file.size > maxSize) {
        return `La imagen no puede superar los ${config.maxSizeMB ?? DEFAULT_MAX_SIZE_MB} MB`;
      }

      return null;
    },
    [config.maxSizeMB, config.acceptedTypes]
  );

  const onFileSelect = useCallback(
    (file: File | null) => {
      if (!file) {
        setState((prev) => ({
          ...prev,
          file: null,
          previewUrl: null,
          error: null,
        }));
        return;
      }

      const error = validateFile(file);
      if (error) {
        setState((prev) => ({ ...prev, file: null, previewUrl: null, error }));
        return;
      }

      // Revocar URL anterior si existe y crear nueva
      setState((prev) => {
        if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return {
          ...prev,
          file,
          previewUrl: URL.createObjectURL(file),
          error: null,
          savedFilename: null, // Limpiar savedFilename cuando se selecciona nuevo archivo
        };
      });
    },
    [validateFile]
  );

  const onClear = useCallback(() => {
    setState((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return {
        ...prev,
        file: null,
        previewUrl: null,
        savedFilename: null,
        error: null,
      };
    });
  }, []);

  const getFileForUpload = useCallback(() => state.file, [state.file]);

  // ✅ hasChanges: true si hay archivo nuevo seleccionado
  // (el archivo se enviará al servidor en FormData)
  const hasChanges = state.file !== null;

  return [
    state,
    {
      onFileSelect,
      onClear,
      getFileForUpload,
      hasChanges,
    },
  ];
}
