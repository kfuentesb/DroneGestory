export type FieldConfig = {
    label: string;
    key: string;
    type?: "text" | "email" | "number" |"boolean" | "select" | "file" | "date";
    options?: string[];
    validate?: (v: any) => boolean; // Validación del campo
    error?: string;
    format?: (v: string | number | null | undefined) => string; // Formatea el valor a mostrar
    // parse?: (v: any) => any; // Parsea el valor desde el input
};