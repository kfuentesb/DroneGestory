import { useState } from "react";
import BaseForm, { type FieldConfig } from "./BaseForm";
import ProgressBar from "./ProgressBar";

export default function MultiStepsForm(){

    const [step, setStep] = useState(0);
    const totalSteps = 5; // Anexos 4 al 8
    const [formData, setFormData] = useState<any>({});

    const anexo4Fields: FieldConfig[] = [
        { name: "texto_prueba_4", label: "Texto de prueba", type: "text", required: true },
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

    return(
        <div className="container mt-4">

            <ProgressBar currentStep={step} totalSteps={totalSteps} />
            
            {step === 0 && (
                <BaseForm 
                    title="Apéndice 4: Formato lista de verificación planificación operacional"
                    fields={anexo4Fields} 
                    onSubmit={handleNext} 
                />
            )}

            {step === 1 && (
                <BaseForm 
                    title="Apéndice 5: Formato lista verificación prevuelo operacional"
                    fields={anexo5Fields} 
                    onSubmit={handleNext} 
                    onBack={handleBack}
                />
            )}

            {step === 2 && (
                <BaseForm 
                    title="Apéndice 6: Formato lista verificación prevuelo UAS"
                    fields={anexo6Fields} 
                    onSubmit={handleNext} 
                    onBack={handleBack}
                />
            )}

            {step === 3 && (
                <BaseForm 
                    title="Apéndice 7: Formato lista verificación posvuelo UAS"
                    fields={anexo7Fields} 
                    onSubmit={handleNext} 
                    onBack={handleBack}
                />
            )}

            {step === 4 && (
                <BaseForm 
                    title="Apéndice 8: Formato lista verificación posvuelo operacional"
                    fields={anexo8Fields} 
                    onSubmit={handleNext} 
                    onBack={handleBack}
                />
            )}

            {step >= 5 && (
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