import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { boolLabel, pdfStyles, textValue } from "./pdfUtils";

type SectionItem = {
  num: string;
  title: string;
  key?: string;
  level: number;
  bold?: boolean;
  inputType?: "title";
};

const SECCIONES_CONFIG: {
  seccion1: SectionItem[];
  seccion2: SectionItem[];
  seccion3: SectionItem[];
  seccion4: SectionItem[];
  seccion5: SectionItem[];
  seccion6: SectionItem[];
  seccion7: SectionItem[];
} = {
  seccion1: [
    { num: "1.1", title: "Evaluación del área de operación y área circundante", level: 0, inputType: "title", bold: true },
    { num: "1.1.1", title: "Terreno, obstáculos y obstrucciones", level: 1, inputType: "title", bold: true },
    { num: "1.1.1.1", title: "Los UA se mantendrán en VLOS/BVLOS según el perfil de vuelo", key: "vlos", level: 2 },
    { num: "1.1.1.2", title: "Los observadores están correctamente posicionados", key: "ubicacionObservadores", level: 2 },
    {
      num: "1.1.1.3",
      title: "Se ha realizado una evaluación del cumplimiento entre la visibilidad y el alcance planificado",
      key: "evaluacionVisibilidadYAlcance",
      level: 2,
    },
    { num: "1.1.2", title: "Si la operación se lleva a cabo próxima a aeropuertos, aeródromos y helipuertos", level: 1, inputType: "title", bold: true },
    {
      num: "1.1.2.1",
      title: "Se han aplicado los condicionantes con el gestor de la infraestructura(ej: notificación a usuarios, llamadas al gestor...)",
      key: "condicionantesAcordadosConGestor",
      level: 2,
    },
    { num: "1.1.3", title: "Otros", level: 1, inputType: "title", bold: true },
    { num: "1.1.3.1", title: "Analizar por parte del operador en función del CONOPS de la operación", key: "analisisEnFuncionConops", level: 2 },
    { num: "1.1.4.1", title: "Evaluación del entorno y del espacio aéreo adyacente", key: "evaluacionEntornoAereoAdyacente", level: 2 },
    { num: "1.1.5.1", title: "Se cumplen las condiciones para el vuelo en zona terrestre controlada", key: "vueloTerrestreControlado", level: 2 },
    { num: "1.2", title: "Evaluación del entorno y del espacio aéreo adyacente", level: 0, inputType: "title", bold: true },
    { num: "1.2.1", title: "NOTAM", level: 1, inputType: "title", bold: true },
    { num: "1.2.2.1", title: "Se revisan los NOTAMS activos y no existen limitaciones a la operación", key: "notamActivos", level: 2 },
    {
      num: "1.2.2.2",
      title:
        "Si la operación debe realizarse en TSA o está condicionada a la publicación previa de NOTAM, se confirma que la correcta publicación del NOTAM informado de la TSA o actividad con UAS",
      key: "tsaPreviaNotam",
      level: 2,
    },
    { num: "1.2.2", title: "Si la operación se lleva a cabo en espacio aéreo controlado o FIZ", level: 1, inputType: "title", bold: true },
    { num: "1.2.3.1", title: "Se cumplen con los procedimientos acorddados con el ATSP", key: "procedimientosATSP", level: 2 },
  ],
  seccion2: [
    { num: "2.1", title: "Se han comprobado las condiciones ambientales y climatológicas", level: 0, inputType: "title", bold: true },
    {
      num: "2.1.1",
      title: "Las condiciones climatológicas no exceden los máximos previtos por el operador y/o por el fabricante del UAS para llevar a cabo la operación",
      key: "condicionesClimatologicas",
      level: 1,
    },
  ],
  seccion3: [
    { num: "3.1", title: "Se dispone del número mínimo de miembros de la tripulación necesarios para realizar la operación", level: 0, inputType: "title", bold: true },
    { num: "3.1.1", title: "El personal conoce sus funciones y responsabilidades dentro de la operación prevista", key: "personalSabeFunciones", level: 1 },
  ],
  seccion4: [
    {
      num: "4.1",
      title: "Se dispone de los procedimientos y equipos requeridos para la comunicación entre el personal a cargo de las tareas esenciales para la operación del UAS y funcionan correctamente",
      key: "comunicacionEntrePersonal",
      level: 1,
    },
    {
      num: "4.2",
      title: "Se dispone de los procedimientos y equipso requeridos para la comunicaicón con terceras partes cuando sea necesario y funcionan correctamente",
      key: "comunicacion3Partes",
      level: 1,
    },
  ],
  seccion5: [
    {
      num: "5.1",
      title: "Se cumplen los requisitos específicos relacionados con la seguridad, la privacidad, los datos de carácter personal",
      key: "requisitosSeguridad",
      level: 1,
    },
    { num: "5.2", title: "Se cumplen los requisitos específicos relacionados con la protección del medio ambiente", key: "requisitosMedioAmbiente", level: 1 },
    { num: "5.3", title: "Se cumplen los requisitos específicos relacionados con el uso del espectro radioeléctrico", key: "requisitosRadioelectrico", level: 1 },
    { num: "5.4", title: "Si se realizan operaciones transfronterizas se cumplen los reqisitos locales específicos", key: "requisitosLocalesEspecificos", level: 1 },
  ],
  seccion6: [
    { num: "6.1", title: "Las atenuaciones del GRC están implementadas", key: "atenuacionesGRC", level: 0 },
    { num: "6.2", title: "Las atenuaciones del ARC están implementadas", key: "atenuacionesARC", level: 0 },
  ],
  seccion7: [
    { num: "7.1", title: "Se han realizado las comprobaciones necesarias (lista de verificación de la aeronave) y es apta para el vuelo", key: "comprobacionesUasVuelo", level: 0 },
  ],
};

export type FormOperationAnexo5DetailPdfProps = {
  operationId: number;
  operationTitle?: string;
  formValues: Record<string, any>;
  generatedAt?: string;
};

export function FormOperationAnexo5DetailPdf({
  operationId,
  operationTitle,
  formValues,
  generatedAt,
}: FormOperationAnexo5DetailPdfProps) {
  const assignedPersonnel = Array.isArray(formValues.assignedPersonnel) ? formValues.assignedPersonnel : [];

  const renderSection = (items: SectionItem[]) => (
    <View style={pdfStyles.box}>
      {items.map((item) => {
        const value = item.key ? boolLabel(formValues[item.key]) : null;
        return (
          <View key={item.key ?? `${item.num}-${item.title}`} style={pdfStyles.apartadoRow}>
            <View style={[pdfStyles.apartadoLeft, { marginLeft: item.level ? 10 * item.level : 0 }]}>
              <Text style={pdfStyles.apartadoNum}>{item.num}</Text>
            </View>
            <View style={pdfStyles.apartadoRight}>
              <Text style={[pdfStyles.apartadoTitle, item.bold ? { fontWeight: "bold" } : null]}>
                {item.title}
                {value ? (
                  <Text style={pdfStyles.apartadoValue}> [{value}]</Text>
                ) : null}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>APÉNDICE 5 - LISTA VERIFICACIÓN PREVUELO OPERACIONAL</Text>
          <Text>
            Operación ID: {operationId}
            {operationTitle ? ` — ${operationTitle}` : ""}
          </Text>
        </View>

        <Text style={pdfStyles.subtitle}>SECCIÓN 0: Información general</Text>
        <View style={pdfStyles.fieldRow}>
          <Text style={pdfStyles.label}>CONOPS</Text>
          <Text style={pdfStyles.value}>{textValue(formValues.nombreConops ?? formValues.conops)}</Text>
        </View>
        <View style={pdfStyles.fieldRow}>
          <Text style={pdfStyles.label}>Fecha operación</Text>
          <Text style={pdfStyles.value}>{textValue(formValues.fechaOp)}</Text>
        </View>

        <Text style={pdfStyles.subtitle}>SECCIÓN 1: Lugar de la operación</Text>
        {renderSection(SECCIONES_CONFIG.seccion1)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 2: Condiciones ambientales y climatológicas</Text>
        {renderSection(SECCIONES_CONFIG.seccion2)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 3: Personal</Text>
        {renderSection(SECCIONES_CONFIG.seccion3)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 4: Procedimientos de comunicación</Text>
        {renderSection(SECCIONES_CONFIG.seccion4)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 5: Requisitos adicionales</Text>
        {renderSection(SECCIONES_CONFIG.seccion5)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 6: Atenuaciones al riesgo</Text>
        {renderSection(SECCIONES_CONFIG.seccion6)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 7: El UAS está en condiciones adecuadas para operar</Text>
        {renderSection(SECCIONES_CONFIG.seccion7)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 8: Aptitud para operar</Text>
        {assignedPersonnel.length === 0 ? (
          <Text>Sin personal asignado.</Text>
        ) : (
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={pdfStyles.th}>Personal asignado</Text>
              <Text style={pdfStyles.th}>Roles</Text>
              <Text style={pdfStyles.thLast}>Estado firma</Text>
            </View>
            {assignedPersonnel.map((person: any) => (
              <View style={pdfStyles.tr} key={person.id ?? person.fullName}>
                <Text style={pdfStyles.td}>{textValue(person.fullName)}</Text>
                <Text style={pdfStyles.td}>{Array.isArray(person.roles) ? person.roles.join(", ") : "—"}</Text>
                <Text style={pdfStyles.tdLast}>{person.signed ? "Firmado" : "Pendiente"}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={pdfStyles.footer} fixed>
          <Text>Generado{generatedAt ? `: ${generatedAt}` : ""}</Text>
          <Text>Apéndice 5</Text>
        </View>
      </Page>
    </Document>
  );
}
