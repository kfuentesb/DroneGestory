import React, { useState } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import { apiFetch } from '../../api';
import { aircraftClasses, configs, LIMITS } from '../../global-const/aircraft-const';

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

  const handleClearFile = () => {
        setSelectedFile(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const serialRegex = /^[a-zA-Z0-9]{2,25}$/;

    const newErrors = {
      manufacturer: !formValues.manufacturer.trim(),
      model: !formValues.model.trim(),
      serialNumber: !formValues.serialNumber.trim() || !serialRegex.test(formValues.serialNumber),
      aircraftClass: !formValues.aircraftClass,

      mtom: formValues.mtom === 0 || 
            isNaN(Number(formValues.mtom)) || 
            Number(formValues.mtom) < LIMITS.MIN_MTOM || 
            Number(formValues.mtom) > LIMITS.MAX_MTOM,

      wingspan: formValues.wingspan === 0 || 
                isNaN(Number(formValues.wingspan)) || 
                Number(formValues.wingspan) < LIMITS.MIN_WINGSPAN || 
                Number(formValues.wingspan) > LIMITS.MAX_WINGSPAN,

      maxSpeed: formValues.maxSpeed === 0 || 
                isNaN(Number(formValues.maxSpeed)) || 
                Number(formValues.maxSpeed) < 0 || 
                Number(formValues.maxSpeed) > LIMITS.MAX_SPEED,

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

      const res = await apiFetch(`${API_BASE_URL}/api/auth/aircraft`, {
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
                <label className="form-label d-block text-start ps-1">Fabricante</label>
                <input
                  type="text"
                  className="form-control"
                  value={formValues.manufacturer}
                  onChange={e => setFormValues({ ...formValues, manufacturer: e.target.value })}
                  style={{ ...backgroundBorderInputs, border: errors.manufacturer ? "1px solid red" : "1px solid #D1D5DB" }}
                />
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Modelo</label>
                <input
                  type="text"
                  className="form-control"
                  value={formValues.model}
                  onChange={e => setFormValues({ ...formValues, model: e.target.value })}
                  style={{ ...backgroundBorderInputs, border: errors.model ? "1px solid red" : "1px solid #D1D5DB" }}
                />
              </div>
              <div className="col-12 col-md">
                <label className="form-label d-block text-start ps-1">Nº Serie</label>
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
                <label className="form-label d-block text-start ps-1">Clase</label>
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
                <label className="form-label d-block text-start ps-1">MTOM (Kg)</label>
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
                <label className="form-label d-block text-start ps-1">Dimensión (m)</label>
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
                <label className="form-label d-block text-start ps-1">Velocidad máx. (km/h)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formValues.maxSpeed}
                  onChange={e => setFormValues({ ...formValues, maxSpeed: e.target.value === "" ? 0 : Number(e.target.value) })}
                  style={{ ...backgroundBorderInputs, border: errors.maxSpeed ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {errors.maxSpeed && (
                  <div className="text-danger small">
                    Máximo permitido: {LIMITS.MAX_SPEED} km/h
                  </div>
                )}
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Configuración</label>
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
                <label className="form-label d-block text-start ps-1">Energía de impacto (J)</label>
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
                <label className="form-label d-block text-start ps-1">Cámara</label>
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
                <label className="form-label d-block text-start ps-1">Imagen</label>
                <div className="d-flex align-items-center rounded" style={{ backgroundColor: "#F3F4F6", border: "1px solid #D1D5DB", paddingLeft: "10px" }}>
                  
                  <span className="text-truncate" style={{ maxWidth: "150px" }}>
                    {selectedFile ? selectedFile.name : "No hay archivo"}
                  </span>

                  <input
                    id="file-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />

                  {/* Usamos ms-auto para empujar los botones a la derecha */}
                  <label
                    htmlFor="file-upload"
                    className="btn btn-success ms-auto"
                    style={{ 
                      cursor: "pointer",
                      // Si hay archivo, quitamos el redondeado derecho para que encaje con el botón rojo
                      borderTopRightRadius: selectedFile ? "0" : "4px",
                      borderBottomRightRadius: selectedFile ? "0" : "4px",
                      // Forzamos que no haya margen derecho para que no haya hueco entre botones
                      marginRight: "0" 
                    }}
                  >
                    Seleccionar archivo
                  </label>

                  {selectedFile && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleClearFile}
                      style={{ 
                        // Quitamos el redondeado izquierdo
                        borderTopLeftRadius: "0", 
                        borderBottomLeftRadius: "0",
                        // Un pequeño ajuste de borde para que no se vea doble línea si quieres
                        borderLeft: "1px solid rgba(255,255,255,0.1)"
                      }}
                      title="Eliminar archivo seleccionado"
                    >
                      ✕
                    </button>
                  )}
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