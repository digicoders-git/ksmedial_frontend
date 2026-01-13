import { useState, useEffect } from "react";
import { FaEye, FaTimes, FaCheck, FaHistory, FaUniversity, FaCheckCircle, FaWallet } from "react-icons/fa";
import { toast } from "sonner";
import { API_ENDPOINTS, buildUrl } from "../config/api";
import { useTheme } from "../context/ThemeContext";

const Withdrawal = () => {
  const { theme, themeColors } = useTheme();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // Fetch withdrawal requests from API (only KYC verified users)
  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildUrl(API_ENDPOINTS.WITHDRAWAL.ALL, { status: filterStatus }));
      const data = await response.json();
      
      if (response.ok) {
        setWithdrawalRequests(data.withdrawals || []);
      } else {
        toast.error(data.message || "Failed to fetch withdrawal requests");
      }
    } catch (error) {
      console.error("Fetch withdrawals error:", error);
      toast.error("Failed to fetch withdrawal requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  // Backend already filters KYC verified users, so no need for additional filtering
  const filteredRequests = withdrawalRequests;

  const handleApproveRequest = async (requestId) => {
    try {
      const response = await fetch(API_ENDPOINTS.WITHDRAWAL.APPROVE(requestId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: "ADMIN_001" }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Request approved successfully!");
        fetchWithdrawalRequests();
      } else {
        toast.error(data.message || "Failed to approve request");
      }
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await fetch(API_ENDPOINTS.WITHDRAWAL.REJECT(requestId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: "ADMIN_001", reason: "Rejected by admin" }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Request rejected!");
        fetchWithdrawalRequests();
      } else {
        toast.error(data.message || "Failed to reject request");
      }
    } catch (error) {
      console.error("Reject error:", error);
      toast.error("Failed to reject request");
    }
  };

  const handleCompletePayment = async (requestId) => {
    try {
      const response = await fetch(API_ENDPOINTS.WITHDRAWAL.COMPLETE(requestId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: `TXN${Date.now()}` }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Payment completed successfully!");
        fetchWithdrawalRequests();
      } else {
        toast.error(data.message || "Failed to complete payment");
      }
    } catch (error) {
      console.error("Complete payment error:", error);
      toast.error("Failed to complete payment");
    }
  };


  const getStatusColor = (status) => {
    switch(status) {
      case "completed": return theme === 'dark' ? "bg-red-900/30 text-red-500" : "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>Withdrawal Management</h1>
          <p style={{ color: themeColors.textSecondary }}>Manage user withdrawal requests from the mobile app</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total Requests</p>
                <p className="text-2xl font-bold" style={{ color: themeColors.info }}>{withdrawalRequests.length}</p>
              </div>
              <FaHistory className="text-2xl" style={{ color: themeColors.info }} />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Pending</p>
                <p className="text-2xl font-bold" style={{ color: themeColors.warning }}>
                   {withdrawalRequests.filter(r => r.status === "pending").length}
                </p>
              </div>
              <FaTimes className="text-2xl" style={{ color: themeColors.warning }} />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Approved</p>
                <p className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#db2b1c' : '#166534' }}>
                  {withdrawalRequests.filter(r => r.status === "approved").length}
                </p>
              </div>
              <FaCheck className="text-2xl" style={{ color: theme === 'dark' ? '#db2b1c' : '#166534' }} />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total Amount</p>
                <p className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                  ₹{withdrawalRequests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                </p>
              </div>
              <FaWallet className="text-2xl" style={{ color: themeColors.primary }} />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="rounded-xl p-4 shadow-lg mb-8 border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium" style={{ color: themeColors.text }}>Filter by Status:</label>
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all" style={{ backgroundColor: themeColors.surface }}>All Requests</option>
              <option value="pending" style={{ backgroundColor: themeColors.surface }}>Pending</option>
              <option value="approved" style={{ backgroundColor: themeColors.surface }}>Approved</option>
              <option value="completed" style={{ backgroundColor: themeColors.surface }}>Completed</option>
              <option value="rejected" style={{ backgroundColor: themeColors.surface }}>Rejected</option>
            </select>
          </div>
        </div>

        {/* Withdrawal Requests Table */}
        <div className="rounded-xl shadow-lg overflow-hidden border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: themeColors.border }}>
            <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>Withdrawal Requests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: themeColors.background }}>
                <tr>
                  {[
                    "User",
                    "Amount",
                    "Method",
                    "Date",
                    "KYC Status",
                    "Status",
                    "Actions"
                  ].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: themeColors.border }}>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColors.primary }}></div>
                        <span className="ml-3" style={{ color: themeColors.textSecondary }}>Loading withdrawal requests...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center" style={{ color: themeColors.textSecondary }}>
                      No withdrawal requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium" style={{ color: themeColors.text }}>{request.userName}</div>
                          <div className="text-sm" style={{ color: themeColors.textSecondary }}>{request.userId}</div>
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-bold ${theme === 'dark' ? 'text-red-500' : 'text-green-600'}`}>
                        ₹{request.amount.toLocaleString()}
                      </span>
                      <div className="text-xs" style={{ color: themeColors.textSecondary }}>Fee: ₹{request.fee}</div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: themeColors.text }}>{request.method}</div>
                        <div className="text-sm" style={{ color: themeColors.textSecondary }}>{request.accountDetails}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: themeColors.text }}>
                        {request.date}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        request.kycStatus === "verified" 
                          ? theme === 'dark' ? "bg-red-900/30 text-red-500" : "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {request.kycStatus === "verified" ? "✓ Verified" : "✗ Not Verified"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRequestModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye />
                        </button>
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="hover:opacity-80"
                              style={{ color: theme === 'dark' ? '#db2b1c' : '#16a34a' }}
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {request.status === "approved" && (
                          <button
                            onClick={() => handleCompletePayment(request.id)}
                            className="px-3 py-1 text-white rounded text-xs hover:opacity-90"
                            style={{ backgroundColor: themeColors.primary }}
                          >
                            Mark as Paid
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

        {/* Request Details Modal */}
        {showRequestModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold" style={{ color: themeColors.text }}>Withdrawal Request Details</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-2xl hover:opacity-70 transition-opacity"
                  style={{ color: themeColors.textSecondary }}
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                  <h4 className="font-semibold mb-3" style={{ color: themeColors.text }}>Request Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span style={{ color: themeColors.textSecondary }}>Amount:</span> <span className="font-medium" style={{ color: theme === 'dark' ? '#db2b1c' : '#166534' }}>₹{selectedRequest.amount.toLocaleString()}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Fee:</span> <span className="font-medium" style={{ color: themeColors.text }}>₹{selectedRequest.fee}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Net Amount:</span> <span className="font-medium" style={{ color: themeColors.text }}>₹{(selectedRequest.amount - selectedRequest.fee).toLocaleString()}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Method:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.method}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Date:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.date}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Reference:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.referenceId}</span></div>
                  </div>
                </div>

                <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                  <h4 className="font-semibold mb-3" style={{ color: themeColors.text }}>User Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span style={{ color: themeColors.textSecondary }}>Name:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.userDetails.name}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Email:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.userDetails.email}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Phone:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.userDetails.phone}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Address:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.userDetails.address}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>PAN:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.userDetails.panCard}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Aadhar:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.userDetails.aadharCard}</span></div>
                  </div>
                </div>

                <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                  <h4 className="font-semibold mb-3" style={{ color: themeColors.text }}>Bank Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span style={{ color: themeColors.textSecondary }}>Account Number:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.bankAccount || selectedRequest.upiId || "N/A"}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>IFSC Code:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.ifscCode || "N/A"}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Account Holder:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedRequest.userDetails.name}</span></div>
                  </div>
                </div>

                <div className="rounded-lg p-4 md:col-span-2 lg:col-span-3" style={{ backgroundColor: themeColors.background }}>
                  <h4 className="font-semibold mb-3" style={{ color: themeColors.text }}>KYC Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div><span style={{ color: themeColors.textSecondary }}>PAN Image:</span> <span className="font-medium text-blue-500 cursor-pointer">{selectedRequest.userDetails.panImage}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Aadhar Image:</span> <span className="font-medium text-blue-500 cursor-pointer">{selectedRequest.userDetails.aadharImage}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Bank Passbook:</span> <span className="font-medium text-blue-500 cursor-pointer">{selectedRequest.userDetails.bankPassbook}</span></div>
                  </div>
                </div>
              </div>

              {selectedRequest.status === "pending" && (
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      handleRejectRequest(selectedRequest.id);
                      setShowRequestModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      handleApproveRequest(selectedRequest.id);
                      setShowRequestModal(false);
                    }}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-semibold"
                    style={{ backgroundColor: theme === 'dark' ? '#db2b1c' : '#16a34a' }}
                  >
                    Approve Request
                  </button>
                </div>
              )}

              {selectedRequest.status === "approved" && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      handleCompletePayment(selectedRequest.id);
                      setShowRequestModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Mark as Paid
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdrawal;