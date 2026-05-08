import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { boolLabel, pdfStyles, textValue } from "./pdfUtils";

type SectionItem = {
  num: string;
  title: string;
  key?: string;
  level: number;
};

const SECCIONES_CONFIG: {
  seccion2: SectionItem[];
  seccion3: SectionItem[];
  seccion4: SectionItem[];
  seccion5: SectionItem[];
  seccion6: SectionItem[];
  seccion7: SectionItem[];
  seccion8: SectionItem[];
  seccion9: SectionItem[];
  seccion10: SectionItem[];
  seccion11: SectionItem[];
  seccion12: SectionItem[];
} = {
  seccion2: [
    { num: "2.1", title: "Sin impacto ni muescas", key: "sinImpacto", level: 0 },
    { num: "2.2", title: "Centro de gravedad", key: "centroGravedad", level: 0 },
    { num: "2.3", title: "Integridad estructural", key: "integridadEstructural", level: 0 },
    { num: "2.4", title: "Cableado/conexiones", key: "cableado", level: 0 },
    { num: "2.5", title: "Verificación de luces", key: "verificacionLuces", level: 0 },
  ],
  seccion3: [
    { num: "3.1", title: "Calibración", key: "calibracion", level: 0 },
    { num: "3.2", title: "Validar de salida de datos", key: "validarSalidaDatos", level: 0 },
  ],
  seccion4: [
    { num: "4.1", title: "Giran libremente", key: "giranLibremente", level: 0 },
    { num: "4.2", title: "Sentido de giro correcto", key: "sentidoGiroCorrecto", level: 0 },
    { num: "4.3", title: "Sin impacto ni muescas", key: "sinImpactoMotores", level: 0 },
  ],
  seccion5: [
    { num: "5.1", title: "Colocación correcta", key: "colocacionCorrecta", level: 0 },
    { num: "5.2", title: "Sujeción firme", key: "sujetacionFirme", level: 0 },
    { num: "5.3", title: "Sin impacto ni muescas", key: "sinImpactoHelices", level: 0 },
  ],
  seccion6: [
    { num: "6.1", title: "Batería con carga adecuada", key: "bateriaCarga", level: 0 },
    { num: "6.2", title: "Movimiento fluido de los mandos", key: "movimientoFluidoMando", level: 0 },
  ],
  seccion7: [
    { num: "7.1", title: "Sin impacto ni muescas", key: "sinImpactoPartesMoviles", level: 0 },
    { num: "7.2", title: "Movimiento fluido", key: "movimientoFluidoPartesMoviles", level: 0 },
  ],
  seccion8: [
    { num: "8.1", title: "Antenas instaladas y orientadas", key: "antenasInstaladasYOrientadas", level: 0 },
    { num: "8.2", title: "Calidad de la señal", key: "calidadOnda", level: 0 },
    { num: "8.3", title: "Recepción adecuada", key: "recepcionAdecuada", level: 0 },
  ],
  seccion9: [
    { num: "9.1", title: "Fuente de alimentación (Baterías, combustible, etc...)", key: "fuenteAlimentacion", level: 0 },
    { num: "9.2", title: "Nivel de fuente de alimentación", key: "nivelFuenteAlimentacion", level: 0 },
  ],
  seccion10: [
    { num: "10.1", title: "Fijación correcta", key: "fijacionCorrecta", level: 0 },
    { num: "10.2", title: "Memoria suficiente para almacenar datos", key: "memoriaSuficienteParaDatos", level: 0 },
    { num: "10.3", title: "Sin impacto ni muescas", key: "sinImpactoCargaPago", level: 0 },
    { num: "10.4", title: "Conexiones", key: "conexionesCargaPago", level: 0 },
  ],
  seccion11: [
    { num: "11.1", title: "Datos cargados", key: "datosCargados", level: 0 },
    { num: "11.2", title: "Transmisión de datos", key: "transmisionDatos", level: 0 },
  ],
  seccion12: [
    { num: "12.1", title: "Información actualizada", key: "informacionActualizada", level: 0 },
    { num: "12.2", title: "Sistema activado", key: "sistemaActivado", level: 0 },
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

export type FormOperationAnexo6DetailPdfProps = {
  operationId: number;
  operationTitle?: string;
  formValues: Record<string, any>;
  aircraftLabel?: string;
  generatedAt?: string;
};

export function FormOperationAnexo6DetailPdf({
  operationId,
  operationTitle,
  formValues,
  aircraftLabel,
  generatedAt,
}: FormOperationAnexo6DetailPdfProps) {
  const materialesAuxiliares = Array.isArray(formValues.materialesAuxiliares)
    ? formValues.materialesAuxiliares.map((item: string) => item.trim()).filter(Boolean)
    : [];

  const elementosItems = normalizeItems(formValues.elementosAuxiliaresItems).slice(0, 8);

  const renderSection = (items: SectionItem[]) => (
    <View style={pdfStyles.box}>
      {items.map((item) => {
        const value = item.key ? boolLabel(formValues[item.key], { trueLabel: "Correcto", falseLabel: "Incorrecto" }) : "N/A";
        return (
          <View key={item.key ?? `${item.num}-${item.title}`} style={pdfStyles.apartadoRow}>
            <View style={pdfStyles.apartadoLeft}>
              <Text style={pdfStyles.apartadoNum}>{item.num}</Text>
            </View>
            <View style={pdfStyles.apartadoRight}>
              <Text style={pdfStyles.apartadoTitle}>
                {item.title} <Text style={pdfStyles.apartadoValue}>[{value}]</Text>
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
          <Text style={pdfStyles.title}>APÉNDICE 6 - LISTA VERIFICACIÓN PREVUELO UAS</Text>
          <Text style={{marginTop: 12}}>
            {operationTitle ? ` ${operationTitle}` : ""}
          </Text>
        </View>

        <Text style={pdfStyles.subtitle}>SECCIÓN 0: Información general</Text>
        <View style={pdfStyles.summaryGrid}>
          {[
            { label: "CONOPS", value: textValue(formValues.nombreConops ?? formValues.conops) },
            { label: "Fecha operación", value: textValue(formValues.fechaOp) },
            { label: "Aeronave", value: textValue(aircraftLabel ?? formValues.aircraftId) }
          ].map((item) => (
            <View key={item.label} style={pdfStyles.summaryCell}>
              <Text style={pdfStyles.summaryLabel}>{item.label}</Text>
              <Text style={pdfStyles.summaryValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Text style={pdfStyles.subtitle}>SECCIÓN 1: Material auxiliar necesario durante la operación</Text>
        {materialesAuxiliares.length === 0 ? (
          <Text>—</Text>
        ) : (
          <View style={pdfStyles.list}>
            {materialesAuxiliares.map((item, index) => (
              <Text key={`${item}-${index}`} style={pdfStyles.listItem}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        <Text style={pdfStyles.subtitle}>SECCIÓN 2: Estructura</Text>
        {renderSection(SECCIONES_CONFIG.seccion2)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 3: Sensores</Text>
        {renderSection(SECCIONES_CONFIG.seccion3)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 4: Motores</Text>
        {renderSection(SECCIONES_CONFIG.seccion4)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 5: Hélices</Text>
        {renderSection(SECCIONES_CONFIG.seccion5)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 6: Unidad de control</Text>
        {renderSection(SECCIONES_CONFIG.seccion6)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 7: Partes móviles</Text>
        {renderSection(SECCIONES_CONFIG.seccion7)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 8: Comunicaciones</Text>
        {renderSection(SECCIONES_CONFIG.seccion8)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 9: Planta de potencia</Text>
        {renderSection(SECCIONES_CONFIG.seccion9)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 10: Carga de pago</Text>
        {renderSection(SECCIONES_CONFIG.seccion10)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 11: Identificación remota</Text>
        {renderSection(SECCIONES_CONFIG.seccion11)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 12: Sistema de geoconsciencia</Text>
        {renderSection(SECCIONES_CONFIG.seccion12)}

        <Text style={pdfStyles.subtitle}>SECCIÓN 13: CONOPS</Text>
        {elementosItems.length === 0 ? (
          <Text>Sin elementos auxiliares.</Text>
        ) : (
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={pdfStyles.th}>Elemento auxiliar</Text>
              <Text style={pdfStyles.thLast}>Resultado</Text>
            </View>
            {elementosItems.map((row, idx) => (
              <View style={pdfStyles.tr} key={`${idx}-${row.descripcion}`} wrap={false}>
                <Text style={pdfStyles.td}>{textValue(row.descripcion)}</Text>
                <Text style={pdfStyles.tdLast}>{textValue(row.valor, "N/A")}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={pdfStyles.footer} fixed>
          <Text>Generado{generatedAt ? `: ${generatedAt}` : ""}</Text>
          <Text>Apéndice 6</Text>
        </View>
      </Page>
    </Document>
  );
}