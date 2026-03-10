import React from "react";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
    const loadUser = async () => {
        const res = await apiFetch(
        `http://localhost:8080/api/auth/users/${id}`,
        {
            credentials: "include",
        }
        );

        if (!res) return;

        const data = await res.json();
        setUser(data);
    };

    loadUser();
    }, [id]);

    const handleDelete = async () => {
    const confirmDelete = confirm("¿Eliminar usuario?");
    if (!confirmDelete) return;

    await apiFetch(`http://localhost:8080/api/auth/users/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

    navigate("/auth/users");
    };

    if (!user) return <p>Cargando...</p>;

    return (
    <div className="container py-4">
        <div className="card p-4 shadow-sm">
            
        <h2>
            {user.firstName} {user.lastName}
        </h2>

        <p>
            <b>Id: </b> {user.id}
        </p>

        <p>
            <b>Usuario:</b> {user.username}
        </p>
        <p>
            <b>Email:</b> {user.email}
        </p>
        <p>
            <b>Teléfono:</b> {user.phoneNumber}
        </p>
        <p>
            <b>Tipo:</b> {user.type}
        </p>

        <img
            src={user.imagePath 
                    ? `http://localhost:8080/api/auth/users/images/${user.imagePath}`
                    : "/default.png"}
            alt={user.username}
            onError={(e) => {
                (e.target as HTMLImageElement).src = "/default.png";
            }}
            style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
            }}
        />

        <div className="d-flex gap-2 mt-3">
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