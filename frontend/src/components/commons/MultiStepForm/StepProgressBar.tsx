import React from "react";

interface Step {
  label: string; // e.g. "Anexo 4"
  anexo: number;
  name: string;  // e.g. "Anexo 4 - Equipamiento"
}

interface StepProgressBarProps {
  steps: Step[];
  currentStep: number; // índice (0 = primero)
  onStepClick?: (step: Step) => void;
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({ steps, currentStep, onStepClick }) => {
  const totalSteps = steps.length;
  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  return (
    <div className="mb-5" style={{ userSelect: "none" }}>
      <div className="position-relative" style={{ minHeight: "60px" }}>
        {/* Línea de progreso de fondo */}
        <div style={{
          height: "5px",
          background: "#e0e0e0",
          position: "absolute",
          top: "28px",
          left: "0",
          right: "0",
          borderRadius: "4px",
          zIndex: 1
        }}/>

        {/* Línea de progreso rellena */}
        <div style={{
          height: "5px",
          background: "#2563eb",
          position: "absolute",
          top: "28px",
          left: "0",
          width: `${progress}%`,
          borderRadius: "4px",
          zIndex: 2,
          transition: "width 0.58s cubic-bezier(0.65,0,0.35,1)"
        }}/>

        <div className="d-flex justify-content-between align-items-center position-relative" style={{ zIndex: 3 }}>
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div
                key={step.anexo}
                className="d-flex flex-column align-items-center stepper-col"
                style={{
                  minWidth: "70px",
                  flex: 1,
                  cursor: onStepClick && !isActive ? "pointer" : "default",
                }}
                onClick={() => (onStepClick && !isActive) ? onStepClick(step) : undefined}
                title={step.name}
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center stepper-circle
                    ${isActive ? "active-step" : ""}
                    ${isCompleted && !isActive ? "completed-step" : ""}
                    ${!isCompleted && !isActive ? "pending-step" : ""}
                  `}
                  style={{
                    width: isActive ? 48 : 38,
                    height: isActive ? 48 : 38,
                    border: `2.4px solid ${isActive ? "#2563eb" : isCompleted ? "#198754" : "#e0e0e0"}`,
                    fontWeight: isActive ? "bold" : "normal",
                    fontSize: 19,
                    transition: "all 0.28s cubic-bezier(.47,1.64,.41,.8)",
                    boxShadow: isActive
                      ? "0 0 0 6px #2563eb15, 0 0 19px 3px #2563eb44"
                      : isCompleted
                        ? "0 0 8px 1px #19875440"
                        : ""
                  }}
                >
                  {isCompleted ? (
                    <span style={{ fontWeight: 700, fontSize: 22, marginTop: '-1px', transition: "all 0.1s" }}>✓</span>
                  ) : (
                    step.anexo
                  )}
                </div>
                <span
                  className={`small mt-2 text-center stepper-label${isActive ? " fw-bold text-primary" : isCompleted ? " text-success" : " text-secondary"}`}
                  style={{
                    fontSize: isActive ? "1.01rem" : "0.92rem",
                    transition: "all 0.19s"
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* ANIMACIÓN Y GLOW */}
      <style>{`
        .stepper-circle {
          background: #fff;
          box-shadow: 0 2px 8px 0 #0001;
          transition: box-shadow 0.17s, border 0.2s, background 0.18s, width 0.22s, height 0.22s;
        }
        .stepper-col:hover .stepper-circle:not(.active-step) {
          border-color: #60a5fa !important;
          box-shadow: 0 2px 12px 1px #2563eb22, 0 0 0 3px #2563eb25;
          transform: scale(1.07);
        }
        .stepper-col:active .stepper-circle:not(.active-step) {
          transform: scale(0.95);
        }
        .active-step {
          animation: pulse-glow 1s cubic-bezier(.87,0,.13,1) infinite alternate;
        }
        @keyframes pulse-glow {
          from { box-shadow: 0 0 0 6px #2563eb12, 0 0 19px 3px #2563eb44; }
          to   { box-shadow: 0 0 0 12px #2563eb12, 0 0 27px 5px #2563eb78; }
        }
      `}</style>
    </div>
  );
};

export default StepProgressBar;