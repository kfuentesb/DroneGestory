import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";

  type User = {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber: number;
    type: string;
  };

  export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const navigate = useNavigate();

    // console.log("UserList MOUNTED"); TESTING

    useEffect(() => {
      const loadUsers = async () => {
        try {
          const res = await apiFetch("http://localhost:8080/api/auth/users", {
            headers: { "Content-Type": "application/json" }
          });
          //console.log("Respuesta a /api/auth/users:", res); TESTING

          if (!res) return; // happens if redirected (403/404)

          const data = await res.json();
          setUsers(data);
        } catch (err) {
          console.error(err);
        }
      };
      loadUsers();
    }, []);

  const typeColors: Record<string, { backgroundColor: string; color: string }> = {
    ADMIN: {
      backgroundColor: "#FEE2E2",
      color: "#991B1B",
    },
    MANAGER: {
      backgroundColor: "#E0F2FE",
      color: "#075985",
    },
    PILOT: {
      backgroundColor: "#E6F4EC",
      color: "#1F6B43",
    },
  };

  return (
    <div className="container py-4">
      <div
        className="card shadow-sm"
        style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
      >
        <div className="card-body">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Usuarios registrados
          </h2>

          {/* Barra búsqueda + Añadir usuario */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Input de búsqueda */}
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por usuario..."
              style={{
                backgroundColor: "#F3F4F6",
                borderColor: "#D1D5DB",
                maxWidth: 400,
              }}
            />

            <button
              className="btn"
              style={{
                backgroundColor: "#2F8F5B",
                color: "#FFFFFF",
                fontWeight: "bold",
                minWidth: "135px",
              }}
              onClick={() => navigate("/auth/register-user")}
            >
              + Añadir usuario
            </button>
          </div>

          <div className="table-responsive">
            <table
              className="table table-hover align-middle"
              style={{ borderColor: "#E5E7EB" }}
            >
              <thead className="table-dark"
              >
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {users.map((p) => (
                  <tr
                    key={p.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/auth/users/${p.id}`)}
                  >
                    <td>
                      {p.firstName} {p.lastName}
                    </td>
                    <td>{p.username}</td>
                    <td>{p.email}</td>
                    <td>
                      {p.phoneNumber
                        .toString()
                        .replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4")}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={
                          typeColors[p.type] || {
                            backgroundColor: "#E5E7EB",
                            color: "#374151",
                          }
                        }
                      >
                        {p.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-muted mt-3 mb-0" style={{ color: "#6B7280" }}></p>
        </div>
      </div>
    </div>
  );
}
