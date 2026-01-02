import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import registerVideo from "../assets/videos/register-bg.mp4";

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
    <section className="relative w-full h-[calc(100vh-3.7rem)] overflow-hidden">
      {/* 🎥 Background Video (desktop only) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="hidden md:block absolute inset-0 w-full h-full object-cover"
      >
        <source src={registerVideo} type="video/mp4" />
      </video>

      {/* 🌑 Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* 📦 Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              relative rounded-2xl
              bg-[#0f172a]/85
              backdrop-blur-xl
              border border-white/10
              shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_25px_60px_-15px_rgba(99,102,241,0.35)]
              p-6
            "
          >
            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Create your account
              </h2>
              <p className="mt-2 text-xs md:text-sm text-zinc-400">
                Join the LuxuryCars experience
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* YOUR DETAILS */}
              <div>
                <p className="mb-3 text-xs uppercase tracking-wide text-zinc-500">
                  Your details
                </p>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    disabled={loading}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-[#020617]/90 border border-white/10 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />

                  <input
                    type="tel"
                    placeholder="Phone number (optional)"
                    value={phone}
                    disabled={loading}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl bg-[#020617]/90 border border-white/10 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>
              </div>

              {/* ACCOUNT ACCESS */}
              <div>
                <p className="mb-3 text-xs uppercase tracking-wide text-zinc-500">
                  Account access
                </p>

                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    disabled={loading}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-[#020617]/90 border border-white/10 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />

                  <input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    disabled={loading}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-[#020617]/90 border border-white/10 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full rounded-xl
                  bg-gradient-to-r from-indigo-600 to-indigo-500
                  py-3 text-sm font-semibold text-white
                  shadow-lg shadow-indigo-600/30
                  hover:-translate-y-[1px]
                  hover:shadow-indigo-500/50
                  transition-all duration-300
                  disabled:opacity-50
                "
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-xs md:text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Register;
