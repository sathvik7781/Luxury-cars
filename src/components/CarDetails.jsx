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
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "cars", id));
        if (snap.exists()) {
          setCar(snap.data());
        } else {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-40 bg-gray-200 rounded-2xl mb-6"></div>
      </div>
    );
  }

  if (!car) return null;

  const images =
    car.images?.length > 0
      ? car.images
      : car.coverImage
      ? [car.coverImage]
      : ["/placeholder-car.jpg"];

  const handleCTA = () => {
    user ? navigate(`/cars/${id}/inquiry`) : navigate("/login");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8">
      {/* ---------- BACK ---------- */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-indigo-600 hover:underline"
      >
        <i className="fa-solid fa-arrow-left text-xs"></i>
        Back
      </button>

      {/* ---------- IMAGES ---------- */}
      <div className="mb-6">
        <Swiper
          key={id}
          modules={[Pagination, Keyboard]}
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          spaceBetween={16}
          slidesPerView={1}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(s) => setActiveIndex(s.activeIndex)}
          className="rounded-2xl overflow-hidden bg-gray-100"
        >
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className="h-80 flex items-center justify-center bg-gray-100">
                <img
                  src={img}
                  alt={`${car.brand} ${car.model}`}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ---------- THUMBNAILS ---------- */}
        {images.length > 1 && (
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => swiperRef.current?.slideTo(idx)}
                className={`border-2 rounded-lg transition ${
                  idx === activeIndex
                    ? "border-indigo-600"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img
                  src={img}
                  alt="thumbnail"
                  className="h-16 w-24 object-contain bg-gray-100 rounded-md"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------- HEADER ---------- */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {car.brand} <span className="text-indigo-600">{car.model}</span>
          </h1>

          <span
            aria-live="polite"
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              car.available
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {car.available ? "Available" : "Sold"}
          </span>
        </div>

        <p className="text-sm text-gray-500">Car details & availability</p>
      </div>

      {/* ---------- MAIN CARD ---------- */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-3xl font-bold text-emerald-700">
              {formatPrice(car.price)}
            </p>
          </div>

          {!user?.isAdmin && (
            <button
              disabled={!car.available}
              onClick={handleCTA}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {car.available ? "Send Inquiry" : "Sold Out"}
            </button>
          )}
        </div>

        {/* ---------- DETAILS ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Detail label="Brand" value={car.brand} />
          <Detail label="Model" value={car.model} />
          <Detail label="Year" value={car.year} />
        </div>
      </div>

      {/* ---------- MOBILE STICKY CTA ---------- */}
      {!user?.isAdmin && (
        <div className="fixed bottom-0 inset-x-0 sm:hidden bg-white border-t px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-emerald-700">
            {formatPrice(car.price)}
          </span>
          <button
            disabled={!car.available}
            onClick={handleCTA}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {car.available ? "Send Inquiry" : "Sold"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CarDetails;

/* ---------- SMALL COMPONENT ---------- */
const Detail = ({ label, value }) => (
  <div className="rounded-xl bg-gray-50 px-4 py-3">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
  </div>
);
