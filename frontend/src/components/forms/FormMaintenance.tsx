import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import ButtonProp from "../commons/props/ButtonProp";

type AircraftOption = {
    id: number;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
};

export default function FormMaintenance() {
    const navigate = useNavigate();
    const [aircraftOptions, setAircraftOptions] = useState<AircraftOption[]>([]);
    const [aircraftId, setAircraftId] = useState<number | "">("");
    const [reviewType, setReviewType] = useState("");
    const [monthsRequired, setMonthsRequired] = useState<number>(0);
    const [hoursFlightRequired, setHoursFlightRequired] = useState<number>(0);
    const [maintenanceDate, setMaintenanceDate] = useState("");
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false);
    const [aircraftLoading, setAircraftLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAircraft = async () => {
            try {
                const response = await apiFetch("/api/aircraft");
                if (!response) {
                    throw new Error("No se pudo cargar la lista de aeronaves.");
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    setAircraftOptions(data);
                }
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar las aeronaves. Intente de nuevo más tarde.");
            } finally {
                setAircraftLoading(false);
            }
        };
        loadAircraft();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!aircraftId) {
            setError("Seleccione una aeronave.");
            return;
        }

        if (!reviewType.trim()) {
            setError("Ingrese el tipo de revisión.");
            return;
        }

        if (!maintenanceDate) {
            setError("Ingrese la fecha de mantenimiento.");
            return;
        }

        if (monthsRequired < 0 || hoursFlightRequired < 0) {
            setError("Los valores de meses y horas deben ser mayores o iguales a 0.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                aircraftId: Number(aircraftId),
                reviewType: reviewType.trim(),
                monthsRequired,
                hoursFlightRequired,
                maintenanceDate,
                comments: comments.trim() || null,
            };

            const response = await apiFetch("/api/maintenance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response) {
                throw new Error("No se pudo registrar el mantenimiento.");
            }

            await response.json();
            navigate("/maintenance");
        } catch (err: any) {
            console.error(err);
            setError(err?.message ?? "No se pudo registrar el mantenimiento. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const renderAircraftLabel = (aircraft: AircraftOption) => {
        const name = `${aircraft.manufacturer ?? ""} ${aircraft.model ?? ""}`.trim();
        return `${name}${aircraft.serialNumber ? ` · ${aircraft.serialNumber}` : ""}`;
    };

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">
                    <button
                        type="button"
                        className="btn btn-link p-0 mb-3 d-flex align-items-center text-decoration-none text-muted"
                        onClick={() => navigate("/maintenance")}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                        <span className="ms-2 fw-medium">Volver</span>
                    </button>
                    <h2 className="card-title mb-1" style={{ color: "#1E1E1E" }}>Registrar mantenimiento</h2>
                    <p className="text-muted mb-4">
                        Complete los datos para agregar un nuevo registro de mantenimiento.
                    </p>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {aircraftLoading && !error && (
                        <LoadingSpinner message="Cargando aeronaves..." />
                    )}

                    {!aircraftLoading && aircraftOptions.length === 0 && (
                        <div className="alert alert-warning">
                            No hay aeronaves registradas. Primero registre una aeronave antes de crear un mantenimiento.
                        </div>
                    )}

                    {!aircraftLoading && aircraftOptions.length > 0 && (
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label">Aeronave</label>
                                <select
                                    className="form-select"
                                    value={aircraftId}
                                    onChange={(e) => setAircraftId(Number(e.target.value) || "")}
                                    required
                                >
                                    <option value="">Seleccione una aeronave</option>
                                    {aircraftOptions.map((aircraft) => (
                                        <option key={aircraft.id} value={aircraft.id}>
                                            {renderAircraftLabel(aircraft)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label">Tipo de revisión</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={reviewType}
                                    onChange={(e) => setReviewType(e.target.value)}
                                    placeholder="Ej. revisión preventiva"
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label">Meses requeridos</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={monthsRequired}
                                    min={0}
                                    onChange={(e) => setMonthsRequired(Number(e.target.value))}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label">Horas de vuelo requeridas</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={hoursFlightRequired}
                                    min={0}
                                    onChange={(e) => setHoursFlightRequired(Number(e.target.value))}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-4">
                                <label className="form-label">Fecha de mantenimiento</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={maintenanceDate}
                                    onChange={(e) => setMaintenanceDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <label className="form-label">Comentarios (opcional)</label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Observaciones adicionales"
                                />
                            </div>

                            <div className="col-12 d-flex gap-2">
                                <ButtonProp type="submit" disabled={loading} onClick={() => {}}>
                                    {loading ? "Guardando..." : "Registrar mantenimiento"}
                                </ButtonProp>
                                <ButtonProp
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate("/maintenance")}
                                    disabled={loading}
                                >
                                    Cancelar
                                </ButtonProp>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
