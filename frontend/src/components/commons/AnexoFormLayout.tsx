import type { ReactNode } from "react";
import saveIcon from "../../assets/commons/file_save.svg";

/**
 * Shared layout wrapper for all Anexo detail forms.
 * Renders the card container, disabled overlay, form, submit button,
 * and read-only alert — all of which are identical across forms.
 */
export type AnexoFormLayoutProps = {
  /** Main heading, e.g. "APÉNDICE 5 - LISTA VERIFICACIÓN PREVUELO OPERACIONAL" */
  title: string;
  /** Whether the form is in read-only/disabled mode */
  disabled?: boolean;
  /** Whether saving is in progress */
  saving?: boolean;
  /** Custom message when read-only */
  readOnlyMessage?: ReactNode;
  /** Form submit handler */
  onSubmit: (e: React.FormEvent) => void;
  /** Form body content */
  children: ReactNode;
};

export function AnexoFormLayout({
  title,
  disabled,
  saving,
  readOnlyMessage,
  onSubmit,
  children,
}: AnexoFormLayoutProps) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h3 className="fw-bold mb-1 text-dark">{title}</h3>
        <div
          style={
            disabled
              ? {
                  filter: "grayscale(1)",
                  opacity: 0.7,
                  pointerEvents: "none" as const,
                  userSelect: "none" as const,
                }
              : undefined
          }
        >
          <form onSubmit={onSubmit}>
            {children}

            <div className="d-flex justify-content-end mt-5 pt-3 border-top">
              <button
                type="submit"
                className="btn btn-success btn-lg px-5 shadow-sm d-inline-flex align-items-center justify-content-center gap-2"
                disabled={disabled || saving}
              >
                {!saving && (
                  <img
                    src={saveIcon}
                    alt=""
                    aria-hidden="true"
                    className="d-inline d-md-none"
                    style={{ width: 16, height: 16 }}
                  />
                )}
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Guardando...
                  </>
                ) : (
                  "Guardar borrador"
                )}
              </button>
            </div>
          </form>
        </div>
        {disabled && (
          <div className="alert alert-secondary mt-4">
            {readOnlyMessage ? (
              readOnlyMessage
            ) : (
              <>
                El anexo está firmado. No se puede editar. Pulsa{" "}
                <strong>Rehacer versión</strong> para poder modificar.
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
