import { useNavigate } from "react-router-dom";

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
        }}
        >
        <h1 style={{ fontSize: "48px", color: "#DC2626" }}>404</h1>

        <h3 style={{ marginBottom: "20px" }}>
            No se encuentra la página
        </h3>

        <button
            onClick={() => navigate("/")}
            style={{
            backgroundColor: "#2F8F5B",
            color: "white",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            }}
        >
            Volver al inicio
        </button>
        </div>
    </div>
    );
}