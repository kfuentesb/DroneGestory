export type FieldOption = string | { value: any; label: string };

export type FieldConfig = {
    label: string;
    key: string;
    type?: "text" | "email" | "number" |"boolean" | "select" | "file" | "date" | "month" | "textarea";
    options?: FieldOption[];
    validate?: (v: any) => boolean; // Validación del campo
    error?: string;
    format?: (v: any) => string; // Formatea el valor a mostrar
    // parse?: (v: any) => any; // Parsea el valor desde el input
    readOnly?: boolean;
    isMulti?: boolean;
    disabled?: boolean;
};
