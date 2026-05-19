export const aircraftClasses = [
    { value: "No", label: "No tiene" },
    { value: "C0", label: "C0" },
    { value: "C1", label: "C1" },
    { value: "C2", label: "C2" },
    { value: "C3", label: "C3" },
    { value: "C4", label: "C4" },
    { value: "Legacy", label: "Legacy" },
];

export const configs = [
    { value: "Hibrido_vtol", label: "Híbrido/VTOL" },
    { value: "Avion", label: "Avión" },
    { value: "Multirrotor", label: "Multirrotor" },
    { value: "Helicoptero", label: "Helicóptero" },
    { value: "Ligero", label: "Ligero" },
    { value: "Otro", label: "Otro" }
];

export const yesNoOptions = [
    { value: "true", label: "Sí" },
    { value: "false", label: "No" },
];

export const cautiveOptions = [
    { value: "YES", label: "Sí" },
    { value: "NO", label: "No" },
    { value: "OPTIONAL", label: "Opcional" },
];

export const powerSources = [
    { value: "ELECTRIC", label: "Eléctrico" },
    { value: "NON_ELECTRIC", label: "No Eléctrico" },
];

export const powerSourcesNonElectric = [
    { value: "HYDROGEN", label: "Hidrógeno" },
    { value: "GASOLINE", label: "Gasolina" },
    { value: "OTHERS", label: "Otros" },
];

export const LIMITS = {
    MIN_MTOM: 0.01,        // kg
    MAX_MTOM: 1000,         // kg
    MIN_WINGSPAN: 0.05,    // meters
    MAX_WINGSPAN: 50,      // meters
    MAX_SPEED: 360,        // km/h
    MAX_ENERGY: 100000,     // Joules
    MAX_AUTONOMY: 7200      // minutes (5 días)
};