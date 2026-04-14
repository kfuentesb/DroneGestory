type BooleanLikeValue = unknown;

const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

export function toBooleanLike(value: BooleanLikeValue): boolean | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "object" && value !== null && "value" in (value as Record<string, unknown>)) {
    return toBooleanLike((value as { value: unknown }).value);
  }

  const normalized = normalize(String(value));
  const letters = normalized.replace(/[^a-z]/g, "");
  if (
    ["true", "si", "yes", "activo"].includes(normalized) ||
    ["true", "si", "yes", "activo"].includes(letters) ||
    letters.startsWith("s") ||
    letters.startsWith("act")
  ) {
    return true;
  }
  if (
    ["false", "no", "inactivo"].includes(normalized) ||
    ["false", "no", "inactivo"].includes(letters) ||
    letters.startsWith("n") ||
    letters.startsWith("ina")
  ) {
    return false;
  }

  return null;
}

export function getAircraftDocumentationFlags(values: {
  hasEnsurance?: unknown;
  hasFTS?: unknown;
  hasParachute?: unknown;
}) {
  return {
    showInsuranceDocumentation: toBooleanLike(values.hasEnsurance) === true,
    showFTSDocumentation: toBooleanLike(values.hasFTS) === true,
    showParachuteDocumentation: toBooleanLike(values.hasParachute) === true,
  };
}

// export function getAircraftModelDocumentationFlags(values: {
//   hasEnsurance?: unknown;
//   hasFTS?: unknown;
//   hasParachute?: unknown;
// }) {
//   return {
//     showInsuranceDocumentation: toBooleanLike(values.hasEnsurance) === true,
//     showFTSDocumentation: toBooleanLike(values.hasFTS) === true,
//     showParachuteDocumentation: toBooleanLike(values.hasParachute) === true,
//   };
// }

export function getAircraftModelDocumentationFlags(values: any) {
  return {
    showInsuranceDocumentation: false,
    showFTSDocumentation: toBooleanLike(values.hasFTS || values.fts) === true,
    showParachuteDocumentation: toBooleanLike(values.hasParachute || values.parachute) === true,
  };
}