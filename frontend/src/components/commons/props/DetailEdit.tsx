import type { FieldConfig } from "../../details/FieldConfig";
import Select from "react-select";
type Props = {
    values: any;
    setValues: (v: any) => void;
    fields: FieldConfig[];
    errors: Record<string, string | null>;
    removeImage: boolean;
    setRemoveImage: (v: boolean) => void;
};

export default function DetailEdit({ values, setValues, fields, errors, removeImage, setRemoveImage }: Props) {
    const normalize = (v: string) =>
        v.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

    const BOOLEAN_FIELD_KEYS = new Set([
        "state",
        "hasCamera",
        "privatelyBuilt",
        "hasParachute",
        "hasEnsurance",
        "hasFTS",
        "hasCameraDefault",
        "privatelyBuiltDefault",
        "hasParachuteDefault",
        "hasEnsuranceDefault",
        "hasFTSDefault",
    ]);

    const parseBooleanLike = (value: unknown): boolean | null => {
        if (value === null || value === undefined || value === "") return null;
        if (typeof value === "boolean") return value;
        const normalized = normalize(String(value)).trim();
        const letters = normalized.replace(/[^a-z]/g, "");
        if (
            ["true", "si", "yes", "activo"].includes(normalized) ||
            ["true", "si", "yes", "activo"].includes(letters) ||
            letters.startsWith("s") ||
            letters.startsWith("act")
        ) return true;
        if (
            ["false", "no", "inactivo"].includes(normalized) ||
            ["false", "no", "inactivo"].includes(letters) ||
            letters.startsWith("n") ||
            letters.startsWith("ina")
        ) return false;
        return null;
    };

    const mapBooleanToOption = (opts: string[] | undefined, value: unknown) => {
        const parsed = parseBooleanLike(value);
        if (parsed === null) return "";
        if (!opts || opts.length === 0) return value ? "true" : "false";
        const targetOptions = parsed ? ["si", "activo", "true", "yes"] : ["no", "inactivo", "false"];
        const found = opts.find((opt) => {
            const normalized = normalize(opt).replace(/[^a-z]/g, "");
            return targetOptions.includes(normalized) || (parsed ? normalized.startsWith("s") : normalized.startsWith("n"));
        });
        return found ?? opts[0];
    };

    const mapCautiveToOption = (opts: string[] | undefined, value: unknown) => {
        if (!opts || opts.length === 0) return "";
        if (value === null || value === undefined || value === "") return "";
        const rawValue = String(value).toLowerCase();
        const letters = normalize(rawValue).replace(/[^a-z]/g, "");

        if (letters === "") return "";

        if (letters.startsWith("s") || letters === "yes") {
            return opts.find((opt) => {
                const n = normalize(opt).toLowerCase().replace(/[^a-z]/g, "");
                return n.startsWith("s") || n === "yes";
            }) ?? opts[0];
        }
        if (letters === "no") {
            return opts.find((opt) => {
                const n = normalize(opt).toLowerCase().replace(/[^a-z]/g, "");
                return n === "no";
            }) ?? opts[0];
        }
        if (letters.startsWith("opc") || letters.startsWith("opt")) {
            return opts.find((opt) => {
                const n = normalize(opt).toLowerCase().replace(/[^a-z]/g, "");
                return n.startsWith("opc") || n.startsWith("opt");
            }) ?? opts[0];
        }

        return "";
    };

    return (
        <div className="row">
            {fields.map((field) => (
                <div key={field.key} className={`${field.type === "textarea" ? "col-12" : "col-md-6"} col-12 mb-3`}>
                    <label className="text-muted d-block text-start ps-3">
                        {field.label}
                    </label>

                    {field.type === "file" ? (
                        <div
                            className="d-flex align-items-center rounded"
                            style={{
                                backgroundColor: field.readOnly ? "#f3f4f6" : "#ffffff",
                                border: "1px solid #D1D5DB",
                                paddingLeft: "10px"
                            }}
                        >
                            <span className="text-truncate" style={{ maxWidth: "150px" }}>
                                {values[field.key] instanceof File 
                                    ? values[field.key].name 
                                    : (!removeImage && values.imagePath) 
                                        ? values.imagePath 
                                        : "No hay archivo"}
                            </span>

                            <input
                                id={`file-${field.key}`}
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                disabled={field.readOnly}
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setValues({ ...values, [field.key]: file });
                                    if (file) setRemoveImage(false);
                                }}
                            />

                            <label
                                htmlFor={!field.readOnly ? `file-${field.key}` : undefined}
                                className={`btn ${field.readOnly ? 'btn-secondary' : 'btn-success'} ms-auto`}
                                style={{ 
                                    cursor: field.readOnly ? "not-allowed" : "pointer",
                                    borderTopRightRadius: (values[field.key] || (!removeImage && values.imagePath)) ? "0" : "4px",
                                    borderBottomRightRadius: (values[field.key] || (!removeImage && values.imagePath)) ? "0" : "4px"
                                }}
                            >
                                Seleccionar
                            </label>

                            {!field.readOnly && (values[field.key] || (!removeImage && values.imagePath)) && (
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    style={{ borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }}
                                    onClick={() => {
                                        setValues({ ...values, [field.key]: null });
                                        setRemoveImage(true);
                                        const input = document.getElementById(`file-${field.key}`) as HTMLInputElement;
                                        if (input) input.value = "";
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ) : field.type === "select" ? (
                        <Select
                            classNamePrefix="react-select"
                            isDisabled={field.readOnly}
                            isClearable={!field.readOnly}
                            placeholder="Seleccionar..."
                            value={(() => {
                                let currentStr = "";
                                if (BOOLEAN_FIELD_KEYS.has(field.key)) {
                                    currentStr = mapBooleanToOption(field.options, values[field.key]);
                                } else if (field.key === "cautive" || field.key === "cautiveDefault") {
                                    currentStr = mapCautiveToOption(field.options, values[field.key]);
                                } else {
                                    currentStr = values[field.key] || "";
                                }
                                return currentStr ? { value: currentStr, label: currentStr } : null;
                            })()}
                            options={field.options?.map(opt => ({ value: opt, label: opt })) || []}
                            onChange={(selected) => {
                                if (!selected) {
                                    setValues({ ...values, [field.key]: null });
                                    return;
                                }

                                const val = selected.value;
                                let finalValue: any = val;

                                if (BOOLEAN_FIELD_KEYS.has(field.key)) {
                                    const parsed = parseBooleanLike(val);
                                    finalValue = parsed !== null ? parsed : null;
                                } else if (field.key === "cautive" || field.key === "cautiveDefault") {
                                    const normalized = normalize(val).replace(/[^a-z]/g, "");
                                    if (normalized.startsWith("s")) finalValue = "YES";
                                    else if (normalized.startsWith("n")) finalValue = "NO";
                                    else if (normalized.startsWith("opc")) finalValue = "OPTIONAL";
                                    else finalValue = null;
                                }

                                setValues({ ...values, [field.key]: finalValue });
                            }}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderColor: errors[field.key] ? "#dc3545" : "#D1D5DB",
                                    backgroundColor: field.readOnly ? "#f3f4f6" : "#ffffff",
                                    borderRadius: "0.375rem",
                                    textAlign: "left"
                                }),
                            }}
                        />
                    ) : field.type === "date" ? (
                            <input
                                type="date"
                                disabled={field.readOnly}
                                className={`form-control ${errors[field.key] ? "is-invalid" : ""}`}
                                value={values[field.key] ? values[field.key].toString().split(/[T ]/)[0] : ""}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setValues({ ...values, [field.key]: newValue });
                                }}
                            />
                    ) : field.type === "textarea" ? (
                        <textarea
                            disabled={field.readOnly}
                            className={`form-control ${errors[field.key] ? "is-invalid" : ""}`}
                            rows={4}
                            value={values[field.key] || ""}
                            onChange={(e) =>
                                setValues({ ...values, [field.key]: e.target.value })
                            }
                            style={{ 
                                cursor: field.readOnly ? "not-allowed" : "text",
                                resize: field.readOnly ? "none" : "vertical" 
                            }}
                        />
                    ) : (
                        <input
                            type={field.type || "text"}
                            disabled={field.readOnly}
                            className={`form-control ${errors[field.key] ? "is-invalid" : ""}`}
                            value={values[field.key] || ""}
                            onChange={(e) =>
                                setValues({ ...values, [field.key]: e.target.value })
                            }
                            style={{cursor: field.readOnly ? "not-allowed" : "pointer"}}
                        />
                    )}

                    {errors[field.key] && (
                        <div className="text-danger small mt-1">{field.error}</div>
                    )}
                </div>
            ))}
        </div>
    );
}
