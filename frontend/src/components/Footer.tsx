import React from 'react';
import { Link } from "react-router-dom";

export default function Footer() {
    console.log("Footer renderizado");
    return (
        <footer className="text-light pt-4">
            <div className="container">
                <div className="row text-center text-md-start">

                    <div className="col-md-4 mb-3">
                        <h5>DRONE GESTOR</h5>
                        <p className="small">
                            Gestor de pilotos, aeronaves y operaciones de vuelo.
                        </p>
                    </div>

                    <div className="col-md-4 mb-3">
                        <ul className="list-unstyled">
                            <li>
                                {/* <Link to="/contacto" className="text-decoration-none text-light">
                                    Contáctanos
                                </Link> */}
                            </li>
                            <li>
                                <a href="https://dronetools.es/" target="_blank" rel="noreferrer" className="text-decoration-none text-light">
                                    DroneTools web
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="col-md-4 mb-3">
                        <p className="small">
                            © 2026 drone-gestor.com
                        </p>
                    </div>

                </div>
            </div>

            <div className="bg-light text-center py-2 small text-dark" style={{borderRadius: "6px", border: "2px outset #4d4d4d"}}>
                Todos los derechos reservados
            </div>
        </footer>
    );
}