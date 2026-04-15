import { useEffect, useState } from "react";

/**
 * Normalizes a datetime-local string to "YYYY-MM-DDTHH:MM" format.
 * Shared across all Anexo forms that have date fields.
 */
export function normalizeDateTimeLocal(value: string | null | undefined): string {
  if (!value) return "";
  const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return match ? match[1] : value;
}

/**
 * Normalizes initial values from the API into form-friendly string values.
 * Converts booleans to "true"/"false", nulls to "", and normalizes dates.
 *
 * @param initialValues - raw values from the API
 * @param fields - list of field keys to normalize
 * @param defaultValues - default empty form values
 * @param dateFields - field keys that should be treated as datetime-local
 */
export function normalizeFormValues<K extends string>(
  initialValues: Record<string, unknown> | null | undefined,
  fields: readonly K[],
  defaultValues: Record<K, string>,
  dateFields: readonly string[] = ["fechaOp", "fechaHoraPrevista"],
): Record<K, string> {
  if (!initialValues) return { ...defaultValues };

  const normalized: Record<K, string> = { ...defaultValues };
  fields.forEach((key) => {
    const value = initialValues[key];
    if (dateFields.includes(key)) {
      normalized[key] = normalizeDateTimeLocal(value as string | null | undefined);
      return;
    }
    if (value === null || value === undefined) {
      normalized[key] = "";
      return;
    }
    if (typeof value === "boolean") {
      normalized[key] = String(value);
      return;
    }
    normalized[key] = String(value);
  });
  return normalized;
}

type UseAnexoFormOptions<K extends string> = {
  /** List of form field keys */
  fields: readonly K[];
  /** Default empty form values */
  defaultValues: Record<K, string>;
  /** Initial values from the API (may change over time) */
  initialValues?: Record<string, unknown> | null;
  /** Field keys that should be treated as datetime-local */
  dateFields?: readonly string[];
};

/**
 * Shared hook for Anexo form state management.
 * Handles form values initialization, normalization, and change tracking.
 */
export function useAnexoForm<K extends string>({
  fields,
  defaultValues,
  initialValues,
  dateFields,
}: UseAnexoFormOptions<K>) {
  const [formValues, setFormValues] = useState<Record<K, string>>(() =>
    normalizeFormValues(initialValues, fields, defaultValues, dateFields),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormValues(normalizeFormValues(initialValues, fields, defaultValues, dateFields));
    // fields, defaultValues, and dateFields are constant config arrays defined outside
    // the component — they never change between renders, so only initialValues is needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  return { formValues, setFormValues, saving, setSaving, handleChange };
}
