import React, { useState } from 'react';
import '../../styles/generic-form.css';
import Select from 'react-select';
import { apiFetch, API_BASE_URL } from '../../api';
import { useNavigate } from "react-router-dom";
import { staticUserCertificateFields as staticUserCertificateConfig } from '../certificates/staticUserCertificateFields';
import UserCertificatesSection from '../certificates/UserCertificatesSection';
import { CONOPS_CATEGORIES } from '../certificates/conopsCategories';
import { userFields, validateUserPassword, USER_PASSWORD_ERROR } from '../details/user&profile/UserFields';

import checkIcon from '../../assets/commons/check_white.svg';
import cancelIcon from '../../assets/commons/cancel_white.svg';


type CertificateFieldPayload = {
    certificate: File | null;
    dateExpire: string | null;
    dateIndefinite: boolean | null;
};

export type AdditionalCertificatePayload = {
    id: string;
    existingCertificateId?: number;
    label: string;
    certificate: File | null;
    dateExpire: string;
    dateIndefinite: boolean;
};

type CertificateUploadMetadata = {
    certificateType: string;
    fileFieldKey: string | null;
    expireDate: string | null;
    dateIndefinite: boolean | null;
};

type CertificateUploadData = {
    metadata: CertificateUploadMetadata[];
    files: Array<{ fileFieldKey: string; file: File }>;
};

type FormErrors = {
    nombre: string | null;
    apellidos: string | null;
    username: string | null;
    email: string | null;
    telefono: string | null;
    docIdentidad: string | null;
    fechaNac: string | null;
    password: string | null;
    confirmPassword: string | null;
};

type RoleOption = {
    value: string;
    label: string;
};

function FormUser() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({
        profilePicture: null,
        fileA1A3: null,
        fileA2: null,
        fileSTS: null,
        fileFTG: null,
        fileFPG: null,
        fileCT: null,
        fileCP: null,
        fileCMC2: null,
        fileCMCLAPL: null
    });
    const [selectedRoles, setSelectedRoles] = useState<RoleOption[]>([]);
    const navigate = useNavigate();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [currentSelection, setCurrentSelection] = useState<string>("");
    const [conopsDocs, setConopsDocs] = useState<Record<string, CertificateFieldPayload>>({});

    // Allowed file types
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedCertificateTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];

    const roleOptions: RoleOption[] = [
        { value: "ADMIN", label: "Administrador" },
        { value: "MANAGER", label: "Gestor" },
        { value: "MAINTAINER", label: "Mantenedor" },
        { value: "PILOT", label: "Piloto" }
    ];

    const [formValues, setFormValues] = useState({
        nombre: "",
        apellidos: "",
        username: "",
        email: "",
        telefono: "",
        docIdentidad: "",
        fechaNac: "",
        password: "",
        confirmPassword: "",
        catAbierta: "",
        catespecíficaEscenarios: "",
        catespecíficaAutorizacion: "",
        dateA1A3: "",
        dateA2: "",
        dateSTS: "",
        dateFTG: "",
        dateFPG: "",
        dateCT: "",
        dateCP: "",
        dateCMC2: "",
        dateCMCLAPL: ""
    });

    const [errors, setErrors] = useState<FormErrors>({
        nombre: null,
        apellidos: null,
        username: null,
        email: null,
        telefono: null,
        docIdentidad: null,
        fechaNac: null,
        password: null,
        confirmPassword: null
    });
    const [userTypeError, setUserTypeError] = useState<string | null>(null);

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
    

    const [activeChecks, setActiveChecks] = useState({
        chkA1A3: false,
        chkA2: false,
        chkSTS01: false,
        chkSTS02: false,
        chkFormcnTeoricaGen: false,
        chkFormcnPracticaGen: false,
        chkFormCertTeor: false,
        chkFormCertPract: false,
        chkFormCMClase2: false,
        chkFormCMClaseLAPL: false,
        indefiniteA1A3: false,
        indefiniteA2: false,
        indefiniteSTS: false,
        indefiniteFTG: false,
        indefiniteFPG: false,
        indefiniteCT: false,
        indefiniteCP: false,
        indefiniteCMC2: false,
        indefiniteCMCLAPL: false
    });

    const fieldByKey = new Map(userFields.map((field) => [field.key, field]));

    const getValidationError = (fieldKey: string, value: any): string | null => {
        const field = fieldByKey.get(fieldKey);
        if (!field?.validate) return null;
        return field.validate(value) ? null : (field.error || "Campo invalido");
    };


    // Función para alternar los checks
    const handleCheckChange = (id: string) => {
        setActiveChecks(prev => ({ ...prev, [id]: !prev[id as keyof typeof activeChecks] }));
    };

    const validateFile = (file: File, isProfilePicture: boolean): string | null => {
        const acceptedTypes = isProfilePicture ? allowedImageTypes : allowedCertificateTypes;

        if (!acceptedTypes.includes(file.type)) {
            return isProfilePicture ? "Only JPG and PNG files are allowed." : "Only PDF, JPG and PNG files are allowed.";
        }

        if (file.size > 5 * 1024 * 1024) {
            return "File size must be less than 5MB.";
        }

        return null;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const file = event.target.files?.[0];
        const isProfilePicture = id === "profilePicture";

        if (!file) {
            setSelectedFiles((prev) => ({ ...prev, [id]: null }));
            setError("");
            return;
        }

        const validationError = validateFile(file, isProfilePicture);
        if (validationError) {
            setError(validationError);
            setSelectedFiles((prev) => ({ ...prev, [id]: null }));
            return;
        }

        console.log(`Uploaded file for: ${id}`);
        setSelectedFiles((prev) => ({ ...prev, [id]: file }));
        setError("");
    };

    const handleClearFile = (id: string, inputId: string) => {
        setSelectedFiles((prev) => ({ ...prev, [id]: null }));
        // Esto resetea el input para permitir volver a elegir el mismo archivo
        const fileInput = document.getElementById(inputId) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
    };

    const staticCertificateFields = staticUserCertificateConfig.map((field) => ({
        key: field.key,
        enabled: Boolean(activeChecks[field.enabledKey as keyof typeof activeChecks]),
        file: selectedFiles[field.fileKey as keyof typeof selectedFiles],
        date: formValues[field.dateKey as keyof typeof formValues],
        indefinite: Boolean(activeChecks[field.indefiniteKey as keyof typeof activeChecks]),
    }));

    const buildCertificatesPayload = (): CertificateUploadData => {
        const metadata: CertificateUploadMetadata[] = [];
        const files: Array<{ fileFieldKey: string; file: File }> = [];

        staticCertificateFields.forEach((field) => {
            const fileFieldKey = field.file ? `certificate_${field.key}` : null;
            metadata.push({
                certificateType: field.key,
                fileFieldKey,
                expireDate: field.enabled && !field.indefinite ? (field.date || null) : null,
                dateIndefinite: field.enabled ? field.indefinite : null,
            });

            if (field.file && fileFieldKey) {
                files.push({ fileFieldKey, file: field.file });
            }
        });

        selectedCategories.forEach((categoryId) => {
            const categoryData = conopsDocs[categoryId];
            const certificateType = `conops_${categoryId}`;
            const fileFieldKey = categoryData?.certificate ? `certificate_${certificateType}` : null;

            metadata.push({
                certificateType,
                fileFieldKey,
                expireDate: categoryData?.dateIndefinite ? null : (categoryData?.dateExpire || null),
                dateIndefinite: categoryData?.dateIndefinite ?? null,
            });

            if (categoryData?.certificate && fileFieldKey) {
                files.push({ fileFieldKey, file: categoryData.certificate });
            }
        });

        additionalDocs.forEach((doc) => {
            const label = doc.label.trim();
            const hasAnyData = Boolean(label) || Boolean(doc.certificate) || Boolean(doc.dateExpire) || Boolean(doc.dateIndefinite);
            if (!hasAnyData) {
                return;
            }

            const fileFieldKey = doc.certificate ? `certificate_additional_${doc.id}` : null;
            metadata.push({
                certificateType: label || `additional_${doc.id}`,
                fileFieldKey,
                expireDate: doc.dateIndefinite ? null : (doc.dateExpire || null),
                dateIndefinite: doc.dateIndefinite,
            });

            if (doc.certificate && fileFieldKey) {
                files.push({ fileFieldKey, file: doc.certificate });
            }
        });

        return { metadata, files };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const telefonoValue = formValues.telefono.trim();
            const newErrors: FormErrors = {
                nombre: getValidationError("firstName", formValues.nombre.trim()),
                apellidos: getValidationError("lastName", formValues.apellidos.trim()),
                username: getValidationError("username", formValues.username.trim()),
                email: getValidationError("email", formValues.email.trim()),
                telefono: getValidationError("phoneNumber", telefonoValue),
                docIdentidad: getValidationError("docIdentidad", formValues.docIdentidad.trim()),
                fechaNac: getValidationError("fechaNac", formValues.fechaNac.trim()),
                password: validateUserPassword(formValues.password) ? null : USER_PASSWORD_ERROR,
                confirmPassword: formValues.confirmPassword.trim()
                    ? (formValues.password === formValues.confirmPassword ? null : "Las contrasenas no coinciden.")
                    : "Confirma la contrasena."
            };

            setErrors(newErrors);
            setUserTypeError(selectedRoles.length > 0 ? null : "Seleccione al menos un rol.");

            if (Object.values(newErrors).some((v) => v !== null) || selectedRoles.length === 0) {
                setError(null);
                setLoading(false);
                return;
            }

            if (selectedRoles.length > 0 && formValues.password !== formValues.confirmPassword) {
                setError("Las contraseñas no coinciden.");
                setLoading(false);
                return;
            }

            // Use FormData for file upload
            const formData = new FormData();
            formData.append("firstName", formValues.nombre.trim());
            formData.append("lastName", formValues.apellidos.trim());
            formData.append("username", formValues.username.trim());
            formData.append("email", formValues.email.trim());
            formData.append("password", formValues.password);
            selectedRoles.forEach((role) => formData.append("roles", role.value));
            if (telefonoValue !== "") {
                formData.append("phoneNumber", telefonoValue);
            }
            if (selectedFiles.profilePicture) {
                formData.append("imageFile", selectedFiles.profilePicture, selectedFiles.profilePicture.name);
            }
            formData.append("docIdentidad", formValues.docIdentidad.trim());
            formData.append("fechaNac", formValues.fechaNac.trim());

            const certificatesPayload = buildCertificatesPayload();
            formData.append("certificates", JSON.stringify(certificatesPayload.metadata));
            certificatesPayload.files.forEach(({ fileFieldKey, file }) => {
                formData.append(fileFieldKey, file, file.name);
            });

            // Testing consultar token
            // const token = localStorage.getItem('jwt');
            // console.log("JWT enviado:", token);
            const res = await apiFetch(`${API_BASE_URL}/api/users`, {
                method: "POST",
                body: formData,
            });

            if (!res) {
                throw new Error("No se recibió respuesta del servidor.");
            }

            if (!res.ok) {
                const errorData = await res.json();
                
                // Si el backend envía un mensaje específico de duplicado
                if (errorData.message && errorData.message.toLowerCase().includes("already exists")) {
                    setError("El nombre de usuario ya está en uso. Por favor, elige otro.");
                } else if (errorData.message && errorData.message.toLowerCase().includes("nombre de usuario ya existe")) {
                    setError("El nombre de usuario ya está en uso. Por favor, elige otro.");
                } else if (res.status === 409 || res.status === 500) {
                    // Generalmente las violaciones de Constraint devuelven estos códigos
                    setError("Error: El nombre de usuario o el email ya existen.");
                } else {
                    setError("Ocurrió un error al registrar el usuario.");
                }
                setLoading(false);
                return;
            }

            const data = await res.json();
            console.log("User created:", data);
            
            navigate("/users"); // redirect to users list after success

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addCategory = () => {
        if (currentSelection && !selectedCategories.includes(currentSelection)) {
            setSelectedCategories([...selectedCategories, currentSelection]);
            setConopsDocs((prev) => ({
                ...prev,
                [currentSelection]: {
                    certificate: null,
                    dateExpire: null,
                    dateIndefinite: null,
                },
            }));
            setCurrentSelection(""); // Reset select
        }
    };

    const removeCategory = (id: string) => {
        setSelectedCategories(selectedCategories.filter(catId => catId !== id));
        setConopsDocs((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const handleFormDateChange = (key: string, value: string) => {
        setFormValues((prev) => ({ ...prev, [key]: value }));
    };

    const handleConopsFileChange = (catId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) {
            setConopsDocs((prev) => ({
                ...prev,
                [catId]: {
                    ...(prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null }),
                    certificate: null,
                },
            }));
            return;
        }

        const validationError = validateFile(file, false);
        if (validationError) {
            setError(validationError);
            return;
        }

        setConopsDocs((prev) => ({
            ...prev,
            [catId]: {
                ...(prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null }),
                certificate: file,
            },
        }));
        setError("");
    };

    const handleConopsClearFile = (catId: string) => {
        setConopsDocs((prev) => ({
            ...prev,
            [catId]: {
                ...(prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null }),
                certificate: null,
            },
        }));
        const input = document.getElementById(`file-${catId}`) as HTMLInputElement | null;
        if (input) input.value = "";
    };

    const handleConopsDateChange = (catId: string, value: string) => {
        setConopsDocs((prev) => ({
            ...prev,
            [catId]: {
                ...(prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null }),
                dateExpire: value || null,
                dateIndefinite: false,
            },
        }));
    };

    const handleConopsToggleIndefinite = (catId: string) => {
        setConopsDocs((prev) => {
            const current = prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null };
            const nextIndefinite = !current.dateIndefinite;
            return {
                ...prev,
                [catId]: {
                    ...current,
                    dateIndefinite: nextIndefinite,
                    dateExpire: nextIndefinite ? null : current.dateExpire,
                },
            };
        });
    };

    const [additionalDocs, setAdditionalDocs] = useState<AdditionalCertificatePayload[]>([]);

    const handleAddAdditionalDoc = () => {
        if (additionalDocs.length < 10) {
            const newDoc: AdditionalCertificatePayload = {
                id: crypto.randomUUID(),
                label: "",
                certificate: null,
                dateExpire: "",
                dateIndefinite: false
            };
            setAdditionalDocs(prev => [...prev, newDoc]);
        }
    };

    const handleRemoveAdditionalDoc = (id: string) => {
        setAdditionalDocs(prev => prev.filter(doc => doc.id !== id));
    };

    const handleAdditionalFieldChange = (
        id: string, 
        field: keyof AdditionalCertificatePayload, 
        value: any
    ) => {
        setAdditionalDocs(prev => 
            prev.map(doc => (doc.id === id ? { ...doc, [field]: value } : doc))
        );
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: "#F3F4F6", minHeight: "100vh" }}>
            <div className="container" style={{ maxWidth: "1000px" }}>
                <h2 className="text-center mb-4 fw-normal" style={{ color: "#1E1E1E" }}>
                    Formulario Registro Usuario
                </h2>

                <div className="card shadow-sm p-4" style={{ borderRadius: "8px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}>
                <form onSubmit={handleSubmit}>
                    {/* Row 1: Nombre, Apellidos, Usuario */}
                    <div className="row mb-3">
                    <div className="col-12 col-md mb-3 mb-md-0">
                        <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Nombre</label>
                        <input
                        type="text"
                        className="form-control"
                        onChange={(e) => setFormValues({ ...formValues, nombre: e.target.value })}
                        style={{ ...backgroundBorderInputs, border: errors.nombre ? "1px solid red" : "1px solid #D1D5DB" }}
                        />
                        {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
                    </div>

                    <div className="col-12 col-md mb-3 mb-md-0">
                        <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Apellidos</label>
                        <input
                        type="text"
                        className="form-control"
                        onChange={(e) => setFormValues({ ...formValues, apellidos: e.target.value })}
                        style={{ ...backgroundBorderInputs, border: errors.apellidos ? "1px solid red" : "1px solid #D1D5DB" }}
                        />
                        {errors.apellidos && <small className="text-danger">{errors.apellidos}</small>}
                    </div>

                    <div className="col-12 col-md">
                        <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Nombre de usuario</label>
                        <input
                        type="text"
                        className="form-control"
                        onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
                        style={{ ...backgroundBorderInputs, border: errors.username ? "1px solid red" : "1px solid #D1D5DB" }}
                        />
                        {errors.username && <small className="text-danger">{errors.username}</small>}
                    </div>
                    </div>

                    {/* Row 2: Email, Telefono */}
                    <div className="row mb-3">
                        <div className="col-12 col-md mb-3 mb-md-0">
                            <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Correo electrónico</label>
                            <input
                                type="text"
                                className="form-control"
                                onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                                style={{ ...backgroundBorderInputs, border: errors.email ? "1px solid red" : "1px solid #D1D5DB" }}
                            />
                            {errors.email && <small className="text-danger">{errors.email}</small>}
                        </div>

                        <div className="col-12 col-md">
                            <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>
                                Número de teléfono{" "}
                                <span style={{ fontSize: "0.85em", color: "#6B7280" }}>
                                    (Opcional)
                                </span>
                                </label>
                            <input
                            type="text"
                            className="form-control"
                            onChange={(e) => setFormValues({ ...formValues, telefono: e.target.value })}
                            style={{ ...backgroundBorderInputs, border: errors.telefono ? "1px solid red" : "1px solid #D1D5DB" }}
                            />
                            {errors.telefono && <small className="text-danger">{errors.telefono}</small>}
                        </div>
                    </div>

                    {/* Row 3: Doc Identidad y Fecha Nacimiento */}
                    <div className="row mb-3">
                        <div className="col-12 col-md mb-3 mb-md-0">
                            <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Documento Identidad (DNI/NIF/Pasaporte)</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Ej: 12345678X"
                                value={formValues.docIdentidad}
                                onChange={(e) => setFormValues({ ...formValues, docIdentidad: e.target.value })}
                                style={{ ...backgroundBorderInputs, border: errors.docIdentidad ? "1px solid red" : "1px solid #D1D5DB" }}
                            />
                            {errors.docIdentidad && <small className="text-danger">{errors.docIdentidad}</small>}
                        </div>

                        <div className="col-12 col-md">
                            <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>
                                Fecha de Nacimiento{" "}
                                <span style={{ fontSize: "0.85em", color: "#6B7280" }}>
                                    (Opcional)
                                </span>
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                value={formValues.fechaNac}
                                onChange={(e) => setFormValues({ ...formValues, fechaNac: e.target.value })}
                                style={{ ...backgroundBorderInputs, border: errors.fechaNac ? "1px solid red" : "1px solid #D1D5DB" }}
                            />
                            {errors.fechaNac && <small className="text-danger">{errors.fechaNac}</small>}
                        </div>
                    </div>

                    {/* Row 4: Roles, Imagen */}
                    <div className="row mb-3">
                        <div className="col-12 col-md mb-3 mb-md-0">
                            <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Roles</label>
                            <Select
                                options={roleOptions}
                                styles={backgroundBorderInputsSelect}
                                placeholder="Seleccione uno o varios roles"
                                value={selectedRoles}
                                isMulti
                                closeMenuOnSelect={false}
                                onChange={(val) => {
                                    setSelectedRoles((val as RoleOption[] | null) ?? []);
                                    setUserTypeError(null);
                                }}
                            />
                            {userTypeError && <small className="text-danger">{userTypeError}</small>}
                        </div>

                        <div className="col-12 col-md">
                            <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>
                                Imagen de perfil{" "}
                                <span style={{ fontSize: "0.85em", color: "#6B7280" }}>
                                    (Opcional)
                                </span>
                            </label>
                            
                            <div className="d-flex align-items-center rounded" style={{ backgroundColor: "#F3F4F6", border: "1px solid #D1D5DB", paddingLeft: "10px" }}>
                                <span className="text-truncate" style={{ maxWidth: "150px" }}>
                                    {selectedFiles.profilePicture ? selectedFiles.profilePicture.name : "No hay archivo"}
                                </span>

                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange(e, 'profilePicture')}
                                    style={{ display: "none" }}
                                />

                                <div className="ms-auto d-flex">
                                    <label
                                        htmlFor="file-upload"
                                        className="btn btn-success"
                                        style={{ cursor: "pointer", borderTopRightRadius: selectedFiles.profilePicture ? "0" : "4px", borderBottomRightRadius: selectedFiles.profilePicture ? "0" : "4px" }}
                                    >
                                        Seleccionar archivo
                                    </label>

                                    {selectedFiles.profilePicture && (
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={() => handleClearFile('profilePicture', 'file-upload')}
                                            style={{ borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }}
                                            title="Eliminar archivo seleccionado"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 5: Contraseña */}
                    <div className="row mb-3">
                    <div className="col-12 col-md mb-3 mb-md-0">
                        <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={formValues.password}
                            onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                            style={{ ...backgroundBorderInputs, border: errors.password ? "1px solid red" : "1px solid #D1D5DB" }}
                        />
                        {errors.password && <small className="text-danger">{errors.password}</small>}
                    </div>

                    <div className="col-12 col-md">
                        <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Confirmación de contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={formValues.confirmPassword}
                            onChange={(e) => setFormValues({ ...formValues, confirmPassword: e.target.value })}
                            style={{ ...backgroundBorderInputs, border: errors.confirmPassword ? "1px solid red" : "1px solid #D1D5DB" }}
                        />
                        {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
                    </div>
                    </div>

                    {/* Error message */}
                    {error && <p className="text-danger">{error}</p>}

                    <UserCertificatesSection
                        activeChecks={activeChecks as Record<string, boolean>}
                        selectedFiles={selectedFiles}
                        formValues={formValues}
                        onToggleCheck={handleCheckChange}
                        onFileChange={handleFileChange}
                        onClearFile={handleClearFile}
                        conopsCategories={CONOPS_CATEGORIES}
                        selectedCategories={selectedCategories}
                        currentSelection={currentSelection}
                        onCurrentSelectionChange={setCurrentSelection}
                        onAddCategory={addCategory}
                        onRemoveCategory={removeCategory}
                        conopsDocs={conopsDocs}
                        onConopsFileChange={handleConopsFileChange}
                        onConopsClearFile={handleConopsClearFile}
                        onConopsDateChange={handleConopsDateChange}
                        onConopsToggleIndefinite={handleConopsToggleIndefinite}
                        onFormDateChange={handleFormDateChange}

                        additionalDocs={additionalDocs}
                        onAddAdditionalDoc={handleAddAdditionalDoc}
                        onRemoveAdditionalDoc={handleRemoveAdditionalDoc}
                        onAdditionalFieldChange={handleAdditionalFieldChange}
                    />


                    <div className="d-flex gap-2 mt-3 justify-content-center">
                        <button type="submit" className="btn btn-success">
                            <img src={checkIcon} alt="Check" className="check-icon d-inline d-sm-none" />
                            <span className="d-none d-sm-block">
                                {loading ? "Cargando..." : "Registrar usuario"}
                            </span>
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate("/users")}
                        >
                            <img src={cancelIcon} alt="Cancel" className="cancel-icon d-inline d-sm-none" />
                            <span className="d-none d-sm-block">
                                Cancelar
                            </span>
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    )
}

export default FormUser

