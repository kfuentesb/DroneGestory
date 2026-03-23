import React, { useState,  } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import Select from 'react-select';
import { apiFetch } from '../../api';
import { useNavigate } from "react-router-dom";

import checkIcon from '../../assets/check_white.svg';
import cancelIcon from '../../assets/cancel_white.svg';

function FormUser() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedUserType, setSelectedUserType] = useState<{ value: string; label: string } | null>(null);

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
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({
        nombre: false,
        apellidos: false,
        username: false,
        email: false,
        telefono: false,
        password: false,
        confirmPassword: false
    });

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

                    {/* Row 3: Tipo de usuario, Imagen */}
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
                                    onChange={handleFileChange}
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

                    {/* Row 4: Contraseña */}
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




