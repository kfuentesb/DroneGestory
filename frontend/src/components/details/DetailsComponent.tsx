import { useEffect, useState, type ChangeEvent } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
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
    getVisibleAircraftDocumentationFields,
} from "../certificates/AircraftDocumentationSection";

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
    certificateSectionType?: "user" | "aircraft"
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
    aircraftId: number;
    documentationType: string;
    documentationName: string | null;
    expireDate: string | null;
    dateIndefinite: boolean | null;
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

const defaultSelectedFiles: Record<string, File | null> = {
    fileA1A3: null,
    fileA2: null,
    fileSTS: null,
    fileFTG: null,
    fileFPG: null,
    fileCT: null,
    fileCP: null,
    fileCMC2: null,
    fileCMCLAPL: null,
};

const defaultCertFormValues: Record<string, string> = {
    dateA1A3: "",
    dateA2: "",
    dateSTS: "",
    dateFTG: "",
    dateFPG: "",
    dateCT: "",
    dateCP: "",
    dateCMC2: "",
    dateCMCLAPL: "",
};

const defaultActiveChecks: Record<string, boolean> = {
    chkA1A3: false,
    chkA2: false,
    chkSTS01: false,
    chkSTS02: false,
    chkFormcnTeoricaGen: false,
    chkFormcnPracticaGen: false,
    chkFormCertTeor: false,
    chkFormCertPract: false,
    chkFormCMClase2: false,
    chkFormCMClaseLAPL: false,
    indefiniteA1A3: false,
    indefiniteA2: false,
    indefiniteSTS: false,
    indefiniteFTG: false,
    indefiniteFPG: false,
    indefiniteCT: false,
    indefiniteCP: false,
    indefiniteCMC2: false,
    indefiniteCMCLAPL: false,
};

const defaultAircraftSelectedFiles: Record<string, File | null> = Object.fromEntries(
    aircraftDocumentationFields.map((field) => [field.fileKey, null])
) as Record<string, File | null>;

const defaultAircraftFormValues: Record<string, string> = Object.fromEntries(
    aircraftDocumentationFields.map((field) => [field.dateKey, ""])
) as Record<string, string>;

const defaultAircraftChecks: Record<string, boolean> = Object.fromEntries(
    aircraftDocumentationFields.flatMap((field) => [
        [field.enabledKey, false],
        [field.indefiniteKey, false],
    ])
) as Record<string, boolean>;

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
}: DetailsComponentProps) {
    const { token } = useAuth();
    const resolvedCertificateSectionType = certificateSectionType ?? (showCertificates ? "user" : undefined);
    const showUserCertificates = resolvedCertificateSectionType === "user";
    const showAircraftCertificates = resolvedCertificateSectionType === "aircraft";

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
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [removeImage, setRemoveImage] = useState(false);
    const [certificates, setCertificates] = useState<UserCertificate[]>([]);
    const [aircraftDocumentations, setAircraftDocumentations] = useState<AircraftDocumentation[]>([]);
    const [certificateSelectedFiles, setCertificateSelectedFiles] = useState<Record<string, File | null>>(defaultSelectedFiles);
    const [certificateFormValues, setCertificateFormValues] = useState<Record<string, string>>(defaultCertFormValues);
    const [certificateActiveChecks, setCertificateActiveChecks] = useState<Record<string, boolean>>(defaultActiveChecks);
    const [aircraftDocumentationFiles, setAircraftDocumentationFiles] = useState<Record<string, File | null>>(defaultAircraftSelectedFiles);
    const [aircraftDocumentationFormValues, setAircraftDocumentationFormValues] = useState<Record<string, string>>(defaultAircraftFormValues);
    const [aircraftDocumentationChecks, setAircraftDocumentationChecks] = useState<Record<string, boolean>>(defaultAircraftChecks);
    const [existingAircraftDocumentationFileNames, setExistingAircraftDocumentationFileNames] = useState<Record<string, string>>({});
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
                const res = await fetch(`${imageEndpoint}/${data.imagePath}`, {
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
    }, [data?.imagePath, token, imageEndpoint]);

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

    useEffect(() => {
        if (!showUserCertificates) {
            return;
        }

        const nextChecks = { ...defaultActiveChecks };
        const nextForm = { ...defaultCertFormValues };
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

        setCertificateSelectedFiles({ ...defaultSelectedFiles });
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

    useEffect(() => {
        if (!showAircraftCertificates || !id) {
            return;
        }

        const loadAircraftDocumentations = async () => {
            updateLoading("certificates", true);
            try {
                const res = await fetch(`/api/aircraft-documentation/aircraft/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    setAircraftDocumentations([]);
                    return;
                }

                const json = (await res.json()) as AircraftDocumentation[];
                setAircraftDocumentations(json);
            } catch (error) {
                console.error("Error loading aircraft documentations:", error);
                setAircraftDocumentations([]);
            } finally {
                updateLoading("certificates", false);
            }
        };

        loadAircraftDocumentations();
    }, [id, showAircraftCertificates, token]);

    useEffect(() => {
        if (!showAircraftCertificates) {
            return;
        }

        const nextChecks = { ...defaultAircraftChecks };
        const nextForm = { ...defaultAircraftFormValues };
        const nextNames: Record<string, string> = {};

        aircraftDocumentations.forEach((documentation) => {
            const config = aircraftDocumentationFields.find((field) => field.key === documentation.documentationType);
            if (!config) {
                return;
            }

            nextChecks[config.enabledKey] = true;
            nextChecks[config.indefiniteKey] = Boolean(documentation.dateIndefinite);
            nextForm[config.dateKey] = documentation.expireDate ?? "";

            const filename = documentation.documentationName?.split("/").pop() ?? "";
            if (filename) {
                nextNames[config.fileKey] = filename;
            }
        });

        setAircraftDocumentationFiles({ ...defaultAircraftSelectedFiles });
        setAircraftDocumentationChecks(nextChecks);
        setAircraftDocumentationFormValues(nextForm);
        setExistingAircraftDocumentationFileNames(nextNames);
    }, [aircraftDocumentations, showAircraftCertificates]);

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

    const handleCertificateCheckChange = (key: string) => {
        setCertificateActiveChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const validateCertificateFile = (file: File): string | null => {
        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return "Solo PDF, JPG, PNG o WEBP.";
        }
        if (file.size > 5 * 1024 * 1024) {
            return "El archivo debe pesar menos de 5MB.";
        }
        return null;
    };

    const handleCertificateFileChange = (event: ChangeEvent<HTMLInputElement>, key: string) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) {
            setCertificateSelectedFiles((prev) => ({ ...prev, [key]: null }));
            return;
        }

        const fileError = validateCertificateFile(file);
        if (fileError) {
            alert(fileError);
            return;
        }
        setCertificateSelectedFiles((prev) => ({ ...prev, [key]: file }));
    };

    const handleCertificateClearFile = (key: string, inputId: string) => {
        setCertificateSelectedFiles((prev) => ({ ...prev, [key]: null }));
        const fileInput = document.getElementById(inputId) as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
    };

    const handleAircraftDocumentationCheckChange = (key: string) => {
        setAircraftDocumentationChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAircraftDocumentationFileChange = (event: ChangeEvent<HTMLInputElement>, key: string) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) {
            setAircraftDocumentationFiles((prev) => ({ ...prev, [key]: null }));
            return;
        }

        const fileError = validateCertificateFile(file);
        if (fileError) {
            alert(fileError);
            return;
        }

        setAircraftDocumentationFiles((prev) => ({ ...prev, [key]: file }));
    };

    const handleAircraftDocumentationClearFile = (key: string, inputId: string) => {
        setAircraftDocumentationFiles((prev) => ({ ...prev, [key]: null }));
        const fileInput = document.getElementById(inputId) as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
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
        if (!showAircraftCertificates || !id) return;

        const isTruthy = (value: unknown) =>
            value === true || value === "true" || value === "YES" || value === "Si" || value === "S\u00ed";

        const showInsuranceDocumentation = isTruthy(formValues.hasEnsurance);
        const showFTSDocumentation = isTruthy(formValues.hasFTS);
        const showParachuteDocumentation = isTruthy(formValues.hasParachute);
        const visibleFields = getVisibleAircraftDocumentationFields(
            false,
            showInsuranceDocumentation,
            showFTSDocumentation,
            showParachuteDocumentation
        );

        const existingByType = new Map(
            aircraftDocumentations.map((documentation) => [documentation.documentationType, documentation])
        );
        const desiredTypes = new Set<string>();

        for (const field of visibleFields) {
            const enabled = Boolean(aircraftDocumentationChecks[field.enabledKey]);
            const file = aircraftDocumentationFiles[field.fileKey];
            const expireDate = aircraftDocumentationFormValues[field.dateKey] || null;
            const dateIndefinite = Boolean(aircraftDocumentationChecks[field.indefiniteKey]);
            const existing = existingByType.get(field.key);

            if (enabled) {
                desiredTypes.add(field.key);
            }

            const shouldPersist = enabled && (Boolean(file) || Boolean(expireDate) || dateIndefinite || Boolean(existing));
            if (!shouldPersist) {
                continue;
            }

            const formData = new FormData();
            formData.append("documentationType", field.key);
            formData.append("documentationLabel", field.label);
            if (expireDate && !dateIndefinite) formData.append("expireDate", expireDate);
            formData.append("dateIndefinite", dateIndefinite ? "true" : "false");
            if (file) formData.append("file", file, file.name);

            const url = existing
                ? `/api/aircraft-documentation/${existing.id}/upload`
                : `/api/aircraft-documentation/aircraft/${id}/upload`;
            const method = existing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Error guardando documentación de aeronave.");
            }
        }

        for (const documentation of aircraftDocumentations) {
            if (!desiredTypes.has(documentation.documentationType)) {
                const res = await fetch(`/api/aircraft-documentation/${documentation.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText || "Error eliminando documentación de aeronave.");
                }
            }
        }

        const refreshed = await fetch(`/api/aircraft-documentation/aircraft/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (refreshed.ok) {
            const json = (await refreshed.json()) as AircraftDocumentation[];
            setAircraftDocumentations(json);
        }
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

            const res = await fetch(`/api/aircraft/images/${encodedPath}`, {
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
                if (value === null || value === undefined || value.toString().trim() === "") return;
                const stringValue = value.toString().trim();
                const isNumericField = ["mtom", "wingspan", "maxSpeed", "impactEnergy"].includes(field.key);
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

            if (showAircraftCertificates) {
                try {
                    await syncAircraftDocumentation();
                } catch (documentationError: any) {
                    alert("Datos guardados, pero hubo un problema con documentación: " + (documentationError?.message || "Error desconocido"));
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

    const typeColors: Record<string, { backgroundColor: string; color: string }> = {
        ADMIN: { backgroundColor: "#FEE2E2", color: "#991B1B" },
        MANAGER: { backgroundColor: "#E0F2FE", color: "#075985" },
        PILOT: { backgroundColor: "#E6F4EC", color: "#1F6B43" },
    };

    const stateColors = {
        active: { backgroundColor: "#DCFCE7", color: "#166534" },
        inactive: { backgroundColor: "#F3F4F6", color: "#374151" }
    };

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
                        <div className="col-md-8 col-12">
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

                                        {showAircraftCertificates && (
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

                                {showAircraftCertificates && (
                                    <AircraftDocumentationSection
                                        isExistingModel={false}
                                        showInsuranceDocumentation={
                                            formValues.hasEnsurance === true || formValues.hasEnsurance === "true"
                                        }
                                        showFTSDocumentation={
                                            formValues.hasFTS === true || formValues.hasFTS === "true"
                                        }
                                        showParachuteDocumentation={
                                            formValues.hasParachute === true || formValues.hasParachute === "true"
                                        }
                                        activeChecks={aircraftDocumentationChecks}
                                        selectedFiles={aircraftDocumentationFiles}
                                        formValues={aircraftDocumentationFormValues}
                                        existingFileNames={existingAircraftDocumentationFileNames}
                                        onToggleCheck={handleAircraftDocumentationCheckChange}
                                        onFileChange={handleAircraftDocumentationFileChange}
                                        onClearFile={handleAircraftDocumentationClearFile}
                                        onFormDateChange={(key, value) =>
                                            setAircraftDocumentationFormValues((prev) => ({ ...prev, [key]: value }))
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
                            {/* {!editing && onBack && (
                                <button className="btn btn-secondary" onClick={onBack}>
                                    <img src={arroBackIcon} alt="Back" className="arrow-back-icon d-inline d-sm-none ms-2" />
                                    <span className="d-none d-sm-block">Volver</span>
                                </button>
                            )} */}
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
