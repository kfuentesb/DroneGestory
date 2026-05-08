import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { boolLabel, pdfStyles, textValue } from "./pdfUtils";

type CheckItem = { num: string; title: string; key: string; obsKey: string };

const VERIFICACION_CONFIG: CheckItem[] = [
  { num: "1.1", title: "Estructura", key: "estructuraCorrecto", obsKey: "estructuraObservaciones" },
  { num: "1.2", title: "Baterías", key: "bateriasCorrecto", obsKey: "bateriasObservaciones" },
  { num: "1.3", title: "Sensores", key: "sensoresCorrecto", obsKey: "sensoresObservaciones" },
  { num: "1.4", title: "Motores", key: "motoresCorrecto", obsKey: "motoresObservaciones" },
  { num: "1.5", title: "Hélices", key: "helicesCorrecto", obsKey: "helicesObservaciones" },
  { num: "1.6", title: "Partes móviles", key: "partesMovilesCorrecto", obsKey: "partesMovilesObservaciones" },
  { num: "1.7", title: "Comunicaciones", key: "comunicacionesCorrecto", obsKey: "comunicacionesObservaciones" },
  { num: "1.8", title: "Planta de potencia", key: "plantaPotenciaCorrecto", obsKey: "plantaPotenciaObservaciones" },
  { num: "1.9", title: "Carga de pago", key: "cargaPagoCorrecto", obsKey: "cargaPagoObservaciones" },
  { num: "1.10", title: "Identificación remota", key: "identificacionRemotaCorrecto", obsKey: "identificacionRemotaObservaciones" },
  { num: "1.11", title: "Sistema de geoconsciencia", key: "sistemaGeoconscienciaCorrecto", obsKey: "sistemaGeoconscienciaObservaciones" },
  { num: "1.12", title: "Datos obtenidos durante el vuelo", key: "datosVueloCorrecto", obsKey: "datosVueloObservaciones" },
  { num: "1.13", title: "Otros", key: "otrosVerificacionCorrecto", obsKey: "otrosVerificacionObservaciones" },
];

const RECOGIDA_CONFIG: CheckItem[] = [
  { num: "2.1", title: "Aeronave", key: "aeronaveCorrecto", obsKey: "aeronaveObservaciones" },
  { num: "2.2", title: "Unidad de control", key: "unidadControlCorrecto", obsKey: "unidadControlObservaciones" },
  { num: "2.3", title: "Sensores", key: "sensoresRecogidaCorrecto", obsKey: "sensoresRecogidaObservaciones" },
  { num: "2.4", title: "Antenas", key: "antenasCorrecto", obsKey: "antenasObservaciones" },
  { num: "2.5", title: "Otros (generadores, herramientas, manga, viento, etc)", key: "otrosRecogidaCorrecto", obsKey: "otrosRecogidaObservaciones" },
];

export type FormOperationAnexo7DetailPdfProps = {
  operationId: number;
  operationTitle?: string;
  formValues: Record<string, any>;
  aircraftLabel?: string;
  generatedAt?: string;
};

export function FormOperationAnexo7DetailPdf({
  operationId,
  operationTitle,
  formValues,
  aircraftLabel,
  generatedAt,
}: FormOperationAnexo7DetailPdfProps) {
  const renderCheckTable = (items: CheckItem[]) => (
    <View style={pdfStyles.table}>
      <View style={pdfStyles.tableHeader}>
        <Text style={pdfStyles.th}>Ítem</Text>
        <Text style={pdfStyles.th}>Resultado</Text>
        <Text style={pdfStyles.thLast}>Observaciones</Text>
      </View>
      {items.map((item) => (
        <View key={item.key} style={pdfStyles.tr}>
          <Text style={pdfStyles.td}>{`${item.num}. ${item.title}`}</Text>
          <Text style={pdfStyles.td}>{boolLabel(formValues[item.key])}</Text>
          <Text style={pdfStyles.tdLast}>{textValue(formValues[item.obsKey])}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>APÉNDICE 7 - LISTA VERIFICACIÓN POSVUELO UAS</Text>
          <Text style={{marginTop: 12}}>
            {operationTitle ? `${operationTitle}` : ""}
          </Text>
        </View>

        <Text style={pdfStyles.subtitle}>SECCIÓN 0: Información general</Text>
        <View style={pdfStyles.summaryGrid}>
          {[
            { label: "CONOPS", value: textValue(formValues.nombreConops ?? formValues.conops) },
            { label: "Fecha operación", value: textValue(formValues.fechaOp) },
            { label: "Tiempo de vuelo (minutos)", value: textValue(formValues.tiempoVueloMinutos) },
            { label: "Ciclos de aterrizaje", value: textValue(formValues.ciclosAterrizaje) },
                        { label: "Aeronave", value: textValue(aircraftLabel ?? formValues.aircraftId) }
          ].map((item) => (
            <View key={item.label} style={pdfStyles.summaryCell}>
              <Text style={pdfStyles.summaryLabel}>{item.label}</Text>
              <Text style={pdfStyles.summaryValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Text style={pdfStyles.subtitle}>SECCIÓN 1: Verificaciones UAS</Text>
        {renderCheckTable(VERIFICACION_CONFIG)}

        <View wrap={false}>
          <Text style={pdfStyles.subtitle}>SECCIÓN 2: Recogida y almacenamiento</Text>
          {renderCheckTable(RECOGIDA_CONFIG)}
        </View>

        <View style={pdfStyles.footer} fixed>
          <Text>Generado{generatedAt ? `: ${generatedAt}` : ""}</Text>
          <Text>Apéndice 7</Text>
        </View>
      </Page>
    </Document>
  );
}
