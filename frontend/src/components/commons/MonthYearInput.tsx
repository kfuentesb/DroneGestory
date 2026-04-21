import React, { useEffect, useState } from "react";

type Props = {
  value: string | null | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  invalid?: boolean;
  // Añadimos la prop style aquí
  style?: React.CSSProperties;
};

const MONTH_OPTIONS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const buildYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = currentYear + 1; year >= 1980; year -= 1) {
    years.push(String(year));
  }
  return years;
};

const YEAR_OPTIONS = buildYearOptions();

const parseValue = (value: string | null | undefined) => {
  if (!value) return { year: "", month: "" };
  const [year = "", month = ""] = value.split("-");
  return { year, month };
};

export default function MonthYearInput({ 
  value, 
  onChange, 
  disabled = false, 
  className = "", 
  invalid = false,
  style
}: Props) {
  const parsed = parseValue(value);
  const [year, setYear] = useState(parsed.year);
  const [month, setMonth] = useState(parsed.month);

  useEffect(() => {
    const next = parseValue(value);
    setYear(next.year);
    setMonth(next.month);
  }, [value]);

  const emit = (nextYear: string, nextMonth: string) => {
    setYear(nextYear);
    setMonth(nextMonth);

    if (!nextYear || !nextMonth) {
      onChange("");
      return;
    }
    onChange(`${nextYear}-${nextMonth}`);
  };

  return (
    <div className={`row g-2 ${className}`.trim()}>
      <div className="col-7">
        <select
          disabled={disabled}
          className={`form-select ${invalid ? "is-invalid" : ""}`}
          value={month}
          style={style} // Aplicamos el estilo al select de meses
          onChange={(e) => emit(year, e.target.value)}
        >
          <option value="">Mes</option>
          {MONTH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-5">
        <select
          disabled={disabled}
          className={`form-select ${invalid ? "is-invalid" : ""}`}
          value={year}
          style={style} // Aplicamos el estilo al select de años
          onChange={(e) => emit(e.target.value, month)}
        >
          <option value="">Año</option>
          {YEAR_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
