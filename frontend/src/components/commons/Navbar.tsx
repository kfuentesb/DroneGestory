import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import LoginIcon from "../../assets/login_white.svg";
import LogoutIcon from "../../assets/logout_white.svg";

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
        style={{ backgroundColor: "#36a269" }}
      >
        <div className="container-fluid">
          <NavLink
            className="navbar-brand fw-bold"
            to="/home"
            style={{ color: "white" }}
          >
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
                  <NavLink className="nav-link text-white" to="/auth/users">
                    Usuarios
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-white" to="/auth/aircrafts">
                    Aeronaves
                  </NavLink>
                </li>
              </ul>
            ) : (
              <ul className="navbar-nav me-auto"></ul>
            )}

            {!username ? (
              <NavLink className="nav-link" to="/auth/login">
                <button
                  className="btn px-4"
                  style={{
                    backgroundColor: "#1F6B43",
                    color: "white",
                    borderRadius: "6px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                  }}
                  type="button"
                >
                  <img src={LoginIcon} alt="Edit" className="edit-icon" />
                </button>
              </NavLink>
            ) : (
              <button
                className="btn px-4"
                style={{
                  backgroundColor: "#F44C4C", // red logout button
                  color: "white",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                }}
                type="button"
                onClick={handleLogout}
              >
                  <img src={LogoutIcon} alt="Edit" className="edit-icon" />
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
