import { useEffect, useState, type ChangeEvent } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import { useAuth } from "../commons/hooks/useAuth";
import DetailView from "../commons/props/DetailView";
import DetailEdit from "../commons/props/DetailEdit";
import ConfirmModal from "../commons/ConfirmModal";
import Forbidden from "../commons/Forbidden";
import NotFound from "../commons/NotFound";
import { getCertificateLabel, staticCertificateFields as staticCertificateConfig } from "../users/staticCertificateFields";
import UserCertificatesSection, { UserCertificatesSummarySection } from "../users/UserCertificatesSection";
import { CONOPS_CATEGORIES } from "../users/conopsCategories";

import editIcon from '../../assets/commons/edit_white.svg';
import deleteIcon from '../../assets/commons/delete_white.svg';
import arroBackIcon from '../../assets/commons/arrow_back_white.svg';
import checkIcon from '../../assets/commons/check_white.svg';
import cancelIcon from '../../assets/commons/cancel_white.svg';

interface DetailsComponentProps {
    id: string | undefined
    endpoint: string
    imageEndpoint?: string
    fields: any[]
    initialData?: any;
    allowEdit?: boolean
    allowDelete?: boolean
    onDelete?: () => Promise<void>
    onBack?: () => void
    validateForm?: (values: any) => Record<string, string | null>
    showCertificates?: boolean
}

type UserCertificate = {
    id: number;
    userId: number;
    certificateType: string;
    certificateName: string | null;
    expireDate: string | null;
    dateIndefinite: boolean | null;
};

type CertificateFieldPayload = {
    certificate: File | null;
    dateExpire: string | null;
    dateIndefinite: boolean | null;
};

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

export default function DetailsComponent({
    id,
    endpoint,
    fields,
    initialData,
    imageEndpoint,
    allowEdit,
    allowDelete,
    onDelete,
    onBack,
    validateForm,
    showCertificates = false,
}: DetailsComponentProps) {
    const { token } = useAuth();

    const [data, setData] = useState<any>(initialData || null);
    const [status, setStatus] = useState<number>(200);
    const [loading, setLoading] = useState(!initialData);
    const [editing, setEditing] = useState(false);
    const [formValues, setFormValues] = useState<any>(initialData || {});
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string | null>>({});
    const [removeImage, setRemoveImage] = useState(false);
    const [certificates, setCertificates] = useState<UserCertificate[]>([]);
    const [certificatesLoading, setCertificatesLoading] = useState(false);
    const [certificateSelectedFiles, setCertificateSelectedFiles] = useState<Record<string, File | null>>(defaultSelectedFiles);
    const [certificateFormValues, setCertificateFormValues] = useState<Record<string, string>>(defaultCertFormValues);
    const [certificateActiveChecks, setCertificateActiveChecks] = useState<Record<string, boolean>>(defaultActiveChecks);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [currentSelection, setCurrentSelection] = useState<string>("");
    const [conopsDocs, setConopsDocs] = useState<Record<string, CertificateFieldPayload>>({});
    const [existingStaticFileNames, setExistingStaticFileNames] = useState<Record<string, string>>({});
    const [existingConopsFileNames, setExistingConopsFileNames] = useState<Record<string, string>>({});

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState<"update" | "delete" | "validationError" | null>(null);

    // Cargar datos iniciales
    useEffect(() => {
        if (initialData) {
            setLoading(false);
            return;
        }
        const loadData = async () => {
            setLoading(true);
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
                setLoading(false);
            }
        };
        loadData();
    }, [id, endpoint, token, initialData]);

    // Cargar imagen y manejar limpieza
    useEffect(() => {
        let objectUrl: string | null = null;

        const loadImage = async () => {
            // Si no hay imagen en la DB o no hay endpoint, reseteamos la URL local
            if (!data?.imagePath || !imageEndpoint) {
                setImageUrl(null);
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
            }
        };

        loadImage();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [data?.imagePath, token, imageEndpoint]);

    useEffect(() => {
        if (!showCertificates || !id) {
            return;
        }

        const loadCertificates = async () => {
            setCertificatesLoading(true);
            try {
                const res = await fetch(`/api/auth/user-certificates/user/${id}`, {
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
                setCertificatesLoading(false);
            }
        };

        loadCertificates();
    }, [id, showCertificates, token]);

    useEffect(() => {
        if (!showCertificates) {
            return;
        }

        const nextChecks = { ...defaultActiveChecks };
        const nextForm = { ...defaultCertFormValues };
        const nextCategories: string[] = [];
        const nextConopsDocs: Record<string, CertificateFieldPayload> = {};
        const nextStaticNames: Record<string, string> = {};
        const nextConopsNames: Record<string, string> = {};

        certificates.forEach((certificate) => {
            const staticField = staticCertificateConfig.find((field) => field.key === certificate.certificateType);
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
            }
        });

        setCertificateSelectedFiles({ ...defaultSelectedFiles });
        setCertificateActiveChecks(nextChecks);
        setCertificateFormValues(nextForm);
        setSelectedCategories(nextCategories);
        setConopsDocs(nextConopsDocs);
        setExistingStaticFileNames(nextStaticNames);
        setExistingConopsFileNames(nextConopsNames);
        setCurrentSelection("");
    }, [certificates, showCertificates]);

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

            const res = await fetch(`/api/auth/users/images/${encodedPath}`, {
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

    const syncCertificates = async () => {
        if (!showCertificates || !id) return;

        const existingByType = new Map(certificates.map((certificate) => [certificate.certificateType, certificate]));
        const desiredTypes = new Set<string>();

        const desiredStatic = staticCertificateConfig.map((field) => ({
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
                ? `/api/auth/user-certificates/${existing.id}/upload`
                : `/api/auth/user-certificates/user/${id}/upload`;
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
                ? `/api/auth/user-certificates/${existing.id}/upload`
                : `/api/auth/user-certificates/user/${id}/upload`;
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

        for (const certificate of certificates) {
            if (!desiredTypes.has(certificate.certificateType)) {
                const res = await fetch(`/api/auth/user-certificates/${certificate.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(errorText || "Error eliminando certificado.");
                }
            }
        }

        const refreshed = await fetch(`/api/auth/user-certificates/user/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (refreshed.ok) {
            const json = (await refreshed.json()) as UserCertificate[];
            setCertificates(json);
        }
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

            if (showCertificates) {
                try {
                    await syncCertificates();
                } catch (certificateError: any) {
                    alert("Datos guardados, pero hubo un problema con certificados: " + (certificateError?.message || "Error desconocido"));
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

    if (loading) return <p className="p-4 text-center">Cargando...</p>;
    if (status === 403) return <Forbidden />;
    if (status === 404 || (!data && !loading)) return <NotFound />;
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
                                src={imageUrl || "/default-user.jpg"}
                                alt={data.username}
                                onError={(e) => ((e.target as HTMLImageElement).src = "/default-user.jpg")}
                                className="rounded me-3 d-none d-sm-block flex-shrink-0"
                                style={{ width: "110px", height: "110px", objectFit: "cover" }}
                            />

                            <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
                                {/* 1. Nombre con margen inferior para separarlo del username */}
                                <h2 className="mb-1 text-break text-start w-100 fw-bold">
                                    {data.firstName} {data.lastName}
                                </h2>

                                {/* 2. Username con margen inferior para separarlo de las etiquetas */}
                                <small className="text-muted text-start mb-2" style={{ fontSize: "0.95rem" }}>
                                    @{data.username}
                                </small>

                                {/* 3. Contenedor de etiquetas con un pequeño margen superior */}
                                <div className="d-flex align-items-center flex-wrap gap-2 mt-1">
                                    <span
                                        className="px-2 py-1 fw-bold flex-shrink-0"
                                        style={{
                                            borderRadius: "4px",
                                            fontSize: "0.85rem",
                                            border: "1px solid currentColor",
                                            ...(typeColors[data.type] || { backgroundColor: "#E5E7EB", color: "#374151" }),
                                        }}
                                    >
                                        {data.type}
                                    </span>

                                    <span
                                        className="px-2 py-1 fw-bold flex-shrink-0"
                                        style={{
                                            borderRadius: "4px",
                                            fontSize: "0.85rem",
                                            textTransform: "uppercase",
                                            border: "1px solid currentColor",
                                            ...(data.state 
                                                ? stateColors.active 
                                                : stateColors.inactive),
                                        }}
                                    >
                                        {data.state ? "Activo" : "Inactivo"}
                                    </span>
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

                        {showCertificates && !editing && (
                            <>
                                {certificatesLoading && <p className="text-muted mb-0">Cargando certificados...</p>}
                                {!certificatesLoading && (
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
                            </>
                        )}

                        {showCertificates && editing && (
                            <div className="mt-3">
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
                                    onFormDateChange={(key, value) =>
                                        setCertificateFormValues((prev) => ({ ...prev, [key]: value }))
                                    }
                                />
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
