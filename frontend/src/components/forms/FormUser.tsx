import React, { useState,  } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import './generic-form.css';
import Select from 'react-select';
import { apiFetch } from '../../api';
import { useNavigate } from "react-router-dom";

import checkIcon from '../../assets/commons/check_white.svg';
import cancelIcon from '../../assets/commons/cancel_white.svg';
import infoIcon from '../../assets/commons/info_white.svg';

function FormUser() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedUserType, setSelectedUserType] = useState<{ value: string; label: string } | null>(null);
    const [showOptional, setShowOptional] = useState(false);
    const [certFiles, setCertFiles] = useState<Record<string, File | null>>({});

    const navigate = useNavigate();

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    // Allowed file types
    const allowedTypes = ["image/jpeg", "image/png"];

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
        catEspecíficaEscenarios: "",
        catEspecíficaAutorización: "",
        dateA1A3: "",
        dateA2: "",
        dateSTS: "",
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
        chkSora: false,
        chkLuc: false,
        indefiniteA1A3: false,
        indefiniteA2: false,
        indefiniteSTS: false
    });

    // Función para alternar los checks
    const handleCheckChange = (id: string) => {
        setActiveChecks(prev => ({ ...prev, [id]: !prev[id as keyof typeof activeChecks] }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const file = event.target.files?.[0];

        if (!file) {
            setSelectedFile(null);
            setError("");
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            setError("Only JPG and PNG files are allowed.");
            setSelectedFile(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB.");
            setSelectedFile(null);
            return;
        }

        console.log(`Uploaded file for: ${id}`);
        setSelectedFile(file);
        setError("");
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        // Esto resetea el input para permitir volver a elegir el mismo archivo
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
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
                setError("Las contraseñas no coinciden.");
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
            if (selectedFile) {
                formData.append("imageFile", selectedFile, selectedFile.name);
            }
            formData.append("docIdentidad", formValues.docIdentidad);
            formData.append("fechaNac", formValues.fechaNac);

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
                
                // Si el backend envía un mensaje específico de duplicado
                if (errorData.message && errorData.message.includes("already exists")) {
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
            
            navigate("/auth/users"); // redirect to users list after success

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
                                    {selectedFile ? selectedFile.name : "No hay archivo"}
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
                                        style={{ cursor: "pointer", borderTopRightRadius: selectedFile ? "0" : "4px", borderBottomRightRadius: selectedFile ? "0" : "4px" }}
                                    >
                                        Seleccionar archivo
                                    </label>

                                    {selectedFile && (
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={handleClearFile}
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
                                {showOptional ? "− Ocultar certificados" : "+ Añadir certificados"}
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
                                    <div className="mb-4">
                                        {/* Row 1: Subcategory Name */}
                                        <div className="row">
                                            <div className="col-12 text-start">
                                                <div className="form-check">
                                                    <input 
                                                        className="form-check-input shadow-none" 
                                                        type="checkbox" 
                                                        id="chkA1A3"
                                                        checked={activeChecks.chkA1A3}
                                                        onChange={() => handleCheckChange('chkA1A3')} 
                                                    />
                                                    <label className="form-check-label small fw-bold" htmlFor="chkA1A3">
                                                        A1 / A3 (Prueba de superación)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2: Inputs (Conditional) */}
                                        {activeChecks.chkA1A3 && (
                                            <div className="row g-2 mt-1 ms-3 fade-in-input text-start">
                                                <div className="col-12 col-md-5">
                                                    <small className="text-muted d-block mb-1 text-start" style={{ fontSize: "0.65rem" }}>
                                                        Certificado PDF
                                                    </small>
                                                    <input 
                                                        type="file" 
                                                        className="form-control form-control-sm"
                                                        onChange={(e) => handleFileChange(e, 'fileA1A3')}
                                                        accept=".pdf,.jpg,.png"
                                                    />
                                                </div>
                                                <div className="col-12 col-md-4">
                                                    <small className="text-muted d-block mb-1 text-start" style={{ fontSize: "0.65rem" }}>
                                                        Vencimiento
                                                    </small>
                                                    <div className="input-group input-group-sm mb-1">
                                                        <input 
                                                            type="date" 
                                                            className="form-control"
                                                            disabled={activeChecks.indefiniteA1A3}
                                                            value={activeChecks.indefiniteA1A3 ? "" : formValues.dateA1A3}
                                                            onChange={(e) => setFormValues({...formValues, dateA1A3: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="form-check text-start">
                                                        <input 
                                                            className="form-check-input shadow-none" 
                                                            type="checkbox" 
                                                            id="indefiniteA1A3"
                                                            checked={activeChecks.indefiniteA1A3}
                                                            onChange={() => handleCheckChange('indefiniteA1A3')} 
                                                        />
                                                        <label className="form-check-label text-muted text-start" htmlFor="indefiniteA1A3" style={{ fontSize: "0.65rem" }}>
                                                            Indefinido
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Subcategoría A2 */}
                                    <div className="mb-2">
                                        {/* Row 1: Subcategory Name */}
                                        <div className="row">
                                            <div className="col-12 text-start">
                                                <div className="form-check">
                                                    <input 
                                                        className="form-check-input shadow-none" 
                                                        type="checkbox" 
                                                        id="chkA2" 
                                                        checked={activeChecks.chkA2}
                                                        onChange={() => handleCheckChange('chkA2')} 
                                                    />
                                                    <label className="form-check-label small fw-bold" htmlFor="chkA2">
                                                        A2 (Certificado de aptitud)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2: Inputs (Conditional) */}
                                        {activeChecks.chkA2 && (
                                            <div className="row g-2 mt-1 ms-3 fade-in-input text-start">
                                                <div className="col-12 col-md-5">
                                                    <small className="text-muted d-block mb-1 text-start" style={{ fontSize: "0.65rem" }}>
                                                        Certificado PDF
                                                    </small>
                                                    <input 
                                                        type="file" 
                                                        className="form-control form-control-sm"
                                                        onChange={(e) => handleFileChange(e, 'fileA2')}
                                                        accept=".pdf,.jpg,.png"
                                                    />
                                                </div>
                                                <div className="col-12 col-md-4">
                                                    <small className="text-muted d-block mb-1 text-start" style={{ fontSize: "0.65rem" }}>
                                                        Vencimiento
                                                    </small>
                                                    <div className="input-group input-group-sm mb-1">
                                                        <input 
                                                            type="date" 
                                                            className="form-control"
                                                            disabled={activeChecks.indefiniteA2}
                                                            value={activeChecks.indefiniteA2 ? "" : formValues.dateA2}
                                                            onChange={(e) => setFormValues({...formValues, dateA2: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="form-check text-start">
                                                        <input 
                                                            className="form-check-input shadow-none" 
                                                            type="checkbox" 
                                                            id="indefiniteA2"
                                                            checked={activeChecks.indefiniteA2}
                                                            onChange={() => handleCheckChange('indefiniteA2')} 
                                                        />
                                                        <label className="form-check-label text-muted text-start" htmlFor="indefiniteA2" style={{ fontSize: "0.65rem" }}>
                                                            Indefinido
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                            
                                    {/* Row 1: STS Checkbox */}
                                    <div className="row">
                                        <div className="col-12 text-start">
                                            <div className="form-check">
                                                <input 
                                                    className="form-check-input shadow-none" 
                                                    type="checkbox" 
                                                    id="chkSTS01" 
                                                    checked={activeChecks.chkSTS01}
                                                    onChange={() => handleCheckChange('chkSTS01')} 
                                                />
                                                <label className="form-check-label small fw-bold" htmlFor="chkSTS01">
                                                    STS europeo
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 2: Inputs (Indented without border) */}
                                    {activeChecks.chkSTS01 && (
                                        <div className="row g-2 mt-1 ms-3 fade-in-input text-start">
                                            <div className="col-12 col-md-5">
                                                <small className="text-muted d-block mb-1 text-start" style={{ fontSize: "0.65rem" }}>
                                                    Certificado PDF
                                                </small>
                                                <input 
                                                    type="file" 
                                                    className="form-control form-control-sm"
                                                    onChange={(e) => handleFileChange(e, 'fileSTS')}
                                                    accept=".pdf,.jpg,.png"
                                                />
                                            </div>
                                            <div className="col-12 col-md-4">
                                                <small className="text-muted d-block mb-1 text-start" style={{ fontSize: "0.65rem" }}>
                                                    Vencimiento
                                                </small>
                                                <div className="input-group input-group-sm mb-1">
                                                    <input 
                                                        type="date" 
                                                        className="form-control"
                                                        disabled={activeChecks.indefiniteSTS}
                                                        value={activeChecks.indefiniteSTS ? "" : formValues.dateSTS}
                                                        onChange={(e) => setFormValues({...formValues, dateSTS: e.target.value})}
                                                    />
                                                </div>
                                                <div className="form-check text-start">
                                                    <input 
                                                        className="form-check-input shadow-none" 
                                                        type="checkbox" 
                                                        id="indefiniteSTS"
                                                        checked={activeChecks.indefiniteSTS}
                                                        onChange={() => handleCheckChange('indefiniteSTS')} 
                                                    />
                                                    <label className="form-check-label text-muted text-start" htmlFor="indefiniteSTS" style={{ fontSize: "0.65rem" }}>
                                                        Indefinido
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* CATEGORÍA ESPECÍFICA - AUTORIZACIÓN */}
                                <div className="p-3 border rounded-3" style={{ backgroundColor: "#f1f2f3" }}>
                                    <h6 className="fw-bold mb-3" style={{ color: "#2F8F5B" }}>Bajo Autorización / Otros</h6>
                                    <div className="row align-items-center mb-2 g-2">
                                        <div className="col-12 col-md-4">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="chkSora" />
                                                <label className="form-check-label small" htmlFor="chkSora">SORA / Autorización</label>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-8">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    id="chkSora" 
                                                    checked={activeChecks.chkSora}
                                                    onChange={() => handleCheckChange('chkSora')} 
                                                />
                                        </div>
                                    </div>
                                    <div className="row align-items-center g-2">
                                        <div className="col-12 col-md-4">
                                            <div className="form-check">
                                                <input className="form-check-input" type="checkbox" id="chkLuc" />
                                                <label className="form-check-label small" htmlFor="chkLuc">Certificado LUC</label>
                                            </div>
                                        </div>
                                        <div className="col-12 col-md-8">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    id="chkLuc" 
                                                    checked={activeChecks.chkLuc}
                                                    onChange={() => handleCheckChange('chkLuc')} 
                                                />
                                        </div>
                                    </div>
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




