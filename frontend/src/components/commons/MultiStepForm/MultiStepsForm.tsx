import { useState } from "react";
import BaseForm, { type FieldConfig } from "./BaseForm";
import ProgressBar from "./ProgressBar";
import { apiFetch } from "../../../api";
import { useAuth } from "../hooks/useAuth";

export default function MultiStepsForm() {

    const [step, setStep] = useState(0);
    const totalSteps = 6; // Anexos 4 al 8
    const [formData, setFormData] = useState<any>({});
    const [operationId, setOperationId] = useState<number | null>(null);
    const { token } = useAuth();

    const createOperationFields: FieldConfig[] = [
        { name: "nombreOperacion", label: "Nombre de la operación", type: "text", required: true },
    ];

    const anexo4Fields: FieldConfig[] = [
        { name: "campoAnexo4", label: "Texto prueba", type: "text", required: true },
    ];

    const anexo5Fields: FieldConfig[] = [
        { name: "texto_prueba_5", label: "Texto de prueba", type: "text", required: true },
    ];

    const anexo6Fields: FieldConfig[] = [
        { name: "texto_prueba_6", label: "Texto de prueba", type: "text", required: true },
    ];

    const anexo7Fields: FieldConfig[] = [
        { name: "texto_prueba_7", label: "Texto de prueba", type: "text", required: true },
    ];

    const anexo8Fields: FieldConfig[] = [
        { name: "texto_prueba_8", label: "Texto de prueba", type: "text", required: true },
    ];

    const handleNext = (data: any) => {
        setFormData((prev: any) => ({ ...prev, ...data }));
        setStep((s) => s + 1);
        console.log("Datos acumulados hasta ahora:", { ...formData, ...data });
    };

    const handleBack = () => {
        setStep((s) => s - 1);
    };

    // Paso 1. HandleNextCrearOperacion 
    const handleNextCreateOperation = async (data: any) => {
        try {
            const fd = new FormData();
            fd.append("nombreOperacion", data.nombreOperacion);

            const res = await apiFetch("/api/auth/operations", {
                method: "POST",
                body: fd
            });
            if (!res) {
                return;
            }
            const op = await res.json();
            setOperationId(op.idOperacion);
            setStep((s) => s + 1);
            setFormData((prev: any) => ({ ...prev, ...data }));
        } catch (err) {
            alert("Error creando operación");
            console.error(err);
        }
    };
    // Pasos 2-6. Todos los HandleNextAnexos
    const handleNextAnexo4 = async (data: any) => {
        if (!operationId) {
            alert("No hay operación creada.");
            return;
        }
        try {
            const fd = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    fd.append(key, value as string);
                }
            });

            const res = await apiFetch(
                `/api/auth/operations/${operationId}/anexo4`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: fd,
                }
            );
            setFormData((prev: any) => ({ ...prev, ...data }));
            setStep((s) => s + 1);
        } catch (err) {
            alert("Error guardando el Anexo 4");
            console.error(err);
        }
    };

    return (
        <div className="container mt-4">

            <ProgressBar currentStep={step} totalSteps={totalSteps} />

            {step === 0 && (
                <BaseForm
                    title="Crear una operación"
                    fields={createOperationFields}
                    onSubmit={handleNextCreateOperation}
                />
            )}

            {step === 1 && (
                <BaseForm 
                    title="Apéndice 4: Formato lista de verificación planificación operacional"
                    fields={anexo4Fields} 
                    onSubmit={handleNextAnexo4} 
                    onBack={handleBack}
                />
            )}

            {step === 2 && (
                <BaseForm
                    title="Apéndice 5: Formato lista verificación prevuelo operacional"
                    fields={anexo5Fields} 
                    onSubmit={handleNext} 
                    onBack={handleBack}
                />
            )}

            {step === 3 && (
                <BaseForm 
                    title="Apéndice 6: Formato lista verificación prevuelo UAS"
                    fields={anexo6Fields} 
                    onSubmit={handleNext} 
                    onBack={handleBack}
                />
            )}

            {step === 4 && (
                <BaseForm 
                    title="Apéndice 7: Formato lista verificación posvuelo UAS"
                    fields={anexo7Fields} 
                    onSubmit={handleNext} 
                    onBack={handleBack}
                />
            )}

            {step === 5 && (
                <BaseForm 
                    title="Apéndice 8: Formato lista verificación posvuelo operacional"
                    fields={anexo8Fields} 
                    onSubmit={handleNext} 
                    onBack={handleBack}
                />
            )}

            {step >= 6 && (
                <div className="card p-4">
                    <h3>Resumen de la Operación</h3>
                    <p>Todos los pasos completados.</p>
                    <pre className="bg-light p-3 border">
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                    <button
                        className="btn btn-success"
                        onClick={() => alert("Enviando a la base de datos...")}
                    >
                        Guardar Operación Final
                    </button>
                </div>
            )}
        </div>
    );
}