import React, { useEffect, useState } from "react";

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  color: "blue" | "red" | "orange" | "purple" |"green";
  delay: number;
}

const colorStyles = {
  blue: { bg: "#3B82F6", gradient: "from-blue-500 to-blue-600", light: "#DBEAFE" },
  red: { bg: "#EF4444", gradient: "from-red-500 to-rose-600", light: "#FEE2E2" },
  orange: { bg: "#F59E0B", gradient: "from-amber-500 to-orange-500", light: "#FEF3C7" },
  purple: { bg: "#8B5CF6", gradient: "from-violet-500 to-purple-600", light: "#EDE9FE" },
  green: { bg: "#10B981", gradient: "from-green-500 to-green-600", light: "#D1FAE5" }
};

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const style = colorStyles[color];

  return (
    <div
      className={`col-md-6 col-lg-3 transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        className="card border-1 shadow-sm h-100 overflow-hidden position-relative"
        style={{
          borderRadius: "16px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          backgroundColor: "#f3f8f5", // El color del fondo de las cartas
        }}
      >
        <div
          className={`w-100 bg-gradient-to-r ${style.gradient}`}
          style={{ height: "4px" }}
        />
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: style.light,
                transition: "transform 0.2s ease"
              }}
            >
              <i
                className={`bi ${icon}`}
                style={{
                  fontSize: "28px",
                  color: style.bg,
                  transition: "transform 0.2s ease"
                }}
              />
            </div>
            <span
              className="badge rounded-pill"
              style={{
                backgroundColor: style.light,
                color: style.bg,
                fontSize: "0.75rem",
                fontWeight: 600
              }}
            >
              Total
            </span>
          </div>
          <h2
            className="mb-1 fw-bold"
            style={{ fontSize: "2.25rem", color: "#1F2937", letterSpacing: "-0.025em" }}
          >
            {value.toLocaleString()}
          </h2>
          <p className="mb-0" style={{ color: "#6B7280", fontSize: "0.95rem", fontWeight: 500 }}>
            {label}
          </p>
        </div>
        <div
          className="position-absolute"
          style={{
            right: "-20px",
            bottom: "-20px",
            width: "100px",
            height: "100px",
            backgroundColor: style.light,
            borderRadius: "50%",
            opacity: 0.3,
            pointerEvents: "none"
          }}
        />
      </div>
    </div>
  );
};

export default StatCard;