import React, { useState,  } from 'react';

function FormUser() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const type_user: { value: string; label: string }[] = [
        { value: "pilot", label: "Pilot" },
        { value: "admin", label: "Admin" }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
            // method: "POST",
            // headers: { "Content-Type": "application/json" },
            // body: JSON.stringify({ username, password }),
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
        <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", backgroundColor: "#F3F4F6" }}
        >
        <div style={{ width: "100%", maxWidth: "1000px" }}>
            <h4 className="text-center mb-3 fw-normal" style={{ color: "#1E1E1E" }}>
            Formulario Registro Usuario
            </h4>

            <div
            className="card p-4 shadow-sm"
            style={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
            }}
            >

            <div className="row mb-3 text-start">
                <div className="col">
                    <label className="form-label" style={{ color: "#1E1E1E" }}>
                    Nombre
                    </label>
                    <input
                    type="text"
                    className="form-control"
                    style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
                    />
                </div>

                <div className="col">
                    <label className="form-label" style={{ color: "#1E1E1E" }}>
                    Apellidos
                    </label>
                    <input
                    type="text"
                    className="form-control"
                    style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
                    />
                </div>

                <div className="col">
                    <label className="form-label" style={{ color: "#1E1E1E" }}>
                    Nombre de usuario
                    </label>
                    <input
                    type="text"
                    className="form-control"
                    style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row mb-3 text-start">
                    <div className="col">
                        <label className="form-label" style={{ color: "#1E1E1E" }}>
                        Correo electrónico
                        </label>
                        <input
                        type="text"
                        className="form-control"
                        style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
                        />
                    </div>

                    <div className="col">
                        <label className="form-label" style={{ color: "#1E1E1E" }}>
                        Número de teléfono
                        </label>
                        <input
                        type="text"
                        className="form-control"
                        style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
                        />
                    </div>
                </div>

                <div className="row mb-3 text-start">
                    {/* <div className="col">
                        <Select options={type_user}/>
                    </div> */}

                    <div className="col">
                        <label className="form-label" style={{ color: "#1E1E1E" }}>
                        Correo electrónico
                        </label>
                        <input
                        type="text"
                        className="form-control"
                        style={{ backgroundColor: "#F3F4F6", borderColor: "#D1D5DB" }}
                        />
                    </div>
                </div>
                {/* Añadido error */}
                {error && <p className="text-danger">{error}</p>}
                <button
                type="submit"
                className="btn w-100"
                // Añadido disabled loading
                disabled={loading}
                style={{
                    backgroundColor: "#2F8F5B",
                    color: "white",
                    fontWeight: "500",
                }}
                >
                {/* Añadido */}
                {loading ? "Cargando..." : "Iniciar Sesión"}
                </button>
            </form>
            </div>
        </div>
        </div>
    )
}

export default FormUser