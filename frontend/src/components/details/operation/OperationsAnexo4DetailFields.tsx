import type { FieldConfig } from "../FieldConfig";

const initialFields = {
  descripcion: "",
  fechaHoraPrevista: "",
  mediosMateriales: "",
  direccion: "",
  coords: "",
  personal: "",
  imagenEspacioAereo: "",
  imagenZonaVuelo: "",
  espacioAereoControlado: "",
  estudioAeronauticoCoordinado: "",
  entornoAerodromos: "",
  distanciaMinimaInfraestructuras: "",
  zonasProhibidasFlexible: "",
  cumpleCondiciones: "",
  zonasSeguridad: "",
  permisoPrevioSeguridad: "",
  serviciosEsencialesComunidad: "",
  permisoPrevioServicios: "",
  entornosUrbanos: "",
  cumplenDistanciasEdificios: "",
  comunicacionMinisterioInterior: "",
  zonaResVueloFotografico: "",
  permisoCecaf: "",
  zonasProtMedioambiental: "",
  disponeCoordGestor: "",
  conopsYModeloSemantico: "",
  aplicaModelo: "",
  defineGeografiaVueloConops: "",
  defineVolContigencia: "",
  defineMargenRiesgoTierra: "",
  defineZonaTerrestreControlada: "",
  planificaUbicacionObservadores: "",
  calculaAreaYEvaluaRiesgo: "",
  notams: "",
  revisaNotams: "",
  tsaOCondicionada: "",
};

const booleanFields = [
  "espacioAereoControlado",
  "estudioAeronauticoCoordinado",
  "entornoAerodromos",
  "distanciaMinimaInfraestructuras",
  "zonasProhibidasFlexible",
  "cumpleCondiciones",
  "zonasSeguridad",
  "permisoPrevioSeguridad",
  "serviciosEsencialesComunidad",
  "permisoPrevioServicios",
  "entornosUrbanos",
  "cumplenDistanciasEdificios",
  "comunicacionMinisterioInterior",
  "zonaResVueloFotografico",
  "permisoCecaf",
  "zonasProtMedioambiental",
  "disponeCoordGestor",
  "conopsYModeloSemantico",
  "aplicaModelo",
  "defineGeografiaVueloConops",
  "defineVolContigencia",
  "defineMargenRiesgoTierra",
  "defineZonaTerrestreControlada",
  "planificaUbicacionObservadores",
  "calculaAreaYEvaluaRiesgo",
  "notams",
  "revisaNotams",
  "tsaOCondicionada",
];

export const operationAnexo4DetailFields: FieldConfig[] = [
  {
    label: "Descripción",
    key: "descripcion",
    type: "text",
  },
  { label: "Fecha/Hora Prevista", key: "fechaHoraPrevista", type: "date" },
  { label: "Medios materiales", key: "mediosMateriales", type: "text" },
  { label: "Dirección", key: "direccion", type: "text" },
  { label: "Coordenadas", key: "coords", type: "text" },
  { label: "Personal", key: "personal", type: "text" },
  { label: "Imagen Espacio Aéreo", 
    key: "imagenEspacioAereoFile", 
    type: "file",
    validate: (file: File | null) => {
        if (!file) return true;

        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

        return file.size <= maxSize && allowedTypes.includes(file.type);
    },
    error: "La imagen debe ser JPG o PNG y pesar menos de 5MB",
  },
  { label: 
    "Imagen Zona Vuelo", 
    key: "imagenZonaVueloFile", 
    type: "file",
    validate: (file: File | null) => {
        if (!file) return true;

        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

        return file.size <= maxSize && allowedTypes.includes(file.type);
    },
    error: "La imagen debe ser JPG o PNG y pesar menos de 5MB",
  },

  // Booleanos
  { label: "espacioAereoControlado", key: "espacioAereoControlado", type: "boolean" },
  { label: "estudioAeronauticoCoordinado", key: "estudioAeronauticoCoordinado", type: "boolean" },
  { label: "entornoAerodromos", key: "entornoAerodromos", type: "boolean" },
  { label: "distanciaMinimaInfraestructuras", key: "distanciaMinimaInfraestructuras", type: "boolean" },
  { label: "zonasProhibidasFlexible", key: "zonasProhibidasFlexible", type: "boolean" },
  { label: "cumpleCondiciones", key: "cumpleCondiciones", type: "boolean" },
  { label: "zonasSeguridad", key: "zonasSeguridad", type: "boolean" },
  { label: "permisoPrevioSeguridad", key: "permisoPrevioSeguridad", type: "boolean" },
  { label: "serviciosEsencialesComunidad", key: "serviciosEsencialesComunidad", type: "boolean" },
  { label: "permisoPrevioServicios", key: "permisoPrevioServicios", type: "boolean" },
  { label: "entornosUrbanos", key: "entornosUrbanos", type: "boolean" },
  { label: "cumplenDistanciasEdificios", key: "cumplenDistanciasEdificios", type: "boolean" },
  { label: "comunicacionMinisterioInterior", key: "comunicacionMinisterioInterior", type: "boolean" },
  { label: "zonaResVueloFotografico", key: "zonaResVueloFotografico", type: "boolean" },
  { label: "permisoCecaf", key: "permisoCecaf", type: "boolean" },
  { label: "zonasProtMedioambiental", key: "zonasProtMedioambiental", type: "boolean" },
  { label: "disponeCoordGestor", key: "disponeCoordGestor", type: "boolean" },
  { label: "conopsYModeloSemantico", key: "conopsYModeloSemantico", type: "boolean" },
  { label: "aplicaModelo", key: "aplicaModelo", type: "boolean" },
  { label: "defineGeografiaVueloConops", key: "defineGeografiaVueloConops", type: "boolean" },
  { label: "defineVolContigencia", key: "defineVolContigencia", type: "boolean" },
  { label: "defineMargenRiesgoTierra", key: "defineMargenRiesgoTierra", type: "boolean" },
  { label: "defineZonaTerrestreControlada", key: "defineZonaTerrestreControlada", type: "boolean" },
  { label: "planificaUbicacionObservadores", key: "planificaUbicacionObservadores", type: "boolean" },
  { label: "calculaAreaYEvaluaRiesgo", key: "calculaAreaYEvaluaRiesgo", type: "boolean" },
  { label: "notams", key: "notams", type: "boolean" },
  { label: "revisaNotams", key: "revisaNotams", type: "boolean" },
  { label: "tsaOCondicionada", key: "tsaOCondicionada", type: "boolean" },
];
