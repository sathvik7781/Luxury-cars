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
    relative text-sm font-medium transition
    ${isActive ? "text-[#d6b56e]" : "text-zinc-300 hover:text-white"}
    after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full
    after:origin-left after:scale-x-0 after:bg-[#d6b56e]
    after:transition after:duration-300 after:ease-out
    ${isActive ? "after:scale-x-100" : "hover:after:scale-x-100"}
  `;

  useEffect(() => {
    if (authLoading || !user?.isAdmin) return;
    getUnreadInquiryCount().then(setUnreadCount);
  }, [user, authLoading, location.pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="text-xl font-bold tracking-wide text-white">
          Luxury<span className="text-[#d6b56e]">Cars</span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-6">
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

              <NavLink
                to="/admin/inquiries"
                className={({ isActive }) =>
                  `relative ${linkClass({ isActive })}`
                }
              >
                Inquiries
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] rounded-full bg-[#d6b56e] px-1 text-[11px] font-bold text-black flex items-center justify-center">
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
              className="rounded-full bg-white/5 px-4 py-1.5 text-sm font-semibold text-zinc-200 hover:bg-white/10 transition"
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
        className={`
          md:hidden overflow-hidden transition-all duration-300
          ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="border-t border-white/10 bg-[#020617] px-4 py-4 flex flex-col gap-3">
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
              className="mt-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10 text-left"
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
    className="text-sm font-medium text-zinc-300 hover:text-white transition"
  >
    {children}
  </NavLink>
);
