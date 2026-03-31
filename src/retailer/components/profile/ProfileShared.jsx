import React from 'react';
import { ChevronDown } from 'lucide-react';

export const InputField = ({ label, value, onChange, placeholder, type = "text", readOnly = false, icon, subLabel }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{label}</label>
        <div className="relative group">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly}
                className="w-full border-b border-slate-200 py-1.5 font-bold text-slate-700 outline-none focus:border-blue-500 bg-transparent transition-colors disabled:opacity-50"
            />
            {icon && <div className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-500 cursor-pointer">{icon}</div>}
        </div>
        {subLabel && <p className="text-[10px] text-slate-400 mt-1">{subLabel}</p>}
    </div>
);

export const SelectField = ({ label, value, options, onChange }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{label}</label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className="w-full border-b border-slate-200 py-1.5 font-bold text-slate-700 outline-none focus:border-blue-500 bg-transparent appearance-none cursor-pointer"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    </div>
);
