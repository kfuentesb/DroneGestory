import { formatDateTime } from "../../operations/operation.utils";
import { useUserTimezone } from "../hooks/useUserTimezone";

export function useFormatDate() {
  const { timezone } = useUserTimezone();

  return {
    format: (isoString: string | null | undefined): string =>
      formatDateTime(isoString, timezone),
  };
}
