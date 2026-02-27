// src/pages/Orders.jsx
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { listOrders, updateOrderStatus } from "../apis/orders";
import {
  FaShoppingCart,
  FaSyncAlt,
  FaSearch,
  FaFilter,
  FaShippingFast,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaBox,
  FaInfoCircle
} from "react-icons/fa";
import { toast } from "sonner";

const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

const fmtCurrency = (n) =>
  typeof n === "number"
    ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : n ?? "-";

const STATUS_OPTIONS = [
  "pending", "confirmed", "shipped", "delivered", "cancelled", 
  "Picking", "On Hold", "Packing", "Problem Queue", "Billing",
  "Picklist Generated", "Quality Check", "Scanned For Shipping", "Unallocated"
];

export default function Orders() {
  const { themeColors } = useTheme();
  const { currentFont } = useFont();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const list = await listOrders();
      setOrders(Array.isArray(list) ? list : list.orders || []);
    } catch (error) {
      console.error("Order fetch error:", error);
      toast.error("Failed to load ecosystem orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdate = async (orderId, updateData) => {
    try {
      await updateOrderStatus(orderId, updateData);
      setOrders(prev => prev.map(o => (o._id || o.id) === orderId ? { ...o, ...updateData } : o));
      if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.id === orderId)) {
          setSelectedOrder(prev => ({ ...prev, ...updateData }));
      }
      toast.success("Order metrics synchronized");
    } catch (error) {
      console.error("Order update error:", error);
      toast.error("Inbound update failed");
    }
  };

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((o) => 
      (o._id || o.id || "").toLowerCase().includes(q) ||
      (o.shippingAddress?.name || "").toLowerCase().includes(q) ||
      (o.shippingAddress?.phone || "").toLowerCase().includes(q) ||
      (o.orderNumber || "").toLowerCase().includes(q)
    );
  }, [orders, searchTerm, statusFilter]);

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || "pending";
    if (["delivered", "quality check"].includes(s)) return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", icon: <FaCheckCircle /> };
    if (["shipped", "scanned for shipping"].includes(s)) return { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", icon: <FaShippingFast /> };
    if (["cancelled", "problem queue"].includes(s)) return { bg: "bg-red-50", text: "text-red-600", border: "border-red-100", icon: <FaTimesCircle /> };
    if (["packing", "picking", "picklist generated"].includes(s)) return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", icon: <FaBox /> };
    return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: <FaClock /> };
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background, fontFamily: currentFont.family }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Order Ecosystem</h1>
            <p className="text-sm font-medium text-slate-500">Live synchronization with inventory and shipping logistics.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchOrders} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase transition-all hover:bg-slate-50">
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Syncing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Volume</div>
                <div className="text-xl font-black text-slate-800">{orders.length} <span className="text-xs font-medium text-slate-400">PNL</span></div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">Delivered</div>
                <div className="text-xl font-black text-slate-800">{orders.filter(o => o.status === "delivered").length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">In Transit</div>
                <div className="text-xl font-black text-slate-800">{orders.filter(o => o.status === "shipped").length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1">Processing</div>
                <div className="text-xl font-black text-slate-800">{orders.filter(o => !["delivered", "cancelled", "shipped"].includes(o.status)).length}</div>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 border-r border-slate-100 pr-5 text-slate-400">
                <FaSearch className="text-xs" />
                <span className="text-[10px] font-black uppercase tracking-widest">Search:</span>
            </div>
            <input 
                type="text" 
                placeholder="ID, Customer, Phone..."
                className="flex-1 min-w-[250px] bg-transparent text-sm font-bold focus:outline-none placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="h-8 w-[1px] bg-slate-100 mx-2" />
            <div className="flex items-center gap-3">
                <FaFilter className="text-slate-300 text-xs" />
                <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                >
                    <option value="all">Everywhere</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Order Info</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client & Logistics</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Lifecycle</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Accounting</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading && !refreshing ? (
                            <tr><td colSpan="5" className="py-20 text-center"><div className="animate-spin h-6 w-6 border-b-2 border-slate-800 mx-auto"></div></td></tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr><td colSpan="5" className="py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No active shipments found</td></tr>
                        ) : (
                            filteredOrders.map(o => {
                                const config = getStatusConfig(o.status);
                                return (
                                    <tr key={o._id || o.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.text} border ${config.border} shadow-sm`}>
                                                    <FaShoppingCart size={14} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-slate-800 uppercase tracking-tighter">#{o.orderNumber || (o._id || o.id || "").slice(-6).toUpperCase()}</div>
                                                    <div className="text-[9px] font-bold text-blue-500 uppercase mt-0.5">{o.shopId?.shopName ? `Vendor: ${o.shopId.shopName}` : "Unallocated"}</div>
                                                    <div className="text-[9px] font-medium text-slate-400 uppercase mt-0.5">{fmtDateTime(o.createdAt)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{o.shippingAddress?.name}</div>
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <FaMapMarkerAlt className="text-slate-300" /> {o.shippingAddress?.city}, {o.shippingAddress?.pincode}
                                                </div>
                                                <div className="text-[9px] font-medium text-slate-400">{o.shippingAddress?.phone}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <select 
                                                    value={o.status || 'pending'} 
                                                    onChange={e => handleUpdate(o._id || o.id, { status: e.target.value })}
                                                    className={`px-3 py-1.5 rounded-lg border ${config.bg} ${config.text} ${config.border} text-[9px] font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:shadow-md transition-all`}
                                                >
                                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <div 
                                                    onClick={() => handleUpdate(o._id || o.id, { paymentStatus: o.paymentStatus === 'paid' ? 'pending' : 'paid' })}
                                                    className={`mt-1 flex items-center gap-1 text-[8px] font-bold cursor-pointer hover:opacity-75 ${o.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-slate-400'}`}
                                                >
                                                    <FaInfoCircle size={8} /> {o.paymentMethod || 'COD'} • {o.paymentStatus?.toUpperCase() || 'PENDING'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-xs font-black text-slate-800 tracking-tighter">{fmtCurrency(o.total)}</div>
                                            <button 
                                                onClick={() => setSelectedOrder(o)}
                                                className="text-[9px] font-bold text-blue-500 uppercase tracking-wider hover:underline"
                                            >
                                                {o.items?.length || 0} Items Captured
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* View Details Modal */}
        {selectedOrder && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 over scroll-y-auto">
                <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in duration-300 my-auto">
                    <div className="flex justify-between items-center p-8 border-b border-slate-50">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Order #{selectedOrder.orderNumber || (selectedOrder._id || selectedOrder.id || "").slice(-6).toUpperCase()}</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Transaction Logistics Summary</p>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all">
                            <FaTimesCircle className="text-slate-400" />
                        </button>
                    </div>

                    <div className="p-8 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Shipping Matrix</h4>
                                <div className="space-y-1 font-bold text-xs text-slate-800 uppercase tracking-tight">
                                    <p>{selectedOrder.shippingAddress?.name}</p>
                                    <p className="font-medium text-slate-500 normal-case">{selectedOrder.shippingAddress?.addressLine1}</p>
                                    <p className="font-medium text-slate-500 text-[10px]">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                                    <p className="text-blue-500">{selectedOrder.shippingAddress?.phone}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Payment & Status</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getStatusConfig(selectedOrder.status).bg} ${getStatusConfig(selectedOrder.status).text}`}>
                                            {selectedOrder.status}
                                        </div>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
                                            {selectedOrder.paymentStatus}
                                        </div>
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        Method: {selectedOrder.paymentMethod || 'COD'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Captured Manifest</h4>
                            <div className="space-y-2">
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div>
                                            <div className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.productName}</div>
                                            <div className="text-[9px] font-bold text-slate-400 flex items-center gap-2 uppercase mt-1">
                                                Qty: {item.quantity} {item.size && `• Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                                            </div>
                                        </div>
                                        <div className="text-xs font-black text-slate-800 tracking-tighter">
                                            {fmtCurrency(item.productPrice * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedOrder.notes && (
                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-8">
                                <h4 className="text-[9px] font-black uppercase text-blue-400 tracking-widest mb-1">Inbound Notes</h4>
                                <p className="text-xs font-medium text-blue-600">{selectedOrder.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Grand Total Balance</span>
                            <span className="text-2xl font-black text-slate-800 tracking-tighter">{fmtCurrency(selectedOrder.total)}</span>
                        </div>
                        <button 
                            onClick={() => setSelectedOrder(null)}
                            className="px-8 py-3 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs hover:bg-slate-700 transition-all shadow-lg"
                        >
                            Sync & Close
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
