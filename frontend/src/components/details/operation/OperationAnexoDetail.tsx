import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../../commons/ConfirmModal";
import ButtonProp from "../../commons/props/ButtonProp";
import { useAuth } from "../../commons/hooks/useAuth";
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
  fetchAircraftOptions,
  fetchOperationDetail,
  remakeAnexo4Data,
  remakeAnexo5Data,
  remakeAnexo6Data,
  remakeAnexo7Data,
  remakeAnexo8Data,
  signAnexo4Data,
  signAnexo5Data,
  signAnexo6Data,
  signAnexo7Data,
  signAnexo8Data,
  saveAnexo6Data,
  saveAnexo7Data,
  type Anexo4Data,
  type AircraftOption,
  type Anexo5Data,
  type Anexo6Data,
  type Anexo7Data,
  type Anexo8Data,
} from "../../operations/operation.api";
import type {
  AnexoHistoricoDTO,
  OperationDetailDTO,
} from "../../operations/operation.types";
import {
  formatDateTime,
  getAnexoColorStyle,
  getAnexoLabel,
  getOperationStatusStyle,
} from "../../operations/operation.utils";
import FormOperationAnexo4Detail from "../../forms/FormOperationAnexo4Detail";
import FormOperationAnexo5Detail from "../../forms/FormOperationAnexo5Detail";
import FormOperationAnexo6Detail from "../../forms/FormOperationAnexo6Detail";
import FormOperationAnexo7Detail from "../../forms/FormOperationAnexo7Detail";
import FormOperationAnexo8Detail from "../../forms/FormOperationAnexo8Detail";
import StepProgressBar from "../../commons/MultiStepForm/StepProgressBar";

import { styles } from "../../../global-const/styles";
import arroBackIcon from '../../../assets/commons/arrow_back_white.svg';

type OperationAnexoDetailProps = {
  tipoAnexo: 4 | 5 | 6 | 7 | 8;
};

type AnexoData = Anexo4Data | Anexo5Data | Anexo6Data | Anexo7Data | Anexo8Data;

const getAircraftDisplayName = (aircraft: AircraftOption) => {
  const base = (aircraft.model ?? "").trim();
  return aircraft.serialNumber ? `${base} (${aircraft.serialNumber})` : base;
};

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

export default function OperationAnexoDetail({ tipoAnexo }: OperationAnexoDetailProps) {
  const { id, versionId } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  // Barra de pasos superior
  const ANEXOS_STEPS = [
    { label: "Anexo 4", anexo: 4, name: "Anexo 4" },
    { label: "Anexo 5", anexo: 5, name: "Anexo 5" },
    { label: "Anexo 6", anexo: 6, name: "Anexo 6" },
    { label: "Anexo 7", anexo: 7, name: "Anexo 7" },
    { label: "Anexo 8", anexo: 8, name: "Anexo 8" },
  ];

  const currentStep = Math.max(0, ANEXOS_STEPS.findIndex(s => s.anexo === tipoAnexo));

  const [operation, setOperation] = useState<OperationDetailDTO | null>(null);
  const [anexoData, setAnexoData] = useState<AnexoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingVersionData, setLoadingVersionData] = useState(false);
  const [signing, setSigning] = useState(false);
  const [remaking, setRemaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignConfirm, setShowSignConfirm] = useState(false);
  const [showRemakeConfirm, setShowRemakeConfirm] = useState(false);
  const [anexoAircraftOptions, setAnexoAircraftOptions] = useState<AircraftOption[]>([]);
  const [selectedAircraftId, setSelectedAircraftId] = useState<number | null>(null);
  const [aircraftsInVersion, setAircraftsInVersion] = useState<Anexo6Data[] | Anexo7Data[]>([]);
  const [autoSaving, setAutoSaving] = useState(false);

  const [isSticky, setIsSticky] = useState(false);

  const anexo = useMemo(
    () => operation?.anexos.find((item) => item.tipoAnexo === tipoAnexo) ?? null,
    [operation, tipoAnexo],
  );

  const selectedVersionId = useMemo(() => {
    if (!versionId) {
      return null;
    }

    const parsedVersionId = Number(versionId);
    return Number.isNaN(parsedVersionId) ? null : parsedVersionId;
  }, [versionId]);

  const selectedVersion = useMemo<AnexoHistoricoDTO | null>(() => {
    if (!selectedVersionId || !anexo) {
      return null;
    }

    return anexo.versiones.find((version) => version.id === selectedVersionId) ?? null;
  }, [anexo, selectedVersionId]);

  const isViewingHistoricalVersion = selectedVersion !== null;
  const requiresAircraftSelection = tipoAnexo === 6 || tipoAnexo === 7;
  
  const currentAnexoId = requiresAircraftSelection
    ? (anexoData?.id ?? null)
    : (anexoData?.id ?? anexo?.actual.id ?? null);
  const currentAnexoVersion = requiresAircraftSelection
    ? (anexoData?.numeroVersion ?? 0)
    : (anexoData?.numeroVersion ?? anexo?.actual.numeroVersion ?? 0);
  const currentAnexoStatus = requiresAircraftSelection
    ? (anexoData?.estado ?? null)
    : (anexoData?.estado ?? anexo?.actual.estado ?? null);
  const actualIsSigned = currentAnexoStatus === "FIRMADO";
  const isAdmin = hasRole("ADMIN");
  const isManager = hasRole("MANAGER");
  const canManageCompletedOperation = isAdmin;
  const operationIsEditableForUser = Boolean(operation?.puedeEditarUsuarioActual);
  const canCreate = operationIsEditableForUser && (!operation?.completada || canManageCompletedOperation) && operation?.estadoOperacion !== "CANCELADA";
  
  // Para anexos 6 y 7: en borrador se puede editar, en firmado solo lectura
  const canEditDraft = !isViewingHistoricalVersion && canCreate && !actualIsSigned;
  const canRemake = !isViewingHistoricalVersion && canCreate && actualIsSigned;
  const canSign = !isViewingHistoricalVersion && canCreate && actualIsSigned === false && currentAnexoVersion > 0;

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
        setError("No se pudo cargar la operación.");
        return;
      }

      setOperation(data);
    } catch (err) {
      console.error("Error cargando anexo:", err);
      setError("No se pudo cargar el anexo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOperation();
  }, [id, tipoAnexo, versionId]);

  useEffect(() => {
    if (!operation || !requiresAircraftSelection) {
      setAnexoAircraftOptions([]);
      setSelectedAircraftId(null);
      return;
    }

    const loadAircraftFromAnexo4 = async () => {
      try {
        const [anexo4, aircraftOptions] = await Promise.all([
          fetchAnexo4Data(operation.idOperacion),
          fetchAircraftOptions(),
        ]);

        const selectedIds = new Set(anexo4?.aircraftIds ?? []);
        const filtered = aircraftOptions.filter((aircraft) => selectedIds.has(aircraft.id));
        setAnexoAircraftOptions(filtered);
        setSelectedAircraftId((prev) => {
          if (prev && filtered.some((aircraft) => aircraft.id === prev)) {
            return prev;
          }
          return filtered[0]?.id ?? null;
        });
      } catch (err) {
        console.error("Error cargando aeronaves de Anexo 4:", err);
        setAnexoAircraftOptions([]);
        setSelectedAircraftId(null);
      }
    };

    void loadAircraftFromAnexo4();
  }, [operation, requiresAircraftSelection]);

  useEffect(() => {
    if (!requiresAircraftSelection || !selectedVersion) {
      return;
    }

    if (selectedVersion.aircraftId) {
      setSelectedAircraftId(selectedVersion.aircraftId);
    }
  }, [requiresAircraftSelection, selectedVersion]);

  useEffect(() => {
    if (!operation) {
      return;
    }

    const loadSelectedAnexoData = async () => {
      setLoadingVersionData(true);
      try {
        let data: AnexoData | null = null;

        if (selectedVersionId) {
          switch (tipoAnexo) {
            case 4:
              data = await fetchAnexo4VersionData(operation.idOperacion, selectedVersionId);
              break;
            case 5:
              data = await fetchAnexo5VersionData(operation.idOperacion, selectedVersionId);
              break;
            case 6:
              if (!selectedVersion) {
                data = null;
              } else {
                data = await fetchAnexo6VersionData(operation.idOperacion, selectedVersion.id);
              }
              break;
            case 7:
              if (!selectedVersion) {
                data = null;
              } else {
                data = await fetchAnexo7VersionData(operation.idOperacion, selectedVersion.id);
              }
              break;
            case 8:
              data = await fetchAnexo8VersionData(operation.idOperacion, selectedVersionId);
              break;
            default:
              data = null;
          }
        } else {
          switch (tipoAnexo) {
            case 4:
              data = await fetchAnexo4Data(operation.idOperacion);
              break;
            case 5: {
              data = await fetchAnexo5Data(operation.idOperacion);
              if (!data) {
                const anexo4 = await fetchAnexo4Data(operation.idOperacion);
                if (anexo4) {
                  data = {
                    assignedPersonnel: (anexo4.selectedPersonnel ?? []).map((person) => ({
                      id: person.id,
                      username: "",
                      fullName: person.fullName,
                      roles: person.roles,
                      signed: false,
                    })),
                    signedPersonnelIds: [],
                  } as Anexo5Data;
                }
              }
              break;
            }
            case 6:
              data = selectedAircraftId ? await fetchAnexo6Data(operation.idOperacion, selectedAircraftId) : null;
              break;
            case 7:
              data = selectedAircraftId ? await fetchAnexo7Data(operation.idOperacion, selectedAircraftId) : null;
              break;
            case 8:
              data = await fetchAnexo8Data(operation.idOperacion);
              break;
            default:
              data = null;
          }
        }

        setAnexoData(data);
      } catch (err) {
        console.error(`Error cargando datos del Anexo ${tipoAnexo}:`, err);
        setAnexoData(null);
      } finally {
        setLoadingVersionData(false);
      }
    };

    void loadSelectedAnexoData();
  }, [operation, selectedVersion, selectedVersionId, selectedAircraftId, tipoAnexo]);

  const handleSign = async () => {
    if (!operation) {
      return;
    }

    try {
      setSigning(true);
      
      // Para anexos 6 y 7, firmar solo la aeronave seleccionada
      if (tipoAnexo === 6 || tipoAnexo === 7) {
        if (!currentAnexoId) {
          alert("No hay borrador para la aeronave seleccionada.");
          return;
        }

        const signedData = tipoAnexo === 6
          ? await signAnexo6Data(operation.idOperacion, currentAnexoId)
          : await signAnexo7Data(operation.idOperacion, currentAnexoId);

        if (signedData) {
          setAnexoData(signedData);
          setShowSignConfirm(false);
          navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`);
          await loadOperation();
        } else {
          alert(`No se pudo firmar ${getAnexoLabel(tipoAnexo)}.`);
        }
      } else {
        // Para otros anexos, firmar individualmente
        let signedData: AnexoData | null = null;
        switch (tipoAnexo) {
          case 4:
            signedData = await signAnexo4Data(operation.idOperacion, currentAnexoId!);
            break;
          case 5:
            signedData = await signAnexo5Data(operation.idOperacion, currentAnexoId!);
            break;
          case 8:
            signedData = await signAnexo8Data(operation.idOperacion, currentAnexoId!);
            break;
          default:
            signedData = null;
        }
        if (signedData) {
          setAnexoData(signedData);
        }
        setShowSignConfirm(false);
        navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`);
        await loadOperation();
      }
    } catch (err) {
      console.error(`Error firmando ${getAnexoLabel(tipoAnexo)}:`, err);
      alert(`No se pudo firmar ${getAnexoLabel(tipoAnexo)}.`);
    } finally {
      setSigning(false);
    }
  };

  const handleRemake = async () => {
    if (!operation || !currentAnexoId) {
      return;
    }

    try {
      setRemaking(true);
      let remadeData: AnexoData | null = null;
      switch (tipoAnexo) {
        case 4:
          remadeData = await remakeAnexo4Data(operation.idOperacion, currentAnexoId);
          break;
        case 5:
          remadeData = await remakeAnexo5Data(operation.idOperacion, currentAnexoId);
          break;
        case 6:
          remadeData = await remakeAnexo6Data(operation.idOperacion, currentAnexoId);
          break;
        case 7:
          remadeData = await remakeAnexo7Data(operation.idOperacion, currentAnexoId);
          break;
        case 8:
          remadeData = await remakeAnexo8Data(operation.idOperacion, currentAnexoId);
          break;
        default:
          remadeData = null;
      }
      if (remadeData) {
        setAnexoData(remadeData);
      }
      setShowRemakeConfirm(false);
      navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`);
      await loadOperation();
    } catch (err) {
      console.error(`Error rehaciendo ${getAnexoLabel(tipoAnexo)}:`, err);
      alert(`No se pudo rehacer ${getAnexoLabel(tipoAnexo)}.`);
    } finally {
      setRemaking(false);
    }
  };

  const handleSaved = async (savedData: AnexoData | null) => {
    setAnexoData(savedData);
    if (!operation) return null;
    navigate(`/operations/${operation.idOperacion}/anexo${tipoAnexo}`);
    await loadOperation();
  };

  // Función para auto-guardar antes de cambiar de aeronave
  const autoSaveBeforeSwitch = async (): Promise<boolean> => {
    if (!operation || !selectedAircraftId || !canEditDraft) return true;
    if (tipoAnexo !== 6 && tipoAnexo !== 7) return true;

    // Solo auto-guardar si hay datos en el formulario actual
    const currentForm = document.querySelector('form');
    if (!currentForm) return true;

    setAutoSaving(true);
    try {
      const formData = new FormData(currentForm);
      formData.set("aircraftId", String(selectedAircraftId));
      
      if (tipoAnexo === 6) {
        await saveAnexo6Data(operation.idOperacion, formData);
      } else if (tipoAnexo === 7) {
        await saveAnexo7Data(operation.idOperacion, formData);
      }
      return true;
    } catch (err) {
      console.error('Error auto-guardando:', err);
      // Continuar con el cambio de aeronave aunque falle el auto-guardado
      return true;
    } finally {
      setAutoSaving(false);
    }
  };

  const handleAircraftChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAircraftId = e.target.value === "" ? null : Number(e.target.value);
    
    // Auto-guardar antes de cambiar
    if (newAircraftId !== selectedAircraftId) {
      await autoSaveBeforeSwitch();
    }
    
    setSelectedAircraftId(newAircraftId);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return <div className="container py-4 text-center">Cargando anexo...</div>;
  }

  if (error || !operation || !anexo) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          {error ?? "Anexo no encontrado."}
        </div>
        <ButtonProp onClick={() => navigate(-1)}>Volver</ButtonProp>
      </div>
    );
  }

  return (
    <div className="container py-2" style={{ maxWidth: '1100px' }}>
      <div 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1050,
          // DESCOMENTAR ESTO SI NO SE QUIERE EL EFECTO DE BLUR
          // backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          margin: isSticky ? '0 -20px 1rem -20px' : '0 -20px 2rem -20px',
          padding: isSticky ? '0.5rem 20px 0.25rem 20px' : '1.25rem 20px',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: isSticky ? '0 10px 15px -3px rgba(0, 0, 0, 0.07)' : '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <button 
              className="btn d-flex align-items-center justify-content-center me-2 flex-shrink-0" 
              onClick={() => navigate(`/operations/${operation.idOperacion}`)}
              style={{
                ...styles.backBtn,
                transform: isSticky ? 'scale(0.9)' : 'scale(1)',
                transition: 'transform 0.2s'
              }}
            >
              <img src={arroBackIcon} alt="Back" style={styles.backIcon} />
            </button>

            <h4 
              className="fw-bold mb-0 text-dark"
              style={{ 
                fontSize: isSticky ? '1.1rem' : '1.25rem',
                transition: 'font-size 0.2s' 
              }}
            >
              {getAnexoLabel(tipoAnexo)} 
              {!isSticky && (
                <span className="text-muted fw-normal ms-2" style={{ fontSize: '0.9rem' }}>
                  {operation.codigo}
                </span>
              )}
            </h4>
          </div>

          <div className="d-flex gap-2">
            <ButtonProp
              className="btn btn-sm px-3"
              style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', fontWeight: '600' }}
              onClick={() => setShowRemakeConfirm(true)}
              disabled={!canRemake || remaking}
            >
              {remaking ? "Rehaciendo..." : "Rehacer versión"}
            </ButtonProp>
            {tipoAnexo !== 5 && (
              <ButtonProp
                className="btn btn-sm px-4"
                style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '600', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}
                onClick={() => setShowSignConfirm(true)}
                disabled={!canSign || signing}
              >
                {signing ? "Firmando..." : "Firmar Anexo"}
              </ButtonProp>
            )}
          </div>
        </div>

        <div className="mt-3">
          <StepProgressBar
            steps={ANEXOS_STEPS}
            currentStep={currentStep}
            onStepClick={(step) => {
              if (operation) navigate(`/operations/${operation.idOperacion}/anexo${step.anexo}`);
            }}
          />
        </div>
      </div>

      {/* --- STATUS & METADATA SECTION --- */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <span className="text-muted small fw-bold text-uppercase me-2">Estado:</span>
            <Badge label={operation.estadoOperacion} style={getOperationStatusStyle(operation.estadoOperacion)} />
            <Badge label={currentAnexoVersion > 0 ? `v${currentAnexoVersion}` : "Sin versión"} style={getAnexoColorStyle(anexo.actual.color)} />
            <Badge label={currentAnexoStatus ?? "SIN DATOS"} style={getAnexoColorStyle(anexo.actual.color)} />
            {isViewingHistoricalVersion && selectedVersion && (
              <Badge label={`Consultando v${selectedVersion.numeroVersion}`} style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }} />
            )}
          </div>
        </div>
        <div className="col-lg-4 text-lg-end">
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            <div>Creado: <strong>{formatDateTime(operation.fechaCreacion)}</strong></div>
            <div>Actualizado: <strong>{formatDateTime(operation.fechaActualizacion)}</strong></div>
          </div>
        </div>
      </div>

      {/* --- CONTEXTUAL MESSAGES --- */}
      <div className="space-y-2 mb-4">
        {operation.completada && (
          <div className="p-3 mb-2 rounded-3 border-start border-4 border-warning bg-light" style={{ fontSize: '0.9rem' }}>
            <strong>Operación Completada:</strong> {canManageCompletedOperation ? "Tienes permisos de edición administrativa." : "Vista de solo lectura para este anexo."}
          </div>
        )}
        {actualIsSigned && !isViewingHistoricalVersion && (
          <div className="p-3 mb-2 rounded-3 border-start border-4 border-primary bg-light" style={{ fontSize: '0.9rem' }}>
            <strong>Versión Firmada:</strong> Esta versión está bloqueada. Use "Rehacer" para editar.
          </div>
        )}
      </div>

      {operation.completada && !canManageCompletedOperation && (
        <div className="alert alert-warning">
          La operación está completada. Solo un administrador puede modificar
          anexos.
        </div>
      )}

      {operation.asignadoAlUsuarioActual && !isAdmin && !isManager && (
        <div className="alert alert-info">
          Estás asignado a esta operación. Tienes permisos para gestionar sus anexos.
        </div>
      )}

      {!operationIsEditableForUser && (
        <div className="alert alert-secondary">
          Solo puedes consultar este anexo. Para editar, firmar o rehacer debes ser el creador o estar asignado a la operación.
        </div>
      )}

      {operation.completada && canManageCompletedOperation && (
        <div className="alert alert-info">
          La operación está completada, pero tienes permisos de administrador
          para gestionar versiones del anexo.
        </div>
      )}

      {actualIsSigned && !isViewingHistoricalVersion && (
        <div className="alert alert-info">
          La versión actual está firmada. Para editar, crea antes una nueva
          versión con "Rehacer versión".
        </div>
      )}

      {tipoAnexo === 5 && !isViewingHistoricalVersion && !actualIsSigned && (
        <div className="alert alert-info">
          La firma del Anexo 5 se realiza en la Sección 8 por cada usuario asignado en Anexo 4.
        </div>
      )}

      {isViewingHistoricalVersion && selectedVersion && (
        <div className="alert alert-secondary">
          Estás consultando la versión histórica v
          {selectedVersion.numeroVersion}. Esta vista es solo lectura.
        </div>
      )}

      {requiresAircraftSelection && (
        <div className="card shadow-sm mb-4" style={{ border: "1px solid #E5E7EB" }}>
          <div className="card-body">
            <label className="form-label fw-bold small text-uppercase text-muted">
              Aeronave seleccionada desde Anexo 4
            </label>
            {anexoAircraftOptions.length === 0 ? (
              <div className="alert alert-warning mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.952.223 2.085 1.96 2.085h13.71c1.737 0 2.417-1.133 1.96-2.085L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                No hay drones asignados a esta operación. Vuelve al{" "}
                <button
                  className="btn btn-link p-0 m-0 align-baseline text-decoration-underline"
                  onClick={() => navigate(`/operations/${operation.idOperacion}/anexo4`)}
                  style={{ fontSize: "inherit" }}
                >
                  Anexo 4
                </button>{" "}
                para asignar drones desde el formulario.
              </div>
            ) : (
              <select
                className="form-select"
                value={selectedAircraftId ?? ""}
                onChange={(e) => void handleAircraftChange(e)}
                disabled={isViewingHistoricalVersion}
                size={anexoAircraftOptions.length > 8 ? 8 : 1}
                style={anexoAircraftOptions.length > 8 ? { overflowY: "auto" } : undefined}
              >
                {anexoAircraftOptions.map((aircraft) => (
                  <option key={aircraft.id} value={aircraft.id}>
                    {getAircraftDisplayName(aircraft)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      <div
        className="card shadow-sm mb-4"
        style={{ border: "1px solid #E5E7EB" }}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
            <h4 className="mb-0">
              {isViewingHistoricalVersion && selectedVersion
                ? `Detalle versión v${selectedVersion.numeroVersion}`
                : "Detalle versión actual"}
            </h4>
            {isViewingHistoricalVersion && (
              <ButtonProp
                onClick={() => navigate(`/operations/${operation.idOperacion}`)}
              >
                Volver a la operación
              </ButtonProp>
            )}
          </div>

          {loadingVersionData ? (
            <div className="text-center py-4">Cargando versión...</div>
          ) : (
            <>
              {tipoAnexo === 4 && (
                <FormOperationAnexo4Detail
                  key={selectedVersionId ?? anexo.actual.id ?? "current"}
                  operationId={operation.idOperacion}
                  initialValues={(anexoData as Anexo4Data | null) ?? {}}
                  disabled={isViewingHistoricalVersion || !canEditDraft}
                  readOnlyMessage={
                    isViewingHistoricalVersion
                      ? "Estás consultando una versión histórica. Esta vista es solo lectura."
                      : undefined
                  }
                  onSaved={async (savedData) => {
                    await handleSaved(savedData as AnexoData | null);
                  }}
                />
              )}
              {tipoAnexo === 5 && (
                <FormOperationAnexo5Detail
                  key={selectedVersionId ?? anexo.actual.id ?? "current"}
                  operationId={operation.idOperacion}
                  initialValues={anexoData as Anexo5Data | null}
                  disabled={isViewingHistoricalVersion || !canEditDraft}
                  readOnlyMessage={
                    isViewingHistoricalVersion
                      ? "Estás consultando una versión histórica. Esta vista es solo lectura."
                      : undefined
                  }
                  onSaved={async (savedData) => {
                    await handleSaved(savedData as AnexoData | null);
                  }}
                />
              )}
              {tipoAnexo === 6 && (
                <FormOperationAnexo6Detail
                  key={selectedVersionId ?? anexo.actual.id ?? "current"}
                  operationId={operation.idOperacion}
                  initialValues={anexoData as Anexo6Data | null}
                  selectedAircraftId={selectedAircraftId}
                  disabled={isViewingHistoricalVersion || !canEditDraft}
                  readOnlyMessage={
                    isViewingHistoricalVersion
                      ? "Estás consultando una versión histórica. Esta vista es solo lectura."
                      : undefined
                  }
                  onSaved={async (savedData) => {
                    await handleSaved(savedData as AnexoData | null);
                  }}
                />
              )}
              {tipoAnexo === 7 && (
                <FormOperationAnexo7Detail
                  key={selectedVersionId ?? anexo.actual.id ?? "current"}
                  operationId={operation.idOperacion}
                  initialValues={anexoData as Anexo7Data | null}
                  selectedAircraftId={selectedAircraftId}
                  disabled={isViewingHistoricalVersion || !canEditDraft}
                  readOnlyMessage={
                    isViewingHistoricalVersion
                      ? "Estás consultando una versión histórica. Esta vista es solo lectura."
                      : undefined
                  }
                  onSaved={async (savedData) => {
                    await handleSaved(savedData as AnexoData | null);
                  }}
                />
              )}
              {tipoAnexo === 8 && (
                <FormOperationAnexo8Detail
                  key={selectedVersionId ?? anexo.actual.id ?? "current"}
                  operationId={operation.idOperacion}
                  initialValues={anexoData as Anexo8Data | null}
                  disabled={isViewingHistoricalVersion || !canEditDraft}
                  readOnlyMessage={
                    isViewingHistoricalVersion
                      ? "Estás consultando una versión histórica. Esta vista es solo lectura."
                      : undefined
                  }
                  onSaved={async (savedData) => {
                    await handleSaved(savedData as AnexoData | null);
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {tipoAnexo !== 5 && (
        <ConfirmModal
          show={showSignConfirm}
          title={`Firmar ${getAnexoLabel(tipoAnexo)}`}
          message="Se firmará la versión actual en borrador. Después ya no podrás editarla sin crear una nueva versión."
          onConfirm={() => void handleSign()}
          onCancel={() => setShowSignConfirm(false)}
          variant="primary"
        />
      )}

      <ConfirmModal
        show={showRemakeConfirm}
        title={`Rehacer ${getAnexoLabel(tipoAnexo)}`}
        message="Se creará una nueva versión en borrador a partir de la versión firmada actual."
        onConfirm={() => void handleRemake()}
        onCancel={() => setShowRemakeConfirm(false)}
        variant="primary"
      />
    </div>
  );
}
