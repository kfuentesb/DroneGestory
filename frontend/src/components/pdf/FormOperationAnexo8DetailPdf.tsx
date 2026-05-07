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

const SECCIONES_CONFIG: { seccion1: SectionItem[]; seccion2: SectionItem[] } = {
  seccion1: [
    { num: "1.1", title: "Si la operación se lleva a cabo en espacio aéreo controlado o FIZ", inputType: "title", level: 0, bold: true },
    { num: "1.1.1", title: "Se cierran las operaciones confomre a las condiciones acordadas con el ATSP", key: "condicionesATSP", level: 1 },
    { num: "1.2", title: "Otras condiciones", inputType: "title", level: 0, bold: true },
    {
      num: "1.2.1",
      title: "Comunicación a terceros de la finalización de operaciones",
      key: "comunicacion3FinalizacionOperacion",
      level: 1,
    },
    { num: "1.2.2", title: "Comunicación imágenes tomadas en ZRVF al CECAF", key: "comunicacionZrvfCecaf", level: 1 },
  ],
  seccion2: [
    { num: "2.1", title: "Registros de actividad de vuelo", inputType: "title", level: 0, bold: true },
    { num: "2.1.1", title: "Anotación de tiempos de vuelo de aeronave", key: "anotacionTiempoVueloAeronave", level: 1 },
    { num: "2.1.2", title: "Anotación de tiempos de actividad del personal", key: "anotacionTIempoActividadPersonal", level: 1 },
    { num: "2.2", title: "Registro y comunicación de eventos significativos", inputType: "title", level: 0, bold: true },
    {
      num: "2.2.1",
      title: "Anotación eventos ocurridos en operación",
      key: "anotacionEventosOcurridosOperacion",
      level: 1,
    },
    { num: "2.2.2", title: "Comunicación de incidentes", key: "comunicacionIncidentes", level: 1 },
  ],
};

const normalizeItems = (value: unknown) => {
  if (!Array.isArray(value)) return [] as { descripcion: string; valor: string }[];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      return {
        descripcion: typeof raw.descripcion === "string" ? raw.descripcion : "",
        valor: typeof raw.valor === "string" ? raw.valor : "N/A",
      };
    })
    .filter((item): item is { descripcion: string; valor: string } => item !== null);
};

export type FormOperationAnexo8DetailPdfProps = {
  operationId: number;
  operationTitle?: string;
  formValues: Record<string, any>;
  generatedAt?: string;
};

export function FormOperationAnexo8DetailPdf({
  operationId,
  operationTitle,
  formValues,
  generatedAt,
}: FormOperationAnexo8DetailPdfProps) {
  const otrasItems = normalizeItems(formValues.otrasLimitacionesItems).slice(0, 8);

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
          <Text style={pdfStyles.title}>APÉNDICE 8 - LISTA VERIFICACIÓN POSVUELO OPERACIONAL</Text>
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

        <Text style={pdfStyles.subtitle}>SECCIÓN 1: Condiciones y limitaciones de zonas geográficas de UAS</Text>
        {renderSection(SECCIONES_CONFIG.seccion1)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 2: Registro de datos de vuelo y eventos</Text>
        {renderSection(SECCIONES_CONFIG.seccion2)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 2.3: Otros</Text>
        {otrasItems.length === 0 ? (
          <Text>No aplica / sin elementos.</Text>
        ) : (
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={pdfStyles.th}>Descripción</Text>
              <Text style={pdfStyles.thLast}>Resultado</Text>
            </View>
            {otrasItems.map((row, idx) => (
              <View style={pdfStyles.tr} key={`${idx}-${row.descripcion}`}>
                <Text style={pdfStyles.td}>{textValue(row.descripcion)}</Text>
                <Text style={pdfStyles.tdLast}>{textValue(row.valor, "N/A")}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={pdfStyles.footer} fixed>
          <Text>Generado{generatedAt ? `: ${generatedAt}` : ""}</Text>
          <Text>Apéndice 8</Text>
        </View>
      </Page>
    </Document>
  );
}
