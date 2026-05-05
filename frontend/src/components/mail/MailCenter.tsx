import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api";
import Pagination from "../commons/props/Pagination";
import { ReusableTable, type TableHeader } from "../commons/props/ReusableTable";
import LoadingSpinner from "../commons/Loading";
import activarIcon from "../../assets/commons/select_all_white.svg";
import desactivarIcon from "../../assets/commons/remove_selection_white.svg";

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
const AUTOMATIC_MAIL_COLUMNS: Array<{
  key: keyof Omit<AutomaticMailPreference, "userId">;
  label: string;
}> = [
  { key: "certificates", label: "Certificados" },
  { key: "operations", label: "Operaciones" },
  { key: "maintenance", label: "Mantenimiento" },
  { key: "events", label: "Eventos" },
];
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

  const hasAnyMaintainer = users.some(u => u.roles.includes("MAINTAINER"));  

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

  const toggleAutomaticPreference = async (
    userId: number,
    key: keyof Omit<AutomaticMailPreference, "userId">
  ) => {
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

  // TOGGLE ALL PREFERENCES
  const toggleAllPreferences = async (userId: number, value: boolean) => {
    const currentPreference = getAutomaticPreference(userId);
    const isMaintainer = users.find(u => u.id === userId)?.roles.includes("MAINTAINER");
    const nextPreference = {
      userId,
      certificates: value,
      operations: value,
      maintenance: isMaintainer ? value : false,
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
          maintenance: isMaintainer ? value : false,
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
      {/* SELECTOR DE VISTA (TABS) CON DISEÑO MODERNO */}
      <div className="col-12 mb-5">
        <label className="form-label small fw-bold text-uppercase text-muted d-block mb-3 text-center" style={{ letterSpacing: "1px" }}>
          Panel de Control de Mensajería
        </label>
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
          // ... (igual a tu código original)
          <section className="card border-0 shadow-lg" style={{ borderRadius: "20px"}}>
            {/* ...contenido omitido para brevedad... */}
          </section>
        ) : showSegmentation === "HISTORY" ? (
          // ... (igual a tu código original)
          <section className="card border-0 shadow-lg" style={{ borderRadius: "20px" }}>
            {/* ...contenido omitido para brevedad... */}
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
                {/* ...igual a tu código original... */}
              </form>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      {AUTOMATIC_MAIL_COLUMNS.map((column) => (
                        <th key={column.key} className="text-center">{column.label}</th>
                      ))}
                      <th style={{width: 120}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const preference = getAutomaticPreference(user.id);
                      const isMaintainer = user.roles.includes("MAINTAINER");
                      const allActive =
                        preference.certificates &&
                        preference.operations &&
                        (isMaintainer ? preference.maintenance : true) &&
                        preference.events;
                      const isUpdatingAll = updatingAutomaticPreference === `${user.id}-ALL`;

                      return (
                        <tr key={user.id}>
                          <td>
                            <span className="fw-bold d-block">{user.firstName} {user.lastName}</span>
                            <span className="small text-muted">{user.email}</span>
                          </td>
                          {AUTOMATIC_MAIL_COLUMNS.map((column) => {
                            const checkboxKey = `${user.id}-${column.key}`;
                            // SOLO muestra la casilla de "maintenance" si es MAINTAINER
                            if (column.key === "maintenance" && !user.roles.includes("MAINTAINER")) {
                              return <td key={column.key}></td>;
                            }
                            return (
                              <td key={column.key} className="text-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={preference[column.key]}
                                  disabled={updatingAutomaticPreference === checkboxKey}
                                  onChange={() => toggleAutomaticPreference(user.id, column.key)}
                                  aria-label={`${column.label} - ${user.username}`}
                                />
                              </td>
                            );
                          })}
                          <td className="text-center">
                            <button
                              type="button"
                              className={`btn btn-sm rounded-pill px-3 ${allActive ? "btn-danger" : "btn-success"}`}
                              style={{minWidth: "90px"}}
                              disabled={isUpdatingAll}
                              onClick={() => toggleAllPreferences(user.id, !allActive)}
                            >
                              {isUpdatingAll ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : allActive ? (
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
                        <td className="text-center text-muted py-4" colSpan={AUTOMATIC_MAIL_COLUMNS.length + 1}>
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