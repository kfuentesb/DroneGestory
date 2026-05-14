import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "left",
    textTransform: "uppercase",
    color: "#000000",
  },
  mainSubtitle: {
    fontSize: 12,
    color: "#444444",
    marginBottom: 20,
    borderBottom: "2px solid #000000",
    paddingBottom: 5,
  },
  flightBlock: {
    marginBottom: 25,
    border: "1px solid #CCCCCC",
    borderRadius: 4,
  },
  headerBar: {
    backgroundColor: "#F0F0F0",
    padding: 10,
    borderBottom: "1px solid #CCCCCC",
  },
  headerText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase",
  },
  contentBox: {
    padding: 15,
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
  },
  col6: {
    width: "50%",
  },
  label: {
    fontSize: 8,
    color: "#666666",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
  },
  hr: {
    borderBottom: "1px solid #EEEEEE",
    marginVertical: 8,
  },
  commentsArea: {
    backgroundColor: "#FAFAFA",
    padding: 8,
    borderRadius: 2,
    fontSize: 9,
    marginTop: 4,
    border: "1px solid #EEEEEE",
    color: "#333333",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999999",
    borderTop: "1px solid #EEEEEE",
    paddingTop: 5,
  },
});

const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const formatMinutes = (minutes: number | null | undefined) => {
  if (minutes == null || Number.isNaN(minutes)) return "-";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder.toString().padStart(2, "0")}m`;
};

export const FlightTimeHistoryPdf = ({ aircraft, flightTimes }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.mainTitle}>Historial de Horas de Vuelo</Text>
      <Text style={styles.mainSubtitle}>
        {aircraft.manufacturer} {aircraft.model} | S/N: {aircraft.serialNumber}
      </Text>

      {flightTimes.map((record: any, index: number) => (
        <View
          key={record.id || index}
          style={styles.flightBlock}
          wrap={false}
        >
          <View style={styles.headerBar}>
            <Text style={styles.headerText}>
              Registro de Vuelo - {formatDate(record.flightDate)}
            </Text>
          </View>

          <View style={styles.contentBox}>
            <View style={styles.row}>
              <View style={styles.col6}>
                <Text style={styles.label}>Aeronave</Text>
                <Text style={styles.value}>
                  {record.aircraftManufacturer || "N/A"} {record.aircraftModel || ""}
                </Text>
              </View>
              <View style={styles.col6}>
                <Text style={styles.label}>Nº Serie</Text>
                <Text style={styles.value}>{record.aircraftSerialNumber || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col6}>
                <Text style={styles.label}>Fecha de vuelo</Text>
                <Text style={styles.value}>{formatDate(record.flightDate)}</Text>
              </View>
              <View style={styles.col6}>
                <Text style={styles.label}>Referencia operacion</Text>
                <Text style={styles.value}>{record.operationReference || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.hr} />

            <View style={styles.row}>
              <View style={styles.col6}>
                <Text style={styles.label}>Duracion</Text>
                <Text style={styles.value}>{formatMinutes(record.durationMinutes)}</Text>
              </View>
              <View style={styles.col6}>
                <Text style={styles.label}>Total acumulado</Text>
                <Text style={styles.value}>{formatMinutes(record.totalFlightTimeMinutes)}</Text>
              </View>
            </View>

            <View>
              <Text style={styles.label}>Comentarios</Text>
              <View style={styles.commentsArea}>
                <Text>{record.comments || "Sin comentarios registrados."}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}

      <Text
        style={styles.footer}
        fixed
        render={({ pageNumber, totalPages }) =>
          `Pagina ${pageNumber} de ${totalPages} - Generado por Sistema de Gestion de Flota`
        }
      />
    </Page>
  </Document>
);
