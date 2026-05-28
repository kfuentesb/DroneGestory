import type {
  Anexo4Data,
  Anexo5Data,
  Anexo6Data,
  Anexo7Data,
  Anexo8Data,
  AircraftOption,
} from "../operations/operation.api";
import {
  fetchAnexo4Data,
  fetchAnexo4VersionData,
  fetchAnexo5Data,
  fetchAnexo5VersionData,
  fetchAnexo6Data,
  fetchAnexo6VersionData,
  fetchAnexo7Data,
  fetchAnexo7VersionData,
  fetchAnexo8Data,
  fetchAnexo8VersionData,
} from "../operations/operation.api";
import type { AnexoHistoricoDTO, OperationDetailDTO } from "../operations/operation.types";
import type { SelectableUserOption } from "./FormOperationAnexo4DetailPdf";

export type OperationMasterPdfMode = "full" | "latest";

type ExternalPersonnelSignature = {
  nombreApellidos: string;
  rol: string;
  signed?: boolean;
};

export type AnexoVersionData<TData> = {
  tipoAnexo: 4 | 5 | 6 | 7 | 8;
  label: string;
  versionId?: number | null;
  numeroVersion?: number;
  aircraftId?: number | null;
  aircraftLabel?: string;
  data: TData;
};

export type OperationMasterPdfData = {
  operation: OperationDetailDTO;
  generatedAt: string;
  aircraftOptions: AircraftOption[];
  personnelOptions: SelectableUserOption[];
  anexos: {
    4: AnexoVersionData<Anexo4Data>[];
    5: AnexoVersionData<Anexo5Data>[];
    6: AnexoVersionData<Anexo6Data>[];
    7: AnexoVersionData<Anexo7Data>[];
    8: AnexoVersionData<Anexo8Data>[];
  };
};

export type BuildVersionDataOptions = {
  operation: OperationDetailDTO;
  aircraftOptions: AircraftOption[];
  mode: OperationMasterPdfMode;
  generatedAt?: string;
};

const getLatestVersion = <T extends { numeroVersion: number }>(versions: T[]) =>
  versions.reduce((max, current) => (current.numeroVersion > max.numeroVersion ? current : max), versions[0]);

const normalizeAircraftIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
};

const normalizeExternalPersonnel = (value: unknown): ExternalPersonnelSignature[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const raw = item as Record<string, unknown>;
      const nombreApellidos = typeof raw.nombreApellidos === "string" ? raw.nombreApellidos.trim() : "";
      const rol = typeof raw.rol === "string" ? raw.rol.trim() : "";

      if (!nombreApellidos && !rol) {
        return null;
      }

      return { nombreApellidos, rol, signed: false };
    })
    .filter((item): item is ExternalPersonnelSignature => item !== null);
};

const derivePersonnelOptions = (
  selectedPersonnel?: Array<{ id: number; fullName: string; roles: string[] }>,
): SelectableUserOption[] => {
  if (!Array.isArray(selectedPersonnel)) return [];
  return selectedPersonnel.map((person) => ({
    id: person.id,
    firstName: person.fullName,
    lastName: "",
    roles: person.roles ?? [],
  }));
};

const buildAircraftLabelById = (aircraftOptions: AircraftOption[]) => {
  const map = new Map<number, string>();
  aircraftOptions.forEach((aircraft) => {
    const base = (aircraft.model ?? "").trim();
    const serial = aircraft.serialNumber ?? "";
    const label =
      base && serial ? `${base} · ${serial}`
      : base ? base
      : serial ? serial
      : `Aeronave ${aircraft.id}`;
    map.set(aircraft.id, label);
  });
  return map;
};

const buildSimpleEntries = async <TData extends { id?: number; numeroVersion?: number }>(
  tipoAnexo: 5 | 8,
  versions: AnexoHistoricoDTO[],
  versionIds: Set<number>,
  fetchCurrent: () => Promise<TData | null>,
  fetchVersion: (versionId: number) => Promise<TData | null>,
  mode: OperationMasterPdfMode,
  entries: AnexoVersionData<TData>[],
) => {
  if (mode === "full") {
    for (const version of [...versions].sort((a, b) => a.numeroVersion - b.numeroVersion)) {
      const data = await fetchVersion(version.id);
      if (!data) continue;
      entries.push({
        tipoAnexo,
        label: `v${version.numeroVersion}`,
        versionId: version.id,
        numeroVersion: version.numeroVersion,
        data,
      });
    }

    const currentData = await fetchCurrent();
    if (currentData && (!currentData.id || !versionIds.has(currentData.id))) {
      entries.push({
        tipoAnexo,
        label: "borrador",
        versionId: currentData.id ?? null,
        numeroVersion: currentData.numeroVersion,
        data: currentData,
      });
    }
  }

  if (mode === "latest") {
    if (versions.length > 0) {
      const latest = getLatestVersion(versions);
      const data = await fetchVersion(latest.id);
      if (data) {
        entries.push({
          tipoAnexo,
          label: `v${latest.numeroVersion}`,
          versionId: latest.id,
          numeroVersion: latest.numeroVersion,
          data,
        });
      }
    } else {
      const currentData = await fetchCurrent();
      if (currentData) {
        entries.push({
          tipoAnexo,
          label: "borrador",
          versionId: currentData.id ?? null,
          numeroVersion: currentData.numeroVersion,
          data: currentData,
        });
      }
    }
  }
};

export async function buildVersionData({
  operation,
  aircraftOptions,
  mode,
  generatedAt = new Date().toLocaleString("es-ES"),
}: BuildVersionDataOptions): Promise<OperationMasterPdfData> {
  const anexosData: OperationMasterPdfData["anexos"] = { 4: [], 5: [], 6: [], 7: [], 8: [] };
  const aircraftLabelById = buildAircraftLabelById(aircraftOptions);

  const anexo4Info = operation.anexos.find((anexo) => anexo.tipoAnexo === 4);
  const anexo5Info = operation.anexos.find((anexo) => anexo.tipoAnexo === 5);
  const anexo6Info = operation.anexos.find((anexo) => anexo.tipoAnexo === 6);
  const anexo7Info = operation.anexos.find((anexo) => anexo.tipoAnexo === 7);
  const anexo8Info = operation.anexos.find((anexo) => anexo.tipoAnexo === 8);

  const anexo4Versions = anexo4Info?.versiones ?? [];
  const anexo5Versions = anexo5Info?.versiones ?? [];
  const anexo6Versions = anexo6Info?.versiones ?? [];
  const anexo7Versions = anexo7Info?.versiones ?? [];
  const anexo8Versions = anexo8Info?.versiones ?? [];

  const anexo4VersionIds = new Set(anexo4Versions.map((version) => version.id));
  const anexo5VersionIds = new Set(anexo5Versions.map((version) => version.id));
  const anexo6VersionIds = new Set(anexo6Versions.map((version) => version.id));
  const anexo7VersionIds = new Set(anexo7Versions.map((version) => version.id));
  const anexo8VersionIds = new Set(anexo8Versions.map((version) => version.id));

  const anexo4Data = await fetchAnexo4Data(operation.idOperacion);
  const personnelOptions = derivePersonnelOptions(anexo4Data?.selectedPersonnel);
  const anexo4AircraftIds = normalizeAircraftIds(anexo4Data?.aircraftIds);
  const externalPersonnel = normalizeExternalPersonnel(anexo4Data?.personalExterno);

  if (mode === "full") {
    for (const version of [...anexo4Versions].sort((a, b) => a.numeroVersion - b.numeroVersion)) {
      const data = await fetchAnexo4VersionData(operation.idOperacion, version.id);
      if (!data) continue;
      anexosData[4].push({
        tipoAnexo: 4,
        label: `v${version.numeroVersion}`,
        versionId: version.id,
        numeroVersion: version.numeroVersion,
        data,
      });
    }

    if (anexo4Data && (!anexo4Data.id || !anexo4VersionIds.has(anexo4Data.id))) {
      anexosData[4].push({
        tipoAnexo: 4,
        label: "borrador",
        versionId: anexo4Data.id ?? null,
        numeroVersion: anexo4Data.numeroVersion,
        data: anexo4Data,
      });
    }
  }

  if (mode === "latest") {
    if (anexo4Versions.length > 0) {
      const latest = getLatestVersion(anexo4Versions);
      const data = await fetchAnexo4VersionData(operation.idOperacion, latest.id);
      if (data) {
        anexosData[4].push({
          tipoAnexo: 4,
          label: `v${latest.numeroVersion}`,
          versionId: latest.id,
          numeroVersion: latest.numeroVersion,
          data,
        });
      }
    } else if (anexo4Data) {
      anexosData[4].push({
        tipoAnexo: 4,
        label: "borrador",
        versionId: anexo4Data.id ?? null,
        numeroVersion: anexo4Data.numeroVersion,
        data: anexo4Data,
      });
    }
  }

  await buildSimpleEntries(
    5,
    anexo5Versions,
    anexo5VersionIds,
    () => fetchAnexo5Data(operation.idOperacion),
    (versionId) => fetchAnexo5VersionData(operation.idOperacion, versionId),
    mode,
    anexosData[5],
  );

  if (externalPersonnel.length > 0) {
    anexosData[5] = anexosData[5].map((entry) => ({
      ...entry,
      data: {
        ...(entry.data as Anexo5Data),
        externalPersonnel,
      },
    }));
  }

  await buildSimpleEntries(
    8,
    anexo8Versions,
    anexo8VersionIds,
    () => fetchAnexo8Data(operation.idOperacion),
    (versionId) => fetchAnexo8VersionData(operation.idOperacion, versionId),
    mode,
    anexosData[8],
  );

  const buildEntriesPerAircraft = async <TData extends { id?: number; numeroVersion?: number }>(
    tipoAnexo: 6 | 7,
    versions: AnexoHistoricoDTO[],
    versionIds: Set<number>,
    fetchCurrent: (aircraftId: number) => Promise<TData | null>,
    fetchVersion: (versionId: number) => Promise<TData | null>,
    entries: AnexoVersionData<TData>[],
  ) => {
    const aircraftIdsFromVersions = Array.from(
      new Set(versions.map((version) => version.aircraftId).filter((id): id is number => id != null)),
    );
    const aircraftIds = Array.from(new Set([...aircraftIdsFromVersions, ...anexo4AircraftIds]));

    if (mode === "full") {
      for (const version of [...versions].sort((a, b) => a.numeroVersion - b.numeroVersion)) {
        const data = await fetchVersion(version.id);
        if (!data) continue;
        entries.push({
          tipoAnexo,
          label: `v${version.numeroVersion}`,
          versionId: version.id,
          numeroVersion: version.numeroVersion,
          aircraftId: version.aircraftId ?? null,
          aircraftLabel: version.aircraftId ? aircraftLabelById.get(version.aircraftId) ?? `Aeronave ${version.aircraftId}` : undefined,
          data,
        });
      }

      for (const aircraftId of aircraftIds) {
        const data = await fetchCurrent(aircraftId);
        if (!data || (data.id && versionIds.has(data.id))) continue;
        entries.push({
          tipoAnexo,
          label: "borrador",
          versionId: data.id ?? null,
          numeroVersion: data.numeroVersion,
          aircraftId,
          aircraftLabel: aircraftLabelById.get(aircraftId) ?? `Aeronave ${aircraftId}`,
          data,
        });
      }
    }

    if (mode === "latest") {
      if (aircraftIds.length === 0 && versions.length > 0) {
        const latest = getLatestVersion(versions);
        const data = await fetchVersion(latest.id);
        if (data) {
          entries.push({
            tipoAnexo,
            label: `v${latest.numeroVersion}`,
            versionId: latest.id,
            numeroVersion: latest.numeroVersion,
            aircraftId: latest.aircraftId ?? null,
            aircraftLabel: latest.aircraftId ? aircraftLabelById.get(latest.aircraftId) ?? `Aeronave ${latest.aircraftId}` : undefined,
            data,
          });
        }
        return;
      }

      for (const aircraftId of aircraftIds) {
        const versionsForAircraft = versions.filter((version) => version.aircraftId === aircraftId);
        if (versionsForAircraft.length > 0) {
          const latest = getLatestVersion(versionsForAircraft);
          const data = await fetchVersion(latest.id);
          if (!data) continue;
          entries.push({
            tipoAnexo,
            label: `v${latest.numeroVersion}`,
            versionId: latest.id,
            numeroVersion: latest.numeroVersion,
            aircraftId,
            aircraftLabel: aircraftLabelById.get(aircraftId) ?? `Aeronave ${aircraftId}`,
            data,
          });
        } else {
          const data = await fetchCurrent(aircraftId);
          if (!data) continue;
          entries.push({
            tipoAnexo,
            label: "borrador",
            versionId: data.id ?? null,
            numeroVersion: data.numeroVersion,
            aircraftId,
            aircraftLabel: aircraftLabelById.get(aircraftId) ?? `Aeronave ${aircraftId}`,
            data,
          });
        }
      }
    }
  };

  await buildEntriesPerAircraft(
    6,
    anexo6Versions,
    anexo6VersionIds,
    (aircraftId) => fetchAnexo6Data(operation.idOperacion, aircraftId),
    (versionId) => fetchAnexo6VersionData(operation.idOperacion, versionId),
    anexosData[6],
  );

  await buildEntriesPerAircraft(
    7,
    anexo7Versions,
    anexo7VersionIds,
    (aircraftId) => fetchAnexo7Data(operation.idOperacion, aircraftId),
    (versionId) => fetchAnexo7VersionData(operation.idOperacion, versionId),
    anexosData[7],
  );

  return {
    operation,
    generatedAt,
    aircraftOptions,
    personnelOptions,
    anexos: anexosData,
  };
}
