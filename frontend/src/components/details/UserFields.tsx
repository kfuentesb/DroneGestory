export type FieldConfig = {
    label: string;
    key: string;
    type?: "text" | "email" | "select";
    options?: string[];
    validate?: (v: any) => boolean;
    error?: string;
};

export const userFields: FieldConfig[] = [
    {
        label: "Nombre",
        key: "firstName",
        type: "text",
        validate: (v: string) => v.trim().length >= 2,
        error: "El nombre debe tener al menos 2 caracteres"
    },
    {
        label: "Apellidos",
        key: "lastName",
        type: "text",
        validate: (v: string) => v.trim().length >= 2,
        error: "Los apellidos deben tener al menos 2 caracteres"
    },
    {
        label: "Usuario",
        key: "username",
        type: "text",
        validate: (v: string) => v.trim().length >= 4,
        error: "El usuario debe tener al menos 4 caracteres"
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
        validate: (v: string) => /^[0-9]{9}$/.test(v),
        error: "Debe tener 9 números"
    },
    {
        label: "Tipo de usuario",
        key: "type",
        type: "select",
        options: ["ADMIN", "MANAGER", "PILOT"]
    }
];