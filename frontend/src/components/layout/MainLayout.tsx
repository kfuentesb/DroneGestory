import SidebarMenu from "../commons/Sidebar";

export default function MainLayout({ children }: any) {
    return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
        <SidebarMenu />

        <div
        style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto"
        }}
        >
        {children}
        </div>
    </div>
    );
}