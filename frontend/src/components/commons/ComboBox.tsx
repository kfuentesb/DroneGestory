import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { apiFetch } from "../../api";

type Option = { value: string; label: string };

interface WriteSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  endpoint?: string;
  options?: Option[];
  placeholder?: string;
  error?: boolean;
}

export default function ComboBox({
  label,
  value,
  onChange,
  onBlur,
  endpoint,
  options: optionsProp,
  placeholder,
  error
}: WriteSelectProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (optionsProp) {
      setOptions(optionsProp);
      setIsLoading(false);
      return;
    }

    if (!endpoint) {
      setOptions([]);
      return;
    }

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
  }, [endpoint, label, optionsProp]);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "#ffffff", 
      borderColor: error ? "red" : "#D1D5DB",
      borderRadius: "0.375rem",
      "&:hover": {
        borderColor: error ? "red" : "#9CA3AF",
        backgroundColor: "#ffffff",
      },
    }),
  };

  return (
    <div className="mb-0">
      {label && <label className="form-label">{label}</label>}
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