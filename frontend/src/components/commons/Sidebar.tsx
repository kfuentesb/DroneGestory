import { useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

import HomeIcon from '../../assets/sidebar/home_white.svg';
import ArrowBack from '../../assets/arrow_back_white.svg';
import ArrowForward from '../../assets/arrow_forward_white.svg';
import UsersIcon from '../../assets/sidebar/group_white.svg';
import DroneIcon from '../../assets/sidebar/drone_white.svg';
import FlyIcon from '../../assets/sidebar/fly_drone_white.svg';
import IdentityIcon from '../../assets/sidebar/identity_white.svg';

export default function SidebarMenu() {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => setCollapsed(!collapsed);

    // fix para el bug de primera vez se abre el submenu, se cierra solo, en vez
    // de dejar la libreria hacerlo, lo controlamos nosotros
    const [openUsers, setOpenUsers] = useState(false);
    const [openAircraft, setOpenAircraft] = useState(false);
    const [openOps, setOpenOps] = useState(false);

    const { username, token } = useAuth();

    const goToProfile = async () => {

        if (!username) return;

        const res = await fetch(
            `http://localhost:8080/api/auth/users/me?username=${username}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!res.ok) return;

        const user = await res.json();

        navigate(`/profile/${user.id}`);
    };

    return (
        <Sidebar
            collapsed={collapsed}
            backgroundColor="#2F8F5B"
            width="250px"
            collapsedWidth="60px"
            transitionDuration={300}
            style={{
                height: "100vh",
                position: "sticky",
                top: 0,
                zIndex: 1000 
            }}
        >
            <Menu
                closeOnClick={false}
                menuItemStyles={{
                    button: ({ level }) => ({
                        color: "#E5E7EB",
                        backgroundColor: level === 0 ? "#2F8F5B" : "#37a76b",
                        "&:hover": {
                            backgroundColor: level === 0 ? "#37a76b" : "#37a76b",
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
                {/* Collapse/Expand button */}
                <MenuItem
                    onClick={toggleSidebar}
                    icon={
                        <img
                            src={collapsed ? ArrowForward : ArrowBack}
                            alt="Collapse toggle"
                            style={{ width: "18px", height: "18px" }}
                        />
                    }
                    style={{ fontWeight: "bold", textAlign: "center" }}
                >
                    {collapsed ? "" : "Menú"}
                </MenuItem>

                <MenuItem 
                    onClick={goToProfile}
                    icon={<img src={IdentityIcon} alt="Profile" style={{ width: "18px", height: "18px" }} />}
                >
                    Ver perfil
                </MenuItem>

                <SubMenu
                    label="Administrar usuarios"
                    open={openUsers}
                    onClick={() => setOpenUsers(!openUsers)}
                    icon={<img src={UsersIcon} alt="Users" style={{ width: "18px", height: "18px" }} />}
                >
                    <MenuItem onClick={() => navigate("/auth/users")}>Listar usuarios</MenuItem>
                    <MenuItem onClick={() => navigate("/auth/register-user")}>Registrar usuario</MenuItem>
                </SubMenu>

                <SubMenu
                    label="Administrar aeronaves"
                    open={openAircraft}
                    onClick={() => setOpenAircraft(!openAircraft)}
                    icon={<img src={DroneIcon} alt="Drone" style={{ width: "18px", height: "18px" }} />}
                >
                    <MenuItem onClick={() => navigate("/auth/aircrafts")}>Listar Aeronaves</MenuItem>
                    <MenuItem onClick={() => navigate("/auth/register-aircraft")}>Registrar Aeronave</MenuItem>
                </SubMenu>

                <SubMenu
                    label="Operaciones"
                    open={openOps}
                    onClick={() => setOpenOps(!openOps)}
                    icon={<img src={FlyIcon} alt="Fly" style={{ width: "18px", height: "18px" }} />}
                >
                    <MenuItem onClick={() => navigate("/auth/operations")}>Listar operaciones (admin)</MenuItem>
                    <MenuItem onClick={() => navigate("/#")}>Listar mis operaciones</MenuItem>
                    <MenuItem onClick={() => navigate("/#")}>Registrar operacion</MenuItem>
                </SubMenu>
            </Menu>
        </Sidebar>
    );
}
