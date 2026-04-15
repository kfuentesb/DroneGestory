import type { FieldConfig } from "../FieldConfig";
import { LIMITS, aircraftClasses, configs } from "../../../global-const/aircraft-const";

export const aircraftFields: FieldConfig[] = [
  {
    label: "Fabricante",
    key: "manufacturer",
    type: "text",
    validate: (v: string) => typeof v === "string" && v.trim().length >= 2 && v.trim().length <= 100,
    error: "El fabricante debe tener entre 2 y 100 caracteres",
  },
  {
    label: "Modelo",
    key: "model",
    type: "text",
    validate: (v: string) => typeof v === "string" && v.trim().length >= 2 && v.trim().length <= 100,
    error: "El modelo debe tener entre 2 y 100 caracteres",
  },
  {
    label: "Número de Serie",
    key: "serialNumber",
    type: "text",
    validate: (v: any) => {
      const value = v?.toString().trim();
      return value && typeof value === "string" && /^[a-zA-Z0-9]+$/.test(value) && value.length >= 2 && value.length <= 25;
    },
    error: "El número de serie debe ser alfanumérico, entre 2 y 25 caracteres",
  },
  {
    label: "Clase",
    key: "aircraftClass",
    type: "select",
    options: aircraftClasses.map((opt) => opt.value),
  },
  {
    key: "mtom",
    label: "MTOM (kg)",
    type: "number",
    validate: (val: any) => {
      const num = Number(val);
      return !isNaN(num) && num >= LIMITS.MIN_MTOM && num <= LIMITS.MAX_MTOM;
    },
    error: `Rango: ${LIMITS.MIN_MTOM} - ${LIMITS.MAX_MTOM} kg`,
  },
  {
    key: "wingspan",
    label: "Dimensión (m)",
    type: "number",
    validate: (val: any) => {
      const num = Number(val);
      return !isNaN(num) && num >= LIMITS.MIN_WINGSPAN && num <= LIMITS.MAX_WINGSPAN;
    },
    error: `Rango: ${LIMITS.MIN_WINGSPAN} - ${LIMITS.MAX_WINGSPAN} m`,
  },
  {
    key: "maxSpeed",
    label: "Velocidad máx (m/s)",
    type: "number",
    validate: (val: any) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= LIMITS.MAX_SPEED;
    },
    error: `Máximo permitido: ${LIMITS.MAX_SPEED} km/h`,
  },
  {
    label: "Configuración",
    key: "config",
    type: "select",
    options: configs.map((opt) => opt.value),
  },
  {
    key: "impactEnergy",
    label: "Energía impacto (J)",
    type: "number",
    validate: (val: any) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= LIMITS.MAX_ENERGY;
    },
    error: `Máximo permitido: ${LIMITS.MAX_ENERGY} J`,
  },
  {
    label: "Cámara",
    key: "hasCamera",
    type: "select",
    options: ["Sí", "No"],
    format: (v: any) => {
      if (v === true) return "Sí";
      if (v === false) return "No";
      return "No especificado";
    },
    error: "Seleccione una opción válida",
  },
  {
    label: "Construcción privada",
    key: "privatelyBuilt",
    type: "select",
    options: ["Sí", "No"],
    format: (v: any) => {
      if (v === true) return "Sí";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  {
    label: "Paracaídas",
    key: "hasParachute",
    type: "select",
    options: ["Sí", "No"],
    format: (v: any) => {
      if (v === true) return "Sí";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  {
    label: "Seguro RC",
    key: "hasEnsurance",
    type: "select",
    options: ["Sí", "No"],
    format: (v: any) => {
      if (v === true) return "Sí";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  {
    label: "Sistema FTS",
    key: "hasFTS",
    type: "select",
    options: ["Sí", "No"],
    format: (v: any) => {
      if (v === true) return "Sí";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  {
    label: "Cautivo",
    key: "cautive",
    type: "select",
    options: ["Sí", "No", "Opcional"],
    format: (v: any) => {
        if (v === null || v === undefined || v === "") return "No especificado";
        const val = String(v).toUpperCase();
        if (val === "YES" || val === "SI" || val === "SÍ") return "Sí";
        if (val === "NO") return "No";
        if (val === "OPTIONAL" || val === "OPCIONAL") return "Opcional";
        return String(v);
      },
  },
  {
    label: "Accesorios",
    key: "accessories",
    type: "textarea",
    validate: (v: any) => v == null || String(v).length <= 800,
    error: "Máximo 800 caracteres",
  },
  {
    label: "Horas de vuelo (min)",
    key: "flightMinutes",
    type: "number",
    validate: (val: any) => Number.isInteger(Number(val)) && Number(val) >= 0,
    error: "Debe ser un nÃºmero entero mayor o igual que 0",
    format: (v: any) => v === null || v === undefined || v === "" ? "0 min" : `${v} min`,
    readOnly: true,
  },
  {
    label: "Imagen de perfil",
    key: "imageFile",
    type: "file",
    validate: (file: File | null) => {
      if (!file) return true;
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      return file.size <= maxSize && allowedTypes.includes(file.type);
    },
    error: "La imagen debe ser JPG o PNG y pesar menos de 5MB",
  },
];
