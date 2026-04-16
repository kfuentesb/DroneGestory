type PaginationProps = {
  totalItems: number;
  currentPage: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  totalItems,
  currentPage,
  itemsPerPage = 10,
  onPageChange,
}: PaginationProps) {
  // descomentar para mostrar solo cuando minimo haya 10 items
  if (totalItems <= itemsPerPage) return null;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const showPageSelect = totalPages >= 3;

  const handleInternalPageChangeSmooth = (newPage: number) => {
    onPageChange(newPage);
    
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 0);
  };

  return (
    <div className="d-flex flex-column align-items-center gap-2 mt-4">
      {/* Top Row: Navigation Buttons and Status */}
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          disabled={currentPage === 1}
          onClick={() => handleInternalPageChangeSmooth(currentPage - 1)}
          style={{ borderRadius: "6px" }}
        >
          Anterior
        </button>

        <span className="small fw-medium text-secondary">
          Página <b className="text-dark">{currentPage}</b> de {totalPages}
        </span>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          disabled={currentPage === totalPages}
          onClick={() => handleInternalPageChangeSmooth(currentPage + 1)}
          style={{ borderRadius: "6px" }}
        >
          Siguiente
        </button>
      </div>

      {/* Bottom Row: Page Selector */}
      {showPageSelect && (
        <div className="d-flex align-items-center gap-2 mt-1">
          <small className="text-muted" style={{ fontSize: "0.75rem" }}>Ir a la página:</small>
          <select
            className="form-select form-select-sm shadow-none"
            style={{ 
                width: "70px", 
                cursor: "pointer", 
                borderColor: "#D1D5DB",
                fontSize: "0.8rem" 
            }}
            value={currentPage}
            onChange={(e) => handleInternalPageChangeSmooth(Number(e.target.value))}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
