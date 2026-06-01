import { aircraftDocumentationFields, MODEL_SPECIFIC_KEYS } from "../certificates/AircraftDocumentationSection";
import { staticUserCertificateFields as staticUserCertificateConfig } from "../certificates/staticUserCertificateFields";
import { useState, type ChangeEvent } from "react";

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
    if (file.size > 20 * 1024 * 1024) {
        return "El archivo debe pesar menos de 20MB.";
    }
    return null;
};

// export const getDocumentationFetchUrl = (context: "aircraft" | "model", id: string): string =>
//     context === "model"
//         ? `/api/aircraft-models/${id}/documentation`
//         : `/api/aircraft-documentation/aircraft/${id}`;

export const getDocumentationFetchUrl = (
    context: "aircraft" | "model", 
    id: string, 
    modelName?: string
): string => {
    if (context === "model") {
        const folderName = modelName 
            ? `${id}-${modelName.replaceAll(" ", "_")}` 
            : id;
        return `/api/aircraft-models/${folderName}/documentation`;
    }
    return `/api/aircraft-documentation/aircraft/${id}`;
};

export const typeColors: Record<string, { backgroundColor: string; color: string }> = {
    ADMIN: { backgroundColor: "#FEE2E2", color: "#991B1B" },
    MANAGER: { backgroundColor: "#E0F2FE", color: "#075985" },
    PILOT: { backgroundColor: "#E6F4EC", color: "#1F6B43" },
};

export const stateColors: Record<string, { backgroundColor: string; color: string }> = {
    active: { backgroundColor: "#DCFCE7", color: "#166534" },
    inactive: { backgroundColor: "#F3F4F6", color: "#374151" }
};

export function useConopsHandlers(
    validateCertificateFile: (file: File) => string | null,
    onInvalidFile?: (message: string) => void
) {
    // --- ESTADOS CONCENTRADOS ---
    const [conopsDocs, setConopsDocs] = useState<Record<string, any>>({});
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [currentSelection, setCurrentSelection] = useState<string>("");

    // --- MANEJADORES EXISTENTES ---
    const handleConopsFileChange = (catId: string, event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) {
            setConopsDocs((prev) => ({
                ...prev,
                [catId]: {
                    ...(prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null }),
                    certificate: null,
                },
            }));
            return;
        }

        const fileError = validateCertificateFile(file);
        if (fileError) {
            onInvalidFile?.(fileError);
            return;
        }

        setConopsDocs((prev) => ({
            ...prev,
            [catId]: {
                ...(prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null }),
                certificate: file,
            },
        }));
    };

    const handleConopsClearFile = (catId: string) => {
        setConopsDocs((prev) => ({
            ...prev,
            [catId]: {
                ...(prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null }),
                certificate: null,
            },
        }));
        const input = document.getElementById(`file-${catId}`) as HTMLInputElement | null;
        if (input) input.value = "";
    };

    const handleConopsDateChange = (catId: string, value: string) => {
        setConopsDocs((prev) => ({
            ...prev,
            [catId]: {
                ...(prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null }),
                dateExpire: value || null,
                dateIndefinite: false,
            },
        }));
    };

    const handleConopsToggleIndefinite = (catId: string) => {
        setConopsDocs((prev) => {
            const current = prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null };
            const nextIndefinite = !current.dateIndefinite;
            return {
                ...prev,
                [catId]: {
                    ...current,
                    dateIndefinite: nextIndefinite,
                    dateExpire: nextIndefinite ? null : current.dateExpire,
                },
            };
        });
    };

    // --- NUEVOS MANEJADORES DE CATEGORÍAS ---
    const addCategory = () => {
        if (currentSelection && !selectedCategories.includes(currentSelection)) {
            setSelectedCategories((prev) => [...prev, currentSelection]);
            setConopsDocs((prev) => ({
                ...prev,
                [currentSelection]: {
                    certificate: null,
                    dateExpire: null,
                    dateIndefinite: null,
                },
            }));
            setCurrentSelection("");
        }
    };

    const removeCategory = (categoryId: string) => {
        setSelectedCategories((prev) => prev.filter((idValue) => idValue !== categoryId));
        setConopsDocs((prev) => {
            const next = { ...prev };
            delete next[categoryId];
            return next;
        });
    };

    const initConopsData = (categories: string[], docs: Record<string, any>) => {
        setSelectedCategories(categories);
        setConopsDocs(docs);
        setCurrentSelection("");
    };

    // Retornamos todo lo necesario para la UI
    return {
        conopsDocs,
        selectedCategories,
        currentSelection,
        setCurrentSelection,
        handleConopsFileChange,
        handleConopsClearFile,
        handleConopsDateChange,
        handleConopsToggleIndefinite,
        addCategory,
        removeCategory,
        initConopsData
    };
}

export function useAdditionalDocsHandlers(
    validateCertificateFile: (file: File) => string | null,
    onInvalidFile?: (message: string) => void
) {
    // --- ESTADOS INTERNOS ---
    const [additionalDocs, setAdditionalDocs] = useState<AdditionalCertificatePayload[]>([]);
    const [existingAdditionalFileNames, setExistingAdditionalFileNames] = useState<Record<string, string>>({});

    // --- MANEJADORES DE ACCIONES ---
    const handleAddAdditionalDoc = () => {
        if (additionalDocs.length >= 10) {
            return;
        }
        setAdditionalDocs((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                label: "",
                certificate: null,
                dateExpire: null,
                dateIndefinite: false,
            },
        ]);
    };

    const handleRemoveAdditionalDoc = (idValue: string) => {
        setAdditionalDocs((prev) => prev.filter((doc) => doc.id !== idValue));
        setExistingAdditionalFileNames((prev) => {
            const next = { ...prev };
            delete next[idValue];
            return next;
        });
    };

    const handleAdditionalFieldChange = (
        idValue: string,
        field: keyof AdditionalCertificatePayload,
        value: any
    ) => {
        if (field === "certificate" && value instanceof File) {
            const fileError = validateCertificateFile(value);
            if (fileError) {
                onInvalidFile?.(fileError);
                return;
            }
        }

        setAdditionalDocs((prev) =>
            prev.map((doc) => (doc.id === idValue ? { ...doc, [field]: value } : doc))
        );

        if (field === "certificate" && value === null) {
            setExistingAdditionalFileNames((prev) => ({ ...prev, [idValue]: "" }));
        }
    };

    // --- FUNCIÓN DE INICIALIZACIÓN (Para el useEffect del componente) ---
    const initAdditionalDocsData = (
        docs: AdditionalCertificatePayload[],
        names: Record<string, string>
    ) => {
        setAdditionalDocs(docs);
        setExistingAdditionalFileNames(names);
    };

    return {
        additionalDocs,
        existingAdditionalFileNames,
        handleAddAdditionalDoc,
        handleRemoveAdditionalDoc,
        handleAdditionalFieldChange,
        initAdditionalDocsData
    };
}
