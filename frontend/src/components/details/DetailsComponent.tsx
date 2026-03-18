import React, { useEffect, useState } from "react";
import { useAuth } from "../commons/hooks/useAuth";
import DetailView from "../commons/props/DetailView";
import DetailEdit from "../commons/props/DetailEdit";
import ConfirmModal from "../commons/ConfirmModal";

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

    allowEdit?: boolean
    allowDelete?: boolean

    onDelete?: () => Promise<void>
    onBack?: () => void

    validateForm?: (values: any) => Record<string, string | null>
    // Linea para elegir la posición de la imagen
    imageSide?: "right" | "left", 
}
export default function DetailsComponent({
        id,
        endpoint,
        fields,
        imageEndpoint,
        allowEdit,
        allowDelete,
        onDelete,
        onBack,
        validateForm,
        imageSide = "left", // Default: left
    }:DetailsComponentProps) {
    const { token } = useAuth();

    const [data, setData] = useState<any>(null);
    const [editing, setEditing] = useState(false);
    const [formValues, setFormValues] = useState<any>({});
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string | null>>({});

    useEffect(() => {
        const loadData = async () => {
            const url = id ? `${endpoint}/${id}` : endpoint;
            const res = await fetch(url, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) return;

            const json = await res.json();
            setData(json);
            setFormValues(json);
        };

        loadData();
    }, [id, endpoint, token]);

    useEffect(() => {

        let objectUrl: string | null = null;

        const loadImage = async () => {
            if (!data?.imagePath || !imageEndpoint) return;

            const res = await fetch(`${imageEndpoint}/${data.imagePath}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) return;

            const blob = await res.blob();
            objectUrl = URL.createObjectURL(blob);
            setImageUrl(objectUrl);
        };

        loadImage();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };

    }, [data?.imagePath, token, imageEndpoint]);

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState<"update" | "delete" | "validationError" | null>(null);


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

            // Build FormData
            const formData = new FormData();
            const allowedKeys = new Set(fields.map((f) => f.key));
            if (formValues?.imageFile instanceof File) {
                allowedKeys.add("imageFile");
            }

            Array.from(allowedKeys).forEach((key) => {
                const value = formValues[key];
                // Si el valor es null o undefined, no lo enviamos
                if (value === null || value === undefined) return;

                if (value instanceof File) {
                    if (value.size > 0) formData.append(key, value);
                } else {
                    const stringValue = value.toString().trim();
                    
                    // Si se manda "" un Integer en Java, da error 400. Mejor no enviarlo o mandar null.
                    const isNumericField = ["serialNumber", "mtom", "wingspan", "maxSpeed", "impactEnergy"].includes(key);
                    
                    if (isNumericField && stringValue === "") {
                        return;
                    }

                    // Limpieza de decimales (cambiar coma por punto si el usuario la puso)
                    const finalValue = isNumericField ? stringValue.replace(",", ".") : stringValue;
                    
                    formData.append(key, finalValue);
                }
            });
            console.log(`${endpoint}/${id}`);
            const res = await fetch(`${endpoint}/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                alert("Error actualizando");
                return;
            }

            const updated = await res.json();
            setData(updated);
            setFormValues(updated);
            setEditing(false);
        }

        if (confirmAction === "delete" && onDelete) {
            await onDelete();
        }

        setConfirmAction(null);
    };

    if (!data) return <p>Loading...</p>;

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
                            />
                        )}

                        {/* Buttons */}
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
                                    <img src={arroBackIcon} alt="ArroBack" className="arrow-back-icon d-inline d-sm-none ms-2" />
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
                            confirmAction === "validationError" ? "warning" : 
                            "primary"
                        }
                        title={
                            confirmAction === "update" ? "Confirmar cambios" : 
                            confirmAction === "delete" ? "Eliminar registro" : 
                            "Errores de validación"
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

