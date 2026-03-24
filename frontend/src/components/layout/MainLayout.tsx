import { useState } from "react";
import SidebarMenu from "../commons/Sidebar";
import { useAuth } from "../commons/hooks/useAuth";  

export default function MainLayout({ children }: any) {
    const { username } = useAuth();
    const [toggled, setToggled] = useState(false);

    return (
        <div className="d-flex" style={{ minHeight: "100vh", width: "100%" }}>
            {username && (
                <SidebarMenu toggled={toggled} setToggled={setToggled} />
            )}

            <div 
                className="flex-grow-1" 
                style={{ 
                    overflowY: "auto", 
                    width: "100%",
                    display: "flex", 
                    flexDirection: "column" 
                }}
            >
                {/* Mobile Header - Button aligned to the left */}
                {username && (
                    <div className="d-md-none p-2 border-bottom bg-light d-flex justify-content-start">
                        <button 
                            className="btn" 
                            style={{ 
                                backgroundColor: "#2F8F5B", 
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                            onClick={() => setToggled(true)}
                        >
                            <span>☰</span> Abrir Menú
                        </button>
                    </div>
                )}

                <div className="p-3">
                    {children}
                </div>
            </div>
        </div>
    );
}