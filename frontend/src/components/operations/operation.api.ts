import { apiFetch } from "../../api";
import type { OperationDetailDTO, OperationListDTO } from "./operation.types";

export type Anexo4Data = Record<string, any>;

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
  const response = await apiFetch(`/api/operations/${id}`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as OperationDetailDTO;
}

export async function createOperation(nombreOperacion: string) {
  const formData = new FormData();
  formData.append("nombreOperacion", nombreOperacion);

  const response = await apiFetch("/api/operations", {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as OperationDetailDTO;
}

export async function fetchAnexo4Data(operationId: number): Promise<Anexo4Data | null> {
  const response = await apiFetch(`/api/operations/${operationId}/anexo4/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo4Data;
}

export async function fetchAnexo4VersionData(
  operationId: number,
  anexoId: number,
): Promise<Anexo4Data | null> {
  const response = await apiFetch(`/api/operations/${operationId}/anexo4/${anexoId}/datos`);

  if (!response || response.status === 204) {
    return null;
  }

  return (await response.json()) as Anexo4Data;
}

export async function saveAnexo4Data(
  operationId: number,
  formData: FormData,
): Promise<Anexo4Data | null> {
  const response = await apiFetch(`/api/operations/${operationId}/anexo4`, {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo4Data;
}

export async function signAnexo4Data(operationId: number, anexoId: number): Promise<Anexo4Data | null> {
  const response = await apiFetch(`/api/operations/${operationId}/anexo4/${anexoId}/firmar/datos`, {
    method: "PUT",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo4Data;
}

export async function remakeAnexo4Data(operationId: number, anexoId: number): Promise<Anexo4Data | null> {
  const response = await apiFetch(`/api/operations/${operationId}/anexo4/${anexoId}/rehacer/datos`, {
    method: "POST",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as Anexo4Data;
}

export async function saveAnexo(operationId: number, tipoAnexo: number, textoPrueba: string) {
  const formData = new FormData();
  formData.append("textoPrueba", textoPrueba);

  const response = await apiFetch(`/api/operations/${operationId}/anexo${tipoAnexo}`, {
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
    `/api/operations/${operationId}/anexo${tipoAnexo}/${anexoId}/firmar`,
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
    `/api/operations/${operationId}/anexo${tipoAnexo}/${anexoId}/rehacer`,
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
  const response = await apiFetch(`/api/operations/${operationId}/completar`, {
    method: "PUT",
  });

  if (!response) {
    return null;
  }

  return (await response.json()) as OperationDetailDTO;
}
