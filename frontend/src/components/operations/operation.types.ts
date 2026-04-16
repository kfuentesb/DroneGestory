export type OperationStatus = "CANCELADA" | "EN_CURSO" | "PENDIENTE" | "COMPLETADA";

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
  nombreAsignado?: string;
  nombreCreador: string;
  fechaCreacion: string;
  fechaActualizacion: string | null;
  estadoOperacion: OperationStatus;
  completada: boolean;
  todosAnexosFirmados: boolean;
  anexos: OperationAnexoDetailDTO[];
};
