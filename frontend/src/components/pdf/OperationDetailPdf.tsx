import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { OperationDetailDTO } from "../operations/operation.types";
import { formatDateTime } from "../operations/operation.utils";
import { pdfStyles, textValue } from "./pdfUtils";
import { useFormatDate } from "../commons/hooks/useFormatDate";

type OperationDetailPdfProps = {
  operation: OperationDetailDTO;
  generatedAt?: string;
};

export function OperationDetailPages({ operation, generatedAt }: OperationDetailPdfProps) {
  const { format } = useFormatDate();

  const resumenCampos = [
    { label: "CONOPS", value: textValue(operation.conops) },
    { label: "Creador", value: textValue(operation.nombreCreador) },
    { label: "Fecha creación", value: format(operation.fechaCreacion) },
    { label: "Última actualización", value: format(operation.fechaActualizacion) },
    { label: "Estado operación", value: textValue(operation.estadoOperacion) },
  ];

    

  return (
    <Page size="A4" style={pdfStyles.page} wrap>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>OPERACIÓN: {operation.codigo} </Text>
      </View>

      <Text style={pdfStyles.subtitle}>Información general</Text>
      <View style={pdfStyles.summaryGrid}>
        {resumenCampos.map((item) => (
          <View key={item.label} style={pdfStyles.summaryCell}>
            <Text style={pdfStyles.summaryLabel}>{item.label}</Text>
            <Text style={pdfStyles.summaryValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <Text style={pdfStyles.subtitle}>Anexos</Text>
      {operation.anexos.map((anexo) => {
        const hasAircraft = anexo.tipoAnexo === 6 || anexo.tipoAnexo === 7;
        const columns = [
          { key: "version", label: "Versión" },
          { key: "estado", label: "Estado" },
          ...(hasAircraft ? [{ key: "aircraft", label: "Aeronave" }] : []),
          { key: "firmadoPor", label: "Firmado por" },
          { key: "fechaFirma", label: "Fecha firma" },
        ];

        return (
          <View key={anexo.tipoAnexo} style={pdfStyles.box} wrap={false}>
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>{`Anexo ${anexo.tipoAnexo}`}</Text>
            <View style={pdfStyles.fieldRow}>
              <Text style={pdfStyles.label}>Versión actual</Text>
              <Text style={pdfStyles.value}>{anexo.actual.numeroVersion > 0 ? `v${anexo.actual.numeroVersion}` : "Sin versión"}</Text>
            </View>
            <View style={pdfStyles.fieldRow}>
              <Text style={pdfStyles.label}>Estado actual</Text>
              <Text style={pdfStyles.value}>{textValue(anexo.actual.estado ?? "SIN DATOS")}</Text>
            </View>

            {anexo.versiones.length === 0 ? (
              <Text>Sin versiones registradas.</Text>
            ) : (
              <View style={pdfStyles.table}>
                <View style={pdfStyles.tableHeader}>
                  {columns.map((column, index) => (
                    <Text
                      key={column.key}
                      style={index === columns.length - 1 ? pdfStyles.thLast : pdfStyles.th}
                    >
                      {column.label}
                    </Text>
                  ))}
                </View>
                {anexo.versiones.map((version) => (
                  <View key={version.id} style={pdfStyles.tr}>
                    {columns.map((column, index) => {
                      const value = (() => {
                        switch (column.key) {
                          case "version":
                            return `v${version.numeroVersion}`;
                          case "estado":
                            return version.estado;
                          case "aircraft":
                            return version.aircraftId ? `Aeronave ${version.aircraftId}` : "-";
                          case "firmadoPor":
                            return version.firmadoPor ?? "-";
                          case "fechaFirma":
                            return format(version.fechaFirma);
                          default:
                            return "-";
                        }
                      })();
                      return (
                        <Text
                          key={column.key}
                          style={index === columns.length - 1 ? pdfStyles.tdLast : pdfStyles.td}
                        >
                          {value}
                        </Text>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      <View style={pdfStyles.footer} fixed>
        <Text>Generado{generatedAt ? `: ${generatedAt}` : ""}</Text>
        <Text>Operación {operation.codigo}</Text>
      </View>
    </Page>
  );
}

export function OperationDetailPdf(props: OperationDetailPdfProps) {
  return (
    <Document>
      <OperationDetailPages {...props} />
    </Document>
  );
}
