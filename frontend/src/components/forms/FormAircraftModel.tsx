import { useState } from "react";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";

import { apiFetch } from "../../api";
import { aircraftClasses, configs } from "../../global-const/aircraft-const";
import AircraftDocumentationSection, {
  aircraftDocumentationFields,
} from "../certificates/AircraftDocumentationSection";
import { getAircraftDocumentationFlags } from "../certificates/aircraftDocumentationUtils";

type AircraftDocumentationUploadRequest = {
  documentationType: string;
  documentationLabel: string;
  fileFieldKey: string | null;
  expireDate: string | null;
  dateIndefinite: boolean | null;
  removeDefault: boolean | null;
};

type SelectOption = { value: string; label: string };

export default function FormAircraftModel() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { from?: string } | null)?.from ?? "/aircraft-models";
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [showDefaults, setShowDefaults] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ manufacturer: false, model: false });

  const yesNoOptions: SelectOption[] = [
    { value: "true", label: "Si" },
    { value: "false", label: "No" },
  ];

  const cautiveOptions: SelectOption[] = [
    { value: "YES", label: "Si" },
    { value: "NO", label: "No" },
    { value: "OPTIONAL", label: "Opcional" },
  ];

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

  const [defaultValues, setDefaultValues] = useState({
    aircraftClassDefault: null as SelectOption | null,
    mtomDefault: "",
    wingspanDefault: "",
    maxSpeedDefault: "",
    configDefault: null as SelectOption | null,
    impactEnergyDefault: "",
    hasCameraDefault: null as SelectOption | null,
    privatelyBuiltDefault: null as SelectOption | null,
    hasParachuteDefault: null as SelectOption | null,
    hasEnsuranceDefault: null as SelectOption | null,
    hasFTSDefault: null as SelectOption | null,
    cautiveDefault: null as SelectOption | null,
    accessoriesDefault: "",
  });
  const [documentationFiles, setDocumentationFiles] = useState<Record<string, File | null>>(
    Object.fromEntries(aircraftDocumentationFields.map((f) => [f.fileKey, null]))
  );
  const [documentationFormValues, setDocumentationFormValues] = useState<Record<string, string>>(
    Object.fromEntries(aircraftDocumentationFields.map((f) => [f.dateKey, ""]))
  );
  const [documentationChecks, setDocumentationChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(
      aircraftDocumentationFields.flatMap((f) => [
        [f.enabledKey, false],
        [f.indefiniteKey, false],
      ])
    )
  );

  const manufacturerError = touched.manufacturer && !manufacturer.trim();
  const modelError = touched.model && !model.trim();
  const { showInsuranceDocumentation, showFTSDocumentation, showParachuteDocumentation } = getAircraftDocumentationFlags({
    hasEnsurance: defaultValues.hasEnsuranceDefault,
    hasFTS: defaultValues.hasFTSDefault,
    hasParachute: defaultValues.hasParachuteDefault,
  });

  const parseNumber = (value: string): number | undefined => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedImageTypes.includes(file.type)) {
      setError("Solo se permiten imagenes JPG o PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe pesar menos de 5MB.");
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const validateDocumentationFile = (file: File): string | null => {
    const allowedDocumentationTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
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

    aircraftDocumentationFields.forEach((field) => {
      const supportsDate = field.key === "seguroResponsabilidadCivil";
      const enabled = Boolean(documentationChecks[field.enabledKey]);
      const indefinite = supportsDate ? Boolean(documentationChecks[field.indefiniteKey]) : false;
      const expireDate = supportsDate ? (documentationFormValues[field.dateKey] || null) : null;
      const file = documentationFiles[field.fileKey];
      const fileFieldKey = file ? `documentation_${field.key}` : null;

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ manufacturer: true, model: true });
    setError(null);

    if (!manufacturer.trim() || !model.trim()) {
      setError("Fabricante y modelo son obligatorios.");
      return;
    }

    const formData = new FormData();
    formData.append("manufacturer", manufacturer.trim());
    formData.append("model", model.trim());

    if (showDefaults) {
      if (defaultValues.aircraftClassDefault?.value) formData.append("aircraftClassDefault", defaultValues.aircraftClassDefault.value);
      if (parseNumber(defaultValues.mtomDefault) !== undefined) formData.append("mtomDefault", String(parseNumber(defaultValues.mtomDefault)));
      if (parseNumber(defaultValues.wingspanDefault) !== undefined) formData.append("wingspanDefault", String(parseNumber(defaultValues.wingspanDefault)));
      if (parseNumber(defaultValues.maxSpeedDefault) !== undefined) formData.append("maxSpeedDefault", String(parseNumber(defaultValues.maxSpeedDefault)));
      if (defaultValues.configDefault?.value) formData.append("configDefault", defaultValues.configDefault.value);
      if (parseNumber(defaultValues.impactEnergyDefault) !== undefined) formData.append("impactEnergyDefault", String(parseNumber(defaultValues.impactEnergyDefault)));
      if (defaultValues.hasCameraDefault) formData.append("hasCameraDefault", defaultValues.hasCameraDefault.value);
      if (defaultValues.privatelyBuiltDefault) formData.append("privatelyBuiltDefault", defaultValues.privatelyBuiltDefault.value);
      if (defaultValues.hasParachuteDefault) formData.append("hasParachuteDefault", defaultValues.hasParachuteDefault.value);
      if (defaultValues.hasEnsuranceDefault) formData.append("hasEnsuranceDefault", defaultValues.hasEnsuranceDefault.value);
      if (defaultValues.hasFTSDefault) formData.append("hasFTSDefault", defaultValues.hasFTSDefault.value);
      if (defaultValues.cautiveDefault?.value) formData.append("cautiveDefault", defaultValues.cautiveDefault.value);
      if (defaultValues.accessoriesDefault.trim()) formData.append("accessoriesDefault", defaultValues.accessoriesDefault.trim());
    }
    if (selectedFile) formData.append("imageFile", selectedFile, selectedFile.name);
    const documentationPayload = buildDocumentationPayload();
    formData.append("documentations", JSON.stringify(documentationPayload.metadata));
    documentationPayload.files.forEach(({ fileFieldKey, file }) => {
      formData.append(fileFieldKey, file, file.name);
    });

    setLoading(true);
    try {
      const res = await apiFetch("/api/aircraft-models", {
        method: "POST",
        body: formData,
      });

      if (!res) return;
      navigate(returnTo);
    } catch (err: any) {
      setError(err?.message ?? "No se pudo registrar el modelo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm position-relative" style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}>
        <button
          type="button"
          className="btn btn-link p-0 mb-3 d-flex align-items-center text-decoration-none text-muted"
          style={{ position: "absolute", top: "10px", left: "20px", zIndex: 10 }}
          onClick={() => navigate(returnTo)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          <span className="ms-2 fw-medium">Volver</span>
        </button>

        <div className="card-body pt-5">
          <h2 className="card-title mb-4" style={{ color: "#1E1E1E" }}>
            Registrar modelo
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-12 col-md mb-3 mb-md-0">
                <label className="form-label">Fabricante</label>
                <input
                  type="text"
                  className="form-control"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, manufacturer: true }))}
                  style={{ ...backgroundBorderInputs, border: manufacturerError ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {manufacturerError && <small className="text-danger">Campo requerido</small>}
              </div>
              <div className="col-12 col-md">
                <label className="form-label">Modelo</label>
                <input
                  type="text"
                  className="form-control"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, model: true }))}
                  style={{ ...backgroundBorderInputs, border: modelError ? "1px solid red" : "1px solid #D1D5DB" }}
                />
                {modelError && <small className="text-danger">Campo requerido</small>}
              </div>
            </div>

            <div className="mb-4">
              <button
                type="button"
                className="btn btn-success"
                onClick={() => setShowDefaults((prev) => !prev)}
              >
                ¿Quiere añadir datos por defecto a este modelo?
              </button>
            </div>

            {showDefaults && (
              <>
                <div className="row mb-3">
                  <div className="col-12 col-md mb-3 mb-md-0">
                    <label className="form-label d-block text-start ps-1">Clase</label>
                    <Select
                      options={aircraftClasses}
                      styles={backgroundBorderInputsSelect}
                      placeholder="Seleccione clase"
                      value={defaultValues.aircraftClassDefault}
                      onChange={(value) => setDefaultValues((prev) => ({ ...prev, aircraftClassDefault: value }))}
                      isClearable
                    />
                  </div>
                  <div className="col-12 col-md mb-3 mb-md-0">
                    <label className="form-label d-block text-start ps-1">MTOM por defecto (Kg)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={defaultValues.mtomDefault}
                      onChange={(e) => setDefaultValues((prev) => ({ ...prev, mtomDefault: e.target.value }))}
                      style={backgroundBorderInputs}
                    />
                  </div>
                  <div className="col-12 col-md">
                    <label className="form-label d-block text-start ps-1">Dimension por defecto (m)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={defaultValues.wingspanDefault}
                      onChange={(e) => setDefaultValues((prev) => ({ ...prev, wingspanDefault: e.target.value }))}
                      style={backgroundBorderInputs}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12 col-md mb-3 mb-md-0">
                    <label className="form-label d-block text-start ps-1">Velocidad max. por defecto (m/s)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={defaultValues.maxSpeedDefault}
                      onChange={(e) => setDefaultValues((prev) => ({ ...prev, maxSpeedDefault: e.target.value }))}
                      style={backgroundBorderInputs}
                    />
                  </div>
                  <div className="col-12 col-md mb-3 mb-md-0">
                    <label className="form-label d-block text-start ps-1">Configuracion</label>
                    <Select
                      options={configs}
                      styles={backgroundBorderInputsSelect}
                      placeholder="Seleccione configuracion"
                      value={defaultValues.configDefault}
                      onChange={(value) => setDefaultValues((prev) => ({ ...prev, configDefault: value }))}
                      isClearable
                    />
                  </div>
                  <div className="col-12 col-md">
                    <label className="form-label d-block text-start ps-1">Energia de impacto por defecto (J)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={defaultValues.impactEnergyDefault}
                      onChange={(e) => setDefaultValues((prev) => ({ ...prev, impactEnergyDefault: e.target.value }))}
                      style={backgroundBorderInputs}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12 col-md mb-3 mb-md-0">
                    <label className="form-label d-block text-start ps-1">Camara por defecto</label>
                    <Select
                      options={yesNoOptions}
                      styles={backgroundBorderInputsSelect}
                      placeholder="Seleccione"
                      value={defaultValues.hasCameraDefault}
                      onChange={(value) => setDefaultValues((prev) => ({ ...prev, hasCameraDefault: value }))}
                      isClearable
                    />
                  </div>
                  <div className="col-12 col-md mb-3 mb-md-0">
                    <label className="form-label d-block text-start ps-1">Construccion privada por defecto</label>
                    <Select
                      options={yesNoOptions}
                      styles={backgroundBorderInputsSelect}
                      placeholder="Seleccione"
                      value={defaultValues.privatelyBuiltDefault}
                      onChange={(value) => setDefaultValues((prev) => ({ ...prev, privatelyBuiltDefault: value }))}
                      isClearable
                    />
                  </div>
                  <div className="col-12 col-md">
                    <label className="form-label d-block text-start ps-1">Paracaidas por defecto</label>
                    <Select
                      options={yesNoOptions}
                      styles={backgroundBorderInputsSelect}
                      placeholder="Seleccione"
                      value={defaultValues.hasParachuteDefault}
                      onChange={(value) => setDefaultValues((prev) => ({ ...prev, hasParachuteDefault: value }))}
                      isClearable
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12 col-md mb-3 mb-md-0">
                    <label className="form-label d-block text-start ps-1">Seguro RC por defecto</label>
                    <Select
                      options={yesNoOptions}
                      styles={backgroundBorderInputsSelect}
                      placeholder="Seleccione"
                      value={defaultValues.hasEnsuranceDefault}
                      onChange={(value) => setDefaultValues((prev) => ({ ...prev, hasEnsuranceDefault: value }))}
                      isClearable
                    />
                  </div>
                  <div className="col-12 col-md mb-3 mb-md-0">
                    <label className="form-label d-block text-start ps-1">FTS por defecto</label>
                    <Select
                      options={yesNoOptions}
                      styles={backgroundBorderInputsSelect}
                      placeholder="Seleccione"
                      value={defaultValues.hasFTSDefault}
                      onChange={(value) => setDefaultValues((prev) => ({ ...prev, hasFTSDefault: value }))}
                      isClearable
                    />
                  </div>
                  <div className="col-12 col-md">
                    <label className="form-label d-block text-start ps-1">Cautivo por defecto</label>
                    <Select
                      options={cautiveOptions}
                      styles={backgroundBorderInputsSelect}
                      placeholder="Seleccione"
                      value={defaultValues.cautiveDefault}
                      onChange={(value) => setDefaultValues((prev) => ({ ...prev, cautiveDefault: value }))}
                      isClearable
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label d-block text-start ps-1">Accesorios / notas por defecto</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={defaultValues.accessoriesDefault}
                      onChange={(e) => setDefaultValues((prev) => ({ ...prev, accessoriesDefault: e.target.value }))}
                      style={{ ...backgroundBorderInputs, resize: "vertical", minHeight: "80px" }}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-12 col-md">
                    <label className="form-label d-block text-start ps-1">Imagen por defecto del modelo</label>
                    <div
                      className="d-flex align-items-center rounded"
                      style={{ backgroundColor: "#F3F4F6", border: "1px solid #D1D5DB", paddingLeft: "10px" }}
                    >
                      <span className="text-truncate" style={{ maxWidth: "200px" }}>
                        {selectedFile ? selectedFile.name : "No hay archivo"}
                      </span>
                      <input
                        id="model-file-upload"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                      <label htmlFor="model-file-upload" className="btn btn-success ms-auto" style={{ cursor: "pointer" }}>
                        Seleccionar archivo
                      </label>
                      {selectedFile && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => setSelectedFile(null)}
                          title="Eliminar archivo seleccionado"
                        >
                          X
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </>
            )}

            <AircraftDocumentationSection
              isExistingModel={false}
              showInsuranceDocumentation={showInsuranceDocumentation}
              showFTSDocumentation={showFTSDocumentation}
              showParachuteDocumentation={showParachuteDocumentation}
              onlyInsuranceHasDates
              activeChecks={documentationChecks}
              selectedFiles={documentationFiles}
              formValues={documentationFormValues}
              onToggleCheck={handleDocumentationToggle}
              onFileChange={handleDocumentationFileChange}
              onClearFile={handleDocumentationClearFile}
              onFormDateChange={handleDocumentationDateChange}
            />

            {error && <p className="text-danger mb-3">{error}</p>}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? "Guardando..." : "Registrar modelo"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(returnTo)}
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
