import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

export type FieldConfig = {
    name: string;
    label: string;
    type: "text" | "number" | "checkbox" | "date";
    required?: boolean;
    defaultValue?: any;
};

interface BaseFormProps {
    fields: FieldConfig[];
    onSubmit: (data: any) => void;
    onBack?: () => void;
    title?: string;
}

export default function BaseForm({ fields = [], onSubmit, onBack, title }: BaseFormProps) {
    // Inicializamos el formulario con los valores por defecto de la config
    const defaultValues = fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || "";
        return acc;
    }, {} as any);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ defaultValues });

    return (
        <div className="p-4 border rounded shadow-sm bg-white">
        {title && <h3 className="mb-4">{title}</h3>}
        
        <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field) => (
            <div key={field.name} className="mb-3 d-flex flex-column">
                <label className="fw-bold">{field.label}</label>
                
                <input
                type={field.type}
                className={`form-control ${errors[field.name] ? "is-invalid" : ""}`}
                {...register(field.name, { required: field.required })}
                />
                
                {errors[field.name] && (
                <span className="text-danger fs-7">Este campo es obligatorio</span>
                )}
            </div>
            ))}

            <div className="d-flex justify-content-between align-items-center mt-4">
                <div>
                    {onBack ? (
                        <button type="button" className="btn btn-secondary" onClick={onBack}>
                            Atrás
                        </button>
                    ) : (
                        <div style={{ width: "65px" }}></div>
                    )}
                </div>

                <div className="d-flex gap-2">
                    <button type="button" className="btn btn-warning text-white">
                        Guardar
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Firmar
                    </button>
                </div>
            </div>
        </form>
        </div>
    );
}