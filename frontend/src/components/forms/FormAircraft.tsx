import React, { useState } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import { apiFetch } from '../../api';
import { aircraftClasses, configs, LIMITS } from '../../global-const/aircraft-const';
import { InfoBadge } from '../commons/InfoBadge';
import InsertDoc from "../commons/InsertDoc"
import '../../styles/generic-form.css';

type SelectOption = { value: string; label: string };

export default function FormAircraft() {
  const yesNoOptions: SelectOption[] = [
    { value: "true", label: "Sí" },
    { value: "false", label: "No" }
  ];

  const optionalYesNoOptions: SelectOption[] = [
    { value: "true", label: "Sí" },
    { value: "false", label: "No" },
    { value: "optional", label: "Opcional" }
  ];

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null);
  const [activeChecks, setActiveChecks] = useState<Record<string, boolean>>({});
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
    privatelyBuilt: null as SelectOption | null,
    parachute: null as SelectOption | null,
    hasInsurance: null as SelectOption | null,
    insuranceDate: "",
    hasFts: null as SelectOption | null,
    tether: null as SelectOption | null,
    accessories: "",
    observations: "",
    image: null as File | null,
  });

  const infoText = (
    <>
        <p>Los UAS que no sean de construcción privada y cumplan con la directiva de comercialización
        de productos aplicable actualmente en la Unión Europea (Decisión 768/2008/CE), pero no pertenezcan
        a una de las clases C0, C1, C2, C3 o C4 establecidas en el Reglamento Delegado (UE) 2019/945 de
        la Comisión, podrán seguir utilizándose si han sido introducidos en el mercado de la Unión Europea
        antes del 1 de enero de 2024 de la siguiente forma:
        </p>
        <ul>
          <li>Si la masa máxima de despegue de la aeronave no tripulada es inferior a 250g, incluida la
            carga útil, operación en subcategoría A1.
          </li>
          <li>Si la masa máxima de despegue de la aeronave no tripulada es inferior a 25kg, incluidos
            el carburante y la carga útil, operación en subcategoría A3.
          </li>
        </ul>

    </>
);

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
    insuranceDate: false,
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
        setFormValues({ ...formValues, image: null });
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
      insuranceDate:
        formValues.hasInsurance?.value === "true" &&
        !activeChecks["indefinite-insurance"] &&
        !formValues.insuranceDate,
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
      if (formValues.privatelyBuilt) {
        formData.append("privatelyBuilt", formValues.privatelyBuilt.value);
      }
      if (formValues.parachute) {
        formData.append("parachute", formValues.parachute.value);
      }
      if (formValues.hasInsurance) {
        formData.append("hasInsurance", formValues.hasInsurance.value);
      }
      if (formValues.hasInsurance?.value === "true" && formValues.insuranceDate && !activeChecks["indefinite-insurance"]) {
        formData.append("insuranceDate", formValues.insuranceDate);
      }
      if (formValues.hasFts) {
        formData.append("hasFts", formValues.hasFts.value);
      }
      if (formValues.tether && formValues.tether.value !== "optional") {
        formData.append("tether", formValues.tether.value);
      }
      if (formValues.accessories.trim()) {
        formData.append("accessories", formValues.accessories.trim());
      }
      if (formValues.observations.trim()) {
        formData.append("observations", formValues.observations.trim());
      }
      if (insuranceFile) {
        formData.append("insuranceFile", insuranceFile, insuranceFile.name);
      }

      if (selectedFile) {
        formData.append("imageFile", selectedFile, selectedFile.name);
      }

      const res = await apiFetch(`${API_BASE_URL}/api/aircraft`, {
        method: "POST",
        body: formData
      });

      if (!res) return;
            navigate("/aircrafts");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onToggleCheck = (field: string) => {
    setActiveChecks((prev) => {
      const next = !prev[field];
      if (field === "indefinite-insurance" && next) {
        setFormValues((current) => ({ ...current, insuranceDate: "" }));
      }
      return { ...prev, [field]: next };
    });
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] ?? null;
    if (field === "insuranceFile") {
      setInsuranceFile(file);
    }
  }

  const onClearFile = (field: string, inputId: string) => {
    if (field === "insuranceFile") {
      setInsuranceFile(null);
    }
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (input) {
      input.value = "";
    }
  }

  const onFormDateChange = (field: string, value: string | null) => {
    if (field === "insuranceDate") {
      const nextValue = value ?? "";
      setFormValues((prev) => ({ ...prev, insuranceDate: nextValue }));
      setErrors((prev: any) => ({ ...prev, insuranceDate: false }));
    }
  }

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
                <label className="form-label d-block text-start ps-1">Clase
                  <InfoBadge text={infoText} />
                </label>
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
                  options={yesNoOptions}
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

            {/* Row 5: Construcción, seguro responsabilidad civil, FTS */}
            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Construcción privada</label>
                <Select
                  options={yesNoOptions}
                  styles={backgroundBorderInputsSelect}
                  placeholder="¿Es de construcción privada?"
                  value={formValues.privatelyBuilt}
                  onChange={val => setFormValues({ ...formValues, privatelyBuilt: val })}
                />
                {/* {errors.hasCamera && <div className="text-danger small">Campo requerido</div>} */}
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Paracaídas</label>
                <Select
                  options={yesNoOptions}
                  styles={backgroundBorderInputsSelect}
                  placeholder="¿Tiene paracaídas?"
                  value={formValues.parachute}
                  onChange={val => setFormValues({ ...formValues, parachute: val })}
                />
                {/* {errors.hasCamera && <div className="text-danger small">Campo requerido</div>} */}
              </div>
            </div>

            {/* Row 6: Seguro Responsabilidad Civil */}
            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Seguro Responsabilidad Civil</label>
                
                <Select
                  options={yesNoOptions}
                  styles={backgroundBorderInputsSelect}
                  placeholder="¿Tiene seguro?"
                  value={formValues.hasInsurance || null}
                  onChange={(val) =>
                    setFormValues((prev) => {
                      if (val?.value !== "true") {
                        setActiveChecks((checks) => ({ ...checks, ["indefinite-insurance"]: false }));
                      }
                      return {
                        ...prev,
                        hasInsurance: val,
                        insuranceDate: val?.value === "true" ? prev.insuranceDate : "",
                      };
                    })
                  }
                />

                {/* CONDITIONAL RENDERING: Only shows if "Sí" is selected */}
                {/* {formValues.hasInsurance?.value === "true" && (
                  <div className="mt-3 animate__animated animate__fadeIn"> 
                    <InsertDoc
                      className="mb-2"
                      showAddBtn={false}
                      checkboxLabel="Adjuntar Seguro"
                      isChecked={true}
                      onToggleCheck={() => undefined}
                      fileInputId="file-upload-insurance"
                      selectedFile={insuranceFile}
                      existingFileName={null}
                      onFileChange={(e: any) => onFileChange(e, "insuranceFile")}
                      onClearFile={() => onClearFile("insuranceFile", "file-upload-insurance")}
                      expirationDate={formValues.insuranceDate || ""}
                      onExpirationDateChange={(value: any) => onFormDateChange("insuranceDate", value)}
                      indefiniteId="indefinite-insurance"
                      isIndefinite={!!activeChecks["indefinite-insurance"]}
                      onToggleIndefinite={() => onToggleCheck("indefinite-insurance")}
                    />
                    {errors.insuranceDate && (
                      <div className="text-danger small">Si marca seguro, indique vencimiento o indefinido.</div>
                    )}
                  </div>
                )} */}

                {/* {errors.hasInsurance && <div className="text-danger small">Campo requerido</div>} */}
              </div>
            </div>

            {/* Row 7: FTS / Cautivo */}
            <div className="row mb-3">
              <div className="col-12 col-md">
                <label className="form-label d-block text-start ps-1">Sistema de Terminación de Vuelo</label>
                <Select
                  options={yesNoOptions}
                  styles={backgroundBorderInputsSelect}
                  placeholder="¿Tiene FTS?"
                  value={formValues.hasFts}
                  onChange={val => setFormValues({ ...formValues, hasFts: val })}
                />
                {/* {errors.hasCamera && <div className="text-danger small">Campo requerido</div>} */}
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Cautivo</label>
                <Select
                  options={optionalYesNoOptions}
                  styles={backgroundBorderInputsSelect}
                  placeholder="¿Es cautivo?"
                  value={formValues.tether}
                  onChange={val => setFormValues({ ...formValues, tether: val })}
                />
                {/* {errors.hasCamera && <div className="text-danger small">Campo requerido</div>} */}
              </div>
            </div>

            {/* Row 8: Accesorios / Notas */}
            <div className="row mb-3">
              <div className="col-12 col-md">
                <div className="d-flex align-items-center mb-2">
                    <label className="form-label mb-0 ps-1">Accesorios / Notas</label>
                    <InfoBadge text="Detalla los accesorios, FTS o cualquier nota adicional del equipo." />
                </div>
                
                <textarea
                    className="form-control"
                    placeholder="Describe los accesorios o detalles adicionales aquí..."
                    rows={4} 
                    style={{
                        ...backgroundBorderInputs,
                        resize: 'vertical',
                        minHeight: '100px'
                    }}
                    value={formValues.observations}
                    onChange={e => setFormValues({ ...formValues, observations: e.target.value, accessories: e.target.value })}
                />
                {/* {errors.hasCamera && <div className="text-danger small">Campo requerido</div>} */}
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
                            onClick={() => navigate("/aircrafts")}
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
