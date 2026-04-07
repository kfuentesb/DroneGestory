import React, { useEffect, useState } from "react";
import { useAuth } from "../commons/hooks/useAuth";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import StatCard from "../commons/props/StatCard";
import StatCardSkeleton from "../commons/props/StatCardSkeleton";
import DashboardHeader from "./DashboardHeader";

interface DashboardData {
  totalUsuarios: number;
  totalPilotos: number;
  totalOperaciones: number;
  totalDrones: number;
}

type SummaryState = DashboardData | { error: string } | null;

export default function Dashboard() {
  const { username } = useAuth();
  const [summary, setSummary] = useState<SummaryState>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch("/api/auth/dashboard")
      .then((res) => {
        if (!res) return;
        if (!res.ok) throw new Error("Error cargando resumen");
        return res.json();
      })
      .then((data: DashboardData) => setSummary(data))
      .catch((err) => setSummary({ error: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const isError = (s: SummaryState): s is { error: string } => s !== null && "error" in s;
  const isData = (s: SummaryState): s is DashboardData => s !== null && !("error" in s);

  return (
    <main style={{
      background: "linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)",
      minHeight: "100vh",
      padding: "2rem"
    }}>
      {/* Header */}
      <DashboardHeader username={username ?? ""} navigate={navigate} />

      {/* Estadísticas */}
      <section>
        <div className="d-flex align-items-center gap-2 mb-4">
          <div style={{ width: "4px", height: "24px", backgroundColor: "#3B82F6", borderRadius: "2px" }} />
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
              <div className="alert alert-danger border-0 d-flex align-items-center gap-3"
                style={{ borderRadius: "12px", backgroundColor: "#FEE2E2" }}>
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
                  style={{ backgroundColor: "#DC2626", color: "white", borderRadius: "8px" }}>
                  Reintentar
                </button>
              </div>
            </div>
          ) : isData(summary) ? (
            <>
              <StatCard
                icon="bi-people-fill"
                value={summary.totalUsuarios}
                label="Usuarios Registrados"
                color="blue"
                delay={0}
              />
              <StatCard
                icon="bi-person-badge-fill"
                value={summary.totalPilotos}
                label="Pilotos Activos"
                color="red"
                delay={100}
              />
              <StatCard
                icon="bi-clipboard-check"
                value={summary.totalOperaciones}
                label="Operaciones Totales"
                color="orange"
                delay={200}
              />
              <StatCard
                icon="bi-airplane-engines-fill"
                value={summary.totalDrones}
                label="Drones en Flota"
                color="purple"
                delay={300}
              />
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
