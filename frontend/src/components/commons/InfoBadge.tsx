import { useRef, useState } from "react";
import infoIcon from "../../assets/commons/info_white.svg";

// CORRECCIÓN: Dejamos únicamente React.ReactNode para el contenido renderizable
export function InfoBadge({ text }: { text: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({
        left: "50%",
        transform: "translateX(-50%)",
    });
    
    const [arrowLeft, setArrowLeft] = useState<string>("50%");

    const handleMouseEnter = () => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const screenCenterX = window.innerWidth / 2;

        if (rect.left < screenCenterX) {
            setPositionStyle({
                left: "0",
                transform: "none",
            });
            setArrowLeft("12px");
        } else {
            setPositionStyle({
                right: "0",
                left: "auto",
                transform: "none",
            });
            setArrowLeft("calc(100% - 24px)");
        }
    };

    return (
        <div 
            ref={containerRef} 
            className="info-tooltip-wrapper ms-2"
            style={{ position: "relative", display: "inline-block", cursor: "pointer" }}
            onMouseEnter={handleMouseEnter}
        >
            <style>{`
                .info-tooltip-text::after {
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: var(--arrow-left, 50%);
                    transform: translateX(-50%);
                    border-width: 6px;
                    border-style: solid;
                    border-color: #1e293b transparent transparent transparent;
                }
            `}</style>

            <img
                src={infoIcon}
                alt="info"
                style={{
                    width: "16px",
                    height: "16px",
                    filter: "invert(48%) sepia(13%) saturate(623%) hue-rotate(180deg) brightness(93%) contrast(85%)",
                    cursor: "pointer",
                }}
            />
            <span 
                className="info-tooltip-text z-3 shadow-lg"
                style={{
                    position: "absolute",
                    bottom: "135%", 
                    width: "240px", 
                    maxWidth: "calc(100vw - 32px)", 
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    
                    ...positionStyle,
                    ["--arrow-left" as any]: arrowLeft,

                    backgroundColor: "#1e293b",
                    color: "#ffffff",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    lineHeight: "1.4",
                    cursor: "default", 
                }}
            >
                {text}
            </span>
        </div>
    );
}