import { useParams, useNavigate } from "react-router-dom"
import DetailsComponent from "./DetailsComponent"
import { apiFetch } from "../../api"
import { userFields } from "./UserFields"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;


// esta es la vista que ve un admin cuando selecciona un usario de la lista de usuarios
export default function UserDetail() {

    const { id } = useParams()
    const navigate = useNavigate()

    const handleDelete = async () => {
        await apiFetch(`${API_BASE_URL}/api/auth/users/${id}`, {
            method: "DELETE"
        })

        navigate("/auth/users")
    }

    const validateForm = (values:any) => {

        const errors: Record<string,string|null> = {}

        userFields.forEach(field => {

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
        endpoint={`${API_BASE_URL}/api/auth/users`}
        imageEndpoint={`${API_BASE_URL}/api/auth/users/images`}
        fields={userFields}

        allowEdit
        allowDelete

        onDelete={handleDelete}
        onBack={() => navigate("/auth/users")}

        validateForm={validateForm}
        />
    )
}
