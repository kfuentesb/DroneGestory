import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DetailsComponent from "./DetailsComponent";
import { apiFetch } from "../../api";
import { userFields } from "./UserFields";
import { useAuth } from "../commons/hooks/useAuth";
import Forbidden from "../commons/Forbidden";

export default function ProfileDetail() {

    const [meData, setMeData] = useState<any>(null);
    const [status, setStatus] = useState(200);
    const [profileId, setProfileId] = useState<number | undefined>(undefined);
    const { token } = useAuth();
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

    useEffect(() => {
        fetch("http://localhost:8080/api/auth/users/me", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
            setStatus(res.status);
            return res.json();
        })
        .then(data => setMeData(data))
        .catch(() => setStatus(500));
    }, [token]);

    if (status === 403) return <Forbidden />;
    if (!meData && status === 200) return <p>Cargando perfil...</p>;

    return (
        <DetailsComponent
            id={meData.id.toString()}
            initialData={meData}
            endpoint="http://localhost:8080/api/auth/users"
            imageEndpoint="http://localhost:8080/api/auth/users/images"
            fields={userFields}
            allowEdit={true}
            allowDelete={false}
            onBack={() => navigate("/home")}
            validateForm={validateForm}
        />
    );
}
