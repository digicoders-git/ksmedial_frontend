import { useState, useEffect } from "react";
import { FaUsers, FaSearch, FaSyncAlt } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { getReferrals } from "../apis/referal";
import { toast } from "sonner";

const Referrals = () => {
  const { themeColors } = useTheme();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const userId = "global-admin";
      
      const data = await getReferrals(userId);
      setReferrals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      toast.error("Failed to load referral list");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredReferrals = referrals.filter(referral => {
    const fullName = `${referral.firstName} ${referral.lastName}`.toLowerCase();
    const email = (referral.email || "").toLowerCase();
    const phone = (referral.phone || "");
    
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         email.includes(searchTerm.toLowerCase()) ||
                         phone.includes(searchTerm);
    
    const matchesLevel = levelFilter === "all" || (referral.level || 1).toString() === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto flex flex-col justify-center items-center py-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: themeColors.text }}>Syncing Network...</p>
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
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Referral Network</h1>
            <p className="text-sm font-medium text-slate-500">Manage and view all members in your multi-level network.</p>
          </div>
          <button 
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50 shadow-lg"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Updating..." : "Refresh Queue"}
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, or phone..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-xs uppercase text-slate-600 cursor-pointer"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="all">Check All Levels</option>
                <option value="1">Direct (Level 1)</option>
                <option value="2">Sub (Level 2)</option>
                <option value="3">Sub (Level 3)</option>
              </select>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center justify-center gap-3">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Total Members:</span>
              <span className="text-lg font-black text-primary">{filteredReferrals.length}</span>
            </div>
          </div>
        </div>

        {/* Simplified Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Member Info</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Identity</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Growth Level</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Referer</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReferrals.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-3 opacity-20">
                                <FaUsers size={40} />
                                <p className="font-black uppercase tracking-widest text-xs">No Results Found</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredReferrals.map((referral) => (
                    <tr key={referral._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 text-xs border border-slate-200 uppercase">
                                    {referral.firstName?.charAt(0)}{referral.lastName?.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{referral.firstName} {referral.lastName}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Joined: {new Date(referral.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-[12px] font-black text-slate-700">{referral.phone}</div>
                            <div className="text-[10px] font-bold text-slate-400 lowercase">{referral.email}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase border border-blue-100">
                                Level {referral.level || 1}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <div className="text-[10px] font-black text-slate-700 uppercase">
                                {referral.referredBy ? `${referral.referredBy.firstName} ${referral.referredBy.lastName}` : (referral.shopName || 'Direct')}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                referral.source === 'Mobile App' 
                                ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                : 'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                                {referral.source || 'N/A'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                referral.isActive 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-red-50 text-red-600'
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${referral.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                {referral.isActive ? "Active" : "Inactive"}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black text-slate-900 tracking-tight">
                                ₹{(referral.totalEarnings || 0).toLocaleString()}
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

export default Referrals;