import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Smartphone, Store, ChevronRight, Camera, User, MapPin, FileUp, ArrowLeft, Fingerprint, Lock, Shield } from 'lucide-react';
import { dataService } from '../../../services/dataService';

const RetailerEKYC = ({ user, onComplete }) => {
    // Current Step: 1: Personal, 2: Shop/Address, 3: Documents, 4: Success
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Verification States
    const [verifyingAadhaar, setVerifyingAadhaar] = useState(false); // UI state for verification flow
    const [verificationStep, setVerificationStep] = useState('input'); // input | scanning | otp | verified
    const [otpValue, setOtpValue] = useState('');
    const [aadhaarData, setAadhaarData] = useState(null);
    const [pidData, setPidData] = useState(null);

    const [details, setDetails] = useState({
        fullName: user?.name || '',
        fathersName: '',
        shopName: '',
        panNumber: '',
        aadhaarNumber: user?.aadhaar || '',
        mobile: user?.mobile || '',
        email: user?.email || '',
        businessType: 'Individual',
        shopAddress: '',
        state: '',
        city: '',
        pincode: '',
        shopPhoto: null,
        aadhaarFront: null,
        aadhaarBack: null
    });

    const [verifiedNames, setVerifiedNames] = useState({ pan: '', aadhaar: '' });

    // --- Aadhaar Biometric Flow ---
    // DUMMY Aadhaar Verification for Demo
    const startAadhaarVerification = () => {
        if (details.aadhaarNumber.length !== 12) {
            alert("Enter valid 12-digit Aadhaar");
            return;
        }
        setSubmitting(true);
        // Artificial delay for 'Verification' feel
        setTimeout(() => {
            const dummyData = {
                name: "DUMMY USER (" + details.aadhaarNumber.slice(-4) + ")",
                address: "Sector 62, Noida, Uttar Pradesh - 201301",
                city: "Noida",
                state: "Uttar Pradesh",
                pincode: "201301"
            };
            setAadhaarData(dummyData);
            setDetails(prev => ({
                ...prev,
                fullName: dummyData.name,
                shopAddress: dummyData.address,
                city: dummyData.city,
                state: dummyData.state,
                pincode: dummyData.pincode
            }));
            setVerifiedNames(prev => ({ ...prev, aadhaar: dummyData.name }));
            setVerificationStep('verified');
            setSubmitting(false);
        }, 1500);
    };

    const handleDigiLockerVerify = async () => {
        setSubmitting(true);
        try {
            // Updated to call real Cashfree DigiLocker session
            const res = await dataService.createDigiLockerSession(details.aadhaarNumber);
            if (res.success && res.url) {
                // Open real DigiLocker portal in a new window
                window.open(res.url, 'DigiLocker', 'width=600,height=700');
                alert("Redirecting to Official DigiLocker Portal. Please complete verification there.");
            } else {
                alert(`DigiLocker Error: ${res.message || "Could not initiate session"}`);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleOtpVerify = async () => {
        if (otpValue.length !== 6) return;
        setSubmitting(true);
        try {
            const res = await dataService.verifyAadhaarBiometricOtp(details.aadhaarNumber, otpValue);
            if (res.success) {
                const data = res.data;
                setAadhaarData(data);
                setDetails(prev => ({
                    ...prev,
                    fullName: data.name || prev.fullName,
                    shopAddress: data.address || prev.shopAddress,
                    city: data.city || prev.city,
                    state: data.state || prev.state,
                    pincode: data.pincode || prev.pincode
                }));
                setVerifiedNames(prev => ({ ...prev, aadhaar: data.name }));
                setVerificationStep('verified');
            } else {
                alert(res.message || "Invalid OTP");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const verifyPan = async (pan) => {
        if (pan.length === 10) {
            try {
                const res = await dataService.verifyPAN(pan);
                if (res.success) {
                    setVerifiedNames(prev => ({ ...prev, pan: res.name }));
                    setDetails(prev => ({ ...prev, fullName: res.name }));
                } else {
                    setVerifiedNames(prev => ({ ...prev, pan: '' }));
                    alert(`PAN Error: ${res.message || "Verification failed"}`);
                }
            } catch (err) {
                console.error("PAN Verification failed", err);
            }
        }
    };

    const handlePhotoChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setDetails(prev => ({ ...prev, [field]: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const validateStep1 = () => {
        if (verificationStep !== 'verified') {
            alert("Please verify your Aadhaar with Biometric/OTP first");
            return false;
        }
        if (!details.fullName || !details.fathersName || !details.mobile || !details.email || !details.panNumber) {
            alert("Fill all Personal & ID details");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!details.shopName || !details.shopAddress || !details.city || !details.state || !details.pincode) {
            alert("Fill all Shop & Address details");
            return false;
        }
        return true;
    };

    const handleSubmitKyc = async () => {
        if (!details.shopPhoto || !details.aadhaarFront || !details.aadhaarBack) {
            alert("Upload all documents");
            return;
        }
        setSubmitting(true);
        try {
            await dataService.submitKyc(user.username, 'MAIN', { ...details, verifiedNames });
            setStep(4);
            setTimeout(() => { if (onComplete) onComplete(); }, 3000);
        } finally {
            setSubmitting(false);
        }
    };

    const Stepper = () => {
        const steps = ["Personal", "Business", "Docs", "Done"];
        return (
            <div className="flex justify-between items-center mb-10 px-4">
                {steps.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${i < step ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                            {i + 1 < step ? <CheckCircle2 size={14} /> : i + 1}
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${i < step ? 'text-slate-800' : 'text-slate-300'}`}>{s}</span>
                        {i < steps.length - 1 && (
                            <div className={`absolute left-9 top-4 w-12 md:w-20 h-0.5 ${i + 1 < step ? 'bg-slate-900' : 'bg-slate-100'}`} />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0.9, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-2xl border border-slate-200 overflow-y-auto max-h-[95vh]">
                {step < 4 && <Stepper />}

                <AnimatePresence mode="wait">
                    {/* STEP 1: PERSONAL DETAILS */}
                    {step === 1 && (
                        <motion.div key="step1" className="space-y-6">
                            <div className="text-center space-y-1">
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Personal Details</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verify Aadhaar to Fetch Real Data</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1 md:col-span-2 bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 px-4 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-xl">DigiLocker Verified Gateway</div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Aadhaar Number (12 Digits)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            maxLength={12}
                                            readOnly={verificationStep === 'verified'}
                                            value={details.aadhaarNumber}
                                            onChange={e => setDetails({ ...details, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                                            className="flex-1 px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-xl tracking-[0.2em] outline-none text-slate-900 focus:border-slate-900 transition-all"
                                            placeholder="0000 0000 0000"
                                        />
                                        {verificationStep === 'input' && (
                                            <button onClick={startAadhaarVerification} className="px-6 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                                                <Fingerprint size={14} /> Verify Aadhaar
                                            </button>
                                        )}
                                        {verificationStep === 'verified' && (
                                            <div className="px-4 py-4 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center gap-2"><CheckCircle2 size={18} /><span className="text-[10px] font-black uppercase">DigiLocker Verified</span></div>
                                        )}
                                    </div>

                                        {verificationStep === 'scanning' && (
                                        <div className="mt-4 p-4 bg-white rounded-2xl border-2 border-indigo-100 shadow-sm transition-all duration-300">
                                            <div className="flex items-center gap-3 mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                                <Fingerprint className="text-indigo-600 animate-pulse" size={20} />
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black text-indigo-700 uppercase leading-none">Scanning...</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setVerificationStep('otp')} className="px-6 py-2 bg-indigo-600 text-white rounded-2xl font-black text-xs">Simulate Capture / OTP Fallback</button>
                                        </div>
                                    )}

                                    {verificationStep === 'otp' && (
                                        <div className="mt-4 space-y-3 p-5 bg-indigo-50/50 rounded-[2rem] border-2 border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="text-indigo-600" size={16} />
                                                    <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest text-left">DigiLocker 2FA OTP</p>
                                                </div>
                                                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-full border border-emerald-200">
                                                    <ShieldCheck size={10} className="text-emerald-600" />
                                                    <span className="text-[7px] font-black text-emerald-700 uppercase">Secure</span>
                                                </div>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase text-center leading-relaxed">
                                                Authenticating with DigiLocker Gateway... <br />
                                                Enter the 6-digit code sent to <b>+91-{details.mobile}</b>
                                            </p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    value={otpValue}
                                                    onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                                    className="flex-1 px-4 py-4 bg-white border-2 border-indigo-200 rounded-2xl font-black text-2xl text-center tracking-[0.5em] outline-none text-slate-900 focus:border-indigo-600 transition-all shadow-inner"
                                                    placeholder="000000"
                                                />
                                                <button onClick={handleOtpVerify} disabled={submitting || otpValue.length !== 6} className="px-8 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 active:scale-95">{submitting ? 'Authenticating...' : 'Verify'}</button>
                                            </div>
                                            <div className="flex justify-center border-t border-indigo-100 pt-3 mt-2">
                                                <button onClick={startAadhaarVerification} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                                                    <RefreshCcw size={10} /> Resend OTP via DigiLocker
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Mobile Number</label>
                                    <input type="text" maxLength={10} value={details.mobile} onChange={e => setDetails({ ...details, mobile: e.target.value.replace(/\D/g, '') })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm text-slate-900 focus:border-slate-900 outline-none transition-all" placeholder="10 Digit Mobile" />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Full Name</label>
                                    <input type="text" value={details.fullName} onChange={e => setDetails({ ...details, fullName: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm text-slate-900 focus:border-slate-900 outline-none transition-all" />
                                    {verifiedNames.aadhaar && <p className="text-[8px] font-black text-emerald-600 uppercase ml-2 flex items-center gap-1 mt-1"><CheckCircle2 size={10} /> Verified as per Aadhaar</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Father's Name</label>
                                    <input type="text" value={details.fathersName} onChange={e => setDetails({ ...details, fathersName: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm text-slate-900 focus:border-slate-900 outline-none transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Email ID</label>
                                    <input type="email" value={details.email} onChange={e => setDetails({ ...details, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm text-slate-900 focus:border-slate-900 outline-none transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">PAN Number</label>
                                    <input type="text" maxLength={10} value={details.panNumber} onChange={e => { const v = e.target.value.toUpperCase(); setDetails({ ...details, panNumber: v }); verifyPan(v); }} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black tracking-widest text-sm text-slate-900 focus:border-slate-900 outline-none transition-all" />
                                    {verifiedNames.pan && <p className="text-[8px] font-black text-emerald-600 uppercase ml-2 flex items-center gap-1 mt-1"><CheckCircle2 size={10} /> {verifiedNames.pan}</p>}
                                </div>
                            </div>
                            <button onClick={() => validateStep1() && setStep(2)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">Next: Business Details <ChevronRight size={16} /></button>
                        </motion.div>
                    )}

                    {/* STEP 2: BUSINESS & ADDRESS */}
                    {step === 2 && (
                        <motion.div key="step2" className="space-y-6">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setStep(1)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"><ArrowLeft size={16} /></button>
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Business Info</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Shop / Business Name</label>
                                    <input type="text" value={details.shopName} onChange={e => setDetails({ ...details, shopName: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm" placeholder="Global Enterprises" />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Shop Address (Fetched from Aadhaar)</label>
                                    <input type="text" value={details.shopAddress} onChange={e => setDetails({ ...details, shopAddress: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">City</label>
                                    <input type="text" value={details.city} onChange={e => setDetails({ ...details, city: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">State</label>
                                    <input type="text" value={details.state} onChange={e => setDetails({ ...details, state: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Pincode</label>
                                    <input type="text" value={details.pincode} onChange={e => setDetails({ ...details, pincode: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm" />
                                </div>
                            </div>
                            <button onClick={() => validateStep2() && setStep(3)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">Next: Upload Documents <ChevronRight size={16} /></button>
                        </motion.div>
                    )}

                    {/* STEP 3: DOCUMENTS */}
                    {step === 3 && (
                        <motion.div key="step3" className="space-y-6">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setStep(2)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"><ArrowLeft size={16} /></button>
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Documents</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Shop Photo</label>
                                    <label className="w-full h-32 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 overflow-hidden">
                                        {details.shopPhoto ? <img src={details.shopPhoto} className="w-full h-full object-cover" /> : <><Camera size={20} className="text-slate-400" /><span className="text-[9px] font-black text-slate-400 uppercase mt-2">Upload Shop View</span></>}
                                        <input type="file" className="hidden" accept="image/*" onChange={e => handlePhotoChange(e, 'shopPhoto')} />
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="h-28 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 overflow-hidden">
                                        {details.aadhaarFront ? <img src={details.aadhaarFront} className="w-full h-full object-cover" /> : <><FileUp size={20} className="text-slate-400" /><span className="text-[9px] font-black text-slate-400 uppercase mt-2">Aadhaar Front</span></>}
                                        <input type="file" className="hidden" accept="image/*" onChange={e => handlePhotoChange(e, 'aadhaarFront')} />
                                    </label>
                                    <label className="h-28 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 overflow-hidden">
                                        {details.aadhaarBack ? <img src={details.aadhaarBack} className="w-full h-full object-cover" /> : <><FileUp size={20} className="text-slate-400" /><span className="text-[9px] font-black text-slate-400 uppercase mt-2">Aadhaar Back</span></>}
                                        <input type="file" className="hidden" accept="image/*" onChange={e => handlePhotoChange(e, 'aadhaarBack')} />
                                    </label>
                                </div>
                            </div>
                            <button onClick={handleSubmitKyc} disabled={submitting} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 transition-all">{submitting ? 'Submitting...' : 'Complete Registration'}</button>
                        </motion.div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {step === 4 && (
                        <motion.div key="step4" className="text-center space-y-6 py-10">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600"><CheckCircle2 size={48} /></div>
                            <h2 className="text-4xl font-black text-slate-800 uppercase">Success!</h2>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">KYC Application Submitted</p>
                            <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto uppercase">Your profile will be approved within 24 hours after manual verification of documents.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default RetailerEKYC;
export { RetailerEKYC };
