import { apiFetch } from "../../api";
import type { AnexoStatus, OperationDetailDTO, OperationListDTO } from "./operation.types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;

type AnexoBaseData = {
  id?: number;
  numeroVersion?: number;
  estado?: AnexoStatus | null;
};

export type AuthorizedUser = {
  id: number;
  username?: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

export type Anexo5AptitudFirma = {
  userId: number;
  username: string;
  fullName: string;
  fechaFirma: string;
};

export type Anexo4Data = AnexoBaseData & {
  conops?: string;
  personalSeleccionado?: AuthorizedUser[];
  creadorUsername?: string;
  [key: string]: any;
};

export type Anexo5Data = AnexoBaseData & {
  nombreConops?: string;
  fechaOp?: string;
  vlos?: boolean | null;
  ubicacionObservadores?: boolean | null;
  evaluacionVisibilidadYAlcance?: boolean | null;
  condicionantesAcordadosConGestor?: boolean | null;
  analisisEnFuncionConops?: boolean | null;
  evaluacionEntornoAereoAdyacente?: boolean | null;
  vueloTerrestreControlado?: boolean | null;
  notamActivos?: boolean | null;
  tsaPreviaNotam?: boolean | null;
  procedimientosATSP?: boolean | null;
  condicionesClimatologicas?: boolean | null;
  personalSabeFunciones?: boolean | null;
  comunicacionEntrePersonal?: boolean | null;
  comunicacion3Partes?: boolean | null;
  requisitosSeguridad?: boolean | null;
  requisitosMedioAmbiente?: boolean | null;
  requisitosRadioelectrico?: boolean | null;
  requisitosLocalesEspecificos?: boolean | null;
  atenuacionesGRC?: boolean | null;
  atenuacionesARC?: boolean | null;
  comprobacionesUasVuelo?: boolean | null;
  personalSeleccionado?: AuthorizedUser[];
  aptitudFirmas?: Anexo5AptitudFirma[];
  creadorUsername?: string;
};

export type Anexo6Data = AnexoBaseData & {
  nombreConops?: string;
  fechaOp?: string;
  materialesAuxiliares?: string[];
  sinImpacto?: boolean | null;
  centroGravedad?: boolean | null;
  integridadEstructural?: boolean | null;
  cableado?: boolean | null;
  verificacionLuces?: boolean | null;
  calibracion?: boolean | null;
  validarSalidaDatos?: boolean | null;
  giranLibremente?: boolean | null;
  sentidoGiroCorrecto?: boolean | null;
  sinImpactoMotores?: boolean | null;
  colocacionCorrecta?: boolean | null;
  sujetacionFirme?: boolean | null;
  sinImpactoHelices?: boolean | null;
  bateriaCarga?: boolean | null;
  movimientoFluidoMando?: boolean | null;
  sinImpactoPartesMoviles?: boolean | null;
  movimientoFluidoPartesMoviles?: boolean | null;
  antenasInstaladasYOrientadas?: boolean | null;
  calidadOnda?: boolean | null;
  recepcionAdecuada?: boolean | null;
  fuenteAlimentacion?: boolean | null;
  nivelFuenteAlimentacion?: boolean | null;
  fijacionCorrecta?: boolean | null;
  memoriaSuficienteParaDatos?: boolean | null;
  sinImpactoCargaPago?: boolean | null;
  conexionesCargaPago?: boolean | null;
  datosCargados?: boolean | null;
  transmisionDatos?: boolean | null;
  informacionActualizada?: boolean | null;
  sistemaActivado?: boolean | null;
};

export type Anexo7Data = AnexoBaseData & {
  nombreConops?: string;
  fechaOp?: string;
  estructuraCorrecto?: boolean | null;
  estructuraObservaciones?: string;
  bateriasCorrecto?: boolean | null;
  bateriasObservaciones?: string;
  sensoresCorrecto?: boolean | null;
  sensoresObservaciones?: string;
  motoresCorrecto?: boolean | null;
  motoresObservaciones?: string;
  helicesCorrecto?: boolean | null;
  helicesObservaciones?: string;
  partesMovilesCorrecto?: boolean | null;
  partesMovilesObservaciones?: string;
  comunicacionesCorrecto?: boolean | null;
  comunicacionesObservaciones?: string;
  plantaPotenciaCorrecto?: boolean | null;
  plantaPotenciaObservaciones?: string;
  cargaPagoCorrecto?: boolean | null;
  cargaPagoObservaciones?: string;
  identificacionRemotaCorrecto?: boolean | null;
  identificacionRemotaObservaciones?: string;
  sistemaGeoconscienciaCorrecto?: boolean | null;
  sistemaGeoconscienciaObservaciones?: string;
  datosVueloCorrecto?: boolean | null;
  datosVueloObservaciones?: string;
  otrosVerificacionCorrecto?: boolean | null;
  otrosVerificacionObservaciones?: string;
  aeronaveCorrecto?: boolean | null;
  aeronaveObservaciones?: string;
  unidadControlCorrecto?: boolean | null;
  unidadControlObservaciones?: string;
  sensoresRecogidaCorrecto?: boolean | null;
  sensoresRecogidaObservaciones?: string;
  antenasCorrecto?: boolean | null;
  antenasObservaciones?: string;
  otrosRecogidaCorrecto?: boolean | null;
  otrosRecogidaObservaciones?: string;
};

export type Anexo8Data = AnexoBaseData & {
  nombreConops?: string;
  fechaOp?: string;
  condicionesATSP?: boolean | null;
  comunicacion3FinalizacionOperacion?: boolean | null;
  comunicacionZrvfCecaf?: boolean | null;
  anotacionTiempoVueloAeronave?: boolean | null;
  anotacionTIempoActividadPersonal?: boolean | null;
  anotacionEventosOcurridosOperacion?: boolean | null;
  comunicacionIncidentes?: boolean | null;
};

export async function fetchOperations(path: string) {
  const response = await apiFetch(path, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response) {
    return [];
  }

  return (await response.json()) as OperationListDTO[];
}

export async function fetchOperationDetail(id: string | number) {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${id}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as OperationDetailDTO;
}

export async function fetchNextOperationCodigo() {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/next-codigo`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response) {
    return null;
  }

  const payload = (await response.json()) as { codigo: string };
  return payload.codigo;
}

export async function createOperation(conops = "") {
  const formData = new FormData();
  if (conops.trim()) {
    formData.append("conops", conops.trim());
  }

  const response = await apiFetch(`${API_BASE_URL}/api/operations`, {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as OperationDetailDTO;
}

export async function fetchAnexo4Data(operationId: number): Promise<Anexo4Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo4/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo4Data;
}

export async function fetchAnexo5Data(operationId: number): Promise<Anexo5Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo5/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo5Data;
}

export async function fetchAnexo5VersionData(
  operationId: number,
  anexoId: number,
): Promise<Anexo5Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo5/${anexoId}/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo5Data;
}

export async function fetchAnexo6Data(operationId: number): Promise<Anexo6Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo6/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo6Data;
}

export async function fetchAnexo6VersionData(
  operationId: number,
  anexoId: number,
): Promise<Anexo6Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo6/${anexoId}/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo6Data;
}

export async function fetchAnexo7Data(operationId: number): Promise<Anexo7Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo7/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo7Data;
}

export async function fetchAnexo7VersionData(
  operationId: number,
  anexoId: number,
): Promise<Anexo7Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo7/${anexoId}/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo7Data;
}

export async function fetchAnexo8Data(operationId: number): Promise<Anexo8Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo8/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo8Data;
}

export async function fetchAnexo8VersionData(
  operationId: number,
  anexoId: number,
): Promise<Anexo8Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo8/${anexoId}/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo8Data;
}

export async function fetchAnexo4VersionData(
  operationId: number,
  anexoId: number,
): Promise<Anexo4Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo4/${anexoId}/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo4Data;
}

export async function saveAnexo4Data(
  operationId: number,
  formData: FormData,
): Promise<Anexo4Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo4`, {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo4Data;
}

export async function saveAnexo5Data(
  operationId: number,
  formData: FormData,
): Promise<Anexo5Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo5`, {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo5Data;
}

export async function saveAnexo6Data(
  operationId: number,
  formData: FormData,
): Promise<Anexo6Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo6`, {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo6Data;
}

export async function saveAnexo7Data(
  operationId: number,
  formData: FormData,
): Promise<Anexo7Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo7`, {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo7Data;
}

export async function saveAnexo8Data(
  operationId: number,
  formData: FormData,
): Promise<Anexo8Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo8`, {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo8Data;
}

export async function signAnexo4Data(operationId: number, anexoId: number): Promise<Anexo4Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo4/${anexoId}/firmar/datos`, {
    method: "PUT",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo4Data;
}

export async function signAnexo5Data(operationId: number, anexoId: number): Promise<Anexo5Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo5/${anexoId}/firmar/datos`, {
    method: "PUT",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo5Data;
}

export async function signAnexo5AptitudData(operationId: number, anexoId: number): Promise<Anexo5Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo5/${anexoId}/aptitud/firmar`, {
    method: "PUT",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo5Data;
}

export async function unsignAnexo5AptitudData(operationId: number, anexoId: number, userId: number): Promise<Anexo5Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo5/${anexoId}/aptitud/firmas/${userId}`, {
    method: "DELETE",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo5Data;
}

export async function signAnexo6Data(operationId: number, anexoId: number): Promise<Anexo6Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo6/${anexoId}/firmar/datos`, {
    method: "PUT",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo6Data;
}

export async function signAnexo7Data(operationId: number, anexoId: number): Promise<Anexo7Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo7/${anexoId}/firmar/datos`, {
    method: "PUT",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo7Data;
}

export async function signAnexo8Data(operationId: number, anexoId: number): Promise<Anexo8Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo8/${anexoId}/firmar/datos`, {
    method: "PUT",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo8Data;
}

export async function remakeAnexo4Data(operationId: number, anexoId: number): Promise<Anexo4Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo4/${anexoId}/rehacer/datos`, {
    method: "POST",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo4Data;
}

export async function remakeAnexo5Data(operationId: number, anexoId: number): Promise<Anexo5Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo5/${anexoId}/rehacer/datos`, {
    method: "POST",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo5Data;
}

export async function remakeAnexo6Data(operationId: number, anexoId: number): Promise<Anexo6Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo6/${anexoId}/rehacer/datos`, {
    method: "POST",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo6Data;
}

export async function remakeAnexo7Data(operationId: number, anexoId: number): Promise<Anexo7Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo7/${anexoId}/rehacer/datos`, {
    method: "POST",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo7Data;
}

export async function remakeAnexo8Data(operationId: number, anexoId: number): Promise<Anexo8Data | null> {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo8/${anexoId}/rehacer/datos`, {
    method: "POST",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo8Data;
}

export async function saveAnexo(operationId: number, tipoAnexo: number, textoPrueba: string) {
  const formData = new FormData();
  formData.append("textoPrueba", textoPrueba);

  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/anexo${tipoAnexo}`, {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return null;
  }
  return true;
}

export async function signAnexo(operationId: number, tipoAnexo: number, anexoId: number) {
  const response = await apiFetch(
    `${API_BASE_URL}/api/operations/${operationId}/anexo${tipoAnexo}/${anexoId}/firmar`,
    {
      method: "PUT",
    },
  );

  if (!response) {
    return null;
  }
  return true;
}

export async function remakeAnexo(operationId: number, tipoAnexo: number, anexoId: number) {
  const response = await apiFetch(
    `${API_BASE_URL}/api/operations/${operationId}/anexo${tipoAnexo}/${anexoId}/rehacer`,
    {
      method: "POST",
    },
  );

  if (!response) {
    return null;
  }
  return true;
}

export async function completeOperation(operationId: number) {
  const response = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}/completar`, {
    method: "PUT",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as OperationDetailDTO;
}

export async function deleteOperation(operationId: number) {
  // Llama al endpoint backend vía apiFetch, que ya añade tokens y base URL
  // Devuelve true si todo va bien, lanza error si hay problema
  const res = await apiFetch(`${API_BASE_URL}/api/operations/${operationId}`, {
    method: "DELETE",
  });

  // (Opcional) chequea el status HTTP
  if (!res?.ok) {
    throw new Error("Error al borrar la operación");
  }
  return true;
}
