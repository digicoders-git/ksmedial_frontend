import { useState, useEffect, useCallback } from "react";
import { FaEye, FaTimes, FaCheck, FaHistory, FaUniversity, FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";
import { API_ENDPOINTS, buildUrl } from "../config/api";

const Withdrawal = () => {
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
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Withdrawal Management</h1>
          <p className="text-gray-600">Manage user withdrawal requests from the mobile app</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-blue-600">{withdrawalRequests.length}</p>
              </div>
              <FaHistory className="text-2xl text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {withdrawalRequests.filter(r => r.status === "pending").length}
                </p>
              </div>
              <FaTimes className="text-2xl text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {withdrawalRequests.filter(r => r.status === "approved").length}
                </p>
              </div>
              <FaCheck className="text-2xl text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{withdrawalRequests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                </p>
              </div>
              <FaWallet className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-8">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Withdrawal Requests Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Withdrawal Requests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">KYC Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading withdrawal requests...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No withdrawal requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                        <div className="text-sm text-gray-500">{request.userId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-green-600">
                        ₹{request.amount.toLocaleString()}
                      </span>
                      <div className="text-xs text-gray-500">Fee: ₹{request.fee}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.method}</div>
                      <div className="text-sm text-gray-500">{request.accountDetails}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        request.kycStatus === "verified" 
                          ? "bg-green-100 text-green-800" 
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
                              className="text-green-600 hover:text-green-900"
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
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
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
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Withdrawal Request Details</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Request Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Amount:</span> <span className="font-medium text-green-600">₹{selectedRequest.amount.toLocaleString()}</span></div>
                    <div><span className="text-gray-600">Fee:</span> <span className="font-medium">₹{selectedRequest.fee}</span></div>
                    <div><span className="text-gray-600">Net Amount:</span> <span className="font-medium">₹{(selectedRequest.amount - selectedRequest.fee).toLocaleString()}</span></div>
                    <div><span className="text-gray-600">Method:</span> <span className="font-medium">{selectedRequest.method}</span></div>
                    <div><span className="text-gray-600">Date:</span> <span className="font-medium">{selectedRequest.date}</span></div>
                    <div><span className="text-gray-600">Reference:</span> <span className="font-medium">{selectedRequest.referenceId}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">User Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedRequest.userDetails.name}</span></div>
                    <div><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedRequest.userDetails.email}</span></div>
                    <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{selectedRequest.userDetails.phone}</span></div>
                    <div><span className="text-gray-600">Address:</span> <span className="font-medium">{selectedRequest.userDetails.address}</span></div>
                    <div><span className="text-gray-600">PAN:</span> <span className="font-medium">{selectedRequest.userDetails.panCard}</span></div>
                    <div><span className="text-gray-600">Aadhar:</span> <span className="font-medium">{selectedRequest.userDetails.aadharCard}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Bank Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Account Number:</span> <span className="font-medium">{selectedRequest.bankAccount || selectedRequest.upiId || "N/A"}</span></div>
                    <div><span className="text-gray-600">IFSC Code:</span> <span className="font-medium">{selectedRequest.ifscCode || "N/A"}</span></div>
                    <div><span className="text-gray-600">Account Holder:</span> <span className="font-medium">{selectedRequest.userDetails.name}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 md:col-span-2 lg:col-span-3">
                  <h4 className="font-semibold text-gray-800 mb-3">KYC Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div><span className="text-gray-600">PAN Image:</span> <span className="font-medium text-blue-600 cursor-pointer">{selectedRequest.userDetails.panImage}</span></div>
                    <div><span className="text-gray-600">Aadhar Image:</span> <span className="font-medium text-blue-600 cursor-pointer">{selectedRequest.userDetails.aadharImage}</span></div>
                    <div><span className="text-gray-600">Bank Passbook:</span> <span className="font-medium text-blue-600 cursor-pointer">{selectedRequest.userDetails.bankPassbook}</span></div>
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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