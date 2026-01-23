// src/pages/Categories.jsx
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { useAuth } from "../context/AuthContext";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../apis/categories";
import {
  FaBox,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaSearch,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// ---------- helpers ----------
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN") : "-";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  defaultUnit: "Pcs",
  gst: 0,
  isActive: true,
};

export default function Categories() {
  const { themeColors } = useTheme();
  const { currentFont } = useFont();
  const { isLoggedIn } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null); // category being edited
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getCategories();
      // res could be array or { categories: [] }
      const list = Array.isArray(res) ? res : res.categories || [];
      setCategories(list);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setSuccess("");
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      defaultUnit: cat.defaultUnit || "Pcs",
      gst: cat.gst || 0,
      isActive: typeof cat.isActive === "boolean" ? cat.isActive : true,
    });
    setSuccess("");
    setError("");
    setIsModalOpen(true);
  };

  const handleDelete = async (cat) => {
    if (!isLoggedIn) {
      setError("You must be logged in as admin to delete categories.");
      return;
    }

    const idOrSlug = cat.slug || cat._id || cat.id;
    if (!idOrSlug) {
      setError("Cannot delete this category (missing identifier).");
      return;
    }

    const result = await Swal.fire({
      title: `Delete category "${cat.name}"?`,
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
      setError("");
      setSuccess("");
      await deleteCategory(idOrSlug);
      setSuccess("Category deleted successfully.");
      await fetchCategories();
      if (editing && editing._id === cat._id) {
        resetForm();
      }
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Category deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to delete category.";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    if (!isLoggedIn) {
      setError("You must be logged in as admin to change status.");
      return;
    }

    const idOrSlug = cat.slug || cat._id || cat.id;
    if (!idOrSlug) {
      setError("Cannot update this category (missing identifier).");
      return;
    }

    const newStatus = !cat.isActive;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateCategory(idOrSlug, { isActive: newStatus });

      // Local state update so row stays visible,
      // only status changes
      setCategories((prev) =>
        prev.map((c) =>
          (c._id || c.id || c.slug) === (cat._id || cat.id || cat.slug)
            ? { ...c, isActive: newStatus }
            : c
        )
      );

      setSuccess(
        `Category ${newStatus ? "activated" : "deactivated"} successfully.`
      );

      Swal.fire({
        icon: "success",
        title: newStatus ? "Activated" : "Deactivated",
        text: `Category ${newStatus ? "activated" : "deactivated"} successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to update category status.";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setError("You must be logged in as admin to manage categories.");
      return;
    }

    if (!form.name.trim()) {
      setError("Category name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      // slug optional: backend may auto-generate
      ...(form.slug.trim() && { slug: form.slug.trim() }),
      description: form.description.trim(),
      defaultUnit: form.defaultUnit.trim(),
      gst: Number(form.gst),
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editing) {
        const idOrSlug = editing.slug || editing._id || editing.id;
        if (!idOrSlug) {
          throw new Error("Missing category identifier for update.");
        }
        await updateCategory(idOrSlug, payload);
        setSuccess("Category updated successfully.");
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Category updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await createCategory(payload);
        setSuccess("Category created successfully.");
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Category created successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchCategories();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to save category.";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => {
      const name = (c.name || "").toLowerCase();
      const slug = (c.slug || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      return name.includes(q) || slug.includes(q) || desc.includes(q);
    });
  }, [categories, search]);

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: currentFont.family }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: themeColors.text }}
          >
            <FaBox />
            Categories
          </h1>
         
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs opacity-70">
              <FaSearch style={{ color: themeColors.text }} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="pl-8 pr-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                color: themeColors.text,
              }}
            />
          </div>

          <button
            onClick={fetchCategories}
            className="px-3 py-2 rounded-lg border text-sm flex items-center gap-2"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.text,
            }}
            title="Refresh"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={openAddModal}
            disabled={!isLoggedIn}
            className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: themeColors.primary,
              color: themeColors.onPrimary,
            }}
            title={
              isLoggedIn ? "Add new category" : "Login as admin to add"
            }
          >
            <FaPlus />
            Add Category
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {(error || success || !isLoggedIn) && (
        <div className="space-y-2">
          {error && (
            <div
              className="p-3 rounded-lg text-sm border"
              style={{
                backgroundColor: themeColors.danger + "15",
                borderColor: themeColors.danger + "50",
                color: themeColors.danger,
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="p-3 rounded-lg text-sm border"
              style={{
                backgroundColor:
                  (themeColors.success || themeColors.primary) + "15",
                borderColor:
                  (themeColors.success || themeColors.primary) + "50",
                color: themeColors.success || themeColors.primary,
              }}
            >
              {success}
            </div>
          )}
          {!isLoggedIn && (
            <div
              className="p-3 rounded-lg text-sm border"
              style={{
                backgroundColor:
                  (themeColors.warning || themeColors.primary) + "15",
                borderColor:
                  (themeColors.warning || themeColors.primary) + "50",
                color: themeColors.warning || themeColors.primary,
              }}
            >
              You are viewing public categories. Login as admin to add,
              edit, or delete categories.
            </div>
          )}
        </div>
      )}

      {/* Table only (form ab modal me) */}
      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        }}
      >
        <h2
          className="text-lg font-semibold mb-4 flex items-center justify-between"
          style={{ color: themeColors.text }}
        >
          <span className="flex items-center gap-2">
            <FaBox />
            Category List
          </span>
          <span className="text-xs opacity-70">
            {filteredCategories.length} of {categories.length} shown
          </span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: themeColors.background + "30",
                }}
              >
                {["Name", "Slug", "Default Unit", "GST %", "Status", "Created", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: themeColors.text }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ borderColor: themeColors.border }}
            >
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm"
                    style={{ color: themeColors.text }}
                  >
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm"
                    style={{ color: themeColors.text }}
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat._id || cat.id || cat.slug}>
                    <td
                      className="px-4 py-2"
                      style={{ color: themeColors.text }}
                    >
                      {cat.name}
                    </td>
                    <td
                      className="px-4 py-2 text-xs"
                      style={{ color: themeColors.text }}
                    >
                      {cat.slug || "-"}
                    </td>
                    <td
                      className="px-4 py-2 text-xs"
                      style={{ color: themeColors.text }}
                    >
                      {cat.slug || "-"}
                    </td>
                    <td
                      className="px-4 py-2 text-xs"
                      style={{ color: themeColors.text }}
                    >
                      {cat.defaultUnit || "-"}
                    </td>
                    <td
                      className="px-4 py-2 text-xs"
                      style={{ color: themeColors.text }}
                    >
                      {cat.gst}%
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: cat.isActive
                            ? (themeColors.success ||
                                themeColors.primary) + "15"
                            : themeColors.border,
                          color: cat.isActive
                            ? themeColors.success ||
                              themeColors.primary
                            : themeColors.text,
                        }}
                      >
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td
                      className="px-4 py-2 text-xs"
                      style={{ color: themeColors.text }}
                    >
                      {cat.createdAt ? fmtDate(cat.createdAt) : "-"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {/* Active/Inactive Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          disabled={!isLoggedIn || saving}
                          className="p-2 rounded-lg border text-xs disabled:opacity-40"
                          style={{
                            borderColor: themeColors.border,
                            color: cat.isActive
                              ? themeColors.warning || "#f59e0b"
                              : themeColors.success || themeColors.primary,
                          }}
                          title={
                            isLoggedIn
                              ? cat.isActive
                                ? "Mark as Inactive"
                                : "Mark as Active"
                              : "Login as admin to change status"
                          }
                        >
                          {cat.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleEdit(cat)}
                          disabled={!isLoggedIn}
                          className="p-2 rounded-lg border text-xs disabled:opacity-40"
                          style={{
                            borderColor: themeColors.border,
                            color: themeColors.text,
                          }}
                          title={
                            isLoggedIn ? "Edit" : "Login as admin to edit"
                          }
                        >
                          <FaEdit />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          disabled={!isLoggedIn || saving}
                          className="p-2 rounded-lg border text-xs disabled:opacity-40"
                          style={{
                            borderColor: themeColors.border,
                            color: themeColors.danger,
                          }}
                          title={
                            isLoggedIn ? "Delete" : "Login as admin to delete"
                          }
                        >
                          <FaTrash />
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

      {/* Add / Edit Modal */}
      {/* Add / Edit Modal - Premium Design */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div
            className="w-full max-w-2xl rounded-2xl shadow-2xl border transform scale-100 transition-all duration-300 overflow-hidden"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              animation: "slideIn 0.3s ease-out",
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{ 
                borderColor: themeColors.border,
                background: `linear-gradient(to right, ${themeColors.surface}, ${themeColors.background}80)` 
              }}
            >
              <h2
                className="text-xl font-bold flex items-center gap-3"
                style={{ color: themeColors.text }}
              >
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: themeColors.primary + "20", color: themeColors.primary }}
                >
                  <FaPlus />
                </div>
                {editing ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-2 rounded-full hover:bg-black/5 transition-colors"
                style={{ color: themeColors.textSecondary }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div 
                className="px-8 py-6 space-y-6 overflow-y-auto max-h-[70vh]"
                style={{ scrollbarWidth: 'thin' }}
              >
                {/* Error Message */}
                {error && (
                  <div
                    className="p-4 rounded-xl text-sm border flex items-center gap-3"
                    style={{
                      backgroundColor: themeColors.danger + "10",
                      borderColor: themeColors.danger + "30",
                      color: themeColors.danger,
                    }}
                  >
                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: themeColors.danger }}></div>
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="col-span-2 md:col-span-1">
                    <label
                      htmlFor="name"
                      className="block mb-2 text-sm font-semibold tracking-wide"
                      style={{ color: themeColors.textSecondary }}
                    >
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all shadow-sm"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: themeColors.border,
                        color: themeColors.text,
                        "--tw-ring-color": themeColors.primary
                      }}
                      placeholder="e.g. Medicines"
                    />
                  </div>

                  {/* Slug */}
                  <div className="col-span-2 md:col-span-1">
                    <label
                      htmlFor="slug"
                      className="block mb-2 text-sm font-semibold tracking-wide"
                      style={{ color: themeColors.textSecondary }}
                    >
                      Slug <span className="text-xs font-normal opacity-70">(Auto-generated if empty)</span>
                    </label>
                    <input
                      id="slug"
                      name="slug"
                      type="text"
                      value={form.slug}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all shadow-sm"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: themeColors.border,
                        color: themeColors.text,
                         "--tw-ring-color": themeColors.primary
                      }}
                      placeholder="e.g. medicines"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label
                      htmlFor="description"
                      className="block mb-2 text-sm font-semibold tracking-wide"
                      style={{ color: themeColors.textSecondary }}
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none transition-all shadow-sm"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: themeColors.border,
                        color: themeColors.text,
                         "--tw-ring-color": themeColors.primary
                      }}
                      placeholder="Briefly describe what this category contains..."
                    />
                  </div>

                  {/* Default Unit */}
                  <div>
                    <label
                      htmlFor="defaultUnit"
                      className="block mb-2 text-sm font-semibold tracking-wide"
                      style={{ color: themeColors.textSecondary }}
                    >
                      Default Unit
                    </label>
                    <div className="relative">
                      <select
                        id="defaultUnit"
                        name="defaultUnit"
                        value={form.defaultUnit}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border text-sm appearance-none focus:outline-none focus:ring-2 transition-all shadow-sm"
                        style={{
                          backgroundColor: themeColors.background,
                          borderColor: themeColors.border,
                          color: themeColors.text,
                           "--tw-ring-color": themeColors.primary
                        }}
                      >
                        <option value="Pcs">Pcs</option>
                        <option value="Box">Box</option>
                        <option value="Kg">Kg</option>
                        <option value="Ltr">Ltr</option>
                        <option value="Gm">Gm</option>
                        <option value="Strip">Strip</option>
                        <option value="Bottle">Bottle</option>
                        <option value="Pack">Pack</option>
                      </select>
                       <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none opacity-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* GST % */}
                  <div>
                    <label
                      htmlFor="gst"
                      className="block mb-2 text-sm font-semibold tracking-wide"
                      style={{ color: themeColors.textSecondary }}
                    >
                      GST %
                    </label>
                    <div className="relative">
                      <select
                        id="gst"
                        name="gst"
                        value={form.gst}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border text-sm appearance-none focus:outline-none focus:ring-2 transition-all shadow-sm"
                        style={{
                          backgroundColor: themeColors.background,
                          borderColor: themeColors.border,
                          color: themeColors.text,
                           "--tw-ring-color": themeColors.primary
                        }}
                      >
                        <option value={0}>0% (Tax Free)</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none opacity-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Toggle - Premium */}
                <div 
                  className="mt-6 p-4 rounded-xl border flex items-center justify-between"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold" style={{ color: themeColors.text }}>Category Status</span>
                    <span className="text-xs opacity-60" style={{ color: themeColors.text }}>Toggle whether this category is visible</span>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                    />
                    <div 
                      className="w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-offset-2 transition-colors duration-200"
                      style={{ 
                        backgroundColor: form.isActive ? themeColors.success || themeColors.primary : "#e5e7eb",
                        "--tw-ring-color": themeColors.primary 
                      }}
                    ></div>
                    <div className="absolute top-0.5 left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform peer-checked:translate-x-full"></div>
                  </label>
                </div>

              </div>

              {/* Footer Actions */}
              <div 
                className="px-8 py-5 border-t flex items-center justify-end gap-3"
                style={{ 
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.background + "40"
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium border transition-all hover:opacity-80 disabled:opacity-50"
                  style={{
                    borderColor: themeColors.border,
                    color: themeColors.text,
                    backgroundColor: "transparent"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !isLoggedIn}
                  className="px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: themeColors.onPrimary,
                    boxShadow: `0 4px 12px ${themeColors.primary}40`
                  }}
                >
                  {saving
                    ? (
                      <span className="flex items-center gap-2">
                         <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         Saving...
                      </span>
                    )
                    : editing
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}