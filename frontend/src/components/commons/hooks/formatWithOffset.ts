export function applyOffset(isoString: string, offset: string): Date {
  const match = offset.match(/([+-])(\d{2}):(\d{2})/);
  if (!match) return new Date(isoString);

  const [, sign, hours, minutes] = match;
  const offsetMs = (parseInt(hours) * 60 + parseInt(minutes)) * 60 * 1000;
  const utcTime = new Date(isoString).getTime();

  return new Date(utcTime + (sign === "+" ? offsetMs : -offsetMs));
}

export function formatWithOffset(
  isoString: string | null | undefined,
  offset: string
): string {
  if (!isoString) return "-";

  const d = applyOffset(isoString, offset);

  const day = d.getUTCDate().toString().padStart(2, "0");
  const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = d.getUTCFullYear().toString().slice(-2);
  const hour = d.getUTCHours().toString().padStart(2, "0");
  const minute = d.getUTCMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year}, ${hour}:${minute}`;
}

export function getBrowserOffset(): string {
  const offsetMinutes = new Date().getTimezoneOffset();
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60).toString().padStart(2, "0");
  const m = (abs % 60).toString().padStart(2, "0");
  const sign = offsetMinutes <= 0 ? "+" : "-";
  return `${sign}${h}:${m}`;
}