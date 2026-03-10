import { useState } from "react";

type Pilot = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  phone: number;
  image: string;
};

export default function PilotsLits() {
  const [pilots] = useState<Pilot[]>([
    {
      id: 1,
      firstName: "Ana",
      lastName: "Torres",
      password: "1234",
      username: "atorres",
      email: "ana@demo.com",
      phone: 123456789,
      image: "enlace"
    },
    {
      id: 2,
      firstName: "Luis",
      lastName: "Martín",
      password: "12345",
      username: "lmartin",
      email: "luis@demo.com",
      phone: 987654321,
      image: "enlace"
    },
  ]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <div>
            <h2 className="card-title mb-4">Lista de Pilotos</h2>
          </div>

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
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Contraseña</th>
                  <th>Teléfono</th>
                  <th>Imagen</th>
                </tr>
              </thead>
              <tbody>
                {pilots.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      {p.firstName} {p.lastName}
                    </td>
                    <td>{p.username}</td>
                    <td>{p.email}</td>
                    <td>{p.password}</td>
                    <td>{p.phone}</td>
                    <td>{p.image}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-muted mt-3 mb-0">
          </p>
        </div>
      </div>
    </div>
  );
}