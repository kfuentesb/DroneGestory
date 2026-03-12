export type FieldConfig = {
    label: string;
    key: string;
    type?: "text" | "email" | "select" | "file";
    options?: string[];
    validate?: (v: any) => boolean;
    error?: string;
    format?: (v: any) => string;
};