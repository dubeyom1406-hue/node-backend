import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    X, Wallet, FileText, CheckCircle2, Building2, IndianRupee, History, ArrowLeft, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sharedDataService } from '../../services/sharedDataService';
import { dataService } from '../../services/dataService';

const DistributorDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dist, setDist] = useState(null);

    useEffect(() => {
        const found = sharedDataService.getDistributorById(id);
        if (found) {
            setDist(found);
        }
    }, [id]);

    if (!dist) return <div className="p-10 font-bold text-center">Loading or Distributor Not Found...</div>;

    // For a distributor, we might want to show their retailers
    const assignedRetailers = dist.assignedRetailers || [];

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
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{dist.businessName || 'UNNAMED DISTRIBUTOR'}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{dist.mobile}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">{dist.id}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet size={80} className="text-amber-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Wallet Balance</p>
                        <h4 className="text-4xl font-black text-slate-800">₹ {parseFloat(dist.wallet?.balance || 0).toLocaleString()}</h4>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-amber-50 text-amber-600 w-fit px-3 py-1.5 rounded-full uppercase">
                            <Wallet size={12} /> Distributor Wallet
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Building2 size={80} className="text-blue-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Assigned Retailers</p>
                        <h4 className="text-4xl font-black text-slate-800">{assignedRetailers.length}</h4>
                        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase">Managing {assignedRetailers.length} outlets</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <History size={80} className="text-slate-800" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</p>
                        <h4 className="text-4xl font-black text-slate-800">{dist.status}</h4>
                        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase">Since {new Date(dist.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Assigned Retailers List */}
                    <div className="space-y-6">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Building2 size={14} /> Assigned Retailers
                        </h5>
                        <div className="grid grid-cols-1 gap-4">
                            {assignedRetailers.length > 0 ? (
                                assignedRetailers.map((username, i) => {
                                    const retailer = (dataService.getData().users || []).find(u => u.username === username);
                                    return (
                                        <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-50 p-3 rounded-xl">
                                                    <Building2 size={24} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{retailer?.businessName || retailer?.name || username}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{retailer?.mobile}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/admin/retailer/${username}`)}
                                                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all"
                                            >
                                                <Eye size={14} /> Profile
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Retailers Assigned</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Info Overview */}
                    <div className="space-y-6">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <FileText size={14} /> Distributor Information
                        </h5>
                        <div className="bg-white border border-slate-100 p-8 rounded-3xl space-y-6 shadow-sm">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner / Primary Contact</p>
                                    <p className="text-sm font-black text-slate-800 uppercase">{dist.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                    <p className="text-sm font-black text-slate-800">{dist.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State / Zone</p>
                                    <p className="text-sm font-black text-slate-800 uppercase">{dist.state}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City / Hub</p>
                                    <p className="text-sm font-black text-slate-800 uppercase">{dist.city}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DistributorDetails;
