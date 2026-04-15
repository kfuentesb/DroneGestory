/**
 * Shared section title component used across all Anexo form details.
 * Renders a styled heading for form sections.
 */
export function SectionTitle({ children }: { children: string }) {
  return <h4 className="fw-bold mt-5 mb-3 pb-2 border-bottom text-success">{children}</h4>;
}
