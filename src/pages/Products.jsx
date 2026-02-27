import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { 
  FaBoxOpen, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSyncAlt, 
  FaSearch, 
  FaEye, // Added
  FaImage,
  FaTimes, // Added
  FaFilter,
  FaCubes,
  FaTable,
  FaThLarge
} from "react-icons/fa";
import { 
  listProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  bulkUploadProduct
} from "../apis/products";
import { getCategories } from "../apis/categories";
import { listOffers } from "../apis/offers"; // Added
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function Products() {
  const { themeColors } = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]); // Added
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null); // Added for full view
  const [viewMode, setViewMode] = useState("table");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    about: "",
    categoryId: "",
    mrp: 0,
    sellingPrice: 0,
    purchasePrice: 0,
    discountPercent: 0,
    stock: 0,
    unit: "Pcs",
    brand: "",
    manufacturer: "",
    offerId: "", // Added
    status: "Active"
  });

  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  const fetchProducts = async () => {
    try {
      setRefreshing(true);
      const res = await listProducts({ scope: "global" });
      const list = Array.isArray(res) ? res : res.products || [];
      setProducts(list);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      const list = Array.isArray(res) ? res : res.categories || [];
      setCategories(list);
    } catch (error) {
      console.error("Cat fetch error", error);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await listOffers();
      const list = Array.isArray(res) ? res : res.offers || [];
      setOffers(list);
    } catch (error) {
      console.error("Offers fetch error", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchOffers();
  }, []);

  // Auto Calculate Selling Price based on Offer
  useEffect(() => {
    if (formData.offerId && formData.mrp > 0) {
      const selectedOffer = offers.find(o => (o._id || o.id) === formData.offerId);
      if (selectedOffer) {
        let calculatedPrice = formData.mrp;
        if (selectedOffer.discountType === "percentage") {
          calculatedPrice = formData.mrp - (formData.mrp * selectedOffer.discountValue / 100);
        } else if (selectedOffer.discountType === "flat") {
          calculatedPrice = formData.mrp - selectedOffer.discountValue;
        }
        setFormData(prev => ({ 
          ...prev, 
          sellingPrice: Math.max(0, calculatedPrice), 
          discountPercent: selectedOffer.discountType === "percentage" ? selectedOffer.discountValue : 0 
        }));
      }
    }
  }, [formData.offerId, formData.mrp, offers]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        about: product.about || "",
        categoryId: product.categoryId?._id || product.categoryId || "",
        mrp: product.mrp || 0,
        sellingPrice: product.sellingPrice || 0,
        purchasePrice: product.purchasePrice || 0,
        discountPercent: product.discountPercent || 0,
        stock: product.stock || 0,
        unit: product.unit || "Pcs",
        brand: product.brand || "",
        manufacturer: product.manufacturer || "",
        offerId: product.offerId?._id || product.offerId || "",
        status: product.status || "Active"
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        about: "",
        categoryId: "",
        mrp: 0,
        sellingPrice: 0,
        purchasePrice: 0,
        discountPercent: 0,
        stock: 0,
        unit: "Pcs",
        brand: "",
        manufacturer: "",
        offerId: "",
        status: "Active"
      });
    }
    setMainImage(null);
    setGalleryImages([]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean empty strings for database IDs to avoid CastErrors
      const submitData = { ...formData };
      if (submitData.categoryId === "") delete submitData.categoryId;
      if (submitData.offerId === "") delete submitData.offerId;

      const fd = new FormData();
      Object.keys(submitData).forEach(key => fd.append(key, submitData[key]));
      if (mainImage) fd.append("mainImage", mainImage);
      galleryImages.forEach(img => fd.append("galleryImages", img));

      if (editingProduct) {
        await updateProduct(editingProduct._id || editingProduct.id, fd);
        toast.success("Catalog updated");
      } else {
        await createProduct(fd);
        toast.success("Product launched successfully");
      }
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Product submission error:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (product) => {
    Swal.fire({
      title: "Confirm Deletion?",
      text: `Remove "${product.name}" from public app listings?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1e293b",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, Remove"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteProduct(product._id || product.id);
          toast.success("Product removed");
          fetchProducts();
        } catch {
          toast.error("Deletion failed");
        }
      }
    });
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      setRefreshing(true);
      await bulkUploadProduct(fd);
      toast.success("Bulk products uploaded successfully");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Bulk upload failed");
    } finally {
      setRefreshing(false);
      e.target.value = null;
    }
  };

  const downloadSample = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL}/admin/products/sample`, "_blank");
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto flex flex-col justify-center items-center py-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50">Fetching App Catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">App Product Master</h1>
            <p className="text-sm font-medium text-slate-500">Manage products displayed on your user application and website.</p>
          </div>
          <div className="flex flex-wrap gap-3">
             <input 
              type="file" 
              id="csvUpload" 
              className="hidden" 
              accept=".csv"
              onChange={handleBulkUpload}
            />
            <button 
              onClick={() => document.getElementById("csvUpload").click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-bold text-xs uppercase transition-all hover:bg-blue-100"
            >
              Bulk Add (CSV)
            </button>
            <button 
              onClick={downloadSample}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 font-bold text-xs uppercase transition-all hover:bg-slate-100"
            >
              Sample CSV
            </button>
            <button 
              onClick={fetchProducts}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase transition-all hover:bg-slate-50"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Updating..." : "Refresh"}
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase transition-all hover:bg-slate-700 shadow-lg"
            >
              <FaPlus /> Launch Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 border-r border-slate-100 pr-5 text-slate-400">
                <FaSearch className="text-xs" />
                <span className="text-[10px] font-black uppercase tracking-widest">Global Search:</span>
            </div>
            <input 
                type="text" 
                placeholder="Search by name, brand or manufacturer..."
                className="flex-1 min-w-[300px] bg-transparent text-sm font-medium focus:outline-none placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button onClick={() => setViewMode("table")} className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white shadow-sm text-slate-800" : "text-slate-400"}`}>
                    <FaTable />
                </button>
                <button onClick={() => setViewMode("card")} className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-white shadow-sm text-slate-800" : "text-slate-400"}`}>
                    <FaThLarge />
                </button>
            </div>
        </div>

        {viewMode === "table" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Details</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Pricing</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Offer</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Stock</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                      <tr>
                       <td colSpan="6" className="px-6 py-20 text-center text-slate-300 uppercase text-[10px] font-bold tracking-widest">
                            No products found in catalog
                          </td>
                      </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p._id || p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {p.image ? (
                                      <img src={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${p.image}`} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                      <FaImage className="text-slate-300 text-xs" />
                                  )}
                              </div>
                              <div>
                                  <div className="text-sm font-bold text-slate-800">{p.name}</div>
                                  <div className="text-[10px] font-medium text-slate-400 capitalize">{p.brand} • {p.categoryId?.name || p.category || "General"}</div>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800">₹{p.sellingPrice?.toLocaleString()}</div>
                          {p.mrp > p.sellingPrice && (
                            <span className="text-[10px] text-slate-300 line-through">₹{p.mrp?.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                            {p.offerId ? (
                                <div className="space-y-1">
                                    <div className="text-[11px] font-black text-blue-600 uppercase tracking-tight">{p.offerId.title}</div>
                                    <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                                        <span className="bg-blue-100/50 text-blue-600 px-1 rounded">{p.offerId.code}</span>
                                        {p.offerId.discountType === 'percentage' ? `${p.offerId.discountValue}% OFF` : `₹${p.offerId.discountValue} FLAT`}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-[10px] font-bold text-slate-300 uppercase italic opacity-40">No Offer</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-xs font-bold text-slate-700">{p.stock || 0} {p.unit}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                               p.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                           }`}>
                               {p.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => setViewProduct(p)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Quick View">
                              <FaEye size={12} />
                            </button>
                            <button onClick={() => handleOpenModal(p)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-800 hover:text-white" title="Edit">
                              <FaEdit size={12} />
                            </button>
                            <button onClick={() => handleDelete(p)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white" title="Delete">
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(p => (
                  <div key={p._id || p.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                      <div className="aspect-square rounded-2xl bg-slate-50 mb-4 overflow-hidden relative border border-slate-100">
                          {p.image ? (
                              <img src={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${p.image}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center"><FaCubes className="text-slate-200 text-4xl" /></div>
                          )}
                          <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase shadow-sm">
                              {p.categoryId?.name || p.category}
                          </div>
                      </div>
                      <h3 className="font-black text-slate-800 uppercase text-sm mb-1 tracking-tight line-clamp-1">{p.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">{p.brand || "Unbranded"}</p>
                      
                      <div className="flex items-center justify-between">
                          <div>
                              <div className="text-lg font-black text-slate-900 tracking-tight">₹{p.sellingPrice?.toLocaleString()}</div>
                              <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-300 line-through tracking-wider">₹{p.mrp?.toLocaleString()}</span>
                              </div>
                              {p.offerId?.title && (
                                <div className="mt-2">
                                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-tight border border-blue-100">
                                      {p.offerId.title} • {p.offerId.code}
                                  </span>
                                </div>
                              )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => setViewProduct(p)} className="p-2.5 bg-slate-100 text-slate-800 rounded-xl hover:bg-white shadow-sm">
                                <FaEye size={12} />
                            </button>
                            <button onClick={() => handleOpenModal(p)} className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 shadow-lg">
                                <FaEdit size={12} />
                            </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {viewProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <button onClick={() => setViewProduct(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 z-10">
              <FaTimes />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-square bg-slate-50 flex items-center justify-center border-r border-slate-100">
                {viewProduct.image ? (
                  <img src={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${viewProduct.image}`} className="w-full h-full object-cover" alt="" />
                ) : (
                  <FaCubes size={60} className="text-slate-200" />
                )}
              </div>
              <div className="p-10 space-y-6 max-h-[80vh] overflow-y-auto">
                <div>
                  <div className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-2">{viewProduct.categoryId?.name || viewProduct.category}</div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">{viewProduct.name}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1 tracking-widest">{viewProduct.brand || "In-House Product"}</p>
                </div>

                <div className="flex items-end gap-3">
                  <div className="text-3xl font-black text-slate-900 tracking-tighter">₹{viewProduct.sellingPrice?.toLocaleString()}</div>
                  {viewProduct.mrp > viewProduct.sellingPrice && (
                    <div className="text-sm font-bold text-slate-300 line-through mb-1.5">₹{viewProduct.mrp?.toLocaleString()}</div>
                  )}
                  {viewProduct.discountPercent > 0 && (
                    <div className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black uppercase mb-1.5">{viewProduct.discountPercent}% OFF</div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Availability</span>
                    <span className="font-black text-slate-800">{viewProduct.stock} {viewProduct.unit} In Stock</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Manufacturer</span>
                    <span className="font-black text-slate-800">{viewProduct.manufacturer || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Status</span>
                    <span className={`font-black uppercase text-[10px] ${viewProduct.status === "Active" ? "text-emerald-500" : "text-red-500"}`}>{viewProduct.status}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Description</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{viewProduct.description || "No detailed description provided for this item."}</p>
                </div>

                <button onClick={() => { setViewProduct(null); handleOpenModal(viewProduct); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
                  Modify Product Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - App Dashboard Style */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-4xl shadow-2xl border border-slate-200 relative my-auto animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                            {editingProduct ? "Revise Item Listing" : "Deploy New Catalog Entry"}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure visibility and commerce data</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="bg-slate-100 hover:bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center transition-all">
                        <FaTimes className="text-slate-400" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Base Identity</label>
                            <input required type="text" placeholder="Product Full Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-800/10 focus:outline-none transition-all text-sm font-bold" 
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Brand</label>
                                <input type="text" placeholder="e.g. Cipla" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-800/10 focus:outline-none transition-all text-sm font-bold" 
                                    value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Manufacturer</label>
                                <input type="text" placeholder="Company Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-800/10 focus:outline-none transition-all text-sm font-bold" 
                                    value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Classification</label>
                            <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-800/10 focus:outline-none transition-all text-sm font-bold appearance-none"
                                value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest text-blue-500">Special Offer / Coupon (Optional)</label>
                            <select className="w-full px-5 py-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-800/10 focus:outline-none transition-all text-sm font-bold appearance-none"
                                value={formData.offerId} onChange={e => setFormData({...formData, offerId: e.target.value})}>
                                <option value="">No Active Offer</option>
                                {offers.map(o => <option key={o._id || o.id} value={o._id || o.id}>{o.title} ({o.code})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Commercial Synopsis</label>
                            <textarea rows="3" placeholder="Brief technical summary..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-800/10 focus:outline-none transition-all text-sm font-medium resize-none" 
                                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">MRP (₹)</label>
                                <input type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" 
                                    value={formData.mrp} onChange={e => setFormData({...formData, mrp: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className={`text-[10px] font-black uppercase mb-2 block tracking-widest ${formData.offerId ? "text-blue-500" : "text-slate-400"}`}>
                                    Price (₹) {formData.offerId && "• Auto"}
                                </label>
                                <input type="number" className={`w-full px-5 py-4 border rounded-2xl text-sm font-bold ${formData.offerId ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"}`} 
                                    value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
                            </div>
                            <div className="col-span-1">
                                <label className={`text-[10px] font-black uppercase mb-2 block tracking-widest ${formData.offerId ? "text-blue-500" : "text-slate-400"}`}>
                                    Disc (%) {formData.offerId && "• Offer"}
                                </label>
                                <input type="number" className={`w-full px-5 py-4 border rounded-2xl text-sm font-bold ${formData.offerId ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"}`} 
                                    value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Initial Stock</label>
                                <input type="number" placeholder="0" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" 
                                    value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Base Unit</label>
                                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold appearance-none"
                                    value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                                    {["Pcs", "Box", "Strip", "Pack", "Kg", "Ltr"].map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">Hero Shot (Main Image)</label>
                            <input type="file" accept="image/*" onChange={e => setMainImage(e.target.files[0])} className="w-full text-[10px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl" />
                        </div>

                        <div className="flex items-center justify-between p-5 bg-slate-800 rounded-2xl shadow-xl shadow-slate-900/20">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="isA" className="w-5 h-5 accent-emerald-500" checked={formData.status === "Active"} onChange={e => setFormData({...formData, status: e.target.checked ? "Active" : "Inactive"})} />
                                <label htmlFor="isA" className="text-xs font-black uppercase text-white tracking-widest">Active Deployment</label>
                            </div>
                            <button type="submit" className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-lg">
                                {editingProduct ? "Synchronize" : "Deploy"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
