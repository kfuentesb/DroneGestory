import type { AnexoColor, OperationStatus } from "./operation.types";

export const OPERATION_ANEXOS = [4, 5, 6, 7, 8] as const;

export function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  return new Date(value).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("es-ES");
}

export function getOperationStatusStyle(status: OperationStatus) {
  switch (status) {
    case "COMPLETADA":
      return { backgroundColor: "#DCFCE7", color: "#166534" };
    case "EN_CURSO":
      return { backgroundColor: "#FEF3C7", color: "#92400E" };
    case "PENDIENTE":
      return { backgroundColor: "#DBEAFE", color: "#1D4ED8" };
    case "CANCELADA":
      return { backgroundColor: "#FEE2E2", color: "#991B1B" };
    default:
      return { backgroundColor: "#E5E7EB", color: "#374151" };
  }
}

export function getAnexoColorStyle(color: AnexoColor) {
  switch (color) {
    case "VERDE":
      return { backgroundColor: "#DCFCE7", color: "#166534" };
    case "AMARILLO":
      return { backgroundColor: "#FEF3C7", color: "#92400E" };
    case "GRIS":
    default:
      return { backgroundColor: "#F3F4F6", color: "#4B5563" };
  }
}

export function getAnexoLabel(tipoAnexo: number) {
  return `Anexo ${tipoAnexo}`;
}
