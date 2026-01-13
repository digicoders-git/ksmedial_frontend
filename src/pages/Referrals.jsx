import { useState, useEffect } from "react";
import { FaUsers, FaEye, FaCoins, FaCalendar, FaSearch } from "react-icons/fa";
import { toast } from "sonner";

const Referrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    monthlyEarnings: 0
  });

  // Fetch referrals data
  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      // TODO: Get userId from auth context
      const userId = "USER001"; // Replace with actual user ID from auth
      
      const response = await fetch(`http://localhost:5000/api/mlm/referrals/${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setReferrals(data.referrals || []);
        calculateStats(data.referrals || []);
      } else {
        toast.error(data.message || "Failed to fetch referrals");
      }
    } catch (error) {
      console.error("Fetch referrals error:", error);
      toast.error("Failed to fetch referrals");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (referralsList) => {
    const total = referralsList.length;
    const active = referralsList.filter(r => r.isActive).length;
    const earnings = referralsList.reduce((sum, r) => sum + r.totalEarned, 0);
    
    setStats({
      totalReferrals: total,
      activeReferrals: active,
      totalEarnings: earnings,
      monthlyEarnings: earnings // TODO: Calculate actual monthly earnings
    });
  };

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = referral.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || referral.level.toString() === levelFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && referral.isActive) ||
                         (statusFilter === "inactive" && !referral.isActive);
    
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const getLevelColor = (level) => {
    switch(level) {
      case 1: return "bg-blue-100 text-blue-800";
      case 2: return "bg-green-100 text-green-800";
      case 3: return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading referrals...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Referrals</h1>
          <p className="text-gray-600">Track and manage your referral network</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Referrals</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalReferrals}</p>
              </div>
              <FaUsers className="text-2xl text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Referrals</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeReferrals}</p>
              </div>
              <FaUsers className="text-2xl text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₹{stats.totalEarnings.toLocaleString()}
                </p>
              </div>
              <FaCoins className="text-2xl text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">This Month</p>
                <p className="text-2xl font-bold text-orange-600">
                  ₹{stats.monthlyEarnings.toLocaleString()}
                </p>
              </div>
              <FaCalendar className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FaUsers className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-500">No referrals found matching your criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{referral.name}</div>
                          <div className="text-sm text-gray-500">{referral.email}</div>
                          <div className="text-sm text-gray-500">{referral.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(referral.level)}`}>
                          Level {referral.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(referral.isActive)}`}>
                          {referral.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(referral.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ₹{referral.totalEarned.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => {
                            setSelectedReferral(referral);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEye className="inline mr-1" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referral Details Modal */}
        {showModal && selectedReferral && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Referral Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Personal Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium">{selectedReferral.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedReferral.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedReferral.phone}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Join Date:</span>
                      <p className="font-medium">{new Date(selectedReferral.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Status & Level */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Status & Level</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Level:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getLevelColor(selectedReferral.level)}`}>
                          Level {selectedReferral.level}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReferral.isActive)}`}>
                          {selectedReferral.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Earnings</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Total Earnings:</span>
                      <p className="font-medium text-green-600">₹{selectedReferral.totalEarned.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Commission Rate:</span>
                      <p className="font-medium">
                        {selectedReferral.level === 1 ? "10%" : selectedReferral.level === 2 ? "5%" : "2%"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User ID */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">User ID</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">User ID:</span>
                      <p className="font-medium font-mono">{selectedReferral.userId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;