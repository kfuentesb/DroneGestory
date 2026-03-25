import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import LoginIcon from "../../assets/navbar/login_white.svg";
import LogoutIcon from "../../assets/navbar/logout_white.svg";
import SettingsIcon from "../../assets/navbar/settings_white.svg";
import IdentityIcon from "../../assets/navbar/identity_white.svg";
import DroneToolsIcon from "../../assets/commons/logo_dronetools.svg";

function Navbar() {
  const navigate = useNavigate();
  const { logout, username, role } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg w-100 shadow-sm" style={{ backgroundColor: "#36a269" }}>
        <div className="container-fluid">
          <NavLink className="navbar-brand fw-bold text-white" to="/home">
            <img src={DroneToolsIcon} alt="DroneTools logo" style={{ width: "50px" }}/>{"  "}Drone Gestor
          </NavLink>

          <button
            className="navbar-toggler border-white"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
          >
            <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }} />
          </button>

          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            {/* CONTENEDOR DE BOTONES */}
            <div className="ms-auto d-flex justify-content-center justify-content-lg-end w-100 w-lg-auto">
              {!username ? (
                <NavLink to="/auth/login" className="btn" style={{ backgroundColor: "#1F6B43" }}>
                  <img src={LoginIcon} alt="Login" />
                </NavLink>
              ) : (
                <div className="d-flex gap-3 py-3 py-lg-0">
                  <button className="btn d-flex align-items-center justify-content-center shadow-sm" 
                    style={{ backgroundColor: "#2F8F5B", width: "45px", height: "45px", borderRadius: "8px" }}
                    onClick={() => navigate("/profile/me")}>
                    <img src={IdentityIcon} alt="Profile" style={{ width: "20px" }} />
                  </button>

                  <button className="btn d-flex align-items-center justify-content-center shadow-sm" 
                    style={{ backgroundColor: "#2F8F5B", width: "45px", height: "45px", borderRadius: "8px" }}
                    onClick={() => navigate("/settings")}>
                    <img src={SettingsIcon} alt="Settings" style={{ width: "20px" }} />
                  </button>

                  <button className="btn d-flex align-items-center justify-content-center shadow-sm" 
                    style={{ backgroundColor: "#F44C4C", width: "45px", height: "45px", borderRadius: "8px" }}
                    onClick={handleLogout}>
                    <img src={LogoutIcon} alt="Logout" style={{ width: "20px" }} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;