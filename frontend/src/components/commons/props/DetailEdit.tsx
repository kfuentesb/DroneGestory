import type { FieldConfig } from "../../details/FieldConfig";

type Props = {
    values: any;
    setValues: (v: any) => void;
    fields: FieldConfig[];
    errors: Record<string, string | null>;
    // Añadimos estas dos props para controlar el borrado desde el padre
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
                                backgroundColor: "#ffffff",
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
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setValues({ ...values, [field.key]: file });
                                    // Si selecciona un archivo, desactivamos el modo "borrar"
                                    if (file) setRemoveImage(false);
                                }}
                            />

                            <label
                                htmlFor={`file-${field.key}`}
                                className="btn btn-success ms-auto"
                                style={{ 
                                    cursor: "pointer",
                                    // Bordes rectos si hay algo que borrar a la derecha
                                    borderTopRightRadius: (values[field.key] || (!removeImage && values.imagePath)) ? "0" : "4px",
                                    borderBottomRightRadius: (values[field.key] || (!removeImage && values.imagePath)) ? "0" : "4px"
                                }}
                            >
                                Seleccionar
                            </label>

                            {/* El botón X: Aparece si hay un archivo seleccionado O si hay una imagen previa en DB no borrada */}
                            {(values[field.key] || (!removeImage && values.imagePath)) && (
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    style={{ borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }}
                                    onClick={() => {
                                        // Limpiamos el archivo del estado
                                        setValues({ ...values, [field.key]: null });
                                        // Marcamos que queremos borrar la imagen de la DB
                                        setRemoveImage(true);
                                        // Limpiamos el input físico
                                        const input = document.getElementById(`file-${field.key}`) as HTMLInputElement;
                                        if (input) input.value = "";
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ) : field.type === "select" ? (
                        // ... resto del código del select igual ...
                        <select
                            className="form-select"
                            value={
                                typeof values[field.key] === "boolean"
                                    ? mapBooleanToOption(field.options, values[field.key])
                                    : values[field.key] || ""
                            }
                            onChange={(e) =>
                                setValues({ ...values, [field.key]: e.target.value })
                            }
                        >
                            {field.options?.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={field.type || "text"}
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