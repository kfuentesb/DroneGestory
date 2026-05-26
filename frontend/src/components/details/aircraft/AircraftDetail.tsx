import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../../../api";
import DetailsComponent from "../DetailsComponent"
import { getAircraftFields } from "./AircraftFields"
import { useAuth } from "../../commons/hooks/useAuth";

export default function AircraftDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const { role } = useAuth()
    const canManage = role === "ADMIN" || role === "MANAGER"

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers: HeadersInit = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/api/aircraft/${id}`, {
                method: "DELETE",
                headers
            })
            
            if (response.status === 403) {
                alert("No tienes permisos para eliminar este dron. Verifica tu rol de usuario.");
                return;
            }
            
            if (!response.ok) {
                let errorMessage = `Error ${response.status}`;
                try {
                    const errorJson = await response.json();
                    if (errorJson.error) {
                        errorMessage += `: ${errorJson.error}`;
                    }
                } catch (e) {
                    const errorText = await response.text();
                    if (errorText) {
                        errorMessage += `: ${errorText}`;
                    }
                }
                throw new Error(errorMessage);
            }
            
            navigate("/aircrafts");
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al eliminar el dron: " + (error instanceof Error ? error.message : "Error desconocido"));
        }
    }

    const validateForm = (values: any) => {
        const errors: Record<string, string | null> = {}
        getAircraftFields().forEach(field => {
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
            fields={getAircraftFields()}

            allowEdit={canManage}
            allowDelete={canManage}
            onDelete={handleDelete}
            validateForm={validateForm}
            certificateSectionType="aircraft"
            clearableFieldKeys={["fechaFab", "powerSourceType"]}
        />
    )
}