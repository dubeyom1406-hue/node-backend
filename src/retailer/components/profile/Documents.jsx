import React, { useState } from 'react';
import { FileText, Eye, Upload, ShieldCheck, X, RefreshCw, AlertCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '../../../services/dataService';

const Documents = ({ currentUser }) => {
    const [viewingDoc, setViewingDoc] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);

    const docTypes = [
        'Aadhaar Card (Front)',
        'Aadhaar Card (Back)',
        'PAN Card',
        'Shop Photo',
        'Bank Passbook / Cheque'
    ];

    const userDocs = currentUser.documents || [];

    const handleFileUpload = (docName, e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            dataService.updateUserDocument(currentUser.username, docName, event.target.result);
            setIsUploading(false);
            setUploadStatus({ type: 'success', message: `${docName} uploaded successfully! Admin will verify soon.` });
            setTimeout(() => setUploadStatus(null), 3000);
            window.dispatchEvent(new Event('dataUpdated'));
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {uploadStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest border ${uploadStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                    >
                        {uploadStatus.type === 'success' ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                        {uploadStatus.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docTypes.map((type, i) => {
                    const doc = userDocs.find(d => d.name === type);
                    return (
                        <div key={type} className="flex flex-col p-5 border border-slate-100 rounded-2xl bg-white hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-blue-50 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                    <FileText size={20} className="text-blue-600" />
                                </div>
                                <div className="text-right">
                                    {doc ? (
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' :
                                                doc.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {doc.status === 'Pending' ? 'Under Review' : doc.status}
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">Not Uploaded</span>
                                    )}
                                </div>
                            </div>

                            <h4 className="text-[13px] font-black text-slate-700 uppercase tracking-tight mb-1">{type}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                {doc ? `Modified: ${doc.date}` : 'Action Required'}
                            </p>

                            <div className="mt-auto flex gap-2">
                                {doc ? (
                                    <button
                                        onClick={() => setViewingDoc(doc)}
                                        className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200"
                                    >
                                        <Eye size={14} /> View
                                    </button>
                                ) : null}
                                <label className={`flex-1 ${doc ? 'w-fit' : 'w-full'} cursor-pointer bg-blue-600 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors`}>
                                    <Upload size={14} /> {doc ? 'Re-upload' : 'Upload'}
                                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(type, e)} disabled={isUploading} />
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Document Viewer Modal */}
            <AnimatePresence>
                {viewingDoc && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                            onClick={() => setViewingDoc(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 p-8 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{viewingDoc.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Uploaded on {viewingDoc.date}</p>
                                </div>
                                <button onClick={() => setViewingDoc(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-all">
                                    <X size={20} className="text-slate-600" />
                                </button>
                            </div>

                            <div className="flex-1 bg-slate-50 rounded-3xl overflow-hidden flex items-center justify-center border border-slate-100">
                                {viewingDoc.file.startsWith('data:image') ? (
                                    <img src={viewingDoc.file} alt="Document" className="max-w-full max-h-full object-contain shadow-lg" />
                                ) : (
                                    <div className="flex flex-col items-center p-12">
                                        <FileText size={64} className="text-blue-500 mb-4" />
                                        <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">PDF Document Loaded</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex items-center justify-between">
                                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${viewingDoc.status === 'Verified' ? 'text-emerald-500' : 'text-orange-500'
                                    }`}>
                                    <ShieldCheck size={18} />
                                    <span>Status: {viewingDoc.status}</span>
                                </div>
                                <button onClick={() => setViewingDoc(null)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Close Preview</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Documents;
