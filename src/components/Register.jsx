import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

const Register = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      Swal.fire("Required", "Name, email and password are required", "warning");
      return;
    }

    if (password.length < 6) {
      Swal.fire(
        "Weak password",
        "Password must be at least 6 characters",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);

      await signup(email, password, {
        displayName: name,
        phoneNumber: phone,
      });

      Swal.fire({
        icon: "success",
        title: "Account created",
        text: "Redirecting to home...",
        timer: 1400,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/"), 1400);
    } catch (err) {
      Swal.fire("Error", err.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          {/* ---------- HEADER ---------- */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1">
              Register to explore available luxury cars
            </p>
          </div>

          {/* ---------- FORM ---------- */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full rounded-xl border border-gray-300
                px-4 py-2.5 text-sm
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30
                outline-none
              "
            />

            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="
                w-full rounded-xl border border-gray-300
                px-4 py-2.5 text-sm
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30
                outline-none
              "
            />

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full rounded-xl border border-gray-300
                px-4 py-2.5 text-sm
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30
                outline-none
              "
            />

            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full rounded-xl border border-gray-300
                px-4 py-2.5 text-sm
                focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30
                outline-none
              "
            />

            <button
              type="submit"
              disabled={loading}
              className="
                w-full rounded-xl bg-indigo-600
                px-4 py-2.5 text-sm font-semibold text-white
                hover:bg-indigo-700
                disabled:opacity-50 disabled:cursor-not-allowed
                transition
              "
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          {/* ---------- FOOTER ---------- */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
