import { useNavigate } from "react-router-dom";
import UnderConstructionGif from "../../assets/commons/under-construction90s-90s.gif";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#F3F4F6",
            }}
        >
            <div
                style={{
                    textAlign: "center",
                    backgroundColor: "white",
                    padding: "40px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    maxWidth: "500px",
                    width: "90%",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
            >
                {/* Añadimos el GIF antes del título */}
                <div style={{ marginBottom: "20px" }}>
                    <img 
                        src={UnderConstructionGif} 
                        alt="Bajo construcción" 
                        style={{ 
                            maxWidth: "200px", 
                            height: "auto",
                            display: "block",
                            margin: "0 auto"
                        }} 
                    />
                </div>

                <h1 style={{ fontSize: "48px", color: "#DC2626", margin: "0" }}>404</h1>

                <h3 style={{ marginBottom: "20px", color: "#374151" }}>
                    No se encuentra la página
                </h3>
                
                <p style={{ color: "#6B7280", marginBottom: "30px", fontSize: "14px" }}>
                    Lo sentimos, la ruta que buscas no existe o ha sido movida.
                </p>

                <button
                    onClick={() => navigate("/")}
                    style={{
                        backgroundColor: "#2F8F5B",
                        color: "white",
                        padding: "12px 24px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#246d45")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2F8F5B")}
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
}