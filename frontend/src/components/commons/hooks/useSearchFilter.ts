import { useMemo } from "react";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();

type Selector<T> = (item: T) => string | number | Array<string | number | null | undefined> | null | undefined;

export function useSearchFilter<T>(items: T[], query: string, selector: Selector<T>): T[] {
  const normalizedQuery = normalize(query || "");

  return useMemo(() => {
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const selected = selector(item);
      const values = Array.isArray(selected) ? selected : [selected];
      return values.some((v) => {
        if (v === null || v === undefined) return false;
        return normalize(String(v)).includes(normalizedQuery);
      });
    });
  }, [items, normalizedQuery, selector]);
}
