import React from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { InputField, SelectField } from './ProfileShared';

const BusinessInfo = ({ formData, handleInputChange, handleSave, isSaving }) => {
    return (
        <div className="flex space-x-6">
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-8">
                <h2 className="text-lg font-bold text-[#0ea5e9] tracking-tight border-b border-slate-50 pb-4">Update Your Business Information</h2>
                <div className="grid grid-cols-1 gap-6">
                    <InputField label="Business Name" value={formData.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} />
                    <SelectField label="Business Type" value={formData.businessType} options={['Sole proprietorship', 'Partnership', 'Private Limited']} onChange={(e) => handleInputChange('businessType', e.target.value)} />
                    <SelectField label="Business Category" value={formData.category} options={['Hosting', 'Retail', 'Telecom']} onChange={(e) => handleInputChange('category', e.target.value)} />
                    <InputField label="Business Address Line 1" value={formData.address1} onChange={(e) => handleInputChange('address1', e.target.value)} />
                    <InputField label="Business Address Line 2" value={formData.address2} onChange={(e) => handleInputChange('address2', e.target.value)} />
                    <div className="grid grid-cols-1 gap-6">
                        <InputField label="Pincode" value={formData.pincode} onChange={(e) => handleInputChange('pincode', e.target.value)} />
                        <p className="text-[10px] text-slate-400 -mt-4">You are at Muzaffarpur, BIHAR.</p>
                        <SelectField label="Area" value={formData.area} options={['Sikandarpur (Muzaffarpur)', 'Other']} onChange={(e) => handleInputChange('area', e.target.value)} />
                    </div>
                    <InputField label="Sales Executive Name" value={formData.salesName} onChange={(e) => handleInputChange('salesName', e.target.value)} />
                    <InputField label="Sales Executive Contact" value={formData.salesContact} onChange={(e) => handleInputChange('salesContact', e.target.value)} />
                </div>
                <div className="flex items-center justify-between pt-4">
                    <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">View Shop Address Proof</button>
                    <button onClick={handleSave} className="bg-[#1e3a8a] text-white px-8 py-3 rounded-full font-black uppercase text-xs flex items-center space-x-2 shadow-lg active:scale-95 transition-all">
                        <span>{isSaving ? 'Saving...' : 'Submit'}</span>
                        {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    </button>
                </div>
            </div>
            <div className="w-[380px] bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-[#334e68] mb-6">Business Detail Completion</h3>
                <div className="space-y-6 text-[11px]">
                    {[
                        { title: 'Geographical Location', desc: 'Kindly click on problem in sharing location for troubleshooting steps in case you face any issue in sharing your geographical location.' },
                        { title: 'Business Detail', desc: 'Enter your business name and type, business category and address as per proof of business document.' },
                        { title: 'Shop/Business Address Proof', desc: 'Upload your business proof document as per Business details' }
                    ].map((step, i) => (
                        <div key={i} className="space-y-1">
                            <span className="font-bold text-slate-700">{i + 1}. {step.title}</span>
                            <p className="text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BusinessInfo;
