import React from 'react';

export const Icon3D = ({ icon: Icon, color, size = 24 }) => (
    <div className="relative group">
        <div className="absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }}></div>
        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 border border-white/20 overflow-hidden" style={{ backgroundColor: color }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
            <Icon size={size} className="text-white relative z-10" />
        </div>
    </div>
);

export const StatusBadge = ({ status }) => {
    const config = {
        SUCCESS: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500', label: 'Completed' },
        PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500', label: 'Processing' },
        FAILED: { bg: 'bg-rose-500/10', text: 'text-rose-600', dot: 'bg-rose-500', label: 'Declined' },
    };
    const s = config[status?.toUpperCase()] || config.PENDING;
    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${s.bg} ${s.text} text-[10px] font-black uppercase tracking-wider border border-white/50 shadow-sm`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`}></span>
            {s.label}
        </div>
    );
};
