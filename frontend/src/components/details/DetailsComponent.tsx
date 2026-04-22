import { useEffect, useState, type ChangeEvent, type Dispatch, type SetStateAction, useMemo } from "react";
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
    OTHER_AIRCRAFT_DOCUMENTATION_KEY,
    aircraftDocumentationFields,
    AIRCRAFT_SPECIFIC_KEYS,
    MODEL_SPECIFIC_KEYS,
    getVisibleAircraftDocumentationFields,
    type AdditionalDoc,
} from "../certificates/AircraftDocumentationSection";
import { getAircraftDocumentationFlags,getAircraftModelDocumentationFlags, toBooleanLike } from "../certificates/aircraftDocumentationUtils";
import {
    styles,
    getDocumentationFetchUrl,
    validateCertificateFile,
    typeColors,
    stateColors,
    USER_CERTIFICATE_DEFAULTS,
    AIRCRAFT_DOCUMENTATION_DEFAULTS,
    MODEL_DOCUMENTATION_DEFAULTS,
    // getFileNameFromPath,
    // isAdditionalCertificate,
    type DetailsComponentProps,
    type UserCertificate,
    type AircraftDocumentation,
    type AircraftModelDocumentation,
    type CertificateFieldPayload,
    type AdditionalCertificatePayload,
    type LoadingState,
    type DocumentationState,
    createEmptyDocState,
} from "./detailsUtils";

import editIcon from '../../assets/commons/edit_white.svg';
import deleteIcon from '../../assets/commons/delete_white.svg';
import arroBackIcon from '../../assets/commons/arrow_back_white.svg';
import checkIcon from '../../assets/commons/check_white.svg';
import cancelIcon from '../../assets/commons/cancel_white.svg';
import LoadingSpinner from "../commons/Loading";
import defaultUserImg from '../../../public/default-user.jpg';
import defaultDroneImg from '../../../public/default-drone.png';

export default function DetailsComponent(props: DetailsComponentProps) {
    const { token } = useAuth();
    
    // UI Logic centralizada
    const ui = useMemo(() => {
        const resolved = props.certificateSectionType ?? (props.showCertificates ? "user" : undefined);
        return {
            resolved,
            isUser: resolved === "user",
            isAircraft: resolved === "aircraft",
            isModel: resolved === "model"
        };
    }, [props.certificateSectionType, props.showCertificates]);

    // Estados de la Entidad Principal
    const [data, setData] = useState<any>(props.initialData || null);
    const [formValues, setFormValues] = useState<any>(props.initialData || {});
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState<LoadingState>({ data: true, image: false, certificates: false });

    // ESTADOS AGRUPADOS (Solo 3 objetos en lugar de 15 variables)
    const [userDocState, setUserDocState] = useState(createEmptyDocState(USER_CERTIFICATE_DEFAULTS));
    const [aircraftDocState, setAircraftDocState] = useState(createEmptyDocState(AIRCRAFT_DOCUMENTATION_DEFAULTS));
    const [modelDocState, setModelDocState] = useState(createEmptyDocState(MODEL_DOCUMENTATION_DEFAULTS));

    // Handlers genéricos (Uno para todo)
    const updateLoading = (key: keyof LoadingState, val: boolean) => 
        setLoading(prev => ({ ...prev, [key]: val }));

    const handleDocChange = (setter: typeof setUserDocState, key: keyof DocumentationState, field: string, value: any) => {
        setter(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
    };

    // Estados de Datos Crudos (API)
    const [certificates, setCertificates] = useState<UserCertificate[]>([]);
    const [aircraftDocumentations, setAircraftDocumentations] = useState<AircraftDocumentation[]>([]);
    const [aircraftModelDefaults, setAircraftModelDefaults] = useState<AircraftModelDocumentation[]>([]);

    // Estados Específicos de Secciones Dinámicas
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [conopsDocs, setConopsDocs] = useState<Record<string, CertificateFieldPayload>>({});
    const [additionalDocs, setAdditionalDocs] = useState<AdditionalCertificatePayload[]>([]);
    const [currentSelection, setCurrentSelection] = useState<string>("");

    const [status, setStatus] = useState(200);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageVersion, setImageVersion] = useState(0);

    const [existingConopsFileNames, setExistingConopsFileNames] = useState<Record<string, string>>({});
    const [existingAdditionalFileNames, setExistingAdditionalFileNames] = useState<Record<string, string>>({});

    const [aircraftDocumentationRestoreDefaults, setAircraftDocumentationRestoreDefaults] = useState<Record<string, boolean>>({});

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState<"update" | "delete" | "validationError" | null>(null);

    const [errors, setErrors] = useState<Record<string, string | null>>({});

    const [removeImage, setRemoveImage] = useState(false);


    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            updateLoading('data', true);
            const url = props.id ? `${props.endpoint}/${props.id}` : props.endpoint;
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
    }, [props.id, props.endpoint, token, props.initialData]);

    // Cargar imagen y manejar limpieza
    useEffect(() => {
        let objectUrl: string | null = null;

        const loadImage = async () => {
            updateLoading('image', true);
            if (!data?.imagePath || !props.imageEndpoint) {
                setImageUrl(null);
                updateLoading('image', false);
                return;
            }

            try {
                const res = await fetch(`${props.imageEndpoint}/${data.imagePath}?v=${imageVersion}`, {
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
    }, [data?.imagePath, token, props.imageEndpoint, imageVersion]);

    // Cargar certificados si corresponde
    useEffect(() => {
        if (!ui.isUser || !props.id) {
            return;
        }

        const loadCertificates = async () => {
            updateLoading('certificates', true);
            try {
                const res = await fetch(`/api/user-certificates/user/${props.id}`, {
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
    }, [props.id, ui.isUser, token]);

    // Sincronizar estado de certificados con los datos cargados
    useEffect(() => {
        if (!ui.isUser) return;

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

        setUserDocState({
            files: { ...USER_CERTIFICATE_DEFAULTS.files },
            checks: nextChecks,
            dates: nextForm,
            existingNames: nextStaticNames
        });

        // Actualizamos los estados dinámicos que decidimos mantener fuera
        setSelectedCategories(nextCategories);
        setConopsDocs(nextConopsDocs);
        setAdditionalDocs(nextAdditionalDocs);
        
        setExistingConopsFileNames(nextConopsNames);
        setExistingAdditionalFileNames(nextAdditionalNames);
        
        setCurrentSelection("");
    }, [certificates, ui.isUser]);

    // Cargar documentación si corresponde, tanto de aeronave como de modelo
    useEffect(() => {
        if (!props.id || !(ui.isAircraft || ui.isModel)) {
            return;
        }

        const loadDocumentations = async () => {
            updateLoading("certificates", true);
            try {
                const res = await fetch(
                    getDocumentationFetchUrl(ui.isModel ? "model" : "aircraft", props.id+""),
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
    }, [props.id, ui.isAircraft, ui.isModel, token]);

    useEffect(() => {
        if (!ui.isAircraft) {
            setAircraftModelDefaults([]);
            return;
        }

        const aircraftModelId = data?.aircraftModelId;
        if (!aircraftModelId) {
            setAircraftModelDefaults([]);
            return;
        }

        const loadModelDefaults = async () => {
            try {
                const res = await fetch(`/api/aircraft-models/${aircraftModelId}/documentation`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    setAircraftModelDefaults([]);
                    return;
                }

                const json = (await res.json()) as AircraftModelDocumentation[];
                setAircraftModelDefaults(json);
            } catch (error) {
                console.error("Error loading aircraft model default documentation:", error);
                setAircraftModelDefaults([]);
            }
        };

        loadModelDefaults();
    }, [data?.aircraftModelId, ui.isAircraft, token]);

    // Sincronizar estado de documentación con los datos cargados
    useEffect(() => {
        if (!ui.isAircraft && !ui.isModel) {
            return;
        }

        const nextChecks = { ...AIRCRAFT_DOCUMENTATION_DEFAULTS.checks };
        const nextForm = { ...AIRCRAFT_DOCUMENTATION_DEFAULTS.dates };
        const nextNames: Record<string, string> = {};

        const nextChecksModel = { ...MODEL_DOCUMENTATION_DEFAULTS.checks };
        const nextFormModel = { ...MODEL_DOCUMENTATION_DEFAULTS.dates };
        const nextNamesModel: Record<string, string> = {};
        const nextAdditionalDocs: AdditionalCertificatePayload[] = [];
        const nextAdditionalNames: Record<string, string> = {};

        const fieldMap = new Map(aircraftDocumentationFields.map(f => [f.key, f]));

        aircraftDocumentations.forEach((doc) => {
            const type = doc.documentationType;
            const config = fieldMap.get(type);
            if (!config) {
                if (ui.isAircraft) {
                    const additionalId = `existing-aircraft-doc-${doc.id}`;
                    nextAdditionalDocs.push({
                        id: additionalId,
                        existingCertificateId: doc.id,
                        label: doc.documentationType || "",
                        certificate: null,
                        dateExpire: doc.expireDate ?? null,
                        dateIndefinite: doc.dateIndefinite ?? false,
                    });

                    const filename = doc.documentationName?.split("/").pop() ?? "";
                    if (filename) {
                        nextAdditionalNames[additionalId] = filename;
                    }
                }
                return;
            }

            const filename = doc.documentationName?.split("/").pop() ?? "";
            
            // Determine target based on context, not on whether it's a model key
            // For aircraft: put everything in aircraft state (both specific and inherited from model)
            // For model: put everything in model state
            let targetChecks, targetForm, targetNames;
            
            if (ui.isAircraft && !ui.isModel) {
                // Aircraft context: all documentation goes to aircraft state
                targetChecks = nextChecks;
                targetForm = nextForm;
                targetNames = nextNames;
            } else if (ui.isModel && !ui.isAircraft) {
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

        setAircraftDocState({
            files: { ...AIRCRAFT_DOCUMENTATION_DEFAULTS.files },
            checks: nextChecks,
            dates: nextForm,
            existingNames: nextNames
        });

        setAircraftDocumentationRestoreDefaults({});

        // --- ACTUALIZACIÓN AGRUPADA DE MODELO ---
        if (ui.isAircraft) {
            setAdditionalDocs(nextAdditionalDocs);
            setExistingAdditionalFileNames(nextAdditionalNames);
        }

        setModelDocState({
            files: { ...MODEL_DOCUMENTATION_DEFAULTS.files },
            checks: nextChecksModel,
            dates: nextFormModel,
            existingNames: nextNamesModel
        });

    }, [aircraftDocumentations, ui.isAircraft, ui.isModel]);

    const handleConfirmClick = () => {
        if (props.validateForm) {
            const formErrors = props.validateForm(formValues);
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

    const handleRestoreModelDefault = (fieldFileKey: string, isModelContext: boolean = false) => {
        const fieldConfig = aircraftDocumentationFields.find(f => f.fileKey === fieldFileKey);
        if (!fieldConfig) return;

        const modelDoc = aircraftModelDefaults.find(
            doc => doc.documentationType === fieldConfig.key
        );

        if (!modelDoc || !modelDoc.documentationName) {
            alert("No se encontró el documento del modelo");
            return;
        }

        const filename = modelDoc.documentationName.split("/").pop() ?? "";

        const targetSetter = isModelContext ? setModelDocState : setAircraftDocState;

        targetSetter((prev) => ({
            ...prev,
            files: { 
                ...prev.files, 
                [fieldConfig.fileKey]: null 
            },
            dates: { 
                ...prev.dates, 
                [fieldConfig.dateKey]: modelDoc.expireDate ?? "" 
            },
            checks: {
                ...prev.checks,
                [fieldConfig.enabledKey]: true,
                [fieldConfig.indefiniteKey]: Boolean(modelDoc.dateIndefinite),
            },
            existingNames: {
                ...prev.existingNames,
                [fieldConfig.fileKey]: filename,
            }
        }));

        if (!isModelContext) {
            setAircraftDocumentationRestoreDefaults((prev) => ({
                ...prev,
                [fieldConfig.fileKey]: true,
            }));
        }
    };

    const clearAircraftRestoreFlagForStateKey = (key: string) => {
        const fieldConfig = aircraftDocumentationFields.find(
            (field) =>
                field.fileKey === key ||
                field.dateKey === key ||
                field.enabledKey === key ||
                field.indefiniteKey === key
        );

        if (!fieldConfig) {
            return;
        }

        setAircraftDocumentationRestoreDefaults((prev) => ({
            ...prev,
            [fieldConfig.fileKey]: false,
        }));
    };

    const handleAircraftDocumentationCheckChange = (key: string, isModelContext: boolean = false) => {
        const targetSetter = isModelContext ? setModelDocState : setAircraftDocState;
        
        // Toggle de valor booleano dentro del objeto agrupado
        targetSetter(prev => ({
            ...prev,
            checks: {
                ...prev.checks,
                [key]: !prev.checks[key]
            }
        }));

        if (!isModelContext) {
            clearAircraftRestoreFlagForStateKey(key);
        }
    };

    const handleCertificateCheckChange = (key: string) => {
        setUserDocState(prev => ({
            ...prev,
            checks: {
                ...prev.checks,
                [key]: !prev.checks[key]
            }
        }));
    };

    const handleAircraftDocumentationFileChange = (event: React.ChangeEvent<HTMLInputElement>, key: string, isModelContext: boolean = false) => {
        const file = event.target.files?.[0] || null;
        const targetSetter = isModelContext ? setModelDocState : setAircraftDocState;

        targetSetter(prev => {
            // Clonamos el estado previo
            const nextState = { ...prev };
            
            // Actualizamos el archivo en la sección 'files'
            nextState.files = { ...prev.files, [key]: file };

            // Si hay archivo, buscamos su config para activar el checkbox automáticamente
            const fieldConfig = aircraftDocumentationFields.find((field) => field.fileKey === key);
            if (fieldConfig && file) {
                nextState.checks = { 
                    ...prev.checks, 
                    [fieldConfig.enabledKey]: true 
                };
            }

            return nextState;
        });

        // Gestionar el flag de restauración (solo para aeronaves)
        if (!isModelContext && file) {
            setAircraftDocumentationRestoreDefaults((prev) => ({
                ...prev,
                [key]: false,
            }));
        }
    };

    const handleCertificateFileChange = (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            const fileError = validateCertificateFile(file);
            if (fileError) return alert(fileError);
        }
        
        setUserDocState(prev => ({
            ...prev,
            files: { ...prev.files, [key]: file }
        }));
    };

    const handleAircraftDocumentationClearFile = (
        key: string, 
        inputId: string, 
        isModelContext: boolean = false
    ) => {
        const targetState = isModelContext ? modelDocState : aircraftDocState;
        const targetSetter = isModelContext ? setModelDocState : setAircraftDocState;

        const hasSelectedFile = Boolean(targetState.files[key]);
        const hasExistingFile = Boolean(targetState.existingNames[key]);
        
        if (!hasSelectedFile && !hasExistingFile) return;

        if (!window.confirm("¿Desea eliminar este documento? Podrá restaurar la referencia al modelo después si lo desea.")) return;

        // Limpiar el input físico (DOM)
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) input.value = "";

        // Actualización atómica del estado
        targetSetter((prev) => {
            const nextState = { ...prev };
            const fieldConfig = aircraftDocumentationFields.find((field) => field.fileKey === key);

            // Limpiar archivo seleccionado y nombre existente
            nextState.files = { ...prev.files, [key]: null };
            nextState.existingNames = { ...prev.existingNames, [key]: "" };

            // Si encontramos la config, reseteamos checks y fechas asociados
            if (fieldConfig) {
                nextState.checks = {
                    ...prev.checks,
                    [fieldConfig.enabledKey]: false,
                    [fieldConfig.indefiniteKey]: false,
                };
                nextState.dates = {
                    ...prev.dates,
                    [fieldConfig.dateKey]: "",
                };
            }

            return nextState;
        });

        // Gestionar flag de restauración
        if (!isModelContext) {
            setAircraftDocumentationRestoreDefaults((prev) => ({
                ...prev,
                [key]: false,
            }));
        }
    };

    const handleCertificateClearFile = (key: string, inputId: string) => {
        // Limpiar input físico
        const fileInput = document.getElementById(inputId) as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";

        setUserDocState(prev => ({
            ...prev,
            files: { ...prev.files, [key]: null },
            existingNames: { ...prev.existingNames, [key]: "" }
        }));
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
                alert(fileError);
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

    const syncCertificates = async () => {
        if (!ui.isUser || !props.id) return;

        // Helpers de clasificación
        const staticKeys = new Set(staticUserCertificateConfig.map(f => f.key));
        const isConopsType = (type: string) => type.startsWith("conops_");
        const isAdditionalType = (type: string) => !staticKeys.has(type) && !isConopsType(type);

        const existingByType = new Map(certificates.map(c => [c.certificateType, c]));
        const desiredTypes = new Set<string>();
        const desiredAdditionalIds = new Set<number>();

        // FUNCIÓN GENÉRICA DE SUBIDA (Para no repetir código)
        const uploadDoc = async (type: string, file: File | null, expireDate: string | null, isIndefinite: boolean, existingId?: number) => {
            const formData = new FormData();
            formData.append("certificateType", type);
            formData.append("dateIndefinite", String(isIndefinite));
            if (expireDate && !isIndefinite) formData.append("expireDate", expireDate);
            if (file) formData.append("file", file, file.name);

            const url = existingId 
                ? `/api/user-certificates/${existingId}/upload` 
                : `/api/user-certificates/user/${props.id}/upload`;
            
            const res = await fetch(url, {
                method: existingId ? "PUT" : "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error(`Error en ${type}: ${await res.text()}`);
        };

        // PROCESAR ESTÁTICOS Y CONOPS (Agrupados en un solo loop)
        const staticDocs = staticUserCertificateConfig
            .filter(f => userDocState.checks[f.enabledKey])
            .map(f => ({
                type: f.key,
                file: userDocState.files[f.fileKey],
                date: userDocState.dates[f.dateKey],
                indefinite: userDocState.checks[f.indefiniteKey]
            }));

        const conopsList = selectedCategories.map(catId => ({
            type: `conops_${catId}`,
            file: conopsDocs[catId]?.certificate,
            date: conopsDocs[catId]?.dateExpire,
            indefinite: conopsDocs[catId]?.dateIndefinite
        }));

        for (const item of [...staticDocs, ...conopsList]) {
            desiredTypes.add(item.type);
            const existing = existingByType.get(item.type);
            const hasData = item.file || item.date || item.indefinite || existing;
            
            if (hasData) {
                await uploadDoc(item.type, item.file, item.date, !!item.indefinite, existing?.id);
            }
        }

        // PROCESAR ADICIONALES
        for (const doc of additionalDocs) {
            const existing = doc.existingCertificateId ? certificates.find(c => c.id === doc.existingCertificateId) : null;
            const type = doc.label.trim() || existing?.certificateType || `additional_${doc.id}`;
            
            if (type || doc.certificate || existing) {
                await uploadDoc(type, doc.certificate, doc.dateExpire, !!doc.dateIndefinite, existing?.id);
                if (existing) desiredAdditionalIds.add(existing.id);
            }
        }

        // LIMPIEZA (DELETES)
        const toDelete = certificates.filter(c => {
            if (isAdditionalType(c.certificateType)) return !desiredAdditionalIds.has(c.id);
            return !desiredTypes.has(c.certificateType);
        });

        for (const c of toDelete) {
            await fetch(`/api/user-certificates/${c.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
        }

        // REFRESCAR DATOS FINAL
        const refreshed = await fetch(`/api/user-certificates/user/${props.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (refreshed.ok) setCertificates(await refreshed.json());
    };

    const syncAircraftDocumentation = async () => {
        if (!ui.isAircraft || !props.id) return;

        // Obtener flags y campos visibles
        const flags = getAircraftDocumentationFlags(formValues);
        const visibleFields = getVisibleAircraftDocumentationFields(
            "aircraft",
            false, 
            flags.showInsuranceDocumentation,
            flags.showFTSDocumentation,
            flags.showParachuteDocumentation
        );

        // Mapear documentos actuales
        const allAircraftDocs = aircraftDocumentations;
        const staticAircraftDocs = allAircraftDocs.filter((d) =>
            AIRCRAFT_SPECIFIC_KEYS.has(d.documentationType) || MODEL_SPECIFIC_KEYS.has(d.documentationType)
        );
        const customAircraftDocs = allAircraftDocs.filter((d) =>
            !AIRCRAFT_SPECIFIC_KEYS.has(d.documentationType) && !MODEL_SPECIFIC_KEYS.has(d.documentationType)
        );
        const existingByType = new Map(staticAircraftDocs.map((d) => [d.documentationType, d]));
        const desiredTypes = new Set<string>();
        const desiredAdditionalIds = new Set<number>();
        const tasks: Promise<void>[] = [];

        // Procesar cada campo visible
        for (const field of visibleFields) {
            if (field.key === OTHER_AIRCRAFT_DOCUMENTATION_KEY) continue;

            const enabled = Boolean(aircraftDocState.checks[field.enabledKey]);
            if (!enabled) continue;

            desiredTypes.add(field.key);
            
            const file = aircraftDocState.files[field.fileKey];
            const expireDate = aircraftDocState.dates[field.dateKey] || null;
            const isIndefinite = Boolean(aircraftDocState.checks[field.indefiniteKey]);
            const existing = existingByType.get(field.key);
            const shouldRestore = Boolean(aircraftDocumentationRestoreDefaults[field.fileKey]);

            // CASO A: Restaurar default del modelo
            if (shouldRestore) {
                const url = existing
                    ? `/api/aircraft-documentation/${existing.id}/restore-default`
                    : `/api/aircraft-documentation/aircraft/${props.id}/restore-default?documentationType=${encodeURIComponent(field.key)}`;
                
                tasks.push(
                    fetch(url, {
                        method: "PUT",
                        headers: { Authorization: `Bearer ${token}` },
                    }).then(res => { if (!res.ok) throw new Error(`Error restaurando ${field.label}`); })
                );
                continue;
            }

            // CASO B: Es un default del modelo y no hemos subido archivo nuevo -> No hacer nada
            if (existing?.isModelDefault && !file) continue;

            // CASO C: Guardar/Actualizar
            const hasData = file || expireDate || isIndefinite || existing;
            if (hasData) {
                const formData = new FormData();
                formData.append("documentationType", field.key);
                formData.append("documentationLabel", field.label);
                formData.append("dateIndefinite", String(isIndefinite));
                if (expireDate && !isIndefinite) formData.append("expireDate", expireDate);
                if (file) formData.append("file", file, file.name);

                const url = existing 
                    ? `/api/aircraft-documentation/${existing.id}/upload` 
                    : `/api/aircraft-documentation/aircraft/${props.id}/upload`;

                tasks.push(
                    fetch(url, {
                        method: existing ? "PUT" : "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    }).then(res => { if (!res.ok) throw new Error(`Error sincronizando ${field.label}`); })
                );
            }
        }

        for (const doc of additionalDocs) {
            const label = doc.label.trim();
            const existingId = doc.existingCertificateId;
            const existing = existingId ? customAircraftDocs.find((item) => item.id === existingId) : undefined;

            if (!label) {
                throw new Error("Cada documento en 'Otros' debe tener un nombre.");
            }

            const formData = new FormData();
            formData.append("documentationType", label);
            formData.append("documentationLabel", label);
            if (doc.certificate) {
                formData.append("file", doc.certificate, doc.certificate.name);
            }

            const url = existing
                ? `/api/aircraft-documentation/${existing.id}/upload`
                : `/api/aircraft-documentation/aircraft/${props.id}/upload`;

            tasks.push(
                fetch(url, {
                    method: existing ? "PUT" : "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                }).then(res => { if (!res.ok) throw new Error(`Error sincronizando ${label}`); })
            );

            if (existingId) {
                desiredAdditionalIds.add(existingId);
            }
        }

        // Borrar documentos que ya no se desean
        for (const doc of staticAircraftDocs) {
            if (!desiredTypes.has(doc.documentationType)) {
                tasks.push(
                    fetch(`/api/aircraft-documentation/${doc.id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    }).then(res => { if (!res.ok) throw new Error(`Error borrando ${doc.documentationType}`); })
                );
            }
        }

        for (const doc of customAircraftDocs) {
            if (!desiredAdditionalIds.has(doc.id)) {
                tasks.push(
                    fetch(`/api/aircraft-documentation/${doc.id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    }).then(res => { if (!res.ok) throw new Error(`Error borrando ${doc.documentationType}`); })
                );
            }
        }

        // Ejecutar todo y refrescar
        if (tasks.length > 0) await Promise.all(tasks);
        
        await loadAircraftDocumentations(); // Asegúrate de que esta función esté definida
        setAircraftDocumentationRestoreDefaults({});
    };

    const syncAircraftModelDocumentation = async () => {
        if (!ui.isModel || !props.id) return;

        // Obtener visibilidad específica para el modelo
        const flags = getAircraftModelDocumentationFlags(formValues);
        const visibleFields = getVisibleAircraftDocumentationFields(
            "model",
            false,
            flags.showInsuranceDocumentation,
            flags.showFTSDocumentation,
            flags.showParachuteDocumentation
        );

        // Mapear documentos existentes (solo los que pertenecen al modelo)
        const modelDocs = aircraftDocumentations.filter(d => MODEL_SPECIFIC_KEYS.has(d.documentationType));
        const existingByType = new Map(modelDocs.map((d) => [d.documentationType, d]));
        const desiredTypes = new Set<string>();
        const tasks: Promise<void>[] = [];

        // Procesar campos visibles usando el nuevo modelDocState
        for (const field of visibleFields) {
            const enabled = Boolean(modelDocState.checks[field.enabledKey]);
            if (!enabled) continue;

            desiredTypes.add(field.key);
            
            const file = modelDocState.files[field.fileKey];
            const expireDate = modelDocState.dates[field.dateKey] || null;
            const isIndefinite = Boolean(modelDocState.checks[field.indefiniteKey]);
            const existing = existingByType.get(field.key);

            const hasData = file || expireDate || isIndefinite || existing;
            
            if (hasData) {
                const formData = new FormData();
                formData.append("documentationType", field.key);
                formData.append("documentationLabel", field.label);
                formData.append("dateIndefinite", String(isIndefinite));
                
                if (expireDate && !isIndefinite) {
                    formData.append("expireDate", expireDate);
                }
                if (file) {
                    formData.append("file", file, file.name);
                }

                const url = existing 
                    ? `/api/aircraft-model-documentation/${existing.id}/upload` 
                    : `/api/aircraft-model-documentation/model/${props.id}/upload`;

                tasks.push(
                    fetch(url, {
                        method: existing ? "PUT" : "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    }).then(res => { 
                        if (!res.ok) throw new Error(`Error sincronizando modelo: ${field.label}`); 
                    })
                );
            }
        }

        // Eliminación de documentos que ya no están marcados
        for (const doc of modelDocs) {
            if (!desiredTypes.has(doc.documentationType)) {
                tasks.push(
                    fetch(`/api/aircraft-model-documentation/${doc.id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    }).then(res => {
                        if (!res.ok) throw new Error(`Error eliminando doc de modelo: ${doc.documentationType}`);
                    })
                );
            }
        }

        // Ejecución y refresco
        if (tasks.length > 0) await Promise.all(tasks);
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
        if (!props.id || !(ui.isAircraft || ui.isModel)) {
            return;
        }

        try {
            const res = await fetch(
                getDocumentationFetchUrl(ui.isModel ? "model" : "aircraft", props.id),
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

        const numericFields = [
            "mtom", "wingspan", "maxSpeed", "impactEnergy", 
            "mtomDefault", "wingspanDefault", "maxSpeedDefault", "impactEnergyDefault"
        ];
        const booleanFields = [
            "state", "hasCamera", "privatelyBuilt", "hasParachute", "hasEnsurance", "hasFTS",
            "hasCameraDefault", "privatelyBuiltDefault", "hasParachuteDefault", "hasEnsuranceDefault", "hasFTSDefault"
        ];
        const clearableFieldKeys = ["accessories", ...(props.clearableFieldKeys || [])];

        const isNumericField = (key: string) => numericFields.includes(key);
        const isBooleanField = (key: string) => booleanFields.includes(key);

        const normalizeCautiveValue = (val: string) => {
            const n = val.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z]/g, "");
            if (n.startsWith("s") || n === "yes") return "YES";
            if (n.startsWith("n") || n === "no") return "NO";
            if (n.startsWith("opc")) return "OPTIONAL";
            return val;
        };

        if (confirmAction === "delete") {
            if (props.onDelete) await props.onDelete();
            setConfirmAction(null);
            return;
        }

        if (confirmAction !== "update") return;

        
        try {
            const formData = new FormData();
            const imageField = props.fields.find(f => f.type === 'file');

            if (imageField) {
                const file = formValues[imageField.key];
                if (file instanceof File && file.size > 0) {
                    formData.append(imageField.key, file);
                    formData.append("removeImage", "false");
                } else {
                    formData.append("removeImage", removeImage ? "true" : "false");
                }
            }

            props.fields.forEach((field) => {
                if (field.type === 'file' || field.readOnly) return;

                const value = formValues[field.key];
                const isCleared = value === null || value === undefined || value.toString().trim() === "";

                const isClearable = clearableFieldKeys.includes(field.key) || 
                    (props.entityType === "aircraft" && ["privatelyBuilt", "hasParachute", "hasEnsurance", "hasFTS", "cautive", "accessories"].includes(field.key));

                if (isCleared) {
                    if (isClearable) formData.append(field.key, "");
                    return;
                }

                if (Array.isArray(value)) {
                    value.forEach((item) => {
                        if (item !== null && item !== undefined && item.toString().trim() !== "") {
                            formData.append(field.key, item.toString().trim());
                        }
                    });
                    return;
                }

                let finalValue = value.toString().trim();

                if (isBooleanField(field.key)) {
                    const parsed = toBooleanLike(value);
                    if (parsed === null) return;
                    finalValue = parsed ? "true" : "false";
                }

                if (field.key.startsWith("cautive")) {
                    finalValue = normalizeCautiveValue(finalValue);
                }

                if (isNumericField(field.key)) {
                    finalValue = finalValue.replace(",", ".");
                }

                formData.append(field.key, finalValue);
            });

            const res = await fetch(`${props.endpoint}/${props.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                let errorMessage = "Error desconocido";
                const fieldErrors: Record<string, string | null> = {};

                try {
                    const json = JSON.parse(errorText);
                    if (json.message) {
                        errorMessage = json.message;
                    }
                    if (json.fields && typeof json.fields === "object") {
                        Object.entries(json.fields).forEach(([key, value]) => {
                            fieldErrors[key] = typeof value === "string" ? value : String(value ?? "");
                        });
                    }
                } catch {
                    errorMessage = errorText || errorMessage;
                }

                if (res.status === 409 && /usuario|username/i.test(errorMessage)) {
                    fieldErrors.username = "El nombre de usuario ya está en uso. Por favor, elige otro.";
                }

                if (Object.keys(fieldErrors).length > 0) {
                    setErrors(prev => ({ ...prev, ...fieldErrors }));
                    return;
                }

                throw new Error(errorMessage);
            }
            const updated = await res.json();

            const syncTasks = [];
            if (ui.isUser) syncTasks.push(syncCertificates());
            if (ui.isAircraft) syncTasks.push(syncAircraftDocumentation());
            if (ui.isModel) syncTasks.push(syncAircraftModelDocumentation());

            const syncResults = await Promise.allSettled(syncTasks);
            if (syncResults.some(r => r.status === 'rejected')) {
                alert("Atención: Los datos principales se guardaron, pero algunos documentos fallaron al sincronizarse.");
            }

            if (updated.fechaNac) updated.fechaNac = updated.fechaNac.split('T')[0];
            
            setData(updated);
            setFormValues(updated);
            setRemoveImage(false);
            setEditing(false);
            
            if (imageField && formValues[imageField.key] instanceof File) {
                setImageVersion(v => v + 1);
            }
            if (!updated.imagePath) setImageUrl(null);

        } catch (error: any) {
            alert("Error actualizando: " + (error.message || "Error desconocido"));
        } finally {
            // updateLoading("details", false);
            setConfirmAction(null);
        }
    };

    const profileInfo = useMemo(() => {
        // Determinamos el título y subtítulo según la entidad
        const isUser = props.entityType === "user";
        const title = isUser ? `${data?.firstName || ""} ${data?.lastName || ""}` : (data?.model || "Sin nombre");
        const subtitle = isUser ? data?.email : data?.serialNumber;

        return {
            title: title.trim(),
            subtitle,
            typeLabel: isUser && Array.isArray(data?.roles) ? data.roles.join(", ") : undefined,
            stateLabel: isUser ? (data?.state ? "Activo" : "Inactivo") : undefined,
            classLabel: props.entityType === "aircraft" ? data?.aircraftClass : undefined,
            img: props.defaultImage === "user" ? defaultUserImg : defaultDroneImg
        };
    }, [props.entityType, data, props.defaultImage]);

    const docFlags = useMemo(() => ({
        aircraft: getAircraftDocumentationFlags(formValues),
        model: getAircraftModelDocumentationFlags(formValues)
    }), [formValues]);

    const modelDefaults = useMemo(() => {
        return aircraftModelDefaults.reduce((acc, doc) => {
            if (!MODEL_SPECIFIC_KEYS.has(doc.documentationType)) return acc;

            acc.checks[doc.documentationType] = true;

            if (doc.documentationName) {
                const field = aircraftDocumentationFields.find(f => f.key === doc.documentationType);
                if (field) {
                    acc.fileNames[field.fileKey] = doc.documentationName.split("/").pop() ?? "";
                }
            }
            return acc;
        }, { fileNames: {} as Record<string, string>, checks: {} as Record<string, boolean> });
    }, [aircraftModelDefaults]);

    const isAnythingLoading = Object.values(loading).some(v => v === true);

    if (isAnythingLoading) {
        return <LoadingSpinner message="Sincronizando datos..." />;
    }
    if (status === 403) return <Forbidden />;
    if (status === 404 || (!data && !loading.data)) return <NotFound />;
    if (status >= 500) return <div className="text-center p-5">Error interno del servidor</div>;

    // Renderiza la sección de visualización de documentos (Modo Lectura)
    const renderReadOnlyDocumentation = (
        resolvedType: any,
        showCerts: boolean
    ) => {
        if (!resolvedType || editing) return null;
        
        if ((loading as LoadingState).certificates) {
            return <p className="text-muted mb-0">Cargando certificados...</p>;
        }

        return (
            <>
                {showCerts && (
                    <UserCertificatesSummarySection
                        items={certificates.map((c) => ({
                            id: c.id,
                            certificateType: getCertificateLabel(c.certificateType),
                            expireDate: formatCertificateDate(c),
                            dateIndefinite: c.dateIndefinite,
                            hasFile: Boolean(c.certificateName),
                            onOpen: c.certificateName ? () => openCertificate(c) : undefined,
                        }))}
                    />
                )}
                {(ui.isAircraft || ui.isModel) && (
                    <AircraftDocumentationSummarySection
                        items={aircraftDocumentations.map((doc) => {
                            const config = aircraftDocumentationFields.find(f => f.key === doc.documentationType);
                            return {
                                key: doc.id.toString(),
                                certificateType: config?.label || doc.documentationType,
                                expireDate: formatAircraftDocumentationDate(doc),
                                dateIndefinite: doc.dateIndefinite ?? false,
                                hasFile: Boolean(doc.documentationName),
                                onOpen: doc.documentationName ? () => openAircraftDocumentation(doc) : undefined,
                                isModelDefault: doc.isModelDefault ?? false,
                            };
                        })}
                    />
                )}
            </>
        );
    };

    // Renderiza los botones de acción (Footer)
    const renderActionButtons = (canEdit?: boolean, canDelete?: boolean) => (
        <div className="d-flex gap-2 mt-3">
            {!editing ? (
                <>
                    {canEdit && (
                        <button className="btn btn-primary" onClick={() => setEditing(true)}>
                            <img src={editIcon} alt="Edit" className="edit-icon d-inline d-sm-none" />
                            <span className="d-none d-sm-block">Editar</span>
                        </button>
                    )}
                    {canDelete && props.onDelete && (
                        <button className="btn btn-danger" onClick={handleConfirmDelete}>
                            <img src={deleteIcon} alt="Delete" className="delete-icon d-inline d-sm-none" />
                            <span className="d-none d-sm-block">Borrar</span>
                        </button>
                    )}
                </>
            ) : (
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
    );

    return (
        <div className="container-fluid py-4">
            <div className="card p-4 shadow-sm">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex align-items-start mb-4">
                            
                            {/* BOTÓN VOLVER */}
                            {props.onBack && (
                                <button 
                                    className="btn d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                                    onClick={props.onBack}
                                    style={styles.backBtn}
                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 130, 69, 0.1)")}
                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                    title="Volver"
                                >
                                    <img src={arroBackIcon} alt="Back" style={styles.backIcon} />
                                </button>
                            )}

                            {/* IMAGEN DE PERFIL */}
                            <img
                                src={imageUrl || profileInfo.img}
                                alt={profileInfo.title}
                                onError={(e) => { (e.target as HTMLImageElement).src = profileInfo.img; }}
                                className="rounded me-3 d-none d-sm-block flex-shrink-0"
                                style={styles.profileImg}
                            />

                            {/* CONTENIDO TEXTUAL */}
                            <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
                                <h2 className="mb-1 text-break text-start w-100 fw-bold">
                                    {profileInfo.title}
                                </h2>

                                {profileInfo.subtitle && (
                                    <small className="text-muted text-start mb-2" style={{ fontSize: "0.95rem" }}>
                                        {profileInfo.subtitle}
                                    </small>
                                )}
                                
                                <div className="d-flex align-items-center flex-wrap gap-2 mt-1">
                                    {/* BADGE TIPO */}
                                    {profileInfo.typeLabel && (
                                        <span className="px-2 py-1 fw-bold flex-shrink-0"
                                            style={{
                                                ...styles.badge,
                                                ...(typeColors[profileInfo.typeLabel] || { backgroundColor: "#E5E7EB", color: "#374151" })
                                            }}
                                        >
                                            {profileInfo.typeLabel}
                                        </span>
                                    )}

                                    {/* BADGE ESTADO */}
                                    {profileInfo.stateLabel && (
                                        <span className="px-2 py-1 fw-bold flex-shrink-0"
                                            style={{
                                                ...styles.badge,
                                                textTransform: "uppercase",
                                                // Usamos la lógica de data.state para el color
                                                ...(data.state ? stateColors.active : stateColors.inactive)
                                            }}
                                        >
                                            {profileInfo.stateLabel}
                                        </span>
                                    )}

                                    {/* BADGE CLASE (Aeronave) - AHORA USA EL MEMO */}
                                    {profileInfo.classLabel && (
                                        <span className="px-2 py-1 fw-bold flex-shrink-0"
                                            style={{
                                                ...styles.badge,
                                                backgroundColor: "#E0F2FE",
                                                color: "#075985"
                                            }}
                                        >
                                            Clase {profileInfo.classLabel}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-12">
                            {/* SECCIÓN DATOS BÁSICOS */}
                            {!editing ? (
                                <DetailView data={data} fields={props.fields} />
                            ) : (
                                <DetailEdit
                                    values={formValues}
                                    setValues={setFormValues}
                                    fields={props.fields}
                                    errors={errors}
                                    removeImage={removeImage}
                                    setRemoveImage={setRemoveImage}
                                />
                            )}

                            {/* SECCIÓN DOCUMENTACIÓN LECTURA */}
                            {renderReadOnlyDocumentation(ui.resolved, ui.isUser)}

                            {/* SECCIÓN DOCUMENTACIÓN EDICIÓN */}
                            {ui.resolved && editing && (
                                <div className="mt-3">
                                    {/* SECCIÓN USUARIO */}
                                    {ui.isUser && (
                                        <UserCertificatesSection
                                            activeChecks={userDocState.checks}
                                            selectedFiles={userDocState.files}
                                            formValues={userDocState.dates}
                                            // USANDO TUS FUNCIONES:
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
                                            existingStaticFileNames={userDocState.existingNames}
                                            existingConopsFileNames={existingConopsFileNames}
                                            additionalDocs={additionalDocs}
                                            onAddAdditionalDoc={handleAddAdditionalDoc}
                                            onRemoveAdditionalDoc={handleRemoveAdditionalDoc}
                                            onAdditionalFieldChange={handleAdditionalFieldChange}
                                            existingAdditionalFileNames={existingAdditionalFileNames}
                                            onFormDateChange={(k, v) => handleDocChange(setUserDocState, 'dates', k, v)}
                                        />
                                    )}

                                    {/* SECCIÓN AERONAVE O MODELO */}
                                    {(ui.isAircraft || ui.isModel) && (
                                        <AircraftDocumentationSection
                                            context={ui.isAircraft ? "aircraft" : "model"}
                                            isExistingModel={false}
                                            showInsuranceDocumentation={(ui.isAircraft ? docFlags.aircraft : docFlags.model).showInsuranceDocumentation}
                                            showFTSDocumentation={(ui.isAircraft ? docFlags.aircraft : docFlags.model).showFTSDocumentation}
                                            showParachuteDocumentation={(ui.isAircraft ? docFlags.aircraft : docFlags.model).showParachuteDocumentation}
                                            onlyInsuranceHasDates={true}
                                            activeChecks={ui.isAircraft ? aircraftDocState.checks : modelDocState.checks}
                                            selectedFiles={ui.isAircraft ? aircraftDocState.files : modelDocState.files}
                                            formValues={ui.isAircraft ? aircraftDocState.dates : modelDocState.dates}
                                            existingFileNames={ui.isAircraft ? aircraftDocState.existingNames : modelDocState.existingNames}
                                            modelDefaultFileNames={modelDefaults.fileNames}

                                            // USANDO TUS FUNCIONES CON EL CONTEXTO CORRECTO:
                                            onToggleCheck={(id) => handleAircraftDocumentationCheckChange(id, ui.isModel)}
                                            onFileChange={(e, id) => handleAircraftDocumentationFileChange(e, id, ui.isModel)}
                                            onClearFile={(id, inputId) => handleAircraftDocumentationClearFile(id, inputId, ui.isModel)}
                                            
                                            onFormDateChange={(k, v) => {
                                                const setter = ui.isAircraft ? setAircraftDocState : setModelDocState;
                                                handleDocChange(setter, 'dates', k, v);
                                                if (ui.isAircraft) clearAircraftRestoreFlagForStateKey(k);
                                            }}
                                            modelDefaultByType={modelDefaults.checks}
                                            onRestoreModelDefault={handleRestoreModelDefault}
                                            additionalDocs={ui.isAircraft ? additionalDocs : []}
                                            existingAdditionalFileNames={ui.isAircraft ? existingAdditionalFileNames : {}}
                                            onAddAdditionalDoc={ui.isAircraft ? handleAddAdditionalDoc : undefined}
                                            onRemoveAdditionalDoc={ui.isAircraft ? handleRemoveAdditionalDoc : undefined}
                                            onAdditionalFieldChange={ui.isAircraft ? handleAdditionalFieldChange as (id: string, field: keyof AdditionalDoc, value: any) => void : undefined}
                                        />
                                    )}
                                </div>
                            )}

                            {/* BOTONES DE ACCIÓN */}
                            {renderActionButtons(props.allowEdit, props.allowDelete)}
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
