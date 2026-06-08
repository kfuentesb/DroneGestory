import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  className = "form-control",
  style = {}
}) => {
  const defaultStyle: React.CSSProperties = {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
    maxWidth: "400px",
    paddingLeft: "2.5rem",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236B7280' class='bi bi-search' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0.75rem center",
    ...style
  };

  return (
    <div className="position-relative w-100" style={{ maxWidth: defaultStyle.maxWidth }}>
      <input
        type="text"
        className={className}
        placeholder={placeholder && placeholder.trim() !== "" ? placeholder : "Buscar..."}
        style={defaultStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="btn-close position-absolute top-50 end-0 translate-middle-y me-2"
          style={{ fontSize: "0.65rem", padding: "0.5rem" }}
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
        />
      )}
    </div>
  );
};

export default SearchBar;