import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { useAuth } from "../context/AuthContext";
import {
  getShops,
  createShop,
  updateShop,
  deleteShop,
} from "../apis/shops";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaUserCircle,
  FaLock,
  FaStore,
  FaSearch,
  FaSyncAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN") : "-";

const emptyForm = {
  shopName: "",
  ownerName: "",
  contactNumber: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  licenseNumber: "",
  gstNumber: "",
  username: "",
  password: "",
  status: "Active",
  image: "",
};

export default function Shops() {
  const { themeColors } = useTheme();
  const { currentFont } = useFont();
  const { isLoggedIn } = useAuth();

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingShop, setViewingShop] = useState(null);

  const fetchShops = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getShops();
      const list = Array.isArray(res) ? res : res.shops || [];
      setShops(list);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load shops.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const openAddModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleEdit = (shop) => {
    setEditing(shop);
    setForm({
      shopName: shop.shopName || "",
      ownerName: shop.ownerName || "",
      contactNumber: shop.contactNumber || "",
      email: shop.email || "",
      address: shop.address || "",
      city: shop.city || "",
      state: shop.state || "",
      pincode: shop.pincode || "",
      licenseNumber: shop.licenseNumber || "",
      gstNumber: shop.gstNumber || "",
      username: shop.username || "",
      password: shop.password || "",
      status: shop.status || "Active",
      image: shop.image || "",
    });
    setSuccess("");
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (shop) => {
    if (!isLoggedIn) {
      Swal.fire("Error", "Login as admin to delete shops", "error");
      return;
    }

    const result = await Swal.fire({
      title: `Delete shop "${shop.shopName}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e02424",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      await deleteShop(shop._id);
      Swal.fire("Deleted", "Shop deleted successfully.", "success");
      await fetchShops();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to delete shop.";
      Swal.fire("Error", msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("Login as admin to manage shops.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      if (editing) {
        await updateShop(editing._id, form);
        Swal.fire("Updated", "Shop details updated successfully.", "success");
      } else {
        await createShop(form);
        Swal.fire("Created", "New shop created successfully.", "success");
      }
      resetForm();
      setIsModalOpen(false);
      await fetchShops();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to save shop.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleView = (shop) => {
    setViewingShop(shop);
  };

  const handleToggleStatus = async (shop) => {
    if (!isLoggedIn) {
      Swal.fire("Error", "Login as admin to change status", "error");
      return;
    }

    const newStatus = shop.status === "Active" ? "Inactive" : "Active";
    const isDeactivating = newStatus === "Inactive";

    const result = await Swal.fire({
      title: `Confirm ${newStatus}?`,
      text: isDeactivating 
        ? `Are you sure you want to deactivate "${shop.shopName}"? The shop owner will lose access to the inventory panel.` 
        : `Are you sure you want to activate "${shop.shopName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, make it ${newStatus}`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: isDeactivating ? '#e02424' : '#0D9488',
      cancelButtonColor: '#6b7280',
      background: themeColors.surface,
      color: themeColors.text
    });

    if (!result.isConfirmed) return;
    
    try {
      setSaving(true);
      await updateShop(shop._id, { ...shop, status: newStatus });
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      Toast.fire({
        icon: 'success',
        title: `Shop marked as ${newStatus}`
      });

      await fetchShops();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to update status.";
      Swal.fire("Error", msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredShops = useMemo(() => {
    if (!search.trim()) return shops;
    const q = search.toLowerCase();
    return shops.filter((s) => 
      s.shopName.toLowerCase().includes(q) || 
      s.ownerName.toLowerCase().includes(q) || 
      s.city.toLowerCase().includes(q)
    );
  }, [shops, search]);

  return (
    <div className="space-y-6" style={{ fontFamily: currentFont.family }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: themeColors.text }}>
          <FaStore /> Shops Management
        </h1>
        <div className="flex items-center gap-2">
           <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-xs opacity-50" style={{ color: themeColors.text }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops..."
              className="pl-8 pr-3 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }}
            />
          </div>
          <button onClick={fetchShops} className="p-2.5 rounded-lg border flex items-center gap-2" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border, color: themeColors.text }}>
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={openAddModal} className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ backgroundColor: themeColors.primary, color: themeColors.onPrimary }}>
            <FaPlus /> Add Shop
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {(error || success) && (
        <div className="space-y-2">
          {error && (
            <div className="p-3 rounded-lg text-sm border" style={{ backgroundColor: themeColors.danger + "15", borderColor: themeColors.danger + "50", color: themeColors.danger }}>
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg text-sm border" style={{ backgroundColor: themeColors.success + "15", borderColor: themeColors.success + "50", color: themeColors.success }}>
              {success}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center py-10 opacity-50">Loading shops...</p>
        ) : filteredShops.length === 0 ? (
          <p className="col-span-full text-center py-10 opacity-50">No shops found.</p>
        ) : (
          filteredShops.map((shop) => (
            <div key={shop._id} className="p-6 rounded-2xl border transition-all hover:shadow-xl group relative overflow-hidden" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
               {/* Decorative background element */}
               <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500" style={{ backgroundColor: themeColors.primary }}></div>
               
               <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/10" style={{ backgroundColor: themeColors.primary + "20", color: themeColors.primary }}>
                    <FaStore />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(shop);
                      }} 
                      className="p-2 rounded-lg hover:bg-black/5 transition-colors" 
                      style={{ color: themeColors.primary }} 
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(shop);
                      }} 
                      className="p-2 rounded-lg hover:bg-black/5 transition-colors" 
                      style={{ color: themeColors.text }} 
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Delete clicked:', shop.shopName);
                        handleDelete(shop);
                      }} 
                      disabled={saving}
                      className="p-2 rounded-lg hover:bg-black/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                      style={{ color: themeColors.danger }} 
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
               </div>

               <h3 className="text-lg font-bold mb-1" style={{ color: themeColors.text }}>{shop.shopName}</h3>
               <p className="text-sm opacity-70 mb-4" style={{ color: themeColors.text }}>Owner: {shop.ownerName}</p>

               <div className="space-y-2 text-xs opacity-80" style={{ color: themeColors.text }}>
                  <p className="flex items-center gap-2"><FaMapMarkerAlt className="shrink-0" /> {shop.city}, {shop.state}</p>
                  <p className="flex items-center gap-2"><FaPhoneAlt className="shrink-0" /> {shop.contactNumber}</p>
                  {shop.email && <p className="flex items-center gap-2"><FaEnvelope className="shrink-0" /> {shop.email}</p>}
                  <p className="flex items-center gap-2 font-bold mt-2 pt-2 border-t border-black/5" style={{ color: themeColors.primary }}><FaUserCircle className="shrink-0" /> ID: {shop.username}</p>
               </div>

               <div className="mt-6 flex items-center justify-between">
                  <button 
                    onClick={() => handleToggleStatus(shop)}
                    disabled={saving}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-110 active:scale-95 disabled:opacity-50 ${
                      shop.status === 'Active' 
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${shop.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                      {shop.status}
                    </span>
                  </button>
                  <span className="text-[10px] opacity-40">{fmtDate(shop.createdAt)}</span>
               </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-zoom-in" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="px-8 py-6 border-b flex justify-between items-center" style={{ borderColor: themeColors.border }}>
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: themeColors.text }}>
                <FaStore className="text-primary" /> {editing ? "Edit Shop" : "Add New Shop"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl transition-transform hover:rotate-90" style={{ color: themeColors.text }}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">Shop Name</label>
                  <input required name="shopName" value={form.shopName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">Owner Name</label>
                  <input required name="ownerName" value={form.ownerName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">Contact Number</label>
                  <input required name="contactNumber" value={form.contactNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">Email (Optional)</label>
                  <input name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">Full Address</label>
                  <textarea required name="address" value={form.address} onChange={handleChange} rows="2" className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all resize-none" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">City</label>
                  <input required name="city" value={form.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">State</label>
                  <input required name="state" value={form.state} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">Pincode</label>
                  <input required name="pincode" value={form.pincode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">License Number</label>
                  <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">GST Number</label>
                  <input name="gstNumber" value={form.gstNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60 text-primary flex items-center gap-2"><FaUserCircle /> Login Username (Shop ID)</label>
                  <input required name="username" value={form.username} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all font-bold" style={{ backgroundColor: themeColors.background, borderColor: themeColors.primary + "20", color: themeColors.text }} placeholder="e.g. shop001" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60 text-primary flex items-center gap-2"><FaLock /> Login Password</label>
                  <input required type="text" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all font-bold" style={{ backgroundColor: themeColors.background, borderColor: themeColors.primary + "20", color: themeColors.text }} placeholder="Set password" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-2 block opacity-60">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 focus:border-primary outline-none transition-all" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t flex gap-3" style={{ borderColor: themeColors.border }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs border-2 transition-all hover:bg-black/5" style={{ borderColor: themeColors.border, color: themeColors.text }}>Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: themeColors.primary, color: themeColors.onPrimary }}>
                  {saving ? "Processing..." : editing ? "Update Shop" : "Create Shop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full View Modal */}
      {viewingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-zoom-in" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: themeColors.border }}>
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: themeColors.text }}>
                <FaStore className="text-primary" /> Shop Overview
              </h2>
              <button onClick={() => setViewingShop(null)} className="text-xl transition-transform hover:rotate-90" style={{ color: themeColors.text }}>✕</button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-inner border-2 border-dashed" style={{ backgroundColor: themeColors.primary + "10", color: themeColors.primary, borderColor: themeColors.primary + "20" }}>
                    <FaStore />
                  </div>
                  <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black uppercase tracking-tight truncate" style={{ color: themeColors.text }}>{viewingShop.shopName}</h3>
                      <p className="text-xs font-bold opacity-60 mb-2" style={{ color: themeColors.primary }}>{viewingShop.ownerName}</p>
                      <div className="flex gap-2">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${viewingShop.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {viewingShop.status}
                         </span>
                         <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-700 opacity-60">ID: {viewingShop.username}</span>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: themeColors.text }}>Contact Details</h4>
                    <div className="space-y-2">
                        <p className="flex items-center gap-2 text-xs font-medium" style={{ color: themeColors.text }}><FaPhoneAlt className="text-primary text-[10px]" /> {viewingShop.contactNumber}</p>
                        <p className="flex items-center gap-2 text-xs font-medium" style={{ color: themeColors.text }}><FaEnvelope className="text-primary text-[10px]" /> {viewingShop.email || 'N/A'}</p>
                        <p className="flex items-start gap-2 text-xs font-medium leading-relaxed" style={{ color: themeColors.text }}><FaMapMarkerAlt className="text-primary mt-0.5 text-[10px]" /> {viewingShop.city}, {viewingShop.state}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: themeColors.text }}>Credentials</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between p-2 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 border border-black/5">
                            <span className="text-[9px] font-bold opacity-50 uppercase">License</span>
                            <span className="text-[9px] font-black" style={{ color: themeColors.text }}>{viewingShop.licenseNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between p-2 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 border border-black/5">
                            <span className="text-[9px] font-bold opacity-50 uppercase">GST NO.</span>
                            <span className="text-[9px] font-black" style={{ color: themeColors.text }}>{viewingShop.gstNumber || 'N/A'}</span>
                        </div>
                    </div>
                  </div>

                   <div className="col-span-full pt-4 border-t space-y-3" style={{ borderColor: themeColors.border }}>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
                            <FaUserCircle className="text-lg text-primary" />
                            <div>
                                <p className="text-[8px] font-bold opacity-50 uppercase">Login ID</p>
                                <p className="text-xs font-black" style={{ color: themeColors.text }}>{viewingShop.username}</p>
                            </div>
                        </div>
                        <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3">
                            <FaLock className="text-lg text-primary" />
                            <div>
                                <p className="text-[8px] font-bold opacity-50 uppercase">Password</p>
                                <p className="text-xs font-black" style={{ color: themeColors.text }}>{viewingShop.password}</p>
                            </div>
                        </div>
                    </div>
                  </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: themeColors.border }}>
              <button onClick={() => setViewingShop(null)} className="px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg hover:opacity-90 active:scale-95" style={{ backgroundColor: themeColors.primary, color: themeColors.onPrimary }}>Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
