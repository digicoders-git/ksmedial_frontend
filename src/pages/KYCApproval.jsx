import { useState, useEffect, useCallback } from "react";
import { FaEye, FaTimes, FaCheck, FaIdCard, FaHistory, FaCheckCircle, FaSyncAlt, FaUserAlt, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaFilter } from "react-icons/fa";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";
import { kycAPI } from "../services/api";

const KYCApproval = () => {
  const { themeColors } = useTheme();
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kycRequests, setKycRequests] = useState([]);

  const fetchKYCRequests = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await kycAPI.getAllKYC(filterStatus);
      setKycRequests(Array.isArray(data) ? data : (data.kycRequests || data.data || []));
    } catch (error) {
      console.error("KYC fetch error:", error);
      toast.error("Failed to fetch KYC requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchKYCRequests();
  }, [fetchKYCRequests]);

  const handleApproveKYC = async (kycId) => {
    try {
      const data = await kycAPI.approveKYC(kycId);
      if (data.status === "success" || data.success) {
        toast.success("KYC approved successfully!");
        fetchKYCRequests();
      } else {
        toast.error(data.message || "Approval failed");
      }
    } catch (error) {
       console.error("KYC Approval error:", error);
       toast.error("An error occurred during approval");
    }
  };

  const handleRejectKYC = async (kycId, reason) => {
    try {
      const data = await kycAPI.rejectKYC(kycId, reason);
      if (data.status === "success" || data.success) {
        toast.success("KYC rejected successfully!");
        fetchKYCRequests();
        setShowRejectModal(false);
        setRejectReason("");
      } else {
        toast.error(data.message || "Rejection failed");
      }
    } catch (error) {
       console.error("KYC Rejection error:", error);
       toast.error("An error occurred during rejection");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "approved": 
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Verified
            </div>
        );
      case "pending": 
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase border border-amber-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                In Queue
            </div>
        );
      case "rejected": 
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase border border-red-100">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Declined
            </div>
        );
      default: return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto flex flex-col justify-center items-center py-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: themeColors.text }}>Accessing ID Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">KYC Verification</h1>
            <p className="text-sm font-medium text-slate-500">Screen and authorize member identity documents for network activation.</p>
          </div>
          <button 
            onClick={fetchKYCRequests}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50 shadow-lg"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Syncing..." : "Refresh Queue"}
          </button>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
                { label: "New Requests", count: kycRequests.filter(k => k.status === "pending").length, color: "text-amber-600", bgColor: "bg-amber-50" },
                { label: "Verified IDs", count: kycRequests.filter(k => k.status === "approved").length, color: "text-emerald-600", bgColor: "bg-emerald-50" },
                { label: "Declined", count: kycRequests.filter(k => k.status === "rejected").length, color: "text-red-600", bgColor: "bg-red-50" },
                { label: "Total Handled", count: kycRequests.length, color: "text-slate-600", bgColor: "bg-slate-100" }
            ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-black ${stat.color}`}>{stat.count}</span>
                        <span className="text-[10px] font-bold text-slate-300">DOCS</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 border-r border-slate-100 pr-5">
                <FaFilter className="text-slate-400 text-xs" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Filter:</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'approved', 'rejected'].map(st => (
                    <button 
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filterStatus === st 
                            ? 'bg-slate-800 text-white shadow-md' 
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        {st === 'pending' ? 'Pending' : st === 'approved' ? 'Approved' : st === 'rejected' ? 'Rejected' : 'Show All'}
                    </button>
                ))}
            </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Applicant Identity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Details</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kycRequests.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-3 opacity-20">
                                <FaIdCard size={40} />
                                <p className="font-black uppercase tracking-widest text-xs">No Pending Requests</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                  kycRequests.map((kyc) => (
                    <tr key={kyc.id || kyc._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 border border-slate-200 uppercase text-xs">
                                {kyc.userName?.charAt(0)}
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{kyc.userName}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Applied: {kyc.submitDate}</div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                            <div className="text-[12px] font-black text-slate-700">{kyc.phone}</div>
                            <div className="text-[10px] font-bold text-slate-400 lowercase">{kyc.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(kyc.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setSelectedKYC(kyc); setShowKYCModal(true); }} 
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-black text-[10px] uppercase tracking-wider border border-slate-200 transition-all">
                            Review
                          </button>
                          {kyc.status === "pending" && (
                            <>
                              <button onClick={() => handleApproveKYC(kyc.id || kyc._id)} 
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm">
                                <FaCheck />
                              </button>
                              <button onClick={() => { setSelectedKYC(kyc); setShowRejectModal(true); }} 
                                className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-all shadow-sm">
                                <FaTimes />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showKYCModal && selectedKYC && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 w-full max-w-4xl shadow-2xl border border-slate-200 relative my-auto">
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        <FaIdCard className="text-slate-400" />
                        Verification Analysis
                    </h3>
                    <button onClick={() => setShowKYCModal(false)} className="text-slate-400 hover:text-slate-800 text-2xl font-bold">×</button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Profile Identity</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { icon: FaUserAlt, label: "Full Applicant Name", val: selectedKYC.kycData?.fullName },
                                    { icon: FaMapMarkerAlt, label: "Permanent Address", val: selectedKYC.kycData?.address },
                                    { icon: FaIdCard, label: "Income Tax PAN", val: selectedKYC.kycData?.panCard },
                                    { icon: FaIdCard, label: "Aadhar UID Number", val: selectedKYC.kycData?.aadharCard }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <item.icon className="text-slate-400 text-sm" />
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-400 mb-0.5">{item.label}</p>
                                            <p className="text-sm font-black text-slate-700 tracking-tight">{item.val || "Unavailable"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Document Evidence</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'PAN Front', img: selectedKYC.kycData?.panImage },
                                { label: 'Aadhar Front', img: selectedKYC.kycData?.aadharFrontImage },
                                { label: 'Aadhar Back', img: selectedKYC.kycData?.aadharBackImage },
                                { label: 'Selfie Proof', img: selectedKYC.kycData?.selfie }
                            ].map((doc, i) => (
                                <div key={i} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video cursor-zoom-in" 
                                    onClick={() => window.open(doc.img, '_blank')}>
                                    {doc.img ? (
                                        <img src={doc.img} alt={doc.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-[10px] font-black text-slate-300 uppercase">Missing</div>
                                    )}
                                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 backdrop-blur-sm p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest block text-center">{doc.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {selectedKYC.status === "pending" && (
                    <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3 justify-end">
                        <button onClick={() => setShowRejectModal(true)} 
                            className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all border border-red-100">
                            Decline Request
                        </button>
                        <button onClick={() => { handleApproveKYC(selectedKYC.id || selectedKYC._id); setShowKYCModal(false); }} 
                            className="px-8 py-3 bg-slate-800 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 shadow-lg transition-all active:scale-95">
                            Approve Identity
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedKYC && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-6">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200">
                <h3 className="text-lg font-black uppercase text-slate-800 tracking-tight mb-2">Rejection Feedback</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Explain why this KYC is being declined.</p>
                
                <textarea
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500/10 focus:outline-none transition-all text-sm font-medium"
                    rows="4"
                    placeholder="e.g. Photo not clear, Name mismatch..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
                
                <div className="flex gap-2 mt-6">
                    <button onClick={() => { setShowRejectModal(false); setRejectReason(""); }} 
                        className="flex-1 px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors border border-slate-200">
                        Cancel
                    </button>
                    <button onClick={() => handleRejectKYC(selectedKYC.id || selectedKYC._id, rejectReason)} 
                        disabled={!rejectReason.trim()} 
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20">
                        Confirm Rejection
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default KYCApproval;