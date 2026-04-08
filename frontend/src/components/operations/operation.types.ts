export type OperationStatus = "CANCELADA" | "EN_CURSO" | "PENDIENTE" | "COMPLETADA";

export type AnexoColor = "AMARILLO" | "VERDE" | "GRIS";
export type AnexoStatus = "BORRADOR" | "FIRMADO" | null;

export type Anexo4Data = {
  id?: number | null;
  numeroVersion?: number;
  estado?: AnexoStatus;
  // Sección 1: Información sobre las operaciones
  descripcion?: string | null;
  fechaHoraPrevista?: string | null;
  personal?: string | null;
  mediosMateriales?: string | null;
  // Sección 2: Evaluación del escenario
  direccion?: string | null;
  coords?: string | null;
  // Sección 3: Espacio aéreo (imagen)
  imagenEspacioAereo?: string | null;
  // Sección 4: Zonas geográficas UAS
  espacioAereoControlado?: boolean | null;
  estudioAeronauticoCoordinado?: boolean | null;
  entornoAerodromos?: boolean | null;
  distanciaMinimaInfraestructuras?: boolean | null;
  zonasProhibidasFlexible?: boolean | null;
  cumpleCondiciones?: boolean | null;
  zonasSeguridad?: boolean | null;
  permisoPrevioSeguridad?: boolean | null;
  serviciosEsencialesComunidad?: boolean | null;
  permisoPrevioServicios?: boolean | null;
  entornosUrbanos?: boolean | null;
  cumplenDistanciasEdificios?: boolean | null;
  comunicacionMinisterioInterior?: boolean | null;
  zonaResVueloFotografico?: boolean | null;
  permisoCecaf?: boolean | null;
  zonasProtMedioambiental?: boolean | null;
  disponeCoordGestor?: boolean | null;
  // Sección 5: Zona de vuelo (imagen)
  imagenZonaVuelo?: string | null;
  // Sección 6: Requisitos y limitaciones
  conopsYModeloSemantico?: boolean | null;
  aplicaModelo?: boolean | null;
  defineGeografiaVueloConops?: boolean | null;
  defineVolContigencia?: boolean | null;
  defineMargenRiesgoTierra?: boolean | null;
  defineZonaTerrestreControlada?: boolean | null;
  planificaUbicacionObservadores?: boolean | null;
  calculaAreaYEvaluaRiesgo?: boolean | null;
  notams?: boolean | null;
  revisaNotams?: boolean | null;
  tsaOCondicionada?: boolean | null;
};

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
