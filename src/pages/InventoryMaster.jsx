import { useEffect, useState, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { listProducts } from "../apis/products";
import http from "../apis/http";
import { 
  FaWarehouse, 
  FaSearch, 
  FaSyncAlt, 
  FaBox 
} from "react-icons/fa";

const fmtCurrency = (n) =>
  typeof n === "number"
    ? `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : n ?? "-";

const calculateShelfLife = (expiryDate) => {
  if (!expiryDate || expiryDate === 'N/A' || expiryDate === '-') return 'N/A';
  const exp = new Date(expiryDate);
  const now = new Date();
  if (isNaN(exp.getTime())) return 'Invalid';
  const remaining = exp.getTime() - now.getTime();
  if (remaining < 0) return 'Expired';
  const daysRemaining = Math.ceil(remaining / (1000 * 60 * 60 * 24));
  return `${daysRemaining} Days`;
};

export default function InventoryMaster() {
  const { themeColors } = useTheme();
  const { currentFont } = useFont();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedProductBatches, setSelectedProductBatches] = useState(null);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchCounts, setBatchCounts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await listProducts({ scope: 'inventory' });
      const allProducts = Array.isArray(data) ? data : data.products || [];
      // Filter out demo/test data that doesn't have a valid SKU
      const validProducts = allProducts.filter(p => p.sku && p.sku.trim() !== "" && p.sku !== "-");
      setProducts(validProducts);
      fetchBatchCounts(validProducts);
    } catch (e) {
      setError(e.message || "Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBatchCounts = async (productList) => {
    try {
      const counts = {};
      for (const product of productList) {
        try {
          const { data } = await http.get(`/batches/product/${product._id}`);
          counts[product._id] = data.success && data.batches ? data.batches.length : 0;
        } catch (err) {
          console.error(`Error fetching batch count for ${product._id}:`, err);
          counts[product._id] = 0;
        }
      }
      setBatchCounts(counts);
    } catch (error) {
      console.error('Error fetching batch counts:', error);
    }
  };
  
  const handleViewBatches = async (product) => {
    setLoadingBatches(true);
    setShowBatchModal(true);
    try {
      const { data } = await http.get(`/batches/product/${product._id}`);
      setSelectedProductBatches({
        product: product,
        batches: data.success && data.batches ? data.batches : []
      });
    } catch (error) {
      console.error('Error fetching batches:', error);
      setSelectedProductBatches({
        product: product,
        batches: []
      });
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(p => 
      (p.name || "").toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q) ||
      (p.batchNumber || "").toLowerCase().includes(q) ||
      (p.company || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  return (
    <div className="p-4 space-y-6" style={{ fontFamily: currentFont.family }}>
      {/* Simple Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: themeColors.border }}>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: themeColors.text }}>
            <FaWarehouse /> Inventory Master
          </h1>
          <p className="text-xs opacity-60">Complete tracking of SKU and Stock levels.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-xs" />
            <input
              type="text"
              placeholder="Search SKU or Product..."
              className="pl-8 pr-4 py-1.5 rounded border text-xs w-64 focus:outline-none shadow-sm"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                color: themeColors.text
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={fetchProducts}
            className="px-3 py-1.5 rounded border text-xs flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-sm bg-white"
            style={{ borderColor: themeColors.border, color: themeColors.text }}
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Basic Metrics Badges */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100">Total: {products.length}</span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded border border-emerald-110">Stock Value: {fmtCurrency(products.reduce((acc, p) => acc + (p.purchasePrice * (p.quantity || 0)), 0))}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: themeColors.text, opacity: 0.6 }}>Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-2 py-1 rounded border text-xs focus:outline-none"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Optimized Table */}
      <div className="border rounded shadow-sm overflow-hidden" style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 border-b" style={{ borderColor: themeColors.border }}>
              <tr className="text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-4 min-w-[140px]">SKU ID</th>
                <th className="px-4 py-4 min-w-[200px]">Product Name</th>
                <th className="px-4 py-4">Batch</th>
                <th className="px-4 py-4 text-center">Batch Count</th>
                <th className="px-4 py-4">Manufacturer</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4 text-center">Stock</th>
                <th className="px-4 py-4 text-right">MRP</th>
                <th className="px-4 py-4">Expiry</th>
                <th className="px-4 py-4 text-center">Shelf Life</th>
                <th className="px-4 py-4 min-w-[150px]">Rack Location</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: themeColors.border }}>
              {loading ? (
                <tr><td colSpan="11" className="px-4 py-16 text-center opacity-50">Fetching inventory master data...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="11" className="px-4 py-16 text-center opacity-50 text-base font-medium">No results found for "{search}"</td></tr>
              ) : (
                paginatedProducts.map((p, idx) => {
                  const isLowStock = (p.quantity || 0) <= (p.reorderLevel || 10);
                  const isExpired = p.expiryDate !== 'N/A' && p.expiryDate !== '-' && new Date(p.expiryDate) < new Date();
                  return (
                    <tr key={p._id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-[11px] font-bold text-blue-700 tracking-tight">
                        {p.sku || "-"}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-800">{p.name}</td>
                      <td className="px-4 py-4 opacity-70 font-mono text-[11px] whitespace-nowrap">{p.batchNumber || "-"}</td>
                      <td className="px-4 py-4 text-center">
                        {batchCounts[p._id] === undefined ? (
                          <span className="inline-block w-3 h-3 border border-gray-300 border-t-orange-400 rounded-full animate-spin" />
                        ) : batchCounts[p._id] > 0 ? (
                          <button
                            onClick={() => handleViewBatches(p)}
                            title="View all batches"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-black uppercase tracking-wide hover:bg-orange-100 transition-colors"
                          >
                            <FaBox size={11} />
                            <span>{batchCounts[p._id]}</span>
                            <span className="text-orange-400">batch{batchCounts[p._id] > 1 ? 'es' : ''}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                            <FaBox size={11} />
                            No batch
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 opacity-70 text-[11px]">{p.company || p.brand || "-"}</td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                          {p.category || "General"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-black text-[12px] ${isLowStock ? "text-red-500" : "text-emerald-600"}`}>
                          {p.quantity || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-gray-700 whitespace-nowrap">
                        {fmtCurrency(p.sellingPrice)}
                      </td>
                      <td className={`px-4 py-4 whitespace-nowrap ${isExpired ? "text-red-500 font-bold" : "opacity-70"}`}>
                        {p.expiryDate || "-"}
                      </td>
                      <td className="px-4 py-4 text-center opacity-60 text-[11px] whitespace-nowrap uppercase font-bold">
                        {calculateShelfLife(p.expiryDate)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-amber-50 rounded border border-amber-200 text-amber-700 font-bold font-mono text-[11px] tracking-tight">
                          {p.rackLocation || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
          <div className="text-xs" style={{ color: themeColors.text, opacity: 0.7 }}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                color: themeColors.text
              }}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                    currentPage === pageNum ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-100'
                  }`}
                  style={currentPage !== pageNum ? {
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  } : {}}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded border text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                color: themeColors.text
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Batch Details Modal */}
      {showBatchModal && selectedProductBatches && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-200" style={{ backgroundColor: themeColors.surface }}>
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-orange-50 to-amber-50" style={{ borderColor: themeColors.border }}>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2" style={{ color: themeColors.text }}>
                  <FaBox size={24} className="text-orange-600" />
                  Batch Details
                </h2>
                <p className="text-xs font-medium mt-1" style={{ color: themeColors.text, opacity: 0.6 }}>
                  {selectedProductBatches.product?.name} ({selectedProductBatches.product?.sku})
                </p>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {loadingBatches ? (
                <div className="text-center py-10 text-gray-500">
                  <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin mb-2"></div>
                  <p className="text-sm">Loading batches...</p>
                </div>
              ) : selectedProductBatches.batches?.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-bold text-blue-600 uppercase">Total Batches</p>
                      <p className="text-2xl font-black text-gray-800">{selectedProductBatches.batches.length}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs font-bold text-green-600 uppercase">Total Stock</p>
                      <p className="text-2xl font-black text-gray-800">
                        {selectedProductBatches.batches.reduce((sum, b) => sum + b.quantity, 0)} Units
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs font-bold text-amber-600 uppercase">Active Batches</p>
                      <p className="text-2xl font-black text-gray-800">
                        {selectedProductBatches.batches.filter(b => b.status === 'Active').length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedProductBatches.batches.map((batch, idx) => (
                      <div key={batch._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white font-black text-sm">
                              #{idx + 1}
                            </div>
                            <div>
                              <h3 className="font-mono text-sm font-bold text-gray-800">{batch.batchNumber}</h3>
                              <p className="text-xs text-gray-500">Batch ID: {batch._id.slice(-8).toUpperCase()}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            batch.status === 'Active' ? 'bg-green-100 text-green-700' :
                            batch.status === 'Expired' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {batch.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Stock Quantity</p>
                            <p className="text-lg font-black text-gray-800">{batch.quantity}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Expiry Date</p>
                            <p className="text-sm font-bold text-gray-800">
                              {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">MRP</p>
                            <p className="text-sm font-bold text-gray-800">₹{batch.mrp || batch.sellingPrice || 0}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Location</p>
                            <p className="text-sm font-bold text-cyan-600">{batch.rackLocation || 'N/A'}</p>
                          </div>
                        </div>
                        
                        {batch.manufacturingDate && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              <span className="font-bold">Mfg Date:</span> {new Date(batch.manufacturingDate).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <FaBox size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">No batches found for this product</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t flex justify-end bg-gray-50" style={{ borderColor: themeColors.border }}>
              <button 
                onClick={() => setShowBatchModal(false)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg text-xs font-black uppercase hover:bg-gray-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
