import React, { useState,  } from 'react';
import Select from 'react-select';

function FormUser() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    // Allowed file types
    const allowedTypes = ["image/jpeg", "image/png"];

    const type_user: { value: string; label: string }[] = [
        { value: "pilot", label: "Piloto" },
        { value: "manager", label: "Gestor" },
        { value: "admin", label: "Administrador" }
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
            setError("Only JPG, PNG, and PDF files are allowed.");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const newErrors = {
                nombre: !formValues.nombre.trim(),
                apellidos: !formValues.apellidos.trim(),
                username: !formValues.username.trim(),
                email: !formValues.email.trim(),
                telefono: !formValues.telefono.trim(),
                password: !formValues.password.trim(),
                confirmPassword: !formValues.confirmPassword.trim()
            };

            setErrors(newErrors);

            // If any field is invalid, stop submission
            if (Object.values(newErrors).some(Boolean)) {
                setError("Por favor complete todos los campos obligatorios.");
                return;
            }

            const res = await fetch("http://localhost:8080/api/auth/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Validar sesion
                body: JSON.stringify(formValues),
            });

            if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Credenciales incorrectas");
            }

            const data = await res.json();
            console.log("Login OK:", data);

            // aquí puedes guardar token o userId
            // localStorage.setItem("userId", data.userId);
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
                        <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Número de teléfono</label>
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
                        <Select options={type_user} styles={backgroundBorderInputsSelect} placeholder="Seleccione el tipo de usuario"/>
                    </div>

                    <div className="col-12 col-md">
                        <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Imagen de perfil</label>
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

                    {/* Row 4: Contraseña */}
                    <div className="row mb-3">
                    <div className="col-12 col-md mb-3 mb-md-0">
                        <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Contraseña</label>
                        <input type="password" className="form-control" style={backgroundBorderInputs}/>
                    </div>

                    <div className="col-12 col-md">
                        <label className="text-start d-block ps-1 form-label" style={{ color: "#1E1E1E" }}>Confirmación de contraseña</label>
                        <input type="password" className="form-control" style={backgroundBorderInputs}/>
                    </div>
                    </div>

                    {/* Error message */}
                    {error && <p className="text-danger">{error}</p>}

                    <button type="submit" className="btn btn-success w-100">
                    {loading ? "Cargando..." : "Registrar usuario"}
                    </button>
                </form>
                </div>
            </div>
        </div>
    )
}

export default FormUser