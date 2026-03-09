import { useState } from "react";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  phone: number;
  type: string;
  image: string;
};

export default function UserList() {
  const [users] = useState<User[]>([
    {
      id: 1,
      firstName: "Ana",
      lastName: "Torres",
      password: "1234",
      username: "atorres",
      email: "ana@demo.com",
      phone: 123456789,
      type: "admin",
      image: "enlace",
    },
    {
      id: 2,
      firstName: "Luis",
      lastName: "Martín",
      password: "12345",
      username: "lmartin",
      email: "luis@demo.com",
      phone: 987654321,
      type: "empleado",
      image: "enlace",
    },
  ]);

  return (
    <div className="container py-4">
      <div
        className="card shadow-sm"
        style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
      >
        <div className="card-body">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Lista de Usuarios
          </h2>

          {/* Barra de búsqueda */}
          <div className="d-flex gap-2 mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar usuario..."
              style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
            />
            <button
              className="btn"
              style={{ backgroundColor: "#2F8F5B", color: "#FFFFFF" }}
            >
              Buscar
            </button>
          </div>

          <div className="table-responsive">
            <table
              className="table table-hover align-middle"
              style={{ borderColor: "#E5E7EB" }}
            >
              <thead
                style={{
                  backgroundColor: "#1E1E1E",
                  color: "#FFFFFF",
                }}
              >
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Tipo</th>
                  <th>Imagen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.firstName} {p.lastName}
                    </td>
                    <td>{p.username}</td>
                    <td>{p.email}</td>
                    <td>{p.phone}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: "#E6F4EC",
                          color: "#1F6B43",
                        }}
                      >
                        {p.type}
                      </span>
                    </td>
                    <td>{p.image}</td>
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