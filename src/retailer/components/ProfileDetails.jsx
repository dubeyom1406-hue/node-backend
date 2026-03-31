import React, { useState, useEffect, useRef } from 'react';
import {
    CheckCircle2, AlertCircle, User,
    Building2, MapPin, Phone, Mail, Lock,
    Save, Download, Printer, Camera, Pencil,
    ChevronDown, ArrowRight, RefreshCw, X, Calendar, ShieldCheck, Edit3, Plus, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { dataService, BACKEND_URL as IMPORTED_BACKEND_URL } from '../../services/dataService';
import mainLogo from '../../assets/rupiksha_logo.png';

// Fallback if import system has issues with named exports in some environments
const BACKEND_URL = IMPORTED_BACKEND_URL || `/api`;

// Sub-components
import BusinessInfo from './profile/BusinessInfo';
import PersonalInfo from './profile/PersonalInfo';
import BankingInfo from './profile/BankingInfo';
import AdditionalDetails from './profile/AdditionalDetails';
import UPIDetails from './profile/UPIDetails';
import Documents from './profile/Documents';
import PasswordDetails from './profile/PasswordDetails';
import Settings from './profile/Settings';

const ProfileDetails = ({ activeTab = 'personal' }) => {
    const [activeSubTab, setActiveSubTab] = useState(activeTab);
    const [additionalTab, setAdditionalTab] = useState('personal');
    const [isSaving, setIsSaving] = useState(false);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [appData, setAppData] = useState(dataService.getData());
    const fileInputRef = useRef(null);
    const cardRef = useRef(null);
    const [isSharing, setIsSharing] = useState(false);

    // Email Verification State
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [timer, setTimer] = useState(0);
    const [generatedOtp, setGeneratedOtp] = useState('');

    useEffect(() => {
        const updateData = () => setAppData(dataService.getData());
        window.addEventListener('dataUpdated', updateData);
        return () => window.removeEventListener('dataUpdated', updateData);
    }, []);

    useEffect(() => {
        setActiveSubTab(activeTab);
    }, [activeTab]);

    const currentUser = appData.currentUser;
    const [profilePhoto, setProfilePhoto] = useState(currentUser?.profilePhoto || "https://ui-avatars.com/api/?name=User&background=A0A0A0&color=fff");

    useEffect(() => {
        if (currentUser?.profilePhoto) {
            setProfilePhoto(currentUser.profilePhoto);
        }
    }, [currentUser?.profilePhoto]);

    const [formData, setFormData] = useState({
        // Business
        businessName: currentUser?.businessName || '',
        businessType: currentUser?.businessType || 'Sole proprietorship',
        category: currentUser?.category || 'Retail',
        address1: currentUser?.address1 || '',
        address2: currentUser?.address2 || '',
        pincode: currentUser?.pincode || '',
        area: currentUser?.area || 'Sikandarpur (Muzaffarpur)',
        salesName: currentUser?.salesName || '',
        salesContact: currentUser?.salesContact || '',
        // Personal
        name: currentUser?.name || '',
        gender: currentUser?.gender || 'Male',
        maritalStatus: currentUser?.maritalStatus || 'Single',
        dob: currentUser?.dob || '',
        residentialAddress1: currentUser?.residentialAddress1 || '',
        residentialAddress2: currentUser?.residentialAddress2 || '',
        personalPincode: currentUser?.personalPincode || '',
        personalArea: currentUser?.personalArea || 'Muzaffarpur',
        email: currentUser?.email || '',
        mobile: currentUser?.mobile || '',
        username: currentUser?.username || '',
        partyCode: currentUser?.partyCode || '',
        emailVerified: currentUser?.emailVerified || false,
        // PAN
        panNumber: currentUser?.panNumber || '',
        isPanVerified: currentUser?.isPanVerified || false,
        panName: currentUser?.panName || '',
        // Banking
        accHolderName: '',
        bankName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        branchName: '',
        // Additional Personal
        altNumber: '',
        addEducation: '',
        handicapped: 'NO',
        nomineeDetails: '',
        nomineeName: '',
        nomineeAge: '',
        marriedStatus: '',
        spouseName: '',
        weddingDate: '',
        // Additional Business
        expectedBizRs: '',
        expectedBizTxn: '',
        weeklyOff: 'Sunday',
        monthlyIncome: '',
        bizExperience: '',
        footFall: '',
        // General
        servicesRequired: 'NO',
        selectServices: '',
        competitorId: 'NO',
        competitors: '',
        referenceFrom: '',
        // UPI
        upiId: '',
        // Password
        otp: '',
        newPassword: '',
        confirmPassword: '',
        // Settings
        emailNotifications: true,
        whatsappUpdates: true,
        twoStepAuth: false,
        theme: 'light',
        language: 'English'
    });

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                ...currentUser,
                name: currentUser.name || prev.name,
                mobile: currentUser.mobile || currentUser.username || prev.mobile,
                email: currentUser.email || prev.email,
                emailVerified: currentUser.emailVerified || false,
                panNumber: currentUser.panNumber || prev.panNumber,
                isPanVerified: currentUser.isPanVerified || false
            }));
            if (currentUser.profilePhoto) {
                setProfilePhoto(currentUser.profilePhoto);
            }
        }
    }, [currentUser]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = async () => {
        if (!formData.email) {
            alert("Please provide an email address first.");
            return;
        }

        setIsSendingOtp(true);
        try {
            const response = await fetch(`${BACKEND_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await response.json();
            if (response.ok) {
                setShowVerifyModal(true);
                setTimer(60);
                setIsSendingOtp(false);
            } else {
                throw new Error(data.message || "Failed to send OTP");
            }
        } catch (error) {
            setIsSendingOtp(false);

            // Show meaningful error to user
            alert(`Error sending OTP: ${error.message || "Connection refused"}. Please ensure the server is running on port 5001.`);
        }
    };

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length < 6) return;

        setIsVerifying(true);
        try {
            const response = await fetch(`${BACKEND_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: enteredOtp })
            });

            const data = await response.json();
            if (response.ok) {
                const updatedData = { ...formData, emailVerified: true };
                dataService.updateUserProfile(updatedData);
                setFormData(updatedData);
                setShowVerifyModal(false);
                setIsVerifying(false);
                setShowSavedToast(true);
                setTimeout(() => setShowSavedToast(false), 3000);
            } else {
                alert(data.message || "Invalid OTP. Please try again.");
                setIsVerifying(false);
            }
        } catch (error) {
            alert("Verification Failed. Check your connection.");
            setIsVerifying(false);
        }
    };

    const [isVerifyingPan, setIsVerifyingPan] = useState(false);

    const handlePanVerify = async () => {
        if (!formData.panNumber || formData.panNumber.length !== 10) {
            alert("Please enter a valid 10-digit PAN number.");
            return;
        }

        setIsVerifyingPan(true);
        try {
            const response = await fetch(`${BACKEND_URL}/verify-pan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pan: formData.panNumber, name: formData.name })
            });

            const result = await response.json();
            if (result.success) {
                const panData = result.data;
                const updatedData = {
                    ...formData,
                    isPanVerified: true,
                    panName: panData.nameAtPan || panData.name
                };
                dataService.updateUserProfile(updatedData);
                setFormData(updatedData);
                alert(`PAN Verified Successfully! Name: ${panData.nameAtPan || panData.name}`);
            } else {
                // Show the specific error message from Cashfree/Backend
                const errorMsg = result.message || "PAN verification failed. Please check the number.";
                const errorCode = result.status_code ? ` (Status: ${result.status_code})` : "";
                alert(`${errorMsg}${errorCode}`);
            }
        } catch (error) {
            alert(`Verification Failed: ${error.message}. Please check your connection and ensure the server is running on port 5001.`);
        } finally {
            setIsVerifyingPan(false);
        }
    };
    const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);

    const handleUpiVerify = async () => {
        if (!formData.upiId || !formData.upiId.includes('@')) {
            alert("Please enter a valid UPI ID (e.g. name@bank).");
            return;
        }

        setIsVerifyingUpi(true);
        try {
            const response = await fetch(`${BACKEND_URL}/verify-upi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vpa: formData.upiId })
            });

            const result = await response.json();
            if (result.success) {
                const upiData = result.data;
                alert(`UPI Verified Successfully! Name: ${upiData.name || 'Verified'}`);
                // You can add a isUpiVerified flag to formData if needed
                handleInputChange('isUpiVerified', true);
            } else {
                alert(result.message || "UPI verification failed. Please check the ID.");
            }
        } catch (error) {
            alert(`Verification Failed: ${error.message}. Please check your connection.`);
        } finally {
            setIsVerifyingUpi(false);
        }
    };

    const indianBanks = [
        "State Bank of India", "HDFC Bank", "ICICI Bank", "Punjab National Bank", "Bank of Baroda",
        "Axis Bank", "Canara Bank", "Union Bank of India", "IDBI Bank", "IndusInd Bank",
        "Kotak Mahindra Bank", "Yes Bank", "Federal Bank", "Bank of India", "Central Bank of India",
        "Indian Bank", "UCO Bank", "Punjab & Sind Bank", "South Indian Bank", "Karnataka Bank"
    ];

    const [showPasswords, setShowPasswords] = useState(false);
    const [isFetchingIFSC, setIsFetchingIFSC] = useState(false);
    const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);

    const handleAccountVerify = async (accNum) => {
        if (accNum.length >= 10 && formData.ifscCode.length === 11) {
            setIsVerifyingAccount(true);
            try {
                const response = await fetch(`${BACKEND_URL}/verify-account`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountNumber: accNum, ifsc: formData.ifscCode })
                });
                const data = await response.json();
                if (data.success) {
                    setFormData(prev => ({
                        ...prev,
                        accHolderName: data.accountHolderName
                    }));
                }
            } catch (err) {
                setIsVerifyingAccount(false);
            }
        }
    };

    const handleIFSCFetch = async (ifsc) => {
        if (ifsc.length === 11) {
            setIsFetchingIFSC(true);
            try {
                const response = await fetch(`https://ifsc.razorpay.com/${ifsc.toUpperCase()}`);
                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({
                        ...prev,
                        bankName: data.BANK,
                        branchName: data.BRANCH,
                        address1: data.ADDRESS,
                        personalArea: data.CITY,
                    }));
                } else {
                    // Fallback using first 4 chars if API fails
                    const bankCode = ifsc.substring(0, 4).toUpperCase();
                    const bankMap = {
                        'SBIN': 'STATE BANK OF INDIA',
                        'HDFC': 'HDFC BANK',
                        'ICIC': 'ICICI BANK',
                        'BARB': 'BANK OF BARODA',
                        'PUNB': 'PUNJAB NATIONAL BANK',
                        'AXIS': 'AXIS BANK',
                        'KKBK': 'KOTAK MAHINDRA BANK',
                        'UTIB': 'AXIS BANK',
                        'YESB': 'YES BANK'
                    };
                    if (bankMap[bankCode]) {
                        setFormData(prev => ({ ...prev, bankName: bankMap[bankCode] }));
                    }
                }
            } catch (error) {
                setIsFetchingIFSC(false);
            }
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        const success = dataService.updateUserProfile({
            ...formData,
            profilePhoto: profilePhoto
        });

        if (success) {
            window.dispatchEvent(new Event('dataUpdated'));
            setTimeout(() => {
                setIsSaving(false);
                setShowSavedToast(true);
                setTimeout(() => setShowSavedToast(false), 3000);
            }, 800);
        } else {
            setIsSaving(false);
            alert("Failed to update profile.");
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setProfilePhoto(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'ifscCode') handleIFSCFetch(value);
        if (field === 'accountNumber') handleAccountVerify(value);
    };

    const getSectionStatus = (id) => {
        if (!currentUser) return 'none';

        switch (id) {
            case 'business':
                return (formData.businessName && formData.address1 && formData.pincode) ? 'verified' : 'missing';
            case 'personal':
                return (formData.name && formData.email && formData.dob && formData.gender && formData.emailVerified) ? 'verified' : 'missing';
            case 'additional':
                return (formData.nomineeName && formData.marriedStatus) ? 'verified' : 'missing';
            case 'banking':
                return (currentUser.banks?.length > 0) ? 'verified' : 'missing';
            case 'documents':
                return (currentUser.documents?.length >= 3) ? 'verified' : 'missing';
            case 'upi':
                return formData.upiId ? 'verified' : 'none';
            default:
                return 'none';
        }
    };

    const menuItems = [
        { id: 'business', label: 'Business Information', status: getSectionStatus('business') },
        { id: 'personal', label: 'Personal Information', status: getSectionStatus('personal') },
        { id: 'additional', label: 'Additional Details', status: getSectionStatus('additional') },
        { id: 'banking', label: 'Banking Details', status: getSectionStatus('banking') },
        { id: 'upi', label: 'UPI', status: getSectionStatus('upi') },
        { id: 'documents', label: 'My Documents', status: getSectionStatus('documents') },
        { id: 'password', label: 'Password', status: 'none' },
        { id: 'gst_certification', label: 'GST Certification', status: 'none' },
        { id: 'tds_certificate', label: 'TDS Certificate', status: 'none' },
        { id: 'settings', label: 'Settings', status: 'none' },
    ];

    const getStatusIcon = (status) => {
        if (status === 'verified') return <CheckCircle2 size={16} className="text-emerald-500" />;
        if (status === 'pending') return <div className="w-4 h-4 rounded-full border-2 border-amber-300" />;
        if (status === 'missing') return <AlertCircle size={16} className="text-rose-500" />;
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f7fa] font-['Inter',sans-serif]">
            {/* Profile KYC banner removed as per request */}
            <div className="bg-white px-4 md:px-8 py-4 md:py-6 border-b border-slate-200">
                <h1 className="text-xl md:text-3xl font-bold text-[#4e5d78] tracking-tight">Profile Details</h1>
            </div>
            <div className="flex flex-col lg:flex-1 lg:flex-row overflow-hidden pb-16 lg:pb-0">
                <div className="w-full lg:w-[380px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 overflow-x-auto lg:overflow-y-auto flex lg:flex-col no-scrollbar shrink-0">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setActiveSubTab(item.id)}
                            className={`flex items-center justify-between px-6 lg:px-8 py-3 lg:py-4 cursor-pointer border-r lg:border-r-0 lg:border-b border-slate-100 transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${activeSubTab === item.id ? 'bg-[#f8fafc] border-b-2 lg:border-b-0' : 'hover:bg-slate-50'}`}
                        >
                            <span className={`text-[13px] lg:text-[15px] font-medium ${activeSubTab === item.id ? 'text-[#334e68] font-bold' : 'text-[#718096]'}`}>{item.label}</span>
                            <div className="hidden lg:flex items-center ms-2">{getStatusIcon(item.status)}</div>
                        </div>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto bg-[#f4f7fa] p-4 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeSubTab} initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }}>
                            {activeSubTab === 'business' && <BusinessInfo formData={formData} handleInputChange={handleInputChange} handleSave={handleSave} isSaving={isSaving} />}
                            {activeSubTab === 'personal' && (
                                <PersonalInfo
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSave={handleSave}
                                    isSaving={isSaving}
                                    isSendingOtp={isSendingOtp}
                                    profilePhoto={profilePhoto}
                                    fileInputRef={fileInputRef}
                                    handlePhotoChange={handlePhotoChange}
                                    onVerifyEmail={handleSendOtp}
                                    onVerifyPan={handlePanVerify}
                                    isVerifyingPan={isVerifyingPan}
                                />
                            )}
                            {activeSubTab === 'banking' && (
                                <BankingInfo
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSave={handleSave}
                                    isSaving={isSaving}
                                    isFetchingIFSC={isFetchingIFSC}
                                    isVerifyingAccount={isVerifyingAccount}
                                    setFormData={setFormData}
                                    currentUser={currentUser}
                                />
                            )}
                            {activeSubTab === 'additional' && (
                                <AdditionalDetails
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSave={handleSave}
                                    isSaving={isSaving}
                                    additionalTab={additionalTab}
                                    setAdditionalTab={setAdditionalTab}
                                />
                            )}
                            {activeSubTab === 'upi' && (
                                <UPIDetails
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSave={handleSave}
                                    isSaving={isSaving}
                                    onVerifyUpi={handleUpiVerify}
                                    isVerifyingUpi={isVerifyingUpi}
                                />
                            )}
                            {activeSubTab === 'documents' && <Documents currentUser={currentUser} />}
                            {activeSubTab === 'password' && (
                                <PasswordDetails
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSave={handleSave}
                                    isSaving={isSaving}
                                    isSendingOtp={isSendingOtp}
                                    onVerifyEmail={handleSendOtp}
                                    showPasswords={showPasswords}
                                    setShowPasswords={setShowPasswords}
                                />
                            )}
                            {activeSubTab === 'settings' && <Settings formData={formData} handleInputChange={handleInputChange} handleSave={handleSave} />}
                            {activeSubTab === 'visiting_card' && (
                                <div className="flex flex-col items-center justify-center space-y-12 py-10">
                                    <div className="text-center">
                                        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Professional Identity</h3>
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Official RuPiKsha Partner Card</p>
                                    </div>

                                    {/* Premium Visiting Card - Sky Blue Theme */}
                                    <div ref={cardRef} className="card-container">
                                        <motion.div
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="w-full max-w-[650px] aspect-[1.8/1] bg-white rounded-lg shadow-2xl overflow-hidden relative border border-sky-100"
                                            style={{ minWidth: '550px' }}
                                        >
                                            {/* Geometric Background Overlay (Sky Blue) */}
                                            <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                                                <svg width="100%" height="100%">
                                                    <pattern id="pattern-hex-sky" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                                        <path d="M20 0l20 10v20l-20 10-20-10v-20z" fill="none" stroke="#0ea5e9" strokeWidth="1" />
                                                    </pattern>
                                                    <rect width="100%" height="100%" fill="url(#pattern-hex-sky)" />
                                                </svg>
                                            </div>
                                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-sky-100/40 via-white to-white pointer-events-none"></div>

                                            <div className="p-8 h-full flex flex-col relative z-10">
                                                {/* Top Row: Name & QR */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center space-x-5">
                                                        {/* Smaller Profile Photo */}
                                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sky-200 bg-white flex items-center justify-center shrink-0 shadow-sm">
                                                            {profilePhoto ? (
                                                                <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <User className="text-sky-300" size={24} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-2xl font-bold text-sky-900 leading-none tracking-tight">
                                                                {formData.name || currentUser?.name || 'Partner Name'}
                                                            </h4>
                                                            <p className="text-lg font-medium text-sky-600 mt-1 uppercase tracking-tight">
                                                                {formData.businessName || currentUser?.businessName || 'Your Business Name'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-1.5 rounded-lg shadow-md border border-sky-50">
                                                        <img 
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=tel:${formData.mobile || currentUser?.mobile}`} 
                                                            alt="Call QR" 
                                                            className="w-18 h-18"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Separator Line (Sky Blue) */}
                                                <div className="w-full h-1.5 bg-sky-500/30 rounded-full mb-6 relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-indigo-400 opacity-50"></div>
                                                </div>

                                                {/* Middle: Address Section */}
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <div className="flex items-start space-x-4 mb-4">
                                                        <div className="bg-sky-500 p-2 rounded-full shadow-lg shadow-sky-100">
                                                            <Building2 size={18} className="text-white" />
                                                        </div>
                                                        <p className="text-sm font-semibold text-sky-800 leading-snug max-w-[80%] uppercase">
                                                            {formData.address1 ? 
                                                                `${formData.address1}${formData.address2 ? `, ${formData.address2}` : ''} ${formData.area || ''} ${formData.pincode || ''}` : 
                                                                (currentUser?.address || currentUser?.address1 ? 
                                                                    `${currentUser.address || currentUser.address1} ${currentUser.pincode || ''}` : 
                                                                    'Shop Address Not Registered')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Bottom Row: Contact info & Logo */}
                                                <div className="flex items-center justify-between border-t border-sky-100 pt-6">
                                                    <div className="flex items-center space-x-8">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="bg-sky-500 p-2 rounded-full">
                                                                <Phone size={14} className="text-white" />
                                                            </div>
                                                            <span className="text-sm font-bold text-sky-900 tracking-wider">
                                                                +91 {formData.mobile || currentUser?.mobile || 'XXXXXXXXXX'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="bg-sky-500 p-2 rounded-full">
                                                                <Mail size={14} className="text-white" />
                                                            </div>
                                                            <span className="text-sm font-bold text-sky-900">
                                                                {formData.email || currentUser?.email || 'partner@rupiksha.com'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[9px] font-bold text-sky-400 mb-0.5">Powered By</span>
                                                                <span className="text-lg font-black text-sky-600 tracking-tighter uppercase italic leading-none">Rupiksha</span>
                                                            </div>
                                                            <span className="text-[7px] font-black text-sky-900 uppercase tracking-[0.4em] mt-1">Making Life Simple</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 w-full justify-center px-4">
                                        <button 
                                            onClick={async () => {
                                                const element = cardRef.current;
                                                const canvas = await html2canvas(element, { scale: 3, backgroundColor: null });
                                                const imgData = canvas.toDataURL('image/png');
                                                const pdf = new jsPDF('l', 'mm', 'a4');
                                                const imgProps = pdf.getImageProperties(imgData);
                                                const pdfWidth = pdf.internal.pageSize.getWidth();
                                                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                                                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                                                pdf.save(`${formData.name || 'User'}_Visiting_Card.pdf`);
                                            }}
                                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl flex items-center justify-center space-x-3 hover:bg-black transition-all hover:-translate-y-1 active:scale-95"
                                        >
                                            <Download size={18} />
                                            <span>Download PDF</span>
                                        </button>
                                        
                                        <button 
                                            onClick={async () => {
                                                setIsSharing(true);
                                                try {
                                                    const element = cardRef.current;
                                                    const canvas = await html2canvas(element, { scale: 2 });
                                                    const imgData = canvas.toDataURL('image/png');
                                                    
                                                    // Trigger share or fallback to mailto
                                                    const res = await fetch(`${BACKEND_URL}/user/share-visiting-card`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            email: formData.email,
                                                            name: formData.name,
                                                            image: imgData
                                                        })
                                                    });
                                                    
                                                    if (res.ok) alert("Card shared to your registered email!");
                                                    else throw new Error("Backend failed");
                                                } catch (err) {
                                                    // Fallback
                                                    window.location.href = `mailto:${formData.email}?subject=My Rupiksha Visiting Card&body=Hello, please find my digital visiting card attached. Name: ${formData.name}, Mobile: ${formData.mobile}`;
                                                } finally {
                                                    setIsSharing(false);
                                                }
                                            }}
                                            disabled={isSharing}
                                            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-600/20 flex items-center justify-center space-x-3 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-95"
                                        >
                                            <Mail size={18} />
                                            <span>{isSharing ? 'Sharing...' : 'Share on Email'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {activeSubTab === 'gst_certification' && (
                                <div className="flex flex-col items-center justify-center space-y-8 py-6">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">GST Certification</h3>
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Government of India - GST Registration</p>
                                    </div>
                                    {currentUser?.gst_certificate ? (
                                        <div className="w-full max-w-[800px] bg-white border-2 border-slate-100 rounded-[2rem] p-4 shadow-xl">
                                            <img src={currentUser.gst_certificate} alt="GST Certificate" className="w-full h-auto rounded-xl" />
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-[600px] bg-white border-4 border-slate-900 p-10 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/10 rotate-45 -mr-10 -mt-10"></div>
                                            <div className="text-center border-b-2 border-slate-200 pb-6 mb-8">
                                                <p className="text-lg font-black uppercase tracking-widest text-slate-800">Form GST REG-06</p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Registration Certificate</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-6 text-sm">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Registration Number</p>
                                                    <p className="font-black text-slate-800 mt-1">{currentUser?.panNumber ? `10${currentUser.panNumber}1Z5` : 'PENDING'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Legal Name</p>
                                                    <p className="font-black text-slate-800 mt-1">{formData.name || currentUser?.name || 'USER NAME'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Trade Name</p>
                                                    <p className="font-black text-slate-800 mt-1">{formData.businessName || currentUser?.businessName || 'BUSINESS NAME'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Constitution of Business</p>
                                                    <p className="font-black text-slate-800 mt-1">{formData.businessType || 'Proprietorship'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Address</p>
                                                    <p className="font-black text-slate-800 mt-1 uppercase text-xs">{formData.address1}, {formData.address2}, {formData.pincode}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Mobile No.</p>
                                                    <p className="font-black text-slate-800 mt-1">{formData.mobile || currentUser?.mobile || 'No Mobile'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-between items-end">
                                                <div className="text-[8px] font-bold text-slate-400 uppercase">Generated by RuPiKsha Auth System</div>
                                                <div className="text-right">
                                                    <div className="w-24 h-1 bg-slate-800 mb-2"></div>
                                                    <p className="text-[10px] font-black uppercase">Authorized Signatory</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center space-x-2">
                                        <Download size={16} />
                                        <span>Download PDF</span>
                                    </button>
                                </div>
                            )}
                            {activeSubTab === 'tds_certificate' && (
                                <div className="flex flex-col items-center justify-center space-y-8 py-6">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">TDS Certificate</h3>
                                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Income Tax Department - Form 16A</p>
                                    </div>
                                    {currentUser?.tds_certificate ? (
                                        <div className="w-full max-w-[800px] bg-white border-2 border-slate-100 rounded-[2rem] p-4 shadow-xl">
                                            <img src={currentUser.tds_certificate} alt="TDS Certificate" className="w-full h-auto rounded-xl" />
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-[600px] bg-white border-4 border-blue-900 p-10 shadow-2xl relative">
                                            <div className="text-center border-b-2 border-blue-100 pb-6 mb-8 text-blue-900">
                                                <p className="text-lg font-black uppercase tracking-widest">Certificate of Tax Deducted at Source</p>
                                                <p className="text-[10px] font-bold uppercase mt-1">Under Section 203 of the Income Tax Act, 1961</p>
                                            </div>
                                            <div className="space-y-6 text-sm">
                                                <div className="flex justify-between border-b border-slate-50 pb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">Deductor Name</p>
                                                        <p className="font-black text-blue-900 mt-1 uppercase">RuPiKsha Solutions Pvt Ltd</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">TAN of Deductor</p>
                                                        <p className="font-black text-blue-900 mt-1">MUMR12345B</p>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-50 pb-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">Deductee Name</p>
                                                        <p className="font-black text-slate-800 mt-1">{formData.name || currentUser?.name || 'USER NAME'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">PAN of Deductee</p>
                                                        <p className="font-black text-slate-800 mt-1">{currentUser?.panNumber || 'PENDING'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Registered Mobile</p>
                                                    <p className="font-black text-slate-800 mt-1">{formData.mobile || currentUser?.mobile || 'No Mobile'}</p>
                                                </div>
                                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                                    <p className="text-[10px] font-black text-blue-400 uppercase text-center mb-3">Deduction Details</p>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <p className="text-xs font-bold text-slate-500 uppercase">Current Fin. Year</p>
                                                        <p className="text-xs font-black text-slate-800 text-right">2023-24</p>
                                                        <p className="text-xs font-bold text-slate-500 uppercase">Total TDS Deducted</p>
                                                        <p className="text-xs font-black text-slate-800 text-right">₹ {currentUser?.total_tds_paid || '0.00'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-12 flex justify-between items-center">
                                                <div className="w-20 h-20 border-2 border-blue-100 rounded-lg flex items-center justify-center p-2">
                                                    <div className="w-full h-full bg-slate-50 rounded flex items-center justify-center">
                                                        <p className="text-[8px] text-slate-300 font-black rotate-45 uppercase">Verified QR</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Digitally Signed By</p>
                                                    <p className="text-sm font-black text-blue-900 uppercase">Compliance Officer</p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">RuPiKsha Corporate Team</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <button className="bg-blue-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center space-x-2">
                                        <Download size={16} />
                                        <span>Download Certificate</span>
                                    </button>
                                </div>
                            )}
                            {!['business', 'personal', 'additional', 'banking', 'upi', 'documents', 'password', 'settings', 'visiting_card'].includes(activeSubTab) && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-20 text-center">
                                    <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">{activeSubTab} SECTION</h3>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
            {/* Email Verification Modal */}
            <AnimatePresence>
                {showVerifyModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowVerifyModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10 p-8 text-center"
                        >
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                    <Mail size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Verify Your Email</h3>
                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">We've sent a 6-digit code to</p>
                                <p className="text-sm font-black text-blue-600 mt-1">{formData.email}</p>
                            </div>

                            <div className="flex justify-between gap-2 mb-8">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val) {
                                                const newOtp = [...otp];
                                                newOtp[idx] = val;
                                                setOtp(newOtp);
                                                // Focus next
                                                const next = e.target.nextElementSibling;
                                                if (next) next.focus();
                                            } else {
                                                const newOtp = [...otp];
                                                newOtp[idx] = '';
                                                setOtp(newOtp);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !otp[idx]) {
                                                const prev = e.target.previousElementSibling;
                                                if (prev) prev.focus();
                                            }
                                        }}
                                        className="w-12 h-14 border-2 border-slate-100 rounded-xl text-center text-xl font-black text-slate-700 focus:border-blue-600 focus:bg-blue-50 outline-none transition-all shadow-sm"
                                    />
                                ))}
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={isVerifying || otp.join('').length < 6}
                                    className="w-full bg-[#1e3a8a] text-white py-4 rounded-xl font-black uppercase text-sm shadow-xl hover:bg-blue-900 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {isVerifying ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <RefreshCw size={18} className="animate-spin" />
                                            <span>Verifying...</span>
                                        </div>
                                    ) : 'Verify OTP'}
                                </button>

                                <div className="text-center">
                                    {timer > 0 ? (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Resend Code in <span className="text-blue-600">00:{timer < 10 ? `0${timer}` : timer}</span>
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleSendOtp}
                                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                        >
                                            Resend Verification Code
                                        </button>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowVerifyModal(false)}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSavedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-10 left-1/2 z-[100] bg-slate-900 text-white px-8 py-3 rounded-full border border-emerald-500 shadow-2xl flex items-center space-x-3"
                    >
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Profile Updated Successfully</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDetails;
