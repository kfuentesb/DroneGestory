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
  renderExpandedRow?: (row: T) => React.ReactNode;
  isRowExpanded?: (row: T) => boolean;
  expandedRowColSpan?: number;
  expandedRowClassName?: (row: T) => string;
  expandedRowStyle?: (row: T) => React.CSSProperties;
  emptyText?: string;
  onRowClick?: (row: T) => void;
  onRowMouseEnter?: (row: T) => void;
  onRowMouseLeave?: (row: T) => void;
  rowStyle?: (row: T) => React.CSSProperties;
  rowClassName?: (row: T) => string;
};

export function ReusableTable<T>({
  headers,
  rows,
  renderRow,
  renderExpandedRow,
  isRowExpanded,
  expandedRowColSpan,
  expandedRowClassName,
  expandedRowStyle,
  emptyText = "Sin datos.",
  onRowClick,
  onRowMouseEnter,
  onRowMouseLeave,
  rowStyle,
  rowClassName,
  // New optional props for external sorting
  sortConfig: externalSortConfig,
  onRequestSort: externalRequestSort,
}: ReusableTableProps<T> & { sortConfig?: { key: string; direction: "asc" | "desc" } | null; onRequestSort?: (key: string) => void }) {

  // Internal sort state used only when parent does not provide external handlers
  const [internalSortConfig, setInternalSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const requestSort = (key: string) => {
    if (externalRequestSort) {
      externalRequestSort(key);
      return;
    }

    let direction: "asc" | "desc" = "asc";
    if (internalSortConfig && internalSortConfig.key === key && internalSortConfig.direction === "asc") {
      direction = "desc";
    }
    setInternalSortConfig({ key, direction });
  };

  const activeSort = externalSortConfig ?? internalSortConfig;

  const sortedRows = useMemo(() => {
    let sortableItems = [...rows];
    if (activeSort !== null && activeSort !== undefined) {
      sortableItems.sort((a, b) => {
        const aValue = (a as any)[activeSort.key];
        const bValue = (b as any)[activeSort.key];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return activeSort.direction === "asc" ? -1 : 1;
        if (bValue == null) return activeSort.direction === "asc" ? 1 : -1;

        if (aValue < bValue) return activeSort.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return activeSort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [rows, activeSort]);

  const getSortIcon = (key: string) => {
    if (activeSort?.key !== key) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="#6c757d" className="ms-2" viewBox="0 0 16 16">
          <path d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" transform="rotate(90 8 8)"/>
          <path d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" transform="rotate(-90 8 8)"/>
        </svg>
      );
    }
    return activeSort?.direction === "asc" ? (
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
              const rowKey = (row as any).id ?? idx;
              const customStyle = rowStyle ? rowStyle(row) : undefined;
              const customClass = rowClassName ? rowClassName(row) : undefined;
              const expandedClass = expandedRowClassName ? expandedRowClassName(row) : undefined;
              const expandedStyle = expandedRowStyle ? expandedRowStyle(row) : undefined;
              const isExpanded = isRowExpanded ? isRowExpanded(row) : false;

              return (
                <React.Fragment key={rowKey}>
                  <tr
                    className={customClass}
                    style={{ cursor: onRowClick ? "pointer" : "default", ...customStyle }}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onMouseEnter={onRowMouseEnter ? () => onRowMouseEnter(row) : undefined}
                    onMouseLeave={onRowMouseLeave ? () => onRowMouseLeave(row) : undefined}
                  >
                    {renderRow(row)}
                  </tr>
                  {renderExpandedRow && isExpanded && (
                    <tr className={expandedClass} style={expandedStyle}>
                      <td colSpan={expandedRowColSpan ?? headers.length}>
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}