import { useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../commons/hooks/useAuth";

import ArrowBack from '../../assets/commons/arrow_back_white.svg';
import ArrowForward from '../../assets/commons/arrow_forward_white.svg';
import UsersIcon from '../../assets/sidebar/group_white.svg';
import DroneIcon from '../../assets/sidebar/drone_white.svg';
import FlyIcon from '../../assets/sidebar/fly_drone_white.svg';
import DocIcon from '../../assets/sidebar/docs.svg';

interface SidebarMenuProps {
    toggled: boolean;
    setToggled: (value: boolean) => void;
}

export default function SidebarMenu({ toggled, setToggled }: SidebarMenuProps) {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const { role } = useAuth();
    const canManage = role === "ADMIN" || role === "MANAGER";

    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const handleToggle = (menuName: string) => {
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    return (
        <Sidebar
            collapsed={collapsed}
            toggled={toggled}
            onBackdropClick={() => setToggled(false)}
            breakPoint="md" 
            backgroundColor="#2F8F5B"
            width="250px"
            collapsedWidth="70px"
            transitionDuration={300}
            style={{
                minHeight: "100vh",
                borderRight: "none",
                flexDirection: "column",
                display: "flex",
                alignSelf: "stretch",
                zIndex: 1000,
            }}
        >

            <Menu
                closeOnClick={false}
                menuItemStyles={{
                    button: ({ level }) => ({
                        color: "#E5E7EB",
                        backgroundColor: level === 0 ? "#2F8F5B" : "#257a4d",
                        "&:hover": {
                            backgroundColor: "#37a76b",
                            color: "#FFFFFF",
                        },
                    }),
                    subMenuContent: {
                        backgroundColor: "#1F6B43",
                    },
                    icon: {
                        color: "#E5E7EB",
                    },
                }}
            >
                {/* 1. Toggle Button: Desktop (Collapse) / Mobile (Hide) */}
                <MenuItem
                    onClick={() => {
                        if (window.innerWidth < 768) {
                            setToggled(false);
                        } else {
                            setCollapsed(!collapsed);
                        }
                    }}
                    icon={
                        <img
                            src={collapsed ? ArrowForward : ArrowBack}
                            alt="Toggle"
                            style={{ width: "18px", height: "18px" }}
                        />
                    }
                    style={{ fontWeight: "bold", textAlign: "center", marginBottom: "10px", marginTop: "10px" }}
                >
                    {collapsed ? "" : "Cerrar Menú"}
                </MenuItem>

                <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "0 10px 10px 10px" }} />

                {/* 2. Admin Users Section */}
                {canManage && (
                    <SubMenu
                        label="Administrar usuarios"
                        open={openMenu === "users"}
                        onOpenChange={() => handleToggle("users")}
                        icon={<img src={UsersIcon} alt="Users" style={{ width: "18px", height: "18px" }} />}
                    >
                        <MenuItem onClick={() => { navigate("/users"); setToggled(false); }}>Listar usuarios</MenuItem>
                        <MenuItem onClick={() => { navigate("/register-user"); setToggled(false); }}>Registrar usuario</MenuItem>
                    </SubMenu>
                )}

                {/* 3. Admin Aircraft Section */}
                    <SubMenu
                        label={canManage ? "Administrar aeronaves" : "Aeronaves"}
                        open={openMenu === "aircraft"}
                        onOpenChange={() => handleToggle("aircraft")}
                        icon={<img src={DroneIcon} alt="Drone" style={{ width: "18px", height: "18px" }} />}
                    >

                        <MenuItem onClick={() => { navigate("/aircrafts"); setToggled(false); }}>Listar Aeronaves</MenuItem>
                        {canManage && (
                            <MenuItem onClick={() => { navigate("/register-aircraft"); setToggled(false); }}>Registrar Aeronave</MenuItem>
                        )}
                        {canManage && (
                            <MenuItem onClick={() => { navigate("/maintenance"); setToggled(false); }}>Mantenimiento</MenuItem>
                        )}
                        {canManage && (
                            <MenuItem onClick={() => { navigate("/flight-times"); setToggled(false); }}>Horas de vuelo</MenuItem>
                        )}
                    </SubMenu>

                {/* 4. Operations Section */}
                <SubMenu
                    label="Operaciones"
                    open={openMenu === "operations"}
                    onOpenChange={() => handleToggle("operations")}
                    icon={<img src={FlyIcon} alt="Fly" style={{ width: "18px", height: "18px" }} />}
                >
                    {canManage && (
                        <MenuItem onClick={() => { navigate("/operations"); setToggled(false); }}>Listar operaciones (admin)</MenuItem>
                    )}
                    <MenuItem onClick={() => { navigate("/operations/details/mine"); setToggled(false); }}>Mis operaciones</MenuItem>
                    <MenuItem onClick={() => { navigate("/register-operation"); setToggled(false); }}>Registrar operacion</MenuItem>
                </SubMenu>
                
                {/* 5. Docs Section */}
                <SubMenu
                    label="Documentación"
                    open={openMenu === "docs"}
                    onOpenChange={() => handleToggle("docs")}
                    icon={<img src={DocIcon} alt="Docs" style={{ width: "18px", height: "18px" }} />}
                >
                    {canManage && (
                        <MenuItem onClick={() => { navigate("/docs/operadora"); setToggled(false); }}>Operadora</MenuItem>
                    )}
                    {canManage && (
                        <MenuItem onClick={() => { navigate("/docs/personal"); setToggled(false); }}>Personal</MenuItem>
                    )}
                    <MenuItem onClick={() => { navigate("/docs/aircrafts"); setToggled(false); }}>Aeronaves</MenuItem>
                    {canManage && (
                        <MenuItem onClick={() => { navigate("/docs"); setToggled(false); }}>Servidor File Manager</MenuItem>
                    )}
                </SubMenu>
            </Menu>
        </Sidebar>
    );
}
