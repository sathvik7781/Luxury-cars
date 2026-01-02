import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { updatePassword, deleteUser } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

const RECENT_LIMIT = 5;

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading || !user) return null;

  /* ---------- PROFILE ---------- */
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  /* ---------- RECENT INQUIRIES ---------- */
  const [inquiries, setInquiries] = useState([]);
  const [inqLoading, setInqLoading] = useState(true);

  /* ---------- LOAD PROFILE ---------- */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || "");
          setPhone((data.phone || "").replace("+91", ""));
        }
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [user.uid]);

  /* ---------- LOAD INQUIRIES ---------- */
  useEffect(() => {
    const loadInquiries = async () => {
      const q = query(
        collection(db, "inquiries"),
        where("userEmail", "==", user.email),
        orderBy("createdAtClient", "desc"),
        limit(RECENT_LIMIT)
      );
      const snap = await getDocs(q);
      setInquiries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setInqLoading(false);
    };
    loadInquiries();
  }, [user.email]);

  /* ---------- SAVE PROFILE ---------- */
  const saveProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire("Required", "Name cannot be empty", "warning");
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        phone: phone ? `+91${phone}` : "",
        updatedAt: new Date(),
      });
      Swal.fire("Saved", "Profile updated", "success");
    } catch {
      Swal.fire("Error", "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- PASSWORD ---------- */
  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      Swal.fire("Weak Password", "Minimum 6 characters required", "warning");
      return;
    }
    try {
      await updatePassword(auth.currentUser, newPassword);
      Swal.fire("Success", "Password updated", "success");
      setNewPassword("");
    } catch {
      Swal.fire("Re-auth Required", "Login again to change password", "error");
    }
  };

  /* ---------- DELETE ---------- */
  const handleDeleteAccount = async () => {
    const confirm = await Swal.fire({
      title: "Delete account?",
      text: "This action is permanent.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(auth.currentUser);
      Swal.fire("Deleted", "Account removed", "success");
      navigate("/login");
    } catch {
      Swal.fire("Re-auth Required", "Login again to delete account", "error");
    }
  };

  if (profileLoading) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 bg-[#0b0b0e] text-white">
      <h1 className="text-3xl font-semibold mb-8">
        My <span className="text-[#c9a24d]">Profile</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ---------- LEFT : PROFILE ---------- */}
        <form
          onSubmit={saveProfile}
          className="lg:col-span-3 rounded-2xl bg-[#121217] border border-white/10 p-8 space-y-6"
        >
          <h2 className="text-lg font-semibold">Profile Details</h2>

          <input
            value={user.email}
            disabled
            className="w-full rounded-xl bg-[#1a1a22] border border-white/10
            px-4 py-2.5 text-sm text-white/60"
          />

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-xl bg-[#1a1a22] border border-white/10
            px-4 py-2.5 text-sm text-white"
          />

          <input
            value={phone}
            maxLength={10}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Phone number"
            className="w-full rounded-xl bg-[#1a1a22] border border-white/10
            px-4 py-2.5 text-sm text-white"
          />

          <button
            disabled={saving}
            className="w-full rounded-xl bg-[#c9a24d] hover:bg-[#b8933f]
            py-2.5 text-sm font-semibold text-black"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {/* ---------- RIGHT ---------- */}
        <div className="lg:col-span-2 space-y-5">
          {/* SECURITY */}
          <div className="rounded-2xl bg-[#121217] border border-white/10 p-4">
            <h3 className="font-semibold mb-3">Security</h3>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl bg-[#1a1a22] border border-white/10
              px-4 py-2.5 text-sm text-white mb-3"
            />
            <button
              onClick={handlePasswordChange}
              className="w-full rounded-xl bg-white/10 hover:bg-white/20
              py-2 text-sm font-semibold text-white"
            >
              Change Password
            </button>
          </div>

          {/* RECENT INQUIRIES */}
          <div className="rounded-2xl bg-[#121217] border border-white/10 p-4">
            <h3 className="font-semibold mb-1">Recent Inquiries</h3>
            <p className="text-sm text-white/60 mb-4">
              Your latest {RECENT_LIMIT} inquiries
            </p>

            {inqLoading ? (
              <InquirySkeleton />
            ) : inquiries.length === 0 ? (
              <p className="text-sm text-white/40">No inquiries yet</p>
            ) : (
              <AnimatePresence>
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
                  {inquiries.map((i, index) => (
                    <motion.div
                      key={i.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.05,
                        ease: "easeOut",
                      }}
                      className="rounded-xl bg-[#1a1a22] border border-white/10
        px-4 py-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{i.carName}</p>
                        <p className="text-xs text-white/50">
                          {i.createdAt?.toDate?.().toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold
          ${i.status === "pending" && "bg-[#c9a24d]/20 text-[#c9a24d]"}
          ${i.status === "contacted" && "bg-blue-500/20 text-blue-400"}
          ${i.status === "sold" && "bg-green-500/20 text-green-400"}
          ${i.status === "not_sold" && "bg-red-500/20 text-red-400"}
          `}
                      >
                        {i.status.replace("_", " ")}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}

            <div className="mt-4 text-right">
              <button
                onClick={() => navigate("/my-inquiries")}
                className="text-sm font-semibold text-[#c9a24d] hover:underline"
              >
                View all inquiries →
              </button>
            </div>
          </div>

          {/* DELETE */}
          <div className="rounded-2xl bg-[#121217] border border-red-500/20 p-4">
            <p className="text-sm text-white/60 mb-4">
              Permanently delete your account and all associated data.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full rounded-xl bg-red-500/90 hover:bg-red-600
              py-2 text-sm font-semibold text-white"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

const InquirySkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-[#1a1a22] border border-white/10
          px-4 py-3 flex justify-between items-center animate-pulse"
        >
          <div className="space-y-2 w-full">
            <div className="h-4 w-1/2 bg-white/10 rounded" />
            <div className="h-3 w-1/3 bg-white/10 rounded" />
          </div>

          <div className="h-6 w-16 bg-white/10 rounded-full" />
        </div>
      ))}
    </div>
  );
};
