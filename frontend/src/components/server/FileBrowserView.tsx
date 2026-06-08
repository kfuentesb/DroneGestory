import { useCallback, useEffect, useState, useRef, type ChangeEvent } from "react";
import { Filemanager, Willow } from "@svar-ui/react-filemanager";
import type { IApi, IEntity } from "@svar-ui/filemanager-store";
import "@svar-ui/react-filemanager/all.css";
import ConfirmModal from "../commons/ConfirmModal";
import { API_BASE_URL } from "../../api";
import { InfoBadge } from "../commons/InfoBadge";

export default function FileBrowserView() {
    const [data, setData] = useState<IEntity[]>([]);
    const [selectedFileId, setSelectedFileId] = useState("");
    const [searchSelectedPath, setSearchSelectedPath] = useState("");
    const [filemanagerKey, setFilemanagerKey] = useState(0);
    const [isSearchMode, setIsSearchMode] = useState(false);

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

    const isDatabaseManagedPath = (id?: string | null) => {
        if (backendType === "backups") return false;
        if (!id) return false;
        const clean = String(id).replace(/^\/+/, "");
        return clean === "database-relationed" || clean.startsWith("database-relationed/");
    };

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
                    width: 100%;
                }
                .sliding-tab-btn {
                    position: relative;
                    z-index: 2;
                    background: transparent;
                    border: none;
                    outline: none;
                    padding: 6px 16px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #5f6368;
                    cursor: pointer;
                    border-radius: 26px;
                    transition: color 0.25s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    flex: 1;
                    min-width: 0;
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
                    background-color: #0d6efd;
                    border-radius: 26px;
                    z-index: 1;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 6px rgba(13, 110, 253, 0.3);
                }
                .sliding-bg-pill.slide-right {
                    transform: translateX(100%);
                }

                /* Sistema Flexbox Unificado */
                .responsive-toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 16px;
                    width: 100%;
                }

                .item-tabs {
                    order: 1;
                }
                .item-button {
                    order: 2;
                }
                .item-route {
                    order: 3;
                    width: 100%; /* Salto de línea por defecto en resoluciones "Phone" */
                    min-width: 0;
                }

                /* Breakpoint personalizado antes de Phone Wide (< 992px) */
                @media (max-width: 991px) {
                    .item-tabs {
                        flex: 1;
                        min-width: 0;
                    }
                    .sliding-tab-btn {
                        padding: 6px 8px;
                        font-size: 0.8rem;
                    }
                    .btn-replace-responsive {
                        padding: 6px 12px;
                        font-size: 0.8rem;
                    }
                }

                /* Modo escritorio / Pantallas anchas (>= 992px) */
                @media (min-width: 992px) {
                    .responsive-toolbar {
                        flex-wrap: nowrap;
                        gap: 24px;
                    }
                    .item-tabs {
                        order: 1;
                        flex-shrink: 0;
                        width: 300px;
                    }
                    .item-route {
                        order: 2;
                        flex: 1;
                        width: auto;
                    }
                    .item-button {
                        order: 3;
                        flex-shrink: 0;
                    }
                }
            `}</style>

            {/* Contenedor Adaptable Flexible */}
            <div className="responsive-toolbar mb-4" style={{ minHeight: "46px" }}>
                
                {/* 1. Selector de Pestañas */}
                <div className="item-tabs">
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

                {/* 2. Botón de Acción */}
                <div className="item-button">
                    <label className={`btn btn-sm btn-replace-responsive ${selectedFileId ? "btn-primary" : "btn-secondary disabled"} mb-0`}>
                        Replace selected file
                        <input type="file" hidden disabled={!selectedFileId} onChange={onReplaceSelected} />
                    </label>
                </div>

                {/* 3. Ruta de archivos (Entre los dos componentes en escritorio, abajo en móviles) */}
                <div className="item-route">
                    {searchSelectedPath && (
                        <div className="d-flex align-items-center w-100 m-0 p-0">
                            <span className="text-muted small text-truncate">
                                Ruta: <strong className="text-dark">{searchSelectedPath}</strong>
                            </span>
                            <InfoBadge text={searchSelectedPath} />
                        </div>
                    )}
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