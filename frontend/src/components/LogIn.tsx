import React, { useState, useEffect } from 'react';

function LogIn() {
    // Tenemos que crear las llamadas al endpoint desde aquí
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
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
            style={{ minHeight: "100vh" }}
        >
            <div style={{ width: "100%", maxWidth: "400px" }}>

                <h4 className="text-center mb-3 fw-normal">
                    Inicia sesión en Drone Gestory
                </h4>

                <div
                    className="card p-4"
                    style={{
                        borderRadius: "6px",
                        border: "2px outset #4d4d4d",
                        backgroundColor: "#55d77a",
                        color: "white"
                    }}
                >   {/* añadido handleSubmit*/}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Usuario o correo electrónico</label>
                            <input
                                type="text"
                                className="form-control"
                                // Añadidos value y onchange
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ backgroundColor: "#f6f8fa" }}
                            />
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between">
                                <label className="form-label">Contraseña</label>
                                <a href="#" style={{ fontSize: "0.8rem", color: "#645ac3" }}>
                                    ¿Olvidaste la contraseña?
                                </a>
                            </div>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ backgroundColor: "#f6f8fa" }}
                            />
                        </div>
                        {/* Añadido error */}
                        {error && <p className="text-danger">{error}</p>}
                        <button
                            type="submit"
                            className="btn w-100"
                            // Añadido disabled loading
                            disabled={loading}
                            style={{
                                backgroundColor: "#645ac3",
                                color: "white",
                                fontWeight: "500",
                            }}
                        >
                            { // Añadido
                            loading ? "Cargando..." : "Iniciar Sesión"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LogIn;