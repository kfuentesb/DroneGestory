import React from "react";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import { useAuth } from "../AuthProvider";

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
    const loadUser = async () => {
        const res = await apiFetch(`http://localhost:8080/api/auth/users/${id}`);

        if (!res) return;

        const data = await res.json();
        setUser(data);
    };

    loadUser();
    }, [id]);

    useEffect(() => {
    const loadImage = async () => {
        if (!user?.imagePath) {
            setImageUrl(null);
            return;
        }

        try {
            const res = await apiFetch(`http://localhost:8080/api/auth/users/images/${user.imagePath}`);
            if (!res) return;
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
        } catch {
            setImageUrl(null);
        }
    };

    loadImage();

    return () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
    }, [user?.imagePath, token]);

    const handleDelete = async () => {
    const confirmDelete = confirm("¿Eliminar usuario?");
    if (!confirmDelete) return;

    await apiFetch(`http://localhost:8080/api/auth/users/${id}`, {
        method: "DELETE",
    });

    navigate("/auth/users");
    };

    if (!user) return <p>Cargando...</p>;

    const typeColors: Record<string, { backgroundColor: string; color: string }> = {
        ADMIN: {
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
        },
        MANAGER: {
            backgroundColor: "#E0F2FE",
            color: "#075985",
        },
        PILOT: {
            backgroundColor: "#E6F4EC",
            color: "#1F6B43",
        },
    };

    return (
        <div className="container-fluid py-4">
            <div className="card p-4 shadow-sm">
                <div className="row">
                {/* Left column: user info */}
                <div className="col-md-8 col-12">
                    <div className="d-flex align-items-center mb-3 flex-wrap">
                        <h2 className="me-3 mb-0">
                            {user.firstName} {user.lastName}
                        </h2>
                        <span
                            className="px-2 py-1"
                            style={{
                            borderRadius: "4px",
                            fontSize: "0.9rem",
                            ...typeColors[user.type] || { backgroundColor: "#E5E7EB", color: "#374151" },
                            }}
                        >
                            {user.type}
                        </span>
                    </div>

                    <div className="row">
                        {[
                            { label: "Id", value: user.id },
                            { label: "Usuario", value: user.username },
                            { label: "Email", value: user.email },
                            { label: "Teléfono", value: user.phoneNumber },
                            { label: "Dato extra", value: "-" },
                            { label: "Dato extra", value: "-" },
                            { label: "Dato extra", value: "-" },
                            { label: "Dato extra", value: "-" },
                            { label: "Dato extra", value: "-" },
                            { label: "Dato extra", value: "-" },
                            { label: "Dato extra", value: "-" },
                            { label: "Dato extra", value: "-" },
                        ].map((field, idx) => (
                            <div key={idx} className="col-md-6 col-12 mb-3 d-flex justify-content-end">
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
                                <span className="fw-bold">{field.value}</span>
                            </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="col-md-4 col-12 d-flex justify-content-md-end justify-content-start mb-3 mb-md-0">
                    <img
                    src={imageUrl || "/default.png"}
                    alt={user.username}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/default.png";
                    }}
                    className="img-fluid rounded"
                    style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        maxWidth: "100%",
                        marginTop: "3em",
                        marginRight: "2em"
                    }}
                    />
                </div>
                </div>

                {/* Buttons */}
                <div className="d-flex gap-2 mt-3 flex-wrap">
                <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/auth/users/edit/${id}`)}
                >
                    Modificar
                </button>

                <button className="btn btn-danger" onClick={handleDelete}>
                    Eliminar
                </button>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/auth/users")}
                >
                    Volver
                </button>
                </div>
            </div>
    </div>
    );
}
