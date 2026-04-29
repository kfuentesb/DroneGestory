import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../commons/hooks/useAuth";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import StatCard from "../commons/props/StatCard";
import StatCardSkeleton from "../commons/props/StatCardSkeleton";
import DashboardHeader from "./DashboardHeader";
import { Month } from "@svar-ui/react-core";
import Select from 'react-select';
import "@svar-ui/react-core/all.css";
import "./dashboardStyles.css";

import {
  type DashboardMaintenanceDate, type DashboardData, 
  type TooltipSectionProps, type SummaryState, 
  type CalendarDayDetails, type TooltipState, 
  type ExtraDate , type ApiDateValue,
  markerClassForDate, getMonthLabel, toDateKey, MIN_CALENDAR_YEAR, MAX_CALENDAR_YEAR,
  normalizeDateKey, formatCertificateCategory, formatAircraftName, formatOperationTime,
  getMarkerClassName
} from "./utilsDashboard";

const getBirthdayMonthDay = (birthDate: ApiDateValue) => {
  const normalized = normalizeDateKey(birthDate);
  if (!normalized) {
    return null;
  }

  const [, month = "", day = ""] = normalized.split("-");
  return `${month}-${day}`;
};

type RoleOption = {
  value: string;
  label: string;
};

const roleOptions: RoleOption[] = [
  { value: "MANAGER", label: "Gestor" },
  { value: "MAINTAINER", label: "Mantenedor" },
  { value: "PILOT", label: "Piloto" }
];

const backgroundBorderInputsSelect = {
    control: (provided: any) => ({
        ...provided,
        backgroundColor: "#F3F4F6",
        borderColor: "#D1D5DB"
    })
};

const TooltipSection = <T,>({
  title,
  color,
  bgColor,
  borderColor,
  items,
  renderContent,
  onItemClick,
}: TooltipSectionProps<T> & { onItemClick?: (item: T) => void }) => (
  <div style={{ padding: "12px 14px", borderBottom: "1px solid #E5E7EB" }}>
    <div className="fw-semibold mb-2" style={{ color, fontSize: "0.875rem" }}>
      {title}
    </div>
    <div className="d-flex flex-column gap-2">
      {items.map((entry, i) => (
        <div
          key={i}
          onClick={() => onItemClick?.(entry)}
          style={{
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: "10px",
            padding: "8px 10px",
            cursor: onItemClick ? "pointer" : "default",
            transition: "transform 0.1s ease",
          }}
          className="dg-tooltip-card"
        >
          {renderContent(entry)}
        </div>
      ))}
    </div>
  </div>
);

export default function Dashboard() {
  const { username, hasRole } = useAuth();
  const [summary, setSummary] = useState<SummaryState>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const navigate = useNavigate();
  const monthRefs = useRef<Array<HTMLDivElement | null>>([]);
  const baseDate = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(baseDate.getFullYear());
  const [selectedDay, setSelectedDay] = useState<CalendarDayDetails | null>(null);
  const [newDescription, setNewDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<RoleOption[]>([]);

  const handleCloseModal = () => {
    setSelectedDay(null);
    setShowForm(false);
    setNewDescription("");
  };

    useEffect(() => {
      apiFetch("/api/dashboard")
        .then((res) => {
          if (!res) return;
          if (!res.ok) throw new Error("Error cargando resumen");
          return res.json();
        })
      .then((data: Partial<DashboardData>) => {

        const nextSummary: DashboardData = {
          totalUsuarios: data.totalUsuarios ?? 0,
          totalPilotos: data.totalPilotos ?? 0,
          totalDocumentacionUsuarios: data.totalDocumentacionUsuarios ?? 0,
          totalOperaciones: data.totalOperaciones ?? 0,
          totalDrones: data.totalDrones ?? 0,
          totalMantenimientos: data.totalMantenimientos ?? 0,
          totalDocumentacionAeronaves: data.totalDocumentacionAeronaves ?? 0,
          certificateExpirations: data.certificateExpirations ?? [],
          aircraftDocumentationExpirations: data.aircraftDocumentationExpirations ?? [],
          birthdays: data.birthdays ?? [],
          maintenance: data.maintenance ?? [],
          operations: data.operations ?? [],
          extraEvents: data.extraEvents ?? [],
        };

        setSummary(nextSummary);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setSummary({ error: err.message });
      })
      .finally(() => setLoading(false));
  }, []);

  const isError = (s: SummaryState): s is { error: string } => s !== null && "error" in s;
  const isData = (s: SummaryState): s is DashboardData => s !== null && !("error" in s);

  const isPrivilegedUser = hasRole("ADMIN") || hasRole("MANAGER");
  const isMaintenanceEnabled = hasRole("ADMIN") || hasRole("MAINTAINER");

  const expirationsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarDayDetails>();
    if (!isData(summary)) return grouped;

    const createEmptyDay = (): CalendarDayDetails => ({
      dateKey: "",
      certificates: [],
      aircraftDocumentation: [],
      birthdays: [],
      maintenance: [],
      operations: [],
      extraEvents: []
    });

    if (summary.extraEvents) {
      summary.extraEvents.forEach(e => {
        const key = normalizeDateKey(e.extraDate);
        if (key) {
          const day = grouped.get(key) ?? createEmptyDay();
          day.extraEvents.push(e);
          grouped.set(key, day);
        }
      });
    }

    summary.certificateExpirations.forEach((entry) => {
      const dateKey = normalizeDateKey(entry.expireDate);
      if (!dateKey) return;
      const current = grouped.get(dateKey) ?? {...createEmptyDay(), dateKey};
      current.certificates.push(entry);
      grouped.set(dateKey, current);
    });

    if (isPrivilegedUser) {
      summary.aircraftDocumentationExpirations.forEach((entry) => {
        const dateKey = normalizeDateKey(entry.expireDate);
        if (!dateKey) return;
        const current = grouped.get(dateKey) ?? createEmptyDay();
        current.aircraftDocumentation.push(entry);
        grouped.set(dateKey, current);
      });
    }

    summary.birthdays.forEach((entry) => {
      const monthDay = getBirthdayMonthDay(entry.birthDate);
      if (!monthDay) return;
      const key = `${selectedYear}-${monthDay}`;
      const current = grouped.get(key) ?? createEmptyDay();
      current.birthdays.push(entry);
      grouped.set(key, current);
    });

    summary.operations.forEach((entry) => {
      const dateKey = normalizeDateKey(entry.fechaPrevista);
      if (!dateKey) return;
      const current = grouped.get(dateKey) ?? createEmptyDay();
      current.operations.push(entry);
      grouped.set(dateKey, current);
    });
    
    if(!isMaintenanceEnabled) return grouped;

    summary.maintenance.forEach((entry) => {
      const dateKey = normalizeDateKey(entry.maintenanceDate);
      if (!dateKey) return;

      const current = grouped.get(dateKey) ?? createEmptyDay();
      current.maintenance.push({ ...entry, isDone: true } as any);
      grouped.set(dateKey, current);
    });

    const latestMaintenanceMap = new Map<number, DashboardMaintenanceDate>();
    
    summary.maintenance.forEach((entry) => {
      if (!entry.nextMaintenanceDate) return;
      
      const existing = latestMaintenanceMap.get(entry.aircraftId);
      if (!existing || new Date(entry.nextMaintenanceDate) > new Date(existing.nextMaintenanceDate)) {
        latestMaintenanceMap.set(entry.aircraftId, entry);
      }
    });

    latestMaintenanceMap.forEach((entry) => {
      const dateKey = normalizeDateKey(entry.nextMaintenanceDate); 
      if (!dateKey) return;

      const current = grouped.get(dateKey) ?? createEmptyDay();
      current.maintenance.push({ ...entry, isDone: false } as any);
      grouped.set(dateKey, current);
    });

    return grouped;
  }, [isPrivilegedUser, selectedYear, summary]);

  useEffect(() => {
    let cleanups: Array<() => void> = [];

    const timeoutId = setTimeout(() => {
      monthRefs.current.forEach((container) => {
        if (!container) return;

        expirationsByDate.forEach((details, key) => {
          const markerClass = markerClassForDate(key);
          const nodes = container.querySelectorAll<HTMLElement>(`.${markerClass}`);

          nodes.forEach((node) => {
            const colors: string[] = [];
            if (details.certificates.length > 0) colors.push("#ef4444");
            if (details.maintenance.length > 0) {
              const hasPending = details.maintenance.some((m: any) => !m.isDone);
              colors.push(hasPending ? "#22c55e" : "#15803d");
            }
            if (details.birthdays.length > 0) colors.push("#facc15");
            if (details.aircraftDocumentation.length > 0) colors.push("#3b82f6");
            if (details.operations.length > 0) colors.push("#8b5cf6");
            if (details.extraEvents.length > 0) colors.push("#db2777");

            if (colors.length > 1) {
              const step = 100 / colors.length;
              const gradientStops = colors.map((color, i) => 
                `${color} ${i * step}%, ${color} ${(i + 1) * step}%`
              ).join(", ");
              
              node.style.setProperty("--mixed-bg", `linear-gradient(135deg, ${gradientStops})`);
            }
            const handleEnter = (event: Event) => {
              const target = event.currentTarget as HTMLElement;
              const rect = target.getBoundingClientRect();
              setTooltip({
                x: rect.left + rect.width / 2,
                y: rect.top - 8,
                details,
              });
            };

            const handleLeave = (event: Event) => {
              const mouseEv = event as MouseEvent;
              const relatedTarget = mouseEv.relatedTarget as HTMLElement;
              if (relatedTarget?.closest('.dg-tooltip-container')) return;
              setTooltip(null);
            };

            const handleClick = () => {
              if (isPrivilegedUser) {
                setTooltip(null);
                setSelectedDay(details || { 
                  dateKey: key, 
                  certificates: [], 
                  aircraftDocumentation: [], 
                  birthdays: [], 
                  maintenance: [], 
                  operations: [], 
                  extraEvents: [] 
                });
              }
            };

            node.addEventListener("mouseenter", handleEnter);
            node.addEventListener("mouseleave", handleLeave);
            node.addEventListener("click", handleClick);
            
            cleanups.push(() => {
              node.removeEventListener("mouseenter", handleEnter);
              node.removeEventListener("mouseleave", handleLeave);
              node.removeEventListener("click", handleClick);
            });
          });
        });
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [expirationsByDate, loading, summary, isPrivilegedUser]);

  const [editingEventId, setEditingEventId] = useState<number | null | undefined>(null);

  const handleDeleteExtraEvent = async (eventId: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este evento?") || !selectedDay) return;
    
    try {
      const res = await apiFetch(`/api/extra-dates/${eventId}`, { method: "DELETE" });
      if (res && res.ok) {
        setSelectedDay(prev => prev ? {
          ...prev,
          extraEvents: prev.extraEvents.filter(e => e.idExtraDate !== eventId)
        } : null);
        window.location.reload();

      } else {
        alert("No se pudo eliminar el evento");
      }
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el evento");
    }
  };

  const handleStartEdit = (item: ExtraDate) => {
    setEditingEventId(item.idExtraDate ?? null);
    setNewDescription(item.description);
    if (item.roles && item.roles.length > 0) {
      const rolesToEdit = item.roles.map(roleName => ({
        value: roleName,
        label: roleName
      }));
      setSelectedRoles(rolesToEdit);
    } else {
      setSelectedRoles([]);
    }
    
    setShowForm(true);
  };

  const handleSaveExtraDate = async () => {
    if (!newDescription.trim() || !selectedDay?.dateKey) return;

    const cleanDate = typeof selectedDay.dateKey === 'string' 
      ? selectedDay.dateKey.split('T')[0] 
      : selectedDay.dateKey;

    const payload = {
      ...(editingEventId && { idExtraDate: editingEventId }),
      extraDate: cleanDate, 
      description: newDescription.trim(),
      roles: selectedRoles.map(r => r.value)
    };

    try {
      const url = editingEventId 
        ? `/api/extra-dates/${editingEventId}` 
        : "/api/extra-dates";
        
      const res = await apiFetch(url, {
        method: editingEventId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res?.ok) {
        window.location.reload();
      } else {
        alert("Error en el servidor al intentar guardar.");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  const userHasAnyRoleFromList = roleOptions.some(option => hasRole(option.value));

  return (
    <main
      style={{
        background: "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >

      <DashboardHeader username={username ?? ""} navigate={navigate} />

      <section className="mt-5">
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "16px", backgroundColor: "white" }}>
          <div className="d-flex align-items-center gap-2 mb-4">
            <div style={{ width: "4px", height: "24px", backgroundColor: "#8B5CF6", borderRadius: "2px" }} />
            <h5 className="mb-0 fw-semibold" style={{ color: "#111827", fontSize: "1.125rem" }}>
              Resumen del Sistema
            </h5>
          </div>
          <div className="row g-4 mb-5">
            {loading ? (
              <>
                <StatCardSkeleton delay={0} />
                <StatCardSkeleton delay={100} />
                <StatCardSkeleton delay={200} />
                <StatCardSkeleton delay={300} />
              </>
            ) : isError(summary) ? (
              <div className="col-12">
                <div
                  className="alert alert-danger border-0 d-flex align-items-center gap-3"
                  style={{ borderRadius: "12px", backgroundColor: "#FEE2E2" }}
                >
                  <i className="bi bi-exclamation-triangle-fill fs-4" style={{ color: "#DC2626" }} />
                  <div>
                    <h6 className="mb-1 fw-semibold" style={{ color: "#991B1B" }}>
                      Error al cargar datos
                    </h6>
                    <p className="mb-0" style={{ color: "#B91C1C" }}>
                      {summary.error}
                    </p>
                  </div>
                  <button
                    className="btn btn-sm ms-auto"
                    onClick={() => window.location.reload()}
                    style={{ backgroundColor: "#DC2626", color: "white", borderRadius: "8px" }}
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : isData(summary) ? (
              <>
                {isPrivilegedUser ? (
                  <>
                    <StatCard icon="bi-people-fill" value={summary.totalUsuarios} label="Usuarios Registrados" color="orange" delay={0} />
                    <StatCard icon="bi-file-earmark-text-fill" value={summary.totalDocumentacionUsuarios} label="Docs. Usuarios" color="orange" delay={50} />
                  </>
                ) : null}
                <StatCard icon="bi-person-badge-fill" value={summary.totalPilotos} label="Pilotos Activos" color="red" delay={100} />
                <StatCard icon="bi-airplane-engines-fill" value={summary.totalDrones} label="Drones en Flota" color="blue" delay={150} />
                <StatCard icon="bi-file-earmark-text-fill" value={summary.totalDocumentacionAeronaves} label="Docs. Aeronaves" color="blue" delay={200} />
                <StatCard icon="bi-clipboard-check" value={summary.totalOperaciones} label="Operaciones Totales" color="purple" delay={250} />
                <StatCard icon="bi-clipboard-check" value={summary.totalMantenimientos} label="Mantenimientos Totales" color="green" delay={300} />
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-4">
        <div className="card border-0 shadow-sm p-3" style={{ borderRadius: "12px", backgroundColor: "white" }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div style={{ width: "3px", height: "20px", backgroundColor: "#8B5CF6", borderRadius: "2px" }} />
            <h6 className="mb-0 fw-bold">Calendario de planificación</h6>
          </div>

          <div className="d-flex flex-column align-items-center gap-2 mb-4">
            <div className="fw-semibold" style={{ color: "#111827", fontSize: "1rem" }}>
              Año {selectedYear}
            </div>

            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSelectedYear((year) => Math.max(MIN_CALENDAR_YEAR, year - 1))}
                disabled={selectedYear <= MIN_CALENDAR_YEAR}
                style={{ borderRadius: "6px" }}
              >
                Anterior
              </button>
              
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>Ir al año:</small>
              <select
                className="form-select form-select-sm shadow-none"
                style={{
                  width: "90px",
                  cursor: "pointer",
                  borderColor: "#D1D5DB",
                  fontSize: "0.8rem"
                }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from(
                  { length: MAX_CALENDAR_YEAR - MIN_CALENDAR_YEAR + 1 },
                  (_, i) => MIN_CALENDAR_YEAR + i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSelectedYear((year) => Math.min(MAX_CALENDAR_YEAR, year + 1))}
                disabled={selectedYear >= MAX_CALENDAR_YEAR}
                style={{ borderRadius: "6px" }}
              >
                Siguiente
              </button>
            </div>

          </div>

          <div className="d-flex flex-wrap justify-content-center gap-3">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const currentMonth = new Date(selectedYear, monthIndex, 1);
              return (
                <div 
                  key={`${selectedYear}-${monthIndex}`} 
                  ref={(el) => { monthRefs.current[monthIndex] = el; }}
                  className="dg-dashboard-calendar" 
                  style={{ flex: "1 1 260px", maxWidth: "280px", border: "1px solid #F3F4F6", borderRadius: "10px", padding: "12px" }}
                >
                  <p className="small fw-bold mb-1" style={{ color: "#6B7280" }}>{getMonthLabel(currentMonth)}</p>
                  <Month
                    current={currentMonth}
                    markers={(date) => {
                      if (date.getMonth() !== currentMonth.getMonth()) return "";
                      const key = toDateKey(date);
                      const details = expirationsByDate.get(key);
                      if (!details) return "";

                      const activeColors: string[] = [];
                      if (details.certificates.length > 0) activeColors.push("#ef4444");
                      if (details.maintenance.length > 0) {
                          const hasPending = details.maintenance.some((m: any) => !m.isDone);
                          activeColors.push(hasPending ? "#22c55e" : "#15803d");
                      }
                      if (details.birthdays.length > 0) activeColors.push("#facc15");
                      if (details.aircraftDocumentation.length > 0) activeColors.push("#3b82f6");
                      if (details.operations.length > 0) activeColors.push("#8b5cf6");

                      const visibleExtraEvents = details.extraEvents?.filter(item => {
                        if (hasRole("ADMIN")) return true;
                        const hasRestrictions = item.roles && item.roles.length > 0;
                        if (!hasRestrictions) return false;
                        const userMatchesRole = item.roles?.some(role => hasRole(role));
                        return userMatchesRole;
                      }) || [];
                      if (visibleExtraEvents.length > 0) activeColors.push("#db2777");

                      const colorCount = activeColors.length;
                      const markerClass = getMarkerClassName({...details, extraEvents: visibleExtraEvents});
                      return `${markerClass} ${markerClassForDate(key)} color-count-${colorCount}`;
                    }}
                    onChange={(date: Date) => {
                      const key = toDateKey(date);
                      const existingDetails = expirationsByDate.get(key);
                      
                      if (existingDetails) {
                        setSelectedDay({
                          ...existingDetails,
                          dateKey: key 
                        });
                      } else {
                        setSelectedDay({
                          dateKey: key,
                          certificates: [],
                          maintenance: [],
                          birthdays: [],
                          aircraftDocumentation: [],
                          operations: [],
                          extraEvents: []
                        });
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {tooltip && (
          <div
            className="dg-tooltip-container"
            style={{
              position: "fixed",
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
              zIndex: 2000,
              width: "320px",
              pointerEvents: "auto",
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <div className="card border-0 shadow-lg" style={{ borderRadius: "12px", overflow: "hidden", backgroundColor: "#FFF" }}>
              
              {/* 1. CERTIFICATES */}
              {tooltip.details.certificates.length > 0 && (
                <TooltipSection
                  title="Expiración de certificado"
                  color="#991B1B"
                  bgColor="#FEF2F2"
                  borderColor="#FECACA"
                  items={tooltip.details.certificates}
                  renderContent={(e) => (
                    <>
                      <div className="fw-semibold" style={{ color: "#111827", fontSize: "0.85rem" }}>{e.firstName} {e.lastName}</div>
                      <div style={{ color: "#6B7280", fontSize: "0.75rem" }}>@{e.username}</div>
                      <div className="mt-1" style={{ color: "#991B1B", fontSize: "0.75rem" }}>
                        <strong>Categoría:</strong> {formatCertificateCategory(e)}
                      </div>
                    </>
                  )}
                />
              )}

              {/* 2. AIRCRAFT DOCS */}
              {tooltip.details.aircraftDocumentation.length > 0 && (
                <TooltipSection
                  title="Documentación de aeronaves"
                  color="#1D4ED8"
                  bgColor="#EFF6FF"
                  borderColor="#BFDBFE"
                  items={tooltip.details.aircraftDocumentation}
                  renderContent={(e) => (
                    <>
                      <div className="fw-semibold" style={{ color: "#111827", fontSize: "0.85rem" }}>{formatAircraftName(e) || "Aeronave"}</div>
                      <div style={{ color: "#6B7280", fontSize: "0.75rem" }}>Serie: {e.serialNumber || "Sin serie"}</div>
                      <div className="mt-1" style={{ color: "#1D4ED8", fontSize: "0.75rem" }}>
                        <strong>Doc:</strong> {e.documentationType || "Seguro RC"}
                      </div>
                    </>
                  )}
                />
              )}

              {/* 3. BIRTHDAYS */}
              {tooltip.details.birthdays.length > 0 && (
                <TooltipSection
                  title="Cumpleaños"
                  color="#A16207"
                  bgColor="#FEFCE8"
                  borderColor="#FDE047"
                  items={tooltip.details.birthdays}
                  renderContent={(e) => (
                    <>
                      <div className="fw-semibold" style={{ color: "#111827", fontSize: "0.85rem" }}>{e.firstName} {e.lastName}</div>
                      <div style={{ color: "#6B7280", fontSize: "0.75rem" }}>@{e.username}</div>
                    </>
                  )}
                />
              )}

              {/* 4. OPERATIONS */}
              {tooltip.details.operations.length > 0 && (
                <TooltipSection
                  title="Operaciones previstas"
                  color="#6D28D9"
                  bgColor="#F5F3FF"
                  borderColor="#DDD6FE"
                  items={tooltip.details.operations}
                  renderContent={(e) => (
                    <>
                      <div className="fw-semibold" style={{ color: "#111827", fontSize: "0.85rem" }}>{e.codigo}</div>
                      <div style={{ color: "#6B7280", fontSize: "0.75rem" }}>
                        Hora prevista: {formatOperationTime(e.fechaPrevista) ?? "--:--"}
                      </div>
                    </>
                  )}
                />
              )}

              {/* 5. MAINTENANCE */}
              {tooltip.details.maintenance.length > 0 && (
                <TooltipSection
                  title="Mantenimiento"
                  color="#15803D"
                  bgColor="#F0FDF4"
                  borderColor="#BBF7D0"
                  items={tooltip.details.maintenance}
                  renderContent={(e: any) => (
                    <>
                      <div className="fw-semibold" style={{ color: "#111827", fontSize: "0.85rem" }}>
                        {e.manufacturer} {e.model} {e.serialNumber ? `(S/N: ${e.serialNumber})` : ""}
                      </div>
                      <div className="mt-1" style={{ 
                          color: e.isDone ? "#15803D" : "#166534", 
                          fontSize: "0.75rem",
                          fontWeight: e.isDone ? "bold" : "normal"
                      }}>
                        {e.isDone ? "Realizado" : "Programado"}
                      </div>
                    </>
                  )}
                />
              )}

              {/* 6. EVENTOS ESPECIALES */}
              {(() => {
                const visibleEvents = tooltip.details.extraEvents.filter(e => {
                  const hasRestrictions = e.roles && e.roles.length > 0;
                  const userMatchesRole = e.roles?.some(role => hasRole(role));
                  return hasRole("ADMIN") || (hasRestrictions && userMatchesRole);
                });

                if (visibleEvents.length === 0) return null;

                return (
                  <TooltipSection
                    title="Evento especial"
                    color="#DB2777"
                    bgColor="#FDF2F8"
                    borderColor="#f8acce"
                    items={visibleEvents}
                    renderContent={(e) => (
                      <>
                        <div className="fw-semibold" style={{ color: "#111827", fontSize: "0.85rem" }}>{e.description}</div>
                      </>
                    )}
                  />
                );
              })()}

            </div>
          </div>
        )}
      </section>

      {selectedDay && (
        <div 
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)", zIndex: 3000,
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)"
          }}
          onClick={() => setSelectedDay(null)}
        >
          <div 
            className="card border-0 shadow-lg" 
            style={{ width: "90%", maxWidth: "500px", borderRadius: "20px", maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Detalles del día</h5>
              <small className="text-muted fw-medium">
                {selectedDay?.dateKey ? new Date(selectedDay.dateKey + "T00:00:00").toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                }) : ""}
              </small>
              <button className="btn-close" onClick={() => setSelectedDay(null)}></button>
            </div>
            
            <div className="p-4">
              {(hasRole("ADMIN") || userHasAnyRoleFromList) && selectedDay && (
                <>
                  {/* Debug del bloque principal */}
                  {console.log("DEBUG: Renderizando bloque de Eventos Especiales", { 
                    isAdmin: hasRole("ADMIN"), 
                    hasAnyRole: userHasAnyRoleFromList, 
                    totalEvents: selectedDay.extraEvents.length 
                  })}

                  {isPrivilegedUser && selectedDay && (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">Eventos especiales</h6>
                        <button
                          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                          onClick={() => {
                            if (showForm) {
                              setEditingEventId(null);
                              setNewDescription("");
                            }
                            setShowForm(!showForm);
                          }}
                          disabled={!showForm && selectedDay.extraEvents.length >= 3}
                        >
                          <i className={`bi ${showForm ? "bi-x-lg" : "bi-plus-lg"}`}></i>
                          {showForm ? "Cancelar" : "Añadir"}
                        </button>
                      </div>

                      {/* Formulario de Creación/Edición */}
                      {showForm && (
                        <div className="mb-3 p-3" style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
                          <input
                            className="form-control form-control-sm mb-2"
                            placeholder="Descripción del evento..."
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                          />
                          <div className="col-12 col-md mb-3 mb-md-2">
                            <Select
                              options={roleOptions}
                              styles={backgroundBorderInputsSelect}
                              placeholder="Seleccione visivilidad del evento"
                              value={selectedRoles}
                              isMulti
                              closeMenuOnSelect={false}
                              onChange={(val) => {
                                setSelectedRoles(val ? (val as RoleOption[]) : []);
                              }}
                            />
                          </div>
                          <button
                            className="btn btn-sm w-100"
                            style={{ backgroundColor: editingEventId ? "#0D6EFD" : "#DB2777", color: "white" }}
                            onClick={handleSaveExtraDate}
                          >
                            {editingEventId ? "Actualizar Evento" : "Guardar Evento"}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Mapeo de eventos con filtro de seguridad y Logs */}
                  {selectedDay.extraEvents.map((item, i) => {
                    const isAdmin = hasRole("ADMIN");
                    const hasRestrictions = item.roles && item.roles.length > 0;
                    const userMatchesRole = item.roles?.some(role => hasRole(role));
                    const canSeeThisEvent = hasRole("ADMIN") || (hasRestrictions && userMatchesRole);

                    console.log(`DEBUG: Evento [${i}]`, {
                      rolesDelEvento: item.roles,
                      hasRestrictions: hasRestrictions,
                      userMatchesRole: userMatchesRole,
                      resultadoFinal: canSeeThisEvent ? "VISIBLE" : "OCULTO"
                    });

                    if (!canSeeThisEvent) return null;

                    return (
                      <div 
                        key={item.idExtraDate || i} 
                        className="p-3 mb-2" 
                        style={{ 
                          backgroundColor: "#FDF2F8", 
                          borderRadius: "12px", 
                          border: "1px solid #FBCFE8" 
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <div className="fw-bold" style={{ color: "#BE185D" }}>
                              Evento especial
                            </div>
                            <small className="text-dark">{item.description}</small>
                            
                            {isPrivilegedUser && item.roles && item.roles.length > 0 && (
                              <div className="mt-1 d-flex flex-wrap gap-1">
                                {item.roles.map(r => (
                                  <span 
                                    key={r} 
                                    className="badge bg-light text-secondary border" 
                                    style={{ fontSize: "0.6rem" }}
                                  >
                                    {r}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="d-flex gap-1">
                            {isPrivilegedUser && (
                              <>
                                <button
                                  className="btn btn-sm text-primary p-1"
                                  title="Editar"
                                  onClick={() => handleStartEdit(item)}
                                >
                                  <i className="bi bi-pencil-square"></i> Editar
                                </button>
                                <button
                                  className="btn btn-sm text-danger p-1"
                                  title="Eliminar"
                                  onClick={() => item.idExtraDate && handleDeleteExtraEvent(item.idExtraDate)}
                                >
                                  <i className="bi bi-trash"></i> Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <hr/>
              {/* CERTIFICATES */}
              {selectedDay?.certificates.map((item, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between p-3 mb-2" style={{ backgroundColor: "#FEF2F2", borderRadius: "12px", border: "1px solid #FECACA" }}>
                  <div>
                    <div className="fw-bold text-danger">Certificado Expirado</div>
                    <small className="text-dark">{item.firstName} {item.lastName}</small>
                  </div>
                  <button 
                    className="btn btn-sm btn-danger px-3 shadow-sm" 
                    onClick={() => {
                      setSelectedDay(null);
                      navigate(`/users/${item.userId}`);
                    }}
                  >
                    Ver
                  </button>
                </div>
              ))}
              {/* AIRCRAFT */}
              {selectedDay?.aircraftDocumentation.map((item, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between p-3 mb-2" style={{ backgroundColor: "#EFF6FF", borderRadius: "12px", border: "1px solid #BFDBFE" }}>
                  <div>
                    <div className="fw-bold text-primary">Doc. Aeronave</div>
                    <small className="text-dark">{formatAircraftName(item)}</small>
                  </div>
                  <button 
                    className="btn btn-sm btn-primary px-3 shadow-sm" 
                    onClick={() => {
                      setSelectedDay(null);
                      navigate(`/aircrafts/${item.aircraftId}`);
                    }}
                  >
                    Ver
                  </button>
                </div>
              ))}
              {/* BIRTHDAYS */}
              {selectedDay?.birthdays.map((item, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between p-3 mb-2" style={{ backgroundColor: "#FEFCE8", borderRadius: "12px", border: "1px solid #FDE047" }}>
                  <div>
                    <div className="fw-bold text-warning" style={{ color: "#854d0e" }}>Cumpleaños</div>
                    <small className="text-dark">{item.firstName} {item.lastName}</small>
                  </div>
                  {isPrivilegedUser && (
                    <button 
                      className="btn btn-sm btn-warning px-3 shadow-sm" 
                      onClick={() => {
                        setSelectedDay(null);
                        navigate(`/users/${item.userId}`);
                      }}
                    >
                      Ver
                    </button>
                  )}
                </div>
              ))}
              {/* OPERATIONS */}
              {selectedDay?.operations.map((item, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between p-3 mb-2" style={{ backgroundColor: "#F5F3FF", borderRadius: "12px", border: "1px solid #DDD6FE" }}>
                  <div>
                    <div className="fw-bold" style={{ color: "#6D28D9" }}>Operacion prevista</div>
                    <small className="text-dark">{item.codigo}</small>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      Hora prevista: {formatOperationTime(item.fechaPrevista) ?? "--:--"}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm px-3 shadow-sm"
                    style={{ backgroundColor: "#6D28D9", color: "white" }}
                    onClick={() => {
                      setSelectedDay(null);
                      navigate(`/operations/${item.operationId}`);
                    }}
                  >
                    Ver
                  </button>
                </div>
              ))}
              {/* MAINTENANCE IN MODAL */}
              {selectedDay?.maintenance.map((item: any, i) => (
                <div 
                  key={i} 
                  className="d-flex align-items-center justify-content-between p-3 mb-2" 
                  style={{ 
                    backgroundColor: item.isDone ? "#F0FDF4" : "#dbf9e6", // Verde claro si hecho, Azul claro si pendiente
                    borderRadius: "12px", 
                    border: `1px solid ${item.isDone ? "#BBF7D0" : "#a6ffc6"}`,
                    transition: "transform 0.2s"
                  }}
                >
                  <div className="d-flex flex-column gap-1">
                    <div className="d-flex align-items-center gap-2">
                      <div className="fw-bold" style={{ color: item.isDone ? "#15803D" : "#26e56c" }}>
                        Mantenimiento
                      </div>
                      {/* Badge de estado */}
                      <span 
                        className="badge rounded-pill" 
                        style={{ 
                          fontSize: "0.65rem", 
                          backgroundColor: item.isDone ? "#15803D" : "#26e56c",
                          color: "white"
                        }}
                      >
                        {item.isDone ? "REALIZADO" : "PROGRAMADO"}
                      </span>
                    </div>
                    
                    <small className="text-dark fw-medium">
                      {item.manufacturer} {item.model}
                    </small>
                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                      S/N: {item.serialNumber || "N/A"}
                    </small>
                  </div>

                  <button 
                    className="btn btn-sm px-3 shadow-sm" 
                    style={{ 
                      backgroundColor: item.isDone ? "#15803D" : "#26e56c", 
                      color: "white"
                    }}
                    onClick={() => {
                      setSelectedDay(null);
                      navigate(`/maintenance/aircraft/${item.aircraftId}`);
                    }}
                  >
                    Ver
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
