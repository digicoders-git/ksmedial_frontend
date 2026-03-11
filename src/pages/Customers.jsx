import { useState, useEffect } from "react";
import { FaUsers, FaSearch, FaSyncAlt, FaMobileAlt, FaStore } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import http from "../apis/http";
import { toast } from "sonner";

const Customers = () => {
  const { themeColors } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const { data } = await http.get("/admin/customers-all");
      
      if (data.status === 'success') {
          setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customer list");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sourceFilter]);

  const filteredCustomers = customers.filter(cust => {
    const fullName = `${cust.firstName} ${cust.lastName}`.toLowerCase();
    const email = (cust.email || "").toLowerCase();
    const phone = (cust.phone || "");
    
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         email.includes(searchTerm.toLowerCase()) ||
                         phone.includes(searchTerm);
    
    const matchesSource = sourceFilter === "all" || cust.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  // Pagination Calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto flex flex-col justify-center items-center py-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50" style={{ color: themeColors.text }}>Loading Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Customer Management</h1>
            <p className="text-sm font-medium text-slate-500">Unified list of Mobile App Users and Shop Customers.</p>
          </div>
          <button 
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50 shadow-lg"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Syncing..." : "Sync Database"}
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone, email..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-xs uppercase text-slate-600 cursor-pointer"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
              >
                <option value="all">Check All Sources</option>
                <option value="Mobile App">Mobile App Only</option>
                <option value="Inventory Panel">Shop Customers Only</option>
              </select>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex items-center justify-center gap-3">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Database Count:</span>
              <span className="text-lg font-black text-primary">{filteredCustomers.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Personal Info</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity Details</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Source</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Associated Shop</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-3 opacity-20">
                                <FaUsers size={40} />
                                <p className="font-black uppercase tracking-widest text-xs">No Data Found</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    currentItems.map((cust) => (
                    <tr key={cust._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border uppercase ${cust.source === 'Mobile App' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                    {cust.source === 'Mobile App' ? <FaMobileAlt /> : <FaStore />}
                                </div>
                                <div>
                                    <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{cust.firstName} {cust.lastName}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Joined: {new Date(cust.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-[12px] font-black text-slate-700">{cust.phone}</div>
                            <div className="text-[10px] font-bold text-slate-400 lowercase">{cust.email}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                cust.source === 'Mobile App' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-orange-100 text-orange-700 border-orange-200'
                            }`}>
                                {cust.source}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <div className="text-[10px] font-black text-slate-700 uppercase">
                                {cust.shopName || 'Central App'}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                cust.type === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'
                            }`}>
                                {cust.type || 'App User'}
                            </div>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length}
              </div>
              
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows:</span>
                <select 
                  className="bg-transparent text-[10px] font-black uppercase text-slate-600 focus:outline-none cursor-pointer"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>05</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-[10px] font-black border transition-all ${
                      currentPage === i + 1 
                      ? 'bg-primary border-primary text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
