import { useState } from "react";
import "./pagination.css";

export default function Pagination() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <nav className="pagination">
      {[1, 2, 3, 4, 5].map((page) => (
        <button
          key={page}
          className={`page-button ${
            currentPage === page ? "active" : ""
          }`}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      ))}
    </nav>
  );
}