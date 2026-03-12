import type { FieldConfig } from "./FieldConfig";

export const aircraftFields: FieldConfig[] = [
    {
        label: "Fabricante",
        key: "manufacturer",
        type: "text",
        //validate: (v: string) => v.trim().length >= 2 && v.trim().length <=30,
        error: "El fabricante debe tener entre 2 a 20 caracteres"
    },
    {
        label: "Modelo",
        key: "model",
        type: "text",
        //validate: (v: string) => v.trim().length >= 4 && v.trim().length <=30,
        error: "El modelo deben tener entre 4 a 20 caracteres"
    },
    {
        label: "Número de Serie",
        key: "serialNumber",
        type: "text",
        //validate: (v: string) => v.trim().length >= 1 && v.trim().length <=40,
        error: "El número de serie debe tener entre 4 a 20 caracteres"
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
    },
    {
        label: "Dimensión característica",
        key: "wingspan",
        type: "number",

    },
    {
        label: "Velocidad máxima",
        key: "maxSpeed",
        type: "number",
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
    },
    {
        label: "Cámara",
        key: "hasCamera",
        type: "select",
        options: ["Sí", "No"],
        format: (v: boolean) => v ? "Sí" : "No", // para la vista

    },
    {
    label: "Imagen de perfil",
    key: "imageFile",
    type: "file",
    // validate: (file: File | null) => {
    //     if (!file) return true;

    //     const maxSize = 5 * 1024 * 1024; // 5MB
    //     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    //     return file.size <= maxSize && allowedTypes.includes(file.type);
    // },
    error: "La imagen debe ser JPG o PNG y pesar menos de 5MB"
    }
];