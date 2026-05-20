import React, { useEffect, useState } from "react";

const StatCardSkeleton: React.FC<{ delay: number }> = ({ delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`col-6 col-md-6 col-lg-3 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
        <div className="card-body p-2 p-sm-4">
          
          <div className="d-flex align-items-center justify-content-between mb-2 mb-sm-3">
            <div 
              className="rounded-3 bg-secondary bg-opacity-25 d-none d-sm-block" 
              style={{ 
                width: "var(--icon-size, 36px)", 
                height: "var(--icon-size, 36px)"
              }} 
            />
            <div className="rounded-3 bg-secondary bg-opacity-25 d-block d-sm-none" style={{ width: "32px", height: "32px" }} />
            
            <div className="rounded-pill bg-secondary bg-opacity-25 d-block d-sm-none" style={{ width: "30px", height: "16px" }} />
            <div className="rounded-pill bg-secondary bg-opacity-25 d-none d-sm-block" style={{ width: "40px", height: "20px" }} />
          </div>

          <div className="bg-secondary bg-opacity-25 rounded mb-1 mb-sm-2 d-block d-sm-none" style={{ width: "50px", height: "24px" }} />
          <div className="bg-secondary bg-opacity-25 rounded mb-2 d-none d-sm-block" style={{ width: "80px", height: "36px" }} />
          
          <div className="bg-secondary bg-opacity-25 rounded d-block d-sm-none" style={{ width: "70px", height: "12px" }} />
          <div className="bg-secondary bg-opacity-25 rounded d-none d-sm-block" style={{ width: "100px", height: "16px" }} />
          
        </div>
      </div>
    </div>
  );
};

export default StatCardSkeleton;