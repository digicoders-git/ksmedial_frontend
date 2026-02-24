import { useEffect, useState, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { listProducts } from "../apis/products";
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await listProducts();
      const allProducts = Array.isArray(data) ? data : data.products || [];
      // Filter out demo/test data that doesn't have a valid SKU
      const validProducts = allProducts.filter(p => p.sku && p.sku.trim() !== "" && p.sku !== "-");
      setProducts(validProducts);
    } catch (e) {
      setError(e.message || "Failed to load inventory data");
    } finally {
      setLoading(false);
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
      <div className="flex flex-wrap gap-3">
        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded border border-blue-100">Total: {products.length}</span>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded border border-emerald-110">Stock Value: {fmtCurrency(products.reduce((acc, p) => acc + (p.purchasePrice * (p.quantity || 0)), 0))}</span>
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
                <tr><td colSpan="10" className="px-4 py-16 text-center opacity-50">Fetching inventory master data...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="10" className="px-4 py-16 text-center opacity-50 text-base font-medium">No results found for "{search}"</td></tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const isLowStock = (p.quantity || 0) <= (p.reorderLevel || 10);
                  const isExpired = p.expiryDate !== 'N/A' && p.expiryDate !== '-' && new Date(p.expiryDate) < new Date();
                  
                  return (
                    <tr key={p._id || idx} className="hover:bg-slate-50/80 transition-colors">
                      {/* SKU ID with proper spacing */}
                      <td className="px-4 py-4 whitespace-nowrap font-mono text-[11px] font-bold text-blue-700 tracking-tight">
                        {p.sku || "-"}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-800">{p.name}</td>
                      <td className="px-4 py-4 opacity-70 font-mono text-[11px] whitespace-nowrap">{p.batchNumber || "-"}</td>
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
                      {/* Rack Location with fixed width and no wrap */}
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
    </div>
  );
}
