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
        { name: "nombreOperacion", label: "Asigna un nombre:", type: "text", required: true },
    ];

    const anexo4Fields: FieldConfig[] = [
            // Datos generales
        { name: 'descripcion', label: 'Descripción', type: 'text', required: true },
        { name: 'fechaHoraPrevista', label: 'Fecha/Hora Prevista', type: 'date', required: true },
        { name: 'mediosMateriales', label: 'Medios Materiales', type: 'text' },
        { name: 'direccion', label: 'Dirección', type: 'text' },
        { name: 'coords', label: 'Coordenadas', type: 'text' },
        { name: 'imagenEspacioAereo', label: 'Imagen Espacio Aéreo', type: 'file' },
        { name: 'imagenZonaVuelo', label: 'Imagen Zona Vuelo', type: 'file' },

        // Checklist tipo radio3
        { name: 'espacioAereoControlado', label: '¿Espacio aéreo controlado?', type: "radio3" },
        { name: 'estudioAeronauticoCoordinado', label: '¿Estudio aeronáutico coordinado?', type: "radio3" },
        { name: 'entornoAerodromos', label: '¿Entorno aeródromos?', type: "radio3" },
        { name: 'distanciaMinimaInfraestructuras', label: '¿Distancia mínima a infraestructuras?', type: "radio3" },
        { name: 'zonasProhibidasFlexible', label: '¿Zonas prohibidas/flexibles?', type: "radio3" },
        { name: 'cumpleCondiciones', label: '¿Cumple condiciones?', type: "radio3" },
        { name: 'zonasSeguridad', label: '¿Zonas de seguridad?', type: "radio3" },
        { name: 'permisoPrevioSeguridad', label: '¿Permiso previo de seguridad?', type: "radio3" },
        { name: 'serviciosEsencialesComunidad', label: '¿Servicios esenciales/comunidad?', type: "radio3" },
        { name: 'permisoPrevioServicios', label: '¿Permiso previo servicios?', type: "radio3" },
        { name: 'entornosUrbanos', label: '¿Entornos urbanos?', type: "radio3" },
        { name: 'cumplenDistanciasEdificios', label: '¿Cumplen distancias a edificios?', type: "radio3" },
        { name: 'comunicacionMinisterioInterior', label: '¿Comunicación Ministerio Interior?', type: "radio3" },
        { name: 'zonaResVueloFotografico', label: '¿Zona reservada vuelo/fotografía?', type: "radio3" },
        { name: 'permisoCecaf', label: '¿Permiso CECAF?', type: "radio3" },
        { name: 'zonasProtMedioambiental', label: '¿Zonas protegidas medioambientalmente?', type: "radio3" },
        { name: 'disponeCoordGestor', label: '¿Dispone de coordinador gestor?', type: "radio3" },
        { name: 'conopsYModeloSemantico', label: 'CONOPS y modelo semántico', type: "radio3" },
        { name: 'aplicaModelo', label: '¿Aplica modelo?', type: "radio3" },
        { name: 'defineGeografiaVueloConops', label: '¿Define geografía vuelo CONOPS?', type: "radio3" },
        { name: 'defineVolContigencia', label: '¿Define volumen de contingencia?', type: "radio3" },
        { name: 'defineMargenRiesgoTierra', label: '¿Define margen de riesgo a tierra?', type: "radio3" },
        { name: 'defineZonaTerrestreControlada', label: '¿Define zona terrestre controlada?', type: "radio3" },
        { name: 'planificaUbicacionObservadores', label: '¿Planifica ubicación observadores?', type: "radio3" },
        { name: 'calculaAreaYEvaluaRiesgo', label: '¿Calcula área y evalúa riesgo?', type: "radio3" },
        { name: 'notams', label: 'NOTAMs presentados?', type: "radio3" },
        { name: 'revisaNotams', label: '¿Revisa NOTAMs?', type: "radio3" },
        { name: 'tsaOCondicionada', label: '¿TSA o condicionada?', type: "radio3" },
        { name: 'otrasLimitaciones', label: '¿Otras limitaciones?', type: "radio3" },

        // Estado (select)
        { name: 'estado', label: 'Estado', type: 'select', options: ['BORRADOR', 'FIRMADO'], required: true },
        { name: 'campos', label: 'Campos adicionales (texto/JSON)', type: 'text' }
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
            Object.entries(data).forEach(([name, value]) => {
                if (value !== undefined && value !== null) {
                    fd.append(name, value as string);
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
            Object.entries(data).forEach(([name, value]) => {
                if (value !== undefined && value !== null) {
                    fd.append(name, value as string);
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
            Object.entries(data).forEach(([name, value]) => {
                if (value !== undefined && value !== null) {
                    fd.append(name, value as string);
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
            Object.entries(data).forEach(([name, value]) => {
                if (value !== undefined && value !== null) {
                    fd.append(name, value as string);
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
            Object.entries(data).forEach(([name, value]) => {
                if (value !== undefined && value !== null) {
                    fd.append(name, value as string);
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
          <div
            className="d-flex justify-content-center align-items-center"
          >
            <div
              className="card shadow p-4"
              style={{ maxWidth: 400, width: "100%" }}
            >
              <h3 className="mb-3 text-center">Registrar Operación</h3>
              <BaseForm
                fields={createOperationFields}
                onSubmit={handleNextCreateOperation}
                showGuardarButton={false}
                submitButtonText="Crear"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <BaseForm
            title="Apéndice 4: Formato lista de verificación planificación operacional"
            fields={anexo4Fields}
            onSubmit={handleNextAnexo4}
          />
        )}

        {step === 2 && (
          <BaseForm
            title="Apéndice 5: Formato lista verificación prevuelo operacional"
            fields={anexo5Fields}
            onSubmit={handleNextAnexo5}
          />
        )}

        {step === 3 && (
          <BaseForm
            title="Apéndice 6: Formato lista verificación prevuelo UAS"
            fields={anexo6Fields}
            onSubmit={handleNextAnexo6}
          />
        )}

        {step === 4 && (
          <BaseForm
            title="Apéndice 7: Formato lista verificación posvuelo UAS"
            fields={anexo7Fields}
            onSubmit={handleNextAnexo7}
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
