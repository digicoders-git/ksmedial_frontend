// src/pages/Dashboard.jsx
import { useState, useMemo, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  FaShoppingCart,
  FaRupeeSign,
  FaUsers,
  FaBoxOpen,
  FaChartBar,
  FaSyncAlt,
  FaEnvelopeOpenText,
  FaTags,
  FaNetworkWired,
  FaCoins,
  FaTasks,
  FaWallet,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { API_ENDPOINTS } from "../config/api";
import { getDashboardOverview } from "../apis/dashboard";
import { Link } from "react-router-dom";

// ---------- helpers ----------
const fmtNum = (n) =>
  typeof n === "number" ? n.toLocaleString("en-IN") : n ?? "-";

const fmtCurrency = (n) =>
  typeof n === "number"
    ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : n ?? "-";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN") : "-";

const shortId = (id = "") => (id.length > 8 ? `...${id.slice(-8)}` : id);

// ---------- component ----------
export default function Dashboard() {
  const { theme, themeColors } = useTheme();

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(""); 

  // MLM Data State (Dynamic)
  const [mlmStats, setMlmStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    availableBalance: 0,
    pendingTasks: 0,
    completedTasks: 0,
    thisMonthEarnings: 0,
    pendingWithdrawals: 0
  });
  const [mlmLoading, setMlmLoading] = useState(true);

  // Fetch MLM Data
  const fetchMLMData = async () => {
    try {
      setMlmLoading(true);
      // TODO: Get userId from auth context
      const userId = "65a1b2c3d4e5f6g7h8i9j0k1"; // Use a valid ObjectId format to avoid server crash
      
      const response = await fetch(API_ENDPOINTS.MLM.DASHBOARD(userId));
      const data = await response.json();
      
      if (response.ok) {
        setMlmStats({
          totalReferrals: data.totalReferrals || 0,
          activeReferrals: data.activeReferrals || 0,
          totalEarnings: data.totalEarnings || 0,
          availableBalance: data.availableBalance || 0,
          pendingTasks: 0, // TODO: Add tasks API
          completedTasks: 0, // TODO: Add tasks API
          thisMonthEarnings: data.monthlyEarnings || 0,
          pendingWithdrawals: data.pendingWithdrawal || 0
        });
      }
    } catch (error) {
      console.error("Fetch MLM data error:", error);
    } finally {
      setMlmLoading(false);
    }
  };

  const fetchOverview = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      setError("");
      if (!isRefresh) setLoading(true);

      const data = await getDashboardOverview();
      setOverview(data);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load dashboard overview."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview(false);
    fetchMLMData(); // Fetch MLM data on mount
  }, []);

  const summary = overview?.summaryCards || {};
  const charts = overview?.charts || {};
  const tables = overview?.tables || {};
  const meta = overview?.meta || {};

  const salesLast7Days = useMemo(() => charts.salesLast7Days || [], [charts.salesLast7Days]);
  const productsByCategory = useMemo(() => charts.productsByCategory || [], [charts.productsByCategory]);

  const latestOrders = tables.latestOrders || [];
  const latestProducts = tables.latestProducts || [];
  const recentEnquiries = tables.recentEnquiries || [];
  const activeOffers = tables.activeOffers || [];

  const ordersTrend = useMemo(
    () =>
      salesLast7Days.map((d) => ({
        date: fmtDate(d.date),
        orders: d.orders,
      })),
    [salesLast7Days]
  );

  const revenueTrend = useMemo(
    () =>
      salesLast7Days.map((d) => ({
        date: fmtDate(d.date),
        revenue: d.revenue,
      })),
    [salesLast7Days]
  );

  const categoryPerformance = useMemo(
    () =>
      productsByCategory.map((c) => ({
        category: c.name || c.slug || "Untitled",
        totalProducts: c.totalProducts || 0,
        activeProducts: c.activeProducts || 0,
      })),
    [productsByCategory]
  );

  const summaryCards = [
    {
      title: "Total Revenue",
      value: fmtCurrency(summary.totalRevenue),
      icon: FaRupeeSign,
      description: `This month: ${fmtCurrency(
        summary.monthRevenue
      )} • Avg order: ${fmtCurrency(summary.avgOrderValue)}`,
    },
    {
      title: "Orders",
      value: fmtNum(summary.totalOrders),
      icon: FaShoppingCart,
      description: `Today: ${fmtNum(summary.todayOrders)}`,
    },
    {
      title: "Catalog",
      value: fmtNum(summary.totalProducts),
      icon: FaBoxOpen,
      description: `Active products: ${fmtNum(
        summary.activeProducts
      )} • Categories: ${fmtNum(summary.totalCategories)} (${fmtNum(
        summary.activeCategories
      )} active)`,
    },
    {
      title: "Engagement",
      value: fmtNum(summary.totalEnquiries),
      icon: FaUsers,
      description: `Unread enquiries: ${fmtNum(
        summary.unreadEnquiries
      )} • Active offers: ${fmtNum(summary.activeOffers)}`,
    },
  ];

  // MLM Summary Cards
  const mlmSummaryCards = [
    {
      title: "Total Referrals",
      value: mlmStats.totalReferrals,
      icon: FaUsers,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      link: "/referrals"
    },
    {
      title: "MLM Earnings",
      value: `₹${mlmStats.totalEarnings.toLocaleString()}`,
      icon: FaCoins,
      color: theme === 'dark' ? "text-red-500" : "text-green-600",
      bgColor: theme === 'dark' ? "bg-red-900/20" : "bg-green-100",
      link: "/earnings"
    },
    {
      title: "Available Balance",
      value: `₹${mlmStats.availableBalance.toLocaleString()}`,
      icon: FaWallet,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: "/withdrawal"
    },
    {
      title: "Pending Tasks",
      value: mlmStats.pendingTasks,
      icon: FaTasks,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      link: "/tasks"
    },
  ];

  const isEmpty = !loading && !overview;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
         
          <p
            className="text-sm mt-1 opacity-75"
            style={{ color: themeColors.text }}
          >
            Live summary of orders, revenue, catalogue and customer activity.
          </p>
          {meta.generatedAtIST && (
            <p
              className="text-xs mt-1 opacity-60"
              style={{ color: themeColors.text }}
            >
              Last updated (IST): {meta.generatedAtIST}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOverview(true)}
            disabled={loading || refreshing}
            className="px-3 py-2 rounded-lg border text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.text,
            }}
            title="Refresh dashboard"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error / Empty */}
      {error && (
        <div
          className="p-3 rounded-lg text-sm border"
          style={{
            backgroundColor: themeColors.danger + "15",
            borderColor: themeColors.danger + "50",
            color: themeColors.danger,
          }}
        >
          {error}
        </div>
      )}

      {isEmpty && !error && (
        <div
          className="p-3 rounded-lg text-sm border"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
            color: themeColors.text,
          }}
        >
          No dashboard data available.
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div
          className="p-3 rounded-lg text-sm border"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
            color: themeColors.text,
          }}
        >
          Loading dashboard...
        </div>
      )}

      {/* Rest of content only when we have data */}
      {!loading && overview && (
        <>
          {/* MLM Quick Overview */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>
                MLM Overview
              </h2>
              <Link 
                to="/mlm-dashboard"
                className="text-sm px-4 py-2 rounded-lg border hover:shadow-md transition-all"
                style={{
                  backgroundColor: themeColors.primary,
                  color: "white",
                  borderColor: themeColors.primary
                }}
              >
                View MLM Dashboard
              </Link>
            </div>
            {mlmLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading MLM data...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mlmSummaryCards.map((stat, index) => (
                <Link
                  key={index}
                  to={stat.link}
                  className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg group block"
                  style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1 opacity-75" style={{ color: themeColors.text }}>
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold mb-2" style={{ color: themeColors.primary }}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 ${stat.bgColor}`}>
                      <stat.icon className={`text-lg ${stat.color}`} />
                    </div>
                  </div>
                </Link>
                ))}
              </div>
            )}
          </div>

          {/* E-commerce Summary cards */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4" style={{ color: themeColors.text }}>
              KS4 Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {summaryCards.map((stat, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg group"
                  style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p
                        className="text-sm font-medium mb-1 opacity-75"
                        style={{ color: themeColors.text }}
                      >
                        {stat.title}
                      </p>
                      <p
                        className="text-2xl font-bold mb-2"
                        style={{ color: themeColors.primary }}
                      >
                        {stat.value}
                      </p>
                      <p
                        className="text-xs opacity-60"
                        style={{ color: themeColors.text }}
                      >
                        {stat.description}
                      </p>
                    </div>
                    <div
                      className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: themeColors.primary + "15" }}
                    >
                      <stat.icon
                        className="text-lg"
                        style={{ color: themeColors.primary }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts Row 1: Orders & Revenue (last 7 days) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders per day */}
            <div
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              }}
            >
              <h2
                className="text-lg font-semibold mb-4 flex items-center justify-between"
                style={{ color: themeColors.text }}
              >
                <span className="flex items-center gap-2">
                  <FaChartBar />
                  Orders (Last 7 Days)
                </span>
                <span className="text-xs opacity-70">
                  Today: {fmtNum(summary.todayOrders)} • Total:{" "}
                  {fmtNum(summary.totalOrders)}
                </span>
              </h2>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={ordersTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue per day */}
            <div
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              }}
            >
              <h2
                className="text-lg font-semibold mb-4 flex items-center justify-between"
                style={{ color: themeColors.text }}
              >
                <span className="flex items-center gap-2">
                  <FaChartBar />
                  Revenue (Last 7 Days)
                </span>
                <span className="text-xs opacity-70">
                  Total: {fmtCurrency(summary.totalRevenue)}
                </span>
              </h2>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(v) =>
                        `₹${(v / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      formatter={(value) => fmtCurrency(value)}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart Row 2: Products by category */}
          <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: themeColors.text }}
            >
              <FaChartBar />
              Products by Category
            </h2>
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="totalProducts" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tables: Latest Orders & Latest Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Latest orders table */}
            <div
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              }}
            >
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: themeColors.text }}
              >
                <FaShoppingCart />
                Latest Orders
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          themeColors.background + "30",
                      }}
                    >
                      {[
                        "Order",
                        "Customer",
                        "Items",
                        "Total",
                        "Status",
                        "Payment",
                        "Created",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide"
                          style={{ color: themeColors.text }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: themeColors.border }}
                  >
                    {latestOrders.map((o) => {
                      const firstItem = o.items?.[0];
                      const extraItems = (o.items?.length || 0) - 1;

                      const itemText = firstItem
                        ? `${firstItem.productName || firstItem.product?.name || "Item"
                          } x${firstItem.quantity}`
                        : "-";

                      return (
                        <tr key={o._id}>
                          <td
                            className="px-4 py-2 text-xs font-mono"
                            style={{ color: themeColors.text }}
                          >
                            {shortId(o._id)}
                            {o.offerCode && (
                              <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                                {o.offerCode}
                              </span>
                            )}
                          </td>
                          <td
                            className="px-4 py-2"
                            style={{ color: themeColors.text }}
                          >
                            {o.shippingAddress?.name || "-"}
                            <div className="text-xs opacity-70">
                              {o.shippingAddress?.city},{" "}
                              {o.shippingAddress?.state}
                            </div>
                          </td>
                          <td
                            className="px-4 py-2 text-xs"
                            style={{ color: themeColors.text }}
                          >
                            {itemText}
                            {extraItems > 0 && (
                              <span className="opacity-60">
                                {" "}
                                +{extraItems} more
                              </span>
                            )}
                          </td>
                          <td
                            className="px-4 py-2"
                            style={{ color: themeColors.text }}
                          >
                            {fmtCurrency(o.total)}
                          </td>
                          <td className="px-4 py-2 text-xs">
                            <span
                              className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold"
                              style={{
                                backgroundColor:
                                  themeColors.primary + "10",
                                color: themeColors.primary,
                              }}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td
                            className="px-4 py-2 text-xs"
                            style={{ color: themeColors.text }}
                          >
                            <div>{o.paymentMethod}</div>
                            <div className="opacity-70">
                              {o.paymentStatus}
                            </div>
                          </td>
                          <td
                            className="px-4 py-2 text-xs opacity-70"
                            style={{ color: themeColors.text }}
                          >
                            {fmtDate(o.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                    {latestOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-4 text-center text-sm"
                          style={{ color: themeColors.text }}
                        >
                          No recent orders.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Latest products table */}
            <div
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              }}
            >
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: themeColors.text }}
              >
                <FaBoxOpen />
                Latest Products
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          themeColors.background + "30",
                      }}
                    >
                      {[
                        "Product",
                        "Category",
                        "Price",
                        "Final Price",
                        "Status",
                        "Created",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide"
                          style={{ color: themeColors.text }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: themeColors.border }}
                  >
                    {latestProducts.map((p) => (
                      <tr key={p._id}>
                        <td
                          className="px-4 py-2"
                          style={{ color: themeColors.text }}
                        >
                          <div className="font-semibold">{p.name}</div>
                          {p.slug && (
                            <div className="text-[11px] opacity-70 font-mono">
                              {p.slug}
                            </div>
                          )}
                        </td>
                        <td
                          className="px-4 py-2 text-sm"
                          style={{ color: themeColors.text }}
                        >
                          {p.category?.name || "-"}
                        </td>
                        <td
                          className="px-4 py-2"
                          style={{ color: themeColors.text }}
                        >
                          {fmtCurrency(p.price)}
                        </td>
                        <td
                          className="px-4 py-2"
                          style={{ color: themeColors.text }}
                        >
                          {fmtCurrency(p.finalPrice)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: p.isActive
                                ? (themeColors.success ||
                                    themeColors.primary) + "15"
                                : themeColors.border,
                              color: p.isActive
                                ? themeColors.success ||
                                  themeColors.primary
                                : themeColors.text,
                            }}
                          >
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td
                          className="px-4 py-2 text-xs opacity-70"
                          style={{ color: themeColors.text }}
                        >
                          {fmtDate(p.createdAt)}
                        </td>
                      </tr>
                    ))}
                    {latestProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-4 text-center text-sm"
                          style={{ color: themeColors.text }}
                        >
                          No recent products.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent enquiries & active offers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent enquiries */}
            <div
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              }}
            >
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: themeColors.text }}
              >
                <FaEnvelopeOpenText />
                Recent Enquiries
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          themeColors.background + "30",
                      }}
                    >
                      {[
                        "Name",
                        "Email",
                        "Phone",
                        "Subject",
                        "Status",
                        "Created",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide"
                          style={{ color: themeColors.text }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: themeColors.border }}
                  >
                    {recentEnquiries.map((e) => (
                      <tr key={e._id}>
                        <td
                          className="px-4 py-2"
                          style={{ color: themeColors.text }}
                        >
                          {e.name}
                        </td>
                        <td
                          className="px-4 py-2 text-xs"
                          style={{ color: themeColors.text }}
                        >
                          {e.email}
                        </td>
                        <td
                          className="px-4 py-2 text-xs"
                          style={{ color: themeColors.text }}
                        >
                          {e.phone}
                        </td>
                        <td
                          className="px-4 py-2 text-xs"
                          style={{ color: themeColors.text }}
                        >
                          {e.subject}
                        </td>
                        <td className="px-4 py-2 text-xs">
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold"
                            style={{
                              backgroundColor: e.isRead
                                ? themeColors.border
                                : themeColors.primary + "10",
                              color: e.isRead
                                ? themeColors.text
                                : themeColors.primary,
                            }}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td
                          className="px-4 py-2 text-xs opacity-70"
                          style={{ color: themeColors.text }}
                        >
                          {fmtDate(e.createdAt)}
                        </td>
                      </tr>
                    ))}
                    {recentEnquiries.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-4 text-center text-sm"
                          style={{ color: themeColors.text }}
                        >
                          No enquiries yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active offers */}
            <div
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
              }}
            >
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: themeColors.text }}
              >
                <FaTags />
                Active Offers
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          themeColors.background + "30",
                      }}
                    >
                      {[
                        "Code",
                        "Title",
                        "Type",
                        "Value",
                        "Min Order",
                        "Max Discount",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide"
                          style={{ color: themeColors.text }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y"
                    style={{ borderColor: themeColors.border }}
                  >
                    {activeOffers.map((o) => (
                      <tr key={o._id}>
                        <td
                          className="px-4 py-2 font-mono text-xs"
                          style={{ color: themeColors.text }}
                        >
                          {o.code}
                        </td>
                        <td
                          className="px-4 py-2"
                          style={{ color: themeColors.text }}
                        >
                          {o.title}
                        </td>
                        <td
                          className="px-4 py-2 text-xs"
                          style={{ color: themeColors.text }}
                        >
                          {o.discountType === "percentage"
                            ? "Percentage"
                            : "Flat"}
                        </td>
                        <td
                          className="px-4 py-2 text-xs"
                          style={{ color: themeColors.text }}
                        >
                          {o.discountType === "percentage"
                            ? `${o.discountValue}%`
                            : fmtCurrency(o.discountValue)}
                        </td>
                        <td
                          className="px-4 py-2 text-xs"
                          style={{ color: themeColors.text }}
                        >
                          {o.minOrderAmount
                            ? fmtCurrency(o.minOrderAmount)
                            : "-"}
                        </td>
                        <td
                          className="px-4 py-2 text-xs"
                          style={{ color: themeColors.text }}
                        >
                          {o.maxDiscountAmount
                            ? fmtCurrency(o.maxDiscountAmount)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                    {activeOffers.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-4 text-center text-sm"
                          style={{ color: themeColors.text }}
                        >
                          No active offers.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
