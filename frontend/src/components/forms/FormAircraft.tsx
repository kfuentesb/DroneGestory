import React, { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";
import { aircraftClasses, configs, LIMITS } from "../../global-const/aircraft-const";
import { InfoBadge } from "../commons/InfoBadge";
import AircraftDocumentationSection, {
  aircraftDocumentationFields,
  getVisibleAircraftDocumentationFields,
} from "../certificates/AircraftDocumentationSection";
import { getAircraftDocumentationFlags } from "../certificates/aircraftDocumentationUtils";
import "../../styles/generic-form.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;

type SelectOption = { value: string; label: string };

type AircraftDocumentationUploadRequest = {
  documentationType: string;
  documentationLabel: string;
  fileFieldKey: string | null;
  expireDate: string | null;
  dateIndefinite: boolean | null;
  removeDefault: boolean | null;
};

type InitialDocumentationItem = {
  id: number;
  aircraftModelId: number;
  documentationType: string;
  documentationName: string | null;
  expireDate: string | null;
  dateIndefinite: boolean | null;
};

interface FormAircraftProps {
  initialValues?: {
    manufacturer?: string;
    model?: string;
    imagePath?: string;
    aircraftClassDefault?: string;
    mtomDefault?: number;
    wingspanDefault?: number;
    maxSpeedDefault?: number;
    configDefault?: string;
    impactEnergyDefault?: number;
    hasCameraDefault?: boolean;
    privatelyBuiltDefault?: boolean;
    hasParachuteDefault?: boolean;
    hasEnsuranceDefault?: boolean;
    hasFTSDefault?: boolean;
    cautiveDefault?: string;
    accessoriesDefault?: string;
  };
  initialDocumentation?: InitialDocumentationItem[];
}

export default function FormAircraft({ initialValues, initialDocumentation = [] }: FormAircraftProps) {
  const yesNoOptions: SelectOption[] = [
    { value: "true", label: "Sí" },
    { value: "false", label: "No" },
  ];

  const cautiveOptions: SelectOption[] = [
    { value: "YES", label: "Sí" },
    { value: "NO", label: "No" },
    { value: "OPTIONAL", label: "Opcional" },
  ];

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModelDefaultImage, setShowModelDefaultImage] = useState(Boolean(initialValues?.imagePath));
  const modelDefaultImageName = initialValues?.imagePath?.split("/").pop() ?? "";
  const getOptionByValue = (options: SelectOption[], value?: string | null) =>
    value ? options.find((option) => option.value === value) ?? null : null;
  const getYesNoOption = (value?: boolean | null) =>
    value === null || value === undefined ? null : yesNoOptions.find((option) => option.value === String(value)) ?? null;

  const documentationByType = Object.fromEntries(
    initialDocumentation.map((doc) => [doc.documentationType, doc] as const)
  ) as Record<string, InitialDocumentationItem>;
  const [documentationFiles, setDocumentationFiles] = useState<Record<string, File | null>>(
    Object.fromEntries(aircraftDocumentationFields.map((f) => [f.fileKey, null]))
  );
  const [documentationFormValues, setDocumentationFormValues] = useState<Record<string, string>>(
    Object.fromEntries(
      aircraftDocumentationFields.map((f) => [
        f.dateKey,
        documentationByType[f.key]?.dateIndefinite ? "" : (documentationByType[f.key]?.expireDate ?? ""),
      ])
    )
  );
  const [documentationChecks, setDocumentationChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(
      aircraftDocumentationFields.flatMap((f) => [
        [f.enabledKey, Boolean(documentationByType[f.key])],
        [f.indefiniteKey, Boolean(documentationByType[f.key]?.dateIndefinite)],
      ])
    )
  );
  const [existingDocumentationFileNames] = useState<Record<string, string>>(
    Object.fromEntries(
      aircraftDocumentationFields.map((f) => {
        const fullPath = documentationByType[f.key]?.documentationName ?? "";
        const fileName = fullPath ? fullPath.split("/").pop() ?? "" : "";
        return [f.fileKey, fileName];
      })
    )
  );
  const [modelDefaultByType] = useState<Record<string, boolean>>(
    Object.fromEntries(aircraftDocumentationFields.map((f) => [f.key, Boolean(documentationByType[f.key])]))
  );

  const [formValues, setFormValues] = useState({
    manufacturer: initialValues?.manufacturer ?? "",
    model: initialValues?.model ?? "",
    serialNumber: "",
    aircraftClass: getOptionByValue(aircraftClasses, initialValues?.aircraftClassDefault) as SelectOption | null,
    mtom: initialValues?.mtomDefault ?? 0,
    wingspan: initialValues?.wingspanDefault ?? 0,
    maxSpeed: initialValues?.maxSpeedDefault ?? 0,
    config: getOptionByValue(configs, initialValues?.configDefault) as SelectOption | null,
    impactEnergy: initialValues?.impactEnergyDefault ?? 0,
    hasCamera: getYesNoOption(initialValues?.hasCameraDefault) as SelectOption | null,
    privatelyBuilt: getYesNoOption(initialValues?.privatelyBuiltDefault) as SelectOption | null,
    hasParachute: getYesNoOption(initialValues?.hasParachuteDefault) as SelectOption | null,
    hasEnsurance: getYesNoOption(initialValues?.hasEnsuranceDefault) as SelectOption | null,
    hasFTS: getYesNoOption(initialValues?.hasFTSDefault) as SelectOption | null,
    cautive: getOptionByValue(cautiveOptions, initialValues?.cautiveDefault) as SelectOption | null,
    accessories: initialValues?.accessoriesDefault ?? "",
    image: null as File | null,
  });

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
    tooMuchTextAccesories: false,
  });

  const navigate = useNavigate();
  const isExistingModel = Boolean(initialValues?.manufacturer && initialValues?.model);
  const { showInsuranceDocumentation, showFTSDocumentation, showParachuteDocumentation } = getAircraftDocumentationFlags({
    hasEnsurance: formValues.hasEnsurance,
    hasFTS: formValues.hasFTS,
    hasParachute: formValues.hasParachute,
  });

  console.log("FormAircraft - Initial Values:", initialValues);
  console.log("FormAircraft - Form Values:", formValues);
  console.log("FormAircraft - Documentation Flags:", {
    showInsuranceDocumentation,
    showFTSDocumentation,
    showParachuteDocumentation,
  });
  const allowedImageTypes = ["image/jpeg", "image/png"];
  const allowedDocumentationTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];

  const backgroundBorderInputsSelect = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "#F3F4F6",
      borderColor: "#D1D5DB",
    }),
  };

  const backgroundBorderInputs = {
    backgroundColor: "#F3F4F6",
    borderColor: "#D1D5DB",
  };

  const infoText = (
    <>
      <p>
        Los UAS que no sean de construcción privada y cumplan con la directiva de comercialización de productos
        aplicable actualmente en la Unión Europea (Decisión 768/2008/CE), pero no pertenezcan a una de las clases
        C0, C1, C2, C3 o C4 establecidas en el Reglamento Delegado (UE) 2019/945 de la Comisión, podrán seguir
        utilizándose si han sido introducidos en el mercado de la Unión Europea antes del 1 de enero de 2024.
      </p>
    </>
  );

  const validateDocumentationFile = (file: File): string | null => {
    if (!allowedDocumentationTypes.includes(file.type)) {
      return "Solo PDF, JPG, PNG o WEBP.";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "El archivo debe pesar menos de 5MB.";
    }
    return null;
  };

  const handleDocumentationToggle = (id: string) => {
    setDocumentationChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDocumentationFileChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setDocumentationFiles((prev) => ({ ...prev, [id]: null }));
      return;
    }

    const validationError = validateDocumentationFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setDocumentationFiles((prev) => ({ ...prev, [id]: file }));
    setError(null);
  };

  const handleDocumentationClearFile = (id: string, inputId: string) => {
    setDocumentationFiles((prev) => ({ ...prev, [id]: null }));
    const fileInput = document.getElementById(inputId) as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  };

  const handleDocumentationDateChange = (key: string, value: string) => {
    setDocumentationFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const buildDocumentationPayload = (): {
    metadata: AircraftDocumentationUploadRequest[];
    files: Array<{ fileFieldKey: string; file: File }>;
  } => {
    const metadata: AircraftDocumentationUploadRequest[] = [];
    const files: Array<{ fileFieldKey: string; file: File }> = [];
    const visibleDocumentationFields = getVisibleAircraftDocumentationFields("aircraft", isExistingModel, showInsuranceDocumentation, showFTSDocumentation, showParachuteDocumentation);

    visibleDocumentationFields.forEach((field) => {
      const baselineDoc = documentationByType[field.key];
      const enabled = Boolean(documentationChecks[field.enabledKey]);
      const supportsDate = field.key === "seguroResponsabilidadCivil";
      const indefinite = supportsDate ? Boolean(documentationChecks[field.indefiniteKey]) : false;
      const expireDate = supportsDate ? (documentationFormValues[field.dateKey] || null) : null;
      const file = documentationFiles[field.fileKey];
      const fileFieldKey = file ? `documentation_${field.key}` : null;

      if (baselineDoc) {
        if (!enabled) {
          metadata.push({
            documentationType: field.key,
            documentationLabel: field.label,
            fileFieldKey: null,
            expireDate: null,
            dateIndefinite: null,
            removeDefault: true,
          });
          return;
        }

        const baselineDateIndefinite = Boolean(baselineDoc.dateIndefinite);
        const baselineExpireDate = supportsDate ? (baselineDateIndefinite ? null : baselineDoc.expireDate) : null;
        const effectiveExpireDate = supportsDate ? (indefinite ? null : expireDate) : null;
        const changed = Boolean(file) || (supportsDate && (baselineDateIndefinite !== indefinite || baselineExpireDate !== effectiveExpireDate));

        if (!changed) {
          return;
        }
      }

      const hasAnyData = enabled || indefinite || Boolean(expireDate) || Boolean(file);
      if (!hasAnyData) {
        return;
      }

      metadata.push({
        documentationType: field.key,
        documentationLabel: field.label,
        fileFieldKey,
        expireDate: supportsDate && !indefinite ? expireDate : null,
        dateIndefinite: supportsDate && enabled ? indefinite : null,
        removeDefault: null,
      });

      if (file && fileFieldKey) {
        files.push({ fileFieldKey, file });
      }
    });

    return { metadata, files };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setFormValues({ ...formValues, image: null });
      setError("");
      return;
    }
    if (!allowedImageTypes.includes(file.type)) {
      setError("Solo se permiten imágenes JPG o PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe pesar menos de 5MB.");
      return;
    }
    setSelectedFile(file);
    setShowModelDefaultImage(false);
    setFormValues({ ...formValues, image: file });
    setError("");
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFormValues({ ...formValues, image: null });
    setShowModelDefaultImage(false);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
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
      mtom:
        formValues.mtom === 0 ||
        isNaN(Number(formValues.mtom)) ||
        Number(formValues.mtom) < LIMITS.MIN_MTOM ||
        Number(formValues.mtom) > LIMITS.MAX_MTOM,
      wingspan:
        formValues.wingspan === 0 ||
        isNaN(Number(formValues.wingspan)) ||
        Number(formValues.wingspan) < LIMITS.MIN_WINGSPAN ||
        Number(formValues.wingspan) > LIMITS.MAX_WINGSPAN,
      maxSpeed:
        formValues.maxSpeed === 0 ||
        isNaN(Number(formValues.maxSpeed)) ||
        Number(formValues.maxSpeed) < 0 ||
        Number(formValues.maxSpeed) > LIMITS.MAX_SPEED,
      impactEnergy:
        formValues.impactEnergy === 0 ||
        isNaN(Number(formValues.impactEnergy)) ||
        Number(formValues.impactEnergy) < 0 ||
        Number(formValues.impactEnergy) > LIMITS.MAX_ENERGY,
      config: !formValues.config,
      hasCamera: formValues.hasCamera === null || formValues.hasCamera === undefined,
      tooMuchTextAccesories: formValues.accessories.length > 800,
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
      if (formValues.manufacturer) formData.append("manufacturer", formValues.manufacturer);
      if (formValues.model) formData.append("model", formValues.model);
      if (formValues.serialNumber) formData.append("serialNumber", formValues.serialNumber);
      if (formValues.aircraftClass) formData.append("aircraftClass", formValues.aircraftClass?.value ?? "");
      if (formValues.mtom) formData.append("mtom", String(formValues.mtom));
      if (formValues.wingspan) formData.append("wingspan", String(formValues.wingspan));
      if (formValues.maxSpeed) formData.append("maxSpeed", String(formValues.maxSpeed));
      if (formValues.config) formData.append("config", formValues.config?.value ?? "");
      if (formValues.impactEnergy) formData.append("impactEnergy", String(formValues.impactEnergy));
      if (formValues.hasCamera) formData.append("hasCamera", formValues.hasCamera?.value === "true" ? "true" : "false");

      if (formValues.privatelyBuilt) formData.append("privatelyBuilt", formValues.privatelyBuilt.value);
      if (formValues.hasParachute) formData.append("hasParachute", formValues.hasParachute.value);
      if (formValues.hasEnsurance) formData.append("hasEnsurance", formValues.hasEnsurance.value);
      if (formValues.hasFTS) formData.append("hasFTS", formValues.hasFTS.value);
      if (formValues.cautive) formData.append("cautive", formValues.cautive.value);
      if (formValues.accessories.trim()) formData.append("accessories", formValues.accessories.trim());
      if (selectedFile) {
        formData.append("imageFile", selectedFile, selectedFile.name);
      }
      if (initialValues?.imagePath) {
        formData.append("useModelDefaultImage", String(showModelDefaultImage));
      }

      const documentationPayload = buildDocumentationPayload();
      formData.append("documentations", JSON.stringify(documentationPayload.metadata));
      documentationPayload.files.forEach(({ fileFieldKey, file }) => {
        formData.append(fileFieldKey, file, file.name);
      });

      const res = await apiFetch(`${API_BASE_URL}/api/aircraft`, {
        method: "POST",
        body: formData,
      });

      if (!res) return;
      navigate("/aircrafts");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mt-5" style={{ border: "1px solid #E5E7EB", borderRadius: "12px" }}>
      <div className="card-body py-5 pb-5" style={{ maxWidth: "1000px" }}>
        <h2 className="mb-2 fw-bold pb-3" style={{ color: "#1E1E1E" }}>
          Registrar aeronave
        </h2>

        <div
          className="card shadow-sm p-4"
          style={{ borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}
        >
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Fabricante</label>
                <input
                  type="text"
                  className="form-control"
                  value={formValues.manufacturer}
                  onChange={(e) => setFormValues({ ...formValues, manufacturer: e.target.value })}
                  style={{
                    ...backgroundBorderInputs,
                    backgroundColor: !!initialValues?.manufacturer ? "#e9ecef" : backgroundBorderInputs.backgroundColor,
                    cursor: !!initialValues?.manufacturer ? "not-allowed" : "auto",
                    border: errors.manufacturer ? "1px solid red" : "1px solid #D1D5DB",
                  }}
                  disabled={!!initialValues?.manufacturer}
                />
                {errors.manufacturer && <div className="text-danger small">Campo requerido</div>}
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Modelo</label>
                <input
                  type="text"
                  className="form-control"
                  value={formValues.model}
                  onChange={(e) => setFormValues({ ...formValues, model: e.target.value })}
                  style={{
                    ...backgroundBorderInputs,
                    backgroundColor: !!initialValues?.model ? "#e9ecef" : backgroundBorderInputs.backgroundColor,
                    cursor: !!initialValues?.model ? "not-allowed" : "auto",
                    border: errors.model ? "1px solid red" : "1px solid #D1D5DB",
                  }}
                  disabled={!!initialValues?.model}
                />
                {errors.model && <div className="text-danger small">Campo requerido</div>}
              </div>
              <div className="col-12 col-md">
                <label className="form-label d-block text-start ps-1">Nº Serie</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: ABC12345 (2-25 carac.)"
                  value={formValues.serialNumber}
                  onChange={(e) => setFormValues({ ...formValues, serialNumber: e.target.value })}
                  style={{ ...backgroundBorderInputs, border: errors.serialNumber ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {errors.serialNumber && <div className="text-danger small">Campo requerido</div>}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">
                  Clase <InfoBadge text={infoText} />
                </label>
                <Select
                  options={aircraftClasses}
                  styles={backgroundBorderInputsSelect}
                  placeholder="Seleccione clase"
                  value={formValues.aircraftClass}
                  onChange={(val) => setFormValues({ ...formValues, aircraftClass: val })}
                  isClearable
                />
                {errors.aircraftClass && <div className="text-danger small">Campo requerido</div>}
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">MTOM (Kg)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formValues.mtom}
                  onChange={(e) => setFormValues({ ...formValues, mtom: e.target.value === "" ? 0 : Number(e.target.value) })}
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
                  onChange={(e) =>
                    setFormValues({ ...formValues, wingspan: e.target.value === "" ? 0 : Number(e.target.value) })
                  }
                  style={{ ...backgroundBorderInputs, border: errors.wingspan ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {errors.wingspan && (
                  <div className="text-danger small">
                    Rango permitido: {LIMITS.MIN_WINGSPAN} - {LIMITS.MAX_WINGSPAN} m
                  </div>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Velocidad máx. (m/s)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formValues.maxSpeed}
                  onChange={(e) =>
                    setFormValues({ ...formValues, maxSpeed: e.target.value === "" ? 0 : Number(e.target.value) })
                  }
                  style={{ ...backgroundBorderInputs, border: errors.maxSpeed ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {errors.maxSpeed && <div className="text-danger small">Máximo permitido: {LIMITS.MAX_SPEED} km/h</div>}
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Configuración</label>
                <Select
                  options={configs}
                  styles={backgroundBorderInputsSelect}
                  placeholder="Seleccione configuración"
                  value={formValues.config}
                  onChange={(val) => setFormValues({ ...formValues, config: val })}
                  isClearable
                />
                {errors.config && <div className="text-danger small">Campo requerido</div>}
              </div>
              <div className="col-12 col-md">
                <label className="form-label d-block text-start ps-1">Energía de impacto (J)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formValues.impactEnergy}
                  onChange={(e) =>
                    setFormValues({ ...formValues, impactEnergy: e.target.value === "" ? 0 : Number(e.target.value) })
                  }
                  style={{
                    ...backgroundBorderInputs,
                    border: errors.impactEnergy ? "1px solid red" : "1px solid #D1D5DB",
                  }}
                />
                {errors.impactEnergy && (
                  <div className="text-danger small">Máximo permitido: {LIMITS.MAX_ENERGY} Julios</div>
                )}
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Cámara</label>
                <Select
                  options={yesNoOptions}
                  styles={backgroundBorderInputsSelect}
                  placeholder="¿Tiene cámara?"
                  value={formValues.hasCamera}
                  onChange={(val) => setFormValues({ ...formValues, hasCamera: val })}
                  isClearable
                />
                {errors.hasCamera && <div className="text-danger small">Campo requerido</div>}
              </div>
              <div className="col-12 col-md">
                <label className="form-label d-block text-start ps-1">Imagen</label>
                <div
                  className="d-flex align-items-center rounded"
                  style={{ backgroundColor: "#F3F4F6", border: "1px solid #D1D5DB", paddingLeft: "10px" }}
                >
                  <span className="text-truncate" style={{ maxWidth: "150px" }}>
                    {selectedFile ? selectedFile.name : (showModelDefaultImage && modelDefaultImageName ? modelDefaultImageName : "No hay archivo")}
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
                    style={{
                      cursor: "pointer",
                      borderTopRightRadius: selectedFile || showModelDefaultImage ? "0" : "4px",
                      borderBottomRightRadius: selectedFile || showModelDefaultImage ? "0" : "4px",
                      marginRight: "0",
                    }}
                  >
                    Seleccionar archivo
                  </label>
                  {(selectedFile || showModelDefaultImage) && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={selectedFile ? handleClearFile : () => setShowModelDefaultImage(false)}
                      style={{
                        borderTopLeftRadius: "0",
                        borderBottomLeftRadius: "0",
                        borderLeft: "1px solid rgba(255,255,255,0.1)",
                      }}
                      title={selectedFile ? "Eliminar archivo seleccionado" : "No usar imagen por defecto del modelo"}
                    >
                      ✕
                    </button>
                  )}
                </div>
                {!selectedFile && showModelDefaultImage && modelDefaultImageName && (
                  <small className="text-warning d-block text-start mt-1">
                    Imagen por defecto del modelo
                  </small>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Construcción privada</label>
                <Select
                  options={yesNoOptions}
                  styles={backgroundBorderInputsSelect}
                  placeholder="¿Es de construcción privada?"
                  value={formValues.privatelyBuilt}
                  onChange={(val) => setFormValues({ ...formValues, privatelyBuilt: val })}
                  isClearable
                />
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Paracaídas</label>
                <Select
                  options={yesNoOptions}
                  styles={backgroundBorderInputsSelect}
                  placeholder="¿Tiene paracaídas?"
                  value={formValues.hasParachute}
                  onChange={(val) => setFormValues({ ...formValues, hasParachute: val })}
                  isClearable
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Seguro de responsabilidad civil</label>
                <Select
                  options={yesNoOptions}
                  styles={backgroundBorderInputsSelect}
                  placeholder="¿Tiene seguro?"
                  value={formValues.hasEnsurance}
                  onChange={(val) => setFormValues({ ...formValues, hasEnsurance: val })}
                  isClearable
                />
              </div>
              <div className="col-12 col-md">
                <label className="form-label d-block text-start ps-1">Sistema de Terminación de Vuelo (FTS)</label>
                <Select
                  options={yesNoOptions}
                  styles={backgroundBorderInputsSelect}
                  placeholder="¿Tiene FTS?"
                  value={formValues.hasFTS}
                  onChange={(val) => setFormValues({ ...formValues, hasFTS: val })}
                  isClearable
                />
              </div>
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label d-block text-start ps-1">Cautivo</label>
                <Select
                  options={cautiveOptions}
                  styles={backgroundBorderInputsSelect}
                  placeholder="Seleccione estado"
                  value={formValues.cautive}
                  onChange={(val) => setFormValues({ ...formValues, cautive: val })}
                  isClearable
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12 col-md">
                <label className="form-label d-block text-start ps-1">Accesorios / Notas (800 caracteres)</label>
                <textarea
                  className="form-control"
                  placeholder="Describe accesorios o notas relevantes"
                  rows={3}
                  style={{ ...backgroundBorderInputs, resize: "vertical", minHeight: "80px" }}
                  value={formValues.accessories}
                  onChange={(e) => setFormValues({ ...formValues, accessories: e.target.value })}
                />
              </div>
              {errors.tooMuchTextAccesories && <div className="text-danger small">Límite 800 caracteres</div>}
            </div>

            <AircraftDocumentationSection
              context={"aircraft"}
              isExistingModel={isExistingModel}
              showInsuranceDocumentation={showInsuranceDocumentation}
              showFTSDocumentation={showFTSDocumentation}
              showParachuteDocumentation={showParachuteDocumentation}
              activeChecks={documentationChecks}
              selectedFiles={documentationFiles}
              formValues={documentationFormValues}
              existingFileNames={existingDocumentationFileNames}
              modelDefaultByType={modelDefaultByType}
              onlyInsuranceHasDates
              onToggleCheck={handleDocumentationToggle}
              onFileChange={handleDocumentationFileChange}
              onClearFile={handleDocumentationClearFile}
              onFormDateChange={handleDocumentationDateChange}
            />

            {error && <p className="text-danger text-center">{error}</p>}

            <div className="d-flex gap-2 mt-3 justify-content-center">
              <button type="submit" className="btn btn-success px-4" disabled={loading}>
                {loading ? "Cargando..." : "Registrar aeronave"}
              </button>
              <button type="button" className="btn btn-secondary px-4" onClick={() => navigate("/aircrafts")} disabled={loading}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
