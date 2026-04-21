import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api";
import ComboBox from "../commons/ComboBox";
import InsertDoc from "../commons/InsertDoc";
import LoadingSpinner from "../commons/Loading";
import ButtonProp from "../commons/props/ButtonProp";

export default function FormFlightTime() {
    const navigate = useNavigate();
    const { aircraftId } = useParams<{ aircraftId: string }>();

    const [aircraft, setAircraft] = useState<{ id: number; manufacturer?: string; model?: string; serialNumber?: string } | null>(null);
    const [operations, setOperations] = useState<Array<{ idOperacion: number; codigo: string }>>([]);
    const [selectedOperationCodigo, setSelectedOperationCodigo] = useState("");
    const [flightDate, setFlightDate] = useState("");
    const [hours, setHours] = useState<number>(1);
    const [minutes, setMinutes] = useState<number>(0);
    const [comments, setComments] = useState("");
    const [isNegative, setIsNegative] = useState(false);
    const [documentationEnabled, setDocumentationEnabled] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [expirationDate, setExpirationDate] = useState("");
    const [isIndefinite, setIsIndefinite] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!aircraftId) return;
            try {
                const [aircraftRes, operationsRes] = await Promise.all([
                    apiFetch(`/api/aircraft/${aircraftId}`),
                    apiFetch(`/api/operations`)
                ]);
                const aircraftData = aircraftRes ? await aircraftRes.json() : null;
                const operationsData = operationsRes ? await operationsRes.json() : [];
                setAircraft(aircraftData);
                setOperations(Array.isArray(operationsData) ? operationsData : []);
            } catch (err) {
                console.error(err);
                setError("No se pudo cargar la aeronave o las operaciones. Intente de nuevo.");
            }
        };
        fetchData();
    }, [aircraftId]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!aircraftId) {
            setError("Aeronave no seleccionada.");
            return;
        }

        if (!flightDate) {
            setError("Por favor ingrese la fecha de vuelo.");
            return;
        }

        let durationMinutes = hours * 60 + minutes;
        if (isNegative) {
            durationMinutes = -durationMinutes;
        }

        if (durationMinutes === 0) {
            setError("Seleccione una duración válida.");
            return;
        }

        setLoading(true);
        try {
            let operationId: number | null = null;
            const enteredOperationCodigo = selectedOperationCodigo.trim();
            const existing = operations.find(
                (op) => op.codigo?.toLowerCase() === enteredOperationCodigo.toLowerCase()
            );

            if (enteredOperationCodigo) {
                if (!existing) {
                    throw new Error("Seleccione una operación válida de la lista.");
                }
                operationId = existing.idOperacion;
            }

            const payload = {
                aircraftId: Number(aircraftId),
                operationId,
                flightDate,
                durationMinutes,
                comments: comments.trim() || null,
            };

            const response = await apiFetch("/api/flight-times", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response) throw new Error("No se pudo crear el registro de horas.");

            const created = await response.json();

            if (documentationEnabled && selectedFile) {
                const formData = new FormData();
                formData.append("documentationLabel", "Documentación de horas de vuelo");
                formData.append("dateIndefinite", String(true));
                formData.append("file", selectedFile);

                await apiFetch(`/api/flight-time-documentation/flight-time/${created.id}/upload`, {
                    method: "POST",
                    body: formData,
                });
            }

            navigate(`/flight-times/${aircraftId}`);
        } catch (err: any) {
            console.error(err);
            setError(err?.message ?? "No se pudo registrar las horas. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setSelectedFile(file);
    };

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">
                    {/* Botón Volver y Título */}
                    <button
                        type="button"
                        className="btn btn-link p-0 mb-3 d-flex align-items-center text-decoration-none text-muted"
                        onClick={() => navigate(`/flight-times/${aircraftId}`)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                        <span className="ms-2 fw-medium">Volver</span>
                    </button>
                    <h2 className="card-title mb-1" style={{ color: "#1E1E1E" }}>Registrar horas de vuelo</h2>
                    {aircraft && (
                        <p className="mb-0 text-muted">
                            {aircraft.manufacturer ?? ""} {aircraft.model ?? ""} · {aircraft.serialNumber ?? ""}
                        </p>
                    )}

                    {!aircraft && !error && <LoadingSpinner message="Cargando datos de la aeronave..." />}

                    {error && <div className="alert alert-danger mt-3">{error}</div>}

                    {aircraft && (
                        <form onSubmit={handleSubmit} className="row g-3 mt-2">
                            <div className="col-12 col-md-6">
                                <ComboBox
                                    label="Ref. operación (opcional)"
                                    value={selectedOperationCodigo}
                                    onChange={setSelectedOperationCodigo}
                                    options={operations.map((op) => ({ value: op.codigo, label: op.codigo }))}
                                    placeholder="Seleccione o escriba una operación"
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label">Fecha de vuelo</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={flightDate}
                                    onChange={(e) => setFlightDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="col-12">
                                <div className="p-3 border rounded bg-light">
                                    <div className="row g-3 align-items-end">
                                        <div className="col-12 col-md-4">
                                            <label className="form-label">Horas</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={hours}
                                                min={0}
                                                max={10000}
                                                step={1}
                                                onChange={(e) => {
                                                    const value = Number(e.target.value);
                                                    setHours(Number.isNaN(value) ? 0 : Math.max(0, Math.min(10000, value)));
                                                }}
                                            />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label">Minutos</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={minutes}
                                                min={0}
                                                max={59}
                                                step={1}
                                                onChange={(e) => {
                                                    const value = Number(e.target.value);
                                                    setMinutes(Number.isNaN(value) ? 0 : Math.max(0, Math.min(59, value)));
                                                }}
                                            />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <div className="form-check form-switch mt-4 pt-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="negativeDurationCheck"
                                                    checked={isNegative}
                                                    onChange={(e) => setIsNegative(e.target.checked)}
                                                />
                                                <label className="form-check-label fw-medium" htmlFor="negativeDurationCheck">
                                                    Registrar tiempo negativo
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className="form-text mb-0">
                                            El checkbox convierte el tiempo ingresado en negativo.
                                        </p>
                                        <p className="form-text mb-0 text-muted">
                                            Duración total = {isNegative ? "-" : ""}{hours}h {minutes}m
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12">
                                <label className="form-label">Comentarios</label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    maxLength={2000}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Añada comentarios opcionales"
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <InsertDoc
                                    checkboxLabel="Añadir documentación opcional"
                                    isChecked={documentationEnabled}
                                    onToggleCheck={() => setDocumentationEnabled((prev) => !prev)}
                                    fileInputId="flightTimeDocumentationFile"
                                    selectedFile={selectedFile}
                                    onFileChange={handleFileChange}
                                    onClearFile={() => setSelectedFile(null)}
                                    existingFileName={null}
                                    expirationDate={expirationDate}
                                    onExpirationDateChange={setExpirationDate}
                                    indefiniteId="flightTimeDocIndefinite"
                                    isIndefinite={isIndefinite}
                                    onToggleIndefinite={() => setIsIndefinite((prev) => !prev)}
                                    showDateControls={false}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                            </div>

                            <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                                <button type="button" className="btn btn-secondary px-4" onClick={() => navigate(`/flight-times/${aircraftId}`)} disabled={loading}>
                                    <b>Cancelar</b>
                                </button>
                                <ButtonProp type="submit" onClick={() => {}} disabled={loading}>
                                    {loading ? "Guardando..." : "Registrar horas"}
                                </ButtonProp>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
