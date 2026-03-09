import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header>
      <nav
        className="navbar navbar-expand-lg w-100 shadow-sm"
        style={{ backgroundColor: "#F3F4F6" }}
      >
        <div className="container-fluid">
          <NavLink className="navbar-brand fw-bold" to="/home" style={{ color: "#1E1E1E" }}>
            Drone Gestor
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/auth/dashboard">
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/auth/users">
                  Usuarios
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/auth/pilots">
                  Pilotos
                </NavLink>
              </li>
            </ul>
            <NavLink className="nav-link" to="/auth/login">
              <button
                className="btn px-4"
                style={{
                  backgroundColor: "#2F8F5B",
                  color: "white",
                  borderRadius: "6px",
                }}
                type="button"
              >
                Acceder
              </button>
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;