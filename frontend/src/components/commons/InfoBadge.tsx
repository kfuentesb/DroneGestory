import infoIcon from "../../assets/commons/info_white.svg";

export function InfoBadge({ text }: { text: React.ReactNode }) {
    return (
        <div className="info-tooltip-wrapper ms-2">
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
            <span className="info-tooltip-text">{text}</span>
        </div>
    );
}