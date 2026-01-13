import { useState, useEffect } from "react";
import { FaIdCard, FaEye, FaCheck, FaTimes, FaUser, FaFileImage, FaDownload, FaHistory } from "react-icons/fa";
import { toast } from "sonner";

const KYCApproval = () => {
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
      const response = await fetch(`http://localhost:5000/api/kyc/all?status=${filterStatus}`);
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
      const response = await fetch(`http://localhost:5000/api/kyc/approve/${kycId}`, {
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
      const response = await fetch(`http://localhost:5000/api/kyc/reject/${kycId}`, {
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
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">KYC Approval Management</h1>
          <p className="text-gray-600">Review and approve user KYC documents from the mobile app</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total KYC</p>
                <p className="text-2xl font-bold text-blue-600">{kycRequests.length}</p>
              </div>
              <FaIdCard className="text-2xl text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {kycRequests.filter(k => k.status === "pending").length}
                </p>
              </div>
              <FaHistory className="text-2xl text-yellow-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {kycRequests.filter(k => k.status === "approved").length}
                </p>
              </div>
              <FaCheck className="text-2xl text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {kycRequests.filter(k => k.status === "rejected").length}
                </p>
              </div>
              <FaTimes className="text-2xl text-red-600" />
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
              <option value="all">All KYC</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* KYC Requests Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">KYC Verification Requests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Submit Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading KYC requests...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No KYC requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((kyc) => (
                  <tr key={kyc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{kyc.userName}</div>
                          <div className="text-sm text-gray-500">{kyc.userId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{kyc.email}</div>
                      <div className="text-sm text-gray-500">{kyc.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                              className="text-green-600 hover:text-green-900"
                              title="Approve KYC"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedKYC(kyc);
                                setShowRejectModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
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
            <div className="bg-white rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">KYC Verification Details</h3>
                <button
                  onClick={() => setShowKYCModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Full Name:</span> <span className="font-medium">{selectedKYC.kycData.fullName}</span></div>
                    <div><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedKYC.email}</span></div>
                    <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{selectedKYC.phone}</span></div>
                    <div><span className="text-gray-600">Address:</span> <span className="font-medium">{selectedKYC.kycData.address}</span></div>
                    <div><span className="text-gray-600">PAN Number:</span> <span className="font-medium">{selectedKYC.kycData.panCard}</span></div>
                    <div><span className="text-gray-600">Aadhar Number:</span> <span className="font-medium">{selectedKYC.kycData.aadharCard}</span></div>
                    <div><span className="text-gray-600">Submit Date:</span> <span className="font-medium">{selectedKYC.submitDate}</span></div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Verification Status</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Current Status:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedKYC.status)}`}>
                          {selectedKYC.status.charAt(0).toUpperCase() + selectedKYC.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    {selectedKYC.approvedDate && (
                      <div><span className="text-gray-600">Approved Date:</span> <span className="font-medium text-green-600">{selectedKYC.approvedDate}</span></div>
                    )}
                    {selectedKYC.rejectedDate && (
                      <div><span className="text-gray-600">Rejected Date:</span> <span className="font-medium text-red-600">{selectedKYC.rejectedDate}</span></div>
                    )}
                    {selectedKYC.rejectReason && (
                      <div>
                        <span className="text-gray-600">Reject Reason:</span>
                        <p className="font-medium text-red-600 mt-1">{selectedKYC.rejectReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-4">KYC Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaFileImage className="text-blue-600" />
                      PAN Card
                    </h5>
                    <img 
                      src={selectedKYC.kycData.panImage} 
                      alt="PAN Card" 
                      className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(selectedKYC.kycData.panImage, '_blank')}
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaFileImage className="text-green-600" />
                      Aadhar Front
                    </h5>
                    <img 
                      src={selectedKYC.kycData.aadharFrontImage} 
                      alt="Aadhar Front" 
                      className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(selectedKYC.kycData.aadharFrontImage, '_blank')}
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaFileImage className="text-green-600" />
                      Aadhar Back
                    </h5>
                    <img 
                      src={selectedKYC.kycData.aadharBackImage} 
                      alt="Aadhar Back" 
                      className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(selectedKYC.kycData.aadharBackImage, '_blank')}
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaFileImage className="text-purple-600" />
                      Bank Passbook
                    </h5>
                    <img 
                      src={selectedKYC.kycData.bankPassbook} 
                      alt="Bank Passbook" 
                      className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(selectedKYC.kycData.bankPassbook, '_blank')}
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaUser className="text-orange-600" />
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Reject KYC</h3>
              <p className="text-gray-600 mb-4">Please provide a reason for rejecting this KYC:</p>
              
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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