import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { pdf } from "@react-pdf/renderer";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../../commons/ConfirmModal";
import ButtonProp from "../../commons/props/ButtonProp";
import { useAuth } from "../../commons/hooks/useAuth";
import checkIcon from '../../../assets/commons/check_white.svg';
import cancelIcon from '../../../assets/commons/cancel_white.svg';
import downloadIcon from '../../../assets/commons/download.svg';
import {
  cancelOperation,
  completeOperation,
  fetchAircraftOptions,
  fetchOperationDetail,
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
} from "../../operations/operation.api";
import type { AircraftOption } from "../../operations/operation.api";
import type { OperationDetailDTO } from "../../operations/operation.types";
import {
  formatDateTime,
  getAnexoColorStyle,
  getAnexoLabel,
  getOperationStatusStyle,
  OPERATION_ANEXOS,
} from "../../operations/operation.utils";
import { styles } from "../../../global-const/styles";
import arroBackIcon from '../../../assets/commons/arrow_back_white.svg';
import { OperationDetailPdf } from "../../pdf/OperationDetailPdf";
import { FormOperationAnexo4DetailPdf } from "../../pdf/FormOperationAnexo4DetailPdf";
import { FormOperationAnexo5DetailPdf } from "../../pdf/FormOperationAnexo5DetailPdf";
import { FormOperationAnexo6DetailPdf } from "../../pdf/FormOperationAnexo6DetailPdf";
import { FormOperationAnexo7DetailPdf } from "../../pdf/FormOperationAnexo7DetailPdf";
import { FormOperationAnexo8DetailPdf } from "../../pdf/FormOperationAnexo8DetailPdf";

function Badge({ label, style }: { label: string; style: CSSProperties }) {
  return (
    <span
      className="badge"
      style={{
        ...style,
        border: "1px solid currentColor",
        padding: "0.45rem 0.6rem",
      }}
    >
      {label}
    </span>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="col-md-6 col-12 mb-3">
      <div className="rounded h-100" style={{ border: "1px solid #D1D5DB", padding: "12px 16px" }}>
        <small className="text-muted d-block mb-1">{label}</small>
        <span className="fw-bold">{value}</span>
      </div>
    </div>
  );
}

export default function OperationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [operation, setOperation] = useState<OperationDetailDTO | null>(null);
  const [aircraftOptions, setAircraftOptions] = useState<AircraftOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const canCancelByRole = hasRole("ADMIN") || hasRole("MANAGER");

  const [isPdfMenuOpen, setIsPdfMenuOpen] = useState(false);
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const pdfMenuRef = useRef<HTMLDivElement | null>(null);

  const [isSticky, setIsSticky] = useState(false);

  const loadOperation = async () => {
    if (!id) {
      setError("No se ha indicado la operación.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchOperationDetail(id);

      if (!data) {
        return;
      }

      setOperation(data);
    } catch (err) {
      console.error("Error cargando operación:", err);
      setError("No se pudo cargar el detalle de la operación.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOperation();
  }, [id]);

  useEffect(() => {
    const loadAircraftOptions = async () => {
      try {
        const options = await fetchAircraftOptions();
        setAircraftOptions(options);
      } catch (err) {
        console.error("Error cargando aeronaves:", err);
      }
    };

    void loadAircraftOptions();
  }, []);

  // Cambiado: ahora muestra solo "modelo · serial"
  const aircraftLabelById = useMemo(() => {
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
  }, [aircraftOptions]);

  const resumen = useMemo(() => {
    if (!operation) {
      return [];
    }

    return [
      { label: "Creador", value: operation.nombreCreador },
      { label: "Creación", value: formatDateTime(operation.fechaCreacion) },
      { label: "Todos los anexos firmados", value: operation.todosAnexosFirmados ? "Sí" : "No" },
      { label: "Actualización", value: formatDateTime(operation.fechaActualizacion) },
    ];
  }, [operation]);

  const safeCode = useMemo(() => {
    if (!operation) return "operacion";
    return operation.codigo ? operation.codigo.replace(/\s+/g, "_") : "operacion";
  }, [operation]);

  useEffect(() => {
    if (!isPdfMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!pdfMenuRef.current) return;
      if (!pdfMenuRef.current.contains(event.target as Node)) {
        setIsPdfMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPdfMenuOpen]);

  const downloadPdfBlob = async (pdfDocument: JSX.Element, fileName: string) => {
    const blob = await pdf(pdfDocument).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const buildOperationFileName = () => `Operacion_${safeCode}_detalle.pdf`;

  const buildAnexoFileName = (tipoAnexo: number, versionLabel: string, aircraftId?: number | null) => {
    const versionSuffix = versionLabel ? `_${versionLabel}` : "";
    const aircraftSuffix = aircraftId ? `_aircraft_${aircraftId}` : "";
    return `Operacion_${safeCode}_Anexo${tipoAnexo}${versionSuffix}${aircraftSuffix}.pdf`;
  };

  const getLatestVersion = <T extends { numeroVersion: number }>(versions: T[]) =>
    versions.reduce((max, current) => (current.numeroVersion > max.numeroVersion ? current : max), versions[0]);

  const normalizeAircraftIds = (value: unknown): number[] => {
    if (!Array.isArray(value)) return [];
    return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
  };

  const derivePersonnelOptions = (selectedPersonnel?: Array<{ id: number; fullName: string; roles: string[] }>) => {
    if (!Array.isArray(selectedPersonnel)) return [] as Array<{ id: number; firstName: string; lastName: string; roles: string[] }>;
    return selectedPersonnel.map((person) => ({
      id: person.id,
      firstName: person.fullName,
      lastName: "",
      roles: person.roles ?? [],
    }));
  };

  const handleDownloadPdfs = async (mode: "all" | "latest" | "detail") => {
    if (!operation) return;
    setIsPdfDownloading(true);
    setIsPdfMenuOpen(false);

    const generatedAtLabel = new Date().toLocaleString("es-ES");
    try {
      await downloadPdfBlob(
        <OperationDetailPdf operation={operation} generatedAt={generatedAtLabel} />,
        buildOperationFileName(),
      );

      if (mode === "detail") return;

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
      const anexo4PersonnelOptions = derivePersonnelOptions(anexo4Data?.selectedPersonnel);
      const anexo4AircraftIds = normalizeAircraftIds(anexo4Data?.aircraftIds);

      if (mode === "all") {
        for (const version of [...anexo4Versions].sort((a, b) => a.numeroVersion - b.numeroVersion)) {
          const data = await fetchAnexo4VersionData(operation.idOperacion, version.id);
          if (!data) continue;
          await downloadPdfBlob(
            <FormOperationAnexo4DetailPdf
              operationId={operation.idOperacion}
              operationTitle={operation.codigo}
              formValues={data as Record<string, any>}
              aircraftOptions={aircraftOptions}
              personnelOptions={anexo4PersonnelOptions}
              generatedAt={generatedAtLabel}
            />,
            buildAnexoFileName(4, `v${version.numeroVersion}`),
          );
        }

        if (anexo4Data && (!anexo4Data.id || !anexo4VersionIds.has(anexo4Data.id))) {
          await downloadPdfBlob(
            <FormOperationAnexo4DetailPdf
              operationId={operation.idOperacion}
              operationTitle={operation.codigo}
              formValues={anexo4Data as Record<string, any>}
              aircraftOptions={aircraftOptions}
              personnelOptions={anexo4PersonnelOptions}
              generatedAt={generatedAtLabel}
            />,
            buildAnexoFileName(4, "borrador"),
          );
        }
      }

      if (mode === "latest") {
        if (anexo4Versions.length > 0) {
          const latest = getLatestVersion(anexo4Versions);
          const data = await fetchAnexo4VersionData(operation.idOperacion, latest.id);
          if (data) {
            await downloadPdfBlob(
              <FormOperationAnexo4DetailPdf
                operationId={operation.idOperacion}
                operationTitle={operation.codigo}
                formValues={data as Record<string, any>}
                aircraftOptions={aircraftOptions}
                personnelOptions={anexo4PersonnelOptions}
                generatedAt={generatedAtLabel}
              />,
              buildAnexoFileName(4, `v${latest.numeroVersion}`),
            );
          }
        } else if (anexo4Data) {
          await downloadPdfBlob(
            <FormOperationAnexo4DetailPdf
              operationId={operation.idOperacion}
              operationTitle={operation.codigo}
              formValues={anexo4Data as Record<string, any>}
              aircraftOptions={aircraftOptions}
              personnelOptions={anexo4PersonnelOptions}
              generatedAt={generatedAtLabel}
            />,
            buildAnexoFileName(4, "borrador"),
          );
        }
      }

      const handleAnexoSimple = async (
        tipoAnexo: 5 | 8,
        versions: typeof anexo5Versions,
        versionIds: Set<number>,
        fetchCurrent: () => Promise<any>,
        fetchVersion: (versionId: number) => Promise<any>,
        render: (data: Record<string, any>) => JSX.Element,
      ) => {
        if (mode === "all") {
          for (const version of [...versions].sort((a, b) => a.numeroVersion - b.numeroVersion)) {
            const data = await fetchVersion(version.id);
            if (!data) continue;
            await downloadPdfBlob(render(data), buildAnexoFileName(tipoAnexo, `v${version.numeroVersion}`));
          }

          const currentData = await fetchCurrent();
          if (currentData && (!currentData.id || !versionIds.has(currentData.id))) {
            await downloadPdfBlob(render(currentData), buildAnexoFileName(tipoAnexo, "borrador"));
          }
        }

        if (mode === "latest") {
          if (versions.length > 0) {
            const latest = getLatestVersion(versions);
            const data = await fetchVersion(latest.id);
            if (data) {
              await downloadPdfBlob(render(data), buildAnexoFileName(tipoAnexo, `v${latest.numeroVersion}`));
            }
          } else {
            const currentData = await fetchCurrent();
            if (currentData) {
              await downloadPdfBlob(render(currentData), buildAnexoFileName(tipoAnexo, "borrador"));
            }
          }
        }
      };

      await handleAnexoSimple(
        5,
        anexo5Versions,
        anexo5VersionIds,
        () => fetchAnexo5Data(operation.idOperacion),
        (versionId) => fetchAnexo5VersionData(operation.idOperacion, versionId),
        (data) => (
          <FormOperationAnexo5DetailPdf
            operationId={operation.idOperacion}
            operationTitle={operation.codigo}
            formValues={data}
            generatedAt={generatedAtLabel}
          />
        ),
      );

      await handleAnexoSimple(
        8,
        anexo8Versions,
        anexo8VersionIds,
        () => fetchAnexo8Data(operation.idOperacion),
        (versionId) => fetchAnexo8VersionData(operation.idOperacion, versionId),
        (data) => (
          <FormOperationAnexo8DetailPdf
            operationId={operation.idOperacion}
            operationTitle={operation.codigo}
            formValues={data}
            generatedAt={generatedAtLabel}
          />
        ),
      );

      const downloadAnexoPerAircraft = async (
        tipoAnexo: 6 | 7,
        versions: typeof anexo6Versions,
        versionIds: Set<number>,
        fetchCurrent: (aircraftId: number) => Promise<any>,
        fetchVersion: (versionId: number) => Promise<any>,
        render: (data: Record<string, any>, aircraftId: number | null) => JSX.Element,
      ) => {
        const aircraftIdsFromVersions = Array.from(
          new Set(versions.map((version) => version.aircraftId).filter((id): id is number => id != null))
        );
        const aircraftIds = Array.from(new Set([...aircraftIdsFromVersions, ...anexo4AircraftIds]));

        if (mode === "all") {
          for (const version of [...versions].sort((a, b) => a.numeroVersion - b.numeroVersion)) {
            const data = await fetchVersion(version.id);
            if (!data) continue;
            await downloadPdfBlob(
              render(data, version.aircraftId ?? null),
              buildAnexoFileName(tipoAnexo, `v${version.numeroVersion}`, version.aircraftId ?? undefined),
            );
          }

          for (const aircraftId of aircraftIds) {
            const data = await fetchCurrent(aircraftId);
            if (!data || (data.id && versionIds.has(data.id))) continue;
            await downloadPdfBlob(
              render(data, aircraftId),
              buildAnexoFileName(tipoAnexo, "borrador", aircraftId),
            );
          }
        }

        if (mode === "latest") {
          if (aircraftIds.length === 0 && versions.length > 0) {
            const latest = getLatestVersion(versions);
            const data = await fetchVersion(latest.id);
            if (data) {
              await downloadPdfBlob(
                render(data, latest.aircraftId ?? null),
                buildAnexoFileName(tipoAnexo, `v${latest.numeroVersion}`, latest.aircraftId ?? undefined),
              );
            }
            return;
          }
          for (const aircraftId of aircraftIds) {
            const versionsForAircraft = versions.filter((version) => version.aircraftId === aircraftId);
            if (versionsForAircraft.length > 0) {
              const latest = getLatestVersion(versionsForAircraft);
              const data = await fetchVersion(latest.id);
              if (!data) continue;
              await downloadPdfBlob(
                render(data, aircraftId),
                buildAnexoFileName(tipoAnexo, `v${latest.numeroVersion}`, aircraftId),
              );
            } else {
              const data = await fetchCurrent(aircraftId);
              if (!data) continue;
              await downloadPdfBlob(
                render(data, aircraftId),
                buildAnexoFileName(tipoAnexo, "borrador", aircraftId),
              );
            }
          }
        }
      };

      await downloadAnexoPerAircraft(
        6,
        anexo6Versions,
        anexo6VersionIds,
        (aircraftId) => fetchAnexo6Data(operation.idOperacion, aircraftId),
        (versionId) => fetchAnexo6VersionData(operation.idOperacion, versionId),
        (data, aircraftId) => (
          <FormOperationAnexo6DetailPdf
            operationId={operation.idOperacion}
            operationTitle={operation.codigo}
            formValues={data}
            aircraftLabel={aircraftId ? aircraftLabelById.get(aircraftId) ?? `Aeronave ${aircraftId}` : ""}
            generatedAt={generatedAtLabel}
          />
        ),
      );

      await downloadAnexoPerAircraft(
        7,
        anexo7Versions,
        anexo7VersionIds,
        (aircraftId) => fetchAnexo7Data(operation.idOperacion, aircraftId),
        (versionId) => fetchAnexo7VersionData(operation.idOperacion, versionId),
        (data, aircraftId) => (
          <FormOperationAnexo7DetailPdf
            operationId={operation.idOperacion}
            operationTitle={operation.codigo}
            formValues={data}
            aircraftLabel={aircraftId ? aircraftLabelById.get(aircraftId) ?? `Aeronave ${aircraftId}` : ""}
            generatedAt={generatedAtLabel}
          />
        ),
      );
    } catch (err) {
      console.error("Error descargando PDFs:", err);
      alert("No se pudieron generar los PDFs.");
    } finally {
      setIsPdfDownloading(false);
    }
  };

  const handleComplete = async () => {
    if (!operation) {
      return;
    }

    try {
      setCompleting(true);
      await completeOperation(operation.idOperacion);
      setShowCompleteConfirm(false);
      await loadOperation();
    } catch (err) {
      console.error("Error completando operación:", err);
      alert("No se pudo completar la operación.");
    } finally {
      setCompleting(false);
    }
  };

  const handleCancelOperation = async () => {
    if (!operation) {
      return;
    }

    try {
      setCancelling(true);
      const cancelled = await cancelOperation(operation.idOperacion);
      if (!cancelled) {
        alert("No se pudo cancelar la operación.");
        return;
      }
      setShowCancelConfirm(false);
      await loadOperation();
    } catch (err) {
      console.error("Error cancelando operación:", err);
      alert("No se pudo cancelar la operación.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="container py-4 text-center">Cargando operación...</div>;
  }

  if (error || !operation) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error ?? "Operación no encontrada."}
        </div>
        <ButtonProp onClick={() => navigate(-1)}>Volver</ButtonProp>
      </div>
    );
  }

  return (
    <div className="container py-2" style={{ maxWidth: '1100px' }}>
      {/* --- STICKY HEADER --- */}
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 3,
          // backgroundColor: isSticky ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          margin: isSticky ? '0 -20px 1rem -20px' : '0 -20px 2rem -20px',
          padding: isSticky ? '0.6rem 20px' : '1.25rem 20px',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: isSticky ? '0 10px 15px -3px rgba(0, 0, 0, 0.07)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            {/* Back Button */}
            <button 
              className="btn d-flex align-items-center justify-content-center me-2 flex-shrink-0" 
              onClick={() => navigate(`/operations`)}
              style={{
                ...styles.backBtn,
                transform: isSticky ? 'scale(0.9)' : 'scale(1)',
                transition: 'transform 0.2s'
              }}
            >
              <img src={arroBackIcon} alt="Back" style={styles.backIcon} />
            </button>

            {/* Title and Badges */}
            <div>
              <h4 
                className="fw-bold mb-0 text-dark"
                style={{ 
                  fontSize: isSticky ? '1.1rem' : '1.5rem',
                  transition: 'font-size 0.2s' 
                }}
              >
                {operation.codigo}
              </h4>
              {!isSticky && (
                <div className="d-flex gap-2 mt-2">
                  <Badge
                    label={
                      operation.todosAnexosFirmados &&
                      !operation.completada &&
                      operation.estadoOperacion !== "CANCELADA"
                        ? "CIERRE PENDIENTE"
                        : operation.estadoOperacion
                    }
                    style={
                      operation.todosAnexosFirmados &&
                      !operation.completada &&
                      operation.estadoOperacion !== "CANCELADA"
                        ? getOperationStatusStyle("PENDIENTE")
                        : getOperationStatusStyle(operation.estadoOperacion)
                    }
                  />
                  <Badge
                    label={operation.completada ? "Completada" : "En edición"}
                    style={operation.completada ? getAnexoColorStyle("VERDE") : getAnexoColorStyle("AMARILLO")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <div className="position-relative" ref={pdfMenuRef}>
              <button
                type="button"
                className="btn btn-sm px-3 px-md-3 py-2 d-inline-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: "#111827",
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  textDecoration: "none",
                  transform: isSticky ? 'scale(0.9)' : 'scale(1)'
                }}
                onClick={() => setIsPdfMenuOpen((prev) => !prev)}
                disabled={isPdfDownloading}
                aria-haspopup="menu"
                aria-expanded={isPdfMenuOpen}
              >
                <img src={downloadIcon} alt="" aria-hidden="true" className="d-inline d-md-none" style={{ width: 16, height: 16 }} />
                <span className="d-none d-md-inline">
                  {isPdfDownloading ? "Generando..." : "Descargar PDFs"}
                </span>
              </button>

              {isPdfMenuOpen && !isPdfDownloading && (
                <div
                  role="menu"
                  className="dropdown-menu show p-2"
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: 8,
                    minWidth: 300,
                    borderRadius: 8,
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.15)",
                  }}
                >
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => void handleDownloadPdfs("all")}
                  >
                    Descargar todos los PDFs
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => void handleDownloadPdfs("latest")}
                  >
                    Descargar operacion + última version de anexos
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => void handleDownloadPdfs("detail")}
                  >
                    Descargar solo operacion
                  </button>
                </div>
              )}
            </div>
            {operation.estadoOperacion !== "CANCELADA" && canCancelByRole && (
              <ButtonProp
                className="btn btn-sm px-3 px-md-3 py-2 d-inline-flex align-items-center justify-content-center gap-2"
                style={{ 
                  backgroundColor: "#B91C1C", 
                  color: "#FFFFFF", 
                  fontWeight: "bold",
                  transform: isSticky ? 'scale(0.9)' : 'scale(1)'
                }}
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
              >
                {cancelling ? (
                  <span>...</span>
                ) : (
                  <>
                    <img src={cancelIcon} alt="" aria-hidden="true" className="d-inline d-md-none" style={{ width: 16, height: 16 }} />
                    <span className="d-none d-md-inline">Cancelar</span>
                  </>
                )}
              </ButtonProp>
            )}
            <ButtonProp
              className="btn btn-sm px-3 px-md-3 py-2 d-inline-flex align-items-center justify-content-center gap-2"
              style={{ 
                backgroundColor: "#166534", 
                color: "#FFFFFF", 
                fontWeight: "bold",
                transform: isSticky ? 'scale(0.9)' : 'scale(1)'
              }}
              onClick={() => setShowCompleteConfirm(true)}
              disabled={
                operation.completada ||
                !operation.todosAnexosFirmados ||
                completing ||
                operation.estadoOperacion === "CANCELADA" ||
                !operation.puedeEditarUsuarioActual
              }
            >
              {completing ? (
                <span>...</span>
              ) : (
                <>
                  <img src={checkIcon} alt="" aria-hidden="true" className="d-inline d-md-none" style={{ width: 16, height: 16 }} />
                  <span className="d-none d-md-inline">{isSticky ? "Completar" : "Completar operación"}</span>
                </>
              )}
            </ButtonProp>
          </div>
        </div>
      </div>

      <div 
        className="card border-0 shadow-sm mb-4" 
        style={{ borderRadius: '12px', overflow: 'hidden' }}
      >        
        <div className="card-body p-4">
          <div className="row g-4">
            {resumen.map((item, index) => (
              <div key={item.label} className="col-md-6 col-lg-3">
                <div className="p-3 rounded-3 bg-light h-100 border border-white" style={{ transition: 'transform 0.2s' }}>
                  <label className="text-uppercase text-muted fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                    {item.label}
                  </label>
                  <div className="h6 fw-bold text-dark mb-0" style={{ wordBreak: 'break-word' }}>
                    {item.value || <span className="text-muted fw-normal">No definido</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {operation.todosAnexosFirmados && !operation.completada && operation.estadoOperacion !== "CANCELADA" && (
        <div className="alert alert-warning">
          Todos los anexos están firmados. Ya puedes completar la operación.
        </div>
      )}

      <div className="row g-4">
        {OPERATION_ANEXOS.map((tipoAnexo) => {
          const anexo = operation.anexos.find((item) => item.tipoAnexo === tipoAnexo);

          if (!anexo) {
            return null;
          }

          return (
            <div key={tipoAnexo} className="col-12">
              <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                    <div>
                      <h4 className="mb-1">{getAnexoLabel(tipoAnexo)}</h4>
                      <div className="d-flex gap-2 flex-wrap">
                        <Badge
                          label={anexo.actual.numeroVersion > 0 ? `v${anexo.actual.numeroVersion}` : "Sin versión"}
                          style={getAnexoColorStyle(anexo.actual.color)}
                        />
                        <Badge
                          label={anexo.actual.estado ?? "SIN DATOS"}
                          style={getAnexoColorStyle(anexo.actual.color)}
                        />
                      </div>
                    </div>

                        <ButtonProp style={{ backgroundColor: "rgb(254, 243, 199)", color: "rgb(146, 64, 14)", border: "1px solid", padding: "0.45rem 0.6rem" }} onClick={() => navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`)}>
                      Ver borrador
                    </ButtonProp>
                  </div>

                  {anexo.versiones.length === 0 ? (
                    <p className="text-muted mb-0">Aún no hay versiones registradas.</p>
                  ) : (
                    <div className="table-responsive" style={anexo.versiones.length > 8 ? { maxHeight: "300px", overflowY: "auto" } : undefined}>
                      <table className="table table-sm align-middle mb-0">
                        <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                          <tr>
                            <th>Versión</th>
                            <th>Estado</th>
                            {(tipoAnexo === 6 || tipoAnexo === 7) && <th>Aeronave</th>}
                            <th>Firmado por</th>
                            <th>Fecha firma</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {anexo.versiones.map((version) => (
                            <tr key={version.id}>
                              <td>{`v${version.numeroVersion}`}</td>
                              <td>
                                <Badge label={version.estado} style={getAnexoColorStyle(version.color)} />
                              </td>
                              {(tipoAnexo === 6 || tipoAnexo === 7) && (
                                <td>
                                  {version.aircraftId
                                    ? (aircraftLabelById.get(version.aircraftId) ?? `Aeronave ${version.aircraftId}`)
                                    : "-"}
                                </td>
                              )}
                              <td>{version.firmadoPor ?? "-"}</td>
                              <td>{formatDateTime(version.fechaFirma)}</td>
                              <td>
                                {version.estado === "FIRMADO" ? (
                                  <ButtonProp
                                  onClick={() =>
                                    navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}/version/${version.id}`)
                                  }
                                >
                                  Ver versión
                                  </ButtonProp>
                                ) : (
                                  <span className="text-muted">No disponible</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        show={showCompleteConfirm}
        title="Completar operación"
        message="La operación pasará a estado completada. Asegúrate de que todos los anexos estén revisados y firmados."
        onConfirm={() => void handleComplete()}
        onCancel={() => setShowCompleteConfirm(false)}
        variant="primary"
      />
      <ConfirmModal
        show={showCancelConfirm}
        title="Cancelar operación"
        message="La operación pasará a estado cancelada y quedarán en modo solo lectura."
        onConfirm={() => void handleCancelOperation()}
        onCancel={() => setShowCancelConfirm(false)}
        variant="danger"
      />
    </div>
  );
}
