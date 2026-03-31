import React from 'react';
import { Camera, Edit3, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { InputField, SelectField } from './ProfileShared';

const PersonalInfo = ({ formData, handleInputChange, handleSave, isSaving, isSendingOtp, profilePhoto, fileInputRef, handlePhotoChange, onVerifyEmail, onVerifyPan, isVerifyingPan }) => {
    return (
        <div className="flex space-x-6">
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-8 space-y-8">
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-bold text-[#0ea5e9] tracking-tight mb-6 self-start">Update Your Personal Information</h2>
                    <div className="relative mb-8 group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg bg-slate-100 flex items-center justify-center">
                            <img src={profilePhoto} alt="User" className="w-full h-full object-cover" />
                        </div>
                        <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-blue-900 text-white p-2 rounded-full border-2 border-white shadow-md">
                            <Camera size={14} />
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoChange} accept="image/*" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full text-[11px] font-bold text-slate-500">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-1"><span>Login Name</span><div className="flex items-center space-x-2"><span className="text-slate-700">{formData.username || 'N/A'}</span><Edit3 size={12} className="text-blue-500" /></div></div>
                        <div className="flex justify-between items-center border-b border-slate-50 pb-1"><span>Mobile No.</span><div className="flex items-center space-x-2"><span className="text-slate-700">{formData.mobile}</span><CheckCircle2 size={12} fill="#22c55e" className="text-white" /></div></div>
                        <div className="flex justify-between items-center border-b border-slate-50 pb-1">
                            <span>Email ID</span>
                            <div className="flex items-center space-x-2">
                                <span className="text-slate-700 truncate max-w-[120px]">{formData.email}</span>
                                <CheckCircle2 size={12} fill="#22c55e" className="text-white" />
                            </div>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-50 pb-1"><span>Party Code</span><span className="text-slate-700 font-mono">{formData.partyCode || 'PENDING'}</span></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 pt-4">
                    <InputField label="Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                    <InputField label="Mobile No." value={formData.mobile} onChange={(e) => handleInputChange('mobile', e.target.value)} />
                    <InputField label="Email ID" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} subLabel="Verify this email to receive official communications." />
                    <SelectField label="Gender" value={formData.gender} options={['Male', 'Female']} onChange={(e) => handleInputChange('gender', e.target.value)} />
                    <SelectField label="Marital Status" value={formData.maritalStatus} options={['Married', 'Single']} onChange={(e) => handleInputChange('maritalStatus', e.target.value)} />
                    <InputField label="Date Of Birth" type="date" value={formData.dob} onChange={(e) => handleInputChange('dob', e.target.value)} />

                    <div className="pt-2 border-t border-slate-50">
                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Identity Verification</h4>
                        <InputField
                            label="PAN Number"
                            value={formData.panNumber}
                            onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                            placeholder="ABCDE1234F"
                            icon={
                                formData.isPanVerified ? (
                                    <CheckCircle2 size={16} fill="#22c55e" className="text-white" />
                                ) : (
                                    <button
                                        onClick={onVerifyPan}
                                        disabled={isVerifyingPan || !formData.panNumber}
                                        className="text-[9px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-blue-100 disabled:opacity-50"
                                    >
                                        {isVerifyingPan ? 'Verifying...' : 'Verify PAN'}
                                    </button>
                                )
                            }
                            subLabel={formData.isPanVerified ? `Verified Name: ${formData.panName}` : "Verify your PAN to enable banking services."}
                        />
                    </div>
                    <InputField label="Residential Address Line 1" value={formData.residentialAddress1} onChange={(e) => handleInputChange('residentialAddress1', e.target.value)} />
                    <InputField label="Residential Address Line 2" value={formData.residentialAddress2} onChange={(e) => handleInputChange('residentialAddress2', e.target.value)} />
                    <div className="grid grid-cols-1 gap-6">
                        <InputField label="Pincode" value={formData.pincode} onChange={(e) => handleInputChange('pincode', e.target.value)} />
                        <SelectField label="Area" value={formData.area} options={['Muzaffarpur', 'Other']} onChange={(e) => handleInputChange('area', e.target.value)} />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="bg-[#1e3a8a] text-white px-8 py-3 rounded-full font-black uppercase text-xs flex items-center space-x-2 shadow-lg active:scale-95 transition-all">
                        <span>{isSaving ? 'Saving...' : 'Submit'}</span>
                        {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                    </button>
                </div>
            </div>
            <div className="w-[380px] bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-[#334e68] mb-6">Personal Detail Completion</h3>
                <div className="space-y-6 text-[11px]">
                    {[
                        { title: 'Email Id', desc: 'Verify your email address by clicking on verify.' },
                        { title: 'Personal Detail', desc: 'Enter your personal details as per your id and address proof.' },
                        { title: 'Date of birth', desc: 'Enter your date of birth as per proof of id and address proof.' }
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

export default PersonalInfo;
