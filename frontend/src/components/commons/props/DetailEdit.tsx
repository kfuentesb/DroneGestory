import type { FieldConfig } from "../../details/FieldConfig";

type Props = {
    values: any;
    setValues: (v: any) => void;
    fields: FieldConfig[];
    errors: Record<string, string | null>;
    format?: (v: any) => string;
};

export default function DetailEdit({ values, setValues, fields, errors }: Props) {
    const normalize = (v: string) =>
        v.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

    const mapBooleanToOption = (opts: string[] | undefined, value: boolean) => {
        if (!opts || opts.length === 0) return value ? "true" : "false";
        const target = value ? "si" : "no";
        const found = opts.find((opt) => normalize(opt) === target);
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
                    backgroundColor: "#ffffff",
                    border: "1px solid #D1D5DB",
                    paddingLeft: "10px"
                    }}
                >
                    <span className="text-truncate" style={{ maxWidth: "150px" }}>
                    {values[field.key]?.name || "No file selected"}
                    </span>

                    <input
                    id={`file-${field.key}`}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setValues({ ...values, [field.key]: file });
                    }}
                    />

                    <label
                    htmlFor={`file-${field.key}`}
                    className="btn btn-success ms-auto"
                    style={{ cursor: "pointer" }}
                    >
                    Seleccionar archivo
                    </label>
                </div>
            ) : field.type === "select" ? (
                <select
                    className="form-select"
                    value={
                        typeof values[field.key] === "boolean"
                            ? mapBooleanToOption(field.options, values[field.key])
                            : values[field.key] || ""
                    }
                    onChange={(e) =>
                    setValues({
                        ...values,
                        [field.key]: e.target.value,
                    })
                    }
                >
                    {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                    ))}
                </select>
            
            ) : (
            <input
                type={field.type || "text"}
                className={`form-control ${errors[field.key] ? "is-invalid" : ""}`}
                value={values[field.key] || ""}
                onChange={(e) =>
                setValues({
                    ...values,
                    [field.key]: e.target.value,
                })
                }
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
