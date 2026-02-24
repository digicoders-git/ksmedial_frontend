import { useState, useEffect } from "react";
import { 
  FaCoins, 
  FaWallet, 
  FaHistory, 
  FaSearch, 
  FaSyncAlt,
  FaChartLine
} from "react-icons/fa";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";
import { getReferalDashboard } from "../apis/referal";

const Earnings = () => {
  const { themeColors } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
      const userId = adminData.id || "global-admin";
      
      const data = await getReferalDashboard(userId);
      setStats(data);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to load earnings data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTransactions = (stats?.recentTransactions || []).filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto flex flex-col justify-center items-center py-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: themeColors.text }}>Analyzing Wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Earnings & Commissions</h1>
            <p className="text-sm font-medium text-slate-500">Overview of your multi-level marketing revenue and balance.</p>
          </div>
          <button 
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50 shadow-lg"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Syncing..." : "Refresh Stats"}
          </button>
        </div>

        {/* Stats Grid - Simple & Clean */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
                { label: "Life Time Earnings", val: stats?.totalEarnings, icon: FaCoins, color: "text-blue-600", bgColor: "bg-blue-50", trend: "Accumulated Revenue" },
                { label: "Available Balance", val: stats?.availableBalance, icon: FaWallet, color: "text-emerald-600", bgColor: "bg-emerald-50", trend: "Current Wallet" },
                { label: "Monthly Bonus", val: stats?.monthlyEarnings, icon: FaChartLine, color: "text-orange-600", bgColor: "bg-orange-50", trend: "Current Month" }
            ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{card.label}</p>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                ₹{(card.val || 0).toLocaleString()}
                            </h3>
                        </div>
                        <div className={`p-3 rounded-xl ${card.bgColor}`}>
                            <card.icon className={`text-xl ${card.color}`} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.trend}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Transaction Logs Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <FaHistory className="text-slate-400" />
                <h2 className="text-sm font-black uppercase text-slate-700 tracking-wider">Transaction History</h2>
            </div>
            <div className="relative w-full md:w-80">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                    type="text"
                    placeholder="Filter logs..."
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type & Description</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Processing Date</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!filteredTransactions.length ? (
                    <tr>
                        <td colSpan="3" className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-3 opacity-20">
                                <FaHistory size={40} />
                                <p className="font-black uppercase tracking-widest text-xs">No Records Found</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="font-black text-[12px] text-slate-800 uppercase tracking-tight">{t.description}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Commission Credited</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-[11px] font-bold text-slate-500">
                                {new Date(t.date).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                                {new Date(t.date).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black text-emerald-600 tracking-tight">
                                +₹{t.amount?.toLocaleString()}
                            </span>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;