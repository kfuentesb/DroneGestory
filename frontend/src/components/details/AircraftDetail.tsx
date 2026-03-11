import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import { useAuth } from "../AuthProvider";

export default function AircraftDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [aircraft, setAircraft] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const loadAircraft = async () => {
            const res = await apiFetch(`http://localhost:8080/api/aircraft/${id}`);

            if (!res) return;

            const data = await res.json();
            setAircraft(data);
        };
        loadAircraft();
    }, [id]);

    useEffect(() => {
        const loadImage = async () => {
            if (!aircraft?.imagePath) {
                setImageUrl(null);
                return;
            }

            try {
                const headers = new Headers();
                if (token) {
                    headers.set("Authorization", `Bearer ${token}`);
                }
                const res = await fetch(`http://localhost:8080/api/aircraft/images/${aircraft.imagePath}`, { headers });
                if (!res.ok) {
                    setImageUrl(null);
                    return;
                }
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
    }, [aircraft?.imagePath, token]);

    const handleDelete = async () => {
        const confirmDelete = confirm("¿Eliminar aeronave?");
        if (!confirmDelete) return;

        await apiFetch(`http://localhost:8080/api/aircraft/${id}`, {
            method: "DELETE",
        });

        navigate("/auth/aircrafts");
    };

    if (!aircraft) return <p>Cargando...</p>;

    // Puedes editar este objeto para mapear los "tipos" de aeronaves a colores si aplica
    const typeColors: Record<string, { backgroundColor: string; color: string }> = {
        JET: {
            backgroundColor: "#E0F2FE",
            color: "#075985",
        },
        TURBOPROP: {
            backgroundColor: "#E6F4EC",
            color: "#1F6B43",
        },
        HELICOPTER: {
            backgroundColor: "#FEE2E2",
            color: "#991B1B",
        },
    };

    // Mapea aquí los campos reales de tu modelo Aircraft
    const aircraftFields = [
        { label: "Id", value: aircraft.id },
        { label: "Matrícula", value: aircraft.registration },
        { label: "Modelo", value: aircraft.model },
        { label: "Fabricante", value: aircraft.manufacturer },
        { label: "Año de fabricación", value: aircraft.year },
        { label: "Tipo", value: aircraft.type },
        { label: "Capacidad", value: aircraft.capacity },
        // Añade o quita acá los campos que correspondan según tu backend...
        { label: "Dato extra", value: "-" },
        { label: "Dato extra", value: "-" },
    ];

    return (
        <div className="container-fluid py-4">
            <div className="card p-4 shadow-sm">
                <div className="row">
                    {/* Información de la aeronave */}
                    <div className="col-md-8 col-12">
                        <div className="d-flex align-items-center mb-3 flex-wrap">
                            <h2 className="me-3 mb-0">
                                {aircraft.model} {aircraft.registration}
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

                        <div className="row">
                            {aircraftFields.map((field, idx) => (
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
                            src={imageUrl || "/default-aircraft.png"}
                            alt={aircraft.model}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/default-aircraft.png";
                            }}
                            className="img-fluid rounded"
                            style={{
                                width: "150px",
                                height: "150px",
                                objectFit: "cover",
                                maxWidth: "100%",
                                marginTop: "3em",
                                marginRight: "2em",
                            }}
                        />
                    </div>
                </div>

                {/* Botones */}
                <div className="d-flex gap-2 mt-3 flex-wrap">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/auth/aircrafts/edit/${id}`)}
                    >
                        Modificar
                    </button>

                    <button className="btn btn-danger" onClick={handleDelete}>
                        Eliminar
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate("/auth/aircrafts")}
                    >
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
}