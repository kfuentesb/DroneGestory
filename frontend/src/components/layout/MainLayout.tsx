import SidebarMenu from "../commons/Sidebar";

export default function MainLayout({ children }: any) {
    return (
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            {/* Sidebar solo visible en md o más grande */}
            <div className="d-none d-md-block">
                <SidebarMenu />
            </div>

            <div
                className="flex-grow-1 p-2"
                style={{ overflowY: "auto" }}
            >
                {children}
            </div>
        </div>
    );
}