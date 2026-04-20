type ReadOnlyConopsFieldProps = {
  value: string;
};

export function ReadOnlyConopsField({ value }: ReadOnlyConopsFieldProps) {
  return (
    <div className="col-md-6 mb-3">
      <label className="form-label fw-bold small text-uppercase text-muted">CONOPS</label>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          className="form-control"
          value={value}
          disabled
          readOnly
          style={{
            background: "#f5f6fa",
            color: "#888",
            fontStyle: "italic",
            border: "1px solid #e0e0e0",
            boxShadow: "none",
            paddingRight: "2.2em",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: "50%",
            right: "14px",
            transform: "translateY(-50%)",
            color: "#bcbcbc",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
          }}
          title="Campo solo lectura"
          aria-label="Campo solo lectura"
        >
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 1.5A3.5 3.5 0 0 0 4.5 5v3H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-.5V5A3.5 3.5 0 0 0 8 1.5Zm-2 3.5A2 2 0 0 1 8 3a2 2 0 0 1 2 2v3H6V5Zm-2 5h8a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" />
          </svg>
        </span>
      </div>
    </div>
  );
}
