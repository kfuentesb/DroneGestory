import { useEffect, useState } from "react";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import SearchBar from "../commons/props/SearchBar";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import { useSearchFilter } from "../commons/hooks/useSearchFilter";
import Pagination from "../commons/props/Pagination";

import LoadingSpinner from "../commons/Loading";

type AircraftFlightHours = {
  id: number;
  manufacturer: string;
  model: string;
  serialNumber?: string;
  lastFlightDate?: string | Date;
  totalMinutes?: number;
};

const formatTotalHours = (minutes?: number | null) => {
  if (minutes == null || Number.isNaN(minutes)) {
    return "0.0h";
  }
  return `${(minutes / 60).toFixed(1)}h`;
};

export default function AircraftFlightTimeList() {
  const [aircraftsFlightHours, setAircraftsFlightHours] = useState<AircraftFlightHours[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const loadAircraftsFlightHours = async () => {
      setIsLoading(true);
      try {
        const [aircraftResult, flightTimeResult] = await Promise.allSettled([
          apiFetch("/api/aircraft"),
          apiFetch("/api/flight-hours")
        ]);

        const aircraftRes =
          aircraftResult.status === "fulfilled" ? aircraftResult.value : null;
        const flightTimeRes =
          flightTimeResult.status === "fulfilled" ? flightTimeResult.value : null;

        const aircraftData = aircraftRes ? await aircraftRes.json() : [];
        const flightTimes = flightTimeRes ? await flightTimeRes.json() : [];

        const latestFlightForAircraft = new Map<number, { lastFlightDate: string; totalMinutes?: number }>();

        if (Array.isArray(flightTimes)) {
          flightTimes.forEach((flight: any) => {
            const aircraftId = Number(flight.aircraftId ?? flight.aircraft_id ?? flight.aircraft?.id);
            if (!aircraftId) return;

            const currentLastFlightDate = flight.flightDate ? new Date(flight.flightDate) : null;
            if (!currentLastFlightDate || Number.isNaN(currentLastFlightDate.getTime())) return;

            const existing = latestFlightForAircraft.get(aircraftId);
            if (!existing || currentLastFlightDate > new Date(existing.lastFlightDate)) {
              latestFlightForAircraft.set(aircraftId, {
                lastFlightDate: currentLastFlightDate.toISOString(),
                totalMinutes: flight.totalFlightTimeMinutes ?? flight.durationMinutes
              });
            }
          });
        }

        const normalizedAircrafts = Array.isArray(aircraftData) ? aircraftData.map((aircraft: any) => {
          const id = Number(aircraft.id ?? aircraft.aircraftId);
          const summary = latestFlightForAircraft.get(id);
          return {
            id,
            manufacturer: aircraft.manufacturer ?? "",
            model: aircraft.model ?? "",
            serialNumber: aircraft.serialNumber,
            lastFlightDate: summary?.lastFlightDate,
            totalMinutes: summary?.totalMinutes ?? aircraft.flightMinutes ?? 0
          };
        }) : [];

        setAircraftsFlightHours(normalizedAircrafts);
      } catch (err) {
        console.error(err);
        setAircraftsFlightHours([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAircraftsFlightHours();
  }, []);

  const filteredAircraftsFlightHours = useSearchFilter(aircraftsFlightHours, search, (a) => [
    a.manufacturer ?? "",
    a.model ?? "",
    a.serialNumber ?? "",
    a.lastFlightDate ? new Date(a.lastFlightDate).toLocaleDateString() : "",
    a.totalMinutes ?? "",
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, aircraftsFlightHours.length]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando horas de vuelo de aeronaves..." />;
  }

  const paginatedAircraftsFlightHours = filteredAircraftsFlightHours.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const modelHeaders: TableHeader[] = [
    { label: "Fabricante", key: "manufacturer", sortable: true },
    { label: "Modelo", key: "model", sortable: true },
    { label: "Nº Serie", key: "serialNumber", sortable: true },
    { label: "Última fecha de vuelo", key: "lastFlightDate", sortable: true },
    { label: "Horas de vuelo totales", key: "totalMinutes", sortable: true },
  ];

  return (
    <div className="container py-4">
      <div
        className="card shadow-sm"
        style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
      >
        <div className="card-body">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Horas de Vuelo de Aeronaves
          </h2>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <ReusableTable
            headers={modelHeaders}
            rows={paginatedAircraftsFlightHours}
            // onRowClick={(m) => navigate(`/models/${m.manufacturer}/${m.model}`)} // Navigates to View B
            renderRow={(a) => (
              <>
                <td>{a.manufacturer || "N/A"}</td>
                <td>{a.model || "N/A"}</td>
                <td>{a.serialNumber ?? "-"}</td>
                <td>{a.lastFlightDate ? new Date(a.lastFlightDate).toLocaleDateString() : "N/A"}</td>
                <td>{formatTotalHours(a.totalMinutes)}</td>
              </>
            )}
            onRowClick={(a) => navigate(`/flight-hours/${a.id}`)}
            emptyText="No hay horas de vuelvo de aeronaves registradas."
          />

          <Pagination
            totalItems={filteredAircraftsFlightHours.length}
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
