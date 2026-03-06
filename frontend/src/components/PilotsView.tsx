import { useEffect, useState } from "react";

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

export default function PilotsView() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [pilotss] = useState<Pilot[]>([
    {
      id: 1,
      firstName: "Ana",
      lastName: "Torres",
      username: "atorres",
      email: "ana@demo.com",
      phone: "600111222",
    },
    {
      id: 2,
      firstName: "Luis",
      lastName: "Martín",
      username: "lmartin",
      email: "luis@demo.com",
      phone: "600333444",
    },
  ]);

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
            {p.id} - {p.firstName} {p.lastName} — {p.username} {p.email} {p.phone}
          </li>
        ))}
      </ul>
    </div>
  );
}