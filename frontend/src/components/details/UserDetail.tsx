import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import { useAuth } from "../AuthProvider";

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [user, setUser] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [formValues, setFormValues] = useState<any>({});

    const [errors, setErrors] = useState<Record<string, boolean>>({});
    

    // Load user
    useEffect(() => {
    const loadUser = async () => {
        const res = await apiFetch(`http://localhost:8080/api/auth/users/${id}`);
        if (!res) return;
        const data = await res.json();
        setUser(data);
        setFormValues(data); // initialize editable values
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

    const res = await apiFetch(`http://localhost:8080/api/auth/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
    });

    if (!res) return;

    setUser(formValues);
    setEditing(false);
    };

    const validateForm = () => {
        const newErrors: Record<string, boolean> = {};

        fields.forEach((field) => {
            if (field.validate) {
            newErrors[field.key] = !field.validate(formValues[field.key]);
            }
        });

        setErrors(newErrors);

        return !Object.values(newErrors).some(Boolean);
    };

    if (!user) return <p>Cargando...</p>;

    const typeColors: Record<string, { backgroundColor: string; color: string }> = {
        ADMIN: { backgroundColor: "#FEE2E2", color: "#991B1B" },
        MANAGER: { backgroundColor: "#E0F2FE", color: "#075985" },
        PILOT: { backgroundColor: "#E6F4EC", color: "#1F6B43" },
    };

    const fields = [
        {
            label: "Nombre",
            key: "firstName",
            type: "text",
            validate: (v: string) => v.trim().length >= 2,
            error: "El nombre debe tener al menos 2 caracteres"
        },
        {
            label: "Apellidos",
            key: "lastName",
            type: "text",
            validate: (v: string) => v.trim().length >= 2,
            error: "Los apellidos deben tener al menos 2 caracteres"
        },
        {
            label: "Usuario",
            key: "username",
            type: "text",
            validate: (v: string) => v.trim().length >= 4,
            error: "El usuario debe tener al menos 4 caracteres"
        },
        {
            label: "Email",
            key: "email",
            type: "email",
            validate: (v: string) => /\S+@\S+\.\S+/.test(v),
            error: "Email inválido"
        },
        {
            label: "Teléfono",
            key: "phoneNumber",
            type: "text",
            validate: (v: string) => /^[0-9]{9}$/.test(v),
            error: "Debe tener 9 números"
        },
        {
            label: "Tipo de usuario",
            key: "type",
            type: "select",
            options: ["ADMIN", "MANAGER", "PILOT"],
            validate: (v: string) => !!v,
            error: "Selecciona un tipo"
        }
    ];

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
                            <div className="row">
                                {fields.map((field) => (
                                    <div key={field.key} className="col-md-6 col-12 mb-3 d-flex justify-content-start">
                                        <div
                                            className="rounded d-flex flex-column"
                                            style={{
                                                border: "1px solid #6B7280",
                                                padding: "12px 16px",
                                                minHeight: "70px",
                                                width: "100%",
                                                maxWidth: "350px",
                                                textAlign: "start",
                                            }}
                                        >
                                            <small className="text-muted">{field.label}</small>
                                            <span className="fw-bold">{user[field.key]}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="row">
                                {fields.map((field) => (
                                    <div key={field.key} className="col-md-6 col-12 mb-3">
                                    <label className="text-muted d-block text-start ps-3">{field.label}</label>
                                    {field.type === "select" ? (
                                        <select
                                        className="form-select"
                                        value={formValues[field.key] || ""}
                                        onChange={(e) =>
                                            setFormValues({
                                            ...formValues,
                                            [field.key]: e.target.value
                                            })
                                        }
                                        >
                                        {field.options?.map((opt) => (
                                            <option key={opt} value={opt}>
                                            {opt}
                                            </option>
                                        ))}
                                        </select>
                                    ) : (
                                        <>
                                            <input
                                                type={field.type}
                                                className={`form-control ${errors[field.key] ? "is-invalid" : ""}`}
                                                value={formValues[field.key] || ""}
                                                onChange={(e) =>
                                                    setFormValues({
                                                        ...formValues,
                                                        [field.key]: e.target.value
                                                    })
                                                }
                                            />
                                            
                                            {field.type === "select" && errors[field.key] && (
                                                <div className="text-danger small mt-1">
                                                    {errors[field.key]}
                                                </div>
                                            )}
                                        </>
                                    )}
                                    </div>
                                ))}
                            </div>
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
                        <button className="btn btn-secondary" onClick={() => navigate("/auth/users")}>
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