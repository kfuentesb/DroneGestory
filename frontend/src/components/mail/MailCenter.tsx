import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";
import Pagination from "../commons/props/Pagination";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import LoadingSpinner from "../commons/Loading";
import activarIcon from "../../assets/commons/select_all_white.svg";
import desactivarIcon from "../../assets/commons/remove_selection_white.svg";
import GifMail from "../../assets/gifs/sending-mail.gif";

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

type AutomaticMailPreference = {
  userId: number;
  certificates: boolean;
  operations: boolean;
  maintenance: boolean;
  events: boolean;
};

type NotificationSettings = {
  scheduleHour: number;
  scheduleMinute: number;
  certificateFirstDaysAhead: number;
  certificateSecondDaysAhead: number;
  operationDaysAhead: number;
  maintenanceDaysAhead: number;
  eventDaysAhead: number;
  lastRunDate?: string | null;
};

const ROLE_OPTIONS = ["MANAGER", "MAINTAINER", "PILOT"];
const ITEMS_PER_PAGE = 8;

export default function MailCenter() {
  const [users, setUsers] = useState<User[]>([]);
  const [sentMails, setSentMails] = useState<SentMail[]>([]);
  const [automaticMailPreferences, setAutomaticMailPreferences] = useState<Record<number, AutomaticMailPreference>>({});
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    scheduleHour: 9,
    scheduleMinute: 0,
    certificateFirstDaysAhead: 30,
    certificateSecondDaysAhead: 7,
    operationDaysAhead: 1,
    maintenanceDaysAhead: 1,
    eventDaysAhead: 1,
    lastRunDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSavingNotificationSettings, setIsSavingNotificationSettings] = useState(false);
  const [updatingAutomaticPreference, setUpdatingAutomaticPreference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [header, setHeader] = useState("");
  const [text, setText] = useState("");
  const [showSegmentation, setShowSegmentation] = useState<"SENT_MAILS" | "HISTORY" | "AUTOMATIC_MAILS">("SENT_MAILS");
  const [recipientMode, setRecipientMode] = useState<"USERS" | "ROLES">("USERS");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [expandedMailId, setExpandedMailId] = useState<number | null>(null);


  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sentMails.length]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, sentMailResponse, automaticPreferencesResponse, notificationSettingsResponse] = await Promise.all([
        apiFetch("/api/users"),
        apiFetch("/api/sent-mails"),
        apiFetch("/api/automatic-mail-preferences"),
        apiFetch("/api/automatic-mail-preferences/settings"),
      ]);

      if (!usersResponse || !sentMailResponse || !automaticPreferencesResponse || !notificationSettingsResponse) return;

      setUsers(await usersResponse.json());
      setSentMails(await sentMailResponse.json());
      const preferences: AutomaticMailPreference[] = await automaticPreferencesResponse.json();
      setAutomaticMailPreferences(Object.fromEntries(preferences.map((preference) => [preference.userId, preference])));
      setNotificationSettings(await notificationSettingsResponse.json());
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

  const getAutomaticPreference = (userId: number): AutomaticMailPreference => (
    automaticMailPreferences[userId] ?? {
      userId,
      certificates: false,
      operations: false,
      maintenance: false,
      events: false,
    }
  );

  const isMaintainer = (user: User): boolean => user.roles.includes("MAINTAINER");

  const toggleAutomaticPreference = async (
    userId: number,
    key: keyof Omit<AutomaticMailPreference, "userId">
  ) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (key === "maintenance" && !isMaintainer(user)) {
      setError("Solo los usuarios de mantenimiento pueden recibir correos de mantenimiento.");
      return;
    }

    const currentPreference = getAutomaticPreference(userId);
    const nextPreference = {
      ...currentPreference,
      [key]: !currentPreference[key],
    };
    const updateKey = `${userId}-${key}`;

    setError(null);
    setSuccess(null);
    setUpdatingAutomaticPreference(updateKey);
    setAutomaticMailPreferences((current) => ({ ...current, [userId]: nextPreference }));

    try {
      const response = await apiFetch(`/api/automatic-mail-preferences/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificates: nextPreference.certificates,
          operations: nextPreference.operations,
          maintenance: nextPreference.maintenance,
          events: nextPreference.events,
        }),
      });

      if (!response) return;
      const savedPreference = await response.json();
      setAutomaticMailPreferences((current) => ({ ...current, [userId]: savedPreference }));
    } catch (err) {
      setAutomaticMailPreferences((current) => ({ ...current, [userId]: currentPreference }));
      setError(err instanceof Error ? err.message : "No se pudo actualizar la configuración automática.");
    } finally {
      setUpdatingAutomaticPreference(null);
    }
  };

  const updateNotificationSetting = (key: keyof NotificationSettings, value: number) => {
    let validatedValue = value;

    if (key === "scheduleHour") {
      validatedValue = Math.max(0, Math.min(23, value));
    } else if (key === "scheduleMinute") {
      validatedValue = Math.max(0, Math.min(59, value));
    } else {
      validatedValue = Math.max(0, value);
    }
    setNotificationSettings((current) => ({ ...current, [key]: validatedValue }));
  };

  const saveNotificationSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSavingNotificationSettings(true);

    try {
      const response = await apiFetch("/api/automatic-mail-preferences/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleHour: notificationSettings.scheduleHour,
          scheduleMinute: notificationSettings.scheduleMinute,
          certificateFirstDaysAhead: notificationSettings.certificateFirstDaysAhead,
          certificateSecondDaysAhead: notificationSettings.certificateSecondDaysAhead,
          operationDaysAhead: notificationSettings.operationDaysAhead,
          maintenanceDaysAhead: notificationSettings.maintenanceDaysAhead,
          eventDaysAhead: notificationSettings.eventDaysAhead,
        }),
      });

      if (!response) return;
      setNotificationSettings(await response.json());
      setSuccess("Configuración de correos automáticos guardada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la configuración.");
    } finally {
      setIsSavingNotificationSettings(false);
    }
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

  const toggleAllPreferences = async (userId: number, value: boolean) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const currentPreference = getAutomaticPreference(userId);
    const nextPreference: AutomaticMailPreference = {
      userId,
      certificates: value,
      operations: value,
      maintenance: isMaintainer(user) ? value : false,
      events: value,
    };
    setError(null);
    setSuccess(null);
    setUpdatingAutomaticPreference(`${userId}-ALL`);
    setAutomaticMailPreferences((current) => ({ ...current, [userId]: nextPreference }));

    try {
      const response = await apiFetch(`/api/automatic-mail-preferences/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificates: value,
          operations: value,
          maintenance: nextPreference.maintenance,
          events: value,
        }),
      });

      if (!response) return;
      const savedPreference = await response.json();
      setAutomaticMailPreferences((current) => ({ ...current, [userId]: savedPreference }));
    } catch (err) {
      setAutomaticMailPreferences((current) => ({ ...current, [userId]: currentPreference }));
      setError(err instanceof Error ? err.message : "No se pudo actualizar la configuración automática.");
    } finally {
      setUpdatingAutomaticPreference(null);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "1000px", minHeight: "90vh" }}>
      <div className="col-12 mb-5">
        <div className="col-12 mb-5">
          <div className="d-flex align-items-center justify-content-center gap-4">
            
            {/* GIF Izquierdo */}
            <div 
              className="rounded-4 overflow-hidden shadow-sm border p-1 bg-white d-none d-md-block" 
              style={{ width: "fit-content" }}
            >
              <img 
                src={GifMail} 
                alt="GifMail Left"
                style={{ height: "60px", width: "auto", display: "block", transform: "scaleX(-1)"}} 
              />
            </div>

            {/* Texto Central */}
            <label 
              className="form-label small fw-bold text-uppercase m-0"
              style={{ 
                letterSpacing: "2px", 
                opacity: 0.7,
                whiteSpace: "nowrap",
                color: "#059669"
              }}
            >
              Panel de Control de Mensajería
            </label>

            {/* GIF Derecho */}
            <div 
              className="rounded-4 overflow-hidden shadow-sm border p-1 bg-white d-none d-md-block" 
              style={{ width: "fit-content" }}
            >
              <img 
                src={GifMail} 
                alt="GifMail Right"
                style={{ height: "60px", width: "auto", display: "block"}} 
              />
            </div>
            
          </div>
        </div>
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
                ? "#059669" 
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
                ? "#059669"
                : "transparent" 
            }}
          >
            Historial
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-3 border-0 transition-all d-flex align-items-center justify-content-center gap-2 ${
              showSegmentation === "AUTOMATIC_MAILS" 
                ? "text-white shadow fw-bold"
                : "text-muted hover-bg-light"
            }`}
            onClick={() => setShowSegmentation("AUTOMATIC_MAILS")}
            style={{
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              background: showSegmentation === "AUTOMATIC_MAILS" 
                ? "#059669"
                : "transparent" 
            }}
          >
            Correos Automáticos
          </button>
        </div>
      </div>

        {showSegmentation === "SENT_MAILS" ? (
          <section className="card border-0 shadow-lg" style={{ borderRadius: "20px"}}>
            <div className="card-header border-0 pt-4 px-4 text-white" style={{ background: "#059669" }}>
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
                    <button type="submit" className="btn btn-success btn-lg w-100 fw-bold shadow hover-grow py-3" style={{ borderRadius: "15px", background: "#059669", border: "none" }} disabled={isSending}>
                      {isSending ? <span className="spinner-border spinner-border-sm" /> : "Confirmar y Enviar"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>
        ) : showSegmentation === "HISTORY" ? (
          <section className="card border-0 shadow-lg" style={{ borderRadius: "20px" }}>
            <div className="card-header border-0 pt-4 px-4 text-white" style={{ background: "#059669" }}>
              <h2 className="h4 fw-bold mb-1">Registro de Actividad</h2>
              <p className="small mb-3 text-white-50">Auditoría completa de correos emitidos</p>
            </div>
            <div className="card-body p-4">
              <div className="table-responsive position-relative">
                <ReusableTable
                  headers={headers}
                  rows={paginatedMails}
                  emptyText="No hay historial disponible."
                  onRowClick={(mail) =>
                    setExpandedMailId((current) => (current === mail.id ? null : mail.id))
                  }
                  isRowExpanded={(mail) => expandedMailId === mail.id}
                  expandedRowColSpan={headers.length}
                  renderExpandedRow={(mail) => (
                    <div
                      className="rounded-3 p-3"
                      style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
                    >
                      <div className="fw-bold text-dark mb-2">Cuerpo</div>
                      <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {mail.text}
                      </div>
                    </div>
                  )}
                  renderRow={(mail) => (
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
                  )}
                />
              </div>
              <div className="mt-4 d-flex justify-content-center">
                <Pagination totalItems={sentMails.length} currentPage={currentPage} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
              </div>
            </div>
          </section>
        ) : (
          <section className="card border-0 shadow-lg" style={{ borderRadius: "20px" }}>
            <div className="card-header border-0 pt-4 px-4 text-white" style={{ background: "#059669" }}>
              <h2 className="h4 fw-bold mb-1">Correos Automáticos</h2>
              <p className="small mb-3 text-white-50">Configura los temas que cada usuario recibira automáticamente</p>
            </div>
            <div className="card-body p-4">
              {error && <div className="alert alert-danger border-0 shadow-sm py-2">{error}</div>}
              {success && <div className="alert alert-success border-0 shadow-sm py-2">{success}</div>}

              <form onSubmit={saveNotificationSettings} className="mb-4 p-3 rounded-4 bg-light border">
                <div className="row g-3 align-items-end">
                  <div className="col-12 col-md-2">
                    <label className="form-label small fw-bold text-muted text-uppercase">Hora (0-23)</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      max={23}
                      value={notificationSettings.scheduleHour}
                      onChange={(event) => updateNotificationSetting("scheduleHour", Number(event.target.value))}
                    />
                  </div>
                  <div className="col-12 col-md-2">
                    <label className="form-label small fw-bold text-muted text-uppercase">Minuto (0-59)</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      max={59}
                      value={notificationSettings.scheduleMinute}
                      onChange={(e) => updateNotificationSetting("scheduleMinute", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-6 col-md-4">
                    <label className="form-label small fw-bold text-muted text-uppercase">Días previos a expiración 1</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      max={3650}
                      value={notificationSettings.certificateFirstDaysAhead}
                      onChange={(event) => updateNotificationSetting("certificateFirstDaysAhead", Number(event.target.value))}
                    />
                  </div>
                  <div className="col-6 col-md-4">
                    <label className="form-label small fw-bold text-muted text-uppercase">Días previos a expiración 2</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      max={3650}
                      value={notificationSettings.certificateSecondDaysAhead}
                      onChange={(event) => updateNotificationSetting("certificateSecondDaysAhead", Number(event.target.value))}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-bold text-muted text-uppercase">Días previos a Operaciones</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      max={3650}
                      value={notificationSettings.operationDaysAhead}
                      onChange={(event) => updateNotificationSetting("operationDaysAhead", Number(event.target.value))}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-bold text-muted text-uppercase">Días previos a Mantenimiento</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      max={3650}
                      value={notificationSettings.maintenanceDaysAhead}
                      onChange={(event) => updateNotificationSetting("maintenanceDaysAhead", Number(event.target.value))}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label small fw-bold text-muted text-uppercase">Días previos a Eventos</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      max={3650}
                      value={notificationSettings.eventDaysAhead}
                      onChange={(event) => updateNotificationSetting("eventDaysAhead", Number(event.target.value))}
                    />
                  </div>
                  <div className="col-12 d-flex justify-content-between align-items-center">
                    <span className="small text-muted">
                      Último envio: {notificationSettings.lastRunDate ?? "-"}
                    </span>
                    <button type="submit" className="btn btn-success px-4" disabled={isSavingNotificationSettings}>
                      {isSavingNotificationSettings ? <span className="spinner-border spinner-border-sm" /> : "Guardar configuración"}
                    </button>
                  </div>
                </div>
              </form>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th className="text-center">Certificados</th>
                      <th className="text-center">Operaciones</th>
                      <th className="text-center">Mantenimiento</th>
                      <th className="text-center">Eventos</th>
                      <th style={{width: 120}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const preference = getAutomaticPreference(user.id);
                      const userIsMaintainer = isMaintainer(user);
                      const activeKeys = userIsMaintainer
                        ? (["certificates", "operations", "maintenance", "events"] as const)
                        : (["certificates", "operations", "events"] as const);
                      const allActive = activeKeys.every((key) => preference[key]);
                      const isUpdatingAll = updatingAutomaticPreference === `${user.id}-ALL`;
                      
                      return (
                        <tr key={user.id}>
                          <td>
                            <span className="fw-bold d-block">{user.firstName} {user.lastName}</span>
                            <span className="small text-muted">{user.email}</span>
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={preference.certificates}
                              disabled={updatingAutomaticPreference === `${user.id}-certificates`}
                              onChange={() => toggleAutomaticPreference(user.id, "certificates")}
                              aria-label={`Certificados - ${user.username}`}
                            />
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={preference.operations}
                              disabled={updatingAutomaticPreference === `${user.id}-operations`}
                              onChange={() => toggleAutomaticPreference(user.id, "operations")}
                              aria-label={`Operaciones - ${user.username}`}
                            />
                          </td>
                          <td className="text-center">
                            {userIsMaintainer ? (
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={preference.maintenance}
                                disabled={updatingAutomaticPreference === `${user.id}-maintenance`}
                                onChange={() => toggleAutomaticPreference(user.id, "maintenance")}
                                aria-label={`Mantenimiento - ${user.username}`}
                              />
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={preference.events}
                              disabled={updatingAutomaticPreference === `${user.id}-events`}
                              onChange={() => toggleAutomaticPreference(user.id, "events")}
                              aria-label={`Eventos - ${user.username}`}
                            />
                          </td>
                          <td className="text-center">
                            <button
                            type="button"
                            className={`btn btn-sm rounded-pill px-3 ${allActive ? "btn-danger" : "btn-success"}`}
                            style={{minWidth: "90px"}}
                            disabled={isUpdatingAll}
                            onClick={() => toggleAllPreferences(user.id, !allActive)}
                            >
                              {isUpdatingAll ? (<span className="spinner-border spinner-border-sm" />) : allActive ? (
                                <img src={desactivarIcon} alt="Desactivar todo" />
                              ) : (
                                <img src={activarIcon} alt="Activar todo" title="Activar todo" style = {{height: '24px'}}/>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {users.length === 0 && (
                      <tr>
                        <td className="text-center text-muted py-4" colSpan={6}>
                          No hay usuarios disponibles.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
    </div>
  );
}