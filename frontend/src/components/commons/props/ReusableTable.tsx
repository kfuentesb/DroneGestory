import React, { useState, useMemo } from "react";

export type TableHeader = {
  label: string;
  key: string;
  sortable?: boolean;
};

type ReusableTableProps<T> = {
  // headers: React.ReactNode[];
  headers: TableHeader[];
  rows: T[];
  renderRow: (row: T) => React.ReactNode;
  emptyText?: string;
  onRowClick?: (row: T) => void;
  rowStyle?: (row: T) => React.CSSProperties;
  rowClassName?: (row: T) => string;
};

export function ReusableTable<T>({
  headers,
  rows,
  renderRow,
  emptyText = "Sin datos.",
  onRowClick,
  rowStyle,
  rowClassName
}: ReusableTableProps<T>) {

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedRows = useMemo(() => {
    let sortableItems = [...rows];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [rows, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#6c757d" className="ms-2" viewBox="0 0 16 16">
          <path d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" transform="rotate(90 8 8)"/>
          <path d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" transform="rotate(-90 8 8)"/>
        </svg>
      );
    }
    return sortConfig.direction === "asc" ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="ms-2" viewBox="0 0 16 16">
        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="ms-2" viewBox="0 0 16 16">
        <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
      </svg>
    );
  };

  return (
    <div className="table-responsive">
      <table className="table table-sm table-bordered table-hover align-middle" 
        style={{ borderColor: "#E5E7EB", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
        <thead className="table-dark text-center">
          <tr>
            
            {headers.map((h, i) => (
              <th key={i} 
                onClick={h.sortable !== false ? () => requestSort(h.key) : undefined}
                style={{ cursor: h.sortable !== false ? "pointer" : "default", userSelect: "none" }}>
                <div className="d-flex align-items-center justify-content-center">
                  {h.label}
                  {h.sortable !== false && getSortIcon(h.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-start">
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center text-muted py-4">
                {emptyText}
              </td>
            </tr>
          ) : (
            sortedRows.map((row, idx) => {
              const customStyle = rowStyle ? rowStyle(row) : undefined;
              const customClass = rowClassName ? rowClassName(row) : undefined;
              return (
                <tr key={(row as any).id ?? idx}
                  className={customClass}
                  style={{ cursor: onRowClick ? "pointer" : "default", ...customStyle }}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {renderRow(row)}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}