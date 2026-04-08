import React from "react";

type LoadingSpinnerProps = {
    message?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    message = "Cargando..." 
}) => {
    return (
        <div className="container py-4">
        <div 
            className="card shadow-sm" 
            style={{ border: "1px solid #E5E7EB", borderRadius: "8px" }}
        >
            <div className="card-body text-center py-5">
            <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 mb-0 text-muted">{message}</p>
            </div>
        </div>
        </div>
    );
};

export default LoadingSpinner;