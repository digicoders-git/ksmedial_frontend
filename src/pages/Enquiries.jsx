// src/pages/Enquiries.jsx
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { listEnquiries, updateEnquiry, deleteEnquiry } from "../apis/enquiry";
import {
  FaEnvelopeOpenText,
  FaSyncAlt,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTrashAlt,
  FaUser,
  FaPhoneAlt,
  FaEnvelope
} from "react-icons/fa";
import { toast } from "sonner";
import Swal from "sweetalert2";

const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

const STATUS_OPTIONS = ["new", "in-progress", "resolved", "closed"];

export default function Enquiries() {
  const { themeColors } = useTheme();
  const { currentFont } = useFont();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const fetchEnquiries = async () => {
    try {
      setRefreshing(true);
      const data = await listEnquiries();
      // Backend returns { status: 'success', enquiries: [...] }
      const list = Array.isArray(data) ? data : data.enquiries || [];
      setEnquiries(list);
    } catch (error) {
      console.error("Enquiry fetch error:", error);
      toast.error("Failed to load customer enquiries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleUpdate = async (enquiryId, updateData) => {
    try {
      await updateEnquiry(enquiryId, updateData);
      setEnquiries(prev => prev.map(e => (e._id || e.id) === enquiryId ? { ...e, ...updateData } : e));
      if (selectedEnquiry && (selectedEnquiry._id === enquiryId || selectedEnquiry.id === enquiryId)) {
        setSelectedEnquiry(prev => ({ ...prev, ...updateData }));
      }
      toast.success("Enquiry state updated");
    } catch (error) {
      console.error("Enquiry update error:", error);
      toast.error("Update operation failed");
    }
  };

  const handleDelete = async (enquiryId) => {
    const result = await Swal.fire({
      title: 'Termintate Enquiry?',
      text: "This record will be purged from the ecosystem.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e293b',
      cancelButtonColor: '#f1f5f9',
      confirmButtonText: 'Confirm Purge',
      cancelButtonText: 'Abort',
      customClass: {
          confirmButton: 'text-white font-black uppercase text-xs px-6 py-3 rounded-xl',
          cancelButton: 'text-slate-500 font-black uppercase text-xs px-6 py-3 rounded-xl'
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteEnquiry(enquiryId);
        setEnquiries(prev => prev.filter(e => (e._id || e.id) !== enquiryId));
        if (selectedEnquiry && (selectedEnquiry._id === enquiryId || selectedEnquiry.id === enquiryId)) {
          setSelectedEnquiry(null);
        }
        toast.success("Enquiry purged successfully");
      } catch (error) {
        toast.error("Purge operation failed");
      }
    }
  };

  const filteredEnquiries = useMemo(() => {
    let list = enquiries;
    if (statusFilter !== "all") {
      list = list.filter((e) => e.status === statusFilter);
    }
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((e) => 
      (e.name || "").toLowerCase().includes(q) ||
      (e.email || "").toLowerCase().includes(q) ||
      (e.phone || "").toLowerCase().includes(q) ||
      (e.subject || "").toLowerCase().includes(q)
    );
  }, [enquiries, searchTerm, statusFilter]);

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || "new";
    if (s === "resolved") return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", icon: <FaCheckCircle /> };
    if (s === "in-progress") return { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", icon: <FaClock /> };
    if (s === "closed") return { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", icon: <FaTimesCircle /> };
    return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", icon: <FaEnvelopeOpenText /> };
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.background, fontFamily: currentFont.family }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Enquiry Flow</h1>
            <p className="text-sm font-medium text-slate-500">Managing inbound customer communications and support vectors.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchEnquiries} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs uppercase transition-all hover:bg-slate-50 shadow-sm">
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Syncing..." : "Refresh Feed"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Enquiry List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filters Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 border-r border-slate-100 pr-5 text-slate-400">
                    <FaSearch className="text-xs" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Inbound Search:</span>
                </div>
                <input 
                    type="text" 
                    placeholder="Search name, email, query..."
                    className="flex-1 min-w-[200px] bg-transparent text-sm font-bold focus:outline-none placeholder:text-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block" />
                <div className="flex items-center gap-3">
                    <FaFilter className="text-slate-300 text-xs" />
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                    >
                        <option value="all">Everywhere</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Inbound List */}
            <div className="space-y-3">
              {loading && !refreshing ? (
                <div className="bg-white rounded-2xl p-20 text-center border border-slate-100">
                    <div className="animate-spin h-8 w-8 border-b-2 border-slate-800 mx-auto"></div>
                </div>
              ) : filteredEnquiries.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-200">
                   <FaEnvelopeOpenText className="mx-auto text-4xl text-slate-200 mb-4" />
                   <div className="text-xs font-black text-slate-400 uppercase tracking-widest">No communication vectors detected</div>
                </div>
              ) : (
                filteredEnquiries.map(e => {
                  const config = getStatusConfig(e.status);
                  const isSelected = selectedEnquiry?._id === e._id;
                  return (
                    <div 
                      key={e._id} 
                      onClick={() => setSelectedEnquiry(e)}
                      className={`group bg-white rounded-2xl border transition-all cursor-pointer p-5 flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 ${isSelected ? 'border-blue-500 shadow-lg ring-2 ring-blue-50' : 'border-slate-100 shadow-sm'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bg} ${config.text} border ${config.border} shrink-0 shadow-sm transition-transform group-hover:scale-110`}>
                        <FaEnvelopeOpenText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{e.name}</h3>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{fmtDateTime(e.createdAt)}</span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-500 line-clamp-1 mb-2">Subject: {e.subject || "N/A"}</div>
                        <div className="flex items-center gap-3">
                           <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${config.bg} ${config.text} border ${config.border}`}>
                              {e.status}
                           </div>
                           {e.isRead && <div className="text-[8px] font-black uppercase text-emerald-500 tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Synchronized</div>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Enquiry Detail Panel */}
          <div className="lg:col-span-4 lg:sticky lg:top-6 self-start">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden min-h-[500px] flex flex-col transition-all">
              {selectedEnquiry ? (
                <>
                  {/* Panel Header */}
                  <div className="p-8 border-b border-slate-50">
                    <div className="flex justify-between items-start mb-6">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusConfig(selectedEnquiry.status).bg} ${getStatusConfig(selectedEnquiry.status).text} border ${getStatusConfig(selectedEnquiry.status).border} shadow-sm`}>
                          <FaUser size={18} />
                       </div>
                       <button 
                        onClick={() => handleDelete(selectedEnquiry._id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                       >
                          <FaTrashAlt size={14} />
                       </button>
                    </div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{selectedEnquiry.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inbound Payload • {fmtDateTime(selectedEnquiry.createdAt)}</p>
                  </div>

                  {/* Panel Body */}
                  <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[500px]">
                    {/* Contact Grid */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                            <FaEnvelope size={12} />
                         </div>
                         <div className="text-[11px] font-bold text-slate-600 truncate">{selectedEnquiry.email}</div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                            <FaPhoneAlt size={12} />
                         </div>
                         <div className="text-[11px] font-bold text-slate-600">{selectedEnquiry.phone || "No phone provided"}</div>
                      </div>
                    </div>

                    {/* Subject Cluster */}
                    <div>
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Topic Vector</h4>
                       <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-xs font-black text-blue-600 uppercase tracking-tight">
                          {selectedEnquiry.subject || "Undefined Subject"}
                       </div>
                    </div>

                    {/* Message Payload */}
                    <div>
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Raw Communication</h4>
                       <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {selectedEnquiry.message}
                       </div>
                    </div>
                  </div>

                  {/* Panel Footer / Control Cluster */}
                  <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="flex-1">
                           <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">Internal Status Matrix</span>
                           <select 
                              value={selectedEnquiry.status} 
                              onChange={(e) => handleUpdate(selectedEnquiry._id, { status: e.target.value })}
                              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer shadow-sm transition-all"
                           >
                              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                     </div>
                     <button 
                        onClick={() => handleUpdate(selectedEnquiry._id, { isRead: !selectedEnquiry.isRead })}
                        className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg ${selectedEnquiry.isRead ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                     >
                        {selectedEnquiry.isRead ? 'Synchronized (Click to Undo)' : 'Mark as Synchronized'}
                     </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-60">
                   <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-6 border border-slate-100 border-dashed animate-pulse">
                      <FaEnvelopeOpenText size={32} />
                   </div>
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Select Communication</h3>
                   <p className="text-[10px] font-medium text-slate-400 mt-2 max-w-[180px]">Please select an inbound enquiry to inspect the metadata payload.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
