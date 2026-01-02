const Pagination = ({ page, setPage, totalPages }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={page === 1}
        className="rounded-lg px-3 py-2 text-sm bg-[#1a1a22] text-white/70 hover:bg-white/10 disabled:opacity-40"
      >
        <i className="fa-solid fa-chevron-left text-xs mr-1"></i>
        Prev
      </button>

      <span className="rounded-lg px-4 py-2 text-sm font-semibold bg-[#c9a24d] text-black">
        {page}
      </span>

      <span className="text-sm text-white/40">of {totalPages}</span>

      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={page === totalPages}
        className="rounded-lg px-3 py-2 text-sm bg-[#1a1a22] text-white/70 hover:bg-white/10 disabled:opacity-40"
      >
        Next
        <i className="fa-solid fa-chevron-right text-xs ml-1"></i>
      </button>
    </div>
  );
};

export default Pagination;
