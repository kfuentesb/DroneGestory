import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../api";

type UserSummary = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
};

const PASSWORD_POLICY = /^(?=.*\d).{8,}$/;

export default function FormUserPassword() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserSummary | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;

      const res = await apiFetch(`/api/users/${id}`);
      if (!res || !res.ok) return;

      const data = await res.json();
      setUser({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
      });
    };

    loadUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!id) {
      setError("Usuario no válido.");
      return;
    }

    if (!currentPassword.trim()) {
      setError("Debes introducir tu contraseña de sesión.");
      return;
    }

    if (!PASSWORD_POLICY.test(newPassword)) {
      setError("La contraseña debe tener 8 o mas carácteres y al menos 1 número.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(`/api/users/${id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res) return;

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "No se pudo actualizar la contraseña.");
      }

      navigate(`/users/${id}`);
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <div className="card shadow-sm" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
        <div className="card-body">
          <h2 className="mb-3">Modificar contraseña</h2>
          <p className="text-muted mb-4">
            {user
              ? `Usuario: ${user.firstName} ${user.lastName} (@${user.username})`
              : "Cargando usuario..."}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Tu contraseña actual (sesión)</label>
              <input
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Nueva contraseña</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <small className="text-muted">Minimo 8 caracteres y al menos 1 número.</small>
            </div>

            <div className="mb-3">
              <label className="form-label">Confirmar contraseña</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? "Guardando..." : "Actualizar contraseña"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(`/users/${id}`)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
