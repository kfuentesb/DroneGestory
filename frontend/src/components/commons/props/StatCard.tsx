import React, { useEffect, useState } from "react";

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  color: "blue" | "red" | "orange" | "purple" | "green";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    
    const handleResize = () => setIsMobile(window.innerWidth < 576);
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [delay]);

  const style = colorStyles[color];

  return (
    <div
      className={`col-6 col-md-6 col-lg-3 transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        className="card border-1 shadow-sm h-100 overflow-hidden position-relative"
        style={{
          borderRadius: "12px",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          backgroundColor: "#f3f8f5",
          maxHeight: isMobile ? "125px" : "180px", 
        }}
      >
        <div
          className={`w-100 bg-gradient-to-r ${style.gradient}`}
          style={{ height: "4px" }}
        />
        <div className="card-body p-2 p-sm-4">
          <div className="d-flex align-items-center justify-content-between mb-2 mb-sm-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: isMobile ? "32px" : "56px",
                height: isMobile ? "32px" : "56px",
                backgroundColor: style.light,
              }}
            >
              <i
                className={`bi ${icon}`}
                style={{ fontSize: isMobile ? "16px" : "28px", color: style.bg }}
              />
            </div>
            <span
              className="badge rounded-pill"
              style={{
                backgroundColor: style.light,
                color: style.bg,
                fontSize: isMobile ? "0.6rem" : "0.75rem",
                padding: isMobile ? "3px 6px" : "4px 8px",
                fontWeight: 600
              }}
            >
              Total
            </span>
          </div>
          
          <h2
            className="mb-0 mb-sm-1 fw-bold"
            style={{ 
              fontSize: isMobile ? "1.3rem" : "2.25rem",
              color: "#1F2937", 
              letterSpacing: "-0.025em",
              whiteSpace: "nowrap",
              overflow: "hidden", 
              textOverflow: "ellipsis" 
            }}
          >
            {value.toLocaleString()}
          </h2>

          <p 
            className="mb-0" 
            title={label}
            style={{ 
              color: "#6B7280", 
              fontSize: isMobile ? "0.75rem" : "0.95rem",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "block" 
            }}
          >
            {label}
          </p>
        </div>

        <div
          className="position-absolute"
          style={{
            right: "-20px",
            bottom: "-20px",
            width: isMobile ? "60px" : "100px",
            height: isMobile ? "60px" : "100px",
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