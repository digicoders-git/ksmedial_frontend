import { useState, useEffect, useCallback } from "react";
import { FaHistory, FaCheck, FaTimes, FaWallet, FaEye, FaSyncAlt, FaFilter } from "react-icons/fa";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";
import { withdrawalAPI } from "../services/api";

const Withdrawal = () => {
  const { themeColors } = useTheme();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  const fetchWithdrawalRequests = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await withdrawalAPI.getAllWithdrawals(filterStatus);
      setWithdrawalRequests(Array.isArray(data) ? data : (data.withdrawals || data.data || []));
    } catch (error) {
      console.error("Withdrawal fetch error:", error);
      toast.error("Failed to fetch withdrawal requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [fetchWithdrawalRequests]);

  const handleApproveRequest = async (requestId) => {
    try {
      const data = await withdrawalAPI.approveWithdrawal(requestId);
      if (data.status === "success" || data.success) {
        toast.success("Request approved!");
        fetchWithdrawalRequests();
      } else {
        toast.error(data.message || "Approval failed");
      }
    } catch (error) {
       toast.error("An error occurred during approval");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const data = await withdrawalAPI.rejectWithdrawal(requestId);
      if (data.status === "success" || data.success) {
        toast.success("Request rejected!");
        fetchWithdrawalRequests();
      } else {
        toast.error(data.message || "Rejection failed");
      }
    } catch (error) {
       toast.error("An error occurred during rejection");
    }
  };

  const handleCompletePayment = async (requestId) => {
    try {
      const data = await withdrawalAPI.completeWithdrawal(requestId);
      if (data.status === "success" || data.success) {
        toast.success("Payment marked as completed!");
        fetchWithdrawalRequests();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
       toast.error("An error occurred during payment completion");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "completed": 
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Paid
            </div>
        );
      case "pending": 
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase border border-amber-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Queued
            </div>
        );
      case "approved": 
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Approved
            </div>
        );
      case "rejected": 
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase border border-red-100">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Rejected
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
          <p className="text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: themeColors.text }}>Loading Settlements...</p>
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
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Withdrawal Requests</h1>
            <p className="text-sm font-medium text-slate-500">Process and manage member payout settlements from their wallet balance.</p>
          </div>
          <button 
            onClick={fetchWithdrawalRequests}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50 shadow-lg"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Updating..." : "Refresh Queue"}
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
                { label: "New Requests", count: withdrawalRequests.filter(r => r.status === "pending").length, color: "text-amber-600", bgColor: "bg-amber-50" },
                { label: "Approved", count: withdrawalRequests.filter(r => r.status === "approved").length, color: "text-blue-600", bgColor: "bg-blue-50" },
                { label: "Settled/Paid", count: withdrawalRequests.filter(r => r.status === "completed").length, color: "text-emerald-600", bgColor: "bg-emerald-50" },
                { label: "Volume Paid", count: `₹${withdrawalRequests.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString()}`, color: "text-slate-800", bgColor: "bg-slate-100" }
            ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-black ${stat.color}`}>{stat.count}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Filtering Options */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 border-r border-slate-100 pr-5">
                <FaFilter className="text-slate-400 text-xs" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Filter By:</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'approved', 'completed', 'rejected'].map(st => (
                    <button 
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            filterStatus === st 
                            ? 'bg-slate-800 text-white shadow-md' 
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        {st === 'pending' ? 'Pending' : st === 'approved' ? 'Approved' : st === 'completed' ? 'Settled' : st === 'rejected' ? 'Rejected' : 'Show All'}
                    </button>
                ))}
            </div>
        </div>

        {/* Withdrawal List Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Beneficiary Member</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Settlement Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Payout Details</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {withdrawalRequests.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-3 opacity-20">
                                <FaWallet size={40} />
                                <p className="font-black uppercase tracking-widest text-xs">No Recent Requests</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                  withdrawalRequests.map((request) => (
                    <tr key={request.id || request._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-800 uppercase tracking-tight">{request.userName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ID: {request.userId}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-base font-black text-slate-900 tracking-tight">₹{request.amount?.toLocaleString()}</div>
                        <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Processing Fee Deducted</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[11px] font-black text-slate-700 uppercase">{request.method}</div>
                        <div className="text-[10px] font-medium text-slate-400 line-clamp-1">{request.accountDetails}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setSelectedRequest(request); setShowRequestModal(true); }} 
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg border border-slate-200 transition-all">
                            <FaEye />
                          </button>
                          {request.status === "pending" && (
                            <>
                              <button onClick={() => handleApproveRequest(request.id || request._id)} 
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-all">
                                <FaCheck />
                              </button>
                              <button onClick={() => handleRejectRequest(request.id || request._id)} 
                                className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-all">
                                <FaTimes />
                              </button>
                            </>
                          )}
                          {request.status === "approved" && (
                            <button onClick={() => handleCompletePayment(request.id || request._id)} 
                                className="px-4 py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-700 transform active:scale-95 transition-all shadow-md">
                                Mark Settled
                            </button>
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
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl border border-slate-200 relative my-auto">
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                        <FaWallet className="text-slate-400" />
                        Payout Details
                    </h3>
                    <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-800 text-2xl font-bold">×</button>
                </div>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Requested amount</p>
                            <div className="text-3xl font-black text-slate-900 tracking-tight">₹{selectedRequest.amount?.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Applicant Member</p>
                            <div className="text-sm font-black text-slate-700 uppercase tracking-tight">{selectedRequest.userName}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">ID: {selectedRequest.userId}</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest text-center border-b border-slate-50 pb-3">Destination Account</p>
                        <div className="text-center">
                            <div className="px-4 py-1.5 bg-slate-800 text-white rounded-full inline-block text-[10px] font-black uppercase tracking-widest mb-3">
                                {selectedRequest.method}
                            </div>
                            <div className="text-sm font-black text-slate-700 tracking-tight leading-relaxed max-w-md mx-auto block break-all">
                                {selectedRequest.accountDetails}
                            </div>
                        </div>
                    </div>

                    {selectedRequest.status === "pending" && (
                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <button onClick={() => { handleRejectRequest(selectedRequest.id || selectedRequest._id); setShowRequestModal(false); }} 
                                className="px-6 py-4 bg-red-50 text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all border border-red-100">
                                Decline
                            </button>
                            <button onClick={() => { handleApproveRequest(selectedRequest.id || selectedRequest._id); setShowRequestModal(false); }} 
                                className="px-6 py-4 bg-slate-800 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 shadow-xl transition-all active:scale-95">
                                Approve Request
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawal;