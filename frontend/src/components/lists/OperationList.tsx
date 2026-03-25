import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { ReusableTable } from "../commons/props/ReusableTable";

import DronePlusIcon from "../../assets/commons/drone_plus_white.svg";

// Coincide con los campos que tienes en tu backend (Operation.java)
type Operation = {
  idOperacion: number;
  nombreOperacion: string;
};

export default function OperationList() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [search, setSearch] = useState("");
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOperations = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/auth/operations`, {
          headers: { "Content-Type": "application/json" }
        });

        if (!res) return; // happens if redirected (403/404)

        const data = await res.json();
        setOperations(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadOperations();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredOperations(operations);
    } else {
      setFilteredOperations(
        operations.filter((o) =>
          o.nombreOperacion.toLowerCase().includes(search.trim().toLowerCase())
        )
      );
    }
  }, [search, operations]);

  return (
    <div className="container py-4">
      <div
        className="card shadow-sm"
        style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
      >
        <div className="card-body">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Operaciones registradas
          </h2>

          {/* Barra búsqueda + Añadir operación */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Input de búsqueda */}
            <SearchBar value={search} placeholder="Buscar por nombre..." onChange={setSearch} />

            {/* Botón añadir operación */}
            <ButtonProp onClick={() => navigate("/auth/register-operation")}>
              <img src={DronePlusIcon} style={{ width: "40px", height: "40px" }} />
            </ButtonProp>
          </div>

          <ReusableTable
            headers={["Id", "Nombre operación"]}
            rows={filteredOperations}
            renderRow={(o) => (
              <>
                <td>{o.idOperacion}</td>
                <td>{o.nombreOperacion}</td>
              </>
            )}
            onRowClick={(o) => navigate(`/auth/operations/${o.idOperacion}`)}
            emptyText="No hay operaciones registradas."
          />
          <p className="text-muted mt-3 mb-0" style={{ color: "#6B7280" }}></p>
        </div>
      </div>
    </div>
  );
}
