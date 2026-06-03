import { useCallback, useEffect, useState, useRef, type ChangeEvent } from "react";
import { Filemanager, Willow } from "@svar-ui/react-filemanager";
import type { IApi, IEntity } from "@svar-ui/filemanager-store";
import "@svar-ui/react-filemanager/all.css";
import ConfirmModal from "../commons/ConfirmModal";
import { API_BASE_URL } from "../../api";

export default function FileBrowserView() {
    const [data, setData] = useState<IEntity[]>([]);
    const [selectedFileId, setSelectedFileId] = useState("");
    const [searchSelectedPath, setSearchSelectedPath] = useState("");
    const [filemanagerKey, setFilemanagerKey] = useState(0);
    const [isSearchMode, setIsSearchMode] = useState(false);

    // --- NUEVO: Estado de la pestaña activa y su mapeo al backend ---
    const [activeTab, setActiveTab] = useState<"database" | "backups">("database");
    const backendType = activeTab === "database" ? "uploads" : "backups";

    const [modalConfig, setModalConfig] = useState<{
        show: boolean;
        title?: string;
        message: string;
        variant: "primary" | "danger" | "warning";
        onConfirm: () => void;
    }>({
        show: false,
        message: "",
        variant: "primary",
        onConfirm: () => { },
    });

    const isSearchModeRef = useRef(false);
    const searchWasJustClearedRef = useRef(false);

    useEffect(() => {
        isSearchModeRef.current = isSearchMode;
    }, [isSearchMode]);

    // --- NUEVO: Efecto limpiador y reseteo absoluto al cambiar de pestaña ---
    useEffect(() => {
        setFilemanagerKey(prev => prev + 1);
        setSelectedFileId("");
        setSearchSelectedPath("");
        setIsSearchMode(false);
        isSearchModeRef.current = false;
    }, [activeTab]);

    const authHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    // --- MODIFICADO: loadRoot con parámetro type ---
    const loadRoot = useCallback(async () => {
        const res = await fetch(`${API_BASE_URL}/api/files/list?type=${backendType}`, {
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error(`Failed root load (${res.status})`);
        const items = (await res.json()) as IEntity[];
        setData(items);
    }, [backendType]);

    useEffect(() => {
        loadRoot().catch((err) => {
            console.error("Error loading root files:", err);
            setData([]);
        });
    }, [loadRoot]);

    // --- MODIFICADO: openFileInTab con parámetro type ---
    const openFileInTab = useCallback(async (id: string) => {
        const newTab = window.open("about:blank", "_blank");
        if (!newTab) {
            alert("Please allow popups");
            return;
        }
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/files/content?path=${encodeURIComponent(id)}&type=${backendType}`,
                { headers: authHeaders() }
            );
            if (!res.ok) throw new Error("Failed file open");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            newTab.location.href = url;
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (err) {
            newTab.close();
            console.error("Error opening file:", err);
        }
    }, [backendType]);

    // --- MODIFICADO: deleteFileAndSync con parámetro type ---
    const deleteFileAndSync = useCallback(async (id: string) => {
        const res = await fetch(`${API_BASE_URL}/api/admin/files/remove?type=${backendType}`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ path: id }),
        });

        const body = await res.json();
        if (!res.ok || !body.ok) {
            throw new Error(body.error || "Failed to delete file");
        }
    }, [backendType]);

    // --- MODIFICADO: replaceFileAndSync con parámetro type ---
    const replaceFileAndSync = useCallback(async (id: string, file: File) => {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("path", id);
        formData.append("file", file);

        const res = await fetch(`${API_BASE_URL}/api/admin/files/replace?type=${backendType}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData,
        });

        const body = await res.json();
        if (!res.ok || !body.ok) {
            throw new Error(body.error || "Failed to replace file");
        }
    }, [backendType]);

    // --- MODIFICADO: Evasión automática si estamos en modo backups ---
    const isDatabaseManagedPath = (id?: string | null) => {
        if (backendType === "backups") return false;
        if (!id) return false;
        const clean = String(id).replace(/^\/+/, "");
        return clean === "database-relationed" || clean.startsWith("database-relationed/");
    };

    // --- MODIFICADO: createManualFolder con parámetro type ---
    const createManualFolder = useCallback(async (parent: string, name: string) => {
        const res = await fetch(`${API_BASE_URL}/api/admin/files/folder?type=${backendType}`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ parent, name }),
        });
        const body = await res.json();
        if (!res.ok || !body.ok) {
            throw new Error(body.error || "Failed to create folder");
        }
    }, [backendType]);

    // --- MODIFICADO: uploadManualFile con parámetro type ---
    const uploadManualFile = useCallback(async (parent: string, file: File) => {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("parent", parent);
        formData.append("file", file);

        const res = await fetch(`${API_BASE_URL}/api/admin/files/upload?type=${backendType}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData,
        });
        const body = await res.json();
        if (!res.ok || !body.ok) {
            throw new Error(body.error || "Failed to upload file");
        }
    }, [backendType]);

    // --- MODIFICADO: renameManualPath con parámetro type ---
    const renameManualPath = useCallback(async (path: string, name: string) => {
        const res = await fetch(`${API_BASE_URL}/api/admin/files/rename?type=${backendType}`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ path, name }),
        });
        const body = await res.json();
        if (!res.ok || !body.ok) {
            throw new Error(body.error || "Failed to rename");
        }
    }, [backendType]);

    const closeModal = () => setModalConfig(prev => ({ ...prev, show: false }));

    const init = useCallback((api: IApi) => {
        api.intercept("filter-files", ({ text }) => {
            const searching = !!text;

            searchWasJustClearedRef.current = !searching && isSearchModeRef.current;
            isSearchModeRef.current = searching;
            setIsSearchMode(searching);

            if (searching) {
                setSearchSelectedPath("");
            }
        });

        api.intercept("open-file", async ({ id }) => {
            if (id) {
                setSearchSelectedPath(String(id));
            }
            searchWasJustClearedRef.current = false;

            if (id) openFileInTab(String(id));
            return false;
        });

        api.intercept("select-file", ({ id }) => {
            if (!id) {
                setSelectedFileId("");
                setSearchSelectedPath("");
                return;
            }
            const file = api.getFile(id);
            setSearchSelectedPath(String(id));
            setSelectedFileId(file?.type === "file" ? String(id) : "");
        });

        api.intercept("set-path", ({ id }) => {
            if (id) {
                setSearchSelectedPath(String(id));
            }
            searchWasJustClearedRef.current = false;
        });

        api.intercept("delete-files", ({ ids }) => {
            const fileIds = (ids ?? []).map(String);
            if (!fileIds.length) return false;

            const involvesDatabase = fileIds.some(id => isDatabaseManagedPath(id));

            setModalConfig({
                show: true,
                title: "Confirmar eliminación",
                variant: "danger",
                message: involvesDatabase
                    ? `¿Estás seguro de eliminar ${fileIds.length} archivo(s)? Esta acción actualizará la base de datos y eliminará el archivo físico.`
                    : `¿Estás seguro de eliminar ${fileIds.length} archivo(s)? Esta acción eliminará el archivo físico.`,
                onConfirm: async () => {
                    closeModal();
                    try {
                        for (const fileId of fileIds) {
                            await deleteFileAndSync(fileId);
                        }
                        setFilemanagerKey(k => k + 1);
                        await loadRoot();
                        setSelectedFileId("");
                    } catch (err: any) {
                        setModalConfig({
                            show: true,
                            title: "Error",
                            message: err.message,
                            variant: "warning",
                            onConfirm: closeModal
                        });
                    }
                }
            });

            return false;
        });

        api.intercept("create-file", async ({ file, parent }) => {
            const parentPath = String(parent || "/");
            if (isDatabaseManagedPath(parentPath)) {
                alert("This folder is managed by the database. Use the related app screen to add files there.");
                return false;
            }

            try {
                if (file?.type === "folder") {
                    await createManualFolder(parentPath, file.name);
                } else {
                    const uploadFile = file?.file || new File([""], file?.name || "new-file");
                    await uploadManualFile(parentPath, uploadFile);
                }
                setFilemanagerKey((current) => current + 1);
                await loadRoot();
                return true;
            } catch (err: any) {
                alert(`Error: ${err.message}`);
                return false;
            }
        });

        api.intercept("rename-file", ({ id }) => {
            if (isDatabaseManagedPath(String(id))) {
                setModalConfig({
                    show: true,
                    title: "Acción restringida",
                    message: "Esta carpeta es gestionada por la base de datos. Renómbrela desde la pantalla correspondiente.",
                    variant: "warning",
                    onConfirm: closeModal
                });
                return false;
            }
            return true;
        });

    }, [openFileInTab, deleteFileAndSync, createManualFolder, uploadManualFile, renameManualPath, loadRoot]);

    const onReplaceSelected = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || !selectedFileId) return;

        try {
            await replaceFileAndSync(selectedFileId, file);
            setSelectedFileId("");
            setSearchSelectedPath("");
            setFilemanagerKey((current) => current + 1);
            await loadRoot();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    return (
        <div className="container py-4" style={{ width: "100%", padding: "20px" }}>

            {/* Botones deslizantes */}
            <style>{`
                .sliding-tabs-container {
                    position: relative;
                    display: inline-flex;
                    background-color: #f1f3f4;
                    padding: 4px;
                    border-radius: 30px;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
                    user-select: none;
                    border: 1px solid #e0e0e0;
                }
                .sliding-tab-btn {
                    position: relative;
                    z-index: 2;
                    background: transparent;
                    border: none;
                    outline: none;
                    padding: 8px 32px;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #5f6368;
                    cursor: pointer;
                    border-radius: 26px;
                    transition: color 0.25s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    min-width: 160px;
                }
                .sliding-tab-btn:hover {
                    color: #202124;
                }
                .sliding-tab-btn.active {
                    color: #ffffff;
                    font-weight: 600;
                }
                .sliding-bg-pill {
                    position: absolute;
                    top: 4px;
                    bottom: 4px;
                    left: 4px;
                    width: calc(50% - 4px);
                    background-color: #0d6efd; /* <-- Cambiado a azul (Bootstrap primary o #1a73e8) */
                    border-radius: 26px;
                    z-index: 1;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 6px rgba(13, 110, 253, 0.3); /* <-- Sombra azulada */
                }
                .sliding-bg-pill.slide-right {
                    transform: translateX(100%);
                }
            `}</style>

            {/* CONTROL DEL SELECTOR SUPERIOR  */}
            <div className="d-flex justify-content-center w-100 mb-4">
                <div className="sliding-tabs-container">
                    <div className={`sliding-bg-pill ${activeTab === "backups" ? "slide-right" : ""}`} />

                    <button
                        type="button"
                        className={`sliding-tab-btn ${activeTab === "database" ? "active" : ""}`}
                        onClick={() => setActiveTab("database")}
                    >
                        <i className="bi bi-database"></i> Base de datos
                    </button>

                    <button
                        type="button"
                        className={`sliding-tab-btn ${activeTab === "backups" ? "active" : ""}`}
                        onClick={() => setActiveTab("backups")}
                    >
                        <i className="bi bi-archive"></i> Backups
                    </button>
                </div>
            </div>

            {/* Header Toolbar */}
            <div className="d-flex justify-content-between align-items-center gap-3 mb-3" style={{ minHeight: "38px" }}>
                <div className="text-truncate" style={{ minWidth: 0, flex: 1 }}>
                    {searchSelectedPath && (
                        <span className="text-muted small">
                            Ruta: <strong className="text-dark">{searchSelectedPath}</strong>
                        </span>
                    )}
                </div>

                <div className="flex-shrink-0">
                    <label className={`btn btn-sm ${selectedFileId ? "btn-primary" : "btn-secondary disabled"} mb-0`}>
                        Replace selected file
                        <input type="file" hidden disabled={!selectedFileId} onChange={onReplaceSelected} />
                    </label>
                </div>
            </div>

            <Willow fonts={true}>
                <div style={{ height: "700px", width: "100%", overflow: "hidden" }}>
                    <Filemanager
                        key={filemanagerKey}
                        init={init}
                        data={data}
                        readonly={false}
                    />
                </div>
            </Willow>

            <ConfirmModal
                show={modalConfig.show}
                title={modalConfig.title}
                message={modalConfig.message}
                variant={modalConfig.variant}
                onConfirm={modalConfig.onConfirm}
                onCancel={closeModal}
            />
        </div>
    );
}