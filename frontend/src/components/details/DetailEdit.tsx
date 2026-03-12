export type FieldConfig = {
    label: string;
    key: string;
    type?: "text" | "email" | "select";
    options?: string[];
    validate?: (v: any) => boolean;
    error?: string;
};

type Props = {
    values: any;
    setValues: (v: any) => void;
    fields: FieldConfig[];
    errors: Record<string, boolean>;
};

export default function DetailEdit({ values, setValues, fields, errors }: Props) {
    return (
    <div className="row">
        {fields.map((field) => (
        <div key={field.key} className="col-md-6 col-12 mb-3">
            <label className="text-muted d-block text-start ps-3">
            {field.label}
            </label>

            {field.type === "select" ? (
            <select
                className="form-select"
                value={values[field.key] || ""}
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