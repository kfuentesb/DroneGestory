import type { FieldConfig } from "../fields/FieldConfig";

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
                                backgroundColor: field.readOnly ? "#f3f4f6" : "#ffffff", // Color gris si está bloqueado
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
                                disabled={field.readOnly} // <-- BLOQUEO AQUÍ
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setValues({ ...values, [field.key]: file });
                                    if (file) setRemoveImage(false);
                                }}
                            />

                            <label
                                htmlFor={!field.readOnly ? `file-${field.key}` : undefined} // Evita click si está bloqueado
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
                            disabled={field.readOnly} // <-- BLOQUEO AQUÍ
                            value={
                                field.key === "state" 
                                    ? (values[field.key] ? "Activo" : "Inactivo")
                                    : (typeof values[field.key] === "boolean"
                                        ? mapBooleanToOption(field.options, values[field.key])
                                        : values[field.key] || "")
                            }
                            onChange={(e) => {
                                const val = e.target.value;
                                const finalValue = field.key === "state" ? (val === "Activo") : val;
                                setValues({ ...values, [field.key]: finalValue });
                            }}
                        >
                            {field.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : field.type === "date" ? (
                            <input
                                type="date"
                                disabled={field.readOnly} // <-- BLOQUEO AQUÍ
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
                            disabled={field.readOnly} // <-- BLOQUEO AQUÍ
                            className={`form-control ${errors[field.key] ? "is-invalid" : ""}`}
                            value={values[field.key] || ""}
                            onChange={(e) =>
                                setValues({ ...values, [field.key]: e.target.value })
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