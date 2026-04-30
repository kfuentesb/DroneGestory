import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";
import Pagination from "../commons/props/Pagination";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import LoadingSpinner from "../commons/Loading";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roles: string[];
};

type SentMail = {
  id: number;
  username: string;
  header: string;
  text: string;
  recipientMode: "USERS" | "ROLES" | "BOTH";
  selectedUsernames: string[];
  selectedRoles: string[];
  recipients: string[];
  sentAt: string;
};

const ROLE_OPTIONS = ["MANAGER", "MAINTAINER", "PILOT"];
const ITEMS_PER_PAGE = 8;

export default function MailCenter() {
  const [users, setUsers] = useState<User[]>([]);
  const [sentMails, setSentMails] = useState<SentMail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [header, setHeader] = useState("");
  const [text, setText] = useState("");
  const [showSegmentation, setShowSegmentation] = useState<"SENT_MAILS" | "HISTORY">("SENT_MAILS");
  const [recipientMode, setRecipientMode] = useState<"USERS" | "ROLES">("USERS");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sentMails.length]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, sentMailResponse] = await Promise.all([
        apiFetch("/api/users"),
        apiFetch("/api/sent-mails"),
      ]);

      if (!usersResponse || !sentMailResponse) return;

      setUsers(await usersResponse.json());
      setSentMails(await sentMailResponse.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los datos.");
    } finally {
      setIsLoading(false);
    }
  };

  const previewRecipients = useMemo(() => {
    return users.filter((user) =>
      selectedUserIds.includes(user.id) ||
      user.roles.some((role) => selectedRoles.includes(role))
    );
  }, [selectedRoles, selectedUserIds, users]);

  const paginatedMails = sentMails.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleUser = (userId: number) => {
    setSelectedUserIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((current) =>
      current.includes(role) ? current.filter((item) => item !== role) : [...current, role]
    );
  };

  const resetForm = () => {
    setHeader("");
    setText("");
    setRecipientMode("USERS");
    setSelectedUserIds([]);
    setSelectedRoles([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!header.trim() || !text.trim()) {
      setError("El asunto y el texto son obligatorios.");
      return;
    }

    if (previewRecipients.length === 0) {
      setError("Selecciona al menos un destinatario.");
      return;
    }

    setIsSending(true);
    try {
      const hasUsers = selectedUserIds.length > 0;
      const hasRoles = selectedRoles.length > 0;
      const response = await apiFetch("/api/sent-mails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          header,
          text,
          recipientMode: hasUsers && hasRoles ? "BOTH" : hasUsers ? "USERS" : "ROLES",
          userIds: selectedUserIds,
          roles: selectedRoles,
        }),
      });

      if (!response) return;
      const created = await response.json();
      setSentMails((current) => [created, ...current]);
      setSuccess("Correo enviado y registrado.");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el correo.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Cargando correos..." />;
  }

  const headers: TableHeader[] = [
    { label: "Fecha", key: "sentAt", sortable: true },
    { label: "Remitente", key: "username", sortable: true },
    { label: "Asunto", key: "header", sortable: true },
    { label: "Destino", key: "recipientMode", sortable: false },
    { label: "Destinatarios", key: "recipients", sortable: false },
  ];

  return (
    <div className="container py-4" style={{ maxWidth: "1000px", minHeight: "90vh" }}>
      {/* SELECTOR DE VISTA (TABS) CON DISEÑO MODERNO */}
      <div className="col-12 mb-5">
        <label className="form-label small fw-bold text-uppercase text-muted d-block mb-3 text-center" style={{ letterSpacing: "1px" }}>
          Panel de Control de Mensajería
        </label>
        <small>😞🤷‍♂️De momento no se puede enviar un mismo correo a una persona y a un rol a la vez, y pueden acceder no admins/managers</small>
        <br/>
        <div className="btn-group p-2 bg-white rounded-4 w-100 shadow-sm border" role="group" style={{ height: "60px" }}>
          <button
            type="button"
            className={`btn btn-sm rounded-3 border-0 transition-all d-flex align-items-center justify-content-center gap-2 ${
              showSegmentation === "SENT_MAILS" 
                ? "text-white shadow fw-bold" 
                : "text-muted hover-bg-light"
            }`}
            onClick={() => setShowSegmentation("SENT_MAILS")}
            style={{ 
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              background: showSegmentation === "SENT_MAILS" 
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                : "transparent" 
            }}
          >
            Enviar Correos
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-3 border-0 transition-all d-flex align-items-center justify-content-center gap-2 ${
              showSegmentation === "HISTORY" 
                ? "text-white shadow fw-bold"
                : "text-muted hover-bg-light"
            }`}
            onClick={() => setShowSegmentation("HISTORY")}
            style={{
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              background: showSegmentation === "HISTORY" 
                ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                : "transparent" 
            }}
          >
            Historial
          </button>
        </div>
      </div>

        {showSegmentation === "SENT_MAILS" ? (
          <section className="card border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
            <div className="card-header border-0 pt-4 px-4 text-white" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <h2 className="h4 fw-bold mb-1">Nuevo Mensaje</h2>
              <p className="small mb-3 text-white-50">Crea comunicaciones impactantes para tu equipo</p>
            </div>

            <div className="card-body p-4 bg-light" style={{ backgroundColor: "#f8fafc" }}>
              {error && <div className="alert alert-danger border-0 shadow-sm py-2">{error}</div>}
              {success && <div className="alert alert-success border-0 shadow-sm py-2">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-success text-uppercase">Asunto Principal</label>
                    <input
                      className="form-control form-control-lg border-0 shadow-sm shadow-none-focus"
                      placeholder="¿De qué trata este correo?"
                      value={header}
                      onChange={(e) => setHeader(e.target.value)}
                      style={{ borderRadius: "12px", fontSize: "1.1rem" }}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-success text-uppercase">Cuerpo del Mensaje</label>
                    <textarea
                      className="form-control border-0 shadow-sm shadow-none-focus"
                      rows={6}
                      placeholder="Escribe el contenido aquí..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      style={{ borderRadius: "15px" }}
                    />
                  </div>

                  <div className="col-12">
                    <div className="p-4 rounded-4 shadow-sm" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                      <label className="form-label small fw-bold text-muted text-uppercase d-block mb-3">Público Objetivo</label>
                      <div className="btn-group p-1 bg-light rounded-pill w-100 mb-4" role="group">
                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill border-0 py-2 ${recipientMode === "USERS" ? "bg-success text-white shadow-sm" : "text-muted"}`}
                          onClick={() => setRecipientMode("USERS")}
                        >
                          Usuarios Seleccionados
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm rounded-pill border-0 py-2 ${recipientMode === "ROLES" ? "bg-success text-white shadow-sm" : "text-muted"}`}
                          onClick={() => setRecipientMode("ROLES")}
                        >
                          Filtrar por Roles
                        </button>
                      </div>

                      {recipientMode === "USERS" ? (
                        <div className="border-0 rounded-3 scrollbar-custom" style={{ maxHeight: "200px", overflowY: "auto" }}>
                          {users.map((user) => (
                            <label key={user.id} className="d-flex align-items-center gap-3 px-3 py-2 mb-2 rounded-3 hover-bg-success-light transition-all" style={{ cursor: "pointer", border: "1px solid #f1f5f9" }}>
                              <input type="checkbox" className="form-check-input flex-shrink-0" checked={selectedUserIds.includes(user.id)} onChange={() => toggleUser(user.id)} />
                              <div className="small">
                                <span className="fw-bold d-block text-dark">{user.firstName} {user.lastName}</span>
                                <span className="text-muted">{user.email}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2">
                          {ROLE_OPTIONS.map((role) => (
                            <button
                              key={role}
                              type="button"
                              className={`btn btn-sm px-4 rounded-pill border transition-all ${selectedRoles.includes(role) ? "btn-success shadow" : "btn-outline-secondary bg-white text-muted"}`}
                              onClick={() => toggleRole(role)}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="bg-success text-white p-3 rounded-4 shadow-sm d-flex justify-content-between align-items-center">
                      <span className="fw-bold"><i className="bi bi-people me-2"></i> Total de destinatarios:</span>
                      <span className="badge bg-white text-success fs-6 px-3">{previewRecipients.length}</span>
                    </div>
                  </div>

                  <div className="col-12">
                    <button type="submit" className="btn btn-success btn-lg w-100 fw-bold shadow hover-grow py-3" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none" }} disabled={isSending}>
                      {isSending ? <span className="spinner-border spinner-border-sm" /> : "Confirmar y Enviar"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        ) : (
          <section className="card border-0 shadow-lg" style={{ borderRadius: "20px" }}>
            <div className="card-header border-0 pt-4 px-4 text-white" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <h2 className="h4 fw-bold mb-1">Registro de Actividad</h2>
              <p className="small mb-3 text-white-50">Auditoría completa de correos emitidos</p>
            </div>
            <div className="card-body p-4">
              <div className="table-responsive">
                <ReusableTable
                  headers={headers}
                  rows={paginatedMails}
                  emptyText="No hay historial disponible."
                  renderRow={(mail) => (
                    /* ELIMINAMOS EL <tr className="align-middle"> */
                    <>
                      <td className="small fw-bold text-muted">
                        {mail.sentAt ? new Date(mail.sentAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="fw-bold">
                        {mail.username}
                      </td>
                      <td className="small fw-semibold">{mail.header}</td>
                      <td>
                        {mail.recipientMode === "ROLES" ? "Por Roles" : "Directo"}
                      </td>
                      <td className="small text-muted italic">
                        {mail.recipients.length} personas alcanzadas
                      </td>
                    </>
                    /* ELIMINAMOS EL </tr> */
                  )}
                />
              </div>
              <div className="mt-4 d-flex justify-content-center">
                <Pagination totalItems={sentMails.length} currentPage={currentPage} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
              </div>
            </div>
          </section>
        )}
    </div>
  );
}
