import type { ReactNode } from "react";
import InsertDoc from "./InsertDoc";
import { InfoBadge } from "./InfoBadge";

export type MultipleAdditionalItem = {
    id: string;
    label: string;
    certificate: File | null;
    dateExpire: string | null;
    dateIndefinite: boolean | null;
};

type MultipleAdditionalsComponentProps<T extends MultipleAdditionalItem> = {
    title: string;
    infoText: ReactNode;
    addButtonLabel?: string;
    emptyText: string;
    inputPlaceholder: string;
    items: T[];
    existingFileNames?: Record<string, string>;
    maxItems?: number;
    showDateControls?: boolean;
    onAdd: () => void;
    onRemove: (id: string) => void;
    onFieldChange: (id: string, field: keyof T, value: string | File | boolean | null) => void;
};

export default function MultipleAdditionalsComponent<T extends MultipleAdditionalItem>({
    title,
    infoText,
    addButtonLabel = "+ Añadir otro",
    emptyText,
    inputPlaceholder,
    items,
    existingFileNames = {},
    maxItems = 10,
    showDateControls = true,
    onAdd,
    onRemove,
    onFieldChange,
}: MultipleAdditionalsComponentProps<T>) {
    return (
        <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                    <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                        {title}
                    </h6>
                    <InfoBadge text={infoText} />
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={onAdd}
                    disabled={items.length >= maxItems}
                >
                    {addButtonLabel}
                </button>
            </div>

            {items.length === 0 && (
                <p className="text-muted small mb-0 ps-1">{emptyText}</p>
            )}

            {items.map((item) => (
                <div key={item.id} className="bg-white p-3 border rounded-3 mb-3 shadow-sm">
                    <div className="d-flex gap-2 mb-3">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder={inputPlaceholder}
                            value={item.label}
                            onChange={(e) => onFieldChange(item.id, "label" as keyof T, e.target.value)}
                        />
                        <button
                            type="button"
                            className="btn btn-sm d-flex align-items-center justify-content-center shadow-none p-0"
                            style={{
                                width: "32px",
                                height: "32px",
                                backgroundColor: "#FEE2E2",
                                color: "#DC2626",
                                border: "1px solid #FECACA",
                                borderRadius: "8px",
                                transition: "all 0.2s ease"
                            }}
                            onClick={() => onRemove(item.id)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                            </svg>
                        </button>
                    </div>

                    <InsertDoc
                        hideHeader={true}
                        showAddBtn={true}
                        checkboxLabel="Documento adjunto"
                        isChecked={true}
                        onToggleCheck={() => {}}
                        fileInputId={`file-additional-${item.id}`}
                        selectedFile={item.certificate}
                        existingFileName={existingFileNames[item.id]}
                        onFileChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            onFieldChange(item.id, "certificate" as keyof T, file);
                            e.target.value = "";
                        }}
                        onClearFile={() => onFieldChange(item.id, "certificate" as keyof T, null)}
                        expirationDate={item.dateExpire || ""}
                        onExpirationDateChange={(value) => onFieldChange(item.id, "dateExpire" as keyof T, value)}
                        indefiniteId={`indefinite-add-${item.id}`}
                        isIndefinite={item.dateIndefinite || false}
                        onToggleIndefinite={() => onFieldChange(item.id, "dateIndefinite" as keyof T, !item.dateIndefinite)}
                        showDateControls={showDateControls}
                    />
                </div>
            ))}
        </div>
    );
}
