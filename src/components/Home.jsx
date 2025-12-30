import { useEffect, useState } from "react";
import { getCars } from "../services/carService";
import { Link } from "react-router-dom";

const PAGE_SIZE = 6;
const BRAND_CHIP_LIMIT = 8;

const Home = () => {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState("All");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getCars();
      setCars(data);
      setLoading(false);
    };
    load();
  }, []);

  const brands = ["All", ...new Set(cars.map((c) => c.brand))];

  const filtered = cars.filter((c) => {
    const t = search.toLowerCase();
    const matchSearch =
      c.brand.toLowerCase().includes(t) || c.model.toLowerCase().includes(t);

    const matchBrand = brand === "All" || c.brand === brand;
    return matchSearch && matchBrand;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, brand]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ---------- HERO ---------- */}
      <div className="mb-10 rounded-3xl bg-gradient-to-br from-indigo-50 to-white p-6 sm:p-8 border">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          Discover <span className="text-indigo-600">Luxury Cars</span>
        </h1>
        <p className="mt-2 text-gray-600 max-w-xl">
          Browse premium vehicles, compare models, and send inquiries instantly.
        </p>
      </div>

      {/* ---------- SEARCH + FILTER BAR ---------- */}
      <div className="mb-8 rounded-2xl border bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-9 pr-4 py-2.5 text-sm
            focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
            placeholder="Search by brand or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Brand filter */}
        {brands.length <= BRAND_CHIP_LIMIT ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition
                  ${
                    brand === b
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {b}
              </button>
            ))}
          </div>
        ) : (
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm
            focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ---------- GRID ---------- */}
      {loading ? (
        <SkeletonGrid />
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <i className="fa-solid fa-car text-5xl mb-4"></i>
          <p className="text-sm font-medium">No cars found</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((car) => (
            <div
              key={car.id}
              className="group rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg p-5 flex flex-col"
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={car.coverImage || "/placeholder-car.jpg"}
                  alt={`${car.brand} ${car.model}`}
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                <span
                  className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold
                  ${
                    car.available
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {car.available ? "Available" : "Sold"}
                </span>
              </div>

              {/* INFO */}
              <div className="mt-4 flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {car.brand}{" "}
                  <span className="text-indigo-600">{car.model}</span>
                </h2>

                <p className="mt-2 text-emerald-700 font-bold text-xl">
                  ₹{car.price}
                </p>

                <p className="text-sm text-gray-500 mt-1">Year: {car.year}</p>
              </div>

              {/* CTA */}
              <Link
                to={`/cars/${car.id}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View details
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ---------- PAGINATION ---------- */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="rounded-lg px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          >
            Prev
          </button>

          <span className="rounded-lg px-4 py-2 text-sm font-semibold bg-indigo-600 text-white">
            {page}
          </span>

          <span className="text-sm text-gray-500">of {totalPages}</span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="rounded-lg px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;

/* ---------- SKELETON GRID ---------- */
const SkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-2xl border bg-white p-5 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    ))}
  </div>
);
