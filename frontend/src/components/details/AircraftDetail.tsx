import { useParams, useNavigate } from "react-router-dom"
import DetailsComponent from "./DetailsComponent"
import { apiFetch } from "../../api"
import { userFields } from "./UserFields"
import { aircraftFields } from "./AircraftFields"


// esta es la vista que ve un admin cuando selecciona un dron de la lista de drones
export default function AircraftDetail() {

    const { id } = useParams()
    const navigate = useNavigate()

    const handleDelete = async () => {
        if (!confirm("¿Eliminar dron?")) return

        await apiFetch(`http://localhost:8080/api/auth/aircraft/${id}`, {
        method: "DELETE"
        })

        navigate("/auth/aircrafts")
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
        endpoint="http://localhost:8080/api/auth/aircraft"
        imageEndpoint="http://localhost:8080/api/auth/aircraft/images"
        fields={aircraftFields}

        allowEdit
        allowDelete

        onDelete={handleDelete}
        onBack={() => navigate("/auth/aircrafts")}

        validateForm={validateForm}
        />
    )
}