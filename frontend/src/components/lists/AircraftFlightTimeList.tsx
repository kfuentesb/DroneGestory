import { useCallback, useEffect, useState } from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../api";
import LoadingSpinner from "../commons/Loading";
import Pagination from "../commons/props/Pagination";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useAuth } from "../commons/hooks/useAuth";
import { styles } from "../../styles/styles";
import arroBackIcon from '../../assets/commons/arrow_back_white.svg';
import downloadIcon from '../../assets/commons/download.svg';
import { FlightTimeHistoryPdf } from "../pdf/FlightTimeHistoryPdf";

type FlightTimeDocumentation = {
    id: number;
    flightTimeId?: number | null;
    documentationType?: string | null;
    documentationName?: string | null;
    filePath?: string | null;
};

type FlightTimeDetail = {
    id: number;
    aircraftId?: number;
    aircraftManufacturer?: string | null;
    aircraftModel?: string | null;
    aircraftSerialNumber?: string | null;
    operationId?: number | null;
    operationReference?: string | null;
    flightDate: string | Date;
    durationMinutes: number;
    totalFlightTimeMinutes: number;
    flightHours?: number | null;
    totalFlightHours?: number | null;
    comments?: string | null;
    documentation?: FlightTimeDocumentation | null;
};

const formatMinutes = (minutes: number | null | undefined) => {
    if (minutes == null || Number.isNaN(minutes)) {
        return "-";
    }
    const hours = Math.floor(minutes / 60);
    const remainderMinutes = minutes % 60;
    return `${hours}h ${remainderMinutes.toString().padStart(2, "0")}m`;
};

const formatDate = (value: string | Date) => {
    const date = typeof value === "string" ? new Date(value) : value;
    if (!date || Number.isNaN(date.getTime())) {
        return "N/A";
    }
    return date.toLocaleDateString();
};

const toInputDateValue = (value: string | Date) => {
    if (typeof value === "string") {
        return value.includes("T") ? value.split("T")[0] : value;
    }
    if (Number.isNaN(value.getTime())) {
        return "";
    }
    return value.toISOString().split("T")[0];
};

const encodeDocumentPath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

const getFileNameFromPath = (path: string) => {
    const parts = path.split("/").filter(Boolean);
    return parts[parts.length - 1] || "documento";
};

const sanitizeFileName = (value: string) => value.replace(/[\\/:*?"<>|]+/g, "_");

const buildSafeFileToken = (value?: string | null) => {
    if (!value) return "aeronave";
    return value.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
};

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = sanitizeFileName(fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
};

const openDocumentationInNewTab = async (documentation: FlightTimeDocumentation) => {
    const path = documentation.documentationName || documentation.filePath;
    if (!path) {
        return;
    }
    const newTab = window.open("about:blank", "_blank");
    
    if (!newTab) {
        alert("El bloqueador de ventanas emergentes impidió abrir el documento.");
        return;
    }

    const encodedPath = path
        .split("/")
        .map(encodeURIComponent)
        .join("/");

    try {
        const response = await apiFetch(`/api/flight-time-documentation/files/${encodedPath}`);
        
        if (!response) {
            throw new Error("No se obtuvo respuesta del servidor");
        }

        const blob = await response.blob();
        const isPdfByExtension = path.toLowerCase().endsWith(".pdf");
        
        const fileBlob =
            isPdfByExtension && (!blob.type || blob.type === "application/octet-stream")
                ? new Blob([blob], { type: "application/pdf" })
                : blob;

        const objectUrl = URL.createObjectURL(fileBlob);
        newTab.location.href = objectUrl;

        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (error) {
        newTab.close();
        console.error("No se pudo cargar el documento", error);
        alert("No se pudo abrir el documento. Intenta de nuevo más tarde.");
    }
};


export default function AircraftFlightTimeList() {
    const navigate = useNavigate();
    const { role } = useAuth();
    const isAdmin = role === "ADMIN";
    const { aircraftId } = useParams<{ aircraftId: string }>();
    const [flightTimes, setFlightTimes] = useState<FlightTimeDetail[]>([]);
    const [aircraftData, setAircraftData] = useState<{ manufacturer?: string; serialNumber?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedFlight, setSelectedFlight] = useState<FlightTimeDetail | null>(null);
    const [editingFlight, setEditingFlight] = useState<FlightTimeDetail | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentationMarkedForDeletion, setDocumentationMarkedForDeletion] = useState(false);

    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [isPdfDownloading, setIsPdfDownloading] = useState(false);

    const ITEMS_PER_PAGE = 10;

    const fetchFlights = useCallback(async () => {
        setIsLoading(true);
        try {
            const endpoint = aircraftId ? `/api/flight-hours/aircraft/${aircraftId}` : "/api/flight-hours";
            const [flightResponse, aircraftResponse] = await Promise.all([
                apiFetch(endpoint),
                aircraftId ? apiFetch(`/api/aircraft/${aircraftId}`) : Promise.resolve(null)
            ]);
            const flightData = flightResponse ? await flightResponse.json() : [];
            const parsedData = Array.isArray(flightData) ? flightData : [];
            setFlightTimes(parsedData);
            
            if (aircraftResponse) {
                const aircraft = await aircraftResponse.json();
                if (aircraft) {
                    setAircraftData({
                        manufacturer: aircraft.aircraftModel?.manufacturer || aircraft.manufacturer,
                        serialNumber: aircraft.serialNumber
                    });
                }
            }
        } catch (error) {
            console.error("Error cargando tracking de horas", error);
            setFlightTimes([]);
        } finally {
            setIsLoading(false);
        }
    }, [aircraftId]);

    useEffect(() => {
        fetchFlights();
    }, [fetchFlights]);

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (window.confirm("¿Estás seguro de que deseas eliminar este registro de vuelo?")) {
            try {
                const response = await apiFetch(`/api/flight-hours/${id}`, { method: "DELETE" });
                if (response?.ok) {
                    fetchFlights();
                }
            } catch (error) {
                console.error("Error al eliminar", error);
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateError(null);
        setUpdateSuccess(false);
        if (!editingFlight) return;

        if (
            editingFlight.durationMinutes == null ||
            Number.isNaN(editingFlight.durationMinutes) ||
            editingFlight.durationMinutes === 0
        ) {
            setUpdateError("La duracion debe ser un numero valido distinto de 0.");
            return;
        }

        setUpdateLoading(true);
        try {
            const response = await apiFetch(`/api/flight-hours/${editingFlight.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    aircraftId: editingFlight.aircraftId,
                    operationId: editingFlight.operationId ?? null,
                    flightDate:
                        typeof editingFlight.flightDate === "string"
                            ? editingFlight.flightDate
                            : editingFlight.flightDate.toISOString().split("T")[0],
                    durationMinutes: editingFlight.durationMinutes,
                    comments: editingFlight.comments?.trim() || null,
                }),
            });

            if (!response) {
                throw new Error("Sin respuesta del servidor");
            }

            if (selectedFile) {
                const formData = new FormData();
                formData.append("documentationLabel", "Documentacion de horas de vuelo");
                formData.append("dateIndefinite", "true");
                formData.append("file", selectedFile);

                await apiFetch(`/api/flight-time-documentation/flight-time/${editingFlight.id}/upload`, {
                    method: "POST",
                    body: formData,
                });
            } else if (documentationMarkedForDeletion) {
                await apiFetch(`/api/flight-time-documentation/flight-time/${editingFlight.id}`, {
                    method: "DELETE",
                });
            }

            setEditingFlight(null);
            setSelectedFile(null);
            setDocumentationMarkedForDeletion(false);
            setUpdateSuccess(true);
            await fetchFlights();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Desconocido";
            setUpdateError("Error al actualizar: " + message);
            console.error("Error al actualizar", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const resetEditState = () => {
        setEditingFlight(null);
        setSelectedFile(null);
        setDocumentationMarkedForDeletion(false);
        setUpdateError(null);
        setUpdateSuccess(false);
        setUpdateLoading(false);
    };

    const handleEditStart = (flight: FlightTimeDetail) => {
        setEditingFlight(flight);
        setSelectedFile(null);
        setDocumentationMarkedForDeletion(false);
        setUpdateError(null);
        setUpdateSuccess(false);
    };

    if (isLoading) {
        return <LoadingSpinner message="Cargando horas de vuelo..." />;
    }

    const filteredFlights = useSearchFilter(flightTimes, search, (f) => [
        f.operationReference ?? "",
        f.aircraftSerialNumber ?? "",
    ]);

    const flightsForReport = filteredFlights;

    const getAircraftForReport = (recordsList: FlightTimeDetail[]) => {
        if (aircraftId) {
            const first = recordsList[0];
            return {
                manufacturer: first?.aircraftManufacturer ?? "Aeronave",
                model: first?.aircraftModel ?? "",
                serialNumber: first?.aircraftSerialNumber ?? aircraftId,
            };
        }
        return {
            manufacturer: "Todas las",
            model: "aeronaves",
            serialNumber: "",
        };
    };

    const buildReportToken = (recordsList: FlightTimeDetail[]) => {
        if (aircraftId) {
            return buildSafeFileToken(recordsList[0]?.aircraftSerialNumber ?? aircraftId);
        }
        return "general";
    };

    const downloadPdfBlob = async (
        pdfDocument: React.ReactElement<DocumentProps>, 
        fileName: string
    ) => {
        const blob = await pdf(pdfDocument).toBlob();
        downloadBlob(blob, fileName);
    };

    const downloadFlightTimeAttachments = async (recordsList: FlightTimeDetail[], fileToken: string) => {
        const attachments = recordsList
            .map((record) => {
                const doc = record.documentation;
                if (!doc) return null;
                const path = doc.filePath || doc.documentationName;
                if (!path) return null;
                const name = sanitizeFileName(doc.documentationName || getFileNameFromPath(path));
                return { path, name };
            })
            .filter((item): item is { path: string; name: string } => Boolean(item));

        if (attachments.length === 0) {
            return;
        }

        if (attachments.length === 1) {
            const response = await apiFetch(`/api/flight-time-documentation/files/${encodeDocumentPath(attachments[0].path)}`);
            if (!response) throw new Error("Sin respuesta del servidor");
            const blob = await response.blob();
            downloadBlob(blob, attachments[0].name);
            return;
        }

        const nameCount = new Map<string, number>();

        const results = await Promise.allSettled(
            attachments.map(async (attachment) => {
                const response = await apiFetch(`/api/flight-time-documentation/files/${encodeDocumentPath(attachment.path)}`);
                if (!response) throw new Error("Sin respuesta del servidor");
                const blob = await response.blob();
                return { name: attachment.name, blob };
            })
        );

        results.forEach((result) => {
            if (result.status !== "fulfilled") return;
            const baseName = result.value.name || "documento";
            const current = nameCount.get(baseName) ?? 0;
            nameCount.set(baseName, current + 1);
            const extIndex = baseName.lastIndexOf(".");
            const hasExt = extIndex > 0;
            const base = hasExt ? baseName.slice(0, extIndex) : baseName;
            const ext = hasExt ? baseName.slice(extIndex) : "";
            const uniqueName = current === 0 ? baseName : `${base}_${current + 1}${ext}`;
            downloadBlob(result.value.blob, uniqueName);
        });
    };

    const handleDownloadHistory = async () => {
        if (isPdfDownloading) return;
        if (flightsForReport.length === 0) {
            alert("No hay registros de horas de vuelo para descargar.");
            return;
        }
        setIsPdfDownloading(true);
        try {
            const aircraft = getAircraftForReport(flightsForReport);
            const fileToken = buildReportToken(flightsForReport);
            await downloadPdfBlob(
                <FlightTimeHistoryPdf aircraft={aircraft} flightTimes={flightsForReport} />,
                `Historial_HorasVuelo_${fileToken}.pdf`
            );
            await downloadFlightTimeAttachments(flightsForReport, fileToken);
        } catch (err) {
            console.error("Error descargando historial de horas de vuelo", err);
            alert("No se pudo descargar el historial de horas de vuelo.");
        } finally {
            setIsPdfDownloading(false);
        }
    };

    const paginatedFlights = filteredFlights.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const headers: TableHeader[] = [
        { label: "Fabricante", key: "aircraftManufacturer", sortable: true },
        { label: "Modelo", key: "aircraftModel", sortable: true },
        { label: "N Serie", key: "aircraftSerialNumber", sortable: true },
        { label: "Ref. Operación", key: "operationReference", sortable: true },
        { label: "Fecha vuelo", key: "flightDate", sortable: true },
        { label: "Duración", key: "durationMinutes", sortable: true },
        { label: "Total horas", key: "totalFlightTimeMinutes", sortable: true },
        { label: "Comentarios", key: "comments", sortable: false },
        { label: "Documentación", key: "documentation", sortable: false },
    ];

    if (isAdmin) {
        headers.push({ label: "Acciones", key: "actions", sortable: false });
    }

    const aircraftSerial = aircraftData?.serialNumber || (aircraftId && flightTimes.length > 0 
        ? flightTimes[0].aircraftSerialNumber 
        : null);

    const aircraftManufacturer = aircraftData?.manufacturer || (aircraftId && flightTimes.length > 0 
        ? flightTimes[0].aircraftManufacturer 
        : null);

    const heading = aircraftId 
        ? aircraftManufacturer 
            ? `Horas de vuelo de la aeronave: ${aircraftManufacturer} (S/N: ${aircraftSerial || "N/A"})`
            : `Horas de vuelo de la aeronave: ${aircraftSerial || aircraftId}`
        : "Registro de Horas de Vuelo";

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">
                    <div className="position-relative d-flex align-items-center justify-content-center mb-2 pb-3 w-100">
                        <button 
                            className="btn d-flex align-items-center justify-content-center flex-shrink-0 position-absolute start-0" 
                            onClick={() => navigate("/flight-hours")}
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
                        
                        <h2 className="mb-0 fw-bold text-center" style={{ color: "#1E1E1E", paddingLeft: "60px", paddingRight: "60px" }}>
                            {heading}
                        </h2>
                    </div>
                    <style>{`
                        .flight-time-positive-row td {
                            background-color: rgba(25, 135, 84, 0.05) !important;
                        }
                        .flight-time-negative-row td {
                            background-color: rgba(220, 53, 69, 0.05) !important;
                        }
                        .flight-time-positive-row td:first-child {
                            border-left: 4px solid #198754 !important;
                        }
                        .flight-time-positive-row td:last-child {
                            border-right: 4px solid #198754 !important;
                        }
                        .flight-time-negative-row td:first-child {
                            border-left: 4px solid #dc3545 !important;
                        }
                        .flight-time-negative-row td:last-child {
                            border-right: 4px solid #dc3545 !important;
                        }
                        .text-truncate-custom {
                            max-width: 200px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        
                        /* Clases personalizadas para la vista de tarjetas en móvil */
                        .flight-card-positive {
                            border-left: 4px solid #198754 !important;
                            background-color: rgba(25, 135, 84, 0.02);
                        }
                        .flight-card-negative {
                            border-left: 4px solid #dc3545 !important;
                            background-color: rgba(220, 53, 69, 0.02);
                        }
                        
                        @media (min-width: 992px) {
                            .text-truncate-custom {
                                max-width: 200px;
                            }
                        }
                    `}</style>

                    <div className="row g-3 mb-4 align-items-center">
                        <div className="col-12 col-md-6">
                        <SearchBar value={search} placeholder="Buscar por tipo o comentario..." onChange={setSearch} />
                        </div>
                        <div className="col-12 col-md-6 d-flex justify-content-md-end gap-2">
                            <button
                                type="button"
                                className="btn btn-dark d-flex align-items-center gap-2 px-3 shadow-sm"
                                style={{ borderRadius: "8px" }}
                                onClick={() => void handleDownloadHistory()}
                                disabled={isPdfDownloading}
                            >
                                <img src={downloadIcon} alt="" style={{ width: 16, height: 16, filter: "brightness(0) invert(1)" }} />
                                <span>{isPdfDownloading ? "Generando..." : "Descargar"}</span>
                            </button>
                            
                            <ButtonProp 
                                type="button" 
                                onClick={() => navigate(`/flight-hours/${aircraftId}/register`)}
                            >
                                <span className="d-none d-sm-inline">+ Registrar Horas</span>
                                <span className="d-sm-none">+ Añadir Horas</span>
                            </ButtonProp>
                        </div>
                    </div>

                    <Pagination
                        totalItems={filteredFlights.length}
                        currentPage={currentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />

                    {/* VISTA ESCRITORIO: Se oculta en pantallas pequeñas (d-none d-md-block) */}
                    <div className="d-none d-md-block">
                        <ReusableTable
                            headers={headers}
                            rows={paginatedFlights}
                            onRowClick={(row: FlightTimeDetail) => setSelectedFlight(row)}
                            rowClassName={(row) => {
                                const base = "cursor-pointer ";
                                if (row.durationMinutes > 0) return base + "flight-time-positive-row";
                                if (row.durationMinutes < 0) return base + "flight-time-negative-row";
                                return base;
                            }}
                            renderRow={(row: FlightTimeDetail) => (
                                <>
                                    <td>{row.aircraftManufacturer ?? "N/A"}</td>
                                    <td>{row.aircraftModel ?? "N/A"}</td>
                                    <td>{row.aircraftSerialNumber ?? "N/A"}</td>
                                    <td>{row.operationReference ?? "N/A"}</td>
                                    <td>{formatDate(row.flightDate)}</td>
                                    <td>{formatMinutes(row.durationMinutes)}</td>
                                    <td>{formatMinutes(row.totalFlightTimeMinutes)}</td>
                                    <td>
                                        <div className="text-truncate-custom" title={row.comments ?? ""}>
                                            {row.comments?.trim() ? row.comments : "N/A"}
                                        </div>
                                    </td>
                                    <td className="fw-medium">
                                        {row.documentation?.documentationName || row.documentation?.filePath ? (
                                            <span className="text-success">Sí</span>
                                        ) : (
                                            <span className="text-muted">No</span>
                                        )}
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <div className="d-flex gap-1">
                                                <button 
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={(e) => { e.stopPropagation(); handleEditStart(row); }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={(e) => handleDelete(e, row.id)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </>
                            )}
                            emptyText={aircraftId ? "No hay registros de horas de vuelo para esta aeronave." : "No hay registros de horas de vuelo."}
                        />
                    </div>

                    {/* VISTA MÓVIL: Se muestra como Tarjetas en pantallas pequeñas (d-block d-md-none) */}
                    <div className="d-block d-md-none">
                        {paginatedFlights.length === 0 ? (
                            <div className="text-center text-muted my-4 p-3 bg-light rounded small">
                                {aircraftId ? "No hay registros de horas de vuelo para esta aeronave." : "No hay registros de horas de vuelo."}
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {paginatedFlights.map((row: FlightTimeDetail) => {
                                    let cardStyleClass = "";
                                    if (row.durationMinutes > 0) cardStyleClass = "flight-card-positive";
                                    if (row.durationMinutes < 0) cardStyleClass = "flight-card-negative";

                                    return (
                                        <div 
                                            key={row.id} 
                                            className={`card shadow-sm cursor-pointer p-3 ${cardStyleClass}`}
                                            onClick={() => setSelectedFlight(row)}
                                            style={{ borderRadius: "8px", border: "1px solid #E5E7EB" }}
                                        >
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h6 className="mb-0 fw-bold text-dark">
                                                        {row.aircraftManufacturer ?? "N/A"} {row.aircraftModel ?? ""}
                                                    </h6>
                                                    <small className="text-muted d-block mt-0.5">
                                                        S/N: {row.aircraftSerialNumber ?? "N/A"} | Ref: {row.operationReference ?? "N/A"}
                                                    </small>
                                                </div>
                                                <span className="badge bg-light text-dark border small fw-normal">
                                                    {formatDate(row.flightDate)}
                                                </span>
                                            </div>

                                            <div className="row g-2 my-1 py-2 border-top border-bottom bg-white rounded-2 px-1">
                                                <div className="col-6">
                                                    <small className="text-muted d-block text-uppercase" style={{ fontSize: "10px", fontWeight: "bold" }}>Duración</small>
                                                    <span className={`fw-bold small ${row.durationMinutes >= 0 ? "text-success" : "text-danger"}`}>
                                                        {formatMinutes(row.durationMinutes)}
                                                    </span>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block text-uppercase" style={{ fontSize: "10px", fontWeight: "bold" }}>Acumulado</small>
                                                    <span className="fw-bold small text-dark">
                                                        {formatMinutes(row.totalFlightTimeMinutes)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-center mt-2 pt-1">
                                                <div className="small text-truncate me-2" style={{ maxWidth: "60%" }}>
                                                    <span className="text-muted fw-bold">Comentarios: </span>
                                                    <span className="text-secondary">{row.comments?.trim() ? row.comments : "N/A"}</span>
                                                </div>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="small">
                                                        <span className="text-muted fw-bold">Doc: </span>
                                                        {row.documentation?.documentationName || row.documentation?.filePath ? (
                                                            <span className="text-success fw-medium">Sí</span>
                                                        ) : (
                                                            <span className="text-muted">No</span>
                                                        )}
                                                    </div>
                                                    
                                                    {isAdmin && (
                                                        <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                            <button 
                                                                className="btn btn-sm btn-outline-primary p-1 d-flex align-items-center justify-content-center"
                                                                onClick={() => handleEditStart(row)}
                                                                style={{ width: "28px", height: "28px" }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger p-1 d-flex align-items-center justify-content-center"
                                                                onClick={(e) => handleDelete(e, row.id)}
                                                                style={{ width: "28px", height: "28px" }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <Pagination
                        totalItems={filteredFlights.length}
                        currentPage={currentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />

                    {/* MODAL DE EDICIÓN */}
                    {editingFlight && (
                        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <form className="modal-content border-0 shadow-lg" onSubmit={handleUpdate}>
                                    <div className="modal-header bg-dark text-white">
                                        <h5 className="modal-title fw-bold">Modificar Registro</h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={resetEditState}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        {updateError && (
                                            <div className="alert alert-danger py-2 small" role="alert">{updateError}</div>
                                        )}
                                        {updateSuccess && (
                                            <div className="alert alert-success py-2 small" role="alert">Guardado correctamente.</div>
                                        )}
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label small fw-bold text-muted">FECHA DE VUELO</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={toInputDateValue(editingFlight.flightDate)}
                                                    onChange={(e) => setEditingFlight({ ...editingFlight, flightDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label small fw-bold text-muted">DURACIÓN (MINUTOS)</label>
                                                <input type="number" className="form-control" value={editingFlight.durationMinutes} onChange={(e) => setEditingFlight({...editingFlight, durationMinutes: parseInt(e.target.value)})} required />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label small fw-bold text-muted">COMENTARIOS</label>
                                                <textarea className="form-control" rows={3} value={editingFlight.comments || ""} onChange={(e) => setEditingFlight({...editingFlight, comments: e.target.value})} />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small fw-bold text-muted">DOCUMENTACIÓN ADJUNTA</label>
                                                {editingFlight.documentation?.documentationName ? (
                                                    <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded border mb-2">
                                                        <span className="small text-truncate">{editingFlight.documentation.documentationName}</span>
                                                        <button
                                                            type="button"
                                                            className="btn border-0 d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: "32px",
                                                                height: "32px",
                                                                backgroundColor: "#dc3545",
                                                                color: "#ffffff",
                                                                borderRadius: "6px",
                                                                padding: 0,
                                                                flexShrink: 0,
                                                            }}
                                                            onClick={() => {
                                                                setEditingFlight({ ...editingFlight, documentation: null });
                                                                setSelectedFile(null);
                                                                setDocumentationMarkedForDeletion(true);
                                                            }}
                                                            aria-label="Eliminar documentacion"
                                                        >
                                                            <span style={{ fontSize: "20px", lineHeight: 1, fontWeight: 700 }}>X</span>
                                                        </button>
                                                    </div>
                                                ) : null}
                                                <div className="input-group">
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        onChange={(e) => {
                                                            setSelectedFile(e.target.files?.[0] || null);
                                                            if (e.target.files?.[0]) {
                                                                setDocumentationMarkedForDeletion(false);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                {documentationMarkedForDeletion && !selectedFile && (
                                                    <small className="text-danger d-block mt-2">
                                                        La documentacion actual se eliminara al guardar.
                                                    </small>
                                                )}
                                                {selectedFile && (
                                                    <small className="text-muted d-block mt-2">
                                                        Se subira: {selectedFile.name}
                                                    </small>
                                                )}
                                                {!selectedFile && !editingFlight.documentation && !documentationMarkedForDeletion && (
                                                    <small className="text-muted d-block mt-2">
                                                        Puedes adjuntar un archivo opcional.
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer bg-light border-0">
                                        <button type="button" className="btn btn-outline-secondary" onClick={resetEditState}>Cancelar</button>
                                        <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={updateLoading}>
                                            {updateLoading ? "Guardando..." : "Guardar"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* MODAL DETALLE */}
                    {selectedFlight && (
                        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content border-0">
                                    <div className={`modal-header text-white ${selectedFlight.durationMinutes >= 0 ? "bg-success" : "bg-danger"}`}>
                                        <h5 className="modal-title">Detalle del Registro</h5>
                                        <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedFlight(null)}></button>
                                    </div>
                                    <div className="modal-body p-4">
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Aeronave</label>
                                                <span className="fw-bold">{selectedFlight.aircraftManufacturer} {selectedFlight.aircraftModel}</span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Nº Serie</label>
                                                <span className="fw-bold">{selectedFlight.aircraftSerialNumber}</span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Fecha</label>
                                                <span>{formatDate(selectedFlight.flightDate)}</span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Referencia</label>
                                                <span>{selectedFlight.operationReference || "N/A"}</span>
                                            </div>
                                            <hr />
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Duración sesión</label>
                                                <span className={`fw-bold ${selectedFlight.durationMinutes >= 0 ? "text-success" : "text-danger"}`}>
                                                    {formatMinutes(selectedFlight.durationMinutes)}
                                                </span>
                                            </div>
                                            <div className="col-6">
                                                <label className="text-muted small d-block">Total Acumulado</label>
                                                <span className="fw-bold">{formatMinutes(selectedFlight.totalFlightTimeMinutes)}</span>
                                            </div>
                                            <div className="col-12">
                                                <label className="text-muted small d-block">Comentarios</label>
                                                <p className="bg-light p-2 rounded small" style={{ minHeight: "60px" }}>
                                                    {selectedFlight.comments || "Sin comentarios."}
                                                </p>
                                            </div>
                                            
                                            <div className="col-12 border-top pt-3 mt-2">
                                                <label className="text-muted small d-block mb-2">Documentación adjunta</label>
                                                {selectedFlight.documentation?.documentationName || selectedFlight.documentation?.filePath ? (
                                                    <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded border">
                                                        <span className="small text-truncate me-2">
                                                            {selectedFlight.documentation?.documentationName || "Archivo adjunto"}
                                                        </span>
                                                        <button 
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => openDocumentationInNewTab(selectedFlight.documentation as FlightTimeDocumentation)}
                                                        >
                                                            Ver Documento
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small italic">No hay documentos cargados.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedFlight(null)}>Cerrar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
