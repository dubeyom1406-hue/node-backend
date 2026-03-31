import React from 'react';
import { RefreshCw, ArrowRight, ChevronDown } from 'lucide-react';
import { InputField, SelectField } from './ProfileShared';

const AdditionalDetails = ({ formData, handleInputChange, handleSave, isSaving, additionalTab, setAdditionalTab }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
            <div className="flex border-b border-slate-100 p-4 space-x-6 bg-slate-50/50">
                {['personal', 'business', 'general'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setAdditionalTab(tab)}
                        className={`px-6 py-2 text-[11px] font-bold uppercase tracking-tight transition-all rounded-md shadow-sm ${additionalTab === tab
                            ? 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                            }`}
                    >
                        Additional {tab}
                    </button>
                ))}
            </div>
            <div className="p-8">
                {additionalTab === 'personal' && (
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        <InputField label="Alternative Number*" value={formData.altNumber} onChange={(e) => handleInputChange('altNumber', e.target.value)} />
                        <SelectField label="Education" value={formData.addEducation} options={['GRADUATE']} onChange={(e) => handleInputChange('addEducation', e.target.value)} />
                        <SelectField label="Physically handicapped" value={formData.handicapped} options={['NO', 'YES']} onChange={(e) => handleInputChange('handicapped', e.target.value)} />
                        <SelectField label="Nominee Details" value={formData.nomineeDetails} options={['Spouse']} onChange={(e) => handleInputChange('nomineeDetails', e.target.value)} />
                        <InputField label="Nominee Name" value={formData.nomineeName} onChange={(e) => handleInputChange('nomineeName', e.target.value)} />
                        <InputField label="Nominee Age" value={formData.nomineeAge} onChange={(e) => handleInputChange('nomineeAge', e.target.value)} />
                        <SelectField label="Marital Status" value={formData.marriedStatus} options={['YES', 'NO']} onChange={(e) => handleInputChange('marriedStatus', e.target.value)} />
                        <InputField label="Spouse Name" value={formData.spouseName} onChange={(e) => handleInputChange('spouseName', e.target.value)} />
                        <InputField label="Wedding Date" value={formData.weddingDate} onChange={(e) => handleInputChange('weddingDate', e.target.value)} />
                    </div>
                )}
                {additionalTab === 'business' && (
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        <SelectField label="Expected Business per month (in Rs)" value={formData.expectedBizRs} options={['5 Lac to 10 Lac']} onChange={(e) => handleInputChange('expectedBizRs', e.target.value)} />
                        <SelectField label="Expected Business per month (no. of transactions)" value={formData.expectedBizTxn} options={['1001 to 2000']} onChange={(e) => handleInputChange('expectedBizTxn', e.target.value)} />
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Weekly off</label>
                            <div className="bg-[#1e1e4b] text-white px-3 py-1.5 rounded text-[9px] font-bold inline-block">Sunday</div>
                        </div>
                        <SelectField label="Current Monthly income" value={formData.monthlyIncome} options={['50K to 1 Lac']} onChange={(e) => handleInputChange('monthlyIncome', e.target.value)} />
                        <SelectField label="No. of years in business experience" value={formData.bizExperience} options={['10 year & above']} onChange={(e) => handleInputChange('bizExperience', e.target.value)} />
                        <SelectField label="No. of customers / foot fall" value={formData.footFall} options={['101 to 250']} onChange={(e) => handleInputChange('footFall', e.target.value)} />
                    </div>
                )}
                {additionalTab === 'general' && (
                    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                        <SelectField label="Services required" value={formData.servicesRequired} options={['NO', 'YES']} onChange={(e) => handleInputChange('servicesRequired', e.target.value)} />
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Select Services</label>
                            <div className="relative border-b border-slate-200 py-1.5 flex items-center justify-between group cursor-pointer hover:border-blue-400">
                                <span className="text-slate-400 font-bold">--- Select Multiselect ---</span>
                                <ChevronDown size={14} className="text-slate-400" />
                            </div>
                        </div>
                        <SelectField label="Do you have any competitor ID?" value={formData.competitorId} options={['NO', 'YES']} onChange={(e) => handleInputChange('competitorId', e.target.value)} />
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Competitors</label>
                            <div className="relative border-b border-slate-200 py-1.5 flex items-center justify-between group cursor-pointer hover:border-blue-400">
                                <div className="bg-[#3b3b7a] text-white px-3 py-1 rounded text-[9px] font-bold flex items-center space-x-1 shadow-sm">
                                    <span>multisafar</span>
                                </div>
                                <ChevronDown size={14} className="text-slate-400" />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <div className="space-y-1 w-1/2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Where do you get Payworld reference from</label>
                                <div className="relative border-b border-slate-200 py-1.5 flex items-center justify-between group cursor-pointer hover:border-blue-400">
                                    <span className="text-slate-400 font-bold">--- Select Multiselect ---</span>
                                    <ChevronDown size={14} className="text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-8 border-t border-slate-50 flex justify-end">
                <button onClick={handleSave} className="bg-[#1e3a8a] text-white px-10 py-2.5 rounded-full font-black uppercase text-xs flex items-center space-x-2 shadow-lg active:scale-95 transition-all">
                    <span>{isSaving ? 'Saving...' : 'Submit'}</span>
                    {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                </button>
            </div>
        </div>
    );
};

export default AdditionalDetails;
