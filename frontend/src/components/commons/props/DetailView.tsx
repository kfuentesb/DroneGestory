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
                    const value = field.format ? field.format(rawValue) : rawValue;

                    return (
                        <div key={field.key} className="col-md-6 col-12 mb-3 d-flex justify-content-start">
                            <div
                                className="rounded d-flex flex-column"
                                style={{
                                    border: "1px solid #6B7280",
                                    padding: "12px 16px",
                                    minHeight: "70px",
                                    width: "100%",
                                    maxWidth: "350px",
                                    textAlign: "start",
                                }}
                            >
                                <small className="text-muted">{field.label}</small>
                                <span className="fw-bold">{value}</span>
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}