export type OperationStatus = "CANCELADA" | "EN_CURSO" | "PENDIENTE" | "COMPLETADA";

export type Anexo4Fields = {
  descripcion: string;
  fechaHoraPrevista: string;
  mediosMateriales: string;
  direccion: string;
  coords: string;
  personal: string;
  imagenEspacioAereo: string;
  imagenZonaVuelo: string;
  espacioAereoControlado: string;
  estudioAeronauticoCoordinado: string;
  entornoAerodromos: string;
  distanciaMinimaInfraestructuras: string;
  zonasProhibidasFlexible: string;
  cumpleCondiciones: string;
  zonasSeguridad: string;
  permisoPrevioSeguridad: string;
  serviciosEsencialesComunidad: string;
  permisoPrevioServicios: string;
  entornosUrbanos: string;
  cumplenDistanciasEdificios: string;
  comunicacionMinisterioInterior: string;
  zonaResVueloFotografico: string;
  permisoCecaf: string;
  zonasProtMedioambiental: string;
  disponeCoordGestor: string;
  conopsYModeloSemantico: string;
  aplicaModelo: string;
  defineGeografiaVueloConops: string;
  defineVolContigencia: string;
  defineMargenRiesgoTierra: string;
  defineZonaTerrestreControlada: string;
  planificaUbicacionObservadores: string;
  calculaAreaYEvaluaRiesgo: string;
  notams: string;
  revisaNotams: string;
  tsaOCondicionada: string;
  otrasLimitaciones: string;
};

export type Anexo4ResponseDTO = {
  id: number | null;
  numeroVersion: number;
  estado: AnexoStatus;
  descripcion: string | null;
  fechaHoraPrevista: string | null;
  mediosMateriales: string | null;
  direccion: string | null;
  coords: string | null;
  personal: string | null;
  imagenEspacioAereo: string | null;
  imagenZonaVuelo: string | null;
  espacioAereoControlado: boolean | null;
  estudioAeronauticoCoordinado: boolean | null;
  entornoAerodromos: boolean | null;
  distanciaMinimaInfraestructuras: boolean | null;
  zonasProhibidasFlexible: boolean | null;
  cumpleCondiciones: boolean | null;
  zonasSeguridad: boolean | null;
  permisoPrevioSeguridad: boolean | null;
  serviciosEsencialesComunidad: boolean | null;
  permisoPrevioServicios: boolean | null;
  entornosUrbanos: boolean | null;
  cumplenDistanciasEdificios: boolean | null;
  comunicacionMinisterioInterior: boolean | null;
  zonaResVueloFotografico: boolean | null;
  permisoCecaf: boolean | null;
  zonasProtMedioambiental: boolean | null;
  disponeCoordGestor: boolean | null;
  conopsYModeloSemantico: boolean | null;
  aplicaModelo: boolean | null;
  defineGeografiaVueloConops: boolean | null;
  defineVolContigencia: boolean | null;
  defineMargenRiesgoTierra: boolean | null;
  defineZonaTerrestreControlada: boolean | null;
  planificaUbicacionObservadores: boolean | null;
  calculaAreaYEvaluaRiesgo: boolean | null;
  notams: boolean | null;
  revisaNotams: boolean | null;
  tsaOCondicionada: boolean | null;
  otrasLimitaciones: boolean | null;
};

export type AnexoColor = "AMARILLO" | "VERDE" | "GRIS";
export type AnexoStatus = "BORRADOR" | "FIRMADO" | null;

export type OperationListDTO = {
  idOperacion: number;
  nombreOperacion: string;
  nombreCreador: string;
  fechaCreacion: string;
  estado: OperationStatus;
  completada: boolean;
  anexo4Version: string;
  anexo4Color: AnexoColor;
  anexo5Version: string;
  anexo5Color: AnexoColor;
  anexo6Version: string;
  anexo6Color: AnexoColor;
  anexo7Version: string;
  anexo7Color: AnexoColor;
  anexo8Version: string;
  anexo8Color: AnexoColor;
  todosFirmadosPendiente: boolean;
};

export type AnexoInfoDTO = {
  id: number | null;
  numeroVersion: number;
  estado: AnexoStatus;
  color: AnexoColor;
};

export type AnexoHistoricoDTO = {
  id: number;
  numeroVersion: number;
  estado: Exclude<AnexoStatus, null>;
  color: Exclude<AnexoColor, "GRIS">;
  firmadoPor: string | null;
  fechaFirma: string | null;
  textoPrueba: string | null;
};

export type OperationAnexoDetailDTO = {
  tipoAnexo: number;
  actual: AnexoInfoDTO;
  versiones: AnexoHistoricoDTO[];
};

export type OperationDetailDTO = {
  idOperacion: number;
  nombreOperacion: string;
  nombreCreador: string;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  estadoOperacion: OperationStatus;
  completada: boolean;
  todosAnexosFirmados: boolean;
  anexos: OperationAnexoDetailDTO[];
};
