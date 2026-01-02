import { useEffect, useState } from "react";
import { getAdminAnalytics } from "../services/adminAnalytics";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

/* ---------- COLORS ---------- */
const STATUS_COLORS = {
  pending: "#c9a24d",
  contacted: "#60a5fa",
  sold: "#22c55e",
  notSold: "#ef4444",
};

const PIE_COLORS = ["#c9a24d", "#60a5fa", "#22c55e", "#ef4444"];

/* ---------- COUNT UP ---------- */
const useCountUp = (value, duration = 600) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.floor(value / (duration / 16)));

    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return count;
};

/* ====================================================== */

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [range, setRange] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAdminAnalytics(range).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [range]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse space-y-6">
        <div className="h-6 w-1/3 bg-white/10 rounded"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/10 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-72 bg-white/10 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8 bg-[#0b0b0e] text-white">
      {/* ---------- HEADER ---------- */}
      <div>
        <h1 className="text-3xl font-semibold">
          Admin <span className="text-[#c9a24d]">Analytics</span>
        </h1>
        <p className="text-sm text-white/60 mt-1">
          Business performance overview
        </p>
      </div>

      {/* ---------- RANGE FILTER ---------- */}
      <div className="flex flex-wrap gap-2">
        {[
          ["today", "Today"],
          ["week", "Last 7 Days"],
          ["month", "Last 30 Days"],
          ["all", "All Time"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={`rounded-full px-4 py-1.5 text-sm transition
              ${
                range === key
                  ? "bg-[#c9a24d] text-black"
                  : "bg-[#1a1a22] text-white/70 hover:bg-white/10"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---------- KPI CARDS ---------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat title="Total Cars" value={data.totalCars} color="#c9a24d" />
        <Stat title="Sold Cars" value={data.soldCars} color="#22c55e" />
        <Stat
          title="Total Inquiries"
          value={data.totalInquiries}
          color="#60a5fa"
        />
        <Stat
          title="Conversion %"
          value={data.conversionRate}
          suffix="%"
          color="#22c55e"
        />
      </div>

      {/* ---------- CHARTS ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FUNNEL */}
        <div className="rounded-2xl bg-[#121217] border border-white/10 p-5">
          <h3 className="font-semibold mb-4 text-white/80">Inquiry Funnel</h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { name: "Pending", value: data.pending },
                { name: "Contacted", value: data.contacted },
                { name: "Sold", value: data.sold },
              ]}
            >
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Bar dataKey="value" fill="#c9a24d" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TOP CARS */}
        <div className="rounded-2xl bg-[#121217] border border-white/10 p-5">
          <h3 className="font-semibold mb-4 text-white/80">
            Top Interested Cars
          </h3>

          {data.topCars.length === 0 ? (
            <p className="text-sm text-white/50">No inquiries yet</p>
          ) : (
            <ul className="space-y-3">
              {data.topCars.map((c, i) => (
                <li
                  key={i}
                  className="flex justify-between text-sm
                  rounded-lg bg-[#1a1a22] px-4 py-2"
                >
                  <span className="text-white/70">{c.name}</span>
                  <span className="font-semibold text-[#c9a24d]">
                    {c.value}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* BRAND PIE */}
        <div className="rounded-2xl bg-[#121217] border border-white/10 p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4 text-white/80">Sales by Brand</h3>

          {data.brandData.length === 0 ? (
            <p className="text-sm text-white/50">No sales yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.brandData}
                  dataKey="value"
                  outerRadius={110}
                  innerRadius={55}
                >
                  {data.brandData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

/* ====================================================== */

const Stat = ({ title, value, color, suffix = "" }) => {
  const animated = useCountUp(Number(value) || 0);

  return (
    <div
      className="rounded-2xl border border-white/10 p-4
      bg-gradient-to-br from-[#1a1a22] to-[#121217]
      hover:scale-[1.02] transition"
    >
      <p className="text-sm text-white/60">{title}</p>
      <p className="text-2xl font-semibold mt-1" style={{ color }}>
        {animated}
        {suffix}
      </p>
    </div>
  );
};
