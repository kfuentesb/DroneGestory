import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

function Navbar() {
  const navigate = useNavigate();
  const { logout, username } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };
  

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
            {username ? (
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/auth/users">
                    Usuarios
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/auth/aircraft">
                    Aeronaves
                  </NavLink>
                </li>
              </ul>

              ):(<ul className="navbar-nav me-auto"></ul>)
            }
            {!username ? (
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
            ):(
            <button className="btn px-4"
                style={{
                  backgroundColor: "#F44  ",
                  color: "white",
                  borderRadius: "6px",
                }}
                type="button"
                onClick={handleLogout}>
                  Cerrar Sesión
                </button>
                )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
