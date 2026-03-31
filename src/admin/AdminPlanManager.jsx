import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crown, Users, Building2, ShieldCheck, Plus, Edit3, Trash2,
    CheckCircle2, X, Save, RotateCcw, ChevronDown, ChevronUp,
    IndianRupee, Zap, TrendingUp, History, Search, ArrowUpCircle,
    ToggleLeft, ToggleRight, AlertCircle, Star
} from 'lucide-react';
import { planService } from '../services/planService';
import { dataService } from '../services/dataService';
import { sharedDataService } from '../services/sharedDataService';

/* ── Constants ─────────────────────────────────────────────── */
const TYPES = [
    { id: 'retailer', label: 'Retailers', icon: Users, color: '#3b82f6', accent: 'blue' },
    { id: 'distributor', label: 'Distributors', icon: Building2, color: '#f59e0b', accent: 'amber' },
    { id: 'superdistributor', label: 'SuperDistributors', icon: Crown, color: '#8b5cf6', accent: 'violet' },
];
const TABS = ['Plan Templates', 'Assign Plans', 'History'];

/* ── Pill badge ───────────────────────────────────────────── */
const Badge = ({ children, color = 'slate' }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest
        bg-${color}-100 text-${color}-700 border border-${color}-200`}>
        {children}
    </span>
);

/* ── Edit Plan Modal ─────────────────────────────────────── */
const EditPlanModal = ({ plan, type, onSave, onClose }) => {
    const [form, setForm] = useState({
        label: plan?.label ?? '',
        price: plan?.price ?? 0,
        color: plan?.color ?? '#3b82f6',
        commissionRate: plan?.commissionRate ?? 0.5,
        maxRetailers: plan?.maxRetailers ?? plan?.maxTxnsPerDay ?? 50,
        maxSubDist: plan?.maxSubDist ?? plan?.maxDistributors ?? 0,
        featuresRaw: (plan?.features ?? []).join('\n'),
    });

    const handleSave = () => {
        const features = form.featuresRaw.split('\n').map(f => f.trim()).filter(Boolean);
        onSave({ ...form, features, price: Number(form.price), commissionRate: Number(form.commissionRate) });
    };

    const inp = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-all';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
            onClick={onClose}>
            <motion.div initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 space-y-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                        {plan?.id ? 'Edit Plan' : 'New Plan'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Name</label>
                        <input className={inp} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Gold" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (₹)</label>
                        <input type="number" className={inp} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission (%)</label>
                        <input type="number" step="0.05" className={inp} value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {type === 'retailer' ? 'Max Txn/Day' : 'Max Retailers'}
                        </label>
                        <input type="number" className={inp} value={form.maxRetailers} onChange={e => setForm(f => ({ ...f, maxRetailers: e.target.value }))} />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Color</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                                className="h-10 w-16 rounded-xl border border-slate-200 cursor-pointer" />
                            <span className="text-xs text-slate-400 font-mono">{form.color}</span>
                        </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Features (one per line)</label>
                        <textarea rows={4} className={`${inp} resize-none`}
                            value={form.featuresRaw}
                            onChange={e => setForm(f => ({ ...f, featuresRaw: e.target.value }))}
                            placeholder="AEPS&#10;Money Transfer&#10;Priority Support" />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={onClose}
                        className="flex-1 py-3 border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 flex items-center justify-center gap-2 transition-all">
                        <Save size={14} /> Save Plan
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ── Plan Card (in template editor) ─────────────────────── */
const PlanCard = ({ plan, typeId, onEdit, onDelete, onToggle }) => {
    const Icon = plan.label === 'Elite' ? Crown : (plan.label === 'Premium' ? Zap : ShieldCheck);
    const colorClass = plan.label === 'Elite' ? 'indigo' : (plan.label === 'Premium' ? 'amber' : 'slate');
    const colorHex = plan.label === 'Elite' ? '#6366f1' : (plan.label === 'Premium' ? '#f59e0b' : '#64748b');

    return (
        <motion.div layout
            whileHover={plan.active ? { y: -5 } : {}}
            className={`relative flex flex-col bg-white rounded-[2.5rem] p-8 border transition-all h-full
                ${plan.active ? 'border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50' : 'border-dashed border-slate-200 bg-slate-50 opacity-60 shadow-none'}`}>

            {/* Status & Options row */}
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-${colorClass}-500/20`}
                    style={{ background: `linear-gradient(135deg, ${plan.color || colorHex}, ${plan.color || colorHex}dd)` }}>
                    <Icon size={28} className="text-white" />
                </div>
                <div className="flex gap-1">
                    <button onClick={() => onToggle(typeId, plan.id)}
                        className={`p-2 rounded-xl transition-colors ${plan.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                        {plan.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => onEdit(plan)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                        <Edit3 size={16} />
                    </button>
                    <button onClick={() => onDelete(typeId, plan.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Plan Info */}
            <h4 className="font-black text-slate-800 uppercase tracking-tight text-xl mb-1">{plan.label}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 leading-relaxed">
                {plan.type === 'superdistributor' ? 'Master Access — High Volume' : (plan.type === 'distributor' ? 'Growing Network — Distribution' : 'Retailer Excellence')}
            </p>

            <div className="mb-8 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">
                    {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                </span>
                {plan.price > 0 && <span className="text-xs font-bold text-slate-400 tracking-widest">/YR</span>}
            </div>

            {/* Features list with checkmarks */}
            <div className="space-y-4 flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mb-4">Core Benefits</p>
                {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">{f}</span>
                    </div>
                ))}
            </div>

            {/* Limits footer */}
            <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-2xl p-3">
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Commission</p>
                    <p className="text-xs font-black text-slate-700">{plan.commissionRate}%</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3">
                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">
                        {plan.type === 'retailer' ? 'Daily Cap' : 'Max IDs'}
                    </p>
                    <p className="text-xs font-black text-slate-700">
                        {plan.maxRetailers >= 999999 ? 'UNLIM.' : plan.maxRetailers}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const AdminPlanManager = ({ defaultType = 'retailer', restrictType = false }) => {
    const defaultTypeTab = TYPES.findIndex(t => t.id === defaultType);
    const [tab, setTab] = useState(0);
    const [typeTab, setTypeTab] = useState(defaultTypeTab >= 0 ? defaultTypeTab : 0);
    const [plans, setPlans] = useState(planService.getAllPlans());
    const [userPlans, setUserPlans] = useState(planService.getAllUserPlans());
    const [history, setHistory] = useState(planService.getPlanHistory());
    const [editModal, setEditModal] = useState(null); // { plan, typeId } | null
    const [addModal, setAddModal] = useState(null); // typeId | null
    const [assignModal, setAssignModal] = useState(null); // user object
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);
    const [assignNote, setAssignNote] = useState('');
    const [selectedPlanForAssign, setSelectedPlanForAssign] = useState('');

    // load all users across portals
    const retailers = dataService.getData()?.users || [];
    const distributors = sharedDataService.getAllDistributors();
    const superAdmins = sharedDataService.getAllSuperAdmins();

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    useEffect(() => {
        const h = () => {
            setPlans(planService.getAllPlans());
            setUserPlans(planService.getAllUserPlans());
            setHistory(planService.getPlanHistory());
        };
        window.addEventListener('planDataUpdated', h);
        return () => window.removeEventListener('planDataUpdated', h);
    }, []);

    // ── Template handlers ─────────────────────────────────────
    const handleEditSave = (patch) => {
        if (!editModal) return;
        planService.updatePlan(editModal.typeId, editModal.plan.id, patch);
        setEditModal(null);
        showToast('Plan updated successfully!');
    };

    const handleAddSave = (form) => {
        if (!addModal) return;
        planService.addPlan(addModal, form);
        setAddModal(null);
        showToast('New plan created!');
    };

    const handleDelete = (typeId, planId) => {
        if (!window.confirm('Delete this plan? Users currently on it will keep it until reassigned.')) return;
        planService.deletePlan(typeId, planId);
        showToast('Plan deleted.', 'error');
    };

    const handleToggle = (typeId, planId) => {
        planService.togglePlanActive(typeId, planId);
        showToast('Plan status toggled.');
    };

    // ── Assign handler ────────────────────────────────────────
    const handleAssign = () => {
        if (!assignModal || !selectedPlanForAssign) return;
        planService.assignPlan(
            assignModal.id,
            assignModal.name || assignModal.username,
            selectedPlanForAssign,
            assignNote
        );
        setAssignModal(null);
        setAssignNote('');
        setSelectedPlanForAssign('');
        showToast(`Plan assigned to ${assignModal.name || assignModal.username}!`);
    };

    const currentTypeId = TYPES[typeTab].id;
    const currentTypePlans = plans[currentTypeId] || [];

    // Combine all users for assignment tab
    const allUsers = [
        ...retailers.map(u => ({ ...u, _type: 'retailer', _label: 'Retailer' })),
        ...distributors.filter(d => d.status === 'Approved').map(d => ({ ...d, _type: 'distributor', _label: 'Distributor' })),
        ...superAdmins.filter(s => s.status === 'Approved').map(s => ({ ...s, _type: 'superdistributor', _label: 'SuperAdmin' })),
    ].filter(u => {
        // Apply type restriction if enabled
        if (restrictType && u._type !== defaultType) return false;

        const q = search.toLowerCase();
        return !q || (u.name || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q) || (u.mobile || '').includes(q);
    });

    /* ===================================================== */
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                        <Crown size={28} className="text-amber-400" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] mb-1">Admin Control Center</p>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {restrictType ? `${TYPES[typeTab].label} Plans` : 'Plan Management'}
                        </h2>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                            {restrictType ? `Manage ${TYPES[typeTab].label} Templates & Assignments` : 'Retailers · Distributors · SuperDistributors'}
                        </p>
                    </div>
                </div>
                <button onClick={() => { if (window.confirm('Reset all plans to factory defaults?')) { planService.resetToDefaults(); showToast('Plans reset to defaults.'); } }}
                    className="flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white/60 rounded-2xl hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-colors">
                    <RotateCcw size={13} /> Reset Defaults
                </button>
            </div>

            {/* ── Tabs ── */}
            <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
                {TABS.map((t, i) => (
                    <button key={t} onClick={() => setTab(i)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === i ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}>
                        {t}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ════════ TAB 0: PLAN TEMPLATES ════════ */}
                {tab === 0 && (
                    <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Type selector */}
                        {!restrictType && (
                            <div className="flex gap-3">
                                {TYPES.map((t, i) => (
                                    <button key={t.id} onClick={() => setTypeTab(i)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${typeTab === i
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}>
                                        <t.icon size={14} /> {t.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Plans Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentTypePlans.map(plan => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    typeId={currentTypeId}
                                    onEdit={(p) => setEditModal({ plan: p, typeId: currentTypeId })}
                                    onDelete={handleDelete}
                                    onToggle={handleToggle}
                                />
                            ))}
                        </div>

                        {/* Add new plan btn */}
                        <button onClick={() => setAddModal(currentTypeId)}
                            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-[1.5rem] flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all">
                            <Plus size={16} /> Add New {TYPES[typeTab].label.slice(0, -1)} Plan
                        </button>
                    </motion.div>
                )}

                {/* ════════ TAB 1: ASSIGN PLANS ════════ */}
                {tab === 1 && (
                    <motion.div key="assign" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="relative">
                            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search users by name, username, or mobile..."
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-400 shadow-sm transition-all" />
                        </div>

                        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="grid grid-cols-[1fr_1fr_1fr_auto] px-6 py-3 bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span>User</span><span>Role</span><span>Current Plan</span><span>Action</span>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                                {allUsers.length === 0 && (
                                    <div className="py-16 text-center text-sm text-slate-400 font-bold uppercase tracking-widest">No users found.</div>
                                )}
                                {allUsers.map((user, idx) => {
                                    const assignedId = userPlans[user.id] || user.plan || null;
                                    const assignedPlan = assignedId ? planService.getPlanById(assignedId) : null;
                                    return (
                                        <div key={`${user.id}-${idx}`}
                                            className="grid grid-cols-[1fr_1fr_1fr_auto] items-center px-6 py-4 hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{user.name || user.username}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{user.mobile || user.email || user.id}</p>
                                            </div>
                                            <div>
                                                <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full
                                                    ${user._type === 'retailer' ? 'bg-blue-50 text-blue-600' :
                                                        user._type === 'distributor' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-violet-50 text-violet-600'}`}>
                                                    {user._label}
                                                </span>
                                            </div>
                                            <div>
                                                {assignedPlan ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full"
                                                        style={{ background: `${assignedPlan.color}18`, color: assignedPlan.color }}>
                                                        <Star size={10} /> {assignedPlan.label}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 font-bold">— No Plan</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setAssignModal(user);
                                                    setSelectedPlanForAssign(assignedId || '');
                                                    setAssignNote('');
                                                }}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-colors">
                                                <ArrowUpCircle size={12} /> Assign
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ════════ TAB 2: HISTORY ════════ */}
                {tab === 2 && (
                    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                                <History size={16} className="text-slate-500" />
                                <h3 className="font-black text-slate-700 text-sm uppercase tracking-tight">Plan Change History</h3>
                                <span className="ml-auto px-2.5 py-0.5 bg-slate-200 rounded-full text-[9px] font-black text-slate-600">{history.length} ENTRIES</span>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
                                {history.length === 0 && (
                                    <div className="py-16 text-center text-sm text-slate-400 font-bold uppercase tracking-widest">No plan changes yet.</div>
                                )}
                                {history.map((entry, i) => {
                                    const oldP = entry.oldPlanId ? planService.getPlanById(entry.oldPlanId) : null;
                                    const newP = entry.newPlanId ? planService.getPlanById(entry.newPlanId) : null;
                                    return (
                                        <div key={entry.id || i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                <TrendingUp size={14} className="text-emerald-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-slate-800 truncate">{entry.userName}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-slate-400">
                                                        {oldP ? <span style={{ color: oldP.color }}>{oldP.label}</span> : <span className="text-slate-300">No Plan</span>}
                                                    </span>
                                                    <span className="text-[10px] text-slate-300">→</span>
                                                    <span className="text-[10px] font-black" style={{ color: newP?.color || '#64748b' }}>
                                                        {newP?.label || '—'}
                                                    </span>
                                                </div>
                                                {entry.adminNote && (
                                                    <p className="text-[9px] text-slate-400 mt-0.5 italic">"{entry.adminNote}"</p>
                                                )}
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-bold tabular-nums whitespace-nowrap">
                                                {new Date(entry.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Edit/Add Modals ── */}
            <AnimatePresence>
                {editModal && (
                    <EditPlanModal
                        plan={editModal.plan}
                        type={editModal.typeId}
                        onSave={handleEditSave}
                        onClose={() => setEditModal(null)}
                    />
                )}
                {addModal && (
                    <EditPlanModal
                        plan={null}
                        type={addModal}
                        onSave={handleAddSave}
                        onClose={() => setAddModal(null)}
                    />
                )}

                {/* ── Assign Modal ── */}
                {assignModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
                        onClick={() => setAssignModal(null)}>
                        <motion.div initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assign / Upgrade Plan</p>
                                    <h3 className="text-lg font-black text-slate-800">{assignModal.name || assignModal.username}</h3>
                                    <p className="text-xs text-slate-400 font-bold">{assignModal._label} · {assignModal.mobile || assignModal.id}</p>
                                </div>
                                <button onClick={() => setAssignModal(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
                            </div>

                            {/* Plan selection */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Plan</p>
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {planService.getPlansForType(assignModal._type).filter(p => p.active).map(plan => (
                                        <button key={plan.id}
                                            onClick={() => setSelectedPlanForAssign(plan.id)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedPlanForAssign === plan.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)` }}>
                                                <Star size={16} className="text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-slate-800 text-sm">{plan.label}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">
                                                    {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`} · {plan.commissionRate}% commission
                                                </p>
                                            </div>
                                            {selectedPlanForAssign === plan.id && <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Note (optional)</p>
                                <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400"
                                    value={assignNote} onChange={e => setAssignNote(e.target.value)}
                                    placeholder="e.g. Upgraded on payment receipt" />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setAssignModal(null)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleAssign} disabled={!selectedPlanForAssign}
                                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:from-emerald-500 hover:to-teal-500">
                                    <ArrowUpCircle size={14} /> Assign Plan
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl text-sm font-black uppercase tracking-wide
                            ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
                        {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} className="text-emerald-400" />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPlanManager;
