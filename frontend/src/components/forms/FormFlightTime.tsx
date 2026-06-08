import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api";
import ComboBox from "../commons/ComboBox";
import InsertDoc from "../commons/InsertDoc";
import LoadingSpinner from "../commons/Loading";
import ButtonProp from "../commons/props/ButtonProp";
import { styles } from "../../styles/styles";
import arroBackIcon from '../../assets/commons/arrow_back_white.svg';

export default function FormFlightTime() {
    const navigate = useNavigate();
    const { aircraftId } = useParams<{ aircraftId: string }>();

    const [aircraft, setAircraft] = useState<{ id: number; manufacturer?: string; model?: string; serialNumber?: string } | null>(null);
    const [operations, setOperations] = useState<Array<{ idOperacion: number; codigo: string }>>([]);
    
    // Estados para controlar el flujo de operación (Arreglados)
    const [isNewOperation, setIsNewOperation] = useState(false);
    const [selectedOperationCodigo, setSelectedOperationCodigo] = useState("");
    const [newOperationCodigo, setNewOperationCodigo] = useState("");

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

        // Determinar qué código enviar basándonos en la pestaña activa
        const finalOperationCodigo = isNewOperation ? newOperationCodigo : selectedOperationCodigo;

        // NUEVA VALIDACIÓN: Verifica que se haya seleccionado o escrito una operación
        if (!finalOperationCodigo || !finalOperationCodigo.trim()) {
            setError(
                isNewOperation 
                    ? "Por favor, introduzca el código de la nueva operación." 
                    : "Por favor, seleccione una operación existente."
            );
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
            const payload = {
                aircraftId: Number(aircraftId),
                operationCodigo: finalOperationCodigo.trim(),
                flightDate,
                durationMinutes,
                comments: comments.trim() || null,
            };

            const response = await apiFetch("/api/flight-hours", {
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

            navigate(`/flight-hours/${aircraftId}`);
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
        event.target.value = "";
    };

    return (
        <div className="container py-4">
            {/* Contenedor Principal Premium */}
            <div className="card shadow-sm border-0 bg-white" style={{ borderRadius: "12px" }}>
                <div className="card-body p-4">
                    
                    {/* Encabezado con título e información de aeronave */}
                    <div className="position-relative mb-4"> 
                        <button
                            type="button"
                            className="btn d-flex align-items-center justify-content-center flex-shrink-0 position-absolute start-0 top-50 translate-middle-y"
                            onClick={() => navigate(-1)}
                            style={styles.backBtn}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 130, 69, 0.1)")}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            title="Volver"
                        >
                            <img
                                src={arroBackIcon}
                                alt="Volver"
                                style={styles.backIcon}
                            />
                        </button> 
                        <div className="ps-5">
                            <h2 className="card-title mb-1" style={{ color: "#1E1E1E" }}>Registrar horas de vuelo</h2>
                            {aircraft && (
                                <p className="mb-0 text-muted">
                                    {aircraft.manufacturer ?? ""} {aircraft.model ?? ""} · {aircraft.serialNumber ?? ""}
                                </p>
                            )} 
                        </div>
                    </div>

                    {!aircraft && !error && (
                        <div className="py-5"><LoadingSpinner message="Cargando datos de la aeronave..." /></div>
                    )}

                    {error && <div className="alert alert-danger mb-4 d-flex align-items-center">{error}</div>}

                    {aircraft && (
                        <form onSubmit={handleSubmit} className="row g-4">
                            
                            {/* BLOQUE IZQUIERDO: Ref. Operación */}
                            <div className="col-12 col-md-6">
                                <div className="card h-100 border-0 shadow-sm bg-white p-3" style={{ borderRadius: "10px", minHeight: "220px" }}>
                                    <label className="form-label fw-bold text-secondary small text-uppercase tracking-wider mb-3">
                                        Ref. operación
                                    </label>
                                    
                                    <div className="btn-group w-100 mb-3" role="group" aria-label="Modo de operación">
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="operationMode"
                                            id="modeExisting"
                                            autoComplete="off"
                                            checked={!isNewOperation}
                                            onChange={() => setIsNewOperation(false)}
                                        />
                                        <label className="btn btn-outline-success py-2 fw-medium" htmlFor="modeExisting">
                                            Seleccionar existente
                                        </label>

                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="operationMode"
                                            id="modeNew"
                                            autoComplete="off"
                                            checked={isNewOperation}
                                            onChange={() => setIsNewOperation(true)}
                                        />
                                        <label className="btn btn-outline-success py-2 fw-medium" htmlFor="modeNew">
                                            Escribir nueva
                                        </label>
                                    </div>

                                    <div className="mt-2">
                                        {!isNewOperation ? (
                                            <ComboBox
                                                label=""
                                                value={selectedOperationCodigo}
                                                onChange={setSelectedOperationCodigo}
                                                options={operations.map((op) => ({ value: op.codigo, label: op.codigo }))}
                                                placeholder="Buscar o seleccionar operación..."
                                            />
                                        ) : (
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="floatingNewOp"
                                                    placeholder="Ej. OP-2026-X"
                                                    value={newOperationCodigo}
                                                    onChange={(e) => setNewOperationCodigo(e.target.value)}
                                                    style={{ borderRadius: "8px" }}
                                                />
                                                <label htmlFor="floatingNewOp" className="text-muted">Código de la operación</label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* BLOQUE DERECHO: Fecha y Documentación */}
                            <div className="col-12 col-md-6">
                                <div className="card h-100 border-0 shadow-sm bg-white p-3" style={{ borderRadius: "10px" }}>
                                    <div className="mb-3">
                                        <label className="form-label fw-bold text-secondary small text-uppercase tracking-wider mb-2">
                                            Fecha de vuelo
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control form-control-lg"
                                            value={flightDate}
                                            onChange={(e) => setFlightDate(e.target.value)}
                                            required
                                            style={{ borderRadius: "8px", fontSize: "0.95rem" }}
                                        />
                                    </div>
                                    <div className="mt-2 pt-1 px-3">
                                        <label className="form-label fw-bold text-secondary small text-uppercase tracking-wider mb-2">
                                            Documentación registro horas de vuelo
                                        </label>
                                        <InsertDoc
                                            checkboxLabel="Añadir documentación (opcional)"
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
                                </div>
                            </div>

                            {/* BLOQUE INFERIOR COMPLETO: Duración del Vuelo */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm bg-white p-4" style={{ borderRadius: "10px" }}>
                                    <label className="form-label fw-bold text-secondary small text-uppercase tracking-wider mb-3">
                                        Duración del vuelo
                                    </label>
                                    <div className="row g-3 align-items-center">
                                        <div className="col-6 col-md-3">
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-lg text-center fw-bold"
                                                    value={hours}
                                                    min={0}
                                                    max={10000}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        setHours(Number.isNaN(value) ? 0 : Math.max(0, Math.min(10000, value)));
                                                    }}
                                                    style={{ borderRadius: "8px" }}
                                                />
                                                <span className="input-group-text bg-light text-muted fw-medium">horas</span>
                                            </div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <div className="input-group">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-lg text-center fw-bold"
                                                    value={minutes}
                                                    min={0}
                                                    max={59}
                                                    onChange={(e) => {
                                                        const value = Number(e.target.value);
                                                        setMinutes(Number.isNaN(value) ? 0 : Math.max(0, Math.min(59, value)));
                                                    }}
                                                    style={{ borderRadius: "8px" }}
                                                />
                                                <span className="input-group-text bg-light text-muted fw-medium">minutos</span>
                                            </div>
                                        </div>
                                        
                                        <div className="col-12 col-md-3 border-start-md ps-md-4">
                                            <div className="form-check form-switch d-flex align-items-center gap-2">
                                                <input
                                                    className="form-check-input my-0"
                                                    type="checkbox"
                                                    id="negativeDurationCheck"
                                                    checked={isNegative}
                                                    onChange={(e) => setIsNegative(e.target.checked)}
                                                    style={{ width: "2.5em", height: "1.25em", cursor: "pointer" }}
                                                />
                                                <label className="form-check-label text-secondary small fw-medium" htmlFor="negativeDurationCheck" style={{ cursor: "pointer" }}>
                                                    Registrar tiempo negativo
                                                </label>
                                            </div>
                                        </div>

                                        {/* Visualizador de tiempo total dinámico */}
                                        <div className="col-12 col-md-3 text-end">
                                            <span className={`badge px-3 py-2 fs-6 fw-bold ${isNegative ? 'text-danger bg-danger-subtle' : 'text-success bg-success-subtle'}`} style={{ borderRadius: "8px" }}>
                                                Total: {isNegative ? "-" : ""}{hours}h {minutes}m
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Comentarios */}
                            <div className="col-12">
                                <label className="form-label fw-bold text-secondary small text-uppercase tracking-wider mb-2">Comentarios internos</label>
                                <textarea
                                    className="form-control p-3"
                                    rows={3}
                                    maxLength={2000}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Escriba aquí observaciones adicionales de la operación..."
                                    style={{ borderRadius: "8px" }}
                                />
                            </div>

                            {/* Acciones del Formulario */}
                            <div className="col-12 d-flex justify-content-end gap-3 mt-4 pt-2 border-top">
                                <button 
                                    type="button" 
                                    className="btn btn-light px-4 py-2 border text-secondary fw-semibold" 
                                    onClick={() => navigate(`/flight-hours/${aircraftId}`)} 
                                    disabled={loading}
                                    style={{ borderRadius: "8px" }}
                                >
                                    Cancelar
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