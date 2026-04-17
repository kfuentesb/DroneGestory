import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import ButtonProp from "../commons/props/ButtonProp";

// Definimos el tipo para una sola aeronave
type AircraftDetails = {
    id: number;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    aircraftClass?: string;
};

export default function FormMaintenance() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const aircraftIdFromUrl = searchParams.get("aircraftId");
    
    // Estados para los datos de la aeronave seleccionada
    const [selectedAircraft, setSelectedAircraft] = useState<AircraftDetails | null>(null);
    const [aircraftLoading, setAircraftLoading] = useState(true);
    
    // Estados del formulario
    const [reviewType, setReviewType] = useState("");
    const [monthsRequired, setMonthsRequired] = useState<number>(0);
    const [hoursFlightRequired, setHoursFlightRequired] = useState<number>(0);
    const [maintenanceDate, setMaintenanceDate] = useState("");
    const [comments, setComments] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAircraftDetails = async () => {
            if (!aircraftIdFromUrl) {
                setError("No se proporcionó un ID de aeronave.");
                setAircraftLoading(false);
                return;
            }

            try {
                const response = await apiFetch(`/api/aircraft/${aircraftIdFromUrl}`);
                if (!response) throw new Error("Aeronave no encontrada.");
                
                const data = await response.json();
                setSelectedAircraft(data);
            } catch (err) {
                console.error(err);
                setError("Error al cargar los detalles de la aeronave.");
            } finally {
                setAircraftLoading(false);
            }
        };

        loadAircraftDetails();
    }, [aircraftIdFromUrl]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!selectedAircraft) {
            setError("Datos de aeronave no disponibles.");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                aircraftId: selectedAircraft.id,
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

            if (!response) throw new Error("No se pudo registrar el mantenimiento.");

            navigate(`/maintenance/aircraft/${selectedAircraft.id}`); // Volvemos a la lista de esa aeronave
        } catch (err: any) {
            setError(err?.message ?? "Error al guardar.");
        } finally {
            setLoading(false);
        }
    };

    const aircraftLabel = selectedAircraft 
        ? `${selectedAircraft.manufacturer ?? ""} ${selectedAircraft.model ?? ""}`.trim() 
        : "Aeronave";

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">
                    <button
                        type="button"
                        className="btn btn-link p-0 mb-3 d-flex align-items-center text-decoration-none text-muted"
                        onClick={() => navigate(-1)} // Mejor usar -1 para volver exactamente de donde vino
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                        <span className="ms-2 fw-medium">Volver</span>
                    </button>

                    {/* Mostramos el nombre de la aeronave en el título */}
                    <h2 className="card-title mb-1" style={{ color: "#1E1E1E" }}>
                        Registrar mantenimiento: {aircraftLoading ? "Cargando..." : aircraftLabel}
                    </h2>
                    
                    {selectedAircraft?.serialNumber && (
                        <p className="text-muted mb-0">S/N: {selectedAircraft.serialNumber}</p>
                    )}
                    
                    <p className="text-muted mb-4">
                        Complete los datos para la aeronave seleccionada.
                    </p>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {aircraftLoading ? (
                        <LoadingSpinner message="Cargando datos de la aeronave..." />
                    ) : (
                        <form onSubmit={handleSubmit} className="row g-3">
                            {/* El input de Aeronave ya no es un Select, puede ser un campo de solo lectura o simplemente no estar */}
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

                            <div className="col-12 col-md-6">
                                <label className="form-label">Fecha de mantenimiento</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={maintenanceDate}
                                    onChange={(e) => setMaintenanceDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-6">
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

                            <div className="col-12 col-md-6">
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

                            <div className="col-12 d-flex gap-2 mt-4">
                                <ButtonProp type="submit" disabled={loading || !selectedAircraft} onClick={() => {}}>
                                    {loading ? "Guardando..." : "Registrar mantenimiento"}
                                </ButtonProp>
                                <ButtonProp
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate(-1)}
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