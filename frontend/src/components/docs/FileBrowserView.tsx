import { useCallback, useEffect, useState, useRef, type ChangeEvent } from "react";
import { Filemanager, Material, Willow } from "@svar-ui/react-filemanager";
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
        onConfirm: () => {},
    });

    const isSearchModeRef = useRef(false);
    const searchWasJustClearedRef = useRef(false);
    const apiRef = useRef<IApi | null>(null);

    useEffect(() => {
        isSearchModeRef.current = isSearchMode;
    }, [isSearchMode]);

    const authHeaders = () => {
        const token = localStorage.getItem("token");
        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    };

    const loadRoot = useCallback(async () => {
        const res = await fetch(`${API_BASE_URL}/api/files/list`, {
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error(`Failed root load (${res.status})`);
        const items = (await res.json()) as IEntity[];
        setData(items);
    }, []);

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
                `${API_BASE_URL}/api/files/content?path=${encodeURIComponent(id)}`,
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
    }, []);

    const deleteFileAndSync = useCallback(async (id: string) => {
        const res = await fetch(`${API_BASE_URL}/api/admin/files/remove`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ path: id }),
        });

        const body = await res.json();
        if (!res.ok || !body.ok) {
            throw new Error(body.error || "Failed to delete file");
        }
    }, []);

    const replaceFileAndSync = useCallback(async (id: string, file: File) => {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("path", id);
        formData.append("file", file);

        const res = await fetch(`${API_BASE_URL}/api/admin/files/replace`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData,
        });

        const body = await res.json();
        if (!res.ok || !body.ok) {
            throw new Error(body.error || "Failed to replace file");
        }
    }, []);

    const isDatabaseManagedPath = (id?: string | null) => {
        if (!id) return false;
        const clean = String(id).replace(/^\/+/, "");
        return clean === "database-relationed" || clean.startsWith("database-relationed/");
    };

    const createManualFolder = useCallback(async (parent: string, name: string) => {
        const res = await fetch(`${API_BASE_URL}/api/admin/files/folder`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ parent, name }),
        });
        const body = await res.json();
        if (!res.ok || !body.ok) {
            throw new Error(body.error || "Failed to create folder");
        }
    }, []);

    const uploadManualFile = useCallback(async (parent: string, file: File) => {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("parent", parent);
        formData.append("file", file);

        const res = await fetch(`${API_BASE_URL}/api/admin/files/upload`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData,
        });
        const body = await res.json();
        if (!res.ok || !body.ok) {
            throw new Error(body.error || "Failed to upload file");
        }
    }, []);

    const renameManualPath = useCallback(async (path: string, name: string) => {
        const res = await fetch(`${API_BASE_URL}/api/admin/files/rename`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ path, name }),
        });
        const body = await res.json();
        if (!res.ok || !body.ok) {
            throw new Error(body.error || "Failed to rename");
        }
    }, []);

    const closeModal = () => setModalConfig(prev => ({ ...prev, show: false }));

    const init = useCallback((api: IApi) => {
        const wasSearchClick = () => isSearchModeRef.current || searchWasJustClearedRef.current;

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
            if (id && wasSearchClick()) {
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
            setSearchSelectedPath(isSearchModeRef.current ? String(id) : "");
            setSelectedFileId(file?.type === "file" ? String(id) : "");
        });

        api.intercept("set-path", ({ id }) => {
            if (id && wasSearchClick()) {
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
        <div className="container py-4"
            style={{ 
                display: "flex", 
                flexDirection: "column", 
                height: "100%", 
                width: "100%", 
                overflow: "hidden",
                padding: "20px" 
            }}>
            <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
                {/* Contenedor de la ruta (Izquierda) */}
                <div className="text-truncate" style={{ minWidth: 0 }}>
                    {searchSelectedPath && (
                        <span className="text-muted small">
                            Ruta: <strong className="text-dark">{searchSelectedPath}</strong>
                        </span>
                    )}
                </div>

                {/* Botón de Reemplazo (Derecha) */}
                <div className="d-flex gap-2 flex-shrink-0">
                    <label className={`btn btn-sm ${selectedFileId ? "btn-primary" : "btn-secondary disabled"} mb-0`}>
                        Replace selected file
                        <input type="file" hidden disabled={!selectedFileId} onChange={onReplaceSelected} />
                    </label>
                </div>
            </div>
            
            <Willow fonts={true}>
                <div style={{ height: "700px", width: "100%" }}>
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
