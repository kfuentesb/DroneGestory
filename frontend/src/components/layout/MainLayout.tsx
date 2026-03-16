import SidebarMenu from "../commons/Sidebar";
import { useAuth } from "../AuthProvider";  

export default function MainLayout({ children }: any) {
    const { username } = useAuth();
    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            {username && (
                <div className="d-none d-md-block">
                    <SidebarMenu />
                </div>
            )}

            <div
                className="flex-grow-1 p-2"
                style={{ overflowY: "auto" }}
            >
                {children}
            </div>
        </div>
    );
}