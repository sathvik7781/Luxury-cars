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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-zinc-100">
      {/* ---------- HERO ---------- */}
      <div className="mb-14 animate-fade-up">
        <div
          className="relative h-[480px] rounded-3xl overflow-hidden shadow-lg"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(24,24,27,0.85), rgba(24,24,27,0.3)), url('/hero-car.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="h-full flex items-center px-6 sm:px-12">
            <div className="max-w-xl">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">
                Discover <span className="text-[#c9a24d]">Luxury Cars</span>
              </h1>
              <p className="mt-4 text-zinc-200">
                Browse premium vehicles, compare models, and send inquiries
                instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- SEARCH + FILTER ---------- */}
      <div className="mb-16 rounded-3xl bg-zinc-900/80 border border-zinc-800 px-6 py-8">
        <div className="rounded-2xl bg-white shadow-xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative max-w-md w-full">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm"></i>
            <input
              aria-label="Search cars"
              className="w-full rounded-xl bg-zinc-100/80 pl-9 pr-4 py-2.5 text-sm text-zinc-800
              placeholder:text-zinc-400
              focus:bg-white focus:ring-2 focus:ring-[#c9a24d]/30 outline-none transition"
              placeholder="Search by brand or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {brands.length <= BRAND_CHIP_LIMIT ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {brands.map((b) => (
                <button
                  key={b}
                  aria-label={`Filter by ${b}`}
                  onClick={() => setBrand(b)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition
                    ${
                      brand === b
                        ? "bg-[#c9a24d]/90 text-white shadow-sm"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
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
              className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm text-zinc-800
              focus:ring-2 focus:ring-[#c9a24d]/30 outline-none transition"
            >
              {brands.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          )}

          <span className="ml-auto text-sm text-zinc-600">
            {filtered.length} cars found
          </span>
        </div>
      </div>

      {/* ---------- GRID ---------- */}
      {loading ? (
        <SkeletonGrid />
      ) : paginated.length === 0 ? (
        <div className="flex justify-center py-24">
          <div className="rounded-2xl bg-zinc-800 border border-zinc-700 px-8 py-10 text-center">
            <i className="fa-solid fa-car-side text-4xl text-zinc-400 mb-4"></i>
            <p className="text-sm font-semibold text-white">
              No cars match your search
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Try adjusting filters or clearing your search
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-zinc-900/80 border border-zinc-800 px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((car) => (
              <Link
                to={`/cars/${car.id}`}
                key={car.id}
                className="group rounded-2xl bg-white shadow-md transition-all duration-300
                hover:-translate-y-1 hover:shadow-xl p-5 flex flex-col"
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    loading="lazy"
                    src={car.coverImage || "/placeholder-car.jpg"}
                    alt={`${car.brand} ${car.model}`}
                    className="h-44 w-full object-cover
                    transition duration-700
                    blur-sm group-hover:blur-0 group-hover:scale-110"
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

                <div className="mt-4 flex-1">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {car.brand}{" "}
                    <span className="text-zinc-700">{car.model}</span>
                  </h2>
                  <p className="mt-2 text-emerald-700 font-bold text-xl">
                    ₹{car.price}
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">Year: {car.year}</p>
                </div>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#c9a24d] group-hover:gap-2 transition-all">
                  View details
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ---------- PAGINATION ---------- */}
      {totalPages > 1 && (
        <div className="mt-14 flex justify-center">
          <div className="rounded-full bg-zinc-900 border border-zinc-800 px-6 py-3 flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-full px-5 py-2 text-sm font-medium
              bg-zinc-100 text-zinc-700 hover:bg-zinc-200
              disabled:opacity-40 transition"
            >
              Prev
            </button>

            <span className="rounded-full px-5 py-2 text-sm font-semibold bg-[#c9a24d]/90 text-white">
              {page}
            </span>

            <span className="text-sm text-zinc-500">of {totalPages}</span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-full px-5 py-2 text-sm font-medium
              bg-zinc-100 text-zinc-700 hover:bg-zinc-200
              disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
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
      <div
        key={i}
        className="rounded-2xl bg-white/70 backdrop-blur-xl shadow-md p-5 animate-pulse"
      >
        <div className="h-44 rounded-xl bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200 mb-4"></div>
        <div className="h-5 rounded bg-zinc-200 w-2/3 mb-3"></div>
        <div className="h-6 rounded bg-zinc-200 w-1/2 mb-4"></div>
        <div className="h-4 rounded bg-zinc-200 w-1/3"></div>
      </div>
    ))}
  </div>
);
