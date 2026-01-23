import { useState, useEffect } from "react";
import { FaUsers, FaEye, FaCoins, FaCalendar, FaSearch } from "react-icons/fa";
import { toast } from "sonner";
import { API_ENDPOINTS, isValidObjectId } from "../config/api";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Referrals = () => {
  const { theme, themeColors } = useTheme();
  const { admin } = useAuth();
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
    const fetchReferralsData = async () => {
      try {
        setLoading(true);
        // TODO: Use valid test User ID because Admin ID != User ID
        const userId = "696201cc6b80633495c40ae0";
        // const userId = admin?.id;
        
        if (!userId) {
          setLoading(false);
          return;
        }
        
        if (!isValidObjectId(userId)) {
          console.error("Invalid User ID:", userId);
          setLoading(false);
          return;
        }
        
        const response = await fetch(API_ENDPOINTS.REFERAL.REFERRALS(userId));
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Server returned an invalid response");
        }
        
        if (response.ok) {
          setReferrals(data.referrals || []);
          calculateStats(data.referrals || []);
        } else {
          toast.error(data.message || "Failed to fetch referrals");
        }
      } catch (error) {
        console.error("Fetch referrals error:", error);
        toast.error(error.message || "Failed to fetch referrals");
      } finally {
        setLoading(false);
      }
    };

    fetchReferralsData();
  }, [admin]);

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
      case 2: return theme === 'dark' ? "bg-red-900/30 text-red-500" : "bg-green-100 text-green-800";
      case 3: return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (isActive) => {
    if (isActive) {
      return theme === 'dark' ? "bg-red-900/30 text-red-500" : "bg-green-100 text-green-800";
    }
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
            <span className="ml-3" style={{ color: themeColors.textSecondary }}>Loading referrals...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!admin?.id && false) {
    return (
       <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: themeColors.background }}>
        <div className="p-8 rounded-xl shadow-lg text-center max-w-md" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>Please Log In</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>My Referrals</h1>
          <p style={{ color: themeColors.textSecondary }}>Track and manage your referral network</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total Referrals</p>
                <p className="text-2xl font-bold" style={{ color: themeColors.text }}>{stats.totalReferrals}</p>
              </div>
              <FaUsers className="text-2xl text-blue-500" />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Active Referrals</p>
                <p className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#db2b1c' : '#166534' }}>{stats.activeReferrals}</p>
              </div>
              <FaUsers className={theme === 'dark' ? 'text-2xl text-red-500' : 'text-2xl text-green-600'} />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total Earnings</p>
                <p className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#db2b1c' : '#166534' }}>₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
              <FaCoins className={theme === 'dark' ? 'text-2xl text-red-500' : 'text-2xl text-green-600'} />
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>This Month</p>
                <p className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#f97316' : '#ea580c' }}>
                  ₹{stats.monthlyEarnings.toLocaleString()}
                </p>
              </div>
              <FaCalendar className="text-2xl" style={{ color: theme === 'dark' ? '#f97316' : '#ea580c' }} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl p-6 shadow-lg mb-8 border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all" style={{ backgroundColor: themeColors.surface }}>All Levels</option>
              <option value="1" style={{ backgroundColor: themeColors.surface }}>Level 1</option>
              <option value="2" style={{ backgroundColor: themeColors.surface }}>Level 2</option>
              <option value="3" style={{ backgroundColor: themeColors.surface }}>Level 3</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all" style={{ backgroundColor: themeColors.surface }}>All Status</option>
              <option value="active" style={{ backgroundColor: themeColors.surface }}>Active</option>
              <option value="inactive" style={{ backgroundColor: themeColors.surface }}>Inactive</option>
            </select>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="rounded-xl shadow-lg overflow-hidden border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: themeColors.background }}>
                <tr>
                  {[
                    "Referral Details",
                    "Level",
                    "Status",
                    "Join Date",
                    "Earnings",
                    "Actions"
                  ].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: themeColors.border }}>
                {filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FaUsers className="mx-auto text-4xl mb-4 opacity-50" style={{ color: themeColors.textSecondary }} />
                      <p style={{ color: themeColors.textSecondary }}>No referrals found matching your criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((referral) => (
                    <tr key={referral.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium" style={{ color: themeColors.text }}>{referral.name}</div>
                          <div className="text-sm" style={{ color: themeColors.textSecondary }}>{referral.email}</div>
                          <div className="text-sm" style={{ color: themeColors.textSecondary }}>{referral.phone}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: themeColors.text }}>
                        {new Date(referral.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: theme === 'dark' ? '#db2b1c' : '#16a34a' }}>
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
            <div className="rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold" style={{ color: themeColors.text }}>Referral Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-2xl hover:opacity-70 transition-opacity"
                  style={{ color: themeColors.textSecondary }}
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                  <h4 className="font-semibold mb-3" style={{ color: themeColors.text }}>Personal Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm" style={{ color: themeColors.textSecondary }}>Name:</span>
                      <p className="font-medium" style={{ color: themeColors.text }}>{selectedReferral.name}</p>
                    </div>
                    <div>
                      <span className="text-sm" style={{ color: themeColors.textSecondary }}>Email:</span>
                      <p className="font-medium" style={{ color: themeColors.text }}>{selectedReferral.email}</p>
                    </div>
                    <div>
                      <span className="text-sm" style={{ color: themeColors.textSecondary }}>Phone:</span>
                      <p className="font-medium" style={{ color: themeColors.text }}>{selectedReferral.phone}</p>
                    </div>
                    <div>
                      <span className="text-sm" style={{ color: themeColors.textSecondary }}>Join Date:</span>
                      <p className="font-medium" style={{ color: themeColors.text }}>{new Date(selectedReferral.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Status & Level */}
                <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                  <h4 className="font-semibold mb-3" style={{ color: themeColors.text }}>Status & Level</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm" style={{ color: themeColors.textSecondary }}>Level:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getLevelColor(selectedReferral.level)}`}>
                          Level {selectedReferral.level}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm" style={{ color: themeColors.textSecondary }}>Status:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReferral.isActive)}`}>
                          {selectedReferral.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings Information */}
                <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                  <h4 className="font-semibold mb-3" style={{ color: themeColors.text }}>Earnings</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm" style={{ color: themeColors.textSecondary }}>Total Earnings:</span>
                      <p className="font-medium" style={{ color: theme === 'dark' ? '#db2b1c' : '#16a34a' }}>₹{selectedReferral.totalEarned.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm" style={{ color: themeColors.textSecondary }}>Commission Rate:</span>
                      <p className="font-medium" style={{ color: themeColors.text }}>
                        {selectedReferral.level === 1 ? "10%" : selectedReferral.level === 2 ? "5%" : "2%"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User ID */}
                <div className="rounded-lg p-4" style={{ backgroundColor: themeColors.background }}>
                  <h4 className="font-semibold mb-3" style={{ color: themeColors.text }}>User ID</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm" style={{ color: themeColors.textSecondary }}>User ID:</span>
                      <p className="font-medium font-mono" style={{ color: themeColors.text }}>{selectedReferral.userId}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg transition-colors"
                  style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
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