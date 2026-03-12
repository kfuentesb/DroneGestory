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
  placeholder = "Buscar por modelo...",
  className = "form-control",
  style = {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
    maxWidth: 400,
  }
}) => (
  <input
    type="text"
    className={className}
    placeholder={placeholder}
    style={style}
    value={value}
    onChange={e => onChange(e.target.value)}
  />
);

export default SearchBar;