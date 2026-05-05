import { Fragment, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { apiFetch } from "../../api";
import { useAuth } from "../commons/hooks/useAuth";
import LoadingSpinner from "../commons/Loading";

type DocumentVersion = {
    id: number;
    versionNumber: number;
    fileUrl: string;
    uploadNotes?: string | null;
    createdAt?: string | null;
};

type OperationDocumentation = {
    id: number;
    name: string;
    latestVersion?: DocumentVersion | null;
    versions?: DocumentVersion[];
};

type FormState = {
    id?: number;
    name: string;
    notes: string;
    file: File | null;
};

const emptyForm: FormState = {
    name: "",
    notes: "",
    file: null,
};

function fileName(path?: string | null) {
    if (!path) return "-";
    return path.split("/").pop() || path;
}

function formatDate(value?: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
}

async function openDocumentationFile(version?: DocumentVersion | null) {
    if (!version?.fileUrl) return;

    const newTab = window.open("about:blank", "_blank");
    if (!newTab) {
        alert("El bloqueador de ventanas emergentes impidio abrir el documento.");
        return;
    }

    const encodedPath = version.fileUrl.split("/").map(encodeURIComponent).join("/");

    try {
        const response = await apiFetch(`/api/operation-documentation/files/${encodedPath}`);
        if (!response) throw new Error("Sin respuesta del servidor");

        const blob = await response.blob();
        const isPdfByExtension = version.fileUrl.toLowerCase().endsWith(".pdf");
        const fileBlob =
            isPdfByExtension && (!blob.type || blob.type === "application/octet-stream")
                ? new Blob([blob], { type: "application/pdf" })
                : blob;
        const objectUrl = URL.createObjectURL(fileBlob);
        newTab.location.href = objectUrl;
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (error) {
        newTab.close();
        console.error("No se pudo abrir la documentación", error);
        alert("No se pudo abrir el documento.");
    }
}

export default function OperationDocumentationList() {
    const { hasRole } = useAuth();
    const canManage = hasRole("ADMIN") || hasRole("MANAGER");

    const [documentations, setDocumentations] = useState<OperationDocumentation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const loadDocumentations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch("/api/operation-documentation");
            const data = response ? await response.json() : [];
            setDocumentations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error cargando documentación de operaciones", err);
            setError("No se pudo cargar la documentación.");
            setDocumentations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDocumentations();
    }, [loadDocumentations]);

    const filteredDocumentations = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return documentations;
        return documentations.filter((documentation) =>
            [
                documentation.name,
                documentation.latestVersion?.fileUrl,
                documentation.latestVersion?.uploadNotes,
            ].some((value) => value?.toLowerCase().includes(term))
        );
    }, [documentations, search]);

    const openCreateForm = () => {
        setError(null);
        setForm({ ...emptyForm });
    };

    const openEditForm = (documentation: OperationDocumentation) => {
        setError(null);
        setForm({
            id: documentation.id,
            name: documentation.name,
            notes: "",
            file: null,
        });
    };

    const closeForm = () => {
        if (saving) return;
        setForm(null);
        setError(null);
    };

    const saveDocumentation = async (event: FormEvent) => {
        event.preventDefault();
        if (!form) return;

        if (!form.name.trim()) {
            setError("El nombre es obligatorio.");
            return;
        }
        if (!form.id && !form.file) {
            setError("El archivo es obligatorio al crear documentación.");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const body = new FormData();
            body.append("name", form.name.trim());
            if (form.notes.trim()) {
                body.append("notes", form.notes.trim());
            }
            if (form.file) {
                body.append("file", form.file);
            }

            await apiFetch(
                form.id ? `/api/operation-documentation/${form.id}` : "/api/operation-documentation",
                {
                    method: form.id ? "PUT" : "POST",
                    body,
                }
            );

            setForm(null);
            await loadDocumentations();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error desconocido";
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    const deleteDocumentation = async (documentation: OperationDocumentation) => {
        if (!window.confirm(`Eliminar "${documentation.name}" y todas sus versiones?`)) {
            return;
        }

        try {
            await apiFetch(`/api/operation-documentation/${documentation.id}`, { method: "DELETE" });
            await loadDocumentations();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error desconocido";
            setError(message);
        }
    };

    const handleDeleteVersion = async (docId: number, versionId: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta versión específica?")) return;

        try {
            const response = await apiFetch(`/api/operation-documentation/${docId}/versions/${versionId}`, { method: "DELETE" });

            if (response && response.ok) {
                const updatedDoc: OperationDocumentation = await response.json();
                
                setDocumentations((prev: OperationDocumentation[]) => 
                    prev.map(d => d.id === docId ? updatedDoc : d)
                );
            } else {
                alert("Error borrando versión de documentación de operación");
            }
        } catch (err) {
            console.error("Error eliminando versión:", err);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Cargando documentación..." />;
    }

    return (
        <div className="container py-4">
            <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
                        <div>
                            <h2 className="card-title mb-1" style={{ color: "#1E1E1E" }}>
                                Documentación de operaciones
                            </h2>
                            <p className="text-muted mb-0">
                                {canManage
                                    ? "Gestiona documentos y nuevas versiones."
                                    : "Consulta la última versión disponible de cada documento."}
                            </p>
                        </div>
                        {canManage && (
                            <button className="btn btn-success" onClick={openCreateForm}>
                                + Añadir documentación
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="alert alert-danger py-2" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="mb-3">
                        <input
                            className="form-control"
                            placeholder="Buscar documentación..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    <div className="table-responsive">

                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Última versión</th>
                                    <th>Fecha</th>
                                    {canManage && <th>Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocumentations.map((documentation) => {
                                    const latest = documentation.latestVersion;
                                    const isExpanded = expandedId === documentation.id;

                                    return (
                                        <Fragment key={documentation.id}>
                                            <tr className="align-middle">
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <i className="bi bi-file-earmark-text text-primary me-2 fs-5"></i>
                                                        <span 
                                                            className="fw-bold text-primary"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => void openDocumentationFile(latest)}
                                                        >
                                                            {documentation.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge rounded-pill bg-light text-dark border">
                                                        {latest ? `v${latest.versionNumber}` : "v0.0"}
                                                    </span>
                                                </td>
                                                <td className="text-muted small">
                                                    {formatDate(latest?.createdAt)}
                                                </td>
                                                {canManage && (
                                                    <td>
                                                        <div className="btn-group shadow-sm">
                                                            <button
                                                                className={`btn btn-sm ${isExpanded ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                                                onClick={() => setExpandedId(isExpanded ? null : documentation.id)}
                                                                title="Historial de versiones"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="M480-120q-138 0-240.5-91.5T122-440h82q14 104 92.5 172T480-200q117 0 198.5-81.5T760-480q0-117-81.5-198.5T480-760q-69 0-129 32t-101 88h110v80H120v-240h80v94q51-64 124.5-99T480-840q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-480q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Zm112-192L440-464v-216h80v184l128 128-56 56Z"/></svg>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-primary mx-1"
                                                                onClick={() => openEditForm(documentation)}
                                                                title="Editar"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                                                                    <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => void deleteDocumentation(documentation)}
                                                                title="Eliminar"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                                                                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                            {canManage && isExpanded && (
                                                <tr>
                                                    <td colSpan={4} className="p-0 border-0">
                                                        <div className="bg-light p-3 border-start border-4 border-success">
                                                            <h6 className="mb-3 small text-uppercase fw-bold text-success">
                                                                <i className="bi bi-layers-half me-2"></i>Historial de Versiones
                                                            </h6>
                                                            {documentation.versions && documentation.versions.length > 0 ? (
                                                                <div className="table-responsive rounded shadow-sm bg-white">
                                                                    <table className="table table-sm table-hover mb-0 small">
                                                                        <thead className="table-dark">
                                                                            <tr>
                                                                                <th className="ps-3">Versión</th>
                                                                                <th>Archivo</th>
                                                                                <th>Notas de cambios</th>
                                                                                <th>Fecha subida</th>
                                                                                <th>Borrado versión</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {documentation.versions.map((version) => (
                                                                                <tr key={version.id} className="align-middle">
                                                                                    <td className="ps-3 fw-bold text-success">v{version.versionNumber}</td>
                                                                                    <td 
                                                                                        className="text-primary fw-medium" 
                                                                                        onClick={() => void openDocumentationFile(version)}
                                                                                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                                                    >
                                                                                        <i className="bi bi-download me-1 small"></i>
                                                                                        {fileName(version.fileUrl)}
                                                                                    </td>
                                                                                    <td className="text-muted italic">{version.uploadNotes || "Sin notas"}</td>
                                                                                    <td>{formatDate(version.createdAt)}</td>
                                                                                    <td>
                                                                                        <button
                                                                                            className="btn btn-sm btn-outline-danger"
                                                                                            onClick={() => void handleDeleteVersion(version.id, version.versionNumber)}
                                                                                            title="Eliminar"
                                                                                        >
                                                                                            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor">
                                                                                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                                                                                            </svg>
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-2">
                                                                    <span className="text-muted small">No hay versiones registradas.</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filteredDocumentations.length === 0 && (
                        <div className="text-center text-muted py-4">
                            No hay documentación disponible.
                        </div>
                    )}
                </div>
            </div>

            {form && canManage && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <form className="modal-content" onSubmit={saveDocumentation}>
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {form.id ? "Modificar documentación" : "Añadir documentación"}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeForm}></button>
                            </div>
                            <div className="modal-body">
                                {error && (
                                    <div className="alert alert-danger py-2" role="alert">
                                        {error}
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Nombre</label>
                                    <input
                                        className="form-control"
                                        value={form.name}
                                        onChange={(event) => setForm({ ...form, name: event.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">
                                        {form.id ? "Nuevo archivo para crear version" : "Archivo"}
                                    </label>
                                    <input
                                        className="form-control"
                                        type="file"
                                        onChange={(event) =>
                                            setForm({ ...form, file: event.target.files?.[0] ?? null })
                                        }
                                        required={!form.id}
                                    />
                                    {form.id && (
                                        <small className="text-muted">
                                            Si seleccionas archivo se creara la siguiente version.
                                        </small>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Notas de version</label>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={form.notes}
                                        onChange={(event) => setForm({ ...form, notes: event.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" onClick={closeForm}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
