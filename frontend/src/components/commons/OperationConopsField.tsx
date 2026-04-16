type OperationConopsFieldProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
};

export default function OperationConopsField({
  value,
  onChange,
  disabled,
  readOnly = true,
}: OperationConopsFieldProps) {
  return (
    <div className="mb-3">
      <label className="form-label fw-bold small text-uppercase text-muted">CONOPS</label>
      <textarea
        className="form-control bg-white border"
        rows={3}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        disabled={disabled}
      />
    </div>
  );
}
