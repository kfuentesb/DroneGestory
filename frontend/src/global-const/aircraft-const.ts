export const aircraftClasses = [
    { value: "No", label: "No tiene" },
    { value: "C0", label: "C0" },
    { value: "C1", label: "C1" },
    { value: "C2", label: "C2" },
    { value: "C3", label: "C3" },
    { value: "C4", label: "C4" },
    { value: "C5", label: "C5" },
    { value: "C6", label: "C6" }
];

export const configs = [
    { value: "Avion", label: "Avión" },
    { value: "Multirrotor", label: "Multirrotor" },
    { value: "Helicoptero", label: "Helicóptero" },
    { value: "Hibrido", label: "Híbrido" },
    { value: "Ligero", label: "Ligero" },
    { value: "Otro", label: "Otro" }
];

export const LIMITS = {
    MIN_MTOM: 0.01,        // kg
    MAX_MTOM: 1000,         // kg
    MIN_WINGSPAN: 0.05,    // meters
    MAX_WINGSPAN: 50,      // meters
    MAX_SPEED: 360,        // km/h
    MAX_ENERGY: 100000      // Joules
};