import { useParams, useNavigate } from "react-router-dom";
import DetailsComponent from "./DetailsComponent";
import { apiFetch } from "../../api";
import { userFields } from "./UserFields";

export default function ProfileDetail() {
    const { id } = useParams();

    const navigate = useNavigate()


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
        id={undefined}
        endpoint="http://localhost:8080/api/auth/users/me"
        imageEndpoint="http://localhost:8080/api/auth/users/images"
        fields={userFields}

        allowEdit={true}
        allowDelete={false}

        onBack={() => navigate("/home")}

        validateForm={validateForm}
        />
    );
}