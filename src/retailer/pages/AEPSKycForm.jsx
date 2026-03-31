import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, User, Building2, Landmark, 
    MapPin, CheckCircle2, ArrowLeft, Briefcase, 
    ImageIcon, Upload, FileCheck, Video, CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../../services/dataService';

// EXACT Mappings from Fingpay Master APIs
const INDIAN_STATES = [
    { name: "Andhra Pradesh", id: 2 },
    { name: "Arunachal Pradesh", id: 29 },
    { name: "Assam", id: 3 },
    { name: "Bihar", id: 4 },
    { name: "Chhattisgarh", id: 5 },
    { name: "Goa", id: 6 },
    { name: "Gujarath", id: 7 },
    { name: "Haryana", id: 8 },
    { name: "Himachal Pradesh", id: 9 },
    { name: "Jammu and Kashmir", id: 10 },
    { name: "Jarkhand", id: 11 },
    { name: "Karnataka", id: 12 },
    { name: "Kerala", id: 13 },
    { name: "Madhya Pradesh", id: 14 },
    { name: "Maharashtra", id: 15 },
    { name: "Manipur", id: 16 },
    { name: "Meghalaya", id: 17 },
    { name: "Mizoram", id: 18 },
    { name: "Nagaland", id: 19 },
    { name: "Orissa", id: 20 },
    { name: "Punjab", id: 21 },
    { name: "Rajasthan", id: 22 },
    { name: "Sikkim", id: 23 },
    { name: "Tamil Nadu", id: 24 },
    { name: "Telangana", id: 1 },
    { name: "Tripura", id: 25 },
    { name: "Uttaranchal", id: 26 },
    { name: "Uttar Pradhesh", id: 27 },
    { name: "West Bengal", id: 28 },
    { name: "Delhi", id: 30 },
    { name: "Puducherry", id: 32 },
    { name: "Chandigarh", id: 33 },
    { name: "Dadra and Nagar Haveli", id: 34 },
    { name: "Daman and Diu", id: 35 },
    { name: "Lakshadweep", id: 36 },
    { name: "Andaman and Nicobar Islands", id: 38 }
].sort((a,b) => a.name.localeCompare(b.name));

const COMPANY_TYPES = [
    { mccCode: 4215, name: "Courier services — air and ground" },
    { mccCode: 4722, name: "Travel agencies and tour operators" },
    { mccCode: 4812, name: "Telecommunication equipment and sales" },
    { mccCode: 4814, name: "Telecommunication services" },
    { mccCode: 4816, name: "Computer network/information services" },
    { mccCode: 4900, name: "Utilities — electric, gas, water" },
    { mccCode: 5311, name: "Department Stores" },
    { mccCode: 5331, name: "Variety Stores" },
    { mccCode: 5411, name: "Groceries and supermarkets" },
    { mccCode: 5451, name: "Dairies" },
    { mccCode: 5462, name: "Bakeries" },
    { mccCode: 5732, name: "Electronics Shops" },
    { mccCode: 5814, name: "Fast food restaurants" },
    { mccCode: 5942, name: "Bookshops" },
    { mccCode: 5943, name: "Stationery and school supply shops" }
];

const AEPSKycForm = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [location, setLocation] = useState(null);
    const [sameAsMerchant, setSameAsMerchant] = useState(false);
    
    const [formData, setFormData] = useState({
        merchantLoginPin: '',
        firstName: user?.fullName?.split(' ')[0] || '',
        middleName: '',
        lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
        merchantPhoneNumber: user?.mobile || '',
        emailId: user?.email || '',
        
        merchantAddress1: user?.address || '',
        merchantAddress2: '',
        merchantState: 27, // Default UP
        merchantStateName: 'Uttar Pradhesh',
        merchantCityName: user?.city || '',
        merchantDistrictName: '',
        merchantPinCode: user?.pincode || '',

        companyLegalName: user?.businessName || '',
        companyType: 4816,
        
        userPan: user?.panNumber || '',
        aadhaarNumber: user?.aadhaarNumber || '',
        gstinNumber: '',
        companyOrShopPan: '',

        companyBankAccountNumber: '',
        bankIfscCode: '',
        companyBankName: '',
        bankAccountName: user?.fullName || '',

        shopAddress: '',
        shopCity: '',
        shopDistrict: '',
        shopState: 27,
        shopStateName: 'Uttar Pradhesh',
        shopPincode: '',
        
        termsCondition: false
    });

    const [files, setFiles] = useState({
        panImage: null,
        shopImage: null,
        chequeImage: null,
        businessProof: null,
        physicalVerification: null,
        videoKyc: null
    });

    useEffect(() => {
        dataService.verifyLocation()
            .then(loc => setLocation(loc))
            .catch(err => console.error("Location Tracking Error:", err));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'merchantState' || name === 'shopState') {
            const state = INDIAN_STATES.find(s => s.id === parseInt(value));
            setFormData(prev => ({ 
                ...prev, 
                [name]: parseInt(value),
                [name + 'Name']: state ? state.name : ''
            }));
        } else {
            setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        }
    };

    const handleFileChange = (e) => {
        const { name, files: uploadedFiles } = e.target;
        if (uploadedFiles && uploadedFiles[0]) {
            const file = uploadedFiles[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFiles(prev => ({ ...prev, [name]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCopyAddress = (e) => {
        const isChecked = e.target.checked;
        setSameAsMerchant(isChecked);
        if (isChecked) {
            setFormData(prev => ({
                ...prev,
                shopAddress: prev.merchantAddress1 + (prev.merchantAddress2 ? ', ' + prev.merchantAddress2 : ''),
                shopCity: prev.merchantCityName,
                shopDistrict: prev.merchantDistrictName,
                shopState: prev.merchantState,
                shopStateName: prev.merchantStateName,
                shopPincode: prev.merchantPinCode
            }));
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!formData.termsCondition) {
            alert("Terms conditions check karna mandatory hai.");
            return;
        }

        const missingFile = Object.keys(files).find(k => !files[k]);
        if (missingFile) {
            alert(`Kripaya ${missingFile} upload karein.`);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                ...files,
                latitude: location?.lat,
                longitude: location?.long,
                kycType: 'AEPS'
            };

            const data = await dataService.submitAepsKyc(user.id, payload);
            if (data.status === true) {
                setStep(4);
            } else {
                alert(data.message || (data.data?.remarks) || "Verification Error");
            }
        } catch (err) {
            alert("Network error: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 4) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 text-center max-w-lg w-full">
                    <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-6" />
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">KYC Application Syncing</h1>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-4">Document Vault Processed to Fingpay Server</p>
                    <button onClick={() => navigate('/aeps')} className="mt-12 px-10 py-4 bg-emerald-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-emerald-400 transition-all">Close & Return</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col p-4 pb-24 font-sans selection:bg-indigo-100 italic-none">
            <div className="max-w-6xl mx-auto w-full">
                
                <div className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button onClick={() => navigate('/dashboard')} className="w-12 h-12 bg-white shadow-xl hover:shadow-indigo-500/10 border-0 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all"><ArrowLeft size={24} /></button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mix-blend-multiply">AEPS Onboarding v2</h1>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Global Gateway & Banking Verification Suite</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border-0 overflow-hidden relative">
                    <div className="p-8 md:p-16 space-y-20">
                        
                        {/* Section 1: Merchant Bio */}
                        <div className="space-y-10">
                            <div className="flex items-center gap-4 border-l-4 border-indigo-600 pl-4">
                                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">01 | Identity Parameters</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <Input label="Given First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                                <Input label="Middle Name (Optional)" name="middleName" value={formData.middleName} onChange={handleChange} />
                                <Input label="Family Surname" name="lastName" value={formData.lastName} onChange={handleChange} required />
                                <Input label="Registered Mobile" name="merchantPhoneNumber" value={formData.merchantPhoneNumber} onChange={handleChange} maxLength={10} required />
                                <Input label="Email Identity" type="email" name="emailId" value={formData.emailId} onChange={handleChange} required />
                                <Input label="Secret Login PIN (6-Digit)" name="merchantLoginPin" value={formData.merchantLoginPin} onChange={handleChange} maxLength={6} required />
                            </div>
                        </div>

                        {/* Section 2: Geo-Location Addresses */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            <div className="space-y-8">
                                <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 bg-slate-50 p-3 rounded-xl w-fit">
                                    <MapPin size={14} className="text-indigo-600"/> Permanent Domicile Address
                                </h3>
                                <div className="space-y-5">
                                    <Input label="Premise / Street Detail" name="merchantAddress1" value={formData.merchantAddress1} onChange={handleChange} required />
                                    <Input label="Area / Landmark" name="merchantAddress2" value={formData.merchantAddress2} onChange={handleChange} />
                                    <div className="grid grid-cols-2 gap-5">
                                        <Select label="State Master" name="merchantState" value={formData.merchantState} onChange={handleChange} options={INDIAN_STATES} required />
                                        <Input label="District Map" name="merchantDistrictName" value={formData.merchantDistrictName} onChange={handleChange} required />
                                        <Input label="City Jurisdiction" name="merchantCityName" value={formData.merchantCityName} onChange={handleChange} required />
                                        <Input label="Postal Pincode" name="merchantPinCode" value={formData.merchantPinCode} onChange={handleChange} maxLength={6} required />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                                    <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                        <Building2 size={14} className="text-indigo-600"/> Operational Shop Location
                                    </h3>
                                    <label className="flex items-center gap-2 cursor-pointer text-[8px] font-black text-indigo-500">
                                        <input type="checkbox" checked={sameAsMerchant} onChange={handleCopyAddress} className="w-3 h-3 rounded text-indigo-600 border-indigo-200" /> CLONE PERMANENT
                                    </label>
                                </div>
                                <div className="space-y-5">
                                    <Input label="Shop No / Road Detail" name="shopAddress" value={formData.shopAddress} onChange={handleChange} required />
                                    <div className="grid grid-cols-2 gap-5">
                                        <Select label="Shop State Master" name="shopState" value={formData.shopState} onChange={handleChange} options={INDIAN_STATES} required />
                                        <Input label="Shop District" name="shopDistrict" value={formData.shopDistrict} onChange={handleChange} required />
                                        <Input label="Shop City / Village" name="shopCity" value={formData.shopCity} onChange={handleChange} required />
                                        <Input label="Shop Pincode" name="shopPincode" value={formData.shopPincode} onChange={handleChange} maxLength={6} required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Professional Entities */}
                        <div className="space-y-10">
                            <div className="flex items-center gap-4 border-l-4 border-indigo-600 pl-4">
                                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">02 | Business & Entity Mapping</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <Input label="Company Legal Entity" name="companyLegalName" value={formData.companyLegalName} onChange={handleChange} required />
                                <Select label="Company Type (MCC)" name="companyType" value={formData.companyType} onChange={handleChange} options={COMPANY_TYPES.map(c => ({id: c.mccCode, name: c.name}))} required />
                                <Input label="GSTIN Identity (If Any)" name="gstinNumber" value={formData.gstinNumber} onChange={handleChange} />
                                <Input label="Personal PAN Profile" name="userPan" value={formData.userPan} onChange={handleChange} maxLength={10} required />
                                <Input label="Business PAN Profile" name="companyOrShopPan" value={formData.companyOrShopPan} onChange={handleChange} maxLength={10} required />
                                <Input label="National Aadhaar ID" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} maxLength={12} required />
                            </div>
                        </div>

                        {/* Section 4: Settlement Vault */}
                        <div className="space-y-10">
                            <div className="flex items-center gap-4 border-l-4 border-indigo-600 pl-4">
                                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">03 | Settlement Banking Node</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <Input label="Financial Institution" name="companyBankName" value={formData.companyBankName} onChange={handleChange} required />
                                <Input label="Primary Account No" name="companyBankAccountNumber" value={formData.companyBankAccountNumber} onChange={handleChange} required />
                                <Input label="Branch IFSC Sync" name="bankIfscCode" value={formData.bankIfscCode} onChange={handleChange} required />
                                <Input label="Node Holder Name" name="bankAccountName" value={formData.bankAccountName} onChange={handleChange} required />
                            </div>
                        </div>

                        {/* Section 5: DOCUMENT VAULT (IMPROVED CLICK HANDLER) */}
                        <div className="space-y-12 bg-slate-900 p-12 md:p-20 rounded-[4rem] shadow-3xl text-white relative">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                    <CreditCard className="text-indigo-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight text-white">Advanced Object Sync</h2>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">High-Entropy Image Mapping for Verification Core</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                                <FileUpload label="PAN Image profile" name="panImage" icon={<ShieldCheck size={24}/>} onChange={handleFileChange} value={files.panImage} />
                                <FileUpload label="Shop Facade Profile" name="shopImage" icon={<Building2 size={24}/>} onChange={handleFileChange} value={files.shopImage} />
                                <FileUpload label="Account Cheque Leaf" name="chequeImage" icon={<Landmark size={24}/>} onChange={handleFileChange} value={files.chequeImage} />
                                <FileUpload label="Trade Proof Object" name="businessProof" icon={<Briefcase size={24}/>} onChange={handleFileChange} value={files.businessProof} />
                                <FileUpload label="Physical Geo-Check" name="physicalVerification" icon={<MapPin size={24}/>} onChange={handleFileChange} value={files.physicalVerification} />
                                <FileUpload label="Global Video KYC" name="videoKyc" icon={<Video size={24}/>} onChange={handleFileChange} value={files.videoKyc} />
                            </div>
                        </div>

                        {/* Final Submission */}
                        <div className="pt-10 flex flex-col items-center gap-10">
                            <label className="flex items-center gap-5 p-10 bg-slate-50 rounded-[3rem] border border-slate-100 cursor-pointer group max-w-3xl w-full">
                                <input type="checkbox" name="termsCondition" checked={formData.termsCondition} onChange={handleChange} className="w-8 h-8 rounded-xl text-indigo-600 focus:ring-transparent transition-all border-slate-300" required />
                                <span className="text-[11px] font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-tight leading-relaxed transition-colors">
                                    I hereby authenticate that the provided document objects are authentic 
                                    and original. I agree to the AEPS Compliance framework as defined by Fingpay-RuPiKsha.
                                </span>
                            </label>

                            <button type="submit" disabled={submitting || !location} className="w-full max-w-lg py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.5em] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] hover:bg-indigo-600 hover:scale-[1.03] transition-all disabled:opacity-50">
                                {submitting ? 'Transmitting Data Array...' : !location ? 'AQUIRING G-SYNC...' : 'INITIATE ONBOARDING'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Components
const Input = ({ label, ...props }) => (
    <div className="space-y-3">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-3">{label}</label>
        <input {...props} className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] font-bold text-[13px] text-slate-800 focus:bg-white focus:border-indigo-500 hover:border-slate-300 outline-none transition-all placeholder:text-slate-300 shadow-sm" />
    </div>
);

const Select = ({ label, options, ...props }) => (
    <div className="space-y-3">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-3">{label}</label>
        <select {...props} className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] font-bold text-[13px] text-slate-800 focus:bg-white focus:border-indigo-500 hover:border-slate-300 outline-none transition-all appearance-none cursor-pointer shadow-sm">
            {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
        </select>
    </div>
);

const FileUpload = ({ label, name, icon, onChange, value }) => (
    <div className="relative flex flex-col items-center group">
        <div className={`w-36 h-36 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden ${value ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/30 hover:bg-white/[0.02]'}`}>
            
            {/* Input is now z-50 to ensure it's ALWAYS clickable, covering everything */}
            <input type="file" name={name} accept="image/*,video/*" onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full" title={label}/>
            
            {value ? (
                <div className="text-center relative z-10">
                    <CheckCircle2 className="text-emerald-400 mx-auto" size={32} />
                    <p className="text-[9px] font-black text-emerald-400 uppercase mt-3 tracking-widest">RECORDED</p>
                </div>
            ) : (
                <div className="text-center relative z-10">
                    <div className="text-slate-500 group-hover:text-white transition-colors mb-2">{icon}</div>
                    <p className="text-[8px] font-black text-slate-500 group-hover:text-slate-300 uppercase tracking-widest">{label}</p>
                </div>
            )}
            {value && name !== 'videoKyc' && (
                <img src={value} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
            )}
        </div>
    </div>
);

export default AEPSKycForm;
