import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    X, Wallet, FileText, CheckCircle2, Package, IndianRupee, History, ArrowLeft, Eye, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../../services/dataService';

const RetailerDetails = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [txns, setTxns] = useState([]);
    const [adminViewingDoc, setAdminViewingDoc] = useState(null);
    // Move setData to local state only for re-renders, actual data is in service
    const [dummyState, setDummyState] = useState(0);
    const forceUpdate = () => setDummyState(d => d + 1);

    useEffect(() => {
        const loadUser = async () => {
            const allUsers = await dataService.getAllUsers();
            const currentUser = allUsers.find(u => u.username === username);
            if (currentUser) {
                setUser(currentUser);
                const userTxns = await dataService.getUserTransactions(currentUser.username);
                setTxns(userTxns || []);
            }
        };
        loadUser();
    }, [username, dummyState]);

    if (!user) return <div className="p-10 font-bold text-center">Loading or User Not Found...</div>;

    // Group by service
    const serviceStats = txns.reduce((acc, t) => {
        if (!acc[t.service]) acc[t.service] = { count: 0, amount: 0 };
        acc[t.service].count++;
        if (t.status === 'Success') acc[t.service].amount += t.amount;
        return acc;
    }, {});

    const getInitials = (u) => {
        if (u.businessName) return u.businessName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        return u.mobile?.slice(-2) || 'RX';
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-['Inter',sans-serif] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="bg-white p-3 rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{user.businessName || 'UNNAMED BUSINESS'}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user.mobile}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">{user.partyCode}</span>
                        </div>
                    </div>
                </div>

                {/* Admin Document Viewer Modal */}
                <AnimatePresence>
                    {adminViewingDoc && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setAdminViewingDoc(null)} />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{adminViewingDoc.name}</h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Reviewing document for {user.businessName}</p>
                                    </div>
                                    <button onClick={() => setAdminViewingDoc(null)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-all">
                                        <X size={24} className="text-slate-600" />
                                    </button>
                                </div>
                                <div className="flex-1 bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 flex items-center justify-center">
                                    <img src={adminViewingDoc.file} alt="KYC Document" className="max-w-full max-h-full object-contain" />
                                </div>
                                <div className="mt-8 flex gap-4 justify-center">
                                    <button
                                        onClick={() => {
                                            dataService.verifyDocument(user.username, adminViewingDoc.name, 'Verified');
                                            forceUpdate();
                                            setAdminViewingDoc(null);
                                        }}
                                        className="px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/30 flex items-center gap-2 hover:bg-emerald-600 active:scale-95 transition-all"
                                    >
                                        <CheckCircle2 size={18} /> Approve Document
                                    </button>
                                    <button
                                        onClick={() => {
                                            dataService.verifyDocument(user.username, adminViewingDoc.name, 'Rejected');
                                            forceUpdate();
                                            setAdminViewingDoc(null);
                                        }}
                                        className="px-10 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-500/30 flex items-center gap-2 hover:bg-red-600 active:scale-95 transition-all"
                                    >
                                        <X size={18} /> Reject Document
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet size={80} className="text-blue-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Wallet Balance</p>
                        <h4 className="text-4xl font-black text-slate-800">₹ {parseFloat(user.wallet?.balance || 0).toLocaleString()}</h4>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-blue-50 text-blue-600 w-fit px-3 py-1.5 rounded-full uppercase">
                            <Wallet size={12} /> Live Wallet
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle2 size={80} className="text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Success Rate</p>
                        <h4 className="text-4xl font-black text-slate-800">
                            {txns.length > 0 ? Math.round((txns.filter(t => t.status === 'Success').length / txns.length) * 100) : 0}%
                        </h4>
                        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase">Based on last {txns.length} transactions</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Package size={80} className="text-slate-800" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Active Services</p>
                        <h4 className="text-4xl font-black text-slate-800">{Object.keys(serviceStats).length}</h4>
                        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase truncate">Top: {Object.keys(serviceStats)[0] || 'None'}</p>
                    </div>
                </div>

                {/* Admin Certificate Controls */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-slate-900 p-3 rounded-2xl">
                            <FileText size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Certificate Control</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage official documents for this retailer</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST Certificate (Base64/URL)</label>
                            <textarea
                                value={user.gst_certificate || ''}
                                onChange={(e) => setUser({ ...user, gst_certificate: e.target.value })}
                                placeholder="Paste certificate data..."
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-slate-900 transition-all resize-none"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TDS Certificate (Base64/URL)</label>
                            <textarea
                                value={user.tds_certificate || ''}
                                onChange={(e) => setUser({ ...user, tds_certificate: e.target.value })}
                                placeholder="Paste certificate data..."
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-slate-900 transition-all resize-none"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GST Rate (%)</label>
                            <input
                                type="number"
                                value={user.gst_rate || 0}
                                onChange={(e) => setUser({ ...user, gst_rate: e.target.value })}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-slate-900 transition-all"
                            />
                            <button
                                onClick={async () => {
                                    const res = await dataService.updateUserCertificates(user.username, {
                                        gst_certificate: user.gst_certificate,
                                        tds_certificate: user.tds_certificate,
                                        gst_rate: user.gst_rate
                                    });
                                    if (res.success) alert("Certificates Updated!");
                                    else alert("Error: " + res.message);
                                }}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                            >
                                Update All Controls
                            </button>
                        </div>
                    </div>
                </div>

                {/* Geofencing Controls */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-indigo-600 p-3 rounded-2xl">
                            <MapPin size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Geofencing & Security</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Restrict transactions within specific shop range</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Latitude</label>
                            <input
                                type="text"
                                value={user.shop_latitude || ''}
                                onChange={(e) => setUser({ ...user, shop_latitude: e.target.value })}
                                placeholder="e.g. 25.5941"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-600 transition-all"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Longitude</label>
                            <input
                                type="text"
                                value={user.shop_longitude || ''}
                                onChange={(e) => setUser({ ...user, shop_longitude: e.target.value })}
                                placeholder="e.g. 85.1376"
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-600 transition-all"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowed Range (KM)</label>
                            <input
                                type="number"
                                value={user.allowed_range || 10}
                                onChange={(e) => setUser({ ...user, allowed_range: e.target.value })}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-600 transition-all"
                            />
                            <button
                                onClick={async () => {
                                    const res = await dataService.updateUserGeofencing(user.username, {
                                        shop_latitude: user.shop_latitude,
                                        shop_longitude: user.shop_longitude,
                                        allowed_range: user.allowed_range
                                    });
                                    if (res.success) alert("Geofencing Settings Updated!");
                                    else alert("Error: " + res.message);
                                }}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                            >
                                Update Geofence
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* KYC Documents Section */}
                    <div className="space-y-6">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FileText size={14} /> KYC & Documents Verification
                        </h5>
                        <div className="grid grid-cols-1 gap-4">
                            {(user.documents || []).length > 0 ? (
                                user.documents.map((doc, i) => (
                                    <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-50 p-3 rounded-xl">
                                                <FileText size={24} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{doc.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Status: {doc.status}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' :
                                                doc.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                {doc.status}
                                            </div>
                                            <button
                                                onClick={() => setAdminViewingDoc(doc)}
                                                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all"
                                            >
                                                <Eye size={14} /> Review
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Documents Uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Service Usage Table */}
                    <div className="space-y-6">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Package size={14} /> Service-wise Summary
                        </h5>
                        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Service Name</th>
                                        <th className="px-6 py-4">Transactions</th>
                                        <th className="px-6 py-4 text-right">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 font-bold">
                                    {Object.entries(serviceStats).map(([name, stats]) => (
                                        <tr key={name}>
                                            <td className="px-6 py-4 text-slate-700">{name}</td>
                                            <td className="px-6 py-4 text-slate-500">{stats.count}</td>
                                            <td className="px-6 py-4 text-emerald-600 text-right">₹ {stats.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {Object.keys(serviceStats).length === 0 && (
                                        <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-300 italic">No service usage recorded yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="space-y-6">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <History size={14} /> Recent Transactions
                    </h5>
                    <div className="space-y-4">
                        {txns.slice(0, 20).map((txn, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between hover:border-blue-200 transition-colors shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-2xl ${txn.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        <IndianRupee size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{txn.service}</div>
                                        {txn.details && txn.details.beneficiaryName && (
                                            <div className="bg-slate-50 p-3 rounded-xl my-2 border border-slate-100">
                                                <div className="text-xs font-bold text-slate-600">
                                                    <span className="text-slate-400">Paid To:</span> {txn.details.beneficiaryName}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase mt-1 leading-relaxed">
                                                    {txn.details.bankName} • {txn.details.accountNumber} <br />
                                                    IFSC: {txn.details.ifsc}
                                                </div>
                                                {txn.details.senderName && (
                                                    <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200">
                                                        Sender: {txn.details.senderName}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {txn.details && txn.details.location && (
                                            <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                                                <span>📍</span> {txn.details.location.lat}, {txn.details.location.long}
                                            </div>
                                        )}
                                        <div className="text-[11px] text-slate-400 font-bold mt-1">{new Date(txn.timestamp).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-slate-900">₹ {txn.amount.toLocaleString()}</div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${txn.status === 'Success' ? 'text-emerald-500' : 'text-red-400'}`}>{txn.status}</div>
                                </div>
                            </div>
                        ))}
                        {txns.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                                <p className="text-slate-300 font-bold uppercase tracking-widest">No transactions found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetailerDetails;
