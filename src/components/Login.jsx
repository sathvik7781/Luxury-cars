import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
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
    } catch (err) {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* ---------- CARD ---------- */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          {/* ---------- HEADER ---------- */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-1">
              Login to continue browsing luxury cars
            </p>
          </div>

          {/* ---------- FORM ---------- */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="sr-only">Email</label>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full rounded-xl border border-gray-300
                  px-4 py-2.5 text-sm
                  focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/30
                  outline-none
                  disabled:bg-gray-100
                "
              />
            </div>

            <div>
              <label className="sr-only">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full rounded-xl border border-gray-300
                  px-4 py-2.5 text-sm
                  focus:border-indigo-500
                  focus:ring-2 focus:ring-indigo-500/30
                  outline-none
                  disabled:bg-gray-100
                "
              />
            </div>

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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* ---------- DIVIDER ---------- */}
          <div className="my-6 flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          {/* ---------- FOOTER ---------- */}
          <div className="text-center text-sm text-gray-500">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
