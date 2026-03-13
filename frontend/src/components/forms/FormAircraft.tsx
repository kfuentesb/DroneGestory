import React, { useState } from 'react';
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import { apiFetch } from '../../api';

const applicantTypes = [
  { value: "Manufacturer", label: "Fabricante" },
  { value: "Operator", label: "Operador" },
  { value: "To_the_Manufacturer", label: "Para Fabricante" }
];

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

const powerSources = [
  { value: "Electric", label: "Eléctrico" },
  { value: "Non_Electric", label: "No Eléctrico" }
];

const powerSourceTypes = [
  { value: "Hydrogen", label: "Hidrógeno" },
  { value: "Gasoline", label: "Gasolina" }
];

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
    mtom: "",
    wingspan: "",
    maxSpeed: "",
    config: null as SelectOption | null,
    impactEnergy: "",
    hasCamera: null as SelectOption | null,
    image: null as File | null,

    // Opcionales
    applicantType: null as SelectOption | null,
    applicantName: "",
    powerSource: null as SelectOption | null,
    powerSourceType: null as SelectOption | null,
    observaciones: "",
    accesorios: "",
    purchaseDate: "",
  });
  const [errors, setErrors] = useState({
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
    image: false,
  });

  const [showOpcionales, setShowOpcionales] = useState(false);

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

  // Lógica para deshabilitar tipo fuente
  const isElectric = formValues.powerSource?.value === "Electric";

  // Si selecciona Eléctrico se borra el tipo de fuente automáticamente
  React.useEffect(() => {
    if (isElectric && formValues.powerSourceType) {
      setFormValues(fv => ({ ...fv, powerSourceType: null }));
    }
    // eslint-disable-next-line
  }, [isElectric]);

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
      setSelectedFile(null);
      setFormValues({ ...formValues, image: null });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe pesar menos de 5MB.");
      setSelectedFile(null);
      setFormValues({ ...formValues, image: null });
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

    // Validación campos principales
    const newErrors = {
      manufacturer: !formValues.manufacturer.trim(),
      model: !formValues.model.trim(),
      serialNumber: !formValues.serialNumber.trim(),
      aircraftClass: !formValues.aircraftClass,
      mtom: !formValues.mtom.trim() || isNaN(Number(formValues.mtom)),
      wingspan: !formValues.wingspan.trim() || isNaN(Number(formValues.wingspan)),
      maxSpeed: !formValues.maxSpeed.trim() || isNaN(Number(formValues.maxSpeed)),
      config: !formValues.config,
      impactEnergy: !formValues.impactEnergy.trim() || isNaN(Number(formValues.impactEnergy)),
      hasCamera: !formValues.hasCamera,
      image: false,
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      setError("Por favor complete los campos obligatorios correctamente.");
      setLoading(false);
      return;
    }

    // Construir payload sólo con los campos principales y opcionales si están presentes
    const payload: any = {
      manufacturer: formValues.manufacturer,
      model: formValues.model,
      serialNumber: formValues.serialNumber,
      aircraftClass: formValues.aircraftClass?.value ?? "",
      mtom: Number(formValues.mtom),
      wingspan: Number(formValues.wingspan),
      maxSpeed: Number(formValues.maxSpeed),
      config: formValues.config?.value ?? "",
      impactEnergy: Number(formValues.impactEnergy),
      hasCamera: formValues.hasCamera?.value === "true"
    };

    // Datos opcionales, sólo se agregan si tienen valor (incluso null para SelectOption OK):
    if (formValues.applicantType)       payload.applicantType = formValues.applicantType.value;
    if (formValues.applicantName.trim())payload.applicantName = formValues.applicantName.trim();
    if (formValues.powerSource)         payload.powerSource = formValues.powerSource.value;
    if (formValues.powerSourceType && !isElectric) payload.powerSourceType = formValues.powerSourceType.value;
    if (formValues.observaciones.trim())payload.observations = formValues.observaciones.trim();
    if (formValues.accesorios.trim())   payload.accessories = formValues.accesorios.trim();
    if (formValues.purchaseDate)        payload.purchaseDate = formValues.purchaseDate;

    // Adjuntar imagen
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value as string));
    if (selectedFile) {
      formData.append("imageFile", selectedFile, selectedFile.name);
    }

    try {
      // Testing consultar token
      // const token = localStorage.getItem('jwt');
      // console.log("JWT enviado:", token);
      
      const res = await apiFetch("http://localhost:8080/api/auth/aircraft", {
        method: "POST",
        body: formData // browser sets multipart/form-data
      });

      if (!res) return;

      const data = await res.json();
      console.log("Aircraft created:", data);

      navigate("/auth/aircrafts"); // redirect to users list after success

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
                  onChange={e => setFormValues({ ...formValues, mtom: e.target.value })}
                  style={{ ...backgroundBorderInputs, border: errors.mtom ? "1px solid red" : "1px solid #D1D5DB" }}
                />
              </div>
              <div className="col-12 col-md">
                <label className="form-label">Dimensión (m)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formValues.wingspan}
                  onChange={e => setFormValues({ ...formValues, wingspan: e.target.value })}
                  style={{ ...backgroundBorderInputs, border: errors.wingspan ? "1px solid red" : "1px solid #D1D5DB" }}
                />
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
                  onChange={e => setFormValues({ ...formValues, maxSpeed: e.target.value })}
                  style={{ ...backgroundBorderInputs, border: errors.maxSpeed ? "1px solid red" : "1px solid #D1D5DB" }}
                />
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
                  onChange={e => setFormValues({ ...formValues, impactEnergy: e.target.value })}
                  style={{ ...backgroundBorderInputs, border: errors.impactEnergy ? "1px solid red" : "1px solid #D1D5DB" }}
                />
              </div>
            </div>

            {/* Row 4: Cámara, Imagen */}
            <div className="row mb-3">
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
                {errors.image && <div className="text-danger small">Campo requerido</div>}
              </div>
            </div>

            {/* ----- OPCIONALES ----- */}
            <div className="mb-3">
              <button
                type="button"
                className="btn btn-link"
                onClick={() => setShowOpcionales(v => !v)}
                style={{ textDecoration: "none", color: "#16a34a" }}
              >
                {showOpcionales ? "▲ Ocultar detalles adicionales" : "▼ Añadir más detalles"}
              </button>
            </div>

            {showOpcionales && (
              <div className="card card-body mb-3" style={{ background: "#F9FAFB" }}>
                <div className="row mb-3">
                  <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <label className="form-label">Tipo de aplicante</label>
                    <Select
                      options={applicantTypes}
                      styles={backgroundBorderInputsSelect}
                      placeholder="Seleccione tipo"
                      value={formValues.applicantType}
                      isClearable
                      onChange={val => setFormValues({ ...formValues, applicantType: val })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Nombre de aplicante</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formValues.applicantName}
                      onChange={e => setFormValues({ ...formValues, applicantName: e.target.value })}
                      style={backgroundBorderInputs}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <label className="form-label">Fuente de poder</label>
                    <Select
                      options={powerSources}
                      styles={backgroundBorderInputsSelect}
                      placeholder="Seleccione fuente"
                      value={formValues.powerSource}
                      isClearable
                      onChange={val => setFormValues({ ...formValues, powerSource: val })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Tipo de fuente</label>
                    <Select
                      options={powerSourceTypes}
                      isDisabled={isElectric}
                      styles={backgroundBorderInputsSelect}
                      placeholder={isElectric ? "Eléctrico (automático)" : "Seleccione subtipo"}
                      value={formValues.powerSourceType}
                      isClearable
                      onChange={val => setFormValues({ ...formValues, powerSourceType: val })}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <label className="form-label">Observaciones</label>
                    <textarea
                      className="form-control"
                      value={formValues.observaciones}
                      onChange={e => setFormValues({ ...formValues, observaciones: e.target.value })}
                      style={backgroundBorderInputs}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Accesorios</label>
                    <textarea
                      className="form-control"
                      value={formValues.accesorios}
                      onChange={e => setFormValues({ ...formValues, accesorios: e.target.value })}
                      style={backgroundBorderInputs}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Fecha de compra</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formValues.purchaseDate}
                      onChange={e => setFormValues({ ...formValues, purchaseDate: e.target.value })}
                      style={backgroundBorderInputs}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-danger">{error}</p>}

            <div className="d-flex gap-2 mt-3 justify-content-center">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? "Cargando..." : "Registrar aeronave"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
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