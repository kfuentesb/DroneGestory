import { apiFetch } from "../../api";
import type { Anexo4Fields, Anexo4ResponseDTO, OperationDetailDTO, OperationListDTO } from "./operation.types";

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

export async function fetchAnexo4Detail(operationId: number | string) {
  const response = await apiFetch(`/api/operations/${operationId}/anexo4/detalle`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response) {
    return null;
  }

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as Anexo4ResponseDTO;
}

export async function saveAnexo4(operationId: number | string, fields: Anexo4Fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== "") {
      formData.append(key, value);
    }
  });

  const response = await apiFetch(`/api/operations/${operationId}/anexo4`, {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return null;
  }

  return await response.json();
}
