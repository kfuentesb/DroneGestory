import React from 'react';
import { Link } from "react-router-dom";
import YoutubeIcon from "../../assets/footer/youtube_video_white.svg";
import LogoDroneToolsIcon from "../../assets/commons/logo_DRONE.svg";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="text-light pt-5 pb-3" style={{ backgroundColor: "#1a1a1a", borderTop: "1px solid #333" }}>
            <div className="container">
                <div className="row gy-4">
                    
                    {/* COLUMNA 1: LOGO Y DESCRIPCIÓN */}
                    <div className="col-lg-4 col-md-6">
                        <div className="mb-3">
                            <img 
                                src={LogoDroneToolsIcon} 
                                alt="DroneTools Logo" 
                                style={{ height: "60px", width: "auto", filter: "brightness(0) invert(1)" }} 
                            />
                        </div>
                        <p className="text-secondary small pe-lg-5">
                            Solución integral para el sector UAS. Gestión profesional de pilotos, 
                            mantenimiento de aeronaves y cumplimiento normativo de operaciones de vuelo.
                        </p>
                        <div className="d-flex gap-3 mt-3">
                            <a href="https://www.youtube.com/user/oinomedemonio" target="_blank" rel="noreferrer" className="opacity-75 hover-opacity-100 transition">
                                <img alt="Youtube" src={YoutubeIcon} style={{ width: "24px", height: "24px" }}/>
                            </a>
                        </div>
                    </div>

                    {/* COLUMNA 3: RECURSOS Y SOPORTE */}
                    <div className="col-lg-3 col-md-6">
                        <h6 className="text-uppercase fw-bold mb-3 small">Soporte</h6>
                        <ul className="list-unstyled small">
                            <li className="mb-2">
                                <Link to="/contacto" className="text-secondary text-decoration-none hover-white">Contáctanos</Link>
                            </li>
                            <li className="mb-2">
                                <a href="https://dronetools.es/" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none hover-white">
                                    DroneTools Web Oficial
                                </a>
                            </li>
                            <li className="mb-2">
                                <Link to="/faq" className="text-secondary text-decoration-none hover-white">Preguntas Frecuentes</Link>
                            </li>
                        </ul>
                    </div>

                    {/* COLUMNA 4: LEGAL / INFO ADICIONAL */}
                    <div className="col-lg-3 col-md-6">
                        <h6 className="text-uppercase fw-bold mb-3 small">Legal</h6>
                        <ul className="list-unstyled small text-secondary">
                            <li className="mb-2"><Link to="/privacidad" className="text-secondary text-decoration-none hover-white">Política de Privacidad</Link></li>
                            <li className="mb-2"><Link to="/terminos" className="text-secondary text-decoration-none hover-white">Términos de Uso</Link></li>
                            <li className="mb-2"><Link to="/cookies" className="text-secondary text-decoration-none hover-white">Política de Cookies</Link></li>
                        </ul>
                    </div>
                </div>

                <hr className="my-4" style={{ borderColor: "#333" }} />

                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start">
                        <p className="small text-secondary mb-0">
                            © {currentYear} <strong>Drone Gestor</strong>. Una herramienta de DroneTools.
                        </p>
                    </div>
                    <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
                        <span className="badge border border-secondary text-secondary fw-light p-2">
                            v1.0.0 Stable
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 py-3" style={{ backgroundColor: "#222", borderTop: "1px solid #333", fontSize: "0.75rem" }}>
                <div className="container d-flex justify-content-center align-items-center gap-3 text-secondary text-uppercase fw-semibold tracking-wider">
                    Sistemas de Gestión Aeronáutica Certificados
                    <span className="text-muted">|</span>
                    Cumplimiento Normativo EASA / AESA
                </div>
            </div>
            <style>{`
                .hover-white:hover { color: #fff !important; transition: 0.3s; }
                .hover-opacity-100:hover { opacity: 1 !important; transition: 0.3s; }
                .transition { transition: 0.3s; }
            `}</style>
        </footer>
    );
}