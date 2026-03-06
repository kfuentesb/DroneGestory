import { useEffect, useState } from "react";

type Operation = {
  id: number;
  id_piloto: number;
  id_aeronave: number;
  fecha_realizacion: string;
  estado: string;
  categoria: string;
};

export default function OperationsView() {
  const [operation, setOperation] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/operation")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar operaciones");
        return res.json();
      })
      .then(setOperation)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando operaciones...</p>;

  return (
    <div>
      <h2>Lista de Operaciones</h2>
      <ul>
        {operation.map((o) => (
          <li key={o.id}>
            {o.id} - {o.id_piloto} - {o.id_aeronave} — {o.fecha_realizacion} - {o.estado} - {o.categoria}
          </li>
        ))}
      </ul>
    </div>
  );
}