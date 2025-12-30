import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const InquiryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [car, setCar] = useState(null);

  // ✅ Autofilled from profile
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ---------- AUTO-FILL FROM PROFILE ---------- */
  useEffect(() => {
    if (!user) return;

    if (user.name) {
      setName(user.name);
    } else if (user.email) {
      setName(user.email.split("@")[0]);
    }

    if (user.phone) {
      setPhone(user.phone.replace("+91", ""));
    }
  }, [user]);

  /* ---------- AUTH + CAR FETCH ---------- */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCar = async () => {
      try {
        const snap = await getDoc(doc(db, "cars", id));
        if (snap.exists()) {
          setCar({ id: snap.id, ...snap.data() });
        } else {
          Swal.fire("Not Found", "Car not found", "error");
          navigate("/");
        }
      } catch {
        Swal.fire("Error", "Failed to load car details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id, user, authLoading, navigate]);

  /* ---------- SUBMIT ---------- */
  const submitInquiry = async (e) => {
    e.preventDefault();

    if (!car.available) {
      Swal.fire("Unavailable", "This car is already sold", "info");
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

      Swal.fire({
        icon: "success",
        title: "Inquiry Submitted",
        text: "Redirecting to your inquiries...",
        timer: 1600,
        showConfirmButton: false,
      });

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
      <div className="max-w-lg mx-auto px-4 py-10 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-6"></div>
        <div className="h-24 bg-gray-200 rounded-xl mb-6"></div>
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Inquiry for{" "}
          <span className="text-indigo-600">
            {car.brand} {car.model}
          </span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Our sales team will contact you within 24 hours
        </p>
      </div>

      {!car.available && (
        <div className="mb-4 rounded-xl bg-rose-100 text-rose-700 px-4 py-3 text-sm font-medium">
          This car has already been sold.
        </div>
      )}

      <form
        onSubmit={submitInquiry}
        className="rounded-2xl border bg-white p-6 shadow-sm space-y-4"
      >
        <input
          type="text"
          placeholder="Your Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
          className="w-full rounded-xl border px-4 py-2.5 text-sm"
        />

        <input
          type="tel"
          placeholder="Phone Number *"
          value={phone}
          maxLength={10}
          disabled={submitting}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full rounded-xl border px-4 py-2.5 text-sm"
        />

        <textarea
          placeholder="Message (optional)"
          rows="3"
          value={message}
          disabled={submitting}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 text-sm resize-none"
        />

        <button
          type="submit"
          disabled={submitting || !car.available}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
};

export default InquiryForm;
