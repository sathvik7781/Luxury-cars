import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Keyboard } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const formatPrice = (value) =>
  value?.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "cars", id));
        if (!snap.exists()) {
          setError(true);
        } else {
          setCar(snap.data());
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 animate-pulse">
        <div className="h-[420px] rounded-[2.5rem] bg-zinc-800 mb-10" />
        <div className="h-8 w-1/3 bg-zinc-700 rounded mb-4" />
        <div className="h-6 w-1/4 bg-zinc-700 rounded" />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="text-zinc-400 mb-6">
          This vehicle is no longer available.
        </p>
        <button
          onClick={() => navigate("/")}
          className="rounded-full border border-white/10 px-6 py-2 text-sm text-white hover:border-white/20 transition"
        >
          Back to collection
        </button>
      </div>
    );
  }

  const images = (() => {
    const imgs = [];

    if (car.coverImage) {
      imgs.push(car.coverImage);
    }

    if (Array.isArray(car.images)) {
      car.images.forEach((img) => {
        if (img && img !== car.coverImage) {
          imgs.push(img);
        }
      });
    }

    return imgs.length > 0 ? imgs : ["/placeholder-car.jpg"];
  })();

  const handleInquiry = () => {
    if (!car.available) return;
    user ? navigate(`/cars/${id}/inquiry`) : navigate("/login");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-32 sm:pb-16">
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
      >
        <i className="fa-solid fa-arrow-left text-xs" />
        Back to collection
      </button>

      {/* IMAGE GALLERY */}
      <div className="mb-8 sm:mb-10">
        <div className="rounded-[2.75rem] border border-white/10 shadow-2xl overflow-hidden">
          <Swiper
            initialSlide={0}
            modules={[Pagination, Keyboard]}
            pagination={{ clickable: true }}
            keyboard={{ enabled: true }}
            slidesPerView={1}
            spaceBetween={20}
            onSwiper={(s) => (swiperRef.current = s)}
            onSlideChange={(s) => setActiveIndex(s.activeIndex)}
            className="rounded-[2.5rem] overflow-hidden"
          >
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <div
                  className="
    relative
    aspect-[16/9] sm:aspect-[21/9]
    bg-gradient-to-br from-zinc-900 via-black to-zinc-900
    flex items-center justify-center
    overflow-hidden
    group
  "
                >
                  <img
                    src={img}
                    alt={`${car.brand} ${car.model}`}
                    className="
      max-h-full max-w-full object-contain
      transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]
      group-hover:scale-[1.03]
    "
                  />

                  {/* Soft glass overlay */}
                  <div
                    className="
      absolute inset-0
      bg-gradient-to-t from-black/40 via-transparent to-black/20
      opacity-70
      transition-opacity duration-700
      group-hover:opacity-90
    "
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* THUMBNAILS */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-3 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => swiperRef.current?.slideTo(i)}
                className={`
  rounded-xl overflow-hidden border
  transition-all duration-300 ease-out
  ${
    i === activeIndex
      ? "border-[#c9a24d] scale-[1.04] shadow-lg"
      : "border-transparent hover:border-white/20 hover:scale-[1.02]"
  }
`}
              >
                <img
                  src={img}
                  alt="thumbnail"
                  className="h-16 w-28 object-contain bg-black"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* INFO PANEL */}
      <div
        className="
  rounded-[2.5rem]
  bg-gradient-to-br from-zinc-900/90 via-zinc-900/70 to-black/90
  backdrop-blur-xl border border-white/10
  p-8
  animate-[fadeUp_0.6s_ease-out]
"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-wide text-white">
              {car.brand}
              <span className="ml-2 text-zinc-300 font-normal">
                {car.model}
              </span>
            </h1>

            <span
              className={`inline-block mt-3 rounded-full px-4 py-1 text-xs tracking-wide
                ${
                  car.available
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/20 text-rose-300"
                }
              `}
            >
              {car.available ? "Available" : "Sold"}
            </span>
          </div>

          {!user?.isAdmin && (
            <button
              onClick={handleInquiry}
              disabled={!car.available}
              className="
  rounded-full px-8 py-3 text-sm font-semibold
  bg-[#c9a24d]/90 text-black
  transition-all duration-300 ease-out
  hover:bg-[#c9a24d]
  hover:-translate-y-[1px]
  hover:shadow-[0_12px_30px_-12px_rgba(201,162,77,0.6)]
  active:translate-y-0
  active:shadow-none
  disabled:opacity-40 disabled:cursor-not-allowed
"
            >
              {car.available ? "Send Inquiry" : "Sold Out"}
            </button>
          )}
        </div>

        {/* PRICE */}
        <div className="mb-10">
          <p className="text-sm text-zinc-400">Price</p>
          <p className="text-4xl font-semibold text-[#c9a24d]">
            {formatPrice(car.price)}
          </p>
        </div>

        {/* SPECS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Spec label="Brand" value={car.brand} />
          <Spec label="Model" value={car.model} />
          <Spec label="Year" value={car.year} />
        </div>
      </div>

      {/* MOBILE STICKY CTA */}
      {!user?.isAdmin && (
        <div
          className="
  fixed bottom-0 inset-x-0 sm:hidden
  bg-black/80 backdrop-blur-xl
  border-t border-white/10
  px-5 py-4
  flex items-center justify-between
  shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.8)]
"
        >
          <span className="font-semibold text-[#c9a24d]">
            {formatPrice(car.price)}
          </span>
          <button
            disabled={!car.available}
            onClick={handleInquiry}
            className="rounded-full bg-[#c9a24d]/90 px-6 py-2 text-sm font-semibold text-black disabled:opacity-40"
          >
            {car.available ? "Send Inquiry" : "Sold"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CarDetails;

/* ---------- SPEC ITEM ---------- */
const Spec = ({ label, value }) => (
  <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
    <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
    <p className="mt-1 text-sm text-white">{value}</p>
  </div>
);
