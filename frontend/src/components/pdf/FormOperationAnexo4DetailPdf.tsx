import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { API_BASE_URL } from "../../api";

export type ExpandableTableItem = { descripcion: string; valor: string };
export type SelectableUserOption = {
  id: number;
  firstName: string;
  lastName: string;
  roles: string[];
};
type AircraftOption = {
  id: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
};

type SectionItem = {
  num: string;
  title: string;
  key?: string;
  level: number;
};

const SECCIONES_CONFIG: { seccion4: SectionItem[]; seccion6: SectionItem[] } = {
  seccion4: [
    { num: "4.1", title: "Espacio aéreo controlado y en zonas de información de vuelo (FIZ)", key: "espacioAereoControlado", level: 0 },
    { num: "4.1.1", title: "Se cuenta con un estudio aeronáutico coordinado de seguridad específico con el ATSP.", key: "estudioAeronauticoCoordinado", level: 1 },
    { num: "4.2", title: "Entorno aeródromos o helipuertos, civiles o militares", key: "entornoAerodromos", level: 0 },
    { num: "4.2.1", title: "Se mantiene distancia mínima a dichas infraestructuras o se ha realizado una coordinación previa con el gestor de la infraestructura y proveedor ATS si lo hubiera.", key: "distanciaMinimaInfraestructuras", level: 1 },
    { num: "4.3", title: "Zonas prohibidas, restringidas y asociadas a la gestión flexible del espacio aéreo", key: "zonasProhibidasFlexible", level: 0 },
    { num: "4.3.1", title: "Se cumple con las condiciones y limitaciones o se cuenta con la autorización pertinente del gestor del área.", key: "cumpleCondiciones", level: 1 },
    { num: "4.4", title: "Zonas de seguridad militar, de la Defensa Nacional y de la seguridad del Estado", key: "zonasSeguridad", level: 0 },
    { num: "4.4.1", title: "Se cuenta con permiso previo y expreso del titular de la zona o del gestor responsable.", key: "permisoPrevioSeguridad", level: 1 },
    { num: "4.5", title: "Instalaciones que prestan servicios esenciales para la comunidad", key: "serviciosEsencialesComunidad", level: 0 },
    { num: "4.5.1", title: "Se cuenta con el permiso previo y expreso del titular de la zona o del gestor responsable.", key: "permisoPrevioServicios", level: 1 },
    { num: "4.6", title: "Entornos urbanos", key: "entornosUrbanos", level: 0 },
    { num: "4.6.1", title: "Se cumplen con las distancias a edificios determinadas en la declaración operacional o autorización.", key: "cumplenDistanciasEdificios", level: 1 },
    { num: "4.6.2", title: "Se ha realizado la comunicación al Ministerio del Interior al menos con 5 días de antelación a la operación.", key: "comunicacionMinisterioInterior", level: 1 },
    { num: "4.7", title: "Zona Restringida al Vuelo Fotográfico (ZRVF)", key: "zonaResVueloFotografico", level: 0 },
    { num: "4.7.1", title: "Se cuenta con el permiso del CECAF para la toma de imágenes.", key: "permisoCecaf", level: 1 },
    { num: "4.8", title: "Zonas de protección medioambiental", key: "zonasProtMedioambiental", level: 0 },
    { num: "4.8.1", title: "Se dispone de coordinación con el gestor del espacio.", key: "disponeCoordGestor", level: 1 },
  ],
  seccion6: [
    { num: "6.1", title: "CONOPS y modelo semántico", key: "conopsYModeloSemantico", level: 0 },
    { num: "6.1.1", title: "Se aplica e identifica el modelo semántico en la zona de vuelo y este se ajusta al CONOPS autorizado.", key: "aplicaModelo", level: 1 },
    { num: "6.1.2", title: "Se define la geografía del vuelo junto con el perfil de vuelos en función del CONOPS (alcance máximo, altura máxima, VLOS/BVLOS...) y los obstáculos y orografía.", key: "defineGeografiaVueloConops", level: 1 },
    { num: "6.1.3", title: "Se define el volumen de contingencia.", key: "defineVolContigencia", level: 1 },
    { num: "6.1.4", title: "Se define el margen por riesgo en tierra.", key: "defineMargenRiesgoTierra", level: 1 },
    { num: "6.1.5", title: "Se define la zona terrestre controlada y contempla el control de accesos si fuera necesario.", key: "defineZonaTerrestreControlada", level: 1 },
    { num: "6.1.6", title: "Se planifica la ubicación de observadores y/o asistentes.", key: "planificaUbicacionObservadores", level: 1 },
    { num: "6.1.7", title: "Se calcula el área adyacente y se evalúa en riesgo en tierra y en aire.", key: "calculaAreaYEvaluaRiesgo", level: 1 },
    { num: "6.2", title: "NOTAMS", key: "notams", level: 0 },
    { num: "6.2.1", title: "Se revisa los NOTAMS activos y no existen limitaciones a la operación.", key: "revisaNotams", level: 1 },
    { num: "6.2.2", title: "Si la operación debe realizarse en TSA o está condicionada a la publicación  previa de NOTAM, se solicita al COOP de ENAIRE su promulgación", key: "tsaOCondicionada", level: 1 },
  ],
};

const styles = StyleSheet.create({
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

  image: {
    marginTop: 6,
    marginBottom: 8,
    width: "70%",
    maxHeight: 180,
    objectFit: "contain",
    borderWidth: 1,
    borderColor: "#EEE",
    alignSelf: "center",
  },

  table: { borderWidth: 1, borderColor: "#DDD", borderRadius: 4, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: "#F3F3F3" },
  th: { flex: 1, padding: 6, fontWeight: "bold", borderRightWidth: 1, borderRightColor: "#DDD" },
  thLast: { flex: 1, padding: 6, fontWeight: "bold" },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#DDD" },
  td: { flex: 1, padding: 6, borderRightWidth: 1, borderRightColor: "#DDD" },
  tdLast: { flex: 1, padding: 6 },
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

const normalizeAircraftIds = (value: unknown): number[] => {
  if (Array.isArray(value)) return value.map(Number).filter(Number.isFinite);
  if (typeof value === "string") {
    if (!value.trim()) return [];
    return value.split(",").map((v) => Number(v.trim())).filter(Number.isFinite);
  }
  return [];
};

const normalizeSelectedPersonnelIds = (value: unknown): number[] => {
  if (Array.isArray(value)) return value.map(Number).filter(Number.isFinite);
  if (typeof value === "string") {
    if (!value.trim()) return [];
    return value.split(",").map((v) => Number(v.trim())).filter(Number.isFinite);
  }
  return [];
};

const normalizeExpandableItems = (value: unknown): ExpandableTableItem[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      return {
        descripcion: typeof raw.descripcion === "string" ? raw.descripcion : "",
        valor: typeof raw.valor === "string" ? raw.valor : "N/A",
      };
    })
    .filter((x): x is ExpandableTableItem => x !== null);
};

const getAircraftDisplayName = (aircraft: AircraftOption | undefined, fallbackId: any) => {
  if (!aircraft) return `Aeronave #${fallbackId}`;
  
  const base = (aircraft.model ?? "").trim() || "Aeronave";
  return aircraft.serialNumber ? `${base} (${aircraft.serialNumber})` : base;
};

const boolLabel = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return "N/A";
  if (value === true || value === "true") return "Sí";
  if (value === false || value === "false") return "No";
  if (typeof value === "string" && value.trim()) return value;
  return "N/A";
};

type PdfImageSource = string | { uri: string; headers?: Record<string, string> };

const getAuthHeaders = () => {
  if (typeof localStorage === "undefined") return undefined;
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const imageSourceFromFilename = (filename: unknown): PdfImageSource | null => {
  if (!filename || typeof filename !== "string") return null;
  const trimmed = filename.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  const headers = getAuthHeaders();
  const withHeaders = (uri: string): PdfImageSource => (headers ? { uri, headers } : uri);

  if (/^https?:\/\//i.test(trimmed)) {
    return withHeaders(trimmed);
  }

  if (trimmed.startsWith("/api/")) {
    return withHeaders(`${API_BASE_URL}${trimmed}`);
  }

  const normalized = trimmed.replace(/^\/+/, "");
  return withHeaders(`${API_BASE_URL}/api/operations/anexo4/images/${normalized}`);
};

export type FormOperationAnexo4DetailPdfProps = {
  operationId: number;
  operationTitle?: string;
  formValues: Record<string, any>;
  aircraftOptions?: AircraftOption[];
  personnelOptions?: SelectableUserOption[];
  generatedAt?: string; // opcional para pie (YYYY-MM-DD etc.)
};

export function FormOperationAnexo4DetailPdf({
  operationId,
  operationTitle,
  formValues,
  aircraftOptions = [],
  personnelOptions = [],
  generatedAt,
}: FormOperationAnexo4DetailPdfProps) {
  const aircraftIds = normalizeAircraftIds(formValues.aircraftIds);
  const selectedPersonnelIds = normalizeSelectedPersonnelIds(formValues.selectedPersonnelIds);
  const selectedPersonnel = Array.isArray(formValues.selectedPersonnel)
    ? formValues.selectedPersonnel
        .map((person: any) => ({
          id: Number(person?.id),
          fullName: typeof person?.fullName === "string" ? person.fullName : "",
          roles: Array.isArray(person?.roles) ? person.roles : [],
        }))
        .filter((person: { id: number; fullName: string }) => Number.isFinite(person.id) || person.fullName)
    : [];

  const imagenEspacioAereoUrl = imageSourceFromFilename(formValues.imagenEspacioAereo);
  const imagenZonaVueloUrl = imageSourceFromFilename(formValues.imagenZonaVuelo);

  const otrasItems = normalizeExpandableItems(formValues.otrasLimitacionesItems).slice(0, 8);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>
            APÉNDICE 4 - LISTA DE VERIFICACIÓN PLANIFICACIÓN OPERACIONAL
          </Text>
          <Text style={{marginTop: 10, fontSize: 12}}>{operationTitle ? `${operationTitle}` : ""}</Text>
        </View>

        {/* SECCIÓN 1: Información sobre las operaciones */}
        <Text style={styles.subtitle}>SECCIÓN 1: Información sobre las operaciones</Text>

        <View style={styles.summaryGrid}>
          {/* CONOPS */}
          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>CONOPS</Text>
            <Text style={styles.summaryValue}>{formValues.conops || "—"}</Text>
          </View>

          {/* Fechas y Horas */}
          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>Fechas y horas previstas</Text>
            <Text style={styles.summaryValue}>{formValues.fechaHoraPrevista || "—"}</Text>
          </View>

          {/* Descripción (Ocupa una celda, pero si es muy larga podrías considerar un ancho del 100%) */}
          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>Descripción de objetivos</Text>
            <Text style={styles.summaryValue}>{formValues.descripcion || "—"}</Text>
          </View>

          {/* Personal Necesario */}
          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>Personal necesario</Text>
            <Text style={styles.summaryValue}>{formValues.personal || "—"}</Text>
          </View>

          {/* Medios Materiales */}
          <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>Medios materiales</Text>
            <Text style={styles.summaryValue}>{formValues.mediosMateriales || "—"}</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Personal seleccionado</Text>
          <View style={styles.list}>
            {selectedPersonnel.length > 0
              ? selectedPersonnel.map((person: { id: number; fullName: string; roles: string[] }) => (
                  <Text key={person.id || person.fullName} style={styles.listItem}>
                    • {person.fullName || "—"}
                    {person.roles.length > 0 ? ` (${person.roles.join(", ")})` : ""}
                  </Text>
                ))
              : selectedPersonnelIds.length === 0
                ? (
                  <Text style={styles.listItem}>—</Text>
                )
                : selectedPersonnelIds.map((id) => {
                    const user = personnelOptions.find((u) => u.id === id);
                    const display = user
                      ? `${user.firstName} ${user.lastName} (${(user.roles ?? []).join(", ")})`
                      : `#${id}`;
                    return (
                      <Text key={id} style={styles.listItem}>
                        • {display}
                      </Text>
                    );
                  })}
          </View>
        </View>

        {/* Aeronaves seleccionadas */}
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Aeronaves seleccionadas</Text>
          <View style={styles.list}>
            {aircraftIds.length === 0 ? (
              <Text style={styles.listItem}>—</Text>
            ) : (
              aircraftIds.map((id) => {
                console.log("Buscando ID:", id, "Tipo:", typeof id);
                console.log("Opciones disponibles:", aircraftOptions);
                const aircraft = aircraftOptions.find((a) => String(a.id) === String(id));
                console.log("Resultado del hallazgo:", aircraft);
                return (
                  <Text key={id} style={styles.listItem}>
                    {/* • {aircraft ? getAircraftDisplayName(aircraft) : `#${id}`} */}
                  </Text>
                );
              })
            )}
          </View>
        </View>

        {/* SECCIÓN 2 */}
        <Text style={styles.subtitle}>SECCIÓN 2: Evaluación del escenario de operaciones</Text>
        <View style={styles.summaryGrid}>
          {[
            { label: "Dirección", value: formValues.direccion || "—" },
            { label: "Coordenadas", value: formValues.coords || "—" }
          ].map((item) => (
            <View key={item.label} style={styles.summaryCell}>
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={styles.summaryValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* SECCIÓN 3 */}
        <Text style={styles.subtitle}>SECCIÓN 3: Espacio aéreo</Text>
        {imagenEspacioAereoUrl ? (
          <Image src={imagenEspacioAereoUrl} style={styles.image} />
        ) : (
          <Text>Sin imagen adjunta.</Text>
        )}

        {/* SECCIÓN 4 */}
        <Text style={styles.subtitle}>SECCIÓN 4: Zonas geográficas de UAS</Text>
        <View style={styles.box}>
          {SECCIONES_CONFIG.seccion4.map((item) => {
            const value = item.key ? boolLabel(formValues[item.key]) : "N/A";
            return (
              <View key={item.key ?? `${item.num}-${item.title}`} style={styles.apartadoRow}>
                <View style={[styles.apartadoLeft, { marginLeft: item.level ? 10 : 0 }]}>
                  <Text style={styles.apartadoNum}>{item.num}</Text>
                </View>
                <View style={styles.apartadoRight}>
                  <Text style={styles.apartadoTitle}>
                    {item.title} {"  "}
                    <Text style={styles.apartadoValue}>[{value}]</Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* SECCIÓN 5 */}
        <Text style={styles.subtitle}>SECCIÓN 5: Zona de vuelo</Text>
        {imagenZonaVueloUrl ? (
          <Image src={imagenZonaVueloUrl} style={styles.image} />
        ) : (
          <Text>Sin imagen adjunta.</Text>
        )}

        {/* SECCIÓN 6 */}
        <Text style={styles.subtitle}>SECCIÓN 6: Requisitos y limitaciones en la zona de vuelo</Text>
        <View style={styles.box}>
          {SECCIONES_CONFIG.seccion6.map((item) => {
            const value = item.key ? boolLabel(formValues[item.key]) : "N/A";
            return (
              <View key={item.key ?? `${item.num}-${item.title}`} style={styles.apartadoRow}>
                <View style={[styles.apartadoLeft, { marginLeft: item.level ? 10 : 0 }]}>
                  <Text style={styles.apartadoNum}>{item.num}</Text>
                </View>
                <View style={styles.apartadoRight}>
                  <Text style={styles.apartadoTitle}>
                    {item.title} {"  "}
                    <Text style={styles.apartadoValue}>[{value}]</Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* 6.3 */}
        <Text style={styles.subtitle}>
          6.3 - Otras limitaciones operacionales: {formValues.otrasLimitacionesValor || "N/A"}
        </Text>

        {String(formValues.otrasLimitacionesValor ?? "N/A") === "SI" && otrasItems.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.th}>Descripción</Text>
              <Text style={styles.thLast}>Resultado</Text>
            </View>
            {otrasItems.map((row, idx) => (
              <View style={styles.tr} key={`${idx}-${row.descripcion}`}>
                <Text style={styles.td}>{row.descripcion || "—"}</Text>
                <Text style={styles.tdLast}>{row.valor || "N/A"}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text>No aplica / sin elementos.</Text>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generado{generatedAt ? `: ${generatedAt}` : ""}</Text>
          <Text>Apéndice 4</Text>
        </View>
      </Page>
    </Document>
  );
}