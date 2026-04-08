import { apiFetch } from "../../api";
import type { Anexo4Data, OperationDetailDTO, OperationListDTO } from "./operation.types";

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

export async function fetchAnexo4Detail(operationId: string | number): Promise<Anexo4Data | null> {
  const response = await apiFetch(`/api/operations/${operationId}/anexo4/actual/detalle`, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response) {
    return null;
  }

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as Anexo4Data;
}

export async function saveAnexo4Full(operationId: string | number, data: Anexo4Data) {
  const formData = new FormData();

  const appendIfNotNull = (key: string, value: string | boolean | null | undefined) => {
    if (value !== null && value !== undefined && value !== "") {
      formData.append(key, String(value));
    }
  };

  appendIfNotNull("descripcion", data.descripcion);
  appendIfNotNull("fechaHoraPrevista", data.fechaHoraPrevista);
  appendIfNotNull("personal", data.personal);
  appendIfNotNull("mediosMateriales", data.mediosMateriales);
  appendIfNotNull("direccion", data.direccion);
  appendIfNotNull("coords", data.coords);
  appendIfNotNull("imagenEspacioAereo", data.imagenEspacioAereo);
  appendIfNotNull("imagenZonaVuelo", data.imagenZonaVuelo);
  appendIfNotNull("espacioAereoControlado", data.espacioAereoControlado);
  appendIfNotNull("estudioAeronauticoCoordinado", data.estudioAeronauticoCoordinado);
  appendIfNotNull("entornoAerodromos", data.entornoAerodromos);
  appendIfNotNull("distanciaMinimaInfraestructuras", data.distanciaMinimaInfraestructuras);
  appendIfNotNull("zonasProhibidasFlexible", data.zonasProhibidasFlexible);
  appendIfNotNull("cumpleCondiciones", data.cumpleCondiciones);
  appendIfNotNull("zonasSeguridad", data.zonasSeguridad);
  appendIfNotNull("permisoPrevioSeguridad", data.permisoPrevioSeguridad);
  appendIfNotNull("serviciosEsencialesComunidad", data.serviciosEsencialesComunidad);
  appendIfNotNull("permisoPrevioServicios", data.permisoPrevioServicios);
  appendIfNotNull("entornosUrbanos", data.entornosUrbanos);
  appendIfNotNull("cumplenDistanciasEdificios", data.cumplenDistanciasEdificios);
  appendIfNotNull("comunicacionMinisterioInterior", data.comunicacionMinisterioInterior);
  appendIfNotNull("zonaResVueloFotografico", data.zonaResVueloFotografico);
  appendIfNotNull("permisoCecaf", data.permisoCecaf);
  appendIfNotNull("zonasProtMedioambiental", data.zonasProtMedioambiental);
  appendIfNotNull("disponeCoordGestor", data.disponeCoordGestor);
  appendIfNotNull("conopsYModeloSemantico", data.conopsYModeloSemantico);
  appendIfNotNull("aplicaModelo", data.aplicaModelo);
  appendIfNotNull("defineGeografiaVueloConops", data.defineGeografiaVueloConops);
  appendIfNotNull("defineVolContigencia", data.defineVolContigencia);
  appendIfNotNull("defineMargenRiesgoTierra", data.defineMargenRiesgoTierra);
  appendIfNotNull("defineZonaTerrestreControlada", data.defineZonaTerrestreControlada);
  appendIfNotNull("planificaUbicacionObservadores", data.planificaUbicacionObservadores);
  appendIfNotNull("calculaAreaYEvaluaRiesgo", data.calculaAreaYEvaluaRiesgo);
  appendIfNotNull("notams", data.notams);
  appendIfNotNull("revisaNotams", data.revisaNotams);
  appendIfNotNull("tsaOCondicionada", data.tsaOCondicionada);

  const response = await apiFetch(`/api/operations/${operationId}/anexo4`, {
    method: "POST",
    body: formData,
  });

  if (!response) {
    return null;
  }
  return true;
}
