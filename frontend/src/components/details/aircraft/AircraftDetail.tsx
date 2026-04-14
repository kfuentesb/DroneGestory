import { useParams, useNavigate } from "react-router-dom"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import DetailsComponent from "../DetailsComponent"
import { apiFetch } from "../../../api"

import { aircraftFields } from "./AircraftFields"
import { useAuth } from "../../commons/hooks/useAuth";


// esta es la vista que ve un admin cuando selecciona un dron de la lista de drones
export default function AircraftDetail() {

    const { id } = useParams()
    const navigate = useNavigate()

    const { role } = useAuth()
    const canManage = role === "ADMIN" || role === "MANAGER"

    const handleDelete = async () => {
        if (!confirm("¿Eliminar dron?")) return

        try {
            const token = localStorage.getItem("token");
            console.log("Token found:", token ? "Yes" : "No");
            const headers: HeadersInit = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
                console.log("Authorization header set");
            }

            console.log("Deleting aircraft with ID:", id);
            const response = await fetch(`${API_BASE_URL}/api/aircraft/${id}`, {
                method: "DELETE",
                headers
            })
            
            console.log("DELETE response status:", response.status);
            
            if (response.status === 403) {
                alert("No tienes permisos para eliminar este dron. Verifica tu rol de usuario.");
                return;
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error ${response.status}: ${errorText}`);
            }
            
            navigate("/aircrafts");
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al eliminar el dron: " + (error instanceof Error ? error.message : "Error desconocido"));
        }
    }

    const validateForm = (values:any) => {

        const errors: Record<string,string|null> = {}

        aircraftFields.forEach(field => {

            if (field.validate) {
                const valid = field.validate(values[field.key])
                errors[field.key] = valid ? null : field.error || "Campo inválido"
            }

        })

        return errors
    }

    return (
        <DetailsComponent
            id={id}
            endpoint={`${API_BASE_URL}/api/aircraft`}
            imageEndpoint={`${API_BASE_URL}/api/aircraft/images`}
            defaultImage="drone"
            entityType="aircraft"
            fields={aircraftFields}

            allowEdit={canManage}
            allowDelete={canManage}

            onDelete={handleDelete}
            onBack={() => navigate("/aircrafts")}

            validateForm={validateForm}
            certificateSectionType="aircraft"
        />
    )
}
