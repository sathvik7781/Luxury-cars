import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getInquiries, updateInquiryStatus } from "../services/inquiryService";
import { INQUIRY_STATUS } from "../constants/status";
import usePagination from "../hooks/usePagination";
import Swal from "sweetalert2";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

/* ---------- CONSTANTS ---------- */
const PAGE_SIZE = 10;
const COLORS = ["#facc15", "#60a5fa", "#22c55e", "#ef4444"];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: INQUIRY_STATUS.PENDING, label: "Pending" },
  { key: INQUIRY_STATUS.CONTACTED, label: "Contacted" },
  { key: INQUIRY_STATUS.SOLD, label: "Sold" },
  { key: INQUIRY_STATUS.NOT_SOLD, label: "Not Sold" },
];

const STATUS_TRANSITIONS = {
  pending: [INQUIRY_STATUS.CONTACTED],
  contacted: [INQUIRY_STATUS.SOLD, INQUIRY_STATUS.NOT_SOLD],
  sold: [],
  not_sold: [],
};

/* ========================================================= */

const Inquiries = () => {
  const { user, loading: authLoading } = useAuth();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  /* ---------- LOAD DATA ---------- */
  const loadData = async () => {
    setLoading(true);
    const data = await getInquiries(user);
    setInquiries(data);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading || !user) return;
    loadData();
  }, [user, authLoading]);

  /* ---------- FILTER ---------- */
  const filtered = inquiries.filter((i) => {
    const t = search.toLowerCase();
    return (
      (i.name.toLowerCase().includes(t) ||
        i.userEmail.toLowerCase().includes(t) ||
        i.carName.toLowerCase().includes(t)) &&
      (statusFilter === "all" || i.status === statusFilter)
    );
  });

  /* ---------- PAGINATION ---------- */
  const { paginatedData, currentPage, totalPages, next, prev, reset } =
    usePagination(filtered, PAGE_SIZE);

  useEffect(() => {
    reset();
  }, [search, statusFilter, reset]);

  /* ---------- STATS ---------- */
  const stats = {
    pending: inquiries.filter((i) => i.status === INQUIRY_STATUS.PENDING)
      .length,
    contacted: inquiries.filter((i) => i.status === INQUIRY_STATUS.CONTACTED)
      .length,
    sold: inquiries.filter((i) => i.status === INQUIRY_STATUS.SOLD).length,
    notSold: inquiries.filter((i) => i.status === INQUIRY_STATUS.NOT_SOLD)
      .length,
  };

  const chartData = [
    { name: "Pending", value: stats.pending },
    { name: "Contacted", value: stats.contacted },
    { name: "Sold", value: stats.sold },
    { name: "Not Sold", value: stats.notSold },
  ];

  /* ---------- MARK AS READ ---------- */
  const markAsRead = async (inq) => {
    if (!user?.isAdmin || inq.adminRead) return;

    await updateDoc(doc(db, "inquiries", inq.id), { adminRead: true });
    setInquiries((prev) =>
      prev.map((i) => (i.id === inq.id ? { ...i, adminRead: true } : i))
    );
  };

  /* ---------- STATUS UPDATE ---------- */
  const handleStatusChange = async (inq, newStatus) => {
    if (inq.status === newStatus) return;

    const confirm = await Swal.fire({
      title: "Confirm Status Change",
      text:
        newStatus === INQUIRY_STATUS.SOLD
          ? "This will mark the car as SOLD and close all other inquiries."
          : "Are you sure you want to update this inquiry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
    });

    if (!confirm.isConfirmed) return;

    try {
      setUpdating(true);
      setUpdatingId(inq.id);

      await updateInquiryStatus(inq, newStatus);
      await loadData();
      setSelected(null);

      Swal.fire({
        icon: "success",
        title: "Updated",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Action blocked", err.message || "Car already sold", "error");
    } finally {
      setUpdating(false);
      setUpdatingId(null);
    }
  };

  /* ========================================================= */

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10
  bg-[#0b0b0e] text-white"
    >
      {/* ---------- OVERLAY ---------- */}
      {updating && user.isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="rounded-xl bg-[#121217] border border-white/10 px-6 py-4 flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-[#c9a24d] border-t-transparent animate-spin rounded-full" />
            <span className="text-sm text-white/80">Updating inquiry…</span>
          </div>
        </div>
      )}

      {/* ---------- HEADER ---------- */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">
          Customer <span className="text-[#c9a24d]">Inquiries</span>
        </h1>
        <p className="text-sm text-white/60 mt-1">
          Track and manage customer interest
        </p>
      </div>

      {/* ---------- STATS ---------- */}
      {user.isAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <StatMini label="Pending" value={stats.pending} color="yellow" />
          <StatMini label="Contacted" value={stats.contacted} color="blue" />
          <StatMini label="Sold" value={stats.sold} color="green" />
          <StatMini label="Not Sold" value={stats.notSold} color="red" />

          <div
            className="hidden lg:flex items-center justify-center
  rounded-2xl bg-[#121217] border border-white/10 p-4"
          >
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  outerRadius={45}
                  stroke="rgba(255,255,255,0.08)"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ---------- FILTER ---------- */}
      <div className="mb-6 rounded-2xl bg-[#121217] border border-white/10 p-4 flex flex-col lg:flex-row gap-4">
        <input
          className="w-full lg:max-w-md rounded-xl
  bg-[#1a1a22] border border-white/10
  px-4 py-2.5 text-sm
  text-white placeholder-white/40"
          placeholder="Search inquiries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                statusFilter === s.key
                  ? "bg-[#c9a24d] text-black"
                  : "bg-[#1a1a22] text-white/70 hover:bg-white/10"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="rounded-2xl bg-[#121217] border border-white/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#1a1a22] text-white/70">
            <tr>
              <th className="px-4 py-3 text-left">Car</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Status</th>
              {user.isAdmin && (
                <th className="px-4 py-3 text-center">Update</th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableSkeleton />
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  No inquiries found
                </td>
              </tr>
            ) : (
              paginatedData.map((inq, idx) => (
                <tr
                  key={inq.id}
                  className={`cursor-pointer ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-white/5"
                  } hover:bg-white/10`}
                  onClick={() => {
                    if (!user.isAdmin) return;
                    setSelected(inq);
                    markAsRead(inq);
                  }}
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {inq.carName}
                  </td>
                  <td className="px-4 py-3 text-white/60">{inq.userEmail}</td>
                  <td className="px-4 py-3 text-white/70">{inq.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={inq.status}
                      adminRead={inq.adminRead}
                      isAdmin={user.isAdmin}
                    />
                  </td>

                  {user.isAdmin && (
                    <td
                      className="px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {STATUS_TRANSITIONS[inq.status].length === 0 ? (
                        <span className="text-xs font-medium text-white/50">
                          Final
                        </span>
                      ) : (
                        <select
                          value={inq.status}
                          disabled={updatingId === inq.id}
                          onChange={(e) =>
                            handleStatusChange(inq, e.target.value)
                          }
                          className="rounded-lg bg-[#1a1a22]
                                      border border-white/10
                                      text-white/80 px-2 py-1 text-sm"
                        >
                          <option value={inq.status} disabled>
                            {inq.status.replace("_", " ")}
                          </option>
                          {STATUS_TRANSITIONS[inq.status].map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- PAGINATION ---------- */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={prev}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm
  text-white/70 hover:bg-white/10"
          >
            Prev
          </button>
          <span className="rounded-xl bg-[#c9a24d] px-4 py-2 text-sm font-semibold text-black">
            {currentPage}
          </span>
          <button
            onClick={next}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm
  text-white/70 hover:bg-white/10"
          >
            Next
          </button>
        </div>
      )}

      {selected && (
        <Modal inquiry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default Inquiries;

/* ========================================================= */
/* -------------------- SMALL COMPONENTS ------------------- */

import { useCountUp } from "../hooks/useCountUp";

const StatMini = ({ label, value, color }) => {
  const animatedValue = useCountUp(value);

  const map = {
    yellow: {
      card: "bg-gradient-to-br from-[#c9a24d]/25 to-[#121217]",
      text: "text-[#c9a24d]",
    },
    blue: {
      card: "bg-gradient-to-br from-blue-500/25 to-[#121217]",
      text: "text-blue-400",
    },
    green: {
      card: "bg-gradient-to-br from-emerald-500/25 to-[#121217]",
      text: "text-emerald-400",
    },
    red: {
      card: "bg-gradient-to-br from-red-500/25 to-[#121217]",
      text: "text-red-400",
    },
  };

  return (
    <div
      className={`rounded-2xl border border-white/10 p-4
      flex justify-between items-center ${map[color].card}`}
    >
      <p className="text-sm text-white/70">{label}</p>

      <span className={`text-xl font-semibold ${map[color].text}`}>
        {animatedValue}
      </span>
    </div>
  );
};

const StatusBadge = ({ status, adminRead, isAdmin }) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-700 animate-pulse",
    contacted: "bg-blue-100 text-blue-700",
    sold: "bg-green-100 text-green-700",
    not_sold: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-full px-3 py-1 text-xs ${map[status]}`}>
        {status.replace("_", " ")}
      </span>
      {isAdmin && !adminRead && (
        <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] text-white">
          NEW
        </span>
      )}
    </div>
  );
};

const TableSkeleton = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} className="animate-pulse">
        {Array.from({ length: 5 }).map((__, j) => (
          <td key={j} className="px-4 py-3">
            <div className="h-4 rounded bg-white/10" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

/* ---------- MODAL ---------- */
const Modal = ({ inquiry, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  const message = inquiry.message || "";
  const isLong = message.length > 120;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl
  bg-[#121217] border border-white/10 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-white">
          Inquiry Details
        </h2>

        <p className="text-sm text-white/70">
          <b>Car:</b> {inquiry.carName}
        </p>
        <p className="text-sm text-white/70">
          <b>Email:</b> {inquiry.userEmail}
        </p>
        <p className="text-sm text-white/70 mb-3">
          <b>Phone:</b> {inquiry.phone}
        </p>

        <div className="mt-2">
          <p className="text-sm font-semibold mb-1">Message</p>
          {message ? (
            <div className="rounded-lg bg-[#1a1a22] border border-white/10 p-3 text-sm">
              <p className={`${expanded ? "" : "line-clamp-3"}`}>{message}</p>
              {isLong && (
                <button
                  onClick={() => setExpanded((p) => !p)}
                  className="mt-2 text-xs text-indigo-600"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          ) : (
            <p className="italic text-gray-400">No message provided</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl
  bg-[#c9a24d] hover:bg-[#b8933f]
  px-4 py-2.5 text-sm font-semibold text-black"
        >
          Close
        </button>
      </div>
    </div>
  );
};
