import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../commons/hooks/useAuth";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import StatCard from "../commons/props/StatCard";
import StatCardSkeleton from "../commons/props/StatCardSkeleton";
import DashboardHeader from "./DashboardHeader";
import { Month } from "@svar-ui/react-core";
import "@svar-ui/react-core/all.css";

interface DashboardCertificateExpiration {
  expireDate: string;
  firstName: string;
  lastName: string;
  username: string;
  certificateName: string | null;
  certificateType: string | null;
}

interface DashboardAircraftDocumentationExpiration {
  expireDate: string;
  documentationType: string | null;
  serialNumber: string | null;
  manufacturer: string | null;
  model: string | null;
}

interface DashboardBirthday {
  birthDate: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface DashboardData {
  totalUsuarios: number;
  totalPilotos: number;
  totalOperaciones: number;
  totalDrones: number;
  certificateExpirations: DashboardCertificateExpiration[];
  aircraftDocumentationExpirations: DashboardAircraftDocumentationExpiration[];
  birthdays: DashboardBirthday[];
}

type SummaryState = DashboardData | { error: string } | null;

type CalendarDayDetails = {
  certificates: DashboardCertificateExpiration[];
  aircraftDocumentation: DashboardAircraftDocumentationExpiration[];
  birthdays: DashboardBirthday[];
};

type TooltipState = {
  x: number;
  y: number;
  details: CalendarDayDetails;
} | null;

type ApiDateValue = string | number[] | null | undefined;

const addMonth = (date: Date, n: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + n);
  return next;
};

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;

const markerClassForDate = (dateKey: string) => `dg-expiry-date-${dateKey}`;

const getMonthLabel = (date: Date) => {
  const value = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(date);
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getMarkerClassName = (details?: CalendarDayDetails) => {
  if (!details) {
    return "";
  }

  const hasCertificates = details.certificates.length > 0;
  const hasAircraftDocumentation = details.aircraftDocumentation.length > 0;
  const hasBirthdays = details.birthdays.length > 0;

  if (hasCertificates && hasAircraftDocumentation) {
    return "dg-expiry-marker dg-expiry-marker-mixed";
  }
  if (hasCertificates) {
    return "dg-expiry-marker dg-expiry-marker-certificate";
  }
  if (hasAircraftDocumentation) {
    return "dg-expiry-marker dg-expiry-marker-aircraft";
  }
  if (hasBirthdays) {
    return "dg-expiry-marker dg-expiry-marker-birthday";
  }

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

export default function Dashboard() {
  const { username, hasRole } = useAuth();
  const [summary, setSummary] = useState<SummaryState>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const navigate = useNavigate();
  const monthRefs = useRef<Array<HTMLDivElement | null>>([]);
  const baseDate = useMemo(() => new Date(), []);

  useEffect(() => {
    apiFetch("/api/dashboard")
      .then((res) => {
        if (!res) return;
        if (!res.ok) throw new Error("Error cargando resumen");
        return res.json();
      })
      .then((data: Partial<DashboardData>) => {
        console.log("[Dashboard] /api/dashboard raw payload", data);

        const nextSummary: DashboardData = {
          totalUsuarios: data.totalUsuarios ?? 0,
          totalPilotos: data.totalPilotos ?? 0,
          totalOperaciones: data.totalOperaciones ?? 0,
          totalDrones: data.totalDrones ?? 0,
          certificateExpirations: data.certificateExpirations ?? [],
          aircraftDocumentationExpirations: data.aircraftDocumentationExpirations ?? [],
          birthdays: data.birthdays ?? [],
        };

        console.log("[Dashboard] normalized payload counts", {
          totalUsuarios: nextSummary.totalUsuarios,
          totalPilotos: nextSummary.totalPilotos,
          totalOperaciones: nextSummary.totalOperaciones,
          totalDrones: nextSummary.totalDrones,
          certificateExpirations: nextSummary.certificateExpirations.length,
          aircraftDocumentationExpirations: nextSummary.aircraftDocumentationExpirations.length,
          birthdays: nextSummary.birthdays.length,
        });

        setSummary(nextSummary);
      })
      .catch((err) => setSummary({ error: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const isError = (s: SummaryState): s is { error: string } => s !== null && "error" in s;
  const isData = (s: SummaryState): s is DashboardData => s !== null && !("error" in s);

  const isPrivilegedUser = hasRole("ADMIN") || hasRole("MANAGER");

  const expirationsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarDayDetails>();
    if (!isData(summary)) {
      return grouped;
    }

    summary.certificateExpirations.forEach((entry) => {
      const dateKey = normalizeDateKey(entry.expireDate);
      if (!dateKey) {
        return;
      }

      const current = grouped.get(dateKey) ?? { certificates: [], aircraftDocumentation: [], birthdays: [] };
      current.certificates.push(entry);
      grouped.set(dateKey, current);
    });

    if (isPrivilegedUser) {
      summary.aircraftDocumentationExpirations.forEach((entry) => {
        const dateKey = normalizeDateKey(entry.expireDate);
        if (!dateKey) {
          return;
        }

        const current = grouped.get(dateKey) ?? { certificates: [], aircraftDocumentation: [], birthdays: [] };
        current.aircraftDocumentation.push(entry);
        grouped.set(dateKey, current);
      });
    }

    [0, 1, 2, 3].forEach((offset) => {
      const monthDate = addMonth(baseDate, offset);
      const year = monthDate.getFullYear();
      const month = `${monthDate.getMonth() + 1}`.padStart(2, "0");

      summary.birthdays.forEach((entry) => {
        const monthDay = getBirthdayMonthDay(entry.birthDate);
        if (!monthDay || monthDay.slice(0, 2) !== month) {
          return;
        }

        const key = `${year}-${month}-${monthDay.slice(3, 5)}`;
        const current = grouped.get(key) ?? { certificates: [], aircraftDocumentation: [], birthdays: [] };
        current.birthdays.push(entry);
        grouped.set(key, current);
      });
    });

    return grouped;
  }, [baseDate, isPrivilegedUser, summary]);

  useEffect(() => {
    if (!isData(summary)) {
      console.log("[Dashboard] no summary data available yet", summary);
      return;
    }

    console.log("[Dashboard] role visibility", {
      username,
      isPrivilegedUser,
      certificateExpirations: summary.certificateExpirations,
      aircraftDocumentationExpirations: summary.aircraftDocumentationExpirations,
      birthdays: summary.birthdays,
    });

    console.log(
      "[Dashboard] grouped date keys",
      Array.from(expirationsByDate.entries()).map(([date, details]) => ({
        date,
        certificates: details.certificates.length,
        aircraftDocumentation: details.aircraftDocumentation.length,
        birthdays: details.birthdays.length,
      }))
    );
  }, [expirationsByDate, isPrivilegedUser, summary, username]);

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const frame = requestAnimationFrame(() => {
      monthRefs.current.forEach((container) => {
        if (!container) {
          return;
        }

        expirationsByDate.forEach((details, key) => {
          const markerClass = markerClassForDate(key);
          container.querySelectorAll<HTMLElement>(`.${markerClass}`).forEach((node) => {
            const handleEnter = (event: MouseEvent | FocusEvent) => {
              const target = event.currentTarget as HTMLElement;
              const rect = target.getBoundingClientRect();
              setTooltip({
                x: rect.left + rect.width / 2,
                y: rect.top - 12,
                details,
              });
            };

            const handleMove = (event: MouseEvent) => {
              setTooltip((current) => {
                if (!current || current.details !== details) {
                  return current;
                }
                return {
                  ...current,
                  x: event.clientX,
                  y: event.clientY - 16,
                };
              });
            };

            const handleLeave = () => setTooltip((current) => (current?.details === details ? null : current));

            node.addEventListener("mouseenter", handleEnter);
            node.addEventListener("mousemove", handleMove);
            node.addEventListener("mouseleave", handleLeave);
            node.addEventListener("focus", handleEnter);
            node.addEventListener("blur", handleLeave);
            cleanups.push(() => {
              node.removeEventListener("mouseenter", handleEnter);
              node.removeEventListener("mousemove", handleMove);
              node.removeEventListener("mouseleave", handleLeave);
              node.removeEventListener("focus", handleEnter);
              node.removeEventListener("blur", handleLeave);
            });
          });
        });
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [expirationsByDate]);

  return (
    <main
      style={{
        background: "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <style>
        {`
          .dg-dashboard-calendar .dg-expiry-marker {
            font-weight: 700;
            border-radius: 999px;
            cursor: help;
          }

          .dg-dashboard-calendar .dg-expiry-marker-certificate {
            background: #fef2f2;
            box-shadow: inset 0 0 0 1px #fca5a5;
            color: #b91c1c;
          }

          .dg-dashboard-calendar .dg-expiry-marker-certificate:hover {
            background: #fee2e2;
            box-shadow: inset 0 0 0 1px #ef4444;
          }

          .dg-dashboard-calendar .dg-expiry-marker-certificate:not(.dg-expiry-marker-admin) {
            background: #fff7ed;
            box-shadow: inset 0 0 0 1px #fdba74;
            color: #c2410c;
          }

          .dg-dashboard-calendar .dg-expiry-marker-certificate:not(.dg-expiry-marker-admin):hover {
            background: #ffedd5;
            box-shadow: inset 0 0 0 1px #f97316;
          }

          .dg-dashboard-calendar .dg-expiry-marker-aircraft {
            background: #eff6ff;
            box-shadow: inset 0 0 0 1px #93c5fd;
            color: #1d4ed8;
          }

          .dg-dashboard-calendar .dg-expiry-marker-aircraft:hover {
            background: #dbeafe;
            box-shadow: inset 0 0 0 1px #3b82f6;
          }

          .dg-dashboard-calendar .dg-expiry-marker-mixed {
            background: linear-gradient(135deg, #fee2e2 0%, #fee2e2 48%, #dbeafe 52%, #dbeafe 100%);
            box-shadow: inset 0 0 0 1px #c084fc;
            color: #312e81;
          }

          .dg-dashboard-calendar .dg-expiry-marker-birthday {
            background: #fefce8;
            box-shadow: inset 0 0 0 1px #facc15;
            color: #a16207;
          }

          .dg-dashboard-calendar .dg-expiry-marker-birthday:hover {
            background: #fef9c3;
            box-shadow: inset 0 0 0 1px #eab308;
          }
        `}
      </style>

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
                <StatCard icon="bi-people-fill" value={summary.totalUsuarios} label="Usuarios Registrados" color="blue" delay={0} />
                <StatCard icon="bi-person-badge-fill" value={summary.totalPilotos} label="Pilotos Activos" color="red" delay={100} />
                <StatCard icon="bi-clipboard-check" value={summary.totalOperaciones} label="Operaciones Totales" color="orange" delay={200} />
                <StatCard icon="bi-airplane-engines-fill" value={summary.totalDrones} label="Drones en Flota" color="purple" delay={300} />
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "16px", backgroundColor: "white" }}>
          <div className="d-flex align-items-center gap-2 mb-4">
            <div style={{ width: "4px", height: "24px", backgroundColor: "#8B5CF6", borderRadius: "2px" }} />
            <h5 className="mb-0 fw-semibold" style={{ color: "#111827", fontSize: "1.125rem" }}>
              Calendario de planificación
            </h5>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              justifyContent: "center",
              padding: "10px",
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((offset) => {
              const currentMonth = addMonth(baseDate, offset);

              return (
                <div
                  key={offset}
                  ref={(node) => {
                    monthRefs.current[offset] = node;
                  }}
                  className="dg-dashboard-calendar"
                  style={{
                    flex: "1 1 300px",
                    maxWidth: "350px",
                    border: "1px solid #F3F4F6",
                    borderRadius: "12px",
                    padding: "15px",
                    backgroundColor: "#fff",
                  }}
                >
                  <p className="text-muted small fw-bold mb-2">{getMonthLabel(currentMonth)}</p>
                  <Month
                    current={currentMonth}
                    markers={(date) => {
                      const key = toDateKey(date);
                      const markerClass = getMarkerClassName(expirationsByDate.get(key));
                      if (!markerClass) {
                        return "";
                      }
                      const adminClass = isPrivilegedUser && expirationsByDate.get(key)?.certificates.length ? " dg-expiry-marker-admin" : "";
                      return `${markerClass}${adminClass} ${markerClassForDate(key)}`;
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            zIndex: 2000,
            width: "min(360px, calc(100vw - 24px))",
            pointerEvents: "none",
          }}
        >
          <div
            className="card border-0 shadow-lg"
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 24px 50px rgba(15, 23, 42, 0.18)",
            }}
          >
            {tooltip.details.certificates.length > 0 && (
              <div style={{ padding: "14px 16px", borderBottom: tooltip.details.aircraftDocumentation.length > 0 ? "1px solid #E5E7EB" : "none" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="fw-semibold" style={{ color: "#991B1B" }}>
                    Expiración de certificado de usuario
                  </span>
                </div>
                <div className="d-flex flex-column gap-2">
                  {tooltip.details.certificates.map((entry, index) => (
                    <div
                      key={`${entry.username}-${entry.expireDate}-${entry.certificateType ?? index}-${index}`}
                      style={{
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FECACA",
                        borderRadius: "12px",
                        padding: "10px 12px",
                      }}
                    >
                      <div className="fw-semibold" style={{ color: "#111827" }}>
                        {entry.firstName} {entry.lastName}
                      </div>
                      <div className="small" style={{ color: "#6B7280" }}>
                        @{entry.username}
                      </div>
                      {/* <div className="small mt-2" style={{ color: "#991B1B" }}>
                        <strong>Nombre:</strong> {formatCertificateTitle(entry)}
                      </div> */}
                      <div className="small" style={{ color: "#991B1B" }}>
                        <strong>Categoría:</strong> {formatCertificateCategory(entry)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tooltip.details.aircraftDocumentation.length > 0 && (
              <div style={{ padding: "14px 16px" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="fw-semibold" style={{ color: "#1D4ED8" }}>
                    Expiración de documentación de aeronaves
                  </span>
                </div>
                <div className="d-flex flex-column gap-2">
                  {tooltip.details.aircraftDocumentation.map((entry, index) => (
                    <div
                      key={`${entry.serialNumber ?? "aircraft"}-${entry.expireDate}-${entry.documentationType ?? index}-${index}`}
                      style={{
                        backgroundColor: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        borderRadius: "12px",
                        padding: "10px 12px",
                      }}
                    >
                      <div className="fw-semibold" style={{ color: "#111827" }}>
                        {formatAircraftName(entry) || "Aeronave"}
                      </div>
                      <div className="small" style={{ color: "#6B7280" }}>
                        Serie: {entry.serialNumber || "Sin serie"}
                      </div>
                      <div className="small mt-2" style={{ color: "#1D4ED8" }}>
                        <strong>Documentación:</strong> {entry.documentationType || "Seguro de responsabilidad civil"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tooltip.details.birthdays.length > 0 && (
              <div style={{ padding: "14px 16px", borderTop: tooltip.details.certificates.length > 0 || tooltip.details.aircraftDocumentation.length > 0 ? "1px solid #E5E7EB" : "none" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="fw-semibold" style={{ color: "#A16207" }}>
                    Cumpleaños
                  </span>
                </div>
                <div className="d-flex flex-column gap-2">
                  {tooltip.details.birthdays.map((entry, index) => (
                    <div
                      key={`${entry.username}-${entry.birthDate}-${index}`}
                      style={{
                        backgroundColor: "#FEFCE8",
                        border: "1px solid #FDE047",
                        borderRadius: "12px",
                        padding: "10px 12px",
                      }}
                    >
                      <div className="fw-semibold" style={{ color: "#111827" }}>
                        {entry.firstName} {entry.lastName}
                      </div>
                      <div className="small" style={{ color: "#6B7280" }}>
                        @{entry.username}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
