// src/pages/PrescriptionRequests.jsx
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import http from "../apis/http";
import {
  FaPrescriptionBottleAlt,
  FaSyncAlt,
  FaSearch,
  FaEye,
  FaUser,
  FaPhone,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaBox,
  FaTimesCircle,
  FaUpload
} from "react-icons/fa";
import { toast } from "sonner";
import Swal from "sweetalert2";

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

export default function PrescriptionRequests() {
  const { themeColors } = useTheme();
  const { currentFont } = useFont();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [adminUploadImage, setAdminUploadImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchRequests = async () => {
    try {
      setRefreshing(true);
      const { data } = await http.get("orders/prescription/requests");
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Prescription fetch error:", error);
      const serverMsg = error.response?.data?.message || "Failed to load prescription requests";
      toast.error(serverMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Confirm Approval?",
        text: "This will verify the prescription and create a final order.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: themeColors.primary,
        confirmButtonText: "Yes, Approve",
        cancelButtonText: "Review Again",
        background: themeColors.surface,
        color: themeColors.text
      });

      if (result.isConfirmed) {
        setProcessing(true);
        const { data } = await http.put(`orders/prescription/requests/${id}/approve`);
        if (data.success) {
          toast.success("Prescription verified and order created.");
          setShowModal(false);
          fetchRequests();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleAdminImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdminUploadImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAdminUpload = async () => {
    if (!adminUploadImage) {
      toast.error("Please select a physical prescription image");
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("prescriptionImage", adminUploadImage);

      const { data } = await http.put(`orders/prescription/requests/${selectedRequest._id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (data.success) {
        toast.success("Doctor's prescription uploaded. Order confirmed.");
        setAdminUploadImage(null);
        setPreviewUrl(null);
        setShowModal(false);
        fetchRequests();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) return requests;
    const q = searchTerm.toLowerCase();
    return requests.filter((r) => 
      (r._id || "").toLowerCase().includes(q) ||
      (r.userId?.name || "").toLowerCase().includes(q) ||
      (r.userId?.phone || "").toLowerCase().includes(q)
    );
  }, [requests, searchTerm]);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background, fontFamily: currentFont.family }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-3">
              <FaPrescriptionBottleAlt className="text-blue-500" /> Prescription Ecosystem
            </h1>
            <p className="text-sm font-medium text-slate-500">Global queue for prescription verification and doctor overrides.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchRequests} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase transition-all hover:bg-slate-50">
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Syncing..." : "Refresh Queue"}
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-slate-800 dark:text-white">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Pending Sync</div>
                <div className="text-xl font-black flex items-center gap-2">
                    {requests.length} <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase">Required</span>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm opacity-60">
                <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">Status</div>
                <div className="text-xl font-black">Live Flow</div>
            </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 border-r border-slate-100 dark:border-slate-700 pr-5 text-slate-400">
                <FaSearch className="text-xs" />
                <span className="text-[10px] font-black uppercase tracking-widest">Search:</span>
            </div>
            <input 
                type="text" 
                placeholder="Patient Name, Phone or Token..."
                className="flex-1 bg-transparent text-sm font-bold focus:outline-none placeholder:text-slate-300 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Table Content */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-slate-800 dark:text-white">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Token Info</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Identity</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Items Captured</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Accounting</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading && !refreshing ? (
                            <tr><td colSpan="5" className="py-20 text-center"><div className="animate-spin h-6 w-6 border-b-2 border-slate-800 dark:border-white mx-auto"></div></td></tr>
                        ) : filteredRequests.length === 0 ? (
                            <tr><td colSpan="5" className="py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Queue Clear: No pending verifications</td></tr>
                        ) : (
                            filteredRequests.map(req => (
                                <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-black text-blue-500 uppercase tracking-tighter">#{req._id.slice(-8).toUpperCase()}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{fmtDateTime(req.createdAt)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                <FaUser className="text-slate-400" size={12} />
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black uppercase tracking-tight">{req.userId?.name}</div>
                                                <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                                    <FaPhone size={8} /> {req.userId?.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-xs">
                                            {req.items.map((item, idx) => (
                                                <span key={idx} className="bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded-md text-[9px] font-bold text-slate-500 dark:text-slate-300 border border-slate-100 dark:border-slate-600">
                                                    {item.productName} (x{item.quantity})
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-xs font-black tracking-tighter">{fmtCurrency(req.total)}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase">{req.paymentMethod}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => {
                                                setSelectedRequest(req);
                                                setShowModal(true);
                                            }}
                                            className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center lg:mx-auto gap-2"
                                        >
                                            <FaEye /> Inspect
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal */}
        {showModal && selectedRequest && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 overflow-y-auto">
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-300 my-auto">
                    <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-slate-700">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Verification Protocol</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Order Token: #{selectedRequest._id.toUpperCase()}</p>
                        </div>
                        <button onClick={() => { setShowModal(false); setPreviewUrl(null); }} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center transition-all">
                            <FaTimesCircle className="text-slate-400" />
                        </button>
                    </div>

                    <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Left: User & Items */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2"><FaUser /> Identity Matrix</h4>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
                                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{selectedRequest.userId?.name}</p>
                                        <p className="text-[10px] font-bold text-blue-500">{selectedRequest.userId?.phone}</p>
                                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                            <p className="text-[9px] font-medium text-slate-500 leading-tight">
                                                {selectedRequest.shippingAddress.addressLine1}, {selectedRequest.shippingAddress.city}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2"><FaBox /> Item Manifest</h4>
                                    <div className="space-y-2">
                                        {selectedRequest.items.map((item, idx) => (
                                            <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase">{item.productName}</span>
                                                <span className="text-[10px] font-black text-blue-500">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Prescription & Upload */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2"><FaPrescriptionBottleAlt /> Prescription Media</h4>
                                    <div className="aspect-square bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative group">
                                        {previewUrl ? (
                                            <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                                        ) : selectedRequest.prescriptionImage ? (
                                            <img src={selectedRequest.prescriptionImage} className="w-full h-full object-contain" alt="Rx" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-600 uppercase">Wait for Admin/Doctor Rx</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all pointer-events-none" />
                                    </div>
                                </div>
                                
                                <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800">
                                    <h5 className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3">Admin Overwrite (Doctor Rx)</h5>
                                    <div className="flex flex-col gap-3">
                                        <input type="file" id="rx-admin" className="hidden" accept="image/*" onChange={handleAdminImageChange} />
                                        <label htmlFor="rx-admin" className="w-full py-2.5 bg-white dark:bg-slate-800 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl text-center text-[10px] font-black text-blue-400 cursor-pointer hover:border-blue-400 transition-all flex items-center justify-center gap-2">
                                            <FaUpload /> {adminUploadImage ? "Change Rx File" : "Select Physical Rx"}
                                        </label>
                                        
                                        {adminUploadImage && (
                                            <button 
                                                onClick={handleAdminUpload} 
                                                disabled={uploading}
                                                className="w-full py-3 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                                            >
                                                {uploading ? "Uploading..." : "Sync & Confirm Order"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Aggregate Total</span>
                            <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{fmtCurrency(selectedRequest.total)}</span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowModal(false)} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                            <button 
                                onClick={() => handleApprove(selectedRequest._id)}
                                disabled={processing || !!adminUploadImage}
                                className="px-8 py-3 bg-slate-800 dark:bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing ? <FaSyncAlt className="animate-spin" /> : <FaCheckCircle />}
                                {selectedRequest.prescriptionImage ? "Verify & Approve" : "Pre-Approve"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
