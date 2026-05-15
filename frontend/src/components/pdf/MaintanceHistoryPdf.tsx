import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { 
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  // Título principal (solo en la primera página)
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
  // Contenedor irrompible de cada mantenimiento
  maintenanceBlock: {
    marginBottom: 25,
    border: "1px solid #CCCCCC",
    borderRadius: 4,
  },
  headerBar: {
    backgroundColor: "#F0F0F0", // Gris claro para el encabezado
    padding: 10,
    borderBottom: "1px solid #CCCCCC",
  },
  headerText: { 
    fontSize: 11, 
    fontWeight: "bold", 
    color: "#000000",
    textTransform: "uppercase" 
  },
  contentBox: {
    padding: 15,
  },
  row: { 
    flexDirection: "row", 
    marginBottom: 12 
  },
  col6: { 
    width: "50%" 
  },
  label: { 
    fontSize: 8, 
    color: "#666666", 
    marginBottom: 2, 
    textTransform: "uppercase" 
  },
  value: { 
    fontSize: 10, 
    fontWeight: "bold", 
    color: "#000000" 
  },
  hr: { 
    borderBottom: "1px solid #EEEEEE", 
    marginVertical: 8 
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
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
    borderTop: '1px solid #EEEEEE',
    paddingTop: 5,
  },
});

function formatDateDMY(value: any) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function getDateSortValue(value: any) {
  if (!value) return null;
  const date = new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? null : time;
}

function sortByMaintenanceDateAsc(a: any, b: any) {
  const timeA = getDateSortValue(a?.maintenanceDate);
  const timeB = getDateSortValue(b?.maintenanceDate);
  if (timeA == null && timeB == null) return 0;
  if (timeA == null) return 1;
  if (timeB == null) return -1;
  return timeA - timeB;
}

export const MaintenanceHistoryPdf = ({ aircraft, maintenanceRecords }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Título de Cabecera (Se muestra al inicio de la primera página) */}
      <Text style={styles.mainTitle}>Historial de Mantenimiento</Text>
      <Text style={styles.mainSubtitle}>
        {aircraft.manufacturer} {aircraft.model} | S/N: {aircraft.serialNumber}
      </Text>

      {/* Lista de Mantenimientos */}
      {[...maintenanceRecords].sort(sortByMaintenanceDateAsc).map((record: any, index: number) => (
        <View 
          key={record.id || index} 
          style={styles.maintenanceBlock} 
          wrap={false} // HACE QUE EL BLOQUE SEA IRROMPIBLE
        >
          <View style={styles.headerBar}>
            <Text style={styles.headerText}>Registro de Mantenimiento - {formatDateDMY(record.maintenanceDate)}</Text>
          </View>

          <View style={styles.contentBox}>
            <View style={styles.row}>
              <View style={styles.col6}>
                <Text style={styles.label}>Aeronave</Text>
                <Text style={styles.value}>{record.aircraftManufacturer} {record.aircraftModel}</Text>
              </View>
              <View style={styles.col6}>
                <Text style={styles.label}>Nº Serie</Text>
                <Text style={styles.value}>{record.aircraftSerialNumber}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.col6}>
                <Text style={styles.label}>Fecha Realización</Text>
                <Text style={styles.value}>{formatDateDMY(record.maintenanceDate) || "—"}</Text>
              </View>
              <View style={styles.col6}>
                <Text style={styles.label}>Próxima Revisión</Text>
                <Text style={styles.value}>{formatDateDMY(record.nextMaintenanceDate) || "—"}</Text>
              </View>
            </View>

            <View style={styles.hr} />

            <View style={styles.row}>
              <View style={styles.col6}>
                <Text style={styles.label}>Tipo de revisión</Text>
                <Text style={styles.value}>{record.reviewType || "N/A"}</Text>
              </View>
              <View style={styles.col6}>
                <Text style={styles.label}>Meses / Intervalo</Text>
                <Text style={styles.value}>{record.monthsRequired ? `${record.monthsRequired} meses` : "N/A"}</Text>
              </View>
            </View>

            <View style={{ marginBottom: 10 }}>
              <Text style={styles.label}>Horas de vuelo en el momento</Text>
              <Text style={styles.value}>{record.hoursFlightRequired || "0"} min</Text>
            </View>

            <View>
              <Text style={styles.label}>Comentarios y Observaciones</Text>
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
        render={({ pageNumber, totalPages }) => (
          `Página ${pageNumber} de ${totalPages} - Generado por Sistema de Gestión de Flota`
        )} 
      />
    </Page>
  </Document>
);