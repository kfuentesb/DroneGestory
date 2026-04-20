import { useCallback, useEffect, useState } from "react";
import { Filemanager, Material } from "@svar-ui/react-filemanager";
import type { IApi, IEntity } from "@svar-ui/filemanager-store";
import "@svar-ui/react-filemanager/all.css";
import { apiFetch } from "../../api";

export default function FileBrowserView() {
    const [data, setData] = useState<IEntity[]>([]);

    const loadRoot = useCallback(async () => {
        const response = await apiFetch("/api/files/list");
        if (!response) {
            return;
        }
        const items = (await response.json()) as IEntity[];
        setData(items);
    }, []);

    useEffect(() => {
        loadRoot().catch((err) => {
            console.error("Error loading root files:", err);
            setData([]);
        });
    }, [loadRoot]);

    const openFileInTab = useCallback(async (id: string) => {
        const response = await apiFetch(
            `/api/files/content?path=${encodeURIComponent(id)}`
        );
        if (!response) {
            return;
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }, []);

    const init = useCallback((api: IApi) => {
        api.intercept("open-file", async ({ id }) => {
            const fileId = String(id ?? "");
            if (!fileId) {
                return false;
            }
            try {
                await openFileInTab(fileId);
            } catch (err) {
                console.error("Error opening file:", err);
            }
            return false;
        });
    }, [openFileInTab]);

    return (
        <div className="container py-4">
            <Material fonts={true}>
                <Filemanager
                    init={init}
                    data={data}
                    readonly={true}
                />
            </Material>
        </div>
    );
}
