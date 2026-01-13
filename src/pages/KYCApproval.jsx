import { useState, useEffect } from "react";
import { FaEye, FaTimes, FaCheck, FaFileAlt, FaUser, FaIdCard, FaCheckCircle, FaHistory, FaFileImage } from "react-icons/fa";
import { toast } from "sonner";
import { API_ENDPOINTS, buildUrl } from "../config/api";
import { useTheme } from "../context/ThemeContext";

const KYCApproval = () => {
  const { theme, themeColors } = useTheme();
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [kycRequests, setKycRequests] = useState([]);

  // Fetch KYC requests from API
  const fetchKYCRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildUrl(API_ENDPOINTS.KYC.ALL, { status: filterStatus }));
      const data = await response.json();
      
      if (response.ok) {
        setKycRequests(data.kycRequests || []);
      } else {
        toast.error(data.message || "Failed to fetch KYC requests");
      }
    } catch (error) {
      console.error("Fetch KYC error:", error);
      toast.error("Failed to fetch KYC requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const filteredRequests = kycRequests.filter(request => 
    filterStatus === "all" || request.status === filterStatus
  );

  const handleApproveKYC = async (kycId) => {
    try {
      const response = await fetch(API_ENDPOINTS.KYC.APPROVE(kycId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: "ADMIN_001" }), // TODO: Get from auth context
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("KYC approved successfully!");
        fetchKYCRequests(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to approve KYC");
      }
    } catch (error) {
      console.error("Approve KYC error:", error);
      toast.error("Failed to approve KYC");
    }
  };

  const handleRejectKYC = async (kycId, reason) => {
    try {
      const response = await fetch(API_ENDPOINTS.KYC.REJECT(kycId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          adminId: "ADMIN_001", // TODO: Get from auth context
          reason 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowRejectModal(false);
        setRejectReason("");
        toast.success("KYC rejected successfully!");
        fetchKYCRequests(); // Refresh the list
      } else {
        toast.error(data.message || "Failed to reject KYC");
      }
    } catch (error) {
      console.error("Reject KYC error:", error);
      toast.error("Failed to reject KYC");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "approved": return theme === 'dark' ? "bg-red-900/30 text-red-400" : "bg-green-100 text-green-800";
      case "pending": return theme === 'dark' ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-800";
      case "rejected": return theme === 'dark' ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-800";
      default: return theme === 'dark' ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>KYC Approval Management</h1>
          <p style={{ color: themeColors.textSecondary }}>Review and approve user KYC documents from the mobile app</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total KYC</p>
                <p className="text-2xl font-bold" style={{ color: themeColors.info }}>{kycRequests.length}</p>
              </div>
              <FaIdCard className="text-2xl" style={{ color: themeColors.info }} />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Pending</p>
                <p className="text-2xl font-bold" style={{ color: themeColors.warning }}>
                  {kycRequests.filter(k => k.status === "pending").length}
                </p>
              </div>
              <FaHistory className="text-2xl" style={{ color: themeColors.warning }} />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Approved</p>
                <p className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#db2b1c' : '#166534' }}>
                  {kycRequests.filter(k => k.status === "approved").length}
                </p>
              </div>
              <FaCheck className="text-2xl" style={{ color: theme === 'dark' ? '#db2b1c' : '#166534' }} />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Rejected</p>
                <p className="text-2xl font-bold" style={{ color: themeColors.danger }}>
                  {kycRequests.filter(k => k.status === "rejected").length}
                </p>
              </div>
              <FaTimes className="text-2xl" style={{ color: themeColors.danger }} />
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
              <option value="all" style={{ backgroundColor: themeColors.surface }}>All KYC</option>
              <option value="pending" style={{ backgroundColor: themeColors.surface }}>Pending</option>
              <option value="approved" style={{ backgroundColor: themeColors.surface }}>Approved</option>
              <option value="rejected" style={{ backgroundColor: themeColors.surface }}>Rejected</option>
            </select>
          </div>
        </div>

        {/* KYC Requests Table */}
        <div className="rounded-xl shadow-lg overflow-hidden border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: themeColors.border }}>
            <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>KYC Verification Requests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: themeColors.background }}>
                <tr>
                  {[
                    "User",
                    "Contact",
                    "Submit Date",
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
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColors.primary }}></div>
                        <span className="ml-3" style={{ color: themeColors.textSecondary }}>Loading KYC requests...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center" style={{ color: themeColors.textSecondary }}>
                      No KYC requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((kyc) => (
                    <tr key={kyc.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaUser style={{ color: themeColors.textSecondary }} className="mr-3" />
                          <div>
                            <div className="text-sm font-medium" style={{ color: themeColors.text }}>{kyc.userName}</div>
                            <div className="text-sm" style={{ color: themeColors.textSecondary }}>{kyc.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm" style={{ color: themeColors.text }}>{kyc.email}</div>
                        <div className="text-sm" style={{ color: themeColors.textSecondary }}>{kyc.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: themeColors.text }}>
                        {kyc.submitDate}
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(kyc.status)}`}>
                        {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedKYC(kyc);
                            setShowKYCModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View KYC Details"
                        >
                          <FaEye />
                        </button>
                        {kyc.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveKYC(kyc.id)}
                              className="hover:opacity-80"
                              style={{ color: theme === 'dark' ? '#db2b1c' : '#16a34a' }}
                              title="Approve KYC"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedKYC(kyc);
                                setShowRejectModal(true);
                              }}
                              className="text-red-500 hover:opacity-80 transition-opacity"
                              title="Reject KYC"
                            >
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

        {/* KYC Details Modal */}
        {showKYCModal && selectedKYC && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold" style={{ color: themeColors.text }}>KYC Verification Details</h3>
                <button
                  onClick={() => setShowKYCModal(false)}
                  className="text-2xl hover:opacity-70 transition-opacity"
                  style={{ color: themeColors.textSecondary }}
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Information */}
                <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                  <h4 className="font-semibold mb-3" style={{ color: themeColors.text }}>Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span style={{ color: themeColors.textSecondary }}>Full Name:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedKYC.kycData.fullName}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Email:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedKYC.email}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Phone:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedKYC.phone}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Address:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedKYC.kycData.address}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>PAN Number:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedKYC.kycData.panCard}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Aadhar Number:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedKYC.kycData.aadharCard}</span></div>
                    <div><span style={{ color: themeColors.textSecondary }}>Submit Date:</span> <span className="font-medium" style={{ color: themeColors.text }}>{selectedKYC.submitDate}</span></div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                  <h4 className="font-semibold mb-3" style={{ color: themeColors.text }}>Verification Status</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span style={{ color: themeColors.textSecondary }}>Current Status:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedKYC.status)}`}>
                          {selectedKYC.status.charAt(0).toUpperCase() + selectedKYC.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {selectedKYC.approvedDate && (
                      <div><span style={{ color: themeColors.textSecondary }}>Approved Date:</span> <span className="font-medium" style={{ color: theme === 'dark' ? '#db2b1c' : '#16a34a' }}>{selectedKYC.approvedDate}</span></div>
                    )}
                    {selectedKYC.rejectedDate && (
                      <div><span style={{ color: themeColors.textSecondary }}>Rejected Date:</span> <span className="font-medium text-red-500">{selectedKYC.rejectedDate}</span></div>
                    )}
                    {selectedKYC.rejectReason && (
                      <div>
                        <span style={{ color: themeColors.textSecondary }}>Reject Reason:</span>
                        <p className="font-medium text-red-500 mt-1">{selectedKYC.rejectReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <div className="mt-6">
                <h4 className="font-semibold mb-4" style={{ color: themeColors.text }}>KYC Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                    <h5 className="font-medium mb-2 flex items-center gap-2" style={{ color: themeColors.text }}>
                      <FaFileImage className="text-blue-500" />
                      PAN Card
                    </h5>
                    <img 
                      src={selectedKYC.kycData.panImage} 
                      alt="PAN Card" 
                      className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(selectedKYC.kycData.panImage, '_blank')}
                    />
                  </div>
                  
                  <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                    <h5 className="font-medium mb-2 flex items-center gap-2" style={{ color: themeColors.text }}>
                      <FaFileImage style={{ color: theme === 'dark' ? '#db2b1c' : '#16a34a' }} />
                      Aadhar Front
                    </h5>
                    <img 
                      src={selectedKYC.kycData.aadharFrontImage} 
                      alt="Aadhar Front" 
                      className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(selectedKYC.kycData.aadharFrontImage, '_blank')}
                    />
                  </div>
                  
                  <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                    <h5 className="font-medium mb-2 flex items-center gap-2" style={{ color: themeColors.text }}>
                      <FaFileImage style={{ color: theme === 'dark' ? '#db2b1c' : '#16a34a' }} />
                      Aadhar Back
                    </h5>
                    <img 
                      src={selectedKYC.kycData.aadharBackImage} 
                      alt="Aadhar Back" 
                      className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(selectedKYC.kycData.aadharBackImage, '_blank')}
                    />
                  </div>
                  
                  <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                    <h5 className="font-medium mb-2 flex items-center gap-2" style={{ color: themeColors.text }}>
                      <FaFileImage className="text-purple-500" />
                      Bank Passbook
                    </h5>
                    <img 
                      src={selectedKYC.kycData.bankPassbook} 
                      alt="Bank Passbook" 
                      className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(selectedKYC.kycData.bankPassbook, '_blank')}
                    />
                  </div>
                  
                  <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                    <h5 className="font-medium mb-2 flex items-center gap-2" style={{ color: themeColors.text }}>
                      <FaUser className="text-orange-500" />
                      Selfie
                    </h5>
                    <img 
                      src={selectedKYC.kycData.selfie} 
                      alt="User Selfie" 
                      className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(selectedKYC.kycData.selfie, '_blank')}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedKYC.status === "pending" && (
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject KYC
                  </button>
                  <button
                    onClick={() => {
                      handleApproveKYC(selectedKYC.id);
                      setShowKYCModal(false);
                    }}
                    className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-semibold"
                    style={{ backgroundColor: theme === 'dark' ? '#db2b1c' : '#16a34a' }}
                  >
                    Approve KYC
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedKYC && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.text }}>Reject KYC</h3>
              <p className="mb-4" style={{ color: themeColors.textSecondary }}>Please provide a reason for rejecting this KYC:</p>
              
              <textarea
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                rows="4"
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg transition-colors"
                  style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectKYC(selectedKYC.id, rejectReason)}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCApproval;