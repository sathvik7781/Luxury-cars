import { useEffect, useState, useMemo } from "react";
import { getCars } from "../services/carService";
import { Link } from "react-router-dom";

const PAGE_SIZE = 6;
const BRAND_CHIP_LIMIT = 8;

const formatPrice = (price) => new Intl.NumberFormat("en-IN").format(price);

const Home = () => {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState("All");
  const [showMoreBrands, setShowMoreBrands] = useState(false);

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getCars();
      setCars(data);
      setLoading(false);
    };
    load();
  }, []);

  /* ---------------- DEBOUNCE SEARCH ---------------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  const brands = useMemo(
    () => ["All", ...new Set(cars.map((c) => c.brand))],
    [cars]
  );

  const visibleBrands = brands.slice(0, BRAND_CHIP_LIMIT - 1);
  const extraBrands = brands.slice(BRAND_CHIP_LIMIT - 1);

  const filtered = useMemo(() => {
    const t = debouncedSearch.toLowerCase();
    return cars.filter((c) => {
      const matchSearch =
        c.brand.toLowerCase().includes(t) || c.model.toLowerCase().includes(t);
      const matchBrand = brand === "All" || c.brand === brand;
      return matchSearch && matchBrand;
    });
  }, [cars, debouncedSearch, brand]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => setPage(1), [debouncedSearch, brand]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-zinc-100">
      {/* ---------- RESPONSIVE LUXURY HERO ---------- */}
      <section className="mb-24">
        <div
          className="
      relative overflow-hidden
      rounded-[2rem] sm:rounded-[3rem]
      min-h-[60vh] sm:min-h-[70vh] lg:min-h-[520px]
      flex items-center
    "
          style={{
            backgroundImage: "url('/hero-car.png')",
            backgroundSize: "cover",
            backgroundPosition: "center right",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

          {/* Content */}
          <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16">
            <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
              <h1
                className="
            text-4xl sm:text-5xl lg:text-6xl
            font-semibold tracking-tight
            text-white
          "
              >
                Curated <span className="text-[#c9a24d]">Luxury</span>
              </h1>

              <p className="mt-5 text-sm sm:text-base text-zinc-300 leading-relaxed">
                A handpicked collection of premium vehicles crafted for
                discerning drivers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CURATED COLLECTION ---------- */}
      <section className="relative">
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-black/90 backdrop-blur-xl" />
        <div className="relative px-10 py-16">
          {/* Header */}
          <div className="mb-14 flex flex-col lg:flex-row lg:items-end gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold tracking-wide">
                Curated Collection
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Explore vehicles selected for performance, comfort, and design.
              </p>
            </div>

            <input
              placeholder="Search by brand or model"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full lg:max-w-sm rounded-full
                bg-black/60 border border-white/10
                px-6 py-3 text-sm text-white
                placeholder:text-zinc-400
                focus:outline-none focus:ring-2 focus:ring-[#c9a24d]/30
                transition
              "
            />
          </div>

          {/* Brand filter */}
          {/* Brand filter */}
          <div className="relative mb-14 flex items-center gap-4 overflow-x-auto">
            {/* Visible brands */}
            {visibleBrands.map((b) => (
              <button
                key={b}
                onClick={() => {
                  setBrand(b);
                  setShowMoreBrands(false);
                }}
                className={`rounded-full px-6 py-2 text-sm tracking-wide transition
        ${
          brand === b
            ? "bg-[#c9a24d]/90 text-black"
            : "text-zinc-300 hover:text-white"
        }`}
              >
                {b}
              </button>
            ))}

            {/* More brands */}
            {extraBrands.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreBrands((p) => !p)}
                  className={`
          rounded-full px-6 py-2 text-sm tracking-wide transition
          ${
            showMoreBrands
              ? "bg-white/10 text-white"
              : "text-zinc-300 hover:text-white"
          }
        `}
                >
                  More brands
                  <i className="fa-solid fa-chevron-down ml-2 text-xs" />
                </button>

                {/* Dropdown */}
                {showMoreBrands && (
                  <div
                    className="
            absolute left-0 mt-3 w-56 max-h-72 overflow-auto
            rounded-2xl bg-black/90 backdrop-blur-xl
            border border-white/10 shadow-2xl
            p-2 z-30
          "
                  >
                    {extraBrands.map((b) => (
                      <button
                        key={b}
                        onClick={() => {
                          setBrand(b);
                          setShowMoreBrands(false);
                        }}
                        className={`
                w-full text-left rounded-xl px-4 py-2 text-sm transition
                ${
                  brand === b
                    ? "bg-[#c9a24d]/90 text-black"
                    : "text-zinc-300 hover:bg-white/10 hover:text-white"
                }
              `}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <SkeletonGrid />
          ) : filtered.length === 0 ? (
            <div className="py-32 text-center text-zinc-400">
              No vehicles match your selection.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {paginated.map((car) => (
                <Link
                  to={`/cars/${car.id}`}
                  key={car.id}
                  className="group relative overflow-hidden rounded-[2.5rem] focus:outline-none"
                >
                  <img
                    src={car.coverImage || "/placeholder-car.jpg"}
                    alt={`${car.brand} ${car.model}`}
                    loading="lazy"
                    className="
                      h-[360px] w-full object-cover
                      transition-transform duration-[900ms]
                      group-hover:scale-[1.04]
                    "
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="absolute bottom-0 p-7 w-full transition-all duration-500 group-hover:translate-y-[-4px]">
                    <h3 className="text-xl font-medium text-white tracking-wide">
                      {car.brand}
                      <span className="ml-2 text-zinc-300 font-normal">
                        {car.model}
                      </span>
                    </h3>

                    <p className="mt-2 text-[#c9a24d] text-lg font-semibold">
                      ₹{formatPrice(car.price)}
                    </p>

                    <div className="mt-4 flex justify-between text-xs text-zinc-300">
                      <span>{car.year}</span>
                      <span
                        className={`px-3 py-1 rounded-full
                          ${
                            car.available
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                      >
                        {car.available ? "Available" : "Sold"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- PAGINATION ---------- */}
      {totalPages > 1 && (
        <div className="mt-20 flex justify-center">
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="hover:text-white disabled:opacity-30"
            >
              ← Previous
            </button>

            <span className="text-[#c9a24d] font-medium">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="hover:text-white disabled:opacity-30"
            >
              Next →
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
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="h-[360px] rounded-[2.5rem] bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse"
      />
    ))}
  </div>
);
