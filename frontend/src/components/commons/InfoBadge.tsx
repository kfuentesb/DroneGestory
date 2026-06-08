import { useRef, useState } from "react";
import infoIcon from "../../assets/commons/info_white.svg";

export function InfoBadge({ text }: { text: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [positionStyle, setPositionStyle] = useState<React.CSSProperties>({
        left: "50%",
        transform: "translateX(-50%)",
    });
    
    const [arrowLeft, setArrowLeft] = useState<string>("50%");

    const handleMouseEnter = () => {
        setIsVisible(true);
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

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <div 
            ref={containerRef} 
            className="info-tooltip-wrapper ms-2"
            style={{ 
                position: "relative", 
                display: "inline-block", 
                cursor: "pointer",
                zIndex: 10500 
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <style>{`
                .info-tooltip-text {
                    z-index: 10500 !important;
                }
                /* Flecha del Tooltip */
                .info-tooltip-text::after {
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: var(--arrow-left, 50%);
                    transform: translateX(-50%);
                    border-width: 6px;
                    border-style: solid;
                    border-color: #1e293b transparent transparent transparent;
                    z-index: 10501 !important;
                }
                /* Puente invisible: Llena el espacio vacío entre el icono y el badge */
                /* Evita que el Tooltip se cierre prematuramente al desplazar el cursor */
                .info-tooltip-text::before {
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    height: 12px; /* Cubre exactamente el espacio asignado por el marginBottom */
                    background: transparent;
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
                    display: "block"
                }}
            />

            <span 
                className="info-tooltip-text shadow-lg"
                style={{
                    position: "absolute",
                    bottom: "100%",
                    marginBottom: "10px",
                    width: "240px", 
                    maxWidth: "calc(100vw - 32px)", 
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    
                    display: isVisible ? "block" : "none",
                    ...positionStyle,
                    ["--arrow-left" as any]: arrowLeft,

                    backgroundColor: "#1e293b",
                    color: "#ffffff",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    lineHeight: "1.4",
                    cursor: "default", 
                    pointerEvents: "auto",
                }}
            >
                {text}
            </span>
        </div>
    );
}