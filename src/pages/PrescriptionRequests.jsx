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
  FaCheckCircle,
  FaTimesCircle,
  FaUpload,
  FaFilePrescription
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
        title: "Approve Prescription?",
        text: "This will confirm the order for the user.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: themeColors.primary,
        confirmButtonText: "Yes, Approve",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        setProcessing(true);
        const { data } = await http.put(`orders/prescription/requests/${id}/approve`);
        if (data.success) {
          toast.success("Prescription approved successfully.");
          setShowModal(false);
          fetchRequests();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Reject Prescription Request?",
        input: "textarea",
        inputLabel: "Reason for rejection (optional)",
        inputPlaceholder: "Enter reason...",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#EF4444",
        confirmButtonText: "Yes, Reject",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        setProcessing(true);
        const { data } = await http.put(`orders/prescription/requests/${id}/reject`, {
          rejectionReason: result.value || "Rejected by admin"
        });
        if (data.success) {
          toast.success("Request rejected.");
          setShowModal(false);
          fetchRequests();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Reject failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleAdminUpload = async () => {
    if (!adminUploadImage) {
      toast.error("Please select an image first");
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
        toast.success("Prescription uploaded and order confirmed.");
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
    <div className="p-6 space-y-6" style={{ backgroundColor: themeColors.background, fontFamily: currentFont.family }}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: themeColors.text }}>
            <FaFilePrescription className="text-primary" /> Prescription Requests
          </h1>
          <p className="text-sm opacity-60">Manage and verify user prescriptions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40" />
            <input 
              type="text" 
              placeholder="Search by name, phone..."
              className="pl-9 pr-4 py-2 rounded-lg border text-sm outline-none w-full md:w-64"
              style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchRequests} 
            disabled={refreshing}
            className="p-2.5 rounded-lg border transition-all hover:bg-black/5"
            style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }}
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}>
              <tr>
                <th className="px-6 py-4 font-semibold uppercase text-xs opacity-60">Request ID</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs opacity-60">Customer</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs opacity-60">Items</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs opacity-60 text-right">Total</th>
                <th className="px-6 py-4 font-semibold uppercase text-xs opacity-60 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100" style={{ borderColor: themeColors.border }}>
              {loading && !refreshing ? (
                <tr><td colSpan="5" className="py-20 text-center opacity-50">Loading requests...</td></tr>
              ) : filteredRequests.length === 0 ? (
                <tr><td colSpan="5" className="py-20 text-center opacity-50">No pending requests found.</td></tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req._id} className="hover:bg-black/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-primary">#{req._id.slice(-8).toUpperCase()}</span>
                      <div className="text-[10px] opacity-50 mt-1">{fmtDateTime(req.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{req.userId?.name}</div>
                      <div className="text-xs opacity-60 flex items-center gap-1"><FaPhone size={10} /> {req.userId?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px] truncate opacity-80">
                        {req.items.map(i => i.productName).join(", ")}
                      </div>
                      <div className="text-[10px] font-bold text-primary italic">{req.items.length} items</div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold">
                      {fmtCurrency(req.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => {
                          setSelectedRequest(req);
                          setShowModal(true);
                        }}
                        className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold flex items-center gap-2 mx-auto transition-transform active:scale-95"
                        style={{ backgroundColor: themeColors.primary }}
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: themeColors.surface }}>
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: themeColors.border }}>
              <h2 className="text-lg font-bold" style={{ color: themeColors.text }}>Request Details</h2>
              <button 
                onClick={() => { setShowModal(false); setPreviewUrl(null); }} 
                className="text-xl opacity-50 hover:opacity-100 transition-opacity"
              >
                <FaTimesCircle />
              </button>
            </div>

            <div className="p-6 modal-body overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Info Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase opacity-40 mb-3 tracking-widest">Customer Information</h3>
                    <div className="p-4 rounded-xl border space-y-1" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}>
                      <p className="font-bold" style={{ color: themeColors.text }}>{selectedRequest.userId?.name}</p>
                      <p className="text-sm opacity-70 underline">{selectedRequest.userId?.phone}</p>
                      <p className="text-xs opacity-50 mt-2 leading-relaxed">
                        {selectedRequest.shippingAddress?.addressLine1}, {selectedRequest.shippingAddress?.city}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase opacity-40 mb-3 tracking-widest">Items List</h3>
                    <div className="space-y-2">
                      {selectedRequest.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg border text-sm" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}>
                          <span className="font-medium">{item.productName}</span>
                          <span className="font-bold text-primary">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prescription Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase opacity-40 mb-3 tracking-widest">Prescription Image</h3>
                    <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden border border-dashed flex items-center justify-center relative" style={{ borderColor: themeColors.border }}>
                      {previewUrl ? (
                        <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                      ) : selectedRequest.prescriptionImage ? (
                        <img src={selectedRequest.prescriptionImage} className="w-full h-full object-contain" alt="Prescription" />
                      ) : (
                        <div className="text-center p-6 opacity-30">
                          <FaPrescriptionBottleAlt size={40} className="mx-auto mb-2" />
                          <p className="text-[10px] font-bold">No Image Uploaded By User</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3" style={{ borderColor: themeColors.primary + '20' }}>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary">Upload Doctor Prescription</h3>
                    <input type="file" id="rx-upload" className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setAdminUploadImage(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }} />
                    <label htmlFor="rx-upload" className="w-full py-2 border-2 border-dashed border-primary/30 rounded-lg text-center text-xs font-bold text-primary cursor-pointer hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                      <FaUpload /> {adminUploadImage ? "Change Image" : "Select Image"}
                    </label>
                    {adminUploadImage && (
                      <button 
                        onClick={handleAdminUpload}
                        disabled={uploading}
                        className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                        style={{ backgroundColor: themeColors.primary }}
                      >
                        {uploading ? "Uploading..." : "Confirm & Create Order"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-between" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}>
              <div>
                <span className="text-[10px] font-bold uppercase opacity-40">Total Amount</span>
                <div className="text-xl font-bold" style={{ color: themeColors.text }}>{fmtCurrency(selectedRequest.total)}</div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setShowModal(false); setPreviewUrl(null); }}
                  className="px-6 py-2 rounded-lg text-xs font-bold border hover:bg-black/5"
                  style={{ borderColor: themeColors.border, color: themeColors.text }}
                >
                  Close
                </button>
                <button 
                  onClick={() => handleReject(selectedRequest._id)}
                  disabled={processing}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-30"
                >
                  {processing ? <FaSyncAlt className="animate-spin" /> : <FaTimesCircle />}
                  Reject
                </button>
                <button 
                  onClick={() => handleApprove(selectedRequest._id)}
                  disabled={processing || !!adminUploadImage}
                  className="px-6 py-2 rounded-lg bg-black text-white text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-30"
                  style={{ backgroundColor: "#222" }}
                >
                  {processing ? <FaSyncAlt className="animate-spin" /> : <FaCheckCircle />}
                  {selectedRequest.prescriptionImage ? "Approve Order" : "Pre-Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
