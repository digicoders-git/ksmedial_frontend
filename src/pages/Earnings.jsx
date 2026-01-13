import { useState, useEffect } from "react";
import { 
  FaCoins, 
  FaWallet, 
  FaHistory, 
  FaDownload, 
  FaCalendar, 
  FaFilter, 
  FaUsers, 
  FaCheckCircle, 
  FaUniversity, 
  FaGift,
  FaChartLine,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import { toast } from "sonner";
import { API_ENDPOINTS, buildUrl, isValidObjectId } from "../config/api";
import { useTheme } from "../context/ThemeContext";

const StatCard = (props) => {
  const { icon: Icon, title, value, subtitle, color, bgColor, trend, theme, themeColors } = props;
  return (
    <div className="rounded-xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`text-2xl ${color}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? (theme === 'dark' ? 'text-red-500' : 'text-green-600') : 'text-red-600'}`}>
            {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>{title}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: themeColors.text }}>{value}</p>
      {subtitle && <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>{subtitle}</p>}
    </div>
  );
};

const Earnings = () => {
  const { theme, themeColors } = useTheme();
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingEarnings: 0,
    monthlyEarnings: 0,
    todayEarnings: 0,
    weeklyEarnings: 0
  });
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch earnings data
  useEffect(() => {
    fetchEarningsData();
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, dateFilter]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      // TODO: Get userId from auth context
      const userId = "65a1b2c3d4e5f6a7b8c9d0e1";
      
      const response = await fetch(API_ENDPOINTS.MLM.DASHBOARD(userId));
      const data = await response.json();
      
      if (response.ok) {
        setEarningsData({
          totalEarnings: data.totalEarnings || 0,
          availableBalance: data.availableBalance || 0,
          pendingEarnings: data.pendingWithdrawal || 0,
          monthlyEarnings: data.monthlyEarnings || 0,
          todayEarnings: calculateTodayEarnings(data.recentTransactions || []),
          weeklyEarnings: calculateWeeklyEarnings(data.recentTransactions || [])
        });
      } else {
        toast.error(data.message || "Failed to fetch earnings data");
      }
    } catch (error) {
      console.error("Fetch earnings error:", error);
      toast.error("Failed to fetch earnings data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      // TODO: Get userId from auth context
      const userId = "65a1b2c3d4e5f6a7b8c9d0e1";
      
      const response = await fetch(
        buildUrl(API_ENDPOINTS.MLM.TRANSACTIONS(userId), { type: typeFilter, limit: 100 })
      );
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data.transactions || []);
      } else {
        toast.error(data.message || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Fetch transactions error:", error);
      toast.error("Failed to fetch transactions");
    }
  };

  const calculateTodayEarnings = (transactions) => {
    const today = new Date().toDateString();
    return transactions
      .filter(t => new Date(t.date).toDateString() === today && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateWeeklyEarnings = (transactions) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return transactions
      .filter(t => new Date(t.date) >= weekAgo && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      
      switch(dateFilter) {
        case "today":
          matchesDate = transactionDate.toDateString() === now.toDateString();
          break;
        case "week": {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = transactionDate >= weekAgo;
          break;
        }
        case "month":
          matchesDate = transactionDate.getMonth() === now.getMonth() && 
                       transactionDate.getFullYear() === now.getFullYear();
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const exportToCSV = () => {
    const headers = ["Date", "Type", "Description", "Amount", "Status"];
    const csvData = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.description,
      t.amount,
      t.status || "completed"
    ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `earnings_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    
    toast.success("Transactions exported successfully!");
  };

  const getTransactionIcon = (type) => {
    switch(type) {
      case "referral": return <FaUsers className="text-blue-600" />;
      case "commission": return <FaCoins className={theme === 'dark' ? "text-red-500" : "text-green-600"} />;
      case "task": return <FaCheckCircle className="text-purple-600" />;
      case "withdrawal": return <FaUniversity className="text-red-500" />;
      case "bonus": return <FaGift className="text-orange-500" />;
      default: return <FaCoins style={{ color: themeColors.textSecondary }} />;
    }
  };

  const getTransactionColor = (amount) => {
    if (amount > 0) {
      return theme === 'dark' ? "text-red-500" : "text-green-600";
    }
    return theme === 'dark' ? "text-red-400" : "text-red-600";
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "completed": return theme === 'dark' ? "bg-red-900/30 text-red-400" : "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
            <span className="ml-3" style={{ color: themeColors.textSecondary }}>Loading earnings data...</span>
          </div>
        </div>
      </div>
    );
  }

  const testUserId = "65a1b2c3d4e5f6a7b8c9d0e1";
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
            className="w-full text-white py-2 rounded-lg font-medium transition-colors hover:opacity-90"
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
          <h1 className="text-3xl font-bold mb-2" style={{ color: themeColors.text }}>My Earnings</h1>
          <p style={{ color: themeColors.textSecondary }}>Track your income and transaction history</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={FaCoins}
            title="Total Earnings"
            value={`₹${earningsData.totalEarnings.toLocaleString()}`}
            subtitle="All-time earnings"
            color={theme === 'dark' ? 'text-red-500' : 'text-blue-600'}
            bgColor={theme === 'dark' ? 'bg-red-500/20' : 'bg-blue-100'}
            trend={12}
            theme={theme}
            themeColors={themeColors}
          />
          <StatCard
            icon={FaWallet}
            title="Available Balance"
            value={`₹${earningsData.availableBalance.toLocaleString()}`}
            subtitle="Ready to withdraw"
            color={theme === 'dark' ? 'text-red-500' : 'text-green-600'}
            bgColor={theme === 'dark' ? 'bg-red-500/20' : 'bg-green-100'}
            theme={theme}
            themeColors={themeColors}
          />
          <StatCard
            icon={FaHistory}
            title="Pending Earnings"
            value={`₹${earningsData.pendingEarnings.toLocaleString()}`}
            subtitle="In process"
            color="text-orange-500"
            bgColor="bg-orange-100"
            theme={theme}
            themeColors={themeColors}
          />
          <StatCard
            icon={FaCalendar}
            title="Monthly Earnings"
            value={`₹${earningsData.monthlyEarnings.toLocaleString()}`}
            subtitle="This month"
            color="text-purple-500"
            bgColor="bg-purple-100"
            trend={8}
            theme={theme}
            themeColors={themeColors}
          />
          <StatCard
            icon={FaChartLine}
            title="Weekly Earnings"
            value={`₹${earningsData.weeklyEarnings.toLocaleString()}`}
            subtitle="Last 7 days"
            color="text-indigo-500"
            bgColor="bg-indigo-100"
            trend={15}
            theme={theme}
            themeColors={themeColors}
          />
          <StatCard
            icon={FaCheckCircle}
            title="Today's Earnings"
            value={`₹${earningsData.todayEarnings.toLocaleString()}`}
            subtitle="Today"
            color="text-teal-500"
            bgColor="bg-teal-100"
            theme={theme}
            themeColors={themeColors}
          />
        </div>

        {/* Filters and Export */}
        <div className="rounded-xl p-6 shadow-lg mb-8 border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search transactions..."
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all" style={{ backgroundColor: themeColors.surface }}>All Types</option>
                <option value="referral" style={{ backgroundColor: themeColors.surface }}>Referral</option>
                <option value="commission" style={{ backgroundColor: themeColors.surface }}>Commission</option>
                <option value="task" style={{ backgroundColor: themeColors.surface }}>Task</option>
                <option value="bonus" style={{ backgroundColor: themeColors.surface }}>Bonus</option>
                <option value="withdrawal" style={{ backgroundColor: themeColors.surface }}>Withdrawal</option>
              </select>
              <select
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
                style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all" style={{ backgroundColor: themeColors.surface }}>All Time</option>
                <option value="today" style={{ backgroundColor: themeColors.surface }}>Today</option>
                <option value="week" style={{ backgroundColor: themeColors.surface }}>This Week</option>
                <option value="month" style={{ backgroundColor: themeColors.surface }}>This Month</option>
              </select>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all font-medium"
              style={{ backgroundColor: themeColors.primary }}
            >
              <FaDownload /> Export CSV
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-xl shadow-lg overflow-hidden border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: themeColors.border }}>
            <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>Transaction History</h2>
            <p className="text-sm" style={{ color: themeColors.textSecondary }}>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: themeColors.background }}>
                <tr>
                  {[
                    "Type",
                    "Description",
                    "Date",
                    "Amount",
                    "Status"
                  ].map((header) => (
                    <th key={header} className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: themeColors.border }}>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <FaHistory className="mx-auto text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-500">No transactions found</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: themeColors.background }}>
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <span className="text-sm font-medium capitalize" style={{ color: themeColors.text }}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm" style={{ color: themeColors.text }}>{transaction.description}</div>
                        {transaction.relatedUser && (
                          <div className="text-xs" style={{ color: themeColors.textSecondary }}>Related: {transaction.relatedUser}</div>
                        )}
                        {transaction.level && (
                          <div className="text-xs" style={{ color: themeColors.textSecondary }}>Level {transaction.level}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: themeColors.text }}>
                        {new Date(transaction.date).toLocaleDateString()}
                        <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                          {new Date(transaction.date).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${getTransactionColor(transaction.amount)}`}>
                          {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status || "completed")}`}>
                          {transaction.status || "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.text }}>Earnings Breakdown</h3>
            <div className="space-y-3">
              {["referral", "commission", "task", "bonus"].map(type => {
                const typeEarnings = transactions
                  .filter(t => t.type === type && t.amount > 0)
                  .reduce((sum, t) => sum + t.amount, 0);
                const percentage = earningsData.totalEarnings > 0 
                  ? ((typeEarnings / earningsData.totalEarnings) * 100).toFixed(1)
                  : 0;
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(type)}
                      <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{typeEarnings.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Transactions</span>
                <span className="text-sm font-bold text-gray-900">{transactions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Transaction</span>
                <span className="text-sm font-bold text-gray-900">
                  ₹{transactions.length > 0 
                    ? (transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length).toFixed(0)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Highest Earning</span>
                <span className="text-sm font-bold text-green-600">
                  ₹{transactions.length > 0 
                    ? Math.max(...transactions.filter(t => t.amount > 0).map(t => t.amount)).toLocaleString()
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month Growth</span>
                <span className="text-sm font-bold text-blue-600">+12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;