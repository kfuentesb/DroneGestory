import React, { useState } from 'react';
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import { apiFetch } from '../../api';

const aircraftClasses = [
  { value: "No", label: "No tiene" },
  { value: "C0", label: "C0" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
  { value: "C3", label: "C3" },
  { value: "C4", label: "C4" },
  { value: "C5", label: "C5" },
  { value: "C6", label: "C6" }
];

const configs = [
  { value: "Avion", label: "Avión" },
  { value: "Multirrotor", label: "Multirrotor" },
  { value: "Helicoptero", label: "Helicóptero" },
  { value: "Hibrido", label: "Híbrido" },
  { value: "Ligero", label: "Ligero" },
  { value: "Otro", label: "Otro" }
];

const LIMITS = {
  MIN_MTOM: 0.01,        // grams
  MAX_MTOM: 150,         // kg
  MIN_WINGSPAN: 0.05,    // cm
  MAX_WINGSPAN: 50,      // meters
  MAX_SPEED: 360,        // m/s
  MAX_ENERGY: 5000       // Joules
};

type SelectOption = { value: string; label: string };

export default function FormAircraft() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formValues, setFormValues] = useState({
    manufacturer: "",
    model: "",
    serialNumber: "",
    aircraftClass: null as SelectOption | null,
    mtom: 0,
    wingspan: 0,
    maxSpeed: 0,
    config: null as SelectOption | null,
    impactEnergy: 0,
    hasCamera: null as SelectOption | null,
    image: null as File | null,
  });

  // Mantenemos tu estado de errores, pero añadimos soporte para mensajes de texto
  const [errors, setErrors] = useState<any>({
    manufacturer: false,
    model: false,
    serialNumber: false,
    aircraftClass: false,
    mtom: false,
    wingspan: false,
    maxSpeed: false,
    config: false,
    impactEnergy: false,
    hasCamera: false,
  });

  const navigate = useNavigate();
  const allowedTypes = ["image/jpeg", "image/png"];

  const backgroundBorderInputsSelect = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "#F3F4F6",
      borderColor: "#D1D5DB"
    })
  };

  const backgroundBorderInputs = {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB"
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setFormValues({ ...formValues, image: null });
      setError("");
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      setError("Solo se permiten imágenes JPG o PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe pesar menos de 5MB.");
      return;
    }
    setSelectedFile(file);
    setFormValues({ ...formValues, image: file });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Expresión regular que coincide con tu @Pattern de Java
    const serialRegex = /^[a-zA-Z0-9]{2,25}$/;

    const newErrors = {
      manufacturer: !formValues.manufacturer.trim(),
      model: !formValues.model.trim(),
      serialNumber: !formValues.serialNumber.trim() || !serialRegex.test(formValues.serialNumber),
      aircraftClass: !formValues.aircraftClass,
      
      // MTOM Validation: Check if empty, NaN, or outside [0.01, 150]
      mtom: formValues.mtom === 0 || 
            isNaN(Number(formValues.mtom)) || 
            Number(formValues.mtom) < LIMITS.MIN_MTOM || 
            Number(formValues.mtom) > LIMITS.MAX_MTOM,

      // Wingspan Validation: Check if empty, NaN, or outside [0.05, 50]
      wingspan: formValues.wingspan === 0 || 
                isNaN(Number(formValues.wingspan)) || 
                Number(formValues.wingspan) < LIMITS.MIN_WINGSPAN || 
                Number(formValues.wingspan) > LIMITS.MAX_WINGSPAN,

      // Max Speed Validation: Check if empty, NaN, or outside [0, 250]
      maxSpeed: formValues.maxSpeed === 0 || 
                isNaN(Number(formValues.maxSpeed)) || 
                Number(formValues.maxSpeed) < 0 || 
                Number(formValues.maxSpeed) > LIMITS.MAX_SPEED,

      // Impact Energy Validation: Check if empty, NaN, or outside [0, 5000]
      impactEnergy: formValues.impactEnergy === 0 || 
                    isNaN(Number(formValues.impactEnergy)) || 
                    Number(formValues.impactEnergy) < 0 || 
                    Number(formValues.impactEnergy) > LIMITS.MAX_ENERGY,

      config: !formValues.config,
      hasCamera: formValues.hasCamera === null || formValues.hasCamera === undefined,
    };

    setErrors(newErrors);
    
    if (Object.values(newErrors).some(Boolean)) {
      let msg = "Por favor complete los campos correctamente.";
      if (newErrors.serialNumber && formValues.serialNumber.trim()) {
          msg = "El número de serie solo permite letras y números (2-25 carac.).";
      }
      setError(msg);
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("manufacturer", formValues.manufacturer);
      formData.append("model", formValues.model);
      formData.append("serialNumber", formValues.serialNumber);
      formData.append("aircraftClass", formValues.aircraftClass?.value ?? "");
      formData.append("mtom", String(formValues.mtom));
      formData.append("wingspan", String(formValues.wingspan));
      formData.append("maxSpeed", String(formValues.maxSpeed));
      formData.append("config", formValues.config?.value ?? "");
      formData.append("impactEnergy", String(formValues.impactEnergy));
      formData.append("hasCamera", formValues.hasCamera?.value === "true" ? "true" : "false");

      if (selectedFile) {
        formData.append("imageFile", selectedFile, selectedFile.name);
      }

      const res = await apiFetch("http://localhost:8080/api/auth/aircraft", {
        method: "POST",
        body: formData
      });

      if (!res) return;
      navigate("/auth/aircrafts");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#F3F4F6", minHeight: "100vh" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        <h2 className="text-center mb-4 fw-normal" style={{ color: "#1E1E1E" }}>
          Registrar Aeronave
        </h2>

        <div className="card shadow-sm p-4" style={{ borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}>
          <form onSubmit={handleSubmit}>
            {/* Row 1: Fabricante, Modelo, Nº Serie */}
            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label">Fabricante</label>
                <input
                  type="text"
                  className="form-control"
                  value={formValues.manufacturer}
                  onChange={e => setFormValues({ ...formValues, manufacturer: e.target.value })}
                  style={{ ...backgroundBorderInputs, border: errors.manufacturer ? "1px solid red" : "1px solid #D1D5DB" }}
                />
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label">Modelo</label>
                <input
                  type="text"
                  className="form-control"
                  value={formValues.model}
                  onChange={e => setFormValues({ ...formValues, model: e.target.value })}
                  style={{ ...backgroundBorderInputs, border: errors.model ? "1px solid red" : "1px solid #D1D5DB" }}
                />
              </div>
              <div className="col-12 col-md">
                <label className="form-label">Nº Serie</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: ABC12345 (2-25 carac.)"
                  value={formValues.serialNumber}
                  onChange={e => setFormValues({ ...formValues, serialNumber: e.target.value })}
                  style={{ ...backgroundBorderInputs, border: errors.serialNumber ? "1px solid red" : "1px solid #D1D5DB" }}
                />
              </div>
            </div>

            {/* Row 2: Clase, MTOM, Dimensión */}
            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label">Clase</label>
                <Select
                  options={aircraftClasses}
                  styles={backgroundBorderInputsSelect}
                  placeholder="Seleccione clase"
                  value={formValues.aircraftClass}
                  onChange={val => setFormValues({ ...formValues, aircraftClass: val })}
                />
                {errors.aircraftClass && <div className="text-danger small">Campo requerido</div>}
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label">MTOM (Kg)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formValues.mtom}
                  onChange={e => setFormValues({ ...formValues, mtom: e.target.value === "" ? 0 : Number(e.target.value) })}
                  style={{ ...backgroundBorderInputs, border: errors.mtom ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {errors.mtom && (
                  <div className="text-danger small">
                    Rango permitido: {LIMITS.MIN_MTOM} - {LIMITS.MAX_MTOM} kg
                  </div>
                )}
              </div>
              <div className="col-12 col-md">
                <label className="form-label">Dimensión (m)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formValues.wingspan}
                  onChange={e => setFormValues({ ...formValues, wingspan: e.target.value === "" ? 0 : Number(e.target.value) })}
                  style={{ ...backgroundBorderInputs, border: errors.wingspan ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {errors.wingspan && (
                  <div className="text-danger small">
                    Rango permitido: {LIMITS.MIN_WINGSPAN} - {LIMITS.MAX_WINGSPAN} m
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Velocidad máx, Configuración, Energía de impacto */}
            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label">Velocidad máx. (m/s)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formValues.maxSpeed}
                  onChange={e => setFormValues({ ...formValues, maxSpeed: e.target.value === "" ? 0 : Number(e.target.value) })}
                  style={{ ...backgroundBorderInputs, border: errors.maxSpeed ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {errors.maxSpeed && (
                  <div className="text-danger small">
                    Máximo permitido: {LIMITS.MAX_SPEED} m/s
                  </div>
                )}
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label">Configuración</label>
                <Select
                  options={configs}
                  styles={backgroundBorderInputsSelect}
                  placeholder="Seleccione configuración"
                  value={formValues.config}
                  onChange={val => setFormValues({ ...formValues, config: val })}
                />
                {errors.config && <div className="text-danger small">Campo requerido</div>}
              </div>
              <div className="col-12 col-md">
                <label className="form-label">Energía de impacto (J)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formValues.impactEnergy}
                  onChange={e => setFormValues({ ...formValues, impactEnergy: e.target.value === "" ? 0 : Number(e.target.value) })}
                  style={{ ...backgroundBorderInputs, border: errors.impactEnergy ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {errors.impactEnergy && (
                  <div className="text-danger small">
                    Máximo permitido: {LIMITS.MAX_ENERGY} Julios
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Cámara, Imagen */}
            <div className="row mb-4">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label">Cámara</label>
                <Select
                  options={[
                    { value: "true", label: "Sí" },
                    { value: "false", label: "No" }
                  ]}
                  styles={backgroundBorderInputsSelect}
                  placeholder="¿Tiene cámara?"
                  value={formValues.hasCamera}
                  onChange={val => setFormValues({ ...formValues, hasCamera: val })}
                />
                {errors.hasCamera && <div className="text-danger small">Campo requerido</div>}
              </div>
              <div className="col-12 col-md">
                <label className="form-label">Imagen</label>
                <div className="d-flex align-items-center rounded" style={{ backgroundColor: "#F3F4F6", border: "1px solid #D1D5DB", paddingLeft: "10px" }}>
                  <span className="text-truncate" style={{ maxWidth: "150px" }}>
                    {selectedFile ? selectedFile.name : "No file selected"}
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn btn-success ms-auto"
                    style={{ cursor: "pointer" }}
                  >
                    Seleccionar archivo
                  </label>
                </div>
              </div>
            </div>

            {error && <p className="text-danger text-center">{error}</p>}

            <div className="d-flex gap-2 mt-3 justify-content-center">
              <button type="submit" className="btn btn-success px-4" disabled={loading}>
                {loading ? "Cargando..." : "Registrar aeronave"}
              </button>
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={() => navigate("/auth/aircrafts")}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}