import { useState } from "react";
import SidebarMenu from "../main-elements-views/Sidebar";
import { useAuth } from "../commons/hooks/useAuth";  

export default function MainLayout({ children }: any) {
    const { username } = useAuth();
    const [toggled, setToggled] = useState(false);

    return (
        <div className="d-flex" style={{ minHeight: "100vh", width: "100%", alignItems: "stretch" }}>
            {username && (
                <SidebarMenu toggled={toggled} setToggled={setToggled} />
            )}

            <div 
                className="flex-grow-1 main-scroll-container" 
                style={{
                    width: "100%",
                    display: "flex", 
                    flexDirection: "column",
                    minWidth: 0,
                }}
            >
                {/* Mobile Header - Button aligned to the left */}
                {username && (
                    <div className="d-md-none p-2 border-bottom d-flex justify-content-start"
                    style={{ backgroundColor: "#3cb574" }}>
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

                <div className="p-0 p-sm-3">
                    {children}
                </div>
            </div>
        </div>
    );
}
