import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { apiFetch } from "../../api";

type Option = { value: string; label: string };

interface WriteSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  endpoint: string;
  placeholder?: string;
  error?: boolean;
}

export default function ComboBox({
  label,
  value,
  onChange,
  onBlur,
  endpoint,
  placeholder,
  error
}: WriteSelectProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar opciones al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch(endpoint);
        if (!res) {
          setOptions([]);
          return;
        }

        const response = await res.json();
        if (Array.isArray(response)) {
          const formatted = response
            .map((item: string) => ({ value: item, label: item }))
            .sort((a, b) => a.label.localeCompare(b.label));
          setOptions(formatted);
        } else {
          setOptions([]);
        }
      } catch (err) {
        console.error("Error cargando opciones de " + label, err);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [endpoint, label]);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "#F3F4F6",
      borderColor: error ? "red" : "#D1D5DB",
      borderRadius: "0.375rem",
    }),
  };

  return (
    <div className="mb-0">
      <label className="form-label">{label}</label>
      <CreatableSelect
        isClearable
        isDisabled={isLoading}
        isLoading={isLoading}
        onChange={(newValue) => onChange(newValue ? newValue.value : "")}
        onCreateOption={(inputValue) => {
          onChange(inputValue);
        }}
        onBlur={onBlur}
        options={options}
        value={value ? { value, label: value } : null}
        placeholder={placeholder || `Seleccione o escriba...`}
        formatCreateLabel={(inputValue) => `Usar "${inputValue}"`}
        styles={customStyles}
        noOptionsMessage={() => "No se encontraron resultados"}
      />
    </div>
  );
}