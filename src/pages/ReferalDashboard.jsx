import { useState, useEffect } from "react";
import { FaUsers, FaCoins, FaWallet, FaChartLine, FaCopy, FaSyncAlt } from "react-icons/fa";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";
import { getReferalDashboard } from "../apis/referal";
import http from "../apis/http";

const ReferalStatCard = (props) => {
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

const ReferalDashboard = () => {
  const [referalData, setReferalData] = useState(null);
  const { theme, themeColors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      console.log('MLM Debug - BaseURL:', http.defaults.baseURL);
      const userId = "global-admin";
      console.log('MLM Debug - Fetching dashboard for:', userId);
      
      const data = await getReferalDashboard(userId);
      setReferalData(data);
    } catch (error) {
      console.error("Error fetching referral dashboard:", error);
      toast.error("Failed to fetch referral data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const copyReferralCode = () => {
    if (!referalData?.referralCode) return;
    const link = `https://unixa.co.in/register?ref=${referalData.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto flex flex-col justify-center items-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
          <p className="text-sm font-bold uppercase tracking-widest opacity-50" style={{ color: themeColors.text }}>Loading Network Stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight" style={{ color: themeColors.text }}>Referal Dashboard</h2>
            <p className="font-medium opacity-60" style={{ color: themeColors.text }}>Real-time network growth and earnings analytics.</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs uppercase transition-all hover:shadow-md active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }}
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Syncing..." : "Refresh Stats"}
          </button>
        </div>

        {/* Hero Section / Code Card */}
        <div className="rounded-[2rem] p-8 mb-8 text-white shadow-xl relative overflow-hidden group" style={{ backgroundColor: themeColors.primary }}>
          <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
            <FaUsers size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Your Network Identity</h3>
              <p className="opacity-80 font-medium">Invite others and expand your tree to earn multi-level commissions.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-full text-center">
                <p className="text-[10px] uppercase font-black opacity-60 mb-1">Referral Code</p>
                <span className="font-mono text-2xl font-black tracking-widest">{referalData?.referralCode || "ADMIN"}</span>
              </div>
              <button
                onClick={copyReferralCode}
                className="bg-white px-8 py-4 rounded-2xl font-black uppercase text-sm hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 w-full"
                style={{ color: themeColors.primary }}
              >
                <FaCopy /> Copy Invitation Link
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ReferalStatCard
            icon={FaUsers}
            title="Total Network"
            value={referalData?.totalReferrals || 0}
            color="text-blue-600"
            bgColor="bg-blue-100"
            themeColors={themeColors}
          />
          <ReferalStatCard
            icon={FaCoins}
            title="Life Earning"
            value={`₹${(referalData?.totalEarnings || 0).toLocaleString()}`}
            color={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}
            bgColor={theme === 'dark' ? 'bg-emerald-400/10' : 'bg-emerald-100'}
            themeColors={themeColors}
          />
          <ReferalStatCard
            icon={FaWallet}
            title="Wallet Balance"
            value={`₹${(referalData?.availableBalance || 0).toLocaleString()}`}
            color="text-purple-600"
            bgColor="bg-purple-100"
            themeColors={themeColors}
          />
          <ReferalStatCard
            icon={FaChartLine}
            title="Month Bonus"
            value={`₹${(referalData?.monthlyEarnings || 0).toLocaleString()}`}
            color="text-orange-600"
            bgColor="bg-orange-100"
            themeColors={themeColors}
          />
        </div>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="rounded-[2rem] p-8 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3" style={{ color: themeColors.text }}>
              <div className="w-2 h-6 bg-primary rounded-full"></div>
              Network Breakdown
            </h3>
            <div className="space-y-6">
              {[
                { label: "Level 1 (Direct)", comm: "10% Commission", count: referalData?.level1Referrals || 0, color: "emerald" },
                { label: "Level 2 (Indirect)", comm: "5% Commission", count: referalData?.level2Referrals || 0, color: "blue" },
                { label: "Level 3 (Depth)", comm: "2% Commission", count: referalData?.level3Referrals || 0, color: "purple" }
              ].map((lvl, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-2xl border-2 transition-transform hover:scale-[1.02]" 
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border 
                  }}>
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight" style={{ color: themeColors.text }}>{lvl.label}</p>
                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1" style={{ color: themeColors.text }}>{lvl.comm}</p>
                  </div>
                  <span className="text-3xl font-black" style={{ color: themeColors.primary }}>{lvl.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] p-8 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <h3 className="text-xl font-black mb-6 uppercase tracking-tight flex items-center gap-3" style={{ color: themeColors.text }}>
               <div className="w-2 h-6 bg-orange-400 rounded-full"></div>
               Recent Wallet Activity
            </h3>
            <div className="space-y-4">
              {!referalData?.recentTransactions?.length ? (
                <div className="py-12 text-center opacity-30 flex flex-col items-center gap-3">
                  <FaWallet size={40} />
                  <p className="text-xs font-black uppercase tracking-widest">No recent transactions</p>
                </div>
              ) : (
                referalData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-2xl bg-gray-50/50 dark:bg-white/5 transition-colors hover:bg-white dark:hover:bg-white/10" style={{ borderColor: themeColors.border }}>
                    <div>
                      <p className="font-black text-[13px] tracking-tight" style={{ color: themeColors.text }}>{transaction.description}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>{transaction.date}</p>
                    </div>
                    <span className={`font-black text-base ${transaction.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
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

export default ReferalDashboard;