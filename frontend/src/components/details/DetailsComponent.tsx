import { useEffect, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "../commons/hooks/useAuth";
import DetailView from "../commons/props/DetailView";
import DetailEdit from "../commons/props/DetailEdit";
import ConfirmModal from "../commons/ConfirmModal";
import Forbidden from "../main-elements-views/Forbidden";
import NotFound from "../main-elements-views/NotFound";
import { getCertificateLabel, staticUserCertificateFields as staticUserCertificateConfig } from "../certificates/staticUserCertificateFields";
import UserCertificatesSection, { UserCertificatesSummarySection } from "../certificates/UserCertificatesSection";
import { CONOPS_CATEGORIES } from "../certificates/conopsCategories";
import AircraftDocumentationSection, {
    AircraftDocumentationSummarySection,
    aircraftDocumentationFields,
    AIRCRAFT_SPECIFIC_KEYS,
    MODEL_SPECIFIC_KEYS,
    getVisibleAircraftDocumentationFields,
} from "../certificates/AircraftDocumentationSection";
import { getAircraftDocumentationFlags,getAircraftModelDocumentationFlags, toBooleanLike } from "../certificates/aircraftDocumentationUtils";
import {
    clearFileMapValue,
    getDocumentationFetchUrl,
    handleFileMapChange,
    toggleBooleanMapValue,
    validateCertificateFile,
    typeColors,
    stateColors,
    USER_CERTIFICATE_DEFAULTS,
    AIRCRAFT_DOCUMENTATION_DEFAULTS,
    MODEL_DOCUMENTATION_DEFAULTS,
} from "./detailsUtils";

import editIcon from '../../assets/commons/edit_white.svg';
import deleteIcon from '../../assets/commons/delete_white.svg';
import arroBackIcon from '../../assets/commons/arrow_back_white.svg';
import checkIcon from '../../assets/commons/check_white.svg';
import cancelIcon from '../../assets/commons/cancel_white.svg';
import LoadingSpinner from "../commons/Loading";

interface DetailsComponentProps {
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

type UserCertificate = {
    id: number;
    userId: number;
    certificateType: string;
    certificateName: string | null;
    expireDate: string | null;
    dateIndefinite: boolean | null;
};

type AircraftDocumentation = {
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

type CertificateFieldPayload = {
    certificate: File | null;
    dateExpire: string | null;
    dateIndefinite: boolean | null;
};

type AdditionalCertificatePayload = {
    id: string;
    existingCertificateId?: number;
    label: string;
    certificate: File | null;
    dateExpire: string | null;
    dateIndefinite: boolean | null;
};

interface LoadingState {
    data: boolean;
    certificates: boolean;
    image: boolean;
}

export default function DetailsComponent({
    id,
    endpoint,
    fields,
    initialData,
    imageEndpoint,
    defaultImage = "user",
    entityType = "user",
    allowEdit,
    allowDelete,
    onDelete,
    onBack,
    validateForm,
    showCertificates = false,
    certificateSectionType,
    clearableFieldKeys = [],
}: DetailsComponentProps) {
    const { token } = useAuth();
    const resolvedCertificateSectionType = certificateSectionType ?? (showCertificates ? "user" : undefined);
    const showUserCertificates = resolvedCertificateSectionType === "user";
    const showAircraftDocumentation = resolvedCertificateSectionType === "aircraft";
    const showAircraftModelDocumentation = resolvedCertificateSectionType === "model";

    const [data, setData] = useState<any>(initialData || null);
    const [status, setStatus] = useState<number>(200);
    const [loading, setLoading] = useState<LoadingState>({
        data: true,
        image: false,
        certificates: false
    });
    const updateLoading = (key: keyof typeof loading, value: boolean) => {
        setLoading(prev => ({ ...prev, [key]: value }));
    };
    const [editing, setEditing] = useState(false);
    const [formValues, setFormValues] = useState<any>(initialData || {});
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageVersion, setImageVersion] = useState(0);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [removeImage, setRemoveImage] = useState(false);
    const [certificates, setCertificates] = useState<UserCertificate[]>([]);
    
    const [aircraftDocumentations, setAircraftDocumentations] = useState<AircraftDocumentation[]>([]);
    const [certificateSelectedFiles, setCertificateSelectedFiles] = useState<Record<string, File | null>>(USER_CERTIFICATE_DEFAULTS.files);
    const [certificateFormValues, setCertificateFormValues] = useState<Record<string, string>>(USER_CERTIFICATE_DEFAULTS.dates);
    const [certificateActiveChecks, setCertificateActiveChecks] = useState<Record<string, boolean>>(USER_CERTIFICATE_DEFAULTS.checks);
    
    const [aircraftDocumentationFiles, setAircraftDocumentationFiles] = useState<Record<string, File | null>>(AIRCRAFT_DOCUMENTATION_DEFAULTS.files);
    const [aircraftDocumentationFormValues, setAircraftDocumentationFormValues] = useState<Record<string, string>>(AIRCRAFT_DOCUMENTATION_DEFAULTS.dates);
    const [aircraftDocumentationChecks, setAircraftDocumentationChecks] = useState<Record<string, boolean>>(AIRCRAFT_DOCUMENTATION_DEFAULTS.checks);

    const [aircraftModelDocumentationFiles, setAircraftModelDocumentationFiles] = useState<Record<string, File | null>>(MODEL_DOCUMENTATION_DEFAULTS.files);
    const [aircraftModelDocumentationFormValues, setAircraftModelDocumentationFormValues] = useState<Record<string, string>>(MODEL_DOCUMENTATION_DEFAULTS.dates);
    const [aircraftModelDocumentationChecks, setAircraftModelDocumentationChecks] = useState<Record<string, boolean>>(MODEL_DOCUMENTATION_DEFAULTS.checks);

    const [existingAircraftDocumentationFileNames, setExistingAircraftDocumentationFileNames] = useState<Record<string, string>>({});
    const [existingAircraftModelDocumentationFileNames, setExistingAircraftModelDocumentationFileNames] = useState<Record<string, string>>({});

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [currentSelection, setCurrentSelection] = useState<string>("");
    const [conopsDocs, setConopsDocs] = useState<Record<string, CertificateFieldPayload>>({});
    const [existingStaticFileNames, setExistingStaticFileNames] = useState<Record<string, string>>({});
    const [existingConopsFileNames, setExistingConopsFileNames] = useState<Record<string, string>>({});
    const [additionalDocs, setAdditionalDocs] = useState<AdditionalCertificatePayload[]>([]);
    const [existingAdditionalFileNames, setExistingAdditionalFileNames] = useState<Record<string, string>>({});

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState<"update" | "delete" | "validationError" | null>(null);

    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            updateLoading('data', true);
            const url = id ? `${endpoint}/${id}` : endpoint;
            try {
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStatus(res.status);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                    setFormValues(json);
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setStatus(500);
            } finally {
                updateLoading('data', false);
            }
        };
        loadData();
    }, [id, endpoint, token, initialData]);

    // Cargar imagen y manejar limpieza
    useEffect(() => {
        let objectUrl: string | null = null;

        const loadImage = async () => {
            updateLoading('image', true);
            if (!data?.imagePath || !imageEndpoint) {
                setImageUrl(null);
                updateLoading('image', false);
                return;
            }

            try {
                const res = await fetch(`${imageEndpoint}/${data.imagePath}?v=${imageVersion}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    setImageUrl(null);
                    return;
                }

                const blob = await res.blob();
                objectUrl = URL.createObjectURL(blob);
                setImageUrl(objectUrl);
            } catch (error) {
                console.error("Error loading image:", error);
                setImageUrl(null);
            } finally {
                updateLoading('image', false);
            }
        };

        loadImage();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [data?.imagePath, token, imageEndpoint, imageVersion]);

    // Cargar certificados si corresponde
    useEffect(() => {
        if (!showUserCertificates || !id) {
            return;
        }

        const loadCertificates = async () => {
            updateLoading('certificates', true);
            try {
                const res = await fetch(`/api/user-certificates/user/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    setCertificates([]);
                    return;
                }

                const json = (await res.json()) as UserCertificate[];
                setCertificates(json);
            } catch (error) {
                console.error("Error loading certificates:", error);
                setCertificates([]);
            } finally {
                updateLoading('certificates', false);
            }
        };

        loadCertificates();
    }, [id, showUserCertificates, token]);

    // Sincronizar estado de certificados con los datos cargados
    useEffect(() => {
        if (!showUserCertificates) {
            return;
        }

        const nextChecks = { ...USER_CERTIFICATE_DEFAULTS.checks };
        const nextForm = { ...USER_CERTIFICATE_DEFAULTS.dates };
        const nextCategories: string[] = [];
        const nextConopsDocs: Record<string, CertificateFieldPayload> = {};
        const nextStaticNames: Record<string, string> = {};
        const nextConopsNames: Record<string, string> = {};
        const nextAdditionalDocs: AdditionalCertificatePayload[] = [];
        const nextAdditionalNames: Record<string, string> = {};

        certificates.forEach((certificate) => {
            const staticField = staticUserCertificateConfig.find((field) => field.key === certificate.certificateType);
            const filename = certificate.certificateName?.split("/").pop() ?? "";

            if (staticField) {
                nextChecks[staticField.enabledKey] = true;
                nextChecks[staticField.indefiniteKey] = Boolean(certificate.dateIndefinite);
                nextForm[staticField.dateKey] = certificate.expireDate ?? "";
                if (filename) {
                    nextStaticNames[staticField.fileKey] = filename;
                }
                return;
            }

            if (certificate.certificateType.startsWith("conops_")) {
                const categoryId = certificate.certificateType.replace("conops_", "");
                if (!nextCategories.includes(categoryId)) {
                    nextCategories.push(categoryId);
                }
                nextConopsDocs[categoryId] = {
                    certificate: null,
                    dateExpire: certificate.expireDate ?? null,
                    dateIndefinite: certificate.dateIndefinite ?? false,
                };
                if (filename) {
                    nextConopsNames[categoryId] = filename;
                }
                return;
            }

            const additionalId = `existing-${certificate.id}`;
            nextAdditionalDocs.push({
                id: additionalId,
                existingCertificateId: certificate.id,
                label: certificate.certificateType || "",
                certificate: null,
                dateExpire: certificate.expireDate ?? null,
                dateIndefinite: certificate.dateIndefinite ?? false,
            });
            if (filename) {
                nextAdditionalNames[additionalId] = filename;
            }
        });

        setCertificateSelectedFiles({ ...USER_CERTIFICATE_DEFAULTS.files });
        setCertificateActiveChecks(nextChecks);
        setCertificateFormValues(nextForm);
        setSelectedCategories(nextCategories);
        setConopsDocs(nextConopsDocs);
        setExistingStaticFileNames(nextStaticNames);
        setExistingConopsFileNames(nextConopsNames);
        setAdditionalDocs(nextAdditionalDocs);
        setExistingAdditionalFileNames(nextAdditionalNames);
        setCurrentSelection("");
    }, [certificates, showUserCertificates]);

    // Cargar documentación si corresponde, tanto de aeronave como de modelo
    useEffect(() => {
        if (!id || !(showAircraftDocumentation || showAircraftModelDocumentation)) {
            return;
        }

        const loadDocumentations = async () => {
            updateLoading("certificates", true);
            try {
                const res = await fetch(
                    getDocumentationFetchUrl(showAircraftModelDocumentation ? "model" : "aircraft", id),
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!res.ok) {
                    setAircraftDocumentations([]);
                    return;
                }

                const json = (await res.json()) as AircraftDocumentation[];
                setAircraftDocumentations(json);
            } catch (error) {
                console.error("Error loading documentations:", error);
                setAircraftDocumentations([]);
            } finally {
                updateLoading("certificates", false);
            }
        };

        loadDocumentations();
    }, [id, showAircraftDocumentation, showAircraftModelDocumentation, token]);

    // Sincronizar estado de documentación con los datos cargados
    useEffect(() => {
        if (!showAircraftDocumentation && !showAircraftModelDocumentation) {
            return;
        }

        const nextChecks = { ...AIRCRAFT_DOCUMENTATION_DEFAULTS.checks };
        const nextForm = { ...AIRCRAFT_DOCUMENTATION_DEFAULTS.dates };
        const nextNames: Record<string, string> = {};

        const nextChecksModel = { ...MODEL_DOCUMENTATION_DEFAULTS.checks };
        const nextFormModel = { ...MODEL_DOCUMENTATION_DEFAULTS.dates };
        const nextNamesModel: Record<string, string> = {};

        const fieldMap = new Map(aircraftDocumentationFields.map(f => [f.key, f]));

        aircraftDocumentations.forEach((doc) => {
            const type = doc.documentationType;
            const config = fieldMap.get(type);
            if (!config) return;

            const filename = doc.documentationName?.split("/").pop() ?? "";
            
            // Determine target based on context, not on whether it's a model key
            // For aircraft: put everything in aircraft state (both specific and inherited from model)
            // For model: put everything in model state
            let targetChecks, targetForm, targetNames;
            
            if (showAircraftDocumentation && !showAircraftModelDocumentation) {
                // Aircraft context: all documentation goes to aircraft state
                targetChecks = nextChecks;
                targetForm = nextForm;
                targetNames = nextNames;
            } else if (showAircraftModelDocumentation && !showAircraftDocumentation) {
                // Model context: all documentation goes to model state
                targetChecks = nextChecksModel;
                targetForm = nextFormModel;
                targetNames = nextNamesModel;
            } else {
                // Both visible - use type to separate
                const isModel = MODEL_SPECIFIC_KEYS.has(type);
                targetChecks = isModel ? nextChecksModel : nextChecks;
                targetForm = isModel ? nextFormModel : nextForm;
                targetNames = isModel ? nextNamesModel : nextNames;
            }

            targetChecks[config.enabledKey] = true;
            targetChecks[config.indefiniteKey] = Boolean(doc.dateIndefinite);
            targetForm[config.dateKey] = doc.expireDate ?? "";
            if (filename) targetNames[config.fileKey] = filename;
        });

        setAircraftDocumentationChecks(nextChecks);
        setAircraftDocumentationFormValues(nextForm);
        setExistingAircraftDocumentationFileNames(nextNames);
        setAircraftDocumentationFiles({ ...AIRCRAFT_DOCUMENTATION_DEFAULTS.files });

        
        setAircraftModelDocumentationChecks(nextChecksModel);
        setAircraftModelDocumentationFormValues(nextFormModel);
        setExistingAircraftModelDocumentationFileNames(nextNamesModel);
        setAircraftModelDocumentationFiles({ ...MODEL_DOCUMENTATION_DEFAULTS.files });

    }, [aircraftDocumentations, showAircraftDocumentation, showAircraftModelDocumentation]);

    const handleConfirmClick = () => {
        if (validateForm) {
            const formErrors = validateForm(formValues);
            setErrors(formErrors);
            const hasErrors = Object.values(formErrors).some(error => error !== null);
            if (hasErrors) {
                setConfirmAction("validationError");
                setShowConfirm(true);
                return;
            }
        }
        setConfirmAction("update");
        setShowConfirm(true);
    };

    const handleConfirmDelete = () => {
        setConfirmAction("delete");
        setShowConfirm(true);
    };

    const openCertificate = async (certificate: UserCertificate) => {
        if (!certificate.certificateName) {
            return;
        }

        try {
            const encodedPath = certificate.certificateName
                .split("/")
                .map(encodeURIComponent)
                .join("/");

            const res = await fetch(`/api/users/images/${encodedPath}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(`Error loading certificate: ${res.status}`);
            }

            const blob = await res.blob();
            const isPdfByExtension = certificate.certificateName.toLowerCase().endsWith(".pdf");
            const fileBlob =
                isPdfByExtension && (!blob.type || blob.type === "application/octet-stream")
                    ? new Blob([blob], { type: "application/pdf" })
                    : blob;
            const objectUrl = URL.createObjectURL(fileBlob);
            window.open(objectUrl, "_blank", "noopener,noreferrer");
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        } catch (error) {
            console.error("Error opening certificate:", error);
            alert("No se pudo abrir el certificado.");
        }
    };

    const formatCertificateDate = (certificate: UserCertificate) => {
        if (certificate.dateIndefinite) {
            return "Indefinida";
        }

        if (!certificate.expireDate) {
            return "-";
        }

        return new Date(certificate.expireDate).toLocaleDateString("es-ES");
    };

    const handleRestoreModelDefault = (fieldKey: string, isModel: boolean = false) => {
        // Find the model default document
        const modelDoc = aircraftDocumentations.find(
            doc => doc.documentationType === fieldKey && doc.isModelDefault === true
        );

        if (!modelDoc || !modelDoc.documentationName) {
            alert("No se encontró el documento del modelo");
            return;
        }

        // Find the field config to get the enabledKey
        const fieldConfig = aircraftDocumentationFields.find(f => f.key === fieldKey);
        if (!fieldConfig) return;

        const setFiles = isModel ? setAircraftModelDocumentationFiles : setAircraftDocumentationFiles;
        const setChecks = isModel ? setAircraftModelDocumentationChecks : setAircraftDocumentationChecks;
        const setFormValues = isModel ? setAircraftModelDocumentationFormValues : setAircraftDocumentationFormValues;
        const setExistingNames = isModel ? setExistingAircraftModelDocumentationFileNames : setExistingAircraftDocumentationFileNames;

        // Clear any selected file for this field
        setFiles((prev) => {
            const newFiles = { ...prev };
            delete newFiles[fieldConfig.fileKey];
            return newFiles;
        });

        // Restore date values from model default
        setFormValues((prev) => ({
            ...prev,
            [fieldConfig.dateKey]: modelDoc.expireDate ?? "",
        }));

        // Make sure the checkbox is enabled and indefinite matches model
        setChecks((prev) => ({
            ...prev,
            [fieldConfig.enabledKey]: true,
            [fieldConfig.indefiniteKey]: Boolean(modelDoc.dateIndefinite),
        }));

        // Restore the filename reference to the model default
        const filename = modelDoc.documentationName.split("/").pop() ?? "";
        setExistingNames((prev) => ({
            ...prev,
            [fieldConfig.fileKey]: filename,
        }));
    };

    const handleAircraftDocumentationCheckChange = (key: string, isModel: boolean = false) => {
        const setter = isModel ? setAircraftModelDocumentationChecks : setAircraftDocumentationChecks;
        toggleBooleanMapValue(setter, key);
    };

    const handleCertificateCheckChange = (key: string) => {
        toggleBooleanMapValue(setCertificateActiveChecks, key);
    };

    const handleAircraftDocumentationFileChange = (event: ChangeEvent<HTMLInputElement>, key: string, isModel: boolean = false) => {
        const filesSetter = isModel ? setAircraftModelDocumentationFiles : setAircraftDocumentationFiles;
        const checksSetter = isModel ? setAircraftModelDocumentationChecks : setAircraftDocumentationChecks;
        
        handleFileMapChange(event, key, filesSetter);
        
        const fieldConfig = aircraftDocumentationFields.find((field) => field.fileKey === key);
        if (fieldConfig && event.target.files?.[0]) {
            checksSetter((prev: Record<string, boolean>) => ({
                ...prev,
                [fieldConfig.enabledKey]: true
            }));
        }
    };

    const handleCertificateFileChange = (event: ChangeEvent<HTMLInputElement>, key: string) => {
        handleFileMapChange(event, key, setCertificateSelectedFiles);
    };

    const handleAircraftDocumentationClearFile = (
        key: string, 
        inputId: string, 
        isModel: boolean = false
    ) => {
        const filesState = isModel ? aircraftModelDocumentationFiles : aircraftDocumentationFiles;
        const existingNamesState = isModel ? existingAircraftModelDocumentationFileNames : existingAircraftDocumentationFileNames;
        
        const setFiles = isModel ? setAircraftModelDocumentationFiles : setAircraftDocumentationFiles;
        const setExistingNames = isModel ? setExistingAircraftModelDocumentationFileNames : setExistingAircraftDocumentationFileNames;
        const setChecks = isModel ? setAircraftModelDocumentationChecks : setAircraftDocumentationChecks;
        const setFormValues = isModel ? setAircraftModelDocumentationFormValues : setAircraftDocumentationFormValues;

        const hasSelectedFile = Boolean(filesState[key]);
        const hasExistingFile = Boolean(existingNamesState[key]);
        
        const shouldDelete = hasSelectedFile || hasExistingFile
            ? window.confirm("Se eliminará esta documentación al guardar los cambios. ¿Continuar?")
            : true;

        if (!shouldDelete) return;

        clearFileMapValue(key, inputId, setFiles);

        setExistingNames((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });

        const fieldConfig = aircraftDocumentationFields.find((field) => field.fileKey === key);
        if (fieldConfig) {
            setChecks((prev) => ({
                ...prev,
                [fieldConfig.enabledKey]: false,
                [fieldConfig.indefiniteKey]: false,
            }));

            setFormValues((prev) => ({
                ...prev,
                [fieldConfig.dateKey]: "",
            }));
        }
    };

    const handleCertificateClearFile = (key: string, inputId: string) => {
        clearFileMapValue(key, inputId, setCertificateSelectedFiles);
    };

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
            alert(fileError);
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
    };

    const handleAdditionalFieldChange = (
        idValue: string,
        field: keyof AdditionalCertificatePayload,
        value: any
    ) => {
        setAdditionalDocs((prev) =>
            prev.map((doc) => (doc.id === idValue ? { ...doc, [field]: value } : doc))
        );
    };

    const syncCertificates = async () => {
        if (!showUserCertificates || !id) return;

        const staticKeys = new Set(staticUserCertificateConfig.map((field) => field.key));
        const isConopsType = (certificateType: string) => certificateType.startsWith("conops_");
        const isAdditionalType = (certificateType: string) => !staticKeys.has(certificateType) && !isConopsType(certificateType);

        const existingByType = new Map(
            certificates
                .filter((certificate) => !isAdditionalType(certificate.certificateType))
                .map((certificate) => [certificate.certificateType, certificate])
        );
        const desiredTypes = new Set<string>();
        const desiredAdditionalIds = new Set<number>();

        const desiredStatic = staticUserCertificateConfig.map((field) => ({
            type: field.key,
            enabled: Boolean(certificateActiveChecks[field.enabledKey]),
            file: certificateSelectedFiles[field.fileKey],
            expireDate: certificateFormValues[field.dateKey] || null,
            dateIndefinite: Boolean(certificateActiveChecks[field.indefiniteKey]),
        }));

        const desiredConops = selectedCategories.map((categoryId) => ({
            type: `conops_${categoryId}`,
            file: conopsDocs[categoryId]?.certificate ?? null,
            expireDate: conopsDocs[categoryId]?.dateExpire ?? null,
            dateIndefinite: Boolean(conopsDocs[categoryId]?.dateIndefinite),
        }));

        for (const item of desiredStatic) {
            if (!item.enabled) continue;
            desiredTypes.add(item.type);
            const existing = existingByType.get(item.type);
            const shouldPersist = Boolean(item.file) || Boolean(item.expireDate) || item.dateIndefinite || Boolean(existing);
            if (!shouldPersist) continue;

            const formData = new FormData();
            formData.append("certificateType", item.type);
            if (item.expireDate && !item.dateIndefinite) formData.append("expireDate", item.expireDate);
            formData.append("dateIndefinite", item.dateIndefinite ? "true" : "false");
            if (item.file) formData.append("file", item.file, item.file.name);

            const url = existing
                ? `/api/user-certificates/${existing.id}/upload`
                : `/api/user-certificates/user/${id}/upload`;
            const method = existing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Error guardando certificados.");
            }
        }

        for (const item of desiredConops) {
            desiredTypes.add(item.type);
            const existing = existingByType.get(item.type);
            const shouldPersist = Boolean(item.file) || Boolean(item.expireDate) || item.dateIndefinite || Boolean(existing);
            if (!shouldPersist) continue;

            const formData = new FormData();
            formData.append("certificateType", item.type);
            if (item.expireDate && !item.dateIndefinite) formData.append("expireDate", item.expireDate);
            formData.append("dateIndefinite", item.dateIndefinite ? "true" : "false");
            if (item.file) formData.append("file", item.file, item.file.name);

            const url = existing
                ? `/api/user-certificates/${existing.id}/upload`
                : `/api/user-certificates/user/${id}/upload`;
            const method = existing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Error guardando certificados ConOps.");
            }
        }

        for (const doc of additionalDocs) {
            const existingCertificateId = doc.existingCertificateId;
            const existing = existingCertificateId
                ? certificates.find((certificate) => certificate.id === existingCertificateId)
                : undefined;

            const label = doc.label.trim();
            const hasAnyData = Boolean(label) || Boolean(doc.certificate) || Boolean(doc.dateExpire) || Boolean(doc.dateIndefinite) || Boolean(existing);
            if (!hasAnyData) {
                continue;
            }

            const formData = new FormData();
            const finalType = label || existing?.certificateType || `additional_${doc.id}`;
            formData.append("certificateType", finalType);
            if (doc.dateExpire && !doc.dateIndefinite) formData.append("expireDate", doc.dateExpire);
            formData.append("dateIndefinite", doc.dateIndefinite ? "true" : "false");
            if (doc.certificate) formData.append("file", doc.certificate, doc.certificate.name);

            const url = existing
                ? `/api/user-certificates/${existing.id}/upload`
                : `/api/user-certificates/user/${id}/upload`;
            const method = existing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Error guardando certificados adicionales.");
            }

            if (existing?.id) {
                desiredAdditionalIds.add(existing.id);
            }
        }

        for (const certificate of certificates) {
            if (!isAdditionalType(certificate.certificateType) && !desiredTypes.has(certificate.certificateType)) {
                const res = await fetch(`/api/user-certificates/${certificate.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText || "Error eliminando certificado.");
                }
            }

            if (isAdditionalType(certificate.certificateType) && !desiredAdditionalIds.has(certificate.id)) {
                const res = await fetch(`/api/user-certificates/${certificate.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText || "Error eliminando certificado.");
                }
            }
        }

        const refreshed = await fetch(`/api/user-certificates/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (refreshed.ok) {
            const json = (await refreshed.json()) as UserCertificate[];
            setCertificates(json);
        }
    };

    const syncAircraftDocumentation = async () => {
        if (!showAircraftDocumentation || !id) return;

        const { showInsuranceDocumentation, showFTSDocumentation, showParachuteDocumentation } = getAircraftDocumentationFlags(formValues);
        
        // We pass context "aircraft" to get the fields belonging to the specific drone
        const visibleFields = getVisibleAircraftDocumentationFields(
            "aircraft",
            false, 
            showInsuranceDocumentation,
            showFTSDocumentation,
            showParachuteDocumentation
        );

        // Include both aircraft-specific AND inherited model-default docs
        const allAircraftDocs = aircraftDocumentations.filter(d => 
            AIRCRAFT_SPECIFIC_KEYS.has(d.documentationType) || 
            (MODEL_SPECIFIC_KEYS.has(d.documentationType) && d.isModelDefault)
        );
        const existingByType = new Map(allAircraftDocs.map((d) => [d.documentationType, d]));
        const desiredTypes = new Set<string>();

        const tasks = [];

        for (const field of visibleFields) {
            const enabled = Boolean(aircraftDocumentationChecks[field.enabledKey]);
            const file = aircraftDocumentationFiles[field.fileKey];
            const expireDate = aircraftDocumentationFormValues[field.dateKey] || null;
            const dateIndefinite = Boolean(aircraftDocumentationChecks[field.indefiniteKey]);
            const existing = existingByType.get(field.key);

            if (enabled) {
                desiredTypes.add(field.key);
                
                // Skip update if this is a model default document and user didn't upload a new file
                const isModelDefaultWithoutNewFile = existing?.isModelDefault && !file;
                if (isModelDefaultWithoutNewFile) {
                    continue;
                }
                
                const shouldPersist = Boolean(file) || Boolean(expireDate) || dateIndefinite || Boolean(existing);
                if (shouldPersist) {
                    const formData = new FormData();
                    formData.append("documentationType", field.key);
                    formData.append("documentationLabel", field.label);
                    if (expireDate && !dateIndefinite) formData.append("expireDate", expireDate);
                    formData.append("dateIndefinite", dateIndefinite ? "true" : "false");
                    if (file) formData.append("file", file, file.name);

                    const url = existing 
                        ? `/api/aircraft-documentation/${existing.id}/upload` 
                        : `/api/aircraft-documentation/aircraft/${id}/upload`;
                    
                    tasks.push(
                        fetch(url, {
                            method: existing ? "PUT" : "POST",
                            headers: { Authorization: `Bearer ${token}` },
                            body: formData,
                        }).then(r => { if (!r.ok) throw new Error(`Error sync aircraft doc: ${field.label}`); })
                    );
                }
            }
        }

        // DELETE removed docs (aircraft-specific and inherited model-default docs that are no longer desired)
        for (const doc of allAircraftDocs) {
            if (!desiredTypes.has(doc.documentationType)) {
                tasks.push(
                    fetch(`/api/aircraft-documentation/${doc.id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    }).then(r => {
                        if (!r.ok) throw new Error(`Error deleting aircraft documentation: ${doc.documentationType}`);
                    })
                );
            }
        }

        if (tasks.length > 0) {
            await Promise.all(tasks);
        }

        // Refresh documentation list after sync
        await loadAircraftDocumentations();
    };

    const syncAircraftModelDocumentation = async () => {
        if (!showAircraftModelDocumentation || !id) return;

        const { showFTSDocumentation, showParachuteDocumentation, showInsuranceDocumentation } = getAircraftModelDocumentationFlags(formValues);
        
        const visibleFields = getVisibleAircraftDocumentationFields(
            "model",
            false,
            showInsuranceDocumentation,
            showFTSDocumentation,
            showParachuteDocumentation
        );

        const modelDocs = aircraftDocumentations.filter(d => MODEL_SPECIFIC_KEYS.has(d.documentationType));
        const existingByType = new Map(modelDocs.map((d) => [d.documentationType, d]));
        const desiredTypes = new Set<string>();

        const tasks = [];

        for (const field of visibleFields) {
            const enabled = Boolean(aircraftModelDocumentationChecks[field.enabledKey]);
            const file = aircraftModelDocumentationFiles[field.fileKey];
            const expireDate = aircraftModelDocumentationFormValues[field.dateKey] || null;
            const dateIndefinite = Boolean(aircraftModelDocumentationChecks[field.indefiniteKey]);
            const existing = existingByType.get(field.key);

            if (enabled) {
                desiredTypes.add(field.key);
                
                const shouldPersist = Boolean(file) || Boolean(expireDate) || dateIndefinite || Boolean(existing);
                
                if (shouldPersist) {
                    const formData = new FormData();
                    formData.append("documentationType", field.key);
                    formData.append("documentationLabel", field.label);
                    
                    if (expireDate && !dateIndefinite) {
                        formData.append("expireDate", expireDate);
                    }
                    formData.append("dateIndefinite", dateIndefinite ? "true" : "false");
                    
                    if (file) {
                        formData.append("file", file, file.name);
                    }

                    const url = existing 
                        ? `/api/aircraft-model-documentation/${existing.id}/upload` 
                        : `/api/aircraft-model-documentation/model/${id}/upload`;
                    tasks.push(
                        fetch(url, {
                            method: existing ? "PUT" : "POST",
                            headers: { Authorization: `Bearer ${token}` },
                            body: formData,
                        }).then(r => { 
                            if (!r.ok) throw new Error(`Error syncing ${field.label}`); 
                        })
                    );
                }
            }
        }

        // ELIMINACIÓN: Solo borrar si es una clave de modelo y ya no está marcada/deseada
        for (const doc of modelDocs) {
            if (!desiredTypes.has(doc.documentationType)) {
                tasks.push(
                    fetch(`/api/aircraft-model-documentation/${doc.id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    }).then(r => {
                        if (!r.ok) throw new Error(`Error deleting ${doc.documentationType}`);
                    })
                );
            }
        }

        if (tasks.length > 0) {
            await Promise.all(tasks);
        }

        // Refrescar la lista tras la sincronización
        await loadAircraftDocumentations();
    };

    const openAircraftDocumentation = async (documentation: AircraftDocumentation) => {
        if (!documentation.documentationName) {
            return;
        }

        try {
            const encodedPath = documentation.documentationName
                .split("/")
                .map(encodeURIComponent)
                .join("/");

            const isModelDocumentation = documentation.documentationName.startsWith("aircraft-model/");
            const url = isModelDocumentation
                ? `/api/aircraft-models/images/${encodedPath}`
                : `/api/aircraft/images/${encodedPath}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(`Error loading documentation: ${res.status}`);
            }

            const blob = await res.blob();
            const isPdfByExtension = documentation.documentationName.toLowerCase().endsWith(".pdf");
            const fileBlob =
                isPdfByExtension && (!blob.type || blob.type === "application/octet-stream")
                    ? new Blob([blob], { type: "application/pdf" })
                    : blob;
            const objectUrl = URL.createObjectURL(fileBlob);
            window.open(objectUrl, "_blank", "noopener,noreferrer");
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        } catch (error) {
            console.error("Error opening documentation:", error);
            alert("No se pudo abrir la documentación.");
        }
    };

    const loadAircraftDocumentations = async () => {
        if (!id || !(showAircraftDocumentation || showAircraftModelDocumentation)) {
            return;
        }

        try {
            const res = await fetch(
                getDocumentationFetchUrl(showAircraftModelDocumentation ? "model" : "aircraft", id),
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) {
                setAircraftDocumentations([]);
                return;
            }

            const json = (await res.json()) as AircraftDocumentation[];
            setAircraftDocumentations(json);
        } catch (error) {
            console.error("Error loading documentations:", error);
            setAircraftDocumentations([]);
        }
    };

    const formatAircraftDocumentationDate = (documentation: AircraftDocumentation) => {
        if (documentation.dateIndefinite) {
            return "Indefinida";
        }
        if (!documentation.expireDate) {
            return "-";
        }
        return new Date(documentation.expireDate).toLocaleDateString("es-ES");
    };

    const handleConfirm = async () => {
        setShowConfirm(false);

        if (confirmAction === "update") {
            const formData = new FormData();
            const imageFieldConfig = fields.find(f => f.type === 'file');
            
            if (imageFieldConfig) {
                const file = formValues[imageFieldConfig.key];
                if (file instanceof File && file.size > 0) {
                    formData.append(imageFieldConfig.key, file);
                    formData.append("removeImage", "false");
                } else if (removeImage) {
                    formData.append("removeImage", "true");
                } else {
                    formData.append("removeImage", "false");
                }
            }

            fields.forEach((field) => {
                if (field.type === 'file') return;
                if (field.readOnly) return;
                const value = formValues[field.key];
                const isCleared = value === null || value === undefined || value.toString().trim() === "";
                const isAircraftClearableField = entityType === "aircraft" && [
                    "privatelyBuilt",
                    "hasParachute",
                    "hasEnsurance",
                    "hasFTS",
                    "cautive",
                    "accessories",
                ].includes(field.key);
                const isExplicitClearableField = clearableFieldKeys.includes(field.key);
                if (isCleared) {
                    if (isAircraftClearableField || isExplicitClearableField) {
                        formData.append(field.key, "");
                    }
                    return;
                }
                let stringValue = value.toString().trim();
                const isNumericField = [
                    "mtom",
                    "wingspan",
                    "maxSpeed",
                    "impactEnergy",
                    "mtomDefault",
                    "wingspanDefault",
                    "maxSpeedDefault",
                    "impactEnergyDefault",
                ].includes(field.key);
                const isBooleanField = [
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
                ].includes(field.key);
                if (isBooleanField) {
                    const parsed = toBooleanLike(value);
                    if (parsed === null) {
                        return;
                    }
                    stringValue = parsed ? "true" : "false";
                }
                if (field.key === "cautive" || field.key === "cautiveDefault") {
                    const normalized = stringValue
                        .normalize("NFD")
                        .replace(/\p{M}/gu, "")
                        .toLowerCase()
                        .replace(/[^a-z]/g, "");
                    if (normalized.startsWith("s") || normalized === "yes") {
                        stringValue = "YES";
                    } else if (normalized === "no" || normalized.startsWith("n")) {
                        stringValue = "NO";
                    } else if (normalized.startsWith("opc")) {
                        stringValue = "OPTIONAL";
                    }
                }

                const finalValue = isNumericField ? stringValue.replace(",", ".") : stringValue;
                formData.append(field.key, finalValue);
            });

            const res = await fetch(`${endpoint}/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                alert("Error actualizando: " + errorText);
                return;
            }

            const updated = await res.json();

            if (showUserCertificates) {
                try {
                    await syncCertificates();
                } catch (certificateError: any) {
                    alert("Datos guardados, pero hubo un problema con certificados: " + (certificateError?.message || "Error desconocido"));
                }
            }

            if (showAircraftDocumentation) {
                try {
                    await syncAircraftDocumentation();
                } catch (documentationError: any) {
                    alert("Datos guardados, pero hubo un problema con documentación: " + (documentationError?.message || "Error desconocido"));
                }
            }

            if (showAircraftModelDocumentation) {
                try {
                    await syncAircraftModelDocumentation();
                } catch (documentationError: any) {
                    alert("Error en documentación de modelo: " + (documentationError?.message || "Error"));
                }
            }

            if (updated.fechaNac) {
                updated.fechaNac = updated.fechaNac.split('T')[0];
            }
            
            // Actualizar estados
            setData(updated);
            setFormValues(updated);
            setRemoveImage(false);
            setEditing(false);

            // Forzar limpieza de imagen si el backend confirma que ya no existe path
            if (imageFieldConfig) {
                const updatedFile = formValues[imageFieldConfig.key];
                if (updatedFile instanceof File) {
                    setImageVersion((prev) => prev + 1);
                }
            }

            if (!updated.imagePath) {
                setImageUrl(null);
            }
        }

        if (confirmAction === "delete" && onDelete) {
            await onDelete();
        }

        setConfirmAction(null);
    };

    const isAnythingLoading = Object.values(loading).some(v => v === true);

    if (isAnythingLoading) {
        return <LoadingSpinner message="Sincronizando datos..." />;
    }
    if (status === 403) return <Forbidden />;
    if (status === 404 || (!data && !loading.data)) return <NotFound />;
    if (status >= 500) return <div className="text-center p-5">Error interno del servidor</div>;

    const defaultProfileImage = defaultImage === "drone" ? "/default-drone.png" : "/default-user.jpg";
    const detailTitle =
        entityType === "aircraft"
            ? `${data.manufacturer ?? ""} ${data.model ?? ""}`.trim() || data.serialNumber || `Aeronave ${data.id ?? ""}`
            : `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() || data.username || `Usuario ${data.id ?? ""}`;
    const detailSubtitle =
        entityType === "aircraft"
            ? data.serialNumber ? `Serie: ${data.serialNumber}` : undefined
            : data.username ? `@${data.username}` : undefined;
    const aircraftClassLabel = entityType === "aircraft" ? data.aircraftClass : undefined;
    const userTypeLabel = entityType === "user" ? data.type : undefined;
    const userStateLabel = entityType === "user" ? (data.state ? "Activo" : "Inactivo") : undefined;
    const aircraftDocumentationFlags = getAircraftDocumentationFlags(formValues);
    const aircraftModelDocumentationFlags = getAircraftModelDocumentationFlags(formValues);

    console.log("Flags para modelo:", aircraftModelDocumentationFlags);
    console.log("Valores actuales del formulario:", {
        hasFTSDefault: formValues.hasFTSDefault,
        hasParachuteDefault: formValues.hasParachuteDefault
    });

    // Build model default file names for aircraft
    const modelDefaultFileNames: Record<string, string> = {};
    aircraftDocumentations.forEach((doc) => {
        if (doc.isModelDefault && MODEL_SPECIFIC_KEYS.has(doc.documentationType) && doc.documentationName) {
            const fieldConfig = aircraftDocumentationFields.find(f => f.key === doc.documentationType);
            if (fieldConfig) {
                const filename = doc.documentationName.split("/").pop() ?? "";
                modelDefaultFileNames[fieldConfig.fileKey] = filename;
            }
        }
    });

    console.log("Model Default File Names:", modelDefaultFileNames);
    console.log("Existing Aircraft Documentation File Names:", existingAircraftDocumentationFileNames);

    return (
        <div className="container-fluid py-4">
            <div className="card p-4 shadow-sm">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex align-items-start mb-4">

                            {onBack && (
                                <button 
                                    className="btn d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                                    onClick={onBack}
                                    style={{ 
                                        borderRadius: "8px",
                                        width: "48px",
                                        height: "48px",
                                        padding: "0",
                                        marginTop: "4px",
                                        backgroundColor: "transparent",
                                        border: "none",
                                        transition: "all 0.2s ease"
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 130, 69, 0.1)")}
                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                    title="Volver"
                                >
                                    <img 
                                        src={arroBackIcon} 
                                        alt="Back" 
                                        style={{ 
                                            width: "32px",
                                            height: "32px",
                                            filter: "invert(42%) sepia(93%) saturate(395%) hue-rotate(102deg) brightness(92%) contrast(85%)"
                                        }} 
                                    />
                                </button>
                            )}

                            <img
                                src={imageUrl || defaultProfileImage}
                                alt={detailTitle}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = defaultProfileImage;
                                }}
                                className="rounded me-3 d-none d-sm-block flex-shrink-0"
                                style={{ width: "110px", height: "110px", objectFit: "cover" }}
                            />

                            <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
                                <h2 className="mb-1 text-break text-start w-100 fw-bold">
                                    {detailTitle}
                                </h2>

                                {detailSubtitle && (
                                    <small className="text-muted text-start mb-2" style={{ fontSize: "0.95rem" }}>
                                        {detailSubtitle}
                                    </small>
                                )}
                                
                                <div className="d-flex align-items-center flex-wrap gap-2 mt-1">
                                    {userTypeLabel && (
                                        <span
                                            className="px-2 py-1 fw-bold flex-shrink-0"
                                            style={{
                                                borderRadius: "4px",
                                                fontSize: "0.85rem",
                                                border: "1px solid currentColor",
                                                ...(typeColors[userTypeLabel] || { backgroundColor: "#E5E7EB", color: "#374151" }),
                                            }}
                                        >
                                            {userTypeLabel}
                                        </span>
                                    )}

                                    {userStateLabel && (
                                        <span
                                            className="px-2 py-1 fw-bold flex-shrink-0"
                                            style={{
                                                borderRadius: "4px",
                                                fontSize: "0.85rem",
                                                textTransform: "uppercase",
                                                border: "1px solid currentColor",
                                                ...(data.state ? stateColors.active : stateColors.inactive),
                                            }}
                                        >
                                            {userStateLabel}
                                        </span>
                                    )}

                                    {aircraftClassLabel && (
                                        <span
                                            className="px-2 py-1 fw-bold flex-shrink-0"
                                            style={{
                                                borderRadius: "4px",
                                                fontSize: "0.85rem",
                                                border: "1px solid currentColor",
                                                backgroundColor: "#E0F2FE",
                                                color: "#075985",
                                            }}
                                        >
                                            Clase {aircraftClassLabel}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-12"> 
                            {!editing ? (
                                <DetailView data={data} fields={fields} />
                            ) : (
                                <DetailEdit
                                    values={formValues}
                                    setValues={setFormValues}
                                    fields={fields}
                                    errors={errors}
                                    removeImage={removeImage}
                                    setRemoveImage={setRemoveImage}
                                />
                            )}

                        {resolvedCertificateSectionType && !editing && (
                            <>
                                {(loading as LoadingState).certificates && <p className="text-muted mb-0">Cargando certificados...</p>}
                                {!(loading as LoadingState).certificates && (
                                    <>
                                        {showUserCertificates && (
                                            <UserCertificatesSummarySection
                                                items={certificates.map((certificate) => ({
                                                    id: certificate.id,
                                                    certificateType: getCertificateLabel(certificate.certificateType),
                                                    expireDate: formatCertificateDate(certificate),
                                                    dateIndefinite: certificate.dateIndefinite,
                                                    hasFile: Boolean(certificate.certificateName),
                                                    onOpen: certificate.certificateName ? () => openCertificate(certificate) : undefined,
                                                }))}
                                            />
                                        )}

                                        {showAircraftDocumentation && (
                                            <AircraftDocumentationSummarySection
                                                items={aircraftDocumentations.map((documentation) => {
                                                    const config = aircraftDocumentationFields.find(
                                                        (field) => field.key === documentation.documentationType
                                                    );
                                                    return {
                                                        key: documentation.id.toString(),
                                                        certificateType: config?.label || documentation.documentationType,
                                                        expireDate: formatAircraftDocumentationDate(documentation),
                                                        dateIndefinite: documentation.dateIndefinite ?? false,
                                                        hasFile: Boolean(documentation.documentationName),
                                                        onOpen: documentation.documentationName
                                                            ? () => openAircraftDocumentation(documentation)
                                                            : undefined,
                                                        isModelDefault: documentation.isModelDefault ?? false,
                                                    };
                                                })}
                                            />
                                        )}

                                        {showAircraftModelDocumentation && (
                                            <AircraftDocumentationSummarySection
                                                items={aircraftDocumentations.map((documentation) => {
                                                    const config = aircraftDocumentationFields.find(
                                                        (field) => field.key === documentation.documentationType
                                                    );
                                                    return {
                                                        key: documentation.id.toString(),
                                                        certificateType: config?.label || documentation.documentationType,
                                                        expireDate: formatAircraftDocumentationDate(documentation),
                                                        dateIndefinite: documentation.dateIndefinite ?? false,
                                                        hasFile: Boolean(documentation.documentationName),
                                                        onOpen: documentation.documentationName
                                                            ? () => openAircraftDocumentation(documentation)
                                                            : undefined,
                                                        isModelDefault: documentation.isModelDefault ?? false,
                                                    };
                                                })}
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {resolvedCertificateSectionType && editing && (
                            <div className="mt-3">
                                {showUserCertificates && (
                                    <UserCertificatesSection
                                        activeChecks={certificateActiveChecks}
                                        selectedFiles={certificateSelectedFiles}
                                        formValues={certificateFormValues}
                                        onToggleCheck={handleCertificateCheckChange}
                                        onFileChange={handleCertificateFileChange}
                                        onClearFile={handleCertificateClearFile}
                                        conopsCategories={CONOPS_CATEGORIES}
                                        selectedCategories={selectedCategories}
                                        currentSelection={currentSelection}
                                        onCurrentSelectionChange={setCurrentSelection}
                                        onAddCategory={addCategory}
                                        onRemoveCategory={removeCategory}
                                        conopsDocs={conopsDocs}
                                        onConopsFileChange={handleConopsFileChange}
                                        onConopsClearFile={handleConopsClearFile}
                                        onConopsDateChange={handleConopsDateChange}
                                        onConopsToggleIndefinite={handleConopsToggleIndefinite}
                                        existingStaticFileNames={existingStaticFileNames}
                                        existingConopsFileNames={existingConopsFileNames}
                                        additionalDocs={additionalDocs}
                                        onAddAdditionalDoc={handleAddAdditionalDoc}
                                        onRemoveAdditionalDoc={handleRemoveAdditionalDoc}
                                        onAdditionalFieldChange={handleAdditionalFieldChange}
                                        existingAdditionalFileNames={existingAdditionalFileNames}
                                        onFormDateChange={(key, value) =>
                                            setCertificateFormValues((prev) => ({ ...prev, [key]: value }))
                                        }
                                    />
                                )}

                                {showAircraftDocumentation && (
                                    <AircraftDocumentationSection
                                        context="aircraft"
                                        isExistingModel={false}
                                        showInsuranceDocumentation={aircraftDocumentationFlags.showInsuranceDocumentation}
                                        showFTSDocumentation={aircraftDocumentationFlags.showFTSDocumentation}
                                        showParachuteDocumentation={aircraftDocumentationFlags.showParachuteDocumentation}
                                        onlyInsuranceHasDates
                                        activeChecks={aircraftDocumentationChecks}
                                        selectedFiles={aircraftDocumentationFiles}
                                        formValues={aircraftDocumentationFormValues}
                                        existingFileNames={existingAircraftDocumentationFileNames}
                                        modelDefaultFileNames={modelDefaultFileNames}
                                        onToggleCheck={handleAircraftDocumentationCheckChange}
                                        onFileChange={handleAircraftDocumentationFileChange}
                                        onClearFile={handleAircraftDocumentationClearFile}
                                        onFormDateChange={(key, value) =>
                                            setAircraftDocumentationFormValues((prev) => ({ ...prev, [key]: value }))
                                        }
                                        onRestoreModelDefault={handleRestoreModelDefault}
                                    />
                                )}

                                {showAircraftModelDocumentation && (
                                    <AircraftDocumentationSection
                                        context="model"
                                        isExistingModel={false}
                                        showInsuranceDocumentation={aircraftModelDocumentationFlags.showInsuranceDocumentation}
                                        showFTSDocumentation={aircraftModelDocumentationFlags.showFTSDocumentation}
                                        showParachuteDocumentation={aircraftModelDocumentationFlags.showParachuteDocumentation}
                                        onlyInsuranceHasDates
                                        activeChecks={aircraftModelDocumentationChecks}
                                        selectedFiles={aircraftModelDocumentationFiles}
                                        formValues={aircraftModelDocumentationFormValues}
                                        existingFileNames={existingAircraftModelDocumentationFileNames}
                                        onToggleCheck={(id) => handleAircraftDocumentationCheckChange(id, true)}
                                        onFileChange={(e, id) => handleAircraftDocumentationFileChange(e, id, true)}
                                        onClearFile={(id, inputId) => handleAircraftDocumentationClearFile(id, inputId, true)}
                                        onFormDateChange={(key, value) =>
                                            setAircraftModelDocumentationFormValues((prev) => ({ ...prev, [key]: value }))
                                        }
                                    />
                                )}
                            </div>
                        )}

                        <div className="d-flex gap-2 mt-3">
                            {!editing && allowEdit && (
                                <button className="btn btn-primary" onClick={() => setEditing(true)}>
                                    <img src={editIcon} alt="Edit" className="edit-icon d-inline d-sm-none" />
                                    <span className="d-none d-sm-block">Editar</span>
                                </button>
                            )}
                            {!editing && allowDelete && onDelete && (
                                <button className="btn btn-danger" onClick={handleConfirmDelete}>
                                    <img src={deleteIcon} alt="Delete" className="delete-icon d-inline d-sm-none" />
                                    <span className="d-none d-sm-block">Borrar</span>
                                </button>
                            )}
                            {editing && (
                                <>
                                    <button className="btn btn-success" onClick={handleConfirmClick}>
                                        <img src={checkIcon} alt="Check" className="check-icon d-inline d-sm-none" />
                                        <span className="d-none d-sm-block">Confirmar cambios</span>
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                                        <img src={cancelIcon} alt="Cancel" className="cancel-icon d-inline d-sm-none" />
                                        <span className="d-none d-sm-block">Cancelar</span>
                                    </button>
                                </>
                            )}
                        </div>
                        </div>
                    </div>

                    <ConfirmModal
                        show={showConfirm}
                        variant={
                            confirmAction === "delete" ? "danger" : 
                            confirmAction === "validationError" ? "warning" : "primary"
                        }
                        title={
                            confirmAction === "update" ? "Confirmar cambios" : 
                            confirmAction === "delete" ? "Eliminar registro" : "Errores de validación"
                        }
                        message={
                            confirmAction === "update" ? "¿Estás seguro de que quieres guardar los cambios?" :
                            confirmAction === "delete" ? "¿Estás seguro de que quieres eliminar este registro?" :
                            "Por favor, corrige los campos marcados en rojo antes de guardar."
                        }
                        onConfirm={confirmAction === "validationError" ? () => setShowConfirm(false) : handleConfirm}
                        onCancel={() => setShowConfirm(false)}
                    />
                </div>
            </div>
        </div>
    );
}
