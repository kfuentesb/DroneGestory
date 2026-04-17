import { useNavigate, useParams } from "react-router-dom";

import DetailsComponent from "../DetailsComponent";
import { useAuth } from "../../commons/hooks/useAuth";
import { aircraftModelFields } from "./AircraftModelFields";
import { apiFetch } from "../../../api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;

export default function AircraftModelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const canManage = role === "ADMIN" || role === "MANAGER";

  const handleDelete = async () => {
    await apiFetch(`${API_BASE_URL}/api/aircraft-models/${id}`, { method: "DELETE" });
    navigate("/aircraft-models");
  };

  const validateForm = (values: any) => {
    const errors: Record<string, string | null> = {};

    aircraftModelFields.forEach((field) => {
      if (!field.validate) return;
      const valid = field.validate(values[field.key]);
      errors[field.key] = valid ? null : field.error || "Campo invalido";
    });

    return errors;
  };

  return (
    <DetailsComponent
      id={id}
      endpoint={`${API_BASE_URL}/api/aircraft-models`}
      imageEndpoint={`${API_BASE_URL}/api/aircraft-models/images`}
      defaultImage="drone"
      entityType="aircraft"
      fields={aircraftModelFields}
      allowEdit={canManage}
      allowDelete={canManage}
      onDelete={handleDelete}
      onBack={() => navigate("/aircraft-models")}
      validateForm={validateForm}
      certificateSectionType="model"
      clearableFieldKeys={[
        "aircraftClassDefault",
        "mtomDefault",
        "wingspanDefault",
        "maxSpeedDefault",
        "configDefault",
        "impactEnergyDefault",
        "hasCameraDefault",
        "privatelyBuiltDefault",
        "hasParachuteDefault",
        "hasFTSDefault",
        "powerSourceDefault",
        "powerSourceTypeDefault",
        "cautiveDefault",
        "accessoriesDefault",
      ]}
    />
  );
}
