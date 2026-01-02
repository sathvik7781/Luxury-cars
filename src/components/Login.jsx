import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      Swal.fire("Required", "Please enter email and password", "warning");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/");
    } catch {
      Swal.fire(
        "Login Failed",
        "Invalid email or password. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full h-[calc(100vh-3.7rem)] grid grid-cols-1 lg:grid-cols-2 items-center bg-[#020617]">
      {/* LEFT IMAGE */}
      <div className="hidden lg:flex relative items-center justify-center h-full overflow-hidden">
        <motion.img
          src="/auth-car.jpg"
          alt="Luxury car"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="max-w-2xl max-h-2xl object-contain object-center"
        />

        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-[#020617]/40 pointer-events-none"
        />
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1], // luxury easing
            }}
            className="
              rounded-2xl
              bg-[#0f172a]/90
              backdrop-blur-xl
              border border-white/10
              shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_25px_60px_-15px_rgba(99,102,241,0.35)]
              p-6
              animate-subtle
            "
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <h2
                className="
                  text-3xl font-semibold
                  bg-gradient-to-r from-white to-zinc-400
                  bg-clip-text text-transparent
                "
              >
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Sign in to your LuxuryCars account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full rounded-xl
                  bg-[#020617]/90
                  border border-white/10
                  px-4 py-3 text-sm text-zinc-100
                  placeholder:text-zinc-500
                  transition
                  hover:border-white/20
                  focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/30
                  outline-none
                "
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full rounded-xl
                  bg-[#020617]/90
                  border border-white/10
                  px-4 py-3 text-sm text-zinc-100
                  placeholder:text-zinc-500
                  transition
                  hover:border-white/20
                  focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/30
                  outline-none
                "
              />

              <button
                type="submit"
                disabled={loading}
                className="
    w-full rounded-xl
    bg-gradient-to-r from-indigo-600 to-indigo-500
    py-3 text-sm font-semibold text-white

    shadow-lg shadow-indigo-600/30
    transition-all duration-300 ease-out

    hover:-translate-y-[1px]
    hover:shadow-indigo-500/50
    hover:from-indigo-500 hover:to-indigo-400

    active:translate-y-0
    active:shadow-indigo-600/30

    disabled:opacity-50
    disabled:pointer-events-none
  "
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-zinc-400">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-zinc-400">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Login;
