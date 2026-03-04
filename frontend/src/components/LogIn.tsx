import React from "react";

function LogIn() {
    return (
        <div
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh"}}
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
                >
                    <form>
                    <div className="mb-3">
                        <label className="form-label">Usuario o correo electrónico</label>
                        <input
                        type="text"
                        className="form-control"
                        style={{ backgroundColor: "#f6f8fa"}}
                        />
                    </div>

                    <div className="mb-3">
                        <div className="d-flex justify-content-between">
                        <label className="form-label">Contraseña</label>
                        <a href="#" style={{ fontSize: "0.8rem" , color:"#645ac3"}}>
                            ¿Olvidaste la contraseña?
                        </a>
                        </div>
                        <input
                        type="password"
                        className="form-control"
                        style={{ backgroundColor: "#f6f8fa" }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn w-100"
                        style={{
                        backgroundColor: "#645ac3",
                        color: "white",
                        fontWeight: "500",
                        }}
                    >
                        Iniciar Sesion
                    </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LogIn;