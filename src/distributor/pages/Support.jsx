import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Video, FileText, Send, Plus, ChevronRight, Play, CheckCircle2, AlertCircle, Clock, VideoIcon } from 'lucide-react';

const SupportForm = ({ title, fields, icon: Icon }) => {
    const [submitting, setSubmitting] = useState(false);
    return (
        <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <Icon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-800">{title}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Submit your request to support team</p>
                </div>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitting(true); setTimeout(() => setSubmitting(false), 1500); }}>
                {fields.map((f, i) => (
                    <div key={i} className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{f.label}</label>
                        {f.type === 'textarea' ? (
                            <textarea placeholder={f.placeholder} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white text-sm min-h-[100px]" required />
                        ) : (
                            <input type={f.type || 'text'} placeholder={f.placeholder} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white text-sm" required />
                        )}
                    </div>
                ))}
                <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white font-black py-4 rounded-xl text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                    {submitting ? 'Submitting...' : <><Send size={14} /> Submit Request</>}
                </button>
            </form>
        </div>
    );
};

export const SupportLeads = () => (
    <div className="p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SupportForm
                title="Online Retailer Lead"
                fields={[
                    { label: 'Merchant Name', placeholder: 'Full Name' },
                    { label: 'Mobile Number', placeholder: '10 digits mobile' },
                    { label: 'Pincode', placeholder: '6 digits pincode' },
                    { label: 'Store Location', placeholder: 'Full address' }
                ]}
                icon={Plus}
            />
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-black text-slate-800 uppercase tracking-tight">Recent Leads</h2>
                    <span className="text-[9px] font-black bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full uppercase tracking-widest">Tracking Live</span>
                </div>
                <div className="space-y-4">
                    {[
                        { name: 'Suresh Kirana', loc: 'Lucknow', date: '20 Feb', status: 'In Process' },
                        { name: 'Amit Telecom', loc: 'Delhi', date: '18 Feb', status: 'Interested' }
                    ].map((l, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-xs font-black text-slate-800">{l.name}</p>
                                <p className="text-[9px] font-bold text-slate-400">{l.loc} • {l.date}</p>
                            </div>
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{l.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const EcollectComplaints = () => (
    <div className="p-8">
        <SupportForm title="ECollect / OLP Complaint" fields={[{ label: 'Txn ID', placeholder: 'Transaction ID' }, { label: 'Amount', placeholder: 'Amount lost' }, { label: 'Description', placeholder: 'Describe the issue', type: 'textarea' }]} icon={AlertCircle} />
    </div>
);

export const RetailerComplaints = () => (
    <div className="p-8">
        <SupportForm title="Retailer Complaint" fields={[{ label: 'Retailer ID', placeholder: 'RTXXXX' }, { label: 'Subject', placeholder: 'Reason for complaint' }, { label: 'Details', placeholder: 'Explain in detail', type: 'textarea' }]} icon={MessageSquare} />
    </div>
);

export const TrainingVideos = () => (
    <div className="p-4 md:p-8 space-y-6">
        <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Training Videos</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Master RUPIKSHA services within minutes</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
                { title: 'AEPS Implementation', duration: '5:22', category: 'AEPS' },
                { title: 'Commission Management', duration: '3:45', category: 'Financials' },
                { title: 'Adding Funds via CDM', duration: '4:10', category: 'Wallet' },
                { title: 'KYC Verification Flow', duration: '6:15', category: 'Onboarding' },
                { title: 'DMT Transfer Guide', duration: '4:30', category: 'Service' },
                { title: 'BBPS Bill Payments', duration: '3:50', category: 'Service' }
            ].map((v, i) => (
                <motion.div key={i} whileHover={{ y: -5 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group cursor-pointer">
                    <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play size={20} className="text-indigo-500 fill-indigo-500 ml-1" />
                        </div>
                        <span className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg">{v.duration}</span>
                    </div>
                    <div className="p-5">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">{v.category}</p>
                        <h3 className="text-sm font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{v.title}</h3>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);
