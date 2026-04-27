interface DashboardHeaderProps {
  username?: string | null;
  navigate: any;
}

export default function DashboardHeader({ username, navigate }: DashboardHeaderProps) {
  return (
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
                  style={{ color: "#3B82F6", fontWeight: 500 }}>
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
              {username ?
                <>Bienvenido de nuevo, <span style={{ color: "#3B82F6", fontWeight: 600 }}>{username}</span></>
                : "Bienvenido al sistema de gestión"}
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-light border d-flex align-items-center gap-2"
              style={{ borderRadius: "10px", padding: "0.625rem 1rem" }}>
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
                    onClick={() => navigate("/operations")}
            >
              <i className="bi bi-plus-lg" />
              <span>Ver Operaciones</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
