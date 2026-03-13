import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import { useAuth } from "../AuthProvider";

import DetailView from "../commons/props/DetailView";
import { userFields }from "./UserFields";
import DetailEdit from "../commons/props/DetailEdit";

import editIcon from '../../assets/edit_white.svg';
import deleteIcon from '../../assets/delete_white.svg';
import arroBackIcon from '../../assets/arrow_back_white.svg';
import checkIcon from '../../assets/check_white.svg';
import cancelIcon from '../../assets/cancel_white.svg';

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [user, setUser] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [formValues, setFormValues] = useState<any>({});

    const [errors, setErrors] = useState<Record<string, string | null>>({});
    

    // Load user
    useEffect(() => {
    const loadUser = async () => {
        const res = await apiFetch(`http://localhost:8080/api/auth/users/${id}`);
        if (!res) return;
        const data = await res.json();
        setUser(data);
        // esto va a permitir que phone sea nulo
        setFormValues({
            ...data,
            phoneNumber: data.phoneNumber ?? "",
            imagePath: data.imagePath ?? "",
        });
    };
    loadUser();
    }, [id]);

    // Load image
    useEffect(() => {
    const loadImage = async () => {
        if (!user?.imagePath) return setImageUrl(null);

        try {
        const headers = new Headers();
        if (token) headers.set("Authorization", `Bearer ${token}`);
        const res = await fetch(
            `http://localhost:8080/api/auth/users/images/${user.imagePath}`,
            { headers }
        );
        if (!res.ok) return setImageUrl(null);
        const blob = await res.blob();
        setImageUrl(URL.createObjectURL(blob));
        } catch {
        setImageUrl(null);
        }
    };
    loadImage();
    return () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
    }, [user?.imagePath, token]);

    // Delete user
    const handleDelete = async () => {
    if (!confirm("¿Eliminar usuario?")) return;
    await apiFetch(`http://localhost:8080/api/auth/users/${id}`, { method: "DELETE" });
    navigate("/auth/users");
    };

    // Confirm update
    const handleUpdate = async () => {
        if (!validateForm()) return;
        if (!confirm("¿Confirmar cambios?")) return;

        const formData = new FormData();

        Object.entries(formValues).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value, value.name);
            } else if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        const res = await fetch(`http://localhost:8080/api/auth/users/${id}`, {
            method: "PUT",
            headers: {
            Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!res.ok) {
            alert("Error actualizando usuario");
            return;
        }

        const updated = await res.json();
        setUser(updated);
        setEditing(false);
    };

    const validateForm = () => {
        const newErrors: Record<string, string | null> = {};

        userFields.forEach((field) => {
            if (field.validate) {
                const valid = field.validate(formValues[field.key]);
                newErrors[field.key] = valid ? null : field.error || "Campo inválido";
            }
        });

        setErrors(newErrors);

        return !Object.values(newErrors).some((e) => e !== null);
    };

    if (!user) return <p>Cargando...</p>;

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
                                alt={user.username}
                                onError={(e) => ((e.target as HTMLImageElement).src = "/default-user.jpg")}
                                className="rounded me-3 d-none d-sm-block"
                                style={{ width: "90px", height: "90px", objectFit: "cover" }}
                            />

                            <div className="d-flex flex-column">
                            <div className="d-flex align-items-center flex-wrap">
                                <h2 className="me-3 mb-0">
                                {user.firstName} {user.lastName}
                                </h2>
                                <span
                                    className="px-2 py-1 fw-bold"
                                    style={{
                                        borderRadius: "4px",
                                        fontSize: "0.9rem",
                                        ...(typeColors[user.type] || { backgroundColor: "#E5E7EB", color: "#374151" }),
                                }}
                                >
                                {user.type}
                                </span>
                            </div>
                                <small className="text-muted text-start">@{user.username}</small>
                            </div>
                        </div>

                        {/* View or Edit Mode */}
                        {!editing ? (

                            <DetailView
                                data={user}
                                fields={userFields}
                            />

                        ) : (

                            <DetailEdit
                                values={formValues}
                                setValues={setFormValues}
                                fields={userFields}
                                errors={errors}
                            />
                            
                        )}

                    </div>
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2 mt-3 flex-wrap justify-content-start justify-content-sm-start justify-content-center">
                    {!editing ? (
                    <>
                        <button className="btn btn-primary" onClick={() => setEditing(true)}>
                            <img src={editIcon} alt="Edit" className="edit-icon d-inline d-sm-none" />
                            <span className="d-none d-sm-block">
                                Editar
                            </span>
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete}>
                            <img src={deleteIcon} alt="Delete" className="delete-icon d-inline d-sm-none" />
                            <span className="d-none d-sm-block">
                                Borrar
                            </span>
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate("/auth/users")}>
                            <img src={arroBackIcon} alt="ArroBack" className="arrow-back-icon d-inline d-sm-none" />
                            <span className="d-none d-sm-block">
                                Volver
                            </span>
                        </button>
                    </>
                    ) : (
                    <>
                        <button className="btn btn-success" onClick={handleUpdate}>
                            <img src={checkIcon} alt="Check" className="check-icon d-inline d-sm-none" />
                            <span className="d-none d-sm-block">
                                Confirmar cambios
                            </span>
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                            <img src={cancelIcon} alt="Cancel" className="cancel-icon d-inline d-sm-none" />
                            <span className="d-none d-sm-block">
                                Cancelar
                            </span>
                        </button>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
}