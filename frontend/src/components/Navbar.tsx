import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header>
      <nav
        className="navbar navbar-expand-lg w-100"
        style={{ backgroundColor: "#55d77a" }}
      >
        <div className="container-fluid">
          <NavLink className="navbar-brand" to="/home">
            Drone Gestory
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
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink className="nav-link" to="/home">
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/auth/login">
                  Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/auth/pilots">
                  Pilotos
                </NavLink>
              </li>
            </ul>
            <button className="btn btn-outline-success me-2" type="button">Main button</button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;