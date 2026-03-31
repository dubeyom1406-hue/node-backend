import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const SuperAdminPlaceholder = ({ title = 'Coming Soon' }) => {
    const navigate = useNavigate();

    return (
        <div className="h-full min-h-[60vh] flex flex-col items-center justify-center p-10 text-center space-y-6">
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="p-8 bg-amber-50 text-amber-500 rounded-3xl shadow-xl"
            >
                <Construction size={56} />
            </motion.div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{title}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-sm">
                    This section is being finalized. It will be live very shortly.
                </p>
            </div>
            <button
                onClick={() => navigate('/superadmin')}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
            >
                <ArrowLeft size={14} />
                Back to Dashboard
            </button>
        </div>
    );
};

export default SuperAdminPlaceholder;
