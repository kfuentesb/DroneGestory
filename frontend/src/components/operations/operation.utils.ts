import type { AnexoColor, OperationStatus } from "./operation.types";

export const OPERATION_ANEXOS = [4, 5, 6, 7, 8] as const;
const OPERATION_TIME_ZONE = "Europe/Madrid";

function getStoredUserTimezone() {
  if (typeof window === "undefined") {
    return "+02:00";
  }

  return localStorage.getItem("userTimezone") ?? "+02:00";
}

function parseBackendDate(value: string) {
  const hasTimeZone = /([zZ]|[+-]\d{2}:\d{2})$/.test(value);
  if (hasTimeZone) {
    return new Date(value);
  }
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const [datePart, timePartRaw = "00:00:00"] = normalized.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes, seconds] = timePartRaw.split(":").map((part) => Number(part));
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, seconds || 0);
}

function parseBackendDateTime(value: string) {
  const hasTimeZone = /([zZ]|[+-]\d{2}:\d{2})$/.test(value);
  if (hasTimeZone) {
    return new Date(value);
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const [datePart, timePartRaw = "00:00:00"] = normalized.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes, seconds] = timePartRaw.split(":").map((part) => Number(part));
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, seconds || 0));
}

export function formatDateTime(value?: string | null, userOffset?: string) {
  if (!value) return "-";
  const date = parseBackendDateTime(value);
  
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const timezone = userOffset ?? getStoredUserTimezone();

  try {
    const sign = timezone.startsWith("-") ? -1 : 1;
    const [hoursPart, minutesPart] = timezone.replace(/[+-]/, "").split(":");
    const offsetMinutes = sign * (parseInt(hoursPart, 10) * 60 + parseInt(minutesPart, 10));
    const adjustedDate = new Date(date.getTime() + (offsetMinutes * 60000));
    return adjustedDate.toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "UTC",
    });
  } catch (error) {
    return date.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
  }
}

export function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = parseBackendDate(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("es-ES", { timeZone: OPERATION_TIME_ZONE });
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
