// Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "./commons/hooks/useAuth";
import { apiFetch } from "../api";

// Tipos
interface DashboardData {
  totalUsuarios: number;
  totalPilotos: number;
  totalOperaciones: number;
  totalDrones: number;
}

type SummaryState = DashboardData | { error: string } | null;

// Componente de tarjeta de estadística
interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  color: "blue" | "green" | "orange" | "purple";
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorStyles = {
    blue: { bg: "#3B82F6", gradient: "from-blue-500 to-blue-600", light: "#DBEAFE" },
    green: { bg: "#10B981", gradient: "from-emerald-500 to-emerald-600", light: "#D1FAE5" },
    orange: { bg: "#F59E0B", gradient: "from-amber-500 to-orange-500", light: "#FEF3C7" },
    purple: { bg: "#8B5CF6", gradient: "from-violet-500 to-purple-600", light: "#EDE9FE" },
  };

  const style = colorStyles[color];

  return (
    <div 
      className={`col-md-6 col-lg-3 transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div 
        className="card border-0 shadow-sm h-100 overflow-hidden position-relative"
        style={{ 
          borderRadius: "16px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          cursor: "pointer"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        {/* Barra de color superior */}
        <div 
          className={`w-100 bg-gradient-to-r ${style.gradient}`}
          style={{ height: "4px" }}
        />
        
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div 
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ 
                width: "56px", 
                height: "56px", 
                backgroundColor: style.light,
                transition: "transform 0.2s ease"
              }}
            >
              <i 
                className={`bi ${icon}`} 
                style={{ 
                  fontSize: "28px", 
                  color: style.bg,
                  transition: "transform 0.2s ease"
                }}
              />
            </div>
            <span 
              className="badge rounded-pill"
              style={{ 
                backgroundColor: style.light, 
                color: style.bg,
                fontSize: "0.75rem",
                fontWeight: 600
              }}
            >
              Total
            </span>
          </div>
          
          <h2 
            className="mb-1 fw-bold"
            style={{ fontSize: "2.25rem", color: "#1F2937", letterSpacing: "-0.025em" }}
          >
            {value.toLocaleString()}
          </h2>
          
          <p className="mb-0" style={{ color: "#6B7280", fontSize: "0.95rem", fontWeight: 500 }}>
            {label}
          </p>
        </div>
        
        {/* Decoración sutil de fondo */}
        <div 
          className="position-absolute"
          style={{
            right: "-20px",
            bottom: "-20px",
            width: "100px",
            height: "100px",
            backgroundColor: style.light,
            borderRadius: "50%",
            opacity: 0.3,
            pointerEvents: "none"
          }}
        />
      </div>
    </div>
  );
};

// Skeleton loader
const StatCardSkeleton: React.FC<{ delay: number }> = ({ delay }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`col-md-6 col-lg-3 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div 
              className="rounded-3 bg-secondary bg-opacity-25"
              style={{ width: "56px", height: "56px" }}
            />
            <div 
              className="rounded-pill bg-secondary bg-opacity-25"
              style={{ width: "40px", height: "20px" }}
            />
          </div>
          <div 
            className="bg-secondary bg-opacity-25 rounded mb-2"
            style={{ width: "80px", height: "36px" }}
          />
          <div 
            className="bg-secondary bg-opacity-25 rounded"
            style={{ width: "100px", height: "16px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { username } = useAuth();
  const [summary, setSummary] = useState<SummaryState>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("http://localhost:8080/api/auth/dashboard")
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
      {/* Header Mejorado */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <nav aria-label="breadcrumb" className="mb-2">
                <ol className="breadcrumb mb-0" style={{ fontSize: "0.875rem" }}>
                  <li className="breadcrumb-item">
                    <a href="#" className="text-decoration-none" style={{ color: "#6B7280" }}>
                      Inicio
                    </a>
                  </li>
                  <li 
                    className="breadcrumb-item active" 
                    aria-current="page"
                    style={{ color: "#3B82F6", fontWeight: 500 }}
                  >
                    Dashboard
                  </li>
                </ol>
              </nav>
              <h1 
                className="mb-0 fw-bold" 
                style={{ 
                  fontSize: "2rem", 
                  color: "#111827",
                  letterSpacing: "-0.025em"
                }}
              >
                Panel Principal
              </h1>
              <p className="mt-2 mb-0" style={{ color: "#6B7280", fontSize: "1rem" }}>
                {username ? (
                  <>
                    Bienvenido de nuevo, <span style={{ color: "#3B82F6", fontWeight: 600 }}>{username}</span>
                  </>
                ) : (
                  "Bienvenido al sistema de gestión"
                )}
              </p>
            </div>
            
            <div className="d-flex gap-2">
              <button 
                className="btn btn-light border d-flex align-items-center gap-2"
                style={{ borderRadius: "10px", padding: "0.625rem 1rem" }}
              >
                <i className="bi bi-calendar3" style={{ color: "#6B7280" }} />
                <span style={{ color: "#374151", fontSize: "0.875rem", fontWeight: 500 }}>
                  {new Date().toLocaleDateString("es-ES", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </span>
              </button>
              <button 
                className="btn btn-primary d-flex align-items-center gap-2"
                style={{ 
                  borderRadius: "10px", 
                  padding: "0.625rem 1.25rem",
                  backgroundColor: "#3B82F6",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)"
                }}
              >
                <i className="bi bi-plus-lg" />
                <span>Nueva Operación</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Estadísticas */}
      <div className="row g-4 mb-5">
        <div className="col-12">
          <div className="d-flex align-items-center gap-2 mb-4">
            <div 
              style={{ 
                width: "4px", 
                height: "24px", 
                backgroundColor: "#3B82F6", 
                borderRadius: "2px" 
              }}
            />
            <h5 className="mb-0 fw-semibold" style={{ color: "#111827", fontSize: "1.125rem" }}>
              Resumen del Sistema
            </h5>
          </div>
        </div>

        {loading ? (
          // Skeleton loaders
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
                style={{ 
                  backgroundColor: "#DC2626", 
                  color: "white",
                  borderRadius: "8px"
                }}
              >
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
              color="green"
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

      {/* Sección adicional (placeholder para futuras features) */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div 
            className="card border-0 shadow-sm"
            style={{ borderRadius: "16px", minHeight: "300px" }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="mb-0 fw-semibold" style={{ color: "#111827" }}>
                  Actividad Reciente
                </h6>
                <a 
                  href="#" 
                  className="text-decoration-none"
                  style={{ color: "#3B82F6", fontSize: "0.875rem", fontWeight: 500 }}
                >
                  Ver todo
                </a>
              </div>
              <div className="text-center py-5">
                <i 
                  className="bi bi-graph-up-arrow" 
                  style={{ fontSize: "3rem", color: "#D1D5DB" }}
                />
                <p className="mt-3 mb-0" style={{ color: "#9CA3AF" }}>
                  Gráficos de actividad próximamente
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-12 col-lg-4">
          <div 
            className="card border-0 shadow-sm"
            style={{ borderRadius: "16px", minHeight: "300px" }}
          >
            <div className="card-body p-4">
              <h6 className="mb-4 fw-semibold" style={{ color: "#111827" }}>
                Estado del Sistema
              </h6>
              <div className="d-flex flex-column gap-3">
                {[
                  { label: "API Backend", status: "Operativo", color: "#10B981" },
                  { label: "Base de Datos", status: "Conectada", color: "#10B981" },
                  { label: "Servidor de Archivos", status: "Operativo", color: "#10B981" },
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="d-flex align-items-center justify-content-between p-3"
                    style={{ 
                      backgroundColor: "#F9FAFB", 
                      borderRadius: "12px",
                      border: "1px solid #E5E7EB"
                    }}
                  >
                    <span style={{ color: "#374151", fontSize: "0.875rem", fontWeight: 500 }}>
                      {item.label}
                    </span>
                    <div className="d-flex align-items-center gap-2">
                      <div 
                        style={{ 
                          width: "8px", 
                          height: "8px", 
                          borderRadius: "50%", 
                          backgroundColor: item.color,
                          boxShadow: `0 0 0 3px ${item.color}20`
                        }}
                      />
                      <span style={{ color: "#6B7280", fontSize: "0.875rem" }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}