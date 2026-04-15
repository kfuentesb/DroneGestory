import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { aircraftDocumentationFields, MODEL_SPECIFIC_KEYS } from "../certificates/AircraftDocumentationSection";
import { staticUserCertificateFields as staticUserCertificateConfig } from "../certificates/staticUserCertificateFields";

export interface DetailsComponentProps {
    id: string | undefined
    endpoint: string
    imageEndpoint?: string
    defaultImage?: "user" | "drone"
    entityType?: "user" | "aircraft"
    fields: any[]
    initialData?: any;
    allowEdit?: boolean
    allowDelete?: boolean
    onDelete?: () => Promise<void>
    onBack?: () => void
    validateForm?: (values: any) => Record<string, string | null>
    showCertificates?: boolean
    certificateSectionType?: "user" | "aircraft" | "model"
    clearableFieldKeys?: string[]
}

export type UserCertificate = {
    id: number;
    userId: number;
    certificateType: string;
    certificateName: string | null;
    expireDate: string | null;
    dateIndefinite: boolean | null;
};

export type AircraftDocumentation = {
    id: number;
    aircraftId?: number;
    aircraftModelId?: number;
    documentationType: string;
    documentationName: string | null;
    expireDate: string | null;
    dateIndefinite: boolean | null;
    modelDocumentationId?: number | null;
    isModelDefault?: boolean;
};

export type AircraftModelDocumentation = {
    id: number;
    aircraftModelId: number;
    documentationType: string;
    documentationName: string | null;
    expireDate: string | null;
    dateIndefinite: boolean | null;
};

export type CertificateFieldPayload = {
    certificate: File | null;
    dateExpire: string | null;
    dateIndefinite: boolean | null;
};

export type AdditionalCertificatePayload = {
    id: string;
    existingCertificateId?: number;
    label: string;
    certificate: File | null;
    dateExpire: string | null;
    dateIndefinite: boolean | null;
};

export interface LoadingState {
    data: boolean;
    certificates: boolean;
    image: boolean;
}

export interface DocumentationState {
    files: Record<string, File | null>;
    dates: Record<string, string>;
    checks: Record<string, boolean>;
    existingNames: Record<string, string>;
}

// Función para inicializar estados limpios
export const createEmptyDocState = (defaults: any): DocumentationState => ({
    files: { ...defaults.files },
    dates: { ...defaults.dates },
    checks: { ...defaults.checks },
    existingNames: {}
});

export const getFileNameFromPath = (path: string | null): string => {
    if (!path) return "";
    return path.split("/").pop() ?? "";
};

export const isAdditionalCertificate = (type: string, staticKeys: Set<string>): boolean => {
    return !staticKeys.has(type) && !type.startsWith("conops_");
};

export const buildRecord = <T,>(keys: string[], value: T): Record<string, T> =>
    Object.fromEntries(keys.map((key) => [key, value])) as Record<string, T>;

const buildDocStateDefaults = (
    config: Array<{ fileKey: string; dateKey: string; enabledKey: string; indefiniteKey: string }>
) => ({
    files: buildRecord(config.map((field) => field.fileKey), null as File | null),
    dates: buildRecord(config.map((field) => field.dateKey), ""),
    checks: buildRecord(config.flatMap((field) => [field.enabledKey, field.indefiniteKey]), false),
});

export const USER_CERTIFICATE_DEFAULTS = buildDocStateDefaults(staticUserCertificateConfig);

export const modelDocumentationFields = aircraftDocumentationFields.filter(field => 
    MODEL_SPECIFIC_KEYS.has(field.key)
);

export const AIRCRAFT_DOCUMENTATION_DEFAULTS = buildDocStateDefaults(aircraftDocumentationFields);
export const MODEL_DOCUMENTATION_DEFAULTS = buildDocStateDefaults(modelDocumentationFields);

export const BOOLEAN_FIELD_KEYS = new Set([
    "state",
    "hasCamera",
    "privatelyBuilt",
    "hasParachute",
    "hasEnsurance",
    "hasFTS",
    "hasCameraDefault",
    "privatelyBuiltDefault",
    "hasParachuteDefault",
    "hasEnsuranceDefault",
    "hasFTSDefault",
]);

export const NUMERIC_FIELD_KEYS = new Set([
    "mtom",
    "wingspan",
    "maxSpeed",
    "impactEnergy",
    "mtomDefault",
    "wingspanDefault",
    "maxSpeedDefault",
    "impactEnergyDefault",
]);

export const AIRCRAFT_CLEARABLE_FIELD_KEYS = new Set([
    "privatelyBuilt",
    "hasParachute",
    "hasEnsurance",
    "hasFTS",
    "cautive",
    "accessories",
]);

export const validateCertificateFile = (file: File): string | null => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
        return "Solo PDF, JPG, PNG o WEBP.";
    }
    if (file.size > 5 * 1024 * 1024) {
        return "El archivo debe pesar menos de 5MB.";
    }
    return null;
};

export const toggleBooleanMapValue = (
    setter: Dispatch<SetStateAction<Record<string, boolean>>>,
    key: string
) => {
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
};

export const handleFileMapChange = (
    event: ChangeEvent<HTMLInputElement>,
    key: string,
    setter: Dispatch<SetStateAction<Record<string, File | null>>>
) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
        setter((prev) => ({ ...prev, [key]: null }));
        return;
    }

    const fileError = validateCertificateFile(file);
    if (fileError) {
        alert(fileError);
        return;
    }
    setter((prev) => ({ ...prev, [key]: file }));
};

export const clearFileMapValue = (
    key: string,
    inputId: string,
    setter: Dispatch<SetStateAction<Record<string, File | null>>>
) => {
    setter((prev) => ({ ...prev, [key]: null }));
    const fileInput = document.getElementById(inputId) as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
};

export const getDocumentationFetchUrl = (context: "aircraft" | "model", id: string): string =>
    context === "model"
        ? `/api/aircraft-models/${id}/documentation`
        : `/api/aircraft-documentation/aircraft/${id}`;

export const typeColors: Record<string, { backgroundColor: string; color: string }> = {
    ADMIN: { backgroundColor: "#FEE2E2", color: "#991B1B" },
    MANAGER: { backgroundColor: "#E0F2FE", color: "#075985" },
    PILOT: { backgroundColor: "#E6F4EC", color: "#1F6B43" },
};

export const stateColors: Record<string, { backgroundColor: string; color: string }> = {
    active: { backgroundColor: "#DCFCE7", color: "#166534" },
    inactive: { backgroundColor: "#F3F4F6", color: "#374151" }
};

// COSAS DE CAMPO "OTROS" EN DOCUMENTACIÓN DE AICRAFT Y CERTIFICADO USER
// export type AdditionalDoc = {
//     id: string;
//     existingCertificateId?: number;
//     label: string;
//     certificate: File | null;
//     dateExpire: string | null;
//     dateIndefinite: boolean;
// };

// export const generateId = () => Math.random().toString(36).substr(2, 9);

// export const getNewAdditionalDocList = (currentDocs: AdditionalDoc[]): AdditionalDoc[] => {
//     if (currentDocs.length >= 10) return currentDocs;
    
//     const newDoc: AdditionalDoc = {
//         id: generateId(),
//         label: "",
//         certificate: null,
//         dateExpire: "",
//         dateIndefinite: false,
//     };
//     return [...currentDocs, newDoc];
// };

// export const getFilteredAdditionalDocList = (currentDocs: AdditionalDoc[], id: string): AdditionalDoc[] => {
//     return currentDocs.filter(doc => doc.id !== id);
// };

// export const getUpdatedAdditionalDocList = (
//     currentDocs: AdditionalDoc[], 
//     id: string, 
//     field: keyof AdditionalDoc, 
//     value: any
// ): AdditionalDoc[] => {
//     return currentDocs.map(doc => 
//         doc.id === id ? { ...doc, [field]: value } : doc
//     );
// };