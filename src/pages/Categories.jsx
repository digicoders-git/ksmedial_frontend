import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { 
  FaBox, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSyncAlt, 
  FaSearch, 
  FaCheck, 
  FaTimes,
  FaFilter
} from "react-icons/fa";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "../apis/categories";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function Categories() {
  const { themeColors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultUnit: "Pcs",
    gst: 0,
    isActive: true
  });

  const fetchCategories = async () => {
    try {
      setRefreshing(true);
      const res = await getCategories();
      const list = Array.isArray(res) ? res : res.categories || [];
      setCategories(list);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
        defaultUnit: category.defaultUnit || "Pcs",
        gst: category.gst || 0,
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        defaultUnit: "Pcs",
        gst: 0,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id || editingCategory.id, formData);
        toast.success("Category updated successfully");
      } else {
        await createCategory(formData);
        toast.success("Category created successfully");
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (category) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete category "${category.name}"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1e293b",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCategory(category._id || category.id);
          toast.success("Category deleted");
          fetchCategories();
        } catch (error) {
          toast.error("Failed to delete category");
        }
      }
    });
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background }}>
        <div className="max-w-7xl mx-auto flex flex-col justify-center items-center py-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50">Mapping Categories...</p>
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
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Category Master</h1>
            <p className="text-sm font-medium text-slate-500">Organize and manage inventory classifications for all outlets.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchCategories}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase transition-all hover:bg-slate-50"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Syncing..." : "Refresh"}
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs uppercase transition-all hover:bg-slate-700 shadow-lg"
            >
              <FaPlus /> New Category
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 border-r border-slate-100 pr-5 text-slate-400">
                <FaSearch className="text-xs" />
                <span className="text-[10px] font-black uppercase tracking-widest">Search:</span>
            </div>
            <input 
                type="text" 
                placeholder="Find category by name or description..."
                className="flex-1 min-w-[300px] bg-transparent text-sm font-medium focus:outline-none placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Category List Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category Detail</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Configuration</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">GST %</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-3 opacity-20">
                                <FaBox size={40} />
                                <p className="font-black uppercase tracking-widest text-xs">No Categories Defined</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat._id || cat.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-slate-800 uppercase tracking-tight">{cat.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 line-clamp-1 max-w-[200px]">
                            {cat.description || "No description provided"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                             <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase">
                                Unit: {cat.defaultUnit || "Pcs"}
                             </span>
                             <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-bold uppercase">
                                {cat.slug}
                             </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-black text-slate-700">{cat.gst || 0}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                            cat.isActive 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-slate-50 text-slate-400 border-slate-100"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                            {cat.isActive ? "Active" : "Hidden"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(cat)}
                            className="p-2 bg-slate-100 hover:bg-slate-800 hover:text-white text-slate-500 rounded-lg transition-all"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat)}
                            className="p-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-all"
                          >
                            <FaTrash size={14} />
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
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-200 relative my-auto">
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        {editingCategory ? <FaEdit className="text-slate-400" /> : <FaPlus className="text-slate-400" />}
                        {editingCategory ? "Update Category" : "Build New Category"}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-800 text-2xl font-bold">×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Category Identity</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. Health & Wellness"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800/10 focus:outline-none transition-all text-sm font-bold"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Purpose / description</label>
                        <textarea 
                            rows="2"
                            placeholder="Describe what items belong here..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800/10 focus:outline-none transition-all text-sm font-medium resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Default Unit</label>
                            <select 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800/10 focus:outline-none transition-all text-sm font-bold appearance-none"
                                value={formData.defaultUnit}
                                onChange={(e) => setFormData({...formData, defaultUnit: e.target.value})}
                            >
                                {["Pcs", "Box", "Kg", "Ltr", "Gm", "Strip", "Bottle", "Pack"].map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block tracking-widest">Tax (GST %)</label>
                            <input 
                                type="number" 
                                placeholder="0"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-800/10 focus:outline-none transition-all text-sm font-bold"
                                value={formData.gst}
                                onChange={(e) => setFormData({...formData, gst: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <input 
                            type="checkbox" 
                            id="isActive"
                            className="w-4 h-4 accent-slate-800"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        />
                        <label htmlFor="isActive" className="text-xs font-black uppercase text-slate-600 tracking-wider">Visible to Outlets</label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setShowModal(false)} 
                            className="flex-1 px-4 py-3.5 bg-slate-50 text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-colors border border-slate-200">
                            Keep Current
                        </button>
                        <button type="submit" 
                            className="flex-1 px-4 py-3.5 bg-slate-800 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 shadow-xl transition-all active:scale-95">
                            {editingCategory ? "Save Changes" : "Deploy Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}