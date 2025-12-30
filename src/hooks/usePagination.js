import { useState } from "react";

const usePagination = (data, pageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const next = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prev = () => setCurrentPage((p) => Math.max(p - 1, 1));

  return { paginatedData, currentPage, totalPages, next, prev, setCurrentPage };
};

export default usePagination;
