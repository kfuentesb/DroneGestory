import { type CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
    backBtn: {
        borderRadius: "8px",
        width: "48px",
        height: "48px",
        transition: "all 0.2s ease",
        marginTop: "4px",
        border: "none",
        backgroundColor: "transparent"
    },
    backIcon: {
        width: "32px",
        height: "32px",
        filter: "invert(42%) sepia(93%) saturate(395%) hue-rotate(102deg) brightness(92%) contrast(85%)"
    },
    profileImg: {
        width: "110px", 
        height: "110px", 
        objectFit: "cover"
    },
    badge: {
        borderRadius: "4px",
        fontSize: "0.85rem",
        border: "1px solid currentColor"
    }
};