import { useParams, useNavigate } from "react-router-dom";
import DetailsComponent from "../DetailsComponent";
import { apiFetch } from "../../../api";
import { userFields } from "./UserFields";
import { useAuth } from "../../commons/hooks/useAuth";

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasRole } = useAuth();
    const canManageUsers = hasRole("ADMIN") || hasRole("MANAGER");

    const handleDelete = async () => {
        await apiFetch(`/api/users/${id}`, {
            method: "DELETE"
        });

        navigate("/users");
    };

    const validateForm = (values: any) => {
        const errors: Record<string, string | null> = {};

        userFields.forEach(field => {
            if (field.validate) {
                const valid = field.validate(values[field.key]);
                errors[field.key] = valid ? null : field.error || "Campo invalido";
            }
        });

        return errors;
    };

    const Icons = {
        Key: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2zM2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
        ),
        Trash: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>,
        Download: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>,
        File: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/></svg>,
        Dots: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
    };

    return (
        <>
            <div className="container pt-3 pb-0">
                <div className="card border-0 bg-light shadow-sm">
                    <div className="card-body py-2">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                            <div className="text-truncate" style={{ minWidth: 0 }}>
                                <h6 className="mb-0 text-muted uppercase fw-bold text-truncate" style={{ fontSize: "0.82rem" }}>
                                    Gestion de Usuario ID: {id}
                                </h6>
                                <small className="text-muted d-block text-truncate" style={{ fontSize: "0.72rem" }}>
                                    {canManageUsers ? "Actualmente solo funciona el cambio de contrasena" : "Vista de solo lectura"}
                                </small>
                            </div>

                            {canManageUsers && (
                                <div className="d-flex flex-wrap gap-2 align-items-center">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-warning d-flex align-items-center px-2"
                                        style={{ height: "32px" }}
                                        onClick={() => navigate(`/users/${id}/password`)}
                                    >
                                        {Icons.Key}
                                        <span className="ms-2 d-none d-sm-inline">Contrasena</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger d-flex align-items-center px-2"
                                        style={{ height: "32px" }}
                                        onClick={handleDelete}
                                    >
                                        {Icons.Trash}
                                        <span className="ms-2 d-none d-sm-inline">Borrar</span>
                                    </button>

                                    <div className="dropdown d-flex align-items-center">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary dropdown-toggle d-flex align-items-center px-2"
                                            style={{ height: "32px" }}
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <span className="d-flex align-items-center">{Icons.Download}</span>
                                            <span className="ms-2 d-none d-sm-inline">Exportar</span>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 py-2" style={{ fontSize: "0.85rem" }}>
                                            <li className="px-3 py-1 bg-light border-bottom mb-2">
                                                <small className="text-muted fw-bold" style={{ fontSize: "0.65rem" }}>
                                                    Queda registrado el uso de esta funcion
                                                </small>
                                            </li>
                                            <li>
                                                <button className="dropdown-item d-flex align-items-center py-2">
                                                    <span className="text-success me-2 d-flex">{Icons.File}</span>
                                                    Datos personales (CSV)
                                                </button>
                                            </li>
                                            <li>
                                                <button className="dropdown-item d-flex align-items-center py-2">
                                                    <span className="text-warning me-2 d-flex">{Icons.File}</span>
                                                    Certificados (ZIP)
                                                </button>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button className="dropdown-item d-flex align-items-center py-2 fw-bold text-primary">
                                                    <span className="me-2 d-flex">{Icons.Download}</span>
                                                    Exportar todo (ZIP)
                                                </button>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="dropdown d-flex align-items-center">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary d-flex align-items-center px-2"
                                            style={{ height: "32px" }}
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <span className="d-flex align-items-center">{Icons.Dots}</span>
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                                            <li><button className="dropdown-item py-2">Desactivar cuenta</button></li>
                                            <li><button className="dropdown-item py-2">Enviar recordatorio</button></li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li><button className="dropdown-item py-2 text-danger font-weight-bold">Forzar cierre sesion</button></li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DetailsComponent
                id={id}
                endpoint={`/api/users`}
                imageEndpoint={`/api/users/images`}
                entityType="user"
                fields={userFields}
                allowEdit={canManageUsers}
                allowDelete={canManageUsers}
                onDelete={canManageUsers ? handleDelete : undefined}
                validateForm={validateForm}
                certificateSectionType="user"
                defaultImage="user"
                clearableFieldKeys={["fechaNac"]}
            />
        </>
    );
}
