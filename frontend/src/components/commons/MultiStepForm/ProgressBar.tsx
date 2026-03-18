import React from "react";

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
    const progress = Math.min((currentStep / totalSteps) * 100, 100);
    const isFinished = currentStep >= totalSteps;

    return (
        <div className="mb-5 shadow-sm p-3 bg-white rounded border">
        <div className="d-flex justify-content-between mb-2">
            <span className="text-muted fw-bold small">
            {isFinished ? "Operación Completada" : `Paso ${currentStep + 1} de ${totalSteps}`}
            </span>
            <span className={`fw-bold small ${isFinished ? "text-success" : "text-primary"}`}>
                {Math.round(progress)}%
            </span>
        </div>
        
        <div className="progress" style={{ height: "12px", borderRadius: "10px" }}>
            <div
            className={`progress-bar progress-bar-striped progress-bar-animated shadow-sm ${
                isFinished ? "bg-success" : "bg-primary"
            }`}
            role="progressbar"
            style={{ 
                width: `${progress}%`, 
                transition: "width 0.6s cubic-bezier(0.65, 0, 0.35, 1)" 
            }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            />
        </div>
        </div>
    );
};

export default ProgressBar;