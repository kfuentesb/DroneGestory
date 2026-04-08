export type ConopsCategory = {
    id: string;
    label: string;
};

export const CONOPS_CATEGORIES: ConopsCategory[] = [
    { id: "opnoc", label: "Operaciones nocturnas" },
    { id: "sobrevuelo", label: "Sobrevuelo (vuelo sobre areas pobladas conocidas o sobre reuniones de personas)" },
    { id: "opBVLOS", label: "Operaciones BVLOS" },
    { id: "opBajaAlt", label: "Operaciones a baja altitud (menos de 500 pies)" },
    { id: "espNoSegreg", label: "Vuelos en espacio aereo no segregado" },
    { id: "transpDepCarg", label: "Transporte y/o deposito de carga" },
    { id: "transpMercPelig", label: "Transporte de mercancias peligrosas" },
    { id: "opMultUASyEnjamb", label: "Operaciones con multiples UAS y enjambres" },
    { id: "lanzRecpUAeqEsp", label: "Lanzamiento y recuperacion de la UA usando equipo especial" },
    { id: "terrenMonta", label: "Vuelo sobre terreno montanoso" },
    { id: "altoGradAutomat", label: "Operaciones con un alto grado de automatizacion" },
    { id: "120mAltAGL", label: "Operaciones a mas de 120m de altura AGL" },
    { id: "UASPotenNoElec", label: "Operaciones con UAS con planta de potencia no electrica" },
    { id: "espAerContrlFIZ", label: "Operaciones en espacio aereo controlado y FIZ" },
    { id: "entDromoAeroPuertHeli", label: "Operaciones en entorno de aerodromos, aeropuertos y helipuertos" },
    { id: "esparcirSustancMateriales", label: "Operaciones que impliquen esparcir o dejar caer sustancias o materiales" },
];
