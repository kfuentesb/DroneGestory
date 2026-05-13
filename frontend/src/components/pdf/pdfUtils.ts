import { StyleSheet } from "@react-pdf/renderer";

type BoolLabels = {
  trueLabel?: string;
  falseLabel?: string;
  emptyLabel?: string;
};

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 32,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    lineHeight: 1.25,
  },
  header: { marginBottom: 14 },
  title: { fontSize: 14, fontWeight: "bold" },
  subtitle: { fontSize: 11, fontWeight: "bold", marginTop: 10, marginBottom: 6 },

  fieldRow: { marginBottom: 6 },
  label: { fontSize: 9.5, color: "#444", fontWeight: "bold", marginBottom: 2 },
  value: { fontSize: 10.5 },

  list: { marginTop: 2, marginLeft: 10 },
  listItem: { marginBottom: 2 },

  apartadoRow: { flexDirection: "row", marginBottom: 4 },
  apartadoLeft: { width: 46 },
  apartadoRight: { flex: 1 },
  apartadoNum: { fontWeight: "bold" },
  apartadoTitle: { fontSize: 10.2 },
  apartadoValue: { fontWeight: "bold" },

  box: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },

  table: { borderWidth: 1, borderColor: "#DDD", borderRadius: 4, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: "#F3F3F3" },
  th: { flex: 1, padding: 6, fontWeight: "bold", borderRightWidth: 1, borderRightColor: "#DDD" },
  thLast: { flex: 1, padding: 6, fontWeight: "bold" },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#DDD" },
  td: { flex: 1, padding: 6, borderRightWidth: 1, borderRightColor: "#DDD" },
  tdLast: { flex: 1, padding: 6, wordBreak: "break-word"},
  tdLastObservaciones: { flex: 1, padding: 6, wordBreak: "break-word", fontSize: 9},

  // Estilos tabla 4 columnas (Anexo 7)
  table4Col: { 
    borderWidth: 1, 
    borderColor: "#DDD", 
    borderRadius: 4, 
    overflow: "hidden" 
  },
  table4ColHeader: { 
    flexDirection: "row", 
    backgroundColor: "#F3F3F3" 
  },
  th4Col: { 
    padding: 6, 
    fontWeight: "bold", 
    borderRightWidth: 1, 
    borderRightColor: "#DDD" 
  },
  th4ColLast: { 
    padding: 6, 
    fontWeight: "bold" 
  },
  tr4Col: { 
    flexDirection: "row", 
    borderTopWidth: 1, 
    borderTopColor: "#DDD",
    alignItems: "flex-start"
  },
  td4ColNum: { 
    width: 36, 
    padding: 6, 
    borderRightWidth: 1, 
    borderRightColor: "#DDD",
    fontSize: 9
  },
  td4ColTitle: { 
    flex: 2, 
    padding: 6, 
    borderRightWidth: 1, 
    borderRightColor: "#DDD",
    fontSize: 9.5
  },
  td4ColCheck: { 
    width: 60, 
    padding: 6, 
    borderRightWidth: 1, 
    borderRightColor: "#DDD",
    fontSize: 9.5,
    textAlign: "center"
  },
  td4ColLast: { 
    flex: 2, 
    padding: 6,
    fontSize: 9
  },

  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    fontSize: 9,
    color: "#666",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 8,
  },

  summaryCell: {
    flexBasis: "45%",
    minWidth: 170,
    maxWidth: "48%",
    marginBottom: 4,
    padding: 8,
    borderRadius: 5,
    border: "1px solid #ECECEC"
  },

  summaryLabel: {
    fontSize: 8.5,
    color: "#777",
    marginBottom: 2,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  summaryValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1a1a1a"
  },  
});

export const textValue = (value: unknown, fallback = "—") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  if (typeof value === "string") {
    return value.trim() ? value : fallback;
  }
  return String(value);
};

export const boolLabel = (value: unknown, labels?: BoolLabels) => {
  const trueLabel = labels?.trueLabel ?? "Sí";
  const falseLabel = labels?.falseLabel ?? "No";
  const emptyLabel = labels?.emptyLabel ?? "N/A";

  if (value === "" || value === null || value === undefined) return emptyLabel;
  if (value === true || value === "true") return trueLabel;
  if (value === false || value === "false") return falseLabel;

  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized) return emptyLabel;
    if (/^(si|sí)$/i.test(normalized)) return trueLabel;
    if (/^no$/i.test(normalized)) return falseLabel;
    return normalized;
  }

  return emptyLabel;
};

export const buildVersionLabel = (numeroVersion?: number | string) => {
  if (numeroVersion === null || numeroVersion === undefined || numeroVersion === "") {
    return " (Sin versión)";
  }

  if (typeof numeroVersion === "number") {
    return numeroVersion > 0 ? ` (V${numeroVersion})` : " (Sin versión)";
  }

  const normalized = numeroVersion.trim();
  if (!normalized || /^0+$/.test(normalized)) {
    return " (Sin versión)";
  }

  const normalizedLower = normalized.toLowerCase();
  if (normalizedLower === "draft" || normalizedLower === "borrador") {
    return " (Borrador)";
  }

  return ` (V${normalized})`;
};
