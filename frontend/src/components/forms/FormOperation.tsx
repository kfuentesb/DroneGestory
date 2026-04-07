import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { apiFetch, API_BASE_URL } from "../../api";
import BaseForm, { type FieldConfig } from "../commons/MultiStepForm/BaseForm";

const createOperationFields: FieldConfig[] = [
  { name: "nombreOperacion", label: "Nombre de la operación", type: "text", required: true },
];

export default function FormOperation() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Opciones visuales y seleccionados
  const [usersOptions, setUsersOptions] = useState<any[]>([]);
  const [aircraftsOptions, setAircraftsOptions] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [selectedAircrafts, setSelectedAircrafts] = useState<any[]>([]);

  // Fetch usuarios y drones (solo visual)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/users`);
        const data = await res.json();
        setUsersOptions(
          data.map((u: any) => ({
            value: u.id,
            label: `${u.firstName || u.nombre || ""} ${u.lastName || u.apellidos || ""} (${u.username || u.nombreUsuario || "-"})`
          }))
        );
      } catch {
        setUsersOptions([]);
      }
    };
    const fetchAircrafts = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/aircraft`);
        const data = await res.json();
        setAircraftsOptions(
          data.map((a: any) => ({
            value: a.id,
            label: `${a.manufacturer || a.fabricante || ""} ${a.model || a.modelo || ""} (SN: ${a.serialNumber || a.numeroSerie || "-"})`
          }))
        );
      } catch {
        setAircraftsOptions([]);
      }
    };
    fetchUsers();
    fetchAircrafts();
  }, []);

  // Solo se envía el nombre de la operación
  const handleCreateOperation = async (data: { nombreOperacion: string }) => {
    setSubmitting(true);
    setError(null);

    try {
      const created = await apiFetch(`${API_BASE_URL}/api/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreOperacion: data.nombreOperacion.trim() })
      }).then(r => r.json());

      if (!created) {
        setError("No se pudo crear la operación.");
        return;
      }

      navigate(`/operations/${created.idOperacion || created.id}`);
    } catch (err) {
      console.error("Error creando operación:", err);
      setError("No se pudo crear la operación.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-4">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex justify-content-center align-items-center">
        <div className="card shadow p-4" style={{ maxWidth: 500, width: "100%" }}>
          <h3 className="mb-3 text-center">Registrar operación</h3>
          <p className="text-muted text-center">
            La operación se crea primero y los anexos se gestionan después desde su detalle específico.
          </p>
          <BaseForm
            fields={createOperationFields}
            onSubmit={handleCreateOperation}
            showGuardarButton={false}
            submitButtonText={submitting ? "Creando..." : "Crear operación"}
          />

          <div className="mt-4">
            <label className="form-label fw-bold">Seleccionar usuarios implicados</label>
            <Select
              options={usersOptions}
              isMulti
              placeholder="Buscar y seleccionar usuarios..."
              value={selectedUsers}
              onChange={vals => setSelectedUsers(vals as any[])}
              isLoading={usersOptions.length === 0}
              styles={{
                menu: base => ({ ...base, zIndex: 9999 }),
                control: base => ({ ...base, backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" })
              }}
            />
          </div>

          <div className="mt-4">
            <label className="form-label fw-bold">Seleccionar drones implicados</label>
            <Select
              options={aircraftsOptions}
              isMulti
              placeholder="Buscar y seleccionar drones..."
              value={selectedAircrafts}
              onChange={vals => setSelectedAircrafts(vals as any[])}
              isLoading={aircraftsOptions.length === 0}
              styles={{
                menu: base => ({ ...base, zIndex: 9999 }),
                control: base => ({ ...base, backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" })
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}