import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Admin from "./components/Admin";
import CarDetails from "./components/CarDetails";
import InquiryForm from "./components/InquiryForm";
import Inquiries from "./components/Inquiries";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminAnalytics from "./components/AdminAnalytics";
import Profile from "./components/Profile";
import Footer from "./components/Footer";
import { AnimatePresence } from "framer-motion";
const App = () => {
  const location = useLocation();
  const hideFooter =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="flex flex-col bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#020617] text-gray-100">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route path="/cars/:id/inquiry" element={<InquiryForm />} />
            <Route path="/my-inquiries" element={<Inquiries />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inquiries"
              element={
                <ProtectedRoute adminOnly>
                  <Inquiries />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute adminOnly>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </AnimatePresence>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default App;
