import React, { useEffect, useState } from "react";

const StatCardSkeleton: React.FC<{ delay: number }> = ({ delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`col-md-6 col-lg-3 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "16px" }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="rounded-3 bg-secondary bg-opacity-25" style={{ width: "56px", height: "56px" }} />
            <div className="rounded-pill bg-secondary bg-opacity-25" style={{ width: "40px", height: "20px" }} />
          </div>
          <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{ width: "80px", height: "36px" }} />
          <div className="bg-secondary bg-opacity-25 rounded" style={{ width: "100px", height: "16px" }} />
        </div>
      </div>
    </div>
  );
};

export default StatCardSkeleton;