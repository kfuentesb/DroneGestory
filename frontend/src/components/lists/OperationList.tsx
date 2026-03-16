import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import ButtonProp from "../commons/props/ButtonProp";
import { ReusableTable } from "../commons/props/ReusableTable";

import DronePlusIcon from "../../assets/drone_plus_white.svg";

type Operation = {
  id: number;
  // Obligatorios
  operation: string;     // Sólo si ApplicantType es Manufacturer o To_the_Manufacturer
}

export default function OperationList() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [search, setSearch] = useState("");
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);
  const navigate = useNavigate();


  useEffect(() => {
    const loadAircrafts = async () => {
      try {
        const res = await apiFetch("http://localhost:8080/api/auth/operations", {
          headers: { "Content-Type": "application/json" }
        });

        if (!res) return; // happens if redirected (403/404)

        const data = await res.json();
        setOperations(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadAircrafts();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredOperations(operations);
    } else {
      setFilteredOperations(
        operations.filter((o) =>
          o.operation.toLowerCase().includes(search.trim().toLowerCase())
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

          {/* Barra búsqueda + Añadir aeronave */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* Input de búsqueda */}
            <SearchBar value={search} placeholder="Buscar por operacion..." onChange={setSearch} />

            {/* Botón añadir aeronave */}
            <ButtonProp onClick={() => navigate("/auth/register-operation")}>
              <img src={DronePlusIcon} style={{width: "40px", height:"40px"}}/>
            </ButtonProp>
          </div>

          <ReusableTable
            headers={[
              "Id",
              "Operación",
            ]}
            rows={filteredOperations}
            renderRow={(o) => (
              <>
                <td>{o.id}</td>
                <td>{o.operation}</td>
              </>
            )}
            onRowClick={(o) => navigate(`/auth/aircrafts/${o.id}`)}
            emptyText="No hay aeronaves registradas."
          />
          <p className="text-muted mt-3 mb-0" style={{ color: "#6B7280" }}></p>
        </div>
      </div>
    </div>
  );
}