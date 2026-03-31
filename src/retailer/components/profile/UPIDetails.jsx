import React from 'react';
import { Plus, RefreshCw, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { InputField } from './ProfileShared';

const UPIDetails = ({ formData, handleInputChange, handleSave, isSaving, onVerifyUpi, isVerifyingUpi }) => {
    return (
        <div className="flex space-x-6">
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-8">
                <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <h2 className="text-lg font-bold text-[#0ea5e9] tracking-tight">UPI Configuration</h2>
                    <div className="flex items-center space-x-2">
                        {formData.isUpiVerified && (
                            <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                            </div>
                        )}
                        <button
                            onClick={() => handleInputChange('upiId', '')}
                            className="flex items-center space-x-2 text-[#1e3a8a] bg-blue-50 px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:bg-blue-100 transition-all border border-blue-100"
                        >
                            <Plus size={14} />
                            <span>Add UPI ID</span>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div className="relative">
                        <InputField
                            label="Primary UPI ID"
                            value={formData.upiId}
                            onChange={(e) => {
                                handleInputChange('upiId', e.target.value);
                                if (formData.isUpiVerified) handleInputChange('isUpiVerified', false);
                            }}
                            placeholder="e.g. mobile@upi"
                            subLabel="This ID will be used for fast settlements and payouts."
                        />
                        <div className="absolute top-2 right-0">
                            <button
                                onClick={onVerifyUpi}
                                disabled={isVerifyingUpi || !formData.upiId || formData.isUpiVerified}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-md
                                ${formData.isUpiVerified
                                        ? 'bg-emerald-500 text-white cursor-default'
                                        : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'
                                    } disabled:opacity-50`}
                            >
                                {isVerifyingUpi ? <RefreshCw size={14} className="animate-spin" /> : (formData.isUpiVerified ? <ShieldCheck size={14} /> : <Zap size={14} />)}
                                <span>{isVerifyingUpi ? 'Verifying...' : (formData.isUpiVerified ? 'Verified' : 'Verify ID')}</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end pt-4 border-t border-slate-50">
                    <button onClick={handleSave} className="bg-[#1e3a8a] text-white px-8 py-3 rounded-full font-black uppercase text-xs flex items-center space-x-2 shadow-lg active:scale-95 transition-all">
                        <span>{isSaving ? 'Saving...' : 'Submit'}</span>
                        {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    </button>
                </div>
            </div>
            <div className="w-[380px] bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-[#334e68] mb-6">UPI Information</h3>
                <div className="space-y-4 text-[11px] text-slate-400 font-medium">
                    <p>Register your UPI Virtual Payment Address (VPA) for quick and secure transactions.</p>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <p className="text-orange-700 font-bold uppercase text-[9px]">Important Note:</p>
                        <p className="mt-1 leading-relaxed italic">Currently only one active UPI ID is allowed per account for security reasons.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UPIDetails;
