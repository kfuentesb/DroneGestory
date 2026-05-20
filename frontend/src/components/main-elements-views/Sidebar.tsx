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
import Plantilla from '../../assets/sidebar/plantilla_white.svg';

interface SidebarMenuProps {
    toggled: boolean;
    setToggled: (value: boolean) => void;
}

export default function SidebarMenu({ toggled, setToggled }: SidebarMenuProps) {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const { hasRole } = useAuth();
    const canManage = hasRole("ADMIN") || hasRole("MANAGER");
    const canViewMaintenance = hasRole("ADMIN") || hasRole("MAINTAINER");

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
                <SubMenu
                    label={"Usuarios"}
                    open={openMenu === "users"}
                    onOpenChange={() => handleToggle("users")}
                    icon={<img src={UsersIcon} alt="Users" style={{ width: "20px" }} />}
                    >
                    <MenuItem
                        onClick={() => { navigate("/users"); setToggled(false); }}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M680-240v-80h200v80H680Zm-80-200v-80h280v80H600Zm-80-200v-80h360v80H520ZM235-515q-35-35-35-85t35-85q35-35 85-35t85 35q35 35 35 85t-35 85q-35 35-85 35t-85-35ZM80-240v-76q0-21 10-40t28-30q45-27 95.5-40.5T320-440q56 0 106.5 13.5T522-386q18 11 28 30t10 40v76H80Zm160-110q-39 10-74 30h308q-35-20-74-30t-80-10q-41 0-80 10Zm108.5-221.5Q360-583 360-600t-11.5-28.5Q337-640 320-640t-28.5 11.5Q280-617 280-600t11.5 28.5Q303-560 320-560t28.5-11.5ZM320-600Zm0 280Z"/></svg>}
                    >
                        <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                        <span>Listar</span>
                        </div>
                    </MenuItem>

                    {canManage && (
                        <MenuItem
                        onClick={() => { navigate("/register-user"); setToggled(false); }}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M720-400v-120H600v-80h120v-120h80v120h120v80H800v120h-80ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-640Zm0 400Z"/></svg>}
                        >
                        <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                        <span>Registrar</span>
                        </div>
                        </MenuItem>
                    )}
                </SubMenu>
                {/* 3. Admin Aircraft Section */}
                    <SubMenu
                        label={"Aeronaves"}
                        open={openMenu === "aircraft"}
                        onOpenChange={() => handleToggle("aircraft")}
                        icon={<img src={DroneIcon} alt="Drone" />}
                    >
                        {canManage && (
                            <MenuItem
                                onClick={() => {navigate("/aircraft-models"); setToggled(false);}}
                                icon={<img src={Plantilla} alt="Plantilla" />}
                            >
                                <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                                <span>Plantillas</span>
                                </div>
                            </MenuItem>
                        )}
                        <MenuItem 
                            onClick={() => { navigate("/aircrafts"); setToggled(false); }}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><g transform="matrix(0.7 0 0 0.7 0 -150)"><path d="M259-80q-75 0-127-53T80-261q0-75 52-127t127-52q22 0 42.5 5t38.5 14q14-29 15-60t-11-60q-19 10-40 15t-44 5q-75 0-127.5-52.5T80-701q0-75 52.5-127T260-880q75 0 127.5 52T440-701q0 23-5.5 44T419-617q29 12 60 11.5t60-14.5q-9-18-14-38.5t-5-42.5q0-75 52-127t127-52q75 0 128 52t53 127q0 75-53 128t-128 53q-24 0-45.5-6T612-543q-13 30-12 61.5t15 62.5q19-10 40-15.5t44-5.5q75 0 128 52t53 127q0 75-53 128T699-80q-75 0-127-53t-52-128q0-23 5.5-44t15.5-40q-31-14-62.5-15.5T417-349q11 20 17 42t6 46q0 75-53 128T259-80Zm440-520q42 0 71.5-29.5T800-701q0-42-29.5-70.5T699-800q-42 0-70.5 28.5T600-701q0 8 1.5 16.5T605-668l60-60q12-12 28-12t28 12q12 12 12 28t-12 28l-62 63q9 5 19 7t21 2Zm-439-1q10 0 19-2t17-5l-64-64q-12-12-12-28t12-28q12-12 28-12t28 12l65 64q3-8 5-17.5t2-19.5q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm439 441q42 0 71.5-29.5T800-261q0-42-29.5-70.5T699-360q-10 0-19 1.5t-17 4.5l66 66q12 12 12 28t-12 28q-13 12-29 12t-28-12l-65-65q-3 8-5 17t-2 19q0 42 28.5 71.5T699-160Zm-440 0q42 0 71.5-29.5T360-261q0-11-2-21.5t-7-19.5l-70 70q-12 12-28.5 12T224-232q-12-12-12-28t12-28l67-67q-8-2-16-3.5t-16-1.5q-42 0-70.5 28.5T160-261q0 42 28.5 71.5T259-160Zm221-280q17 0 28.5-11.5T520-480q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480q0 17 11.5 28.5T480-440Z" /></g><path d="M680-240v-80h200v80H680Zm-80-200v-80h280v80H600Zm-80-200v-80h360v80H520Z" /></svg>}
                        >
                            <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                            <span>Listar</span>
                            </div>
                        </MenuItem>
                        {/* {canManage && (
                            <MenuItem 
                                onClick={() => { navigate("/register-aircraft"); setToggled(false); }}
                                icon={<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><g transform="matrix(0.65 0 0 0.65 20 -180)"><path d="M259-80q-75 0-127-53T80-261q0-75 52-127t127-52q22 0 42.5 5t38.5 14q14-29 15-60t-11-60q-19 10-40 15t-44 5q-75 0-127.5-52.5T80-701q0-75 52.5-127T260-880q75 0 127.5 52T440-701q0 23-5.5 44T419-617q29 12 60 11.5t60-14.5q-9-18-14-38.5t-5-42.5q0-75 52-127t127-52q75 0 128 52t53 127q0 75-53 128t-128 53q-24 0-45.5-6T612-543q-13 30-12 61.5t15 62.5q19-10 40-15.5t44-5.5q75 0 128 52t53 127q0 75-53 128T699-80q-75 0-127-53t-52-128q0-23 5.5-44t15.5-40q-31-14-62.5-15.5T417-349q11 20 17 42t6 46q0 75-53 128T259-80Zm440-520q42 0 71.5-29.5T800-701q0-42-29.5-70.5T699-800q-42 0-70.5 28.5T600-701q0 8 1.5 16.5T605-668l60-60q12-12 28-12t28 12q12 12 12 28t-12 28l-62 63q9 5 19 7t21 2Zm-439-1q10 0 19-2t17-5l-64-64q-12-12-12-28t12-28q12-12 28-12t28 12l65 64q3-8 5-17.5t2-19.5q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm439 441q42 0 71.5-29.5T800-261q0-42-29.5-70.5T699-360q-10 0-19 1.5t-17 4.5l66 66q12 12 12 28t-12 28q-13 12-29 12t-28-12l-65-65q-3 8-5 17t-2 19q0 42 28.5 71.5T699-160Zm-440 0q42 0 71.5-29.5T360-261q0-11-2-21.5t-7-19.5l-70 70q-12 12-28.5 12T224-232q-12-12-12-28t12-28l67-67q-8-2-16-3.5t-16-1.5q-42 0-70.5 28.5T160-261q0 42 28.5 71.5T259-160Zm221-280q17 0 28.5-11.5T520-480q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480q0 17 11.5 28.5T480-440Z"/></g><path d="M720-400v-120H600v-80h120v-120h80v120h120v80H800v120h-80Z" /></svg>}
                            >
                                <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                                <span>Registrar</span>
                                </div>
                            </MenuItem>
                        )} */}
                        {canViewMaintenance && (
                            <MenuItem 
                                onClick={() => { navigate("/maintenance"); setToggled(false); }}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><g transform="matrix(0.65 0 0 0.65 10 -190)"><path d="M259-80q-75 0-127-53T80-261q0-75 52-127t127-52q22 0 42.5 5t38.5 14q14-29 15-60t-11-60q-19 10-40 15t-44 5q-75 0-127.5-52.5T80-701q0-75 52.5-127T260-880q75 0 127.5 52T440-701q0 23-5.5 44T419-617q29 12 60 11.5t60-14.5q-9-18-14-38.5t-5-42.5q0-75 52-127t127-52q75 0 128 52t53 127q0 75-53 128t-128 53q-24 0-45.5-6T612-543q-13 30-12 61.5t15 62.5q19-10 40-15.5t44-5.5q75 0 128 52t53 127q0 75-53 128T699-80q-75 0-127-53t-52-128q0-23 5.5-44t15.5-40q-31-14-62.5-15.5T417-349q11 20 17 42t6 46q0 75-53 128T259-80Zm440-520q42 0 71.5-29.5T800-701q0-42-29.5-70.5T699-800q-42 0-70.5 28.5T600-701q0 8 1.5 16.5T605-668l60-60q12-12 28-12t28 12q12 12 12 28t-12 28l-62 63q9 5 19 7t21 2Zm-439-1q10 0 19-2t17-5l-64-64q-12-12-12-28t12-28q12-12 28-12t28 12l65 64q3-8 5-17.5t2-19.5q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm439 441q42 0 71.5-29.5T800-261q0-42-29.5-70.5T699-360q-10 0-19 1.5t-17 4.5l66 66q12 12 12 28t-12 28q-13 12-29 12t-28-12l-65-65q-3 8-5 17t-2 19q0 42 28.5 71.5T699-160Zm-440 0q42 0 71.5-29.5T360-261q0-11-2-21.5t-7-19.5l-70 70q-12 12-28.5 12T224-232q-12-12-12-28t12-28l67-67q-8-2-16-3.5t-16-1.5q-42 0-70.5 28.5T160-261q0 42 28.5 71.5T259-160Zm221-280q17 0 28.5-11.5T520-480q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480q0 17 11.5 28.5T480-440Z" /></g><g transform="matrix(0.45 0 0 0.45 520 -520)"><path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z" /></g></svg>
                                }
                            >
                                <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                                <span>Mantenimiento</span>
                                </div>
                            </MenuItem>
                        )}
                        <MenuItem 
                            onClick={() => { navigate("/flight-hours"); setToggled(false); }}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><g transform="matrix(0.65 0 0 0.65 10 -210)"><path d="M259-80q-75 0-127-53T80-261q0-75 52-127t127-52q22 0 42.5 5t38.5 14q14-29 15-60t-11-60q-19 10-40 15t-44 5q-75 0-127.5-52.5T80-701q0-75 52.5-127T260-880q75 0 127.5 52T440-701q0 23-5.5 44T419-617q29 12 60 11.5t60-14.5q-9-18-14-38.5t-5-42.5q0-75 52-127t127-52q75 0 128 52t53 127q0 75-53 128t-128 53q-24 0-45.5-6T612-543q-13 30-12 61.5t15 62.5q19-10 40-15.5t44-5.5q75 0 128 52t53 127q0 75-53 128T699-80q-75 0-127-53t-52-128q0-23 5.5-44t15.5-40q-31-14-62.5-15.5T417-349q11 20 17 42t6 46q0 75-53 128T259-80Zm440-520q42 0 71.5-29.5T800-701q0-42-29.5-70.5T699-800q-42 0-70.5 28.5T600-701q0 8 1.5 16.5T605-668l60-60q12-12 28-12t28 12q12 12 12 28t-12 28l-62 63q9 5 19 7t21 2Zm-439-1q10 0 19-2t17-5l-64-64q-12-12-12-28t12-28q12-12 28-12t28 12l65 64q3-8 5-17.5t2-19.5q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29Zm439 441q42 0 71.5-29.5T800-261q0-42-29.5-70.5T699-360q-10 0-19 1.5t-17 4.5l66 66q12 12 12 28t-12 28q-13 12-29 12t-28-12l-65-65q-3 8-5 17t-2 19q0 42 28.5 71.5T699-160Zm-440 0q42 0 71.5-29.5T360-261q0-11-2-21.5t-7-19.5l-70 70q-12 12-28.5 12T224-232q-12-12-12-28t12-28l67-67q-8-2-16-3.5t-16-1.5q-42 0-70.5 28.5T160-261q0 42 28.5 71.5T259-160Zm221-280q17 0 28.5-11.5T520-480q0-17-11.5-28.5T480-520q-17 0-28.5 11.5T440-480q0 17 11.5 28.5T480-440Z" /></g><g transform="matrix(0.5 0 0 0.5 480 -480)"><path d="M360-840v-80h240v80H360Zm80 440h80v-240h-80v240Zm-99.5 291.5Q275-137 226-186t-77.5-114.5Q120-366 120-440t28.5-139.5Q177-645 226-694t114.5-77.5Q406-800 480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80q-74 0-139.5-28.5ZM678-242q82-82 82-198t-82-198q-82-82-198-82t-198 82q-82 82-82 198t82 198q82 82 198 82t198-82ZM480-440Z"/></g></svg>}
                        >
                            <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                            <span>Horas de vuelo</span>
                            </div>
                        </MenuItem>
                    </SubMenu>

                {/* 4. Operations Section */}
                <SubMenu
                    label="Operaciones"
                    open={openMenu === "operations"}
                    onOpenChange={() => handleToggle("operations")}
                    icon={<img src={FlyIcon} alt="Fly" />}
                >
                    <MenuItem 
                        onClick={() => { navigate("/operations"); setToggled(false); }}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M80-200v-80h400v80H80Zm0-200v-80h200v80H80Zm0-200v-80h200v80H80Zm744 400L670-354q-24 17-52.5 25.5T560-320q-83 0-141.5-58.5T360-520q0-83 58.5-141.5T560-720q83 0 141.5 58.5T760-520q0 29-8.5 57.5T726-410l154 154-56 56ZM560-400q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Z"/></svg>}
                    >
                        <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                        <span>Listar</span>
                        </div>
                    </MenuItem>
                    <MenuItem 
                        onClick={() => { navigate("/operations/docs"); setToggled(false); }} 
                        icon={<img src={DocIcon} alt="Doc" />}
                    >
                    <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                    <span>Documentación</span>
                    </div>
                    </MenuItem>
                </SubMenu>
                
                {canManage && (
                    <SubMenu
                        label="Servidor"
                        open={openMenu === "docs"}
                        onOpenChange={() => handleToggle("docs")}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="m80-80 800-800v386q-19-9-39-14.5t-41-8.5v-170L273-160h217q6 22 16 41.5T528-80H80Zm193-80 527-527-263.5 263.5L273-160ZM720-40l-12-60q-12-5-22.5-10.5T664-124l-58 18-40-68 46-40q-2-13-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T708-380l12-60h80l12 60q12 5 22.5 10.5T856-356l58-18 40 68-46 40q2 13 2 26t-2 26l46 40-40 68-58-18q-11 8-21.5 13.5T812-100l-12 60h-80Zm96.5-143.5Q840-207 840-240t-23.5-56.5Q793-320 760-320t-56.5 23.5Q680-273 680-240t23.5 56.5Q727-160 760-160t56.5-23.5Z"/></svg>
                        }
                    >
                        <MenuItem 
                            onClick={() => { navigate("/file-manager"); setToggled(false); }}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M160-160q-33 0-56.5-23.5T80-240v-400q0-33 23.5-56.5T160-720h240l80-80h320q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm73-280h207v-207L233-440Zm-73-40 160-160H160v160Zm0 120v120h640v-480H520v280q0 33-23.5 56.5T440-360H160Zm280-160Z"/></svg>}
                        >
                            <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                            <span>File Manager</span>
                            </div>
                        </MenuItem>
                        <MenuItem 
                            onClick={() => { navigate("/sent-mails"); setToggled(false); }}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>}
                        >
                            <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
                            <span>Correos</span>
                            </div>
                        </MenuItem>
                    </SubMenu>
                )}
            </Menu>
        </Sidebar>
    );
}