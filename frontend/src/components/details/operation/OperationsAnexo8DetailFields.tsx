import type { FieldConfig } from "../FieldConfig";

export const operationAnexo8DetailFields: FieldConfig[] = [
  { label: "CONOPS", key: "nombreConops", type: "text" },
  { label: "Fecha operación", key: "fechaOp", type: "date" },
  { label: "Condiciones ATSP", key: "condicionesATSP", type: "text" },
  { label: "Comunicación a terceros finalización operación", key: "comunicacion3FinalizacionOperacion", type: "text" },
  { label: "Comunicación imágenes ZRVF CECAF", key: "comunicacionZrvfCecaf", type: "text" },
  { label: "Anotación tiempo vuelo aeronave", key: "anotacionTiempoVueloAeronave", type: "text" },
  { label: "Anotación tiempo actividad personal", key: "anotacionTIempoActividadPersonal", type: "text" },
  { label: "Anotación eventos operación", key: "anotacionEventosOcurridosOperacion", type: "text" },
  { label: "Comunicación incidentes", key: "comunicacionIncidentes", type: "text" },
];