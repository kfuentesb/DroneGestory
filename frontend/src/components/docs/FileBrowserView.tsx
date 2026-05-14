import { useCallback, useEffect, useState, useRef, type ChangeEvent } from "react";
import { Filemanager, Material, Willow } from "@svar-ui/react-filemanager";
import type { IApi, IEntity } from "@svar-ui/filemanager-store";
import "@svar-ui/react-filemanager/all.css";
import { API_BASE_URL } from "../../api";

export default function FileBrowserView() {
    const [data, setData] = useState<IEntity[]>([]);
    const [selectedFileId, setSelectedFileId] = useState("");
    const [searchSelectedPath, setSearchSelectedPath] = useState("");
    const [filemanagerKey, setFilemanagerKey] = useState(0);
    const [isSearchMode, setIsSearchMode] = useState(false);
    const isSearchModeRef = useRef(false);
    const searchWasJustClearedRef = useRef(false);

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

        api.intercept("delete-files", async ({ ids }) => {
            const fileIds = (ids ?? []).map(String);
            if (!fileIds.length) return false;

            const confirmed = window.confirm(
                `Estas seguro de eliminar ${fileIds.length} archivo(s)? Esta accion actualizara la base de datos y eliminara el archivo fisico.`
            );
            if (!confirmed) return false;

            try {
                for (const fileId of fileIds) {
                    await deleteFileAndSync(fileId);
                }
                setSelectedFileId("");
                setSearchSelectedPath("");
                return true;
            } catch (err: any) {
                alert(`Error: ${err.message}`);
                return false;
            }
        });
    }, [openFileInTab, deleteFileAndSync]);

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
            {/* <Material fonts={true}> */}
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
            {/* </Material> */}
        </div>
    );
}
