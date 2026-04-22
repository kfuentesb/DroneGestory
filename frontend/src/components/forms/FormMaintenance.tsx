import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../api";
import InsertDoc from "../commons/InsertDoc";
import LoadingSpinner from "../commons/Loading";

type AircraftDetails = {
    id: number;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    aircraftClass?: string;
    flightMinutes?: number;
};

export default function FormMaintenance() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const aircraftIdFromUrl = searchParams.get("aircraftId");

    const [selectedAircraft, setSelectedAircraft] = useState<AircraftDetails | null>(null);
    const [aircraftLoading, setAircraftLoading] = useState(true);

    const [reviewType, setReviewType] = useState("");
    const [monthsRequired, setMonthsRequired] = useState<number | "">("");
    const [maintenanceDate, setMaintenanceDate] = useState("");
    const [nextMaintenanceDate, setNextMaintenanceDate] = useState("");
    const [comments, setComments] = useState("");

    const [hoursPart, setHoursPart] = useState<number | "">("");
    const [minsPart, setMinsPart] = useState<number | "">("");

    const [documentationEnabled, setDocumentationEnabled] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [expirationDate, setExpirationDate] = useState("");
    const [isIndefinite, setIsIndefinite] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAircraftDetails = async () => {
            if (!aircraftIdFromUrl) {
                setError("No se proporciono un ID de aeronave.");
                setAircraftLoading(false);
                return;
            }

            try {
                const response = await apiFetch(`/api/aircraft/${aircraftIdFromUrl}`);
                if (!response) {
                    throw new Error("Aeronave no encontrada.");
                }

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

        const totalMinutes = Number(hoursPart) * 60 + Number(minsPart);

        try {
            const payload = {
                aircraftId: selectedAircraft.id,
                reviewType: reviewType.trim(),
                monthsRequired,
                hoursFlightRequired: totalMinutes,
                maintenanceDate,
                nextMaintenanceDate: nextMaintenanceDate || null,
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

            const created = await response.json();

            if (documentationEnabled && selectedFile) {
                const formData = new FormData();
                formData.append("documentationLabel", "Documentacion de mantenimiento");
                formData.append("dateIndefinite", String(isIndefinite));
                if (!isIndefinite && expirationDate) {
                    formData.append("expireDate", expirationDate);
                }
                formData.append("file", selectedFile);

                await apiFetch(`/api/maintenance-documentation/maintenance/${created.id}/upload`, {
                    method: "POST",
                    body: formData,
                });
            }

            navigate(`/maintenance/aircraft/${selectedAircraft.id}`);
        } catch (err: any) {
            setError(err?.message ?? "Error al guardar.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setSelectedFile(file);
    };

    const aircraftLabel = selectedAircraft
        ? `${selectedAircraft.manufacturer ?? ""} ${selectedAircraft.model ?? ""}`.trim()
        : "Aeronave";

    const currentFlightTimeStr = selectedAircraft?.flightMinutes !== undefined
        ? `${Math.floor(selectedAircraft.flightMinutes / 60)}h ${selectedAircraft.flightMinutes % 60}m`
        : "0h 0m";

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">
                    <button
                        type="button"
                        className="btn btn-link p-0 mb-3 d-flex align-items-center text-decoration-none text-muted"
                        onClick={() => navigate(-1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                        <span className="ms-2 fw-medium">Volver</span>
                    </button>

                    <h2 className="card-title mb-1" style={{ color: "#1E1E1E" }}>
                        Registrar mantenimiento: {aircraftLoading ? "Cargando..." : aircraftLabel}
                    </h2>

                    {selectedAircraft?.serialNumber && (
                        <p className="text-muted mb-0">Nº Serie: {selectedAircraft.serialNumber}</p>
                    )}

                    {error && <div className="alert alert-danger">{error}</div>}

                    {aircraftLoading ? (
                        <LoadingSpinner message="Cargando datos de la aeronave..." />
                    ) : (
                        <form onSubmit={handleSubmit} className="row g-3 pt-3">
                            <div className="col-12 col-md-6">
                                <label className="form-label d-flex justify-content-between">
                                    <span>Tipo de revision</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={reviewType}
                                    onChange={(e) => setReviewType(e.target.value)}
                                    placeholder="Revision básica, revision general, etc."
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label d-flex justify-content-between">
                                    <span>Meses desde ultima revision</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={monthsRequired}
                                    min={0}
                                    onChange={(e) => setMonthsRequired(e.target.value === "" ? "" : Number(e.target.value))}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label d-flex justify-content-between">
                                    <span>Fecha dia mantenimiento</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={maintenanceDate}
                                    onChange={(e) => setMaintenanceDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label d-flex justify-content-between">
                                    <span>Proximo dia de mantenimiento</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={nextMaintenanceDate}
                                    onChange={(e) => setNextMaintenanceDate(e.target.value)}
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label d-flex justify-content-between">
                                    <span>Tiempo de vuelo al hacer revision</span>
                                    <small className="text-muted">Tiempo vuelo actual registrado: <strong>{currentFlightTimeStr}</strong></small>
                                </label>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={hoursPart}
                                                placeholder="Horas"
                                                min={0}
                                                max={10000}
                                                onChange={(e) => setHoursPart(e.target.value === "" ? "" : Number(e.target.value))}
                                                required
                                            />
                                            <span className="input-group-text">h</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={minsPart}
                                                placeholder="Min"
                                                min={0}
                                                max={59}
                                                onChange={(e) => setMinsPart(e.target.value === "" ? "" : Number(e.target.value))}
                                                required
                                            />
                                            <span className="input-group-text">m</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label d-flex justify-content-between">
                                    <span>Comentarios (opcional)</span>
                                </label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Observaciones adicionales"
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <InsertDoc
                                    checkboxLabel="Añadir documentación (opcional)"
                                    isChecked={documentationEnabled}
                                    onToggleCheck={() => setDocumentationEnabled((prev) => !prev)}
                                    fileInputId="maintenanceDocumentationFile"
                                    selectedFile={selectedFile}
                                    onFileChange={handleFileChange}
                                    onClearFile={() => setSelectedFile(null)}
                                    existingFileName={null}
                                    expirationDate={expirationDate}
                                    onExpirationDateChange={setExpirationDate}
                                    indefiniteId="maintenanceDocIndefinite"
                                    isIndefinite={isIndefinite}
                                    onToggleIndefinite={() => setIsIndefinite((prev) => !prev)}
                                    showDateControls={true}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                            </div>

                            <div className="col-12 d-flex gap-2 mt-4">
                                <button type="submit" className="btn btn-success" disabled={loading || !selectedAircraft} onClick={() => {}}>
                                    {loading ? "Guardando..." : "Registrar mantenimiento"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate(-1)}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
