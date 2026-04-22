import type { FieldConfig } from "../FieldConfig";

export const USER_PASSWORD_ERROR = "La contrasena debe tener 8 o mas caracteres y al menos 1 numero";
export const validateUserPassword = (value: string) => /^(?=.*\d).{8,}$/.test(value);

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
        validate: (v: string | null | undefined) => {
            // Si no hay valor o está vacío, es válido (opcional)
            if (!v || v.toString().trim() === "") return true; 
            const str = v.toString().trim();
            // Si hay algo, debe ser exactamente 9 números
            return /^[0-9]{9}$/.test(str); 
        },
        error: "Debe tener 9 números o estar vacío",
        format: (v: any) => {
            const str = v?.toString().trim() || "";
            if (str.length !== 9) return str;
            return `+34 ${str.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4")}`;
        }
    },
    {
        label: "Documento Identidad",
        key: "docIdentidad",
        type: "text",
        validate: (v: string) => {
            const val = v?.toString().trim() || "";
            return val.length >= 5 && val.length <= 120;
        },
        error: "El documento debe tener entre 5 y 120 caracteres"
    },
    {
        label: "Fecha de Nacimiento",
        key: "fechaNac",
        type: "date",
        validate: (v: string | null | undefined) => {
            if (!v || v.toString().trim() === "") return true;
            return new Date(v).getTime() <= Date.now();
        },
        error: "La fecha de nacimiento no puede ser futura",
        format: (v: any) => { // Formatea la fecha a DD-MM-YYYY
            if (!v) return "";
            const d = new Date(v);
            const day = d.getDate().toString().padStart(2, "0");
            const month = (d.getMonth() + 1).toString().padStart(2, "0");
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        }
    },
    {
        label: "Roles",
        key: "roles",
        type: "select",
        isMulti: true,
        options: [
            { value: "ADMIN", label: "Administrador" },
            { value: "MANAGER", label: "Gestor" },
            { value: "MAINTAINER", label: "Mantenedor" },
            { value: "PILOT", label: "Piloto" }
        ],
        format: (value: any) => Array.isArray(value) ? value.join(", ") : (value || "")
    },
    {
        label: "Estado",
        key: "state",
        type: "select",
        options: [
            { value: "Activo", label: "Activo" },
            { value: "Inactivo", label: "Inactivo" }
        ],
        format: (v: any) => (v === true || v === "true" || v === "Activo" ? "Activo" : "Inactivo")
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
