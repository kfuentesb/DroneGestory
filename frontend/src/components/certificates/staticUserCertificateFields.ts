export type StaticUserCertificateFieldConfig = {
    key: string;
    label: string;
    enabledKey: string;
    fileKey: string;
    dateKey: string;
    indefiniteKey: string;
};

export const staticUserCertificateFields: StaticUserCertificateFieldConfig[] = [
    {
        key: "a1a3",
        label: "Certificado A1/A3",
        enabledKey: "chkA1A3",
        fileKey: "fileA1A3",
        dateKey: "dateA1A3",
        indefiniteKey: "indefiniteA1A3",
    },
    {
        key: "a2",
        label: "Certificado A2",
        enabledKey: "chkA2",
        fileKey: "fileA2",
        dateKey: "dateA2",
        indefiniteKey: "indefiniteA2",
    },
    {
        key: "sts",
        label: "Certificado STS",
        enabledKey: "chkSTS01",
        fileKey: "fileSTS",
        dateKey: "dateSTS",
        indefiniteKey: "indefiniteSTS",
    },
    {
        key: "formacionTeoricaGenerica",
        label: "Formacion teorica generica",
        enabledKey: "chkFormcnTeoricaGen",
        fileKey: "fileFTG",
        dateKey: "dateFTG",
        indefiniteKey: "indefiniteFTG",
    },
    {
        key: "formacionPracticaGenerica",
        label: "Formacion practica generica",
        enabledKey: "chkFormcnPracticaGen",
        fileKey: "fileFPG",
        dateKey: "dateFPG",
        indefiniteKey: "indefiniteFPG",
    },
    {
        key: "radiofonistaTeorico",
        label: "Radiofonista teorico",
        enabledKey: "chkFormCertTeor",
        fileKey: "fileCT",
        dateKey: "dateCT",
        indefiniteKey: "indefiniteCT",
    },
    {
        key: "radiofonistaPractico",
        label: "Radiofonista practico",
        enabledKey: "chkFormCertPract",
        fileKey: "fileCP",
        dateKey: "dateCP",
        indefiniteKey: "indefiniteCP",
    },
    {
        key: "medicoClase2",
        label: "Certificado medico clase 2",
        enabledKey: "chkFormCMClase2",
        fileKey: "fileCMC2",
        dateKey: "dateCMC2",
        indefiniteKey: "indefiniteCMC2",
    },
    {
        key: "medicoClaseLAPL",
        label: "Certificado medico clase LAPL",
        enabledKey: "chkFormCMClaseLAPL",
        fileKey: "fileCMCLAPL",
        dateKey: "dateCMCLAPL",
        indefiniteKey: "indefiniteCMCLAPL",
    },
];

const staticUserCertificateLabelMap = new Map(staticUserCertificateFields.map((field) => [field.key, field.label]));

export function getCertificateLabel(certificateType: string): string {
    const staticLabel = staticUserCertificateLabelMap.get(certificateType);
    if (staticLabel) {
        return staticLabel;
    }

    if (certificateType.startsWith("conops_")) {
        const conopsId = certificateType.replace("conops_", "");
        return `ConOps: ${conopsId}`;
    }

    return certificateType;
}
