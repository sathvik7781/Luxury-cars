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

  const linkClass = ({ isActive }) =>
    `
      relative text-sm font-medium transition
      ${isActive ? "text-indigo-600" : "text-gray-700 hover:text-indigo-600"}
      after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full
      after:origin-left after:scale-x-0 after:bg-indigo-600 after:transition
      ${isActive ? "after:scale-x-100" : "hover:after:scale-x-100"}
    `;

  useEffect(() => {
    if (authLoading || !user?.isAdmin) return;
    getUnreadInquiryCount().then(setUnreadCount);
  }, [user, authLoading, location.pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* ---------- LOGO ---------- */}
        <Link to="/" className="text-xl font-bold tracking-wide">
          Luxury<span className="text-indigo-600">Cars</span>
        </Link>

        {/* ---------- DESKTOP LINKS ---------- */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          {/* User */}
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

          {/* Admin */}
          {user?.isAdmin && (
            <>
              <NavLink to="/admin" end className={linkClass}>
                Dashboard
              </NavLink>

              <NavLink
                to="/admin/inquiries"
                className={({ isActive }) =>
                  `relative ${linkClass({ isActive })}`
                }
              >
                Inquiries
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] rounded-full bg-indigo-600 px-1 text-[11px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/admin/analytics" className={linkClass}>
                Analytics
              </NavLink>
            </>
          )}

          {/* Auth */}
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
              className="rounded-lg bg-rose-100 px-4 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-200 transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* ---------- MOBILE TOGGLE ---------- */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="md:hidden text-gray-700"
        >
          <i
            className={`fa-solid ${open ? "fa-xmark" : "fa-bars"} text-xl`}
          ></i>
        </button>
      </div>

      {/* ---------- MOBILE MENU ---------- */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300
          ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="border-t bg-white px-4 py-4 flex flex-col gap-3">
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
              className="mt-2 rounded-lg bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-200 text-left"
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

/* ---------- SMALL COMPONENT ---------- */
const MobileLink = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
  >
    {children}
  </NavLink>
);
