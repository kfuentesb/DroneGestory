import React, { useState } from "react";
import GifDrone from "../../assets/gifs/drone.gif";

type LoadingSpinnerProps = {
    message?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    message = "Cargando..." 
}) => {
    // Estado para controlar si el GIF terminó de cargar
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="container py-4">
            <div 
                className="card shadow-sm border-0" 
                style={{ borderRadius: "16px", backgroundColor: "#fff" }}
            >
                <div className="card-body text-center py-5">
                    <div 
                        className="position-relative d-inline-flex align-items-center justify-content-center"
                        style={{ width: "80px", height: "80px" }}
                    >
                        <div 
                            className="spinner-border text-success" 
                            role="status"
                            style={{ 
                                width: "80px", 
                                height: "80px", 
                                borderWidth: "3px",
                                position: "absolute" 
                            }}
                        >
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <img 
                            src={GifDrone} 
                            alt="" 
                            onLoad={() => setIsLoaded(true)}
                            className="rounded-circle"
                            style={{ 
                                width: "45px", 
                                height: "45px", 
                                objectFit: "cover",
                                zIndex: 1,
                                display: isLoaded ? "block" : "none"
                            }} 
                        />
                    </div>

                    <h5 className="mt-4 mb-0 fw-bold" style={{ color: "#059669" }}>
                        {message}
                    </h5>
                    <p className="small text-muted mt-1">Por favor, espera un momento</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;