import React, { useState,  } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import './generic-form.css';
import Select from 'react-select';
import { apiFetch } from '../../api';
import { useNavigate } from "react-router-dom";
import InsertDoc from '../commons/InsertDoc';

import checkIcon from '../../assets/commons/check_white.svg';
import cancelIcon from '../../assets/commons/cancel_white.svg';
import infoIcon from '../../assets/commons/info_white.svg';

type CertificateFieldPayload = {
    certificate: File | null;
    dateExpire: string | null;
    dateIndefinite: boolean | null;
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
    const [selectedUserType, setSelectedUserType] = useState<{ value: string; label: string } | null>(null);
    const [showOptional, setShowOptional] = useState(false);
    const navigate = useNavigate();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [currentSelection, setCurrentSelection] = useState<string>("");
    const [conopsDocs, setConopsDocs] = useState<Record<string, CertificateFieldPayload>>({});

    // Allowed file types
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedCertificateTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];

    const type_user: { value: string; label: string }[] = [
        { value: "PILOT", label: "Piloto" },
        { value: "MANAGER", label: "Gestor" },
        { value: "ADMIN", label: "Administrador" }
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
        catEspecificaEscenarios: "",
        catEspecificaAutorizacion: "",
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

    const [errors, setErrors] = useState({
        nombre: false,
        apellidos: false,
        username: false,
        email: false,
        telefono: false,
        docIdentidad: false,
        fechaNac: false,
        password: false,
        confirmPassword: false
    });

    const infoText = (
        <>
            En caso de que se disponga <b>de los tres certificados de piloto a distancia</b>, 
            con fechas de caducidad distintas en cada uno de ellos, <b>será la del certificado 
            de piloto a distancia en STS la que dará validez a todos los certificados anteriores, 
            unificando la fecha de caducidad al del nivel superior</b>.
        </>
    );

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

    const staticCertificateFields = [
        { key: "a1a3", enabled: activeChecks.chkA1A3, file: selectedFiles.fileA1A3, date: formValues.dateA1A3, indefinite: activeChecks.indefiniteA1A3 },
        { key: "a2", enabled: activeChecks.chkA2, file: selectedFiles.fileA2, date: formValues.dateA2, indefinite: activeChecks.indefiniteA2 },
        { key: "sts", enabled: activeChecks.chkSTS01, file: selectedFiles.fileSTS, date: formValues.dateSTS, indefinite: activeChecks.indefiniteSTS },
        { key: "formacionTeoricaGenerica", enabled: activeChecks.chkFormcnTeoricaGen, file: selectedFiles.fileFTG, date: formValues.dateFTG, indefinite: activeChecks.indefiniteFTG },
        { key: "formacionPracticaGenerica", enabled: activeChecks.chkFormcnPracticaGen, file: selectedFiles.fileFPG, date: formValues.dateFPG, indefinite: activeChecks.indefiniteFPG },
        { key: "radiofonistaTeorico", enabled: activeChecks.chkFormCertTeor, file: selectedFiles.fileCT, date: formValues.dateCT, indefinite: activeChecks.indefiniteCT },
        { key: "radiofonistaPractico", enabled: activeChecks.chkFormCertPract, file: selectedFiles.fileCP, date: formValues.dateCP, indefinite: activeChecks.indefiniteCP },
        { key: "medicoClase2", enabled: activeChecks.chkFormCMClase2, file: selectedFiles.fileCMC2, date: formValues.dateCMC2, indefinite: activeChecks.indefiniteCMC2 },
        { key: "medicoClaseLAPL", enabled: activeChecks.chkFormCMClaseLAPL, file: selectedFiles.fileCMCLAPL, date: formValues.dateCMCLAPL, indefinite: activeChecks.indefiniteCMCLAPL },
    ] as const;

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

        return { metadata, files };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const telefonoValue = formValues.telefono.trim();
            const telefonoInvalid = telefonoValue !== "" && !/^\d{9}$/.test(telefonoValue);

            const newErrors = {
                nombre: !formValues.nombre.trim(),
                apellidos: !formValues.apellidos.trim(),
                username: !formValues.username.trim(),
                email: !formValues.email.trim(),
                telefono: telefonoInvalid,
                docIdentidad: !formValues.docIdentidad.trim(),
                fechaNac: false,
                password: !formValues.password.trim(),
                confirmPassword: !formValues.confirmPassword.trim()
            };

            setErrors(newErrors);

            if (Object.values(newErrors).some(Boolean)) {
                setError("Por favor complete todos los campos obligatorios.");
                setLoading(false);
                return;
            }

            if (!selectedUserType) {
                setError("Seleccione un tipo de usuario.");
                setLoading(false);
                return;
            }

            if (formValues.password !== formValues.confirmPassword) {
                setError("Las contraseÃ±as no coinciden.");
                setLoading(false);
                return;
            }

            // Use FormData for file upload
            const formData = new FormData();
            formData.append("firstName", formValues.nombre);
            formData.append("lastName", formValues.apellidos);
            formData.append("username", formValues.username);
            formData.append("email", formValues.email);
            formData.append("password", formValues.password);
            formData.append("type", selectedUserType.value);
            if (telefonoValue !== "") {
                formData.append("phoneNumber", telefonoValue);
            }
            if (selectedFiles.profilePicture) {
                formData.append("imageFile", selectedFiles.profilePicture, selectedFiles.profilePicture.name);
            }
            formData.append("docIdentidad", formValues.docIdentidad);
            formData.append("fechaNac", formValues.fechaNac);

            const certificatesPayload = buildCertificatesPayload();
            formData.append("certificates", JSON.stringify(certificatesPayload.metadata));
            certificatesPayload.files.forEach(({ fileFieldKey, file }) => {
                formData.append(fileFieldKey, file, file.name);
            });

            // Testing consultar token
            // const token = localStorage.getItem('jwt');
            // console.log("JWT enviado:", token);
            const res = await apiFetch(`${API_BASE_URL}/api/auth/users`, {
                method: "POST",
                body: formData,
            });

            if (!res) {
                throw new Error("No se recibió respuesta del servidor.");
            }

            if (!res.ok) {
                const errorData = await res.json();
                
                // Si el backend envÃ­a un mensaje especÃ­fico de duplicado
                if (errorData.message && errorData.message.includes("already exists")) {
                    setError("El nombre de usuario ya estÃ¡ en uso. Por favor, elige otro.");
                } else if (res.status === 409 || res.status === 500) {
                    // Generalmente las violaciones de Constraint devuelven estos cÃ³digos
                    setError("Error: El nombre de usuario o el email ya existen.");
                } else {
                    setError("Ocurrió un error al registrar el usuario.");
                }
                setLoading(false);
                return;
            }

            const data = await res.json();
            console.log("User created:", data);
            
            navigate("/auth/users"); // redirect to users list after success

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    interface Category {
        id: string;
        label: string;
    }

    const CONOPS_CATEGORIES: Category[] = [
        { id: 'opnoc', label: 'Operaciones nocturnas' },
        { id: 'sobrevuelo', label: 'Sobrevuelo (vuelo sobre áreas pobladas conocidas o sobre reuniones de personas)' },
        { id: 'opBVLOS', label: 'Operaciones BVLOS' },
        { id: 'opBajaAlt', label: 'Operaciones a baja altitud (menos de 500 pies)' },
        { id: 'espNoSegreg', label: 'Vuelos en espacio aéreo no segregado' },
        { id: 'transpDepCarg', label: 'Transporte y/o depósito de carga' },
        { id: 'transpMercPelig', label: 'Transporte de mercancías peligrosas' },
        { id: 'opMultUASyEnjamb', label: 'Operaciones con múltiples UAS y enjambres' },
        { id: 'lanzRecpUAeqEsp', label: 'Lanzamiento y recuperación de la UA usando equipo especial' },
        { id: 'terrenMonta', label: 'Vuelo sobre terreno montañoso' },
        { id: 'altoGradAutomat', label: 'Operaciones con un alto grado de automatización' },
        { id: '120mAltAGL', label: 'Operaciones a más de 120m de altura AGL' },
        { id: 'UASPotenNoElec', label: 'Operaciones con UAS con planta de potencia no eléctrica' },
        { id: 'espAerContrlFIZ', label: 'Operaciones en espacio aéreo controlado y FIZ' },
        { id: 'entDromoAeroPuertHeli', label: 'Operaciones en entorno de aeródromos, aeropuertos y helipuertos' },
        { id: 'esparcirSustancMateriales', label: 'Operaciones que impliquen esparcir o dejar caer sustancias o materiales' }
    ];

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
                    </div>

                    <div className="col-12 col-md mb-3 mb-md-0">
                        <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Apellidos</label>
                        <input
                        type="text"
                        className="form-control"
                        onChange={(e) => setFormValues({ ...formValues, apellidos: e.target.value })}
                        style={{ ...backgroundBorderInputs, border: errors.apellidos ? "1px solid red" : "1px solid #D1D5DB" }}
                        />
                    </div>

                    <div className="col-12 col-md">
                        <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Nombre de usuario</label>
                        <input
                        type="text"
                        className="form-control"
                        onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
                        style={{ ...backgroundBorderInputs, border: errors.username ? "1px solid red" : "1px solid #D1D5DB" }}
                        />
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
                        </div>
                    </div>

                    {/* Row 4: Tipo de usuario, Imagen */}
                    <div className="row mb-3">
                        <div className="col-12 col-md mb-3 mb-md-0">
                            <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Tipo de usuario</label>
                            <Select
                                options={type_user}
                                styles={backgroundBorderInputsSelect}
                                placeholder="Seleccione el tipo de usuario"
                                value={selectedUserType}
                                onChange={(val) => setSelectedUserType(val)}
                            />
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
                    </div>
                    </div>

                    {/* Error message */}
                    {error && <p className="text-danger">{error}</p>}

                    {/* SECCIÓN OPCIONAL (Acordeón visual) */}
                    <div className="mb-3">
                        <button 
                            type="button" 
                            className="btn btn-sm w-100 d-flex justify-content-between align-items-center" 
                            style={{ backgroundColor: "#F9FAFB", border: "1px dashed #D1D5DB", color: "#6B7280" }}
                            onClick={() => setShowOptional(!showOptional)}
                        >
                            <span className="fw-medium">
                                {showOptional ? "- Ocultar certificados" : "+ Añadir certificados"}
                            </span>
                        </button>

                        {showOptional && (
                            <div className="mt-3 animate__animated animate__fadeIn">
                                
                                {/* Categoría Abierta */}
                                <div className="p-3 mb-3 border rounded-3 drone-check" style={{ backgroundColor: "#f1f2f3" }}>
                                    <div className="d-flex align-items-center mb-3">
                                        <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                            Categoría Abierta
                                        </h6>
                                        
                                        <div className="info-tooltip-wrapper ms-2">
                                            <img 
                                                src={infoIcon} 
                                                alt="info" 
                                                style={{ 
                                                    width: "16px", 
                                                    height: "16px", 
                                                    filter: "invert(48%) sepia(13%) saturate(623%) hue-rotate(180deg) brightness(93%) contrast(85%)",
                                                    cursor: "pointer" 
                                                }} 
                                            />
                                            <span className="info-tooltip-text">
                                                {infoText}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Subcategoría A1 / A3 */}
                                    <InsertDoc
                                        className="mb-4"
                                        checkboxId="chkA1A3"
                                        checkboxLabel="A1 / A3 (Prueba de superación)"
                                        isChecked={activeChecks.chkA1A3}
                                        onToggleCheck={() => handleCheckChange('chkA1A3')}
                                        fileInputId="file-upload-a1a3"
                                        selectedFile={selectedFiles.fileA1A3}
                                        onFileChange={(e) => handleFileChange(e, 'fileA1A3')}
                                        onClearFile={() => handleClearFile('fileA1A3', 'file-upload-a1a3')}
                                        expirationDate={formValues.dateA1A3}
                                        onExpirationDateChange={(value) => setFormValues({ ...formValues, dateA1A3: value })}
                                        indefiniteId="indefiniteA1A3"
                                        isIndefinite={activeChecks.indefiniteA1A3}
                                        onToggleIndefinite={() => handleCheckChange('indefiniteA1A3')}
                                    />

                                    {/* Subcategoría A2 */}
                                    <InsertDoc
                                        className="mb-2"
                                        checkboxId="chkA2"
                                        checkboxLabel="A2 (Certificado de aptitud)"
                                        isChecked={activeChecks.chkA2}
                                        onToggleCheck={() => handleCheckChange('chkA2')}
                                        fileInputId="file-upload-a2"
                                        selectedFile={selectedFiles.fileA2}
                                        onFileChange={(e) => handleFileChange(e, 'fileA2')}
                                        onClearFile={() => handleClearFile('fileA2', 'file-upload-a2')}
                                        expirationDate={formValues.dateA2}
                                        onExpirationDateChange={(value) => setFormValues({ ...formValues, dateA2: value })}
                                        indefiniteId="indefiniteA2"
                                        isIndefinite={activeChecks.indefiniteA2}
                                        onToggleIndefinite={() => handleCheckChange('indefiniteA2')}
                                    />
                                </div>

                                {/* CATEGORÍA ESPECÍFICA - STS */}
                                <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                                    <div className="d-flex align-items-center mb-3">
                                        <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                            Categoría específica escenarios estándar
                                        </h6>
                                        
                                        <div className="info-tooltip-wrapper ms-2">
                                            <img 
                                                src={infoIcon} 
                                                alt="info" 
                                                style={{ 
                                                    width: "16px", 
                                                    height: "16px", 
                                                    filter: "invert(48%) sepia(13%) saturate(623%) hue-rotate(180deg) brightness(93%) contrast(85%)",
                                                    cursor: "pointer" 
                                                }} 
                                            />
                                            <span className="info-tooltip-text">
                                                {infoText}
                                            </span>
                                        </div>
                                    </div>

                                    <InsertDoc
                                        checkboxId="chkSTS01"
                                        checkboxLabel="STS europeo"
                                        isChecked={activeChecks.chkSTS01}
                                        onToggleCheck={() => handleCheckChange('chkSTS01')}
                                        fileInputId="file-upload-sts"
                                        selectedFile={selectedFiles.fileSTS}
                                        onFileChange={(e) => handleFileChange(e, 'fileSTS')}
                                        onClearFile={() => handleClearFile('fileSTS', 'file-upload-sts')}
                                        expirationDate={formValues.dateSTS}
                                        onExpirationDateChange={(value) => setFormValues({ ...formValues, dateSTS: value })}
                                        indefiniteId="indefiniteSTS"
                                        isIndefinite={activeChecks.indefiniteSTS}
                                        onToggleIndefinite={() => handleCheckChange('indefiniteSTS')}
                                    />
                                </div>

                                {/* CATEGORÍA ESPECÍFICA - Bajo autorización */}
                                <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                                    <div className="d-flex align-items-center mb-3">
                                        <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                            Categoría específica bajo autorización
                                        </h6>
                                        
                                        <div className="info-tooltip-wrapper ms-2">
                                            <img 
                                                src={infoIcon} 
                                                alt="info" 
                                                style={{ 
                                                    width: "16px", 
                                                    height: "16px", 
                                                    filter: "invert(48%) sepia(13%) saturate(623%) hue-rotate(180deg) brightness(93%) contrast(85%)",
                                                    cursor: "pointer" 
                                                }} 
                                            />
                                            <span className="info-tooltip-text">
                                                {"info"}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <InsertDoc
                                        className="mb-4"
                                        checkboxId="chkFormcnTeoricaGen"
                                        checkboxLabel="Formación teórica genérica"
                                        isChecked={activeChecks.chkFormcnTeoricaGen}
                                        onToggleCheck={() => handleCheckChange('chkFormcnTeoricaGen')}
                                        fileInputId="file-upload-ftg"
                                        selectedFile={selectedFiles.fileFTG}
                                        onFileChange={(e) => handleFileChange(e, 'fileFTG')}
                                        onClearFile={() => handleClearFile('fileFTG', 'file-upload-ftg')}
                                        expirationDate={formValues.dateFTG}
                                        onExpirationDateChange={(value) => setFormValues({ ...formValues, dateFTG: value })}
                                        indefiniteId="indefiniteFTG"
                                        isIndefinite={activeChecks.indefiniteFTG}
                                        onToggleIndefinite={() => handleCheckChange('indefiniteFTG')}
                                    />
                                    <InsertDoc
                                        className="mb-2"
                                        checkboxId="chkFormcnPracticaGen"
                                        checkboxLabel="Formación práctica genérica"
                                        isChecked={activeChecks.chkFormcnPracticaGen}
                                        onToggleCheck={() => handleCheckChange('chkFormcnPracticaGen')}
                                        fileInputId="file-upload-fpg"
                                        selectedFile={selectedFiles.fileFPG}
                                        onFileChange={(e) => handleFileChange(e, 'fileFPG')}
                                        onClearFile={() => handleClearFile('fileFPG', 'file-upload-fpg')}
                                        expirationDate={formValues.dateFPG}
                                        onExpirationDateChange={(value) => setFormValues({ ...formValues, dateFPG: value })}
                                        indefiniteId="indefiniteFPG"
                                        isIndefinite={activeChecks.indefiniteFPG}
                                        onToggleIndefinite={() => handleCheckChange('indefiniteFPG')}
                                    />
                                    <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                                        <div className="d-flex align-items-center mb-3">
                                            <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                                Formaciónes específica Concepto de Operaciones (ConOps)
                                            </h6>
                                        </div>

                                        {/* SELECT AND ADD BUTTON */}
                                        <div className="d-flex gap-2 mb-4">
                                            <select 
                                            className="form-select" 
                                            value={currentSelection}
                                            onChange={(e) => setCurrentSelection(e.target.value)}
                                            >
                                            <option value="">Seleccionar formación específica...</option>
                                            {CONOPS_CATEGORIES.filter(cat => !selectedCategories.includes(cat.id)).map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                            </select>
                                            <button 
                                            type="button"
                                            className="btn btn-success" 
                                            onClick={addCategory}
                                            disabled={!currentSelection}
                                            >
                                            Añadir
                                            </button>
                                        </div>

                                        {/* DYNAMIC LIST OF INSERTDOCS */}
                                        {selectedCategories.map((catId) => {
                                            const categoryData = CONOPS_CATEGORIES.find(c => c.id === catId);

                                            if (!categoryData) return null;
                                            return (
                                            <div key={catId} className="position-relative border-bottom pb-3 mb-3">
                                                {/* Remove Button */}
                                                <button 
                                                type="button"
                                                onClick={() => removeCategory(catId)}
                                                className="btn btn-sm btn-outline-danger position-absolute end-0 top-0"
                                                style={{ zIndex: 10 }}
                                                >
                                                    &times; Eliminar
                                                </button>

                                                <InsertDoc
                                                showCheckbox={false}
                                                checkboxId={`chk-${catId}`}
                                                checkboxLabel={categoryData.label}
                                                isChecked={true}
                                                onToggleCheck={() => null}
                                                fileInputId={`file-${catId}`}
                                                selectedFile={conopsDocs[catId]?.certificate ?? null}
                                                onFileChange={(e) => {
                                                    const file = e.target.files?.[0] ?? null;
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
                                                }}
                                                onClearFile={() => {
                                                    setConopsDocs((prev) => ({
                                                        ...prev,
                                                        [catId]: {
                                                            ...(prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null }),
                                                            certificate: null,
                                                        },
                                                    }));
                                                    const input = document.getElementById(`file-${catId}`) as HTMLInputElement | null;
                                                    if (input) input.value = "";
                                                }}
                                                expirationDate={conopsDocs[catId]?.dateExpire ?? ""}
                                                onExpirationDateChange={(val) => setConopsDocs((prev) => ({
                                                    ...prev,
                                                    [catId]: {
                                                        ...(prev[catId] ?? { certificate: null, dateExpire: null, dateIndefinite: null }),
                                                        dateExpire: val || null,
                                                        dateIndefinite: false,
                                                    },
                                                }))}
                                                indefiniteId={`indefinite-${catId}`}
                                                isIndefinite={conopsDocs[catId]?.dateIndefinite ?? false}
                                                onToggleIndefinite={() => setConopsDocs((prev) => {
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
                                                })}
                                                />
                                            </div>
                                            );
                                        })}
                                        </div>
                                </div>

                                {/* Certificados adicionales */}
                                <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                                    <div className="d-flex align-items-center mb-3">
                                        <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                            Certificados adicionales
                                        </h6>
                                        
                                        <div className="info-tooltip-wrapper ms-2">
                                            <img 
                                                src={infoIcon} 
                                                alt="info" 
                                                style={{ 
                                                    width: "16px", 
                                                    height: "16px", 
                                                    filter: "invert(48%) sepia(13%) saturate(623%) hue-rotate(180deg) brightness(93%) contrast(85%)",
                                                    cursor: "pointer" 
                                                }} 
                                            />
                                            <span className="info-tooltip-text">
                                                {"info"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Radiofonista UAS */}
                                <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                                    <div className="d-flex align-items-center mb-3">
                                        <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                            Radiofonista UAS
                                        </h6>
                                        
                                        <div className="info-tooltip-wrapper ms-2">
                                            <img 
                                                src={infoIcon} 
                                                alt="info" 
                                                style={{ 
                                                    width: "16px", 
                                                    height: "16px", 
                                                    filter: "invert(48%) sepia(13%) saturate(623%) hue-rotate(180deg) brightness(93%) contrast(85%)",
                                                    cursor: "pointer" 
                                                }} 
                                            />
                                            <span className="info-tooltip-text">
                                                {"info"}
                                            </span>
                                        </div>
                                    </div>

                                    <InsertDoc
                                        className="mb-4"
                                        checkboxId="chkFormCertTeor"
                                        checkboxLabel="Certificado teórico"
                                        isChecked={activeChecks.chkFormCertTeor}
                                        onToggleCheck={() => handleCheckChange('chkFormCertTeor')}
                                        fileInputId="file-upload-fct"
                                        selectedFile={selectedFiles.fileCT}
                                        onFileChange={(e) => handleFileChange(e, 'fileCT')}
                                        onClearFile={() => handleClearFile('fileCT', 'file-upload-fct')}
                                        expirationDate={formValues.dateCT}
                                        onExpirationDateChange={(value) => setFormValues({ ...formValues, dateCT: value })}
                                        indefiniteId="indefiniteCT"
                                        isIndefinite={activeChecks.indefiniteCT}
                                        onToggleIndefinite={() => handleCheckChange('indefiniteCT')}
                                    />

                                    <InsertDoc
                                        className="mb-4"
                                        checkboxId="chkFormCertPract"
                                        checkboxLabel="Certificado práctico"
                                        isChecked={activeChecks.chkFormCertPract}
                                        onToggleCheck={() => handleCheckChange('chkFormCertPract')}
                                        fileInputId="file-upload-fcp"
                                        selectedFile={selectedFiles.fileCP}
                                        onFileChange={(e) => handleFileChange(e, 'fileCP')}
                                        onClearFile={() => handleClearFile('fileCP', 'file-upload-fcp')}
                                        expirationDate={formValues.dateCP}
                                        onExpirationDateChange={(value) => setFormValues({ ...formValues, dateCP: value })}
                                        indefiniteId="indefiniteCP"
                                        isIndefinite={activeChecks.indefiniteCP}
                                        onToggleIndefinite={() => handleCheckChange('indefiniteCP')}
                                    />
                                </div>

                                {/* Certificados Médicos */}
                                <div className="p-3 mb-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                                    <div className="d-flex align-items-center mb-3">
                                        <h6 className="fw-bold m-0" style={{ color: "#2F8F5B" }}>
                                            Certificados Médicos
                                        </h6>
                                        
                                        <div className="info-tooltip-wrapper ms-2">
                                            <img 
                                                src={infoIcon} 
                                                alt="info" 
                                                style={{ 
                                                    width: "16px", 
                                                    height: "16px", 
                                                    filter: "invert(48%) sepia(13%) saturate(623%) hue-rotate(180deg) brightness(93%) contrast(85%)",
                                                    cursor: "pointer" 
                                                }} 
                                            />
                                            <span className="info-tooltip-text">
                                                {"info"}
                                            </span>
                                        </div>
                                    </div>

                                    <InsertDoc
                                        className="mb-4"
                                        checkboxId="chkFormCMClase2"
                                        checkboxLabel="Clase 2 (MED.A.030 de Reglamento (UE) 1178/2011) / Drones o RPAS > 25Kg"
                                        isChecked={activeChecks.chkFormCMClase2}
                                        onToggleCheck={() => handleCheckChange('chkFormCMClase2')}
                                        fileInputId="file-upload-fcmc2"
                                        selectedFile={selectedFiles.fileCMC2}
                                        onFileChange={(e) => handleFileChange(e, 'fileCMC2')}
                                        onClearFile={() => handleClearFile('fileCMC2', 'file-upload-fcmc2')}
                                        expirationDate={formValues.dateCMC2}
                                        onExpirationDateChange={(value) => setFormValues({ ...formValues, dateCMC2: value })}
                                        indefiniteId="indefiniteCMC2"
                                        isIndefinite={activeChecks.indefiniteCMC2}
                                        onToggleIndefinite={() => handleCheckChange('indefiniteCMC2')}
                                    />

                                    <InsertDoc
                                        className="mb-4"
                                        checkboxId="chkFormCMClaseLAPL"
                                        checkboxLabel="Clase LAPL (MED.A.030 de Reglamento (UE) 1178/2011) / Drones o RPAS < 25Kg"
                                        isChecked={activeChecks.chkFormCMClaseLAPL}
                                        onToggleCheck={() => handleCheckChange('chkFormCMClaseLAPL')}
                                        fileInputId="file-upload-fcmclapl"
                                        selectedFile={selectedFiles.fileCMCLAPL}
                                        onFileChange={(e) => handleFileChange(e, 'fileCMCLAPL')}
                                        onClearFile={() => handleClearFile('fileCMCLAPL', 'file-upload-fcmclapl')}
                                        expirationDate={formValues.dateCMCLAPL}
                                        onExpirationDateChange={(value) => setFormValues({ ...formValues, dateCMCLAPL: value })}
                                        indefiniteId="indefiniteCMCLAPL"
                                        isIndefinite={activeChecks.indefiniteCMCLAPL}
                                        onToggleIndefinite={() => handleCheckChange('indefiniteCMCLAPL')}
                                    />

                                </div>

                            </div>
                        )}
                    </div>

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
                            onClick={() => navigate("/auth/users")}
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

