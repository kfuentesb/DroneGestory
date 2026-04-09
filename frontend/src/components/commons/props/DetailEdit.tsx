import type { FieldConfig } from "../../details/FieldConfig";

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

    const BOOLEAN_FIELD_KEYS = new Set(["state", "hasCamera", "privatelyBuilt", "hasParachute", "hasEnsurance", "hasFTS"]);

    const parseBooleanLike = (value: unknown): boolean | null => {
        if (value === null || value === undefined || value === "") return null;
        if (typeof value === "boolean") return value;
        const normalized = normalize(String(value)).trim();
        if (["true", "si", "yes", "activo"].includes(normalized)) return true;
        if (["false", "no", "inactivo"].includes(normalized)) return false;
        return null;
    };

    const mapBooleanToOption = (opts: string[] | undefined, value: unknown) => {
        const parsed = parseBooleanLike(value);
        if (parsed === null) return "";
        if (!opts || opts.length === 0) return value ? "true" : "false";
        const targetOptions = parsed ? ["si", "activo", "true", "yes"] : ["no", "inactivo", "false"];
        const found = opts.find((opt) => targetOptions.includes(normalize(opt)));
        return found ?? opts[0];
    };

    return (
        <div className="row">
            {fields.map((field) => (
                <div key={field.key} className="col-md-6 col-12 mb-3">
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
                        <select
                            className="form-select"
                            disabled={field.readOnly} 
                            value={
                                BOOLEAN_FIELD_KEYS.has(field.key)
                                    ? mapBooleanToOption(field.options, values[field.key])
                                    : values[field.key] || ""
                            }
                            onChange={(e) => {
                                const val = e.target.value;
                                let finalValue: any = val;

                                if (BOOLEAN_FIELD_KEYS.has(field.key)) {
                                    if (val === "") {
                                        finalValue = null;
                                    } else {
                                        const parsed = parseBooleanLike(val);
                                        finalValue = parsed !== null ? parsed : null;
                                    }
                                } else if (val === "") {
                                    finalValue = null;
                                }

                                setValues({ ...values, [field.key]: finalValue });
                            }}
                        >
                            {!field.readOnly && <option value="">Seleccionar...</option>}
                            {field.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
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
