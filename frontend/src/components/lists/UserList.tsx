import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { ReusableTable } from "../commons/props/ReusableTable";

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
  const [search, setSearch] = useState("");

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
            <SearchBar value={search} placeholder="Buscar por usuario..." onChange={setSearch} />

            {/* Botón añadir aeronave */}
            <ButtonProp onClick={() => navigate("/auth/register-user")}>
              + Añadir usuario
            </ButtonProp>
          </div>

          <ReusableTable
            headers={["Nombre", "Usuario", "Email", "Teléfono", "Tipo"]}
            rows={users}
            renderRow={(p) => (
              <>
                <td>{p.firstName} {p.lastName}</td>
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
              </>
            )}
            onRowClick={(p) => navigate(`/auth/users/${p.id}`)}
          />

          <p className="text-muted mt-3 mb-0" style={{ color: "#6B7280" }}></p>
        </div>
      </div>
    </div>
  );
}
