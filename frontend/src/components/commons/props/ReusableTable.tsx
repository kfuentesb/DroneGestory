import React from "react";

type ReusableTableProps<T> = {
  headers: React.ReactNode[];
  rows: T[];
  renderRow: (row: T) => React.ReactNode;
  emptyText?: string;
  onRowClick?: (row: T) => void;
};

export function ReusableTable<T>({
  headers,
  rows,
  renderRow,
  emptyText = "Sin datos.",
  onRowClick,
}: ReusableTableProps<T>) {
  return (
    <div className="table-responsive">
      <table
        className="table table-bordered table-hover align-center"
        style={{ borderColor: "#E5E7EB" }}
      >
        <thead className="table-dark">
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center text-muted">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={(row as any).id ?? idx}
                style={{ cursor: onRowClick ? "pointer" : "default" }}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {renderRow(row)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}