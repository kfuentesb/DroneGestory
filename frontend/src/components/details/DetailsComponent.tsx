import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import { useAuth } from "../commons/hooks/useAuth";
import DetailView from "../commons/props/DetailView";
import DetailEdit from "../commons/props/DetailEdit";
import ConfirmModal from "../commons/ConfirmModal";
import Forbidden from "../commons/Forbidden";
import NotFound from "../commons/NotFound";

import editIcon from '../../assets/edit_white.svg';
import deleteIcon from '../../assets/delete_white.svg';
import arroBackIcon from '../../assets/arrow_back_white.svg';
import checkIcon from '../../assets/check_white.svg';
import cancelIcon from '../../assets/cancel_white.svg';

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
}

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

    return (
        <div className="container-fluid py-4">
            <div className="card p-4 shadow-sm">
                <div className="row">
                    <div className="col-md-8 col-12">
                        <div className="d-flex align-items-center mb-4 flex-wrap">
                            <img
                                src={imageUrl || "/default-user.jpg"}
                                alt={data.username}
                                onError={(e) => ((e.target as HTMLImageElement).src = "/default-user.jpg")}
                                className="rounded me-3 d-none d-sm-block"
                                style={{ width: "90px", height: "90px", objectFit: "cover" }}
                            />

                            <div className="d-flex flex-column">
                                <div className="d-flex align-items-center flex-wrap">
                                    <h2 className="me-3 mb-0">
                                        {data.firstName} {data.lastName}
                                    </h2>
                                    <span
                                        className="px-2 py-1 fw-bold"
                                        style={{
                                            borderRadius: "4px",
                                            fontSize: "0.9rem",
                                            ...(typeColors[data.type] || { backgroundColor: "#E5E7EB", color: "#374151" }),
                                        }}
                                    >
                                        {data.type}
                                    </span>
                                </div>
                                <small className="text-muted text-start">@{data.username}</small>
                            </div>
                        </div>

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
                            {!editing && onBack && (
                                <button className="btn btn-secondary" onClick={onBack}>
                                    <img src={arroBackIcon} alt="Back" className="arrow-back-icon d-inline d-sm-none ms-2" />
                                    <span className="d-none d-sm-block">Volver</span>
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
