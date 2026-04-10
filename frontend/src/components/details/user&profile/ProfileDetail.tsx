import React, { useEffect, useState } from "react";
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;
import { useParams, useNavigate } from "react-router-dom";
import DetailsComponent from "../DetailsComponent";
import { apiFetch } from "../../../api";
import { userFields } from "./UserFields";
import { useAuth } from "../../commons/hooks/useAuth";
import Forbidden from "../../main-elements-views/Forbidden";

export default function ProfileDetail() {

    const [meData, setMeData] = useState<any>(null);
    const [status, setStatus] = useState(200);
    const [profileId, setProfileId] = useState<number | undefined>(undefined);
    const { token } = useAuth();
    const navigate = useNavigate();

    const processedFields = userFields
    .filter(field => field.key !== 'type' && field.key !== 'state')
    .map(field => {
        if (field.key === 'username') {
            return { ...field, readOnly: true };
        }
        return field;
    });

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

        if (!token) return;// esto me resolvio el bug de cerrar sesion siendo piloto en una vista con fetch

    apiFetch(`/api/users/me`)
            .then(res => {
                if (res) {
                    setStatus(res.status);
                    return res.json();
                }
            })
            .then(data => {
                if (data) {
                    setMeData(data);
                }
            })
            .catch(err => {
                console.error("Error cargando perfil:", err);
                setStatus(err.status || 500);
            });
    }, [token]);

    if (status === 403) return <Forbidden />;
    if (!meData && status === 200) return <p>Cargando perfil...</p>;

    return (
        <DetailsComponent
            id={meData.id.toString()}
            initialData={meData}
      // endpoint={`${API_BASE_URL}/api/users`}
      // imageEndpoint={`${API_BASE_URL}/api/users/images`}
      endpoint={`/api/users`}
      imageEndpoint={`/api/users/images`}
            fields={processedFields}
            allowEdit={true}
            allowDelete={false}
            onBack={() => navigate("/home")}
            validateForm={validateForm}
            showCertificates
        />
    );
}
