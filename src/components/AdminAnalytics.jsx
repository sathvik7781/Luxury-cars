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

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

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
      <div className="p-10 animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* ---------- HEADING ---------- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin <span className="text-indigo-600">Analytics</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Business performance overview
        </p>
      </div>

      <div className="flex gap-2">
        {[
          ["today", "Today"],
          ["week", "Last 7 Days"],
          ["month", "Last 30 Days"],
          ["all", "All Time"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              range === key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---------- KPI CARDS ---------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat title="Total Cars" value={data.totalCars} />
        <Stat title="Sold Cars" value={data.soldCars} />
        <Stat title="Total Inquiries" value={data.totalInquiries} />
        <Stat title="Conversion %" value={`${data.conversionRate}%`} />
      </div>

      {/* ---------- FUNNEL + BRAND ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="rounded-2xl bg-white p-5 border shadow-sm">
          <h3 className="font-semibold mb-4">Inquiry Funnel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: "Pending", value: data.pending },
                { name: "Contacted", value: data.contacted },
                { name: "Sold", value: data.sold },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white p-5 border shadow-sm">
          <h3 className="font-semibold mb-3">Top Interested Cars</h3>

          {data.topCars.length === 0 ? (
            <p className="text-sm text-gray-500">No inquiries yet</p>
          ) : (
            <ul className="space-y-2">
              {data.topCars.map((c, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="font-semibold">{c.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Brand wise */}
        <div className="rounded-2xl bg-white p-5 border shadow-sm">
          <h3 className="font-semibold mb-4">Sales by Brand</h3>
          {data.brandData.length === 0 ? (
            <p className="text-sm text-gray-500">No sales yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.brandData} dataKey="value" outerRadius={90}>
                  {data.brandData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
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

const Stat = ({ title, value }) => (
  <div className="rounded-xl bg-white border px-4 py-3 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);
