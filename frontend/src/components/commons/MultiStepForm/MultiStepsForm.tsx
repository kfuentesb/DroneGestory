import { useState } from "react";
import BaseForm, { type FieldConfig } from "./BaseForm";
import ProgressBar from "./ProgressBar";
import { apiFetch } from "../../../api";
import { useAuth } from "../hooks/useAuth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${import.meta.env.VITE_SERVER_IP}:8080`;

export default function MultiStepsForm() {

    const [step, setStep] = useState(0);
    const totalSteps = 6; // Anexos 4 al 8
    const [formData, setFormData] = useState<any>({});
    const [operationId, setOperationId] = useState<number | null>(null);
    const { token } = useAuth();

    const createOperationFields: FieldConfig[] = [
        { name: "nombreOperacion", label: "Nombre:", type: "text", required: true },
    ];

    const anexo4Fields: FieldConfig[] = [
        { name: "campoAnexo4", label: "Texto prueba", type: "text", required: true },
    ];

    const anexo5Fields: FieldConfig[] = [
        { name: "campoAnexo5", label: "Texto de prueba", type: "text", required: true },
    ];

    const anexo6Fields: FieldConfig[] = [
        { name: "campoAnexo6", label: "Texto de prueba", type: "text", required: true },
    ];

    const anexo7Fields: FieldConfig[] = [
        { name: "campoAnexo7", label: "Texto de prueba", type: "text", required: true },
    ];

    const anexo8Fields: FieldConfig[] = [
        { name: "campoAnexo8", label: "Texto de prueba", type: "text", required: true },
    ];

    const handleNext = (data: any) => {
        setFormData((prev: any) => ({ ...prev, ...data }));
        setStep((s) => s + 1);
        console.log("Datos acumulados hasta ahora:", { ...formData, ...data });
    };

    const handleBack = () => {
        setStep((s) => s - 1);
    };

    // Paso 0. HandleNextCrearOperacion 
    const handleNextCreateOperation = async (data: any) => {
        try {
            const fd = new FormData();
            fd.append("nombreOperacion", data.nombreOperacion);

            const res = await apiFetch(`${API_BASE_URL}/api/auth/operations`, {
                method: "POST",
                body: fd
            });
            if (!res) {
                throw new Error("No se recibió respuesta del servidor");
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
    // Pasos 1
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
                `${API_BASE_URL}/api/auth/operations/${operationId}/anexo4`,
                {
                    method: "POST",
                    body: fd,
                }
            );
            if (!res) {
                throw new Error("No se recibió respuesta del servidor");
            }
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error ${res.status}: ${errorText}`);
            }
            setFormData((prev: any) => ({ ...prev, ...data }));
            setStep((s) => s + 1);
        } catch (err) {
            alert("Error guardando el Anexo 4");
            console.error(err);
        }
    };

    // PASO 2: Anexo 5
    const handleNextAnexo5 = async (data: any) => {
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
                `${API_BASE_URL}/api/auth/operations/${operationId}/anexo5`,
                {
                    method: "POST",
                    body: fd,
                }
            );
            
            if (!res) {
                throw new Error("No se recibió respuesta del servidor");
            }
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error ${res.status}: ${errorText}`);
            }
            
            setFormData((prev: any) => ({ ...prev, ...data }));
            setStep((s) => s + 1);
            
        } catch (err) {
            alert("Error guardando el Anexo 5");
            console.error(err);
        }
    };

    // PASO 3: Anexo 6
    const handleNextAnexo6 = async (data: any) => {
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
                `${API_BASE_URL}/api/auth/operations/${operationId}/anexo6`,
                {
                    method: "POST",
                    body: fd,
                }
            );
            
            if (!res) {
                throw new Error("No se recibió respuesta del servidor");
            }
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error ${res.status}: ${errorText}`);
            }
            
            setFormData((prev: any) => ({ ...prev, ...data }));
            setStep((s) => s + 1);
            
        } catch (err) {
            alert("Error guardando el Anexo 6");
            console.error(err);
        }
    };

    // PASO 4: Anexo 7
    const handleNextAnexo7 = async (data: any) => {
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
                `${API_BASE_URL}/api/auth/operations/${operationId}/anexo7`,
                {
                    method: "POST",
                    body: fd,
                }
            );
            
            if (!res) {
                throw new Error("No se recibió respuesta del servidor");
            }
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error ${res.status}: ${errorText}`);
            }
            
            setFormData((prev: any) => ({ ...prev, ...data }));
            setStep((s) => s + 1);
            
        } catch (err) {
            alert("Error guardando el Anexo 7");
            console.error(err);
        }
    };

    // PASO 5: Anexo 8 (último paso)
    const handleNextAnexo8 = async (data: any) => {
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
                `${API_BASE_URL}/api/auth/operations/${operationId}/anexo8`,
                {
                    method: "POST",
                    body: fd,
                }
            );
            
            if (!res) {
                throw new Error("No se recibió respuesta del servidor");
            }
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error ${res.status}: ${errorText}`);
            }
            
            setFormData((prev: any) => ({ ...prev, ...data }));
            setStep((s) => s + 1); // Avanza al resumen final (step 6)
            
        } catch (err) {
            alert("Error guardando el Anexo 8");
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
                    onSubmit={handleNextAnexo5} 
                    onBack={handleBack}
                />
            )}

            {step === 3 && (
                <BaseForm 
                    title="Apéndice 6: Formato lista verificación prevuelo UAS"
                    fields={anexo6Fields} 
                    onSubmit={handleNextAnexo6} 
                    onBack={handleBack}
                />
            )}

            {step === 4 && (
                <BaseForm 
                    title="Apéndice 7: Formato lista verificación posvuelo UAS"
                    fields={anexo7Fields} 
                    onSubmit={handleNextAnexo7} 
                    onBack={handleBack}
                />
            )}

            {step === 5 && (
                <BaseForm 
                    title="Apéndice 8: Formato lista verificación posvuelo operacional"
                    fields={anexo8Fields} 
                    onSubmit={handleNextAnexo8} 
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
