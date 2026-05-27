import type { FieldConfig } from "../FieldConfig";
import { LIMITS, aircraftClasses, configs, powerSources, powerSourcesNonElectric } from "../../../global-const/aircraft-const";

const formatMonthYear = (value: string) => {
  const [year, month] = value.split("-");
  if (!year || !month) return "No especificado";
  return `${month}/${year}`;
};

export const getAircraftFields = (): FieldConfig[] => [
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
    label: "Numero de Serie",
    key: "serialNumber",
    type: "text",
    validate: (v: any) => {
      const value = v?.toString().trim();
      return value && typeof value === "string" && /^[a-zA-Z0-9]+$/.test(value) && value.length >= 2 && value.length <= 25;
    },
    error: "El numero de serie debe ser alfanumerico, entre 2 y 25 caracteres",
  },
  {
    label: "Fecha Fabricacion",
    key: "fechaFab",
    type: "month",
    validate: (v: any) => {
      if (v === null || v === undefined || String(v).trim() === "") return true;
      return /^\d{4}-\d{2}$/.test(String(v));
    },
    error: "Fecha de fabricacion invalida",
    format: (v: any) => {
      if (!v) return "No especificado";
      return formatMonthYear(String(v));
    },
  },
  {
    label: "Fuente de potencia",
    key: "powerSource",
    type: "select",
    options: powerSources,
    format: (v: any) => {
      const normalized = String(v).toUpperCase().trim();
      if (normalized === "ELECTRIC" || normalized === "ELÉCTRICO") return "Eléctrico";
      if (normalized === "NON_ELECTRIC" || normalized === "NO ELÉCTRICO") return "No Eléctrico";
      return "No especificado";
    },
  },
  {
    label: "Tipo de fuente no electrica",
    key: "powerSourceType",
    type: "select",
    options: powerSourcesNonElectric,
    format: (v: any) => {
      if (v === "HYDROGEN") return "Hidrogeno";
      if (v === "GASOLINE") return "Gasolina";
      if (v === "OTHERS") return "Otros";
      return v ? String(v) : "No especificado";
    },
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
    label: "Velocidad max (m/s)",
    type: "number",
    validate: (val: any) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= LIMITS.MAX_SPEED;
    },
    error: `Maximo permitido: ${LIMITS.MAX_SPEED} km/h`,
  },
  {
    label: "Configuración",
    key: "config",
    type: "select",
    options: configs,
  },
  {
    key: "impactEnergy",
    label: "Energia impacto (J)",
    type: "number",
    validate: (val: any) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= LIMITS.MAX_ENERGY;
    },
    error: `Maximo permitido: ${LIMITS.MAX_ENERGY} J`,
  },
  {
    key: "maxAutonomy",
    label: "Autonomía máxima (min)",
    type: "number",
    validate: (val: any) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= LIMITS.MAX_AUTONOMY && Number.isInteger(num);
    },
    error: `Maximo permitido: ${LIMITS.MAX_AUTONOMY} min y no se permiten decimales`,
  },
  {
    label: "Camara",
    key: "hasCamera",
    type: "select",
    options: ["Si", "No"],
    format: (v: any) => {
      if (v === true) return "Si";
      if (v === false) return "No";
      return "No especificado";
    },
    error: "Seleccione una opcion valida",
  },
  {
    label: "Construcción privada",
    key: "privatelyBuilt",
    type: "select",
    options: ["Si", "No"],
    format: (v: any) => {
      if (v === true) return "Si";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  {
    label: "Paracaídas",
    key: "hasParachute",
    type: "select",
    options: ["Si", "No"],
    format: (v: any) => {
      if (v === true) return "Si";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  {
    label: "Seguro RC",
    key: "hasEnsurance",
    type: "select",
    options: ["Si", "No"],
    format: (v: any) => {
      if (v === true) return "Si";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  {
    label: "Sistema FTS",
    key: "hasFTS",
    type: "select",
    options: ["Si", "No"],
    format: (v: any) => {
      if (v === true) return "Si";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  {
    label: "Cautivo",
    key: "cautive",
    type: "select",
    options: ["Si", "No", "Opcional"],
    format: (v: any) => {
      if (v === null || v === undefined || v === "") return "No especificado";
      const val = String(v).toUpperCase();
      if (val === "YES" || val === "SI") return "Si";
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
    error: "Maximo 800 caracteres",
  },
  {
    label: "Observaciones",
    key: "observations",
    type: "textarea",
    validate: (v: any) => v == null || String(v).length <= 800,
    error: "Maximo 800 caracteres",
  },
  {
    label: "Horas de vuelo (min)",
    key: "flightMinutes",
    type: "number",
    validate: (val: any) => Number.isInteger(Number(val)) && Number(val) >= 0,
    error: "Debe ser un numero entero mayor o igual que 0",
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