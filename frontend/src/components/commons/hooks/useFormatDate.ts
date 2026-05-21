import { formatWithOffset } from "./formatWithOffset";
import { useUserTimezone } from "../hooks/useUserTimezone";

export function useFormatDate() {
  const { timezone } = useUserTimezone();

  return {
    format: (isoString: string | null | undefined): string =>
      formatWithOffset(isoString, timezone),
  };
}