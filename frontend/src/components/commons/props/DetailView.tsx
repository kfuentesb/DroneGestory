import type { FieldConfig } from "../../details/FieldConfig";

type Props = {
    data: any;
    fields: FieldConfig[];
};

export default function DetailView({ data, fields }: Props) {
    return (
        <div className="row">
            {fields
                .filter((field) => field.type !== "file")
                .map((field) => {
                    const rawValue = data[field.key];
                    const value = field.format ? field.format(rawValue) : Array.isArray(rawValue) ? rawValue.join(", ") : rawValue;
                    const colClass = field.type === "textarea" ? "col-12" : "col-md-4 col-sm-6";

                    return (
                        <div 
                            key={field.key} 
                            className={`${colClass} col-12 mb-4 d-flex justify-content-start`}
                        >
                            <div
                                className="rounded d-flex flex-column"
                                style={{
                                    border: "1px solid #D1D5DB",
                                    padding: "20px 16px 10px 16px",
                                    minHeight: "75px",
                                    width: "100%",
                                    position: "relative",
                                    backgroundColor: "#fff",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                                }}
                            >
                                <small 
                                    className="text-muted fw-semibold"
                                    style={{ 
                                        position: "absolute",
                                        top: "6px",
                                        left: "12px",
                                        fontSize: "0.7rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em"
                                    }}
                                >
                                    {field.label}
                                </small>
                                <span 
                                    className="fw-bold text-dark" 
                                    style={{ 
                                        whiteSpace: "pre-wrap",
                                        fontSize: "1rem",
                                        marginTop: "4px" 
                                    }}
                                >
                                    {value || "No especificado"}
                                </span>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}
