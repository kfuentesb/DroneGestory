import type { FieldConfig } from "./FieldConfig";

export const userFields: FieldConfig[] = [
    {
        label: "Nombre",
        key: "firstName",
        type: "text",
        validate: (v: string) => v.trim().length >= 2 && v.trim().length <=20,
        error: "El nombre debe tener entre 2 a 20 caracteres"
    },
    {
        label: "Apellidos",
        key: "lastName",
        type: "text",
        validate: (v: string) => v.trim().length >= 4 && v.trim().length <=20,
        error: "Los apellidos deben tener entre 4 a 20 caracteres"
    },
    {
        label: "Usuario",
        key: "username",
        type: "text",
        validate: (v: string) => v.trim().length >= 4 && v.trim().length <=20,
        error: "El usuario debe tener entre 4 a 20 caracteres"
    },
    {
        label: "Email",
        key: "email",
        type: "email",
        validate: (v: string) => /\S+@\S+\.\S+/.test(v),
        error: "Email inválido"
    },
    {
        label: "Teléfono",
        key: "phoneNumber",
        type: "text",
        validate: (v: string) => {
            if (!v || v.trim() === "") return true; // optional
            return /^[0-9]{9}$/.test(v);
        },
        error: "Debe tener 9 números",
        format: (v: string) => `+34 ${v?.toString().replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4")}`
    },
    {
        label: "Tipo de usuario",
        key: "type",
        type: "select",
        options: ["ADMIN", "MANAGER", "PILOT"]
    },
    {
    label: "Imagen de perfil",
    key: "imageFile",
    type: "file",
    validate: (file: File | null) => {
        if (!file) return true;

        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

        return file.size <= maxSize && allowedTypes.includes(file.type);
    },
    error: "La imagen debe ser JPG o PNG y pesar menos de 5MB"
    }
];