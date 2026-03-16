import type { FieldConfig } from "./FieldConfig";

export const aircraftFields: FieldConfig[] = [
    {
        label: "Fabricante",
        key: "manufacturer",
        type: "text",
        validate: (v: string) => typeof v === "string" && v.trim().length >= 2 && v.trim().length <= 100,
        error: "El fabricante debe tener entre 2 y 100 caracteres"
    },
    {
        label: "Modelo",
        key: "model",
        type: "text",
        validate: (v: string) => typeof v === "string" && v.trim().length >= 2 && v.trim().length <= 100,
        error: "El modelo debe tener entre 2 y 100 caracteres"
    },
    {
        label: "Número de Serie",
        key: "serialNumber",
        type: "text",
        validate: (v: any) => {
            const n = Number(v?.toString().trim());
            return v !== undefined && v !== null && v !== "" && !isNaN(n) && Number.isInteger(n);
        },
        error: "El número de serie debe ser un número entero válido"
    },
    {
        label: "Clase",
        key: "aircraftClass",
        type: "select",
        options: ["No", "C0", "C1", "C2", "C3", "C4", "C5", "C6"]

    },
    {
        label: "MTOM (Kg)",
        key: "mtom",
        type: "number",
        validate: (v: any) => {
            const n = Number(v);
            return v !== undefined && v !== null && v !== "" && !isNaN(n) && n > 0;
        },
        error: "MTOM debe ser un número válido mayor que 0"
    },
    {
        label: "Dimensión característica (m)",
        key: "wingspan",
        type: "number",
        validate: (v: any) => {
            const n = Number(v);
            return v !== undefined && v !== null && v !== "" && !isNaN(n) && n > 0;
        },
        error: "La dimensión debe ser un número válido mayor que 0"
    },
    {
        label: "Velocidad máxima",
        key: "maxSpeed",
        type: "number",
        validate: (v: any) => {
            const n = Number(v);
            return v !== undefined && v !== null && v !== "" && !isNaN(n) && n > 0;
        },
        error: "La velocidad máxima debe ser un número válido mayor que 0"
    },
    {
        label: "Configuración",
        key: "config",
        type: "select",
        options: ["Avion", "Multirrotor", "Helicoptero", "Hibrido", "Ligero", "Otro"]
    },
    {
        label: "Energía de impacto",
        key: "impactEnergy",
        type: "number",
        validate: (v: any) => {
            const n = Number(v);
            return v !== undefined && v !== null && v !== "" && !isNaN(n) && n >= 0;
        },
        error: "La energía de impacto debe ser un número válido"
    },
    {
        label: "Cámara",
        key: "hasCamera",
        type: "select",
        options: ["No","Sí"],
        format: (v: any) => {
            if (v === true) return "Sí";
            if (v === false) return "No";
            return "No especificado";
        },
        error: "Seleccione una opción válida"
    }
    // {
    // label: "Imagen de perfil",
    // key: "imageFile",
    // type: "file",
    // validate: (file: File | null) => {
    //     if (!file) return true;

    //     const maxSize = 5 * 1024 * 1024; // 5MB
    //     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    //     return file.size <= maxSize && allowedTypes.includes(file.type);
    // },
    // error: "La imagen debe ser JPG o PNG y pesar menos de 5MB"
    // }
];