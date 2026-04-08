import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import Pagination from "../commons/props/Pagination";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: number |null;
  type: string;
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const loadUsers = async () => {
      try {
      const res = await apiFetch(`${API_BASE_URL}/api/users`, {
          headers: { "Content-Type": "application/json" }
        });

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

  const filteredUsers = useSearchFilter(users, search, (u) => [
    `${u.firstName} ${u.lastName}`,
    u.username,
    u.email,
    u.phoneNumber ?? "",
    u.type,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, users.length]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const userHeaders: TableHeader[] = [
    { label: "Nombre", key: "firstName", sortable: true },
    { label: "Usuario", key: "username", sortable: true },
    { label: "Email", key: "email", sortable: true },
    { label: "Teléfono", key: "phoneNumber", sortable: true },
    { label: "Tipo", key: "type", sortable: true },
  ];

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
            <ButtonProp onClick={() => navigate("/register-user")}>
              + Añadir usuario
            </ButtonProp>
          </div>

          <ReusableTable
            headers={userHeaders}
            rows={paginatedUsers}
            renderRow={(p) => (
              <>
                <td>{p.firstName} {p.lastName}</td>
                <td>{p.username}</td>
                <td>{p.email}</td>
                <td>
                  {p.phoneNumber
                    ? p.phoneNumber
                        .toString()
                        .replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4")
                    : "-"}
                </td>
                <td className="text-center">
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
                        onRowClick={(p) => navigate(`/users/${p.id}`)}
            emptyText="No hay usuarios registrados."
          />

          <Pagination
            totalItems={filteredUsers.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />

          <p className="text-muted mt-3 mb-0" style={{ color: "#6B7280" }}></p>
        </div>
      </div>
    </div>
  );
}
