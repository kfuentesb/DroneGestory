import type { FieldConfig } from "../FieldConfig";
import { LIMITS, aircraftClasses, configs, powerSources} from "../../../global-const/aircraft-const";

export const aircraftModelFields: FieldConfig[] = [
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
    label: "Clase (valor por defecto)",
    key: "aircraftClassDefault",
    type: "select",
    options: aircraftClasses.map((opt) => opt.value),
  },
  {
    key: "mtomDefault",
    label: "MTOM (valor por defecto, kg)",
    type: "number",
    validate: (val: any) => {
      if (val === null || val === undefined || String(val).trim() === "") return true;
      const num = Number(val);
      return !isNaN(num) && num >= LIMITS.MIN_MTOM && num <= LIMITS.MAX_MTOM;
    },
    error: `Rango: ${LIMITS.MIN_MTOM} - ${LIMITS.MAX_MTOM} kg`,
  },
  {
    key: "wingspanDefault",
    label: "Dimensión (valor por defecto, m)",
    type: "number",
    validate: (val: any) => {
      if (val === null || val === undefined || String(val).trim() === "") return true;
      const num = Number(val);
      return !isNaN(num) && num >= LIMITS.MIN_WINGSPAN && num <= LIMITS.MAX_WINGSPAN;
    },
    error: `Rango: ${LIMITS.MIN_WINGSPAN} - ${LIMITS.MAX_WINGSPAN} m`,
  },
  {
    key: "maxSpeedDefault",
    label: "Velocidad max (valor por defecto, m/s)",
    type: "number",
    validate: (val: any) => {
      if (val === null || val === undefined || String(val).trim() === "") return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= LIMITS.MAX_SPEED;
    },
    error: `Maximo permitido: ${LIMITS.MAX_SPEED} km/h`,
  },
  {
    label: "Configuración (valor por defecto)",
    key: "configDefault",
    type: "select",
    options: configs.map((opt) => opt.value),
  },
  {
    key: "impactEnergyDefault",
    label: "Energía impacto (valor por defecto, J)",
    type: "number",
    validate: (val: any) => {
      if (val === null || val === undefined || String(val).trim() === "") return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= LIMITS.MAX_ENERGY;
    },
    error: `Maximo permitido: ${LIMITS.MAX_ENERGY} J`,
  },
  {
    key: "maxAutonomyDefault",
    label: "Autonomía máxima (min)",
    type: "number",
    validate: (val: any) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= LIMITS.MAX_AUTONOMY && Number.isInteger(num);
    },
    error: `Maximo permitido: ${LIMITS.MAX_AUTONOMY} min y no se permiten decimales`,
  },
  {
    label: "Cámara (valor por defecto)",
    key: "hasCameraDefault",
    type: "select",
    options: ["Si", "No"],
    format: (v: any) => {
      if (v === true) return "Si";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  {
    label: "Construcción privada (valor por defecto)",
    key: "privatelyBuiltDefault",
    type: "select",
    options: ["Si", "No"],
    format: (v: any) => {
      if (v === true) return "Si";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  {
    label: "Paracaídas (valor por defecto)",
    key: "hasParachuteDefault",
    type: "select",
    options: ["Si", "No"],
    format: (v: any) => {
      if (v === true) return "Si";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  // {
  //   label: "Seguro RC (valor por defecto)",
  //   key: "hasEnsuranceDefault",
  //   type: "select",
  //   options: ["Si", "No"],
  //   format: (v: any) => {
  //     if (v === true) return "Si";
  //     if (v === false) return "No";
  //     return "No especificado";
  //   },
  // },
  {
    label: "Sistema FTS (valor por defecto)",
    key: "hasFTSDefault",
    type: "select",
    options: ["Si", "No"],
    format: (v: any) => {
      if (v === true) return "Si";
      if (v === false) return "No";
      return "No especificado";
    },
  },
  {
    label: "Fuente de potencia (valor por defecto)",
    key: "powerSourceDefault",
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
    label: "Fuente no eléctrica (valor por defecto)",
    key: "powerSourceTypeDefault",
    type: "select",
    options: ["HYDROGEN", "GASOLINE", "OTHERS"],
    format: (v: any) => {
      if (v === "HYDROGEN") return "Hidrógeno";
      if (v === "GASOLINE") return "Gasolina";
      if (v === "OTHERS") return "Otros";
      return v ? String(v) : "No especificado";
    },
  },
  {
    label: "Cautivo (valor por defecto)",
    key: "cautiveDefault",
    type: "select",
    options: ["Si", "No", "Opcional"],
    format: (v: any) => {
      if (v === null || v === undefined || v === "") return "No especificado";
      const val = String(v).toUpperCase();
      if (val === "YES" || val === "SI" || val === "SÍ") return "Si";
      if (val === "NO") return "No";
      if (val === "OPTIONAL" || val === "OPCIONAL") return "Opcional";
      return String(v);
    },
  },
  {
    label: "Accesorios (valor por defecto)",
    key: "accessoriesDefault",
    type: "textarea",
    validate: (v: any) => v == null || String(v).length <= 800,
    error: "Maximo 800 caracteres",
  },
  {
    label: "Observaciones (valor por defecto)",
    key: "observationsDefault",
    type: "textarea",
    validate: (v: any) => v == null || String(v).length <= 800,
    error: "Maximo 800 caracteres",
  },
  {
    label: "Imagen del modelo",
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
