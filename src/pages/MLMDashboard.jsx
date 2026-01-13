import { useState, useEffect } from "react";
import { FaUsers, FaCoins, FaWallet, FaChartLine, FaCopy } from "react-icons/fa";
import { toast } from "sonner";
import { API_ENDPOINTS, isValidObjectId } from "../config/api";
import { useTheme } from "../context/ThemeContext";

const MLMStatCard = (props) => {
  const { icon: CardIcon, title, value, color, bgColor, themeColors } = props;
  return (
    <div className="rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: themeColors.text }}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <CardIcon className={`text-xl ${color}`} />
        </div>
      </div>
    </div>
  );
};

const MLMDashboard = () => {
  const [mlmData, setMlmData] = useState({
    referralCode: "",
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    availableBalance: 0,
    pendingWithdrawal: 0,
    level1Referrals: 0,
    level2Referrals: 0,
    level3Referrals: 0,
    monthlyEarnings: 0,
    recentTransactions: []
  });
  const { theme, themeColors } = useTheme();
  const [loading, setLoading] = useState(true);

  // Fetch MLM dashboard data
  useEffect(() => {
    fetchMLMData();
  }, []);

  const fetchMLMData = async () => {
    try {
      setLoading(true);
      // TODO: Get userId from auth context
      const userId = "65a1b2c3d4e5f6a7b8c9d0e1"; // Replace with actual user ID from auth
      
      if (!isValidObjectId(userId)) {
        setLoading(false);
        return; // Don't even try if ID is invalid
      }
      
      const response = await fetch(API_ENDPOINTS.MLM.DASHBOARD(userId));
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response");
      }
      
      if (response.ok) {
        setMlmData(data);
      } else {
        toast.error(data.message || "Failed to fetch MLM data");
      }
    } catch (error) {
      console.error("Fetch MLM data error:", error);
      toast.error(error.message || "Failed to fetch MLM data");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://ks4pharmanet.com/register?ref=${mlmData.referralCode}`);
    toast.success("Referral link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
            <span className="ml-3" style={{ color: themeColors.textSecondary }}>Loading MLM data...</span>
          </div>
        </div>
      </div>
    );
  }

  const testUserId = "65a1b2c3d4e5f6a7b8c9d0e1"; // Valid Hex ID 
  if (!isValidObjectId(testUserId)) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: themeColors.background }}>
        <div className="p-8 rounded-xl shadow-lg text-center max-w-md" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <div className="text-red-500 text-5xl mb-4 text-center flex justify-center">⚠️</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text }}>Invalid Session</h2>
          <p className="mb-6" style={{ color: themeColors.textSecondary }}>
            Your User ID format is invalid (<b>{testUserId}</b>). MongoDB expects a 24-character hex ID.
          </p>
          <div className="p-4 rounded-lg text-left text-sm mb-6" style={{ backgroundColor: themeColors.primary + "10", color: themeColors.primary }}>
            <p className="font-bold mb-1">How to fix:</p>
            <ol className="list-decimal ml-4">
              <li>Log in with a real account</li>
              <li>Or seed the database to get a test ID</li>
            </ol>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full text-white py-2 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: themeColors.primary }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold" style={{ color: themeColors.text }}>MLM Dashboard</h2>
          <p style={{ color: themeColors.textSecondary }}>Manage your referrals and track your earnings</p>
        </div>

        {/* Referral Code Section */}
        <div className="rounded-xl p-6 mb-8 text-white shadow-xl" style={{ backgroundColor: themeColors.primary }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Your Referral Code</h3>
              <p className="opacity-90">Share this code and earn rewards!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-lg p-3">
                <span className="font-mono text-lg font-bold">{mlmData.referralCode || "Loading..."}</span>
              </div>
              <button
                onClick={copyReferralCode}
                disabled={!mlmData.referralCode}
                className="bg-white px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all flex items-center gap-2 disabled:opacity-50"
                style={{ color: themeColors.primary }}
              >
                <FaCopy /> Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MLMStatCard
            icon={FaUsers}
            title="Total Referrals"
            value={mlmData.totalReferrals}
            color="text-blue-600"
            bgColor="bg-blue-100"
            themeColors={themeColors}
          />
          <MLMStatCard
            icon={FaCoins}
            title="Total Earnings"
            value={`₹${mlmData.totalEarnings.toLocaleString()}`}
            color={theme === 'dark' ? 'text-red-500' : 'text-green-600'}
            bgColor={theme === 'dark' ? 'bg-red-600/20' : 'bg-green-100'}
            themeColors={themeColors}
          />
          <MLMStatCard
            icon={FaWallet}
            title="Available Balance"
            value={`₹${mlmData.availableBalance.toLocaleString()}`}
            color="text-purple-600"
            bgColor="bg-purple-100"
            themeColors={themeColors}
          />
          <MLMStatCard
            icon={FaChartLine}
            title="Monthly Earnings"
            value={`₹${mlmData.monthlyEarnings.toLocaleString()}`}
            color="text-orange-600"
            bgColor="bg-orange-100"
            themeColors={themeColors}
          />
        </div>

        {/* Level Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: themeColors.text }}>Referral Levels</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: theme === 'dark' ? '#db2b1c20' : '#f0fdf4', color: theme === 'dark' ? '#db2b1c' : '#166534' }}>
                <div>
                  <p className="font-medium">Level 1 (Direct)</p>
                  <p className="text-sm opacity-75">10% Commission</p>
                </div>
                <span className="text-2xl font-bold">{mlmData.level1Referrals}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: theme === 'dark' ? '#db2b1c20' : '#f0fdf4', color: theme === 'dark' ? '#db2b1c' : '#166534' }}>
                <div>
                  <p className="font-medium">Level 2</p>
                  <p className="text-sm opacity-75">5% Commission</p>
                </div>
                <span className="text-2xl font-bold">{mlmData.level2Referrals}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-800">Level 3</p>
                  <p className="text-sm text-purple-600">2% Commission</p>
                </div>
                <span className="text-2xl font-bold text-purple-600">{mlmData.level3Referrals}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: themeColors.text }}>Recent Transactions</h3>
            <div className="space-y-3">
              {mlmData.recentTransactions.length === 0 ? (
                <p className="text-center py-4" style={{ color: themeColors.textSecondary }}>No transactions yet</p>
              ) : (
                mlmData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg" style={{ borderColor: themeColors.border }}>
                    <div>
                      <p className="font-medium" style={{ color: themeColors.text }}>{transaction.description}</p>
                      <p className="text-sm" style={{ color: themeColors.textSecondary }}>{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-bold ${transaction.amount > 0 ? (theme === 'dark' ? 'text-red-500' : 'text-green-600') : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLMDashboard;