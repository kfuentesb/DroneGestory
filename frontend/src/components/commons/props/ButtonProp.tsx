import React from "react";

interface ButtonProp {
    children: React.ReactNode;                // Lo que muestras dentro (texto o icono)
    onClick: () => void;                      // Lo que hace al hacer click
    className?: string;                       // Clases adicionales ("btn", "btn-primary", etc)
    style?: React.CSSProperties;              // Estilos inline opcionales
    type?: "button" | "submit" | "reset";     // Tipo de botón, útil en formularios
    disabled?: boolean;                       // Estado deshabilitado opcional
}

const ButtonProp: React.FC<ButtonProp> = ({
    /**
     * EJEMPLOS PARA REUSO
        //Añadir aeronave
            <ButtonProp onClick={() => navigate("/register-aircraft")}>
            + Añadir aeronave
        </ButtonProp>

        // Registrar usuario
        <ButtonProp onClick={registerUser}>Registrar usuario</ButtonProp>

        Volver atrás
        <ButtonProp onClick={() => navigate(-1)}>Volver</ButtonProp>
     */
    children,
    onClick,
    className = "btn",
    style = {
        backgroundColor: "#2F8F5B",
        color: "#FFFFFF",
        fontWeight: "bold",
        minWidth: "50px",
    },
    type = "button",
    disabled = false,
}) => (
    <button
        type={type}
        className={className}
        style={style}
        onClick={onClick}
        disabled={disabled}
    >
        {children}
    </button>
);

export default ButtonProp;
