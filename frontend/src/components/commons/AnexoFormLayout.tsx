import type { ReactNode } from "react";
import saveIcon from "../../assets/commons/file_save.svg";

export type AnexoFormLayoutProps = {
  title: string;
  disabled?: boolean;
  saving?: boolean;
  readOnlyMessage?: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
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
          <form id="anexo-main-form" onSubmit={onSubmit}>
            {children}
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
