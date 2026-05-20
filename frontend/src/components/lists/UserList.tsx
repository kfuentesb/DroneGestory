import { useEffect, useState } from "react";
import { apiFetch, API_BASE_URL } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import Pagination from "../commons/props/Pagination";
import LoadingSpinner from "../commons/Loading";
import { useAuth } from "../commons/hooks/useAuth";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber: number | null;
  roles: string[];
};

const roleColors: Record<string, { backgroundColor: string; color: string }> = {
  ADMIN: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  MANAGER: {
    backgroundColor: "#E0F2FE",
    color: "#075985",
  },
  MAINTAINER: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  PILOT: {
    backgroundColor: "#E6F4EC",
    color: "#1F6B43",
  },
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canOpenUserDetail = hasRole("ADMIN") || hasRole("MANAGER");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/users`, {
          headers: { "Content-Type": "application/json" }
        });

        if (!res) return; // happens if redirected (403/404)

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = useSearchFilter(users, search, (u) => [
    `${u.firstName} ${u.lastName}`,
    u.username,
    u.email,
    u.phoneNumber ?? "",
    ...u.roles,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, users.length]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  }

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const userHeaders: TableHeader[] = [
    { label: "Nombre", key: "firstName", sortable: true },
    { label: "Usuario", key: "username", sortable: true },
    { label: "Email", key: "email", sortable: true },
    { label: "Teléfono", key: "phoneNumber", sortable: true },
    { label: "Roles", key: "roles", sortable: false },
  ];

  return (
    <div className="container py-4 px-2 px-md-3">
      <div
        className="card shadow-sm"
        style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
      >
        <div className="card-body p-3 p-md-4">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E", fontSize: "calc(1.3rem + 0.6vw)" }}>
            Usuarios registrados
          </h2>

          {/* Barra búsqueda adaptable */}
          <div className="mb-4">
            <SearchBar value={search} placeholder="Buscar por usuario..." onChange={setSearch} />
          </div>

          <Pagination
            totalItems={filteredUsers.length}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />

          {/* --- VISTA DESKTOP: Tabla para pantallas medianas y grandes --- */}
          <div className="d-none d-md-block">
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
                    <div className="d-flex flex-wrap justify-content-center gap-1">
                      {p.roles.map((role) => (
                        <span
                          key={`${p.id}-${role}`}
                          className="badge"
                          style={
                            roleColors[role] || {
                              backgroundColor: "#E5E7EB",
                              color: "#374151",
                            }
                          }
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                </>
              )}
              onRowClick={canOpenUserDetail ? (p) => navigate(`/users/${p.id}`) : undefined}
              emptyText="No hay usuarios registrados."
            />
          </div>

          {/* --- VISTA MÓVIL: Tarjetas apiladas para pantallas pequeñas --- */}
          <div className="d-block d-md-none">
            {paginatedUsers.length === 0 ? (
              <div className="text-center text-muted py-4">No hay usuarios registrados.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {paginatedUsers.map((p) => (
                  <div
                    key={p.id}
                    onClick={canOpenUserDetail ? () => navigate(`/users/${p.id}`) : undefined}
                    className="p-3 border rounded shadow-sm bg-white"
                    style={{
                      cursor: canOpenUserDetail ? "pointer" : "default",
                      borderColor: "#E5E7EB",
                    }}
                  >
                    {/* Cabecera Tarjeta: Nombre y Roles */}
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <div>
                        <strong style={{ fontSize: "1.05rem", color: "#1E1E1E" }}>
                          {p.firstName} {p.lastName}
                        </strong>
                        <div className="text-muted small">@{p.username}</div>
                      </div>
                      
                      {/* Roles alineados a la derecha */}
                      <div className="d-flex flex-column align-items-end gap-1">
                        {p.roles.map((role) => (
                          <span
                            key={`${p.id}-mobile-${role}`}
                            className="badge"
                            style={
                              roleColors[role] || {
                                backgroundColor: "#E5E7EB",
                                color: "#374151",
                              }
                            }
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    <hr className="my-2 text-muted opacity-25" />

                    {/* Información de contacto */}
                    <div className="small" style={{ color: "#4B5563" }}>
                      <div className="d-flex mb-1">
                        <span className="text-muted me-2" style={{ minWidth: "60px" }}>Email:</span>
                        <span className="text-break">{p.email}</span>
                      </div>
                      <div className="d-flex">
                        <span className="text-muted me-2" style={{ minWidth: "60px" }}>Teléfono:</span>
                        <span>
                          {p.phoneNumber
                            ? p.phoneNumber
                                .toString()
                                .replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4")
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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