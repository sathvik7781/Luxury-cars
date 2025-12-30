import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getInquiries, updateInquiryStatus } from "../services/inquiryService";
import { INQUIRY_STATUS } from "../constants/status";
import usePagination from "../hooks/usePagination";
import Swal from "sweetalert2";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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

const Inquiries = () => {
  const { user, loading: authLoading } = useAuth();

  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);

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
    const matchSearch =
      i.name.toLowerCase().includes(t) ||
      i.userEmail.toLowerCase().includes(t) ||
      i.carName.toLowerCase().includes(t);

    const matchStatus = statusFilter === "all" || i.status === statusFilter;

    return matchSearch && matchStatus;
  });

  /* ---------- PAGINATION ---------- */
  const { paginatedData, currentPage, totalPages, next, prev } = usePagination(
    filtered,
    PAGE_SIZE
  );

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

  const markAsRead = async (inq) => {
    if (!user?.isAdmin) return;
    if (inq.adminRead === true) return;

    try {
      await updateDoc(doc(db, "inquiries", inq.id), {
        adminRead: true,
      });
    } catch (err) {
      console.error("Failed to mark inquiry as read", err);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ---------- ADMIN LOADING OVERLAY ---------- */}
      {updating && user.isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-3 shadow">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">
              Updating inquiry…
            </span>
          </div>
        </div>
      )}

      {/* ---------- HEADING ---------- */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Customer <span className="text-indigo-600">Inquiries</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage inquiry statuses
        </p>
      </div>

      {/* ---------- STATS + CHART ---------- */}
      {user.isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatMini label="Pending" value={stats.pending} color="yellow" />
            <StatMini label="Contacted" value={stats.contacted} color="blue" />
            <StatMini label="Sold" value={stats.sold} color="green" />
            <StatMini label="Not Sold" value={stats.notSold} color="red" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={chartData} dataKey="value" outerRadius={70}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ---------- FILTER BAR ---------- */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative max-w-md w-full">
            <input
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none"
              placeholder="Search inquiries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  statusFilter === s.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- DESKTOP TABLE ---------- */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
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
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  No inquiries found
                </td>
              </tr>
            ) : (
              paginatedData.map((inq, idx) => (
                <tr
                  key={inq.id}
                  className={`cursor-pointer transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-indigo-50/60`}
                  onClick={() => {
                    setSelected(inquiries.find((i) => i.id === inq.id));
                    markAsRead(inq);
                  }}
                >
                  <td className="px-4 py-3 font-medium">{inq.carName}</td>
                  <td className="px-4 py-3 text-gray-600">{inq.userEmail}</td>
                  <td className="px-4 py-3">{inq.name}</td>
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
                      <select
                        value={inq.status}
                        disabled={
                          updating ||
                          updatingId === inq.id ||
                          STATUS_TRANSITIONS[inq.status].length === 0
                        }
                        onChange={(e) =>
                          handleStatusChange(inq, e.target.value)
                        }
                        className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm disabled:opacity-50"
                      >
                        <option value={inq.status} disabled>
                          {STATUS_TRANSITIONS[inq.status].length === 0
                            ? "No further actions"
                            : inq.status.replace("_", " ")}
                        </option>

                        {STATUS_TRANSITIONS[inq.status].map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
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
        <div className="mt-8 flex justify-center items-center gap-3">
          <button
            onClick={prev}
            className="rounded-lg px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200"
          >
            Prev
          </button>
          <span className="rounded-lg px-4 py-2 text-sm font-semibold bg-indigo-600 text-white">
            {currentPage}
          </span>
          <span className="text-sm text-gray-500">of {totalPages}</span>
          <button
            onClick={next}
            className="rounded-lg px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200"
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

/* ---------- SMALL COMPONENTS ---------- */

const StatMini = ({ label, value, color }) => {
  const map = {
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <span
        className={`rounded-full px-3 py-1 text-sm font-semibold ${map[color]}`}
      >
        {value}
      </span>
    </div>
  );
};

const StatusBadge = ({ status, adminRead, isAdmin }) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-700",
    contacted: "bg-blue-100 text-blue-700",
    sold: "bg-green-100 text-green-700",
    not_sold: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${map[status]}`}
      >
        {status.replace("_", " ")}
      </span>

      {isAdmin && adminRead === false && (
        <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">
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
            <div className="h-4 w-full rounded bg-gray-200"></div>
          </td>
        ))}
      </tr>
    ))}
  </>
);

const Modal = ({ inquiry, onClose }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const message = inquiry.message || "";
  const isLong = message.length > 120;

  const formatDate = (ts) => ts?.toDate?.().toLocaleString() || "—";

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const onEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="rounded-2xl bg-white p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Inquiry Details</h2>

        <p className="mb-2 text-sm">
          <b>Car:</b> {inquiry.carName}
        </p>

        <p className="mb-2 text-sm">
          <b>Email:</b> {inquiry.userEmail}
        </p>

        <p className="mb-2 text-sm">
          <b>Phone:</b> {inquiry.phone}
        </p>

        {/* ---------- MESSAGE ---------- */}
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Message</p>

          {message ? (
            <div
              className={`
                rounded-lg border p-3 text-sm text-gray-700
                ${
                  user?.isAdmin && isLong
                    ? "bg-indigo-50 border-indigo-200"
                    : "bg-gray-50 border-gray-200"
                }
              `}
            >
              <p
                className={`
    break-words whitespace-pre-wrap overflow-hidden
    ${expanded ? "" : "line-clamp-3"}
  `}
              >
                {message}
              </p>

              {isLong && (
                <button
                  onClick={() => setExpanded((p) => !p)}
                  className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm italic text-gray-400">No message provided</p>
          )}

          {/* ---------- TIMESTAMP ---------- */}
          <p className="mt-2 text-xs text-gray-400">
            Submitted on {formatDate(inquiry.createdAt)}
          </p>
        </div>
        {/* ---------- AUDIT LOG ---------- */}
        {inquiry.statusHistory?.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Status History
            </p>

            <div className="space-y-2">
              {inquiry.statusHistory
                .slice()
                .reverse()
                .map((h, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs"
                  >
                    <p className="font-medium text-gray-700">
                      {h.from} → {h.to}
                    </p>
                    <p className="text-gray-500">
                      {h.changedBy} • {h.changedAt?.toDate?.().toLocaleString()}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};
