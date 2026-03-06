import { useEffect, useState } from "react";

type Pilot = {
  id: number;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  operatorId: number;
};

export default function PilotsView() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/pilots")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar pilotos");
        return res.json();
      })
      .then(setPilots)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando pilotos...</p>;

  return (
    <div>
      <h2>Lista de Pilotos</h2>
      <ul>
        {pilots.map((p) => (
          <li key={p.id}>
            {p.firstName} {p.lastName} — Licencia: {p.licenseNumber}
          </li>
        ))}
      </ul>
    </div>
  );
}