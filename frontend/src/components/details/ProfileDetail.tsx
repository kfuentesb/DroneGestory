import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DetailsComponent from "./DetailsComponent";
import { apiFetch } from "../../api";
import { userFields } from "./UserFields";
import { useAuth } from "../AuthProvider";

export default function ProfileDetail() {

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
        .then(res => res.json())
        .then(data => setProfileId(data.id));
    }, [token]);

    if (!profileId) return <p>Cargando perfil...</p>;

    return (
        <DetailsComponent
            id={profileId.toString()}
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