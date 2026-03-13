import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import { useAuth } from "../AuthProvider";

import DetailView from "../commons/props/DetailView";
import DetailEdit from "../commons/props/DetailEdit";
import { aircraftFields } from "./AircraftFields";

export default function AircraftDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [aircraft, setAircraft] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [formValues, setFormValues] = useState<any>({});

    const [errors, setErrors] = useState<Record<string, string | null>>({});
    

    // Load Aircraft
    useEffect(() => {
    const loadAircraft = async () => {
        const res = await apiFetch(`http://localhost:8080/api/auth/aircraft/${id}`);
        if (!res) return;
        const data = await res.json();
        setAircraft(data);
        // Normalize hasCamera boolean to "Sí"/"No" for the select input
        setFormValues({
            ...data,
            hasCamera: data.hasCamera ? "Sí" : "No",
        });
    };
    loadAircraft();
    }, [id]);

    // Load image
    useEffect(() => {
    const loadImage = async () => {
        if (!aircraft?.imagePath) return setImageUrl(null);

        try {
        const headers = new Headers();
        if (token) headers.set("Authorization", `Bearer ${token}`);
        const res = await fetch(
            `http://localhost:8080/api/auth/aircraft/images/${aircraft.imagePath}`,
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
    }, [aircraft?.imagePath, token]);

    // Delete user
    const handleDelete = async () => {
    if (!confirm("¿Eliminar aeronave?")) return;
    await apiFetch(`http://localhost:8080/api/auth/aircraft/${id}`, { method: "DELETE" });
    navigate("/auth/aircrafts");
    };

    // Confirm update
    const handleUpdate = async () => {
        if (!validateForm()) return;
        if (!confirm("¿Confirmar cambios?")) return;

        const formData = new FormData();

        Object.entries(formValues).forEach(([key, value]) => {
            if (key === "hasCamera") {
                // Convert "Sí"/"No" string back to boolean string for the backend
                formData.append(key, value === "Sí" ? "true" : "false");
            } else if (value instanceof File) {
                formData.append(key, value, value.name);
            } else if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        const res = await fetch(`http://localhost:8080/api/auth/aircraft/${id}`, {
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
        setAircraft(updated);
        setEditing(false);
    };

    const validateForm = () => {
        const newErrors: Record<string, string | null> = {};

        aircraftFields.forEach((field) => {
            if (field.validate) {
                const valid = field.validate(formValues[field.key]);
                newErrors[field.key] = valid ? null : field.error || "Campo inválido";
            }
        });

        setErrors(newErrors);

        return !Object.values(newErrors).some((e) => e !== null);
    };

    if (!aircraft) return <p>Cargando...</p>;

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
                                alt={aircraft.username}
                                onError={(e) => ((e.target as HTMLImageElement).src = "/default-user.jpg")}
                                className="rounded me-3 d-none d-sm-block"
                                style={{ width: "90px", height: "90px", objectFit: "cover" }}
                            />

                            <div className="d-flex flex-column">
                            <div className="d-flex align-items-center flex-wrap">
                                <h2 className="me-3 mb-0">
                                {aircraft.firstName} {aircraft.lastName}
                                </h2>
                                <span
                                    className="px-2 py-1 fw-bold"
                                    style={{
                                        borderRadius: "4px",
                                        fontSize: "0.9rem",
                                        ...(typeColors[aircraft.type] || { backgroundColor: "#E5E7EB", color: "#374151" }),
                                }}
                                >
                                {aircraft.type}
                                </span>
                            </div>
                            <small className="text-muted text-start">@{aircraft.username}</small>
                            </div>
                        </div>

                        {/* View or Edit Mode */}
                        {!editing ? (

                            <DetailView
                                data={aircraft}
                                fields={aircraftFields}
                            />

                        ) : (

                            <DetailEdit
                                values={formValues}
                                setValues={setFormValues}
                                fields={aircraftFields}
                                errors={errors}
                            />
                            
                        )}

                    </div>
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2 mt-3 flex-wrap">
                    {!editing ? (
                    <>
                        <button className="btn btn-primary" onClick={() => setEditing(true)}>
                        Modificar
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete}>
                        Eliminar
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate("/auth/aircrafts")}>
                        Volver
                        </button>
                    </>
                    ) : (
                    <>
                        <button className="btn btn-success" onClick={handleUpdate}>
                        Confirmar cambios
                        </button>
                        <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                        Cancelar
                        </button>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
}