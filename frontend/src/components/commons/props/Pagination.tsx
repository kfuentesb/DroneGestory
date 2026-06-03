import arrow_back_black from '../../../assets/commons/arrow_back_black.svg';
import arrow_forward_black from '../../../assets/commons/arrow_forward_black.svg';

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
    if (newPage < 1 || newPage > totalPages) return;
    onPageChange(newPage);

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 0);
  };

  return (
    <div className="d-flex flex-column align-items-center gap-2 mt-2 mb-2">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          disabled={currentPage <= 1} // Deshabilitado en pagina 1
          onClick={() => handleInternalPageChangeSmooth(currentPage - 1)}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
          style={{ borderRadius: "6px", minWidth: "32px", height: "32px" }}
        >
          <img
            src={arrow_back_black}
            alt="Anterior"
            className="d-inline d-sm-none"
            style={{ width: "16px", height: "16px" }}
          />
          <span className="d-none d-sm-inline">Anterior</span>
        </button>

        <span className="small fw-medium text-secondary">
          Página <b className="text-dark">{currentPage}</b> de {totalPages}
        </span>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
          onClick={() => handleInternalPageChangeSmooth(currentPage + 1)}
          disabled={currentPage >= totalPages} // Deshabilitado al final o superior
          style={{ borderRadius: "6px", minWidth: "32px", height: "32px" }}
        >
          <span className="d-none d-sm-inline">Siguiente</span>
          <img
            src={arrow_forward_black}
            alt="Siguiente"
            className="d-inline d-sm-none"
            style={{ width: "16px", height: "16px" }}
          />
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
