import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

/* ---------------- INTENT PRESETS ---------------- */
const INTENTS = [
  "Price details",
  "Test drive",
  "Availability",
  "Finance options",
];

const InquiryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [car, setCar] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ---------- AUTO-FILL + RESTORE DRAFT ---------- */
  useEffect(() => {
    if (!user) return;

    setName(
      sessionStorage.getItem(`inq-name-${id}`) ||
        user.name ||
        user.email?.split("@")[0] ||
        ""
    );

    setPhone(
      sessionStorage.getItem(`inq-phone-${id}`) ||
        user.phone?.replace("+91", "") ||
        ""
    );

    setMessage(sessionStorage.getItem(`inq-msg-${id}`) || "");
  }, [user, id]);

  /* ---------- SAVE DRAFT ---------- */
  useEffect(() => {
    sessionStorage.setItem(`inq-name-${id}`, name);
    sessionStorage.setItem(`inq-phone-${id}`, phone);
    sessionStorage.setItem(`inq-msg-${id}`, message);
  }, [name, phone, message, id]);

  /* ---------- AUTH + FETCH CAR ---------- */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCar = async () => {
      try {
        const snap = await getDoc(doc(db, "cars", id));
        if (!snap.exists()) {
          Swal.fire("Not Found", "Car not found", "error");
          navigate("/");
          return;
        }
        setCar({ id: snap.id, ...snap.data() });
      } catch {
        Swal.fire("Error", "Failed to load car details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id, user, authLoading, navigate]);

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [loading]);

  /* ---------- SUBMIT ---------- */
  const submitInquiry = async (e) => {
    e.preventDefault();

    if (!car.available) {
      Swal.fire("Unavailable", "This car has already been sold", "info");
      return;
    }

    if (!name.trim() || !phone.trim()) {
      Swal.fire("Required", "Name and phone are required", "warning");
      return;
    }

    if (phone.length < 10) {
      Swal.fire("Invalid Phone", "Enter a valid phone number", "warning");
      return;
    }

    try {
      setSubmitting(true);

      // 🔒 Prevent duplicate pending inquiry
      const q = query(
        collection(db, "inquiries"),
        where("carId", "==", car.id),
        where("userEmail", "==", user.email),
        where("status", "==", "pending")
      );

      const existing = await getDocs(q);
      if (!existing.empty) {
        setSubmitting(false);
        Swal.fire(
          "Already submitted",
          "You already have a pending inquiry for this car.",
          "info"
        );
        navigate("/my-inquiries");
        return;
      }

      await addDoc(collection(db, "inquiries"), {
        carId: car.id,
        carName: `${car.brand} ${car.model}`,
        userEmail: user.email,
        name,
        phone: `+91${phone}`,
        message,
        status: "pending",
        adminRead: false,
        createdAt: serverTimestamp(),
        createdAtClient: new Date(),
      });

      // 🧹 Clear drafts
      sessionStorage.removeItem(`inq-name-${id}`);
      sessionStorage.removeItem(`inq-phone-${id}`);
      sessionStorage.removeItem(`inq-msg-${id}`);

      setSuccess(true);

      setTimeout(() => navigate("/my-inquiries"), 1600);
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 animate-pulse">
        <div className="h-6 bg-zinc-200 rounded w-2/3 mb-6"></div>
        <div className="h-28 bg-zinc-200 rounded-2xl mb-6"></div>
      </div>
    );
  }

  if (!car) return null;

  return (
    <section className="bg-[#020617]">
      <div className="max-w-6xl mx-auto px-4 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* LEFT IMAGE */}
          <div className="hidden lg:block">
            <div className="sticky top-28 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <img
                src={car.coverImage || "/placeholder-car.jpg"}
                alt={`${car.brand} ${car.model}`}
                className="h-[520px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 p-6">
                <h2 className="text-2xl font-semibold text-white">
                  {car.brand}{" "}
                  <span className="text-[#c9a24d]">{car.model}</span>
                </h2>
                <p className="mt-1 text-zinc-300">
                  ₹{car.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
              Back to car
            </button>

            <div className="rounded-[2.5rem] bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl p-8">
              {success ? (
                <div className="text-center py-16 animate-fade-up">
                  <div className="mx-auto mb-6 h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <i className="fa-solid fa-check text-emerald-400 text-xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    Inquiry Submitted
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Our team will contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={submitInquiry} className="space-y-4">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name *"
                    className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white"
                  />

                  <input
                    value={phone}
                    maxLength={10}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    placeholder="Phone Number *"
                    className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white"
                  />

                  <div className="flex flex-wrap gap-2">
                    {INTENTS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setMessage(i)}
                        className="rounded-full px-4 py-1.5 text-xs border border-white/10 text-zinc-300"
                      >
                        {i}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="4"
                    placeholder="Message (optional)"
                    className="w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white resize-none"
                  />

                  <button
                    disabled={submitting || !car.available}
                    className="w-full rounded-xl bg-[#c9a24d]/90 text-black px-4 py-3 text-sm font-semibold disabled:opacity-40"
                  >
                    {submitting ? "Submitting inquiry…" : "Submit Inquiry"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InquiryForm;
