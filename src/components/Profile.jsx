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
    if (!user?.uid) return;

    const loadProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || "");
          setPhone((data.phone || "").replace("+91", ""));
        }
      } catch {
        Swal.fire("Error", "Failed to load profile", "error");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user.uid]);

  /* ---------- LOAD RECENT INQUIRIES ---------- */
  useEffect(() => {
    const loadInquiries = async () => {
      try {
        const q = query(
          collection(db, "inquiries"),
          where("userEmail", "==", user.email),
          orderBy("createdAtClient", "desc"),
          limit(RECENT_LIMIT)
        );
        const snap = await getDocs(q);
        setInquiries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } finally {
        setInqLoading(false);
      }
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

    if (phone && phone.length < 10) {
      Swal.fire("Invalid", "Enter a valid phone number", "warning");
      return;
    }

    try {
      setSaving(true);
      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        phone: phone ? `+91${phone}` : "",
        updatedAt: new Date(),
      });

      Swal.fire({
        icon: "success",
        title: "Profile updated",
        timer: 1200,
        showConfirmButton: false,
      });
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
      Swal.fire(
        "Re-auth Required",
        "Please log in again to change password",
        "error"
      );
    }
  };

  /* ---------- DELETE ACCOUNT ---------- */
  const handleDeleteAccount = async () => {
    const confirm = await Swal.fire({
      title: "Delete account?",
      text: "This action is permanent and cannot be undone.",
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
      Swal.fire(
        "Re-auth Required",
        "Please log in again to delete account",
        "error"
      );
    }
  };

  if (profileLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      {/* ---------- PROFILE ---------- */}
      <form
        onSubmit={saveProfile}
        className="rounded-2xl border bg-white p-6 shadow-sm space-y-4"
      >
        <h2 className="text-xl font-bold">My Profile</h2>

        <input
          value={user.email}
          disabled
          className="w-full rounded-xl border bg-gray-100 px-4 py-2.5 text-sm"
        />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full rounded-xl border px-4 py-2.5 text-sm"
        />

        <input
          value={phone}
          maxLength={10}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Phone"
          className="w-full rounded-xl border px-4 py-2.5 text-sm"
        />

        <button
          disabled={saving}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>

      {/* ---------- SECURITY ---------- */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
        <h3 className="font-semibold">Security</h3>

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 text-sm"
        />

        <button
          type="button"
          onClick={handlePasswordChange}
          className="w-full rounded-xl bg-gray-800 py-2.5 text-sm font-semibold text-white"
        >
          Change Password
        </button>
      </div>

      {/* ---------- RECENT INQUIRIES ---------- */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="font-semibold mb-1">Recent Inquiries</h3>
        <p className="text-sm text-gray-500 mb-4">
          Your latest {RECENT_LIMIT} inquiries
        </p>

        {inqLoading ? (
          <p className="text-sm text-gray-500">Loading inquiries…</p>
        ) : inquiries.length === 0 ? (
          <p className="text-sm text-gray-400">No inquiries yet</p>
        ) : (
          <div className="space-y-3">
            {inquiries.map((i) => (
              <div
                key={i.id}
                className="rounded-xl border px-4 py-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{i.carName}</p>
                  <p className="text-xs text-gray-500">
                    {i.createdAt?.toDate?.().toLocaleDateString()}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    i.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : i.status === "contacted"
                      ? "bg-blue-100 text-blue-700"
                      : i.status === "sold"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {i.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-right">
          <button
            onClick={() => navigate("/my-inquiries")}
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            View all inquiries →
          </button>
        </div>
      </div>

      {/* ---------- ACCOUNT ACTION ---------- */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <p className="text-sm text-gray-600 mb-3">
          If you no longer wish to use this account, you can permanently delete
          it.
        </p>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="w-full rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
};

export default Profile;
