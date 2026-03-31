import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Building2, MapPin, CreditCard, ChevronRight, CheckCircle2, AlertCircle, Camera, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../../services/dataService';

const KYCVerification = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(user?.profile_kyc_status === 'PENDING');
    
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        fathersName: '',
        mobile: user?.mobile || user?.username || '',
        alternateMobile: '',
        panNumber: '',
        aadhaarNumber: '',
        email: user?.email || '',
        shopName: user?.business_name || '',
        shopAddress: user?.address || '',
        city: '',
        state: '',
        pincode: '',
        aadhaarFront: '',
        aadhaarBack: '',
        shopSelfie: '',
        gstCertificate: '',
        tdsCertificate: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                setFormData(prev => ({ ...prev, [name]: reader.result }));
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step < 3) {
            nextStep();
            return;
        }

        if (!formData.aadhaarFront || !formData.aadhaarBack || !formData.shopSelfie) {
            alert("All documents (Aadhaar Front, Back & Shop Selfie) are required.");
            return;
        }

        setSubmitting(true);
        try {
            const data = await dataService.submitKyc(user.id, 'MAIN', formData);
            if (data.success) {
                setSubmitted(true);
                const updatedUser = { ...user, profile_kyc_status: 'PENDING' };
                setUser(updatedUser);
                localStorage.setItem('rupiksha_user', JSON.stringify(updatedUser));
            } else {
                alert(data.message || data.error || "Submission failed");
            }
        } catch (err) {
            alert("Connection error: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[3rem] shadow-2xl p-12 text-center max-w-lg w-full border border-slate-100"
                >
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-8">
                        <CheckCircle2 size={48} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter mb-4">KYC Submitted!</h1>
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-8">Pending Admin Approval</p>
                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-left mb-8">
                        <p className="text-sm text-slate-500 font-bold leading-relaxed mb-4 uppercase">
                            Your KYC details have been received and are currently under review by our administration team.
                        </p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                            Expected approval time: 2-4 hours. You will be able to access the full features once approved.
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all"
                    >
                        Back to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    if (user?.profile_kyc_status === 'REJECTED') {
        return (
            <div className="min-h-screen bg-[#fef2f2] flex items-center justify-center p-6">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] shadow-2xl p-12 text-center max-w-lg w-full border border-red-100"
                >
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 mb-8">
                        <AlertCircle size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">KYC Rejected</h1>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-8">Documents or Details mismatch</p>
                    
                    <div className="bg-red-50 rounded-2xl p-6 border border-red-100 text-left mb-8">
                         <p className="text-xs text-red-800 font-bold uppercase leading-relaxed">
                            Aapka profile KYC admin dwara reject kar diya gaya hai. Kripya sahi details dubara bhare.
                         </p>
                    </div>

                    <button 
                        onClick={() => setUser({...user, profile_kyc_status: 'NOT_DONE'})}
                        className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all"
                    >
                        Re-Submit KYC
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-80 bg-slate-900 -z-10 rounded-b-[5rem]" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden"
            >
                <div className="bg-slate-900 p-8 text-white">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400">Step {step} of 3</span>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                            ))}
                        </div>
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">
                        {step === 1 && 'Identity Verification'}
                        {step === 2 && 'Business Location'}
                        {step === 3 && 'Document Uploads'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1" 
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Full Name (PAN)</label>
                                        <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-slate-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Father's Name</label>
                                        <input required name="fathersName" value={formData.fathersName} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-slate-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Mobile Number</label>
                                        <input required name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-slate-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Alt Mobile (Optional)</label>
                                        <input name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-slate-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Email Address</label>
                                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-slate-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Shop Name</label>
                                        <input required name="shopName" value={formData.shopName} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-slate-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">PAN Number</label>
                                        <input required name="panNumber" value={formData.panNumber} onChange={handleChange} maxLength={10} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black tracking-widest uppercase text-slate-800 focus:border-slate-900 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Aadhaar Number</label>
                                        <input required name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} maxLength={12} className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black tracking-widest text-slate-800 focus:border-slate-900 outline-none transition-all" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2" 
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-5">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Shop Proper Address</label>
                                        <textarea required name="shopAddress" value={formData.shopAddress} onChange={handleChange} rows={3} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-slate-900 outline-none transition-all resize-none" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">City</label>
                                            <input required name="city" value={formData.city} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-slate-900 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">State</label>
                                            <input required name="state" value={formData.state} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-slate-900 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Pincode</label>
                                            <input required name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 focus:border-slate-900 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3" 
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Aadhaar Front Side</label>
                                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 transition-all hover:bg-slate-50">
                                            <input required type="file" name="aadhaarFront" onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            {formData.aadhaarFront ? (
                                                <img src={formData.aadhaarFront} className="h-24 w-full object-cover rounded-xl" alt="Preview" />
                                            ) : (
                                                <div className="flex flex-col items-center py-4 text-slate-400">
                                                     <FileText size={24} />
                                                     <span className="text-[9px] font-black uppercase mt-2">Click to Upload Front</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Aadhaar Back Side</label>
                                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 transition-all hover:bg-slate-50">
                                            <input required type="file" name="aadhaarBack" onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            {formData.aadhaarBack ? (
                                                <img src={formData.aadhaarBack} className="h-24 w-full object-cover rounded-xl" alt="Preview" />
                                            ) : (
                                                <div className="flex flex-col items-center py-4 text-slate-400">
                                                     <FileText size={24} />
                                                     <span className="text-[9px] font-black uppercase mt-2">Click to Upload Back</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Shop Selfie / Photo</label>
                                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 transition-all hover:bg-slate-50">
                                            <input required type="file" name="shopSelfie" onChange={handleFileChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            {formData.shopSelfie ? (
                                                <img src={formData.shopSelfie} className="h-32 w-full object-cover rounded-xl" alt="Preview" />
                                            ) : (
                                                <div className="flex flex-col items-center py-6 text-slate-400">
                                                     <Camera size={32} />
                                                     <span className="text-[10px] font-black uppercase mt-2">Click to Upload Shop Selfie</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">GST Certificate (Optional)</label>
                                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 transition-all hover:bg-slate-50">
                                            <input type="file" name="gstCertificate" onChange={handleFileChange} accept="application/pdf,image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            {formData.gstCertificate ? (
                                                <div className="h-24 w-full flex items-center justify-center bg-indigo-50 rounded-xl text-indigo-600 font-black text-[10px] uppercase">Certificate Uploaded</div>
                                            ) : (
                                                <div className="flex flex-col items-center py-4 text-slate-400">
                                                     <FileText size={24} />
                                                     <span className="text-[9px] font-black uppercase mt-2">Click to Upload GST</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-2">TDS Certificate (Optional)</label>
                                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 transition-all hover:bg-slate-50">
                                            <input type="file" name="tdsCertificate" onChange={handleFileChange} accept="application/pdf,image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                            {formData.tdsCertificate ? (
                                                <div className="h-24 w-full flex items-center justify-center bg-indigo-50 rounded-xl text-indigo-600 font-black text-[10px] uppercase">Certificate Uploaded</div>
                                            ) : (
                                                <div className="flex flex-col items-center py-4 text-slate-400">
                                                     <FileText size={24} />
                                                     <span className="text-[9px] font-black uppercase mt-2">Click to Upload TDS</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[9px] font-bold text-amber-900 uppercase">Warning: Providing false documents will lead to permanent ban.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-4 pt-4">
                        {step > 1 && (
                            <button 
                                type="button" 
                                onClick={prevStep}
                                className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                                <ChevronRight size={16} className="rotate-180" /> Previous
                            </button>
                        )}
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className={`flex-[2] py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3`}
                        >
                            {submitting ? 'Submitting...' : (
                                step === 3 ? 'Final Submit' : (
                                    <>Next Step <ChevronRight size={16} /></>
                                )
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default KYCVerification;
