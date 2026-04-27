import type { FieldConfig } from "../../details/FieldConfig";
import Select from "react-select";
import MonthYearInput from "../MonthYearInput";

type FieldOption = string | { value: any; label: string };

const isObjectOption = (opt: any): opt is { value: any; label: string } => {
    return opt !== null && typeof opt === "object" && "value" in opt;
};
type Props = {
    values: any;
    setValues: (v: any) => void;
    fields: FieldConfig[];
    errors: Record<string, string | null>;
    removeImage: boolean;
    setRemoveImage: (v: boolean) => void;
    clearableFieldKeys?: string[];
};

export default function DetailEdit({ values, setValues, fields, errors, removeImage, setRemoveImage, clearableFieldKeys = [] }: Props) {
    const normalize = (v: string) =>
        v.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

    const isNonElectricPowerSource = values.powerSource === "NON_ELECTRIC";

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

    const getOptionValue = (option: FieldOption): any =>
        typeof option === "object" && option !== null ? option.value : option;

    const getOptionLabel = (option: FieldOption): string =>
        typeof option === "object" && option !== null ? option.label : String(option);

    const mapBooleanToOption = (opts: FieldOption[] | undefined, value: unknown) => {
        const parsed = parseBooleanLike(value);
        if (parsed === null) return null;
        if (!opts || opts.length === 0) return null;
        const targetOptions = parsed ? ["si", "activo", "true", "yes"] : ["no", "inactivo", "false"];
        const found = opts.find((opt) => {
            const normalized = normalize(String(getOptionValue(opt))).replace(/[^a-z]/g, "");
            return targetOptions.includes(normalized) || (parsed ? normalized.startsWith("s") : normalized.startsWith("n"));
        });
        return found
            ? { value: getOptionValue(found), label: getOptionLabel(found) }
            : null;
    };

    const mapCautiveToOption = (opts: FieldOption[] | undefined, value: unknown) => {
        if (!opts || opts.length === 0) return null;
        if (value === null || value === undefined || value === "") return null;
        const rawValue = String(value).toLowerCase();
        const letters = normalize(rawValue).replace(/[^a-z]/g, "");

        if (letters === "") return null;

        const resolve = (matcher: (normalized: string) => boolean) => {
            const found = opts.find((opt) => matcher(normalize(String(getOptionValue(opt))).replace(/[^a-z]/g, "")));
            return found
                ? { value: getOptionValue(found), label: getOptionLabel(found) }
                : null;
        };

        if (letters.startsWith("s") || letters === "yes") {
            return resolve((n) => n.startsWith("s") || n === "yes");
        }
        if (letters === "no") {
            return resolve((n) => n === "no");
        }
        if (letters.startsWith("opc") || letters.startsWith("opt")) {
            return resolve((n) => n.startsWith("opc") || n.startsWith("opt"));
        }

        return null;
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
                            isMulti={field.isMulti}
                            isDisabled={field.readOnly || (field.key === "powerSourceType" && !isNonElectricPowerSource)}
                            isClearable={!field.readOnly}
                            placeholder="Seleccionar..."
                            value={(() => {
                                const opts = (field.options as FieldOption[]) || [];
                                const val = values[field.key];

                                if (field.isMulti) {
                                    const selectedValues = Array.isArray(val) ? val : [];
                                    return opts
                                        .filter((opt) => selectedValues.includes(getOptionValue(opt)))
                                        .map((opt) => isObjectOption(opt) ? opt : { value: opt, label: String(opt) });
                                }

                                if (BOOLEAN_FIELD_KEYS.has(field.key)) {
                                    return mapBooleanToOption(opts, val);
                                }

                                if (field.key === "cautive" || field.key === "cautiveDefault") {
                                    return mapCautiveToOption(opts, val);
                                }

                                const found = opts.find((opt) => {
                                    if (isObjectOption(opt)) {
                                        return opt.value === val;
                                    }
                                    return opt === val;
                                });

                                if (found) {
                                    return isObjectOption(found) ? found : { value: found, label: String(found) };
                                }

                                if (val !== null && val !== undefined && val !== "") {
                                    return { value: val, label: String(val) };
                                }
                                return null;
                            })()}
                            options={(field.options as FieldOption[])?.map(opt => 
                                isObjectOption(opt) ? opt : { value: opt, label: String(opt) }
                            ) || []}
                            onChange={(selected) => {
                                if (field.isMulti) {
                                    const selectedOptions = Array.isArray(selected) ? selected : [];
                                    setValues({ ...values, [field.key]: selectedOptions.map((option) => option.value) });
                                    return;
                                }
                                if (!selected) {
                                    const nextValues = { ...values, [field.key]: null };
                                    if (field.key === "powerSource") {
                                        nextValues.powerSourceType = null;
                                    }
                                    setValues(nextValues);
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
                                const nextValues = { ...values, [field.key]: finalValue };
                                if (field.key === "powerSource" && finalValue !== "NON_ELECTRIC") {
                                    nextValues.powerSourceType = null;
                                }
                                setValues(nextValues);
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
                    ) : field.type === "month" ? (
                            <MonthYearInput
                                value={values[field.key]}
                                onChange={(newValue) => {
                                    setValues({ ...values, [field.key]: newValue });
                                }}
                                disabled={field.readOnly}
                                invalid={Boolean(errors[field.key])}
                            />
                    ) : field.type === "date" ? (
                            <input
                                type="date"
                                disabled={field.readOnly}
                                className={`form-control ${errors[field.key] ? "is-invalid" : ""}`}
                                value={values[field.key] ? values[field.key].toString().split(/[T ]/)[0] : ""}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    const shouldStoreNull = clearableFieldKeys.includes(field.key) && newValue === "";
                                    setValues({ ...values, [field.key]: shouldStoreNull ? null : newValue });
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
                        <div className="text-danger small mt-1">{errors[field.key] || field.error}</div>
                    )}
                </div>
            ))}
        </div>
    );
}
