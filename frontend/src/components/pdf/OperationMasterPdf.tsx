import React from "react";
import { Document } from "@react-pdf/renderer";
import type { OperationMasterPdfData } from "./buildVersionData";
import { OperationDetailPages } from "./OperationDetailPdf";
import { Anexo4Pages } from "./FormOperationAnexo4DetailPdf";
import { Anexo5Pages } from "./FormOperationAnexo5DetailPdf";
import { Anexo6Pages } from "./FormOperationAnexo6DetailPdf";
import { Anexo7Pages } from "./FormOperationAnexo7DetailPdf";
import { Anexo8Pages } from "./FormOperationAnexo8DetailPdf";

type OperationMasterPdfProps = {
  data: OperationMasterPdfData;
};

export function OperationMasterPdf({ data }: OperationMasterPdfProps) {
  const { operation, generatedAt, aircraftOptions, personnelOptions, anexos } = data;

  return (
    <Document>
      <OperationDetailPages operation={operation} generatedAt={generatedAt} />

      {anexos[4].map((entry) => (
        <Anexo4Pages
          key={`a4-${entry.label}-${entry.versionId ?? "draft"}`}
          operationId={operation.idOperacion}
          operationTitle={operation.codigo}
          numeroVersion={entry.numeroVersion}
          formValues={entry.data}
          aircraftOptions={aircraftOptions}
          personnelOptions={personnelOptions}
          generatedAt={generatedAt}
        />
      ))}

      {anexos[5].map((entry) => (
        <Anexo5Pages
          key={`a5-${entry.label}-${entry.versionId ?? "draft"}`}
          operationId={operation.idOperacion}
          operationTitle={operation.codigo}
          numeroVersion={entry.numeroVersion}
          formValues={entry.data}
          generatedAt={generatedAt}
        />
      ))}

      {anexos[6].map((entry) => (
        <Anexo6Pages
          key={`a6-${entry.label}-${entry.versionId ?? "draft"}-${entry.aircraftId ?? "na"}`}
          operationId={operation.idOperacion}
          operationTitle={operation.codigo}
          numeroVersion={entry.numeroVersion}
          formValues={entry.data}
          aircraftLabel={entry.aircraftLabel}
          generatedAt={generatedAt}
        />
      ))}

      {anexos[7].map((entry) => (
        <Anexo7Pages
          key={`a7-${entry.label}-${entry.versionId ?? "draft"}-${entry.aircraftId ?? "na"}`}
          operationId={operation.idOperacion}
          operationTitle={operation.codigo}
          numeroVersion={entry.numeroVersion}
          formValues={entry.data}
          aircraftLabel={entry.aircraftLabel}
          generatedAt={generatedAt}
        />
      ))}

      {anexos[8].map((entry) => (
        <Anexo8Pages
          key={`a8-${entry.label}-${entry.versionId ?? "draft"}`}
          operationId={operation.idOperacion}
          operationTitle={operation.codigo}
          numeroVersion={entry.numeroVersion}
          formValues={entry.data}
          generatedAt={generatedAt}
        />
      ))}
    </Document>
  );
}
