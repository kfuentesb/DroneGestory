export interface DashboardCertificateExpiration {
    userId: number;
    expireDate: string;
    firstName: string;
    lastName: string;
    username: string;
    certificateName: string | null;
    certificateType: string | null;
}

export interface DashboardAircraftDocumentationExpiration {
    aircraftId: number;
    expireDate: string;
    documentationType: string | null;
    serialNumber: string | null;
    manufacturer: string | null;
    model: string | null;
}

export interface DashboardBirthday {
    userId: number;
    birthDate: string;
    firstName: string;
    lastName: string;
    username: string;
}

export interface DashboardMaintenanceDate {
    aircraftId: number;
    maintenanceDate: string;
    nextMaintenanceDate: string;
    description: string | null;
    serialNumber: string | null;
    manufacturer: string | null;
    model: string | null;
}

export interface DashboardOperationPlanned {
    operationId: number;
    codigo: string;
    fechaPrevista: string;
}

export interface DashboardData {
    totalUsuarios: number;
    totalPilotos: number;
    totalDocumentacionUsuarios: number;
    totalOperaciones: number;
    totalDrones: number;
    totalMantenimientos: number;
    totalDocumentacionAeronaves: number;
    certificateExpirations: DashboardCertificateExpiration[];
    aircraftDocumentationExpirations: DashboardAircraftDocumentationExpiration[];
    birthdays: DashboardBirthday[];
    maintenance: DashboardMaintenanceDate[];
    operations: DashboardOperationPlanned[];
    extraEvents: ExtraDate[];
}

export interface TooltipSectionProps<T> {
    title: string;
    color: string;
    bgColor: string;
    borderColor: string;
    items: T[];
    renderContent: (entry: T) => React.ReactNode;
}

export type SummaryState = DashboardData | { error: string } | null;

export type CalendarDayDetails = {
    dateKey: string;
    certificates: DashboardCertificateExpiration[];
    aircraftDocumentation: DashboardAircraftDocumentationExpiration[];
    birthdays: DashboardBirthday[];
    maintenance: DashboardMaintenanceDate[];
    operations: DashboardOperationPlanned[];
    extraEvents: ExtraDate[];
};

export type TooltipState = {
    x: number;
    y: number;
    details: CalendarDayDetails;
} | null;

export interface ExtraDate {
    idExtraDate?: number;
    extraDate: string;
    description: string;
}

export type ApiDateValue = string | number[] | null | undefined;

export const MIN_CALENDAR_YEAR = 2000;
export const MAX_CALENDAR_YEAR = 2100;

export const toDateKey = (date: Date) =>
    `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;

export const markerClassForDate = (dateKey: string) => `dg-expiry-date-${dateKey}`;

export const getMonthLabel = (date: Date) => {
    const value = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(date);
    return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getMarkerClassName = (details?: CalendarDayDetails) => {
    if (!details) return "";

    const hasCert = details.certificates.length > 0;
    const hasAir = details.aircraftDocumentation.length > 0;
    const hasBirth = details.birthdays.length > 0;
    const hasMaint = details.maintenance.length > 0;
    const hasOps = details.operations.length > 0;
    const hasExtra = details.extraEvents.length > 0;

    const activeCategories = [hasCert, hasAir, hasBirth, hasMaint, hasOps, hasExtra].filter(Boolean).length;

    if (activeCategories === 1 && hasMaint) {
        const hasPending = details.maintenance.some((m: any) => !m.isDone);
        return `dg-expiry-marker ${hasPending ? "dg-expiry-marker-maint-pending" : "dg-expiry-marker-maint-done"}`;
    }

    if (activeCategories > 1) return "dg-expiry-marker dg-expiry-marker-mixed";
    if (hasCert) return "dg-expiry-marker dg-expiry-marker-certificate";
    if (hasAir) return "dg-expiry-marker dg-expiry-marker-aircraft";
    if (hasBirth) return "dg-expiry-marker dg-expiry-marker-birthday";
    if (hasOps) return "dg-expiry-marker dg-expiry-marker-operation";
    if (hasExtra) return "dg-expiry-marker dg-expiry-marker-extra";

    return "";
};

export const formatCertificateTitle = (entry: DashboardCertificateExpiration) =>
    entry.certificateName?.trim() || entry.certificateType?.trim() || "Certificado";

export const formatCertificateCategory = (entry: DashboardCertificateExpiration) =>
    entry.certificateType?.trim() || "Sin categoría";

export const formatAircraftName = (entry: DashboardAircraftDocumentationExpiration) =>
    [entry.manufacturer, entry.model].filter(Boolean).join(" ");

export const formatOperationTime = (value: ApiDateValue) => {
    if (!value || typeof value !== "string") {
        return null;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(parsed);
};

export const normalizeDateKey = (value: ApiDateValue): string | null => {
    if (!value) {
        return null;
    }

    if (Array.isArray(value) && value.length >= 3) {
        const [year, month, day] = value;
        return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    if (typeof value === "string") {
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
        }
    }

    return null;
};
