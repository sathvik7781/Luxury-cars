import { useState } from "react";

const AdminTableSkeleton = ({ rows = 6 }) => (
  <>
    {/* Desktop skeleton */}
    <tbody className="hidden md:table-row-group">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 5 }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded bg-white/10" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>

    {/* Mobile skeleton */}
    <div className="md:hidden space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-[#1a1a22] border border-white/10 p-4 animate-pulse"
        >
          <div className="h-4 w-2/3 bg-white/10 rounded mb-2" />
          <div className="h-3 w-1/2 bg-white/10 rounded mb-3" />
          <div className="flex justify-between">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-6 w-16 bg-white/10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </>
);

const AdminTable = ({
  loading,
  paginated,
  onEdit,
  onDelete,
  sortPrice,
  setSortPrice,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#121217] shadow-sm overflow-x-auto">
      {/* ---------- DESKTOP TABLE ---------- */}
      <div className="hidden md:block">
        <table className="w-full text-sm table-auto">
          <thead>
            <tr className="bg-[#1a1a22] text-white/70">
              <th className="px-4 py-3 text-left font-semibold">Brand</th>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th
                onClick={() =>
                  setSortPrice((p) =>
                    p === "asc" ? "desc" : p === "desc" ? null : "asc"
                  )
                }
                className="px-4 py-3 text-left font-semibold cursor-pointer select-none"
              >
                Price
                {sortPrice === "asc" && (
                  <i className="fa-solid fa-arrow-up text-xs ml-1"></i>
                )}
                {sortPrice === "desc" && (
                  <i className="fa-solid fa-arrow-down text-xs ml-1"></i>
                )}
              </th>
              <th className="px-4 py-3 text-left font-semibold">Year</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && <AdminTableSkeleton />}

            {!loading && paginated.length === 0 && (
              <tr>
                <td colSpan="5" className="p-10 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <i className="fa-solid fa-car text-4xl"></i>
                    <p className="text-sm font-medium">No cars found</p>
                    <p className="text-xs">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!loading &&
              paginated.map((car, idx) => (
                <tr
                  key={car.id}
                  className={`cursor-pointer transition border-b border-white/5 last:border-none ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-white/5"
                  } hover:bg-white/10`}
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {car.brand}
                  </td>
                  <td className="px-4 py-3 text-white/70">{car.model}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-400">
                    ₹{car.price}
                  </td>
                  <td className="px-4 py-3 text-white/60">{car.year}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(car)}
                        className="rounded-full px-3 py-1 text-xs font-semibold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        onClick={() => onDelete(car.id)}
                        className="rounded-full px-3 py-1 text-xs font-semibold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* ---------- MOBILE LIST ---------- */}
      <div className="md:hidden space-y-3">
        {loading && <AdminTableSkeleton />}
        {!loading && paginated.length === 0 && (
          <div className="md:hidden p-10 text-center text-white/40">
            No cars found
          </div>
        )}
        {paginated.map((car) => (
          <div
            key={car.id}
            className="rounded-xl bg-[#121217] border border-white/10 p-4
      hover:bg-white/5 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-white">{car.brand}</p>
                <p className="text-sm text-white/60">{car.model}</p>
              </div>

              <span className="font-semibold text-emerald-400">
                ₹{car.price}
              </span>
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-white/40">Year: {car.year}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(car)}
                  className="rounded-full px-3 py-1 text-xs
            bg-amber-500/20 text-amber-400"
                >
                  <i className="fa-solid fa-pen" />
                </button>
                <button
                  onClick={() => onDelete(car.id)}
                  className="rounded-full px-3 py-1 text-xs
            bg-rose-500/20 text-rose-400"
                >
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTable;
