import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { getUnreadInquiryCount } from "../services/inquiryUnreadService";

const Navbar = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) => `
    relative text-sm tracking-wide transition-colors duration-300
    ${isActive ? "text-[#d6b56e]" : "text-zinc-300 hover:text-white"}
  `;

  useEffect(() => {
    if (authLoading || !user?.isAdmin) return;
    getUnreadInquiryCount().then(setUnreadCount);
  }, [user, authLoading, location.pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-[#020617]/70 backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="text-lg font-semibold tracking-wide text-white">
          Luxury<span className="text-[#d6b56e] ml-0.5">Cars</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          {user && !user.isAdmin && (
            <>
              <NavLink to="/my-inquiries" className={linkClass}>
                My Inquiries
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                Profile
              </NavLink>
            </>
          )}

          {user?.isAdmin && (
            <>
              <NavLink to="/admin" end className={linkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/admin/inquiries" className={linkClass}>
                Inquiries
                {unreadCount > 0 && (
                  <span className="ml-2 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-[#d6b56e] px-1 text-[11px] font-semibold text-black">
                    {unreadCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/admin/analytics" className={linkClass}>
                Analytics
              </NavLink>
            </>
          )}

          {!user && (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="
                rounded-full border border-white/10
                px-5 py-1.5 text-sm tracking-wide
                text-zinc-200 hover:text-white
                hover:border-white/20 transition
              "
            >
              Logout
            </button>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="md:hidden text-zinc-300"
        >
          <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"} text-xl`} />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden transition-all duration-300 ease-out overflow-hidden
          ${open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="bg-[#020617]/95 backdrop-blur-xl px-6 py-6 space-y-4 border-t border-white/5">
          <MobileLink to="/" onClick={() => setOpen(false)}>
            Home
          </MobileLink>

          {user && !user.isAdmin && (
            <>
              <MobileLink to="/my-inquiries" onClick={() => setOpen(false)}>
                My Inquiries
              </MobileLink>
              <MobileLink to="/profile" onClick={() => setOpen(false)}>
                Profile
              </MobileLink>
            </>
          )}

          {user?.isAdmin && (
            <>
              <MobileLink to="/admin" onClick={() => setOpen(false)}>
                Dashboard
              </MobileLink>
              <MobileLink to="/admin/inquiries" onClick={() => setOpen(false)}>
                Inquiries
              </MobileLink>
              <MobileLink to="/admin/analytics" onClick={() => setOpen(false)}>
                Analytics
              </MobileLink>
            </>
          )}

          {!user && (
            <>
              <MobileLink to="/login" onClick={() => setOpen(false)}>
                Login
              </MobileLink>
              <MobileLink to="/register" onClick={() => setOpen(false)}>
                Register
              </MobileLink>
            </>
          )}

          {user && (
            <button
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
              className="mt-4 w-full rounded-full border border-white/10 px-5 py-2 text-sm text-zinc-200 hover:text-white transition text-left"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

/* MOBILE LINK */
const MobileLink = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className="block text-sm tracking-wide text-zinc-300 hover:text-white transition"
  >
    {children}
  </NavLink>
);
