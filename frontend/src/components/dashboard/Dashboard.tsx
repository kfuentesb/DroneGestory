  import React, { useEffect, useMemo, useRef, useState } from "react";
  import { useAuth } from "../commons/hooks/useAuth";
  import { apiFetch } from "../../api";
  import { useNavigate } from "react-router-dom";
  import StatCard from "../commons/props/StatCard";
  import StatCardSkeleton from "../commons/props/StatCardSkeleton";
  import DashboardHeader from "./DashboardHeader";
  import { Month } from "@svar-ui/react-core";
  import "@svar-ui/react-core/all.css";
  import "./dashboardStyles.css";

  interface DashboardCertificateExpiration {
    userId: number;
    expireDate: string;
    firstName: string;
    lastName: string;
    username: string;
    certificateName: string | null;
    certificateType: string | null;
  }

  interface DashboardAircraftDocumentationExpiration {
    aircraftId: number;
    expireDate: string;
    documentationType: string | null;
    serialNumber: string | null;
    manufacturer: string | null;
    model: string | null;
  }

  interface DashboardBirthday {
    userId: number;
    birthDate: string;
    firstName: string;
    lastName: string;
    username: string;
  }

  interface DashboardMaintenanceDate {
    aircraftId: number;
    maintenanceDate: string;
    nextMaintenanceDate: string;
    description: string | null;
    serialNumber: string | null;
    manufacturer: string | null;
    model: string | null;
  }

  interface DashboardOperationPlanned {
    operationId: number;
    codigo: string;
    fechaPrevista: string;
  }

  interface DashboardData {
    totalUsuarios: number;
    totalPilotos: number;
    totalDocumentacionUsuarios: number;
    totalOperaciones: number;
    totalDrones: number;
    totalMantenimientos: number;
    totalDocumentacionAeronaves: number;
    certificateExpirations: DashboardCertificateExpiration[];
    aircraftDocumentationExpirations: DashboardAircraftDocumentationExpiration[];
    birthdays: DashboardBirthday[];
    maintenance: DashboardMaintenanceDate[];
    operations: DashboardOperationPlanned[];
  }

  interface TooltipSectionProps<T> {
    title: string;
    color: string;
    bgColor: string;
    borderColor: string;
    items: T[];
    renderContent: (entry: T) => React.ReactNode;
  }

  type SummaryState = DashboardData | { error: string } | null;

  type CalendarDayDetails = {
    certificates: DashboardCertificateExpiration[];
    aircraftDocumentation: DashboardAircraftDocumentationExpiration[];
    birthdays: DashboardBirthday[];
    maintenance: DashboardMaintenanceDate[];
  };

  type TooltipState = {
    x: number;
    y: number;
    details: CalendarDayDetails;
  } | null;

  type ApiDateValue = string | number[] | null | undefined;

  const MIN_CALENDAR_YEAR = 2000;
  const MAX_CALENDAR_YEAR = 2100;

  const toDateKey = (date: Date) =>
    `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;

  const markerClassForDate = (dateKey: string) => `dg-expiry-date-${dateKey}`;

  const getMonthLabel = (date: Date) => {
    const value = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(date);
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const getMarkerClassName = (details?: CalendarDayDetails) => {
    if (!details) return "";

    const hasCert = details.certificates.length > 0;
    const hasAir = details.aircraftDocumentation.length > 0;
    const hasBirth = details.birthdays.length > 0;
    const hasMaint = details.maintenance.length > 0;

    const activeCategories = [hasCert, hasAir, hasBirth, hasMaint].filter(Boolean).length;

    if (activeCategories === 1 && hasMaint) {
      const hasPending = details.maintenance.some((m: any) => !m.isDone);
      return `dg-expiry-marker ${hasPending ? "dg-expiry-marker-maint-pending" : "dg-expiry-marker-maint-done"}`;
    }

    if (activeCategories > 1) return "dg-expiry-marker dg-expiry-marker-mixed";
    if (hasCert) return "dg-expiry-marker dg-expiry-marker-certificate";
    if (hasAir) return "dg-expiry-marker dg-expiry-marker-aircraft";
    if (hasBirth) return "dg-expiry-marker dg-expiry-marker-birthday";

    return "";
  };
  const formatCertificateTitle = (entry: DashboardCertificateExpiration) =>
    entry.certificateName?.trim() || entry.certificateType?.trim() || "Certificado";

  const formatCertificateCategory = (entry: DashboardCertificateExpiration) =>
    entry.certificateType?.trim() || "Sin categoría";

  const formatAircraftName = (entry: DashboardAircraftDocumentationExpiration) =>
    [entry.manufacturer, entry.model].filter(Boolean).join(" ");

  const normalizeDateKey = (value: ApiDateValue): string | null => {
    if (!value) {
      return null;
    }

    if (Array.isArray(value) && value.length >= 3) {
      const [year, month, day] = value;
      return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    if (typeof value === "string") {
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
    }

    return null;
  };

  const getBirthdayMonthDay = (birthDate: ApiDateValue) => {
    const normalized = normalizeDateKey(birthDate);
    if (!normalized) {
      return null;
    }

    const [, month = "", day = ""] = normalized.split("-");
    return `${month}-${day}`;
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

    useEffect(() => {
      apiFetch("/api/dashboard")
        .then((res) => {
          if (!res) return;
          if (!res.ok) throw new Error("Error cargando resumen");
          return res.json();
        })
        .then((data: Partial<DashboardData>) => {
          console.log("Dashboard API Data:", data);
          console.log("Maintenance Data Received:", data.maintenance);

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
    const isMaintenanceEnabled = hasRole("ADMIN") || hasRole("MAINTENANCE");

    const expirationsByDate = useMemo(() => {
      const grouped = new Map<string, CalendarDayDetails>();
      if (!isData(summary)) return grouped;

      const createEmptyDay = (): CalendarDayDetails => ({
        certificates: [],
        aircraftDocumentation: [],
        birthdays: [],
        maintenance: []
      });

      summary.certificateExpirations.forEach((entry) => {
        const dateKey = normalizeDateKey(entry.expireDate);
        if (!dateKey) return;
        const current = grouped.get(dateKey) ?? createEmptyDay();
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
                  setSelectedDay(details);
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
                  {hasRole("ADMIN") || hasRole("MANAGER") ? (
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
                        const colorCount = activeColors.length;
                        const markerClass = getMarkerClassName(details);
                        return `${markerClass} ${markerClassForDate(key)} color-count-${colorCount}`;
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
                    onItemClick={(e) => navigate(`/users/${e.userId}`)}
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
                    onItemClick={(e) => navigate(`/aircrafts/${e.aircraftId}`)}
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
                    onItemClick={(e) => navigate(`/users/${e.userId}`)}
                    renderContent={(e) => (
                      <>
                        <div className="fw-semibold" style={{ color: "#111827", fontSize: "0.85rem" }}>{e.firstName} {e.lastName}</div>
                        <div style={{ color: "#6B7280", fontSize: "0.75rem" }}>@{e.username}</div>
                      </>
                    )}
                  />
                )}

                {/* 4. MAINTENANCE */}
                {tooltip.details.maintenance.length > 0 && (
                  <TooltipSection
                    title="Mantenimiento"
                    color="#15803D"
                    bgColor="#F0FDF4"
                    borderColor="#BBF7D0"
                    items={tooltip.details.maintenance}
                    onItemClick={(e: any) => navigate(`/maintenance/aircraft/${e.aircraftId}`)}
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
                <button className="btn-close" onClick={() => setSelectedDay(null)}></button>
              </div>
              
              <div className="p-4">
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
                    <button 
                      className="btn btn-sm btn-warning px-3 shadow-sm" 
                      onClick={() => {
                        setSelectedDay(null);
                        navigate(`/users/${item.userId}`);
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
