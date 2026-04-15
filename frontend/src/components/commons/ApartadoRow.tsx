/**
 * Shared ApartadoRow component — renders a single hierarchical row
 * with optional boolean/custom select input for Anexo form sections.
 *
 * Supports:
 * - Multiple nesting levels (0, 1, 2+) with indentation and bullets
 * - "title" mode (text only, no input)
 * - "select" mode with boolean or custom options
 * - Bold styling via `bold` prop
 * - Error display
 * - Custom options override (defaults to Sí/No)
 */

/** Configuration for a single row item */
export type SectionItem = {
  /** Display number, e.g. "4.1.2" */
  num: string;
  /** Display label text */
  title: string;
  /** Form field key — omit for title-only rows */
  key?: string;
  /** Nesting level: 0 = top, 1 = indented, 2+ = deeper */
  level: number;
  /** Row mode: "title" renders text-only without input; "select" (default) renders a dropdown */
  inputType?: "select" | "title";
  /** Whether to render the label text in bold */
  bold?: boolean;
};

/** Default boolean options used by most Anexo forms */
export const BOOL_OPTIONS_DEFAULT = [
  { value: "", label: "Sin especificar" },
  { value: "true", label: "Sí" },
  { value: "false", label: "No" },
];

export type ApartadoRowProps = {
  /** Section item configuration */
  item: SectionItem;
  /** Current value of the field (empty string if unset) */
  value?: string;
  /** Change handler — called with (key, newValue) */
  onChange?: (key: string, value: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Validation error message to display */
  error?: string | null;
  /** Custom select options — overrides default boolean options */
  opciones?: { value: string; label: string }[];
};

export function ApartadoRow({
  item,
  value = "",
  onChange,
  disabled,
  error,
  opciones,
}: ApartadoRowProps) {
  const paddingLeft = item.level === 0 ? 0 : item.level === 1 ? "2rem" : "3.5rem";

  const bullet =
    item.level === 0 ? null : item.level === 1 ? (
      <span className="me-2 text-muted small">•</span>
    ) : (
      <span className="me-2 text-muted small">◦</span>
    );

  const baseTextClass =
    item.level === 0
      ? "text-dark"
      : item.level === 2
        ? "text-secondary small fst-italic"
        : "text-secondary small";

  const textClass = baseTextClass + (item.bold ? " fw-bold" : "");

  // Title-only rows: no input
  if (item.inputType === "title" || !item.key) {
    return (
      <div
        key={`title-${item.num}-${item.title}`}
        className="d-flex align-items-center mb-1 py-2 border-bottom border-light"
        style={{ paddingLeft }}
      >
        <div className="d-flex align-items-baseline">
          {bullet}
          <div className={textClass}>
            {item.num}. {item.title}
          </div>
        </div>
      </div>
    );
  }

  const options = opciones ?? BOOL_OPTIONS_DEFAULT;

  return (
    <div
      key={item.key ?? `${item.num}-${item.title}`}
      className="d-flex align-items-center justify-content-between mb-1 py-2 border-bottom border-light"
      style={{ paddingLeft }}
    >
      <div className="d-flex align-items-baseline">
        {bullet}
        <div className={textClass}>
          {item.num}. {item.title}
        </div>
      </div>

      <div className="ms-3">
        <select
          className={`form-select form-select-sm d-inline-block w-auto${error ? " is-invalid" : ""}`}
          value={value}
          onChange={(e) => onChange?.(item.key!, e.target.value)}
          disabled={disabled}
          style={{ minWidth: "120px" }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <div className="invalid-feedback d-block small">{error}</div>}
      </div>
    </div>
  );
}
