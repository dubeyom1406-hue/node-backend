import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
    LayoutGrid, Plane, Smartphone, HandCoins, FileText,
    Fingerprint, Calculator, Zap, Lightbulb, Landmark, Headset,
    FileChartColumn, CreditCard, ScanFace, ChevronRight, ChevronDown,
    Building2, Handshake, Home, Coins, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mainLogo from '../../assets/rupiksha_logo.png';
import { dataService } from '../../services/dataService';
const Sidebar = ({ activeTab, setActiveTab, showMobileSidebar }) => {
    const { t } = useLanguage();
    const [expandedItems, setExpandedItems] = useState({ banking: false, travel: false, reports: false });
    const [isHovered, setIsHovered] = useState(false);
    const [appData, setAppData] = useState(dataService.getData());

    useEffect(() => {
        const updateData = () => setAppData(dataService.getData());
        window.addEventListener('dataUpdated', updateData);
        return () => window.removeEventListener('dataUpdated', updateData);
    }, []);

    const toggleExpand = (id) => {
        if (!isHovered) return; // Don't expand submenus if sidebar is collapsed
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Professional, clean colors.

    const serviceItems = [
        {
            id: 'banking',
            label: 'Banking Hub',
            icon: Landmark,
            hasSubmenu: true,
            subItems: [
                { id: 'aeps_services', label: 'AEPS Services' },
                { id: 'cms', label: 'CMS – Loan EMI' },
                { id: 'matm', label: 'MATM' },
                { id: 'add_money', label: 'Add Money' },
                { id: 'quick_mr', label: 'Quick Mr' },
                { id: 'ybl_mr', label: 'YBL MR' },
                { id: 'pw_money_ekyc', label: 'PW Money QMR EKYC' },
            ]
        },

        { id: 'travel', label: 'Travel Hub', icon: Plane },
        { id: 'utility', label: 'Utility Hub', icon: Zap },
        { id: 'bharat_connect', label: 'Bharat Connect', icon: Building2 },
        { id: 'payout', label: 'Payout Hub', icon: HandCoins },
        {
            id: 'loans',
            label: 'Loan Hub',
            icon: Handshake,
            hasSubmenu: true,
            subItems: [
                { id: 'personal_loan', label: 'Personal Loan' },
                { id: 'home_loan', label: 'Home Loan' },
                { id: 'gold_loan', label: 'Gold Loan' },
                { id: 'instant_loan', label: 'Instant Loan' },
                { id: 'loan_status', label: 'Track Application' },
            ]
        },
    ];

    const businessItems = [
        {
            id: 'reports',
            label: 'Reports & Ledger',
            icon: FileChartColumn,
            hasSubmenu: true,
            subItems: [
                { id: 'sale_report', label: 'Sale Report' },
                { id: 'consolidated_ledger', label: 'Consolidated-ledger' },
                { id: 'daily_ledger', label: 'Daily ledger' },
                { id: 'gstin_invoice', label: 'GSTIN Invoice' },
                { id: 'cons_gstin_invoice', label: 'Consolidated GSTIN Invoice' },
                { id: 'cons_comm_receipt', label: 'Consolidated Commission Receipt' },
                { id: 'tds_report', label: 'TDS' },
                { id: 'payment_req_history', label: 'Payment Request History' },
                { id: 'emi_reports', label: 'EMI Reports' },
                { id: 'qr_txn_report', label: 'QR Transactions Report' },
            ]
        },
        { id: 'gst_einvoice_report', label: 'GST E-Invoice Report', icon: FileChartColumn, onClick: () => setActiveTab('gst_einvoice_report') },
        { id: 'plans', label: 'Commission Plans', icon: CreditCard, onClick: () => setActiveTab('plans') },
        { id: 'gst_certification', label: 'GST Certification', icon: Shield, onClick: () => setActiveTab('gst_certification') },
        { id: 'tds_certificate', label: 'TDS Certificate', icon: FileText, onClick: () => setActiveTab('tds_certificate') },
    ];

    const ekycItems = [
        { id: 'retailer_ekyc', label: 'Retailer eKYC', icon: ScanFace, type: 'ekyc' },
        { id: 'icici_ekyc', label: 'ICICI eKYC', icon: Fingerprint, type: 'ekyc' },
        { id: 'support', label: 'Help & Support', icon: Headset, type: 'support' },
    ];

    const MenuItem = ({ item, isActive, onClick }) => {
        const isExpanded = expandedItems[item.id];

        return (
            <div className="px-3">
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        if (item.hasSubmenu) {
                            toggleExpand(item.id);
                        } else {
                            onClick();
                        }
                    }}
                    className={`flex items-center ${isHovered ? 'justify-between' : 'justify-center'} px-3 py-2.5 my-1.5 cursor-pointer group transition-all duration-300 rounded-xl relative`}
                    style={{ color: isActive ? 'var(--on-primary-color)' : 'var(--on-primary-color-60)' }}
                >
                    {/* Floating Background */}
                    {isActive && (
                        <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg rounded-xl z-0"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                    )}

                    <div className="flex items-center space-x-3 relative z-10 w-full">
                        <div className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`} style={{ color: isActive ? 'var(--on-primary-color)' : 'var(--on-primary-color-60)' }}>
                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        {isHovered && (
                            <motion.span
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-bold text-[13.5px] tracking-tight"
                                style={{ color: isActive ? 'var(--on-primary-color)' : 'var(--on-primary-color-60)' }}
                            >
                                {item.label}
                            </motion.span>
                        )}
                    </div>
                    {isHovered && (
                        <div className="relative z-10">
                            {item.hasSubmenu ? (
                                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
                                    <ChevronDown size={14} style={{ color: isActive ? 'var(--on-primary-color)' : 'var(--on-primary-color-40)' }} />
                                </div>
                            ) : isActive && !item.hasSubmenu && (
                                <motion.div 
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Submenu */}
                <AnimatePresence>
                    {item.hasSubmenu && isExpanded && isHovered && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-9 border-l border-slate-100 overflow-hidden"
                        >
                            {item.subItems.map((sub, idx) => {
                                const isSubActive = activeTab === sub.id;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            if (item.id === 'travel') {
                                                setActiveTab('travel');
                                                try { window.dispatchEvent(new CustomEvent('travelSelect', { detail: sub.id })); } catch (e) { }
                                            }
                                            else if (item.id === 'utility') {
                                                setActiveTab('utility');
                                                try { window.dispatchEvent(new CustomEvent('utilitySelect', { detail: sub.id })); } catch (e) { }
                                            }
                                            else {
                                                setActiveTab(sub.id);
                                            }
                                        }}
                                        className="block px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-lg"
                                        style={{ 
                                            color: isSubActive ? 'var(--on-primary-color)' : 'var(--on-primary-color-40)',
                                            backgroundColor: isSubActive ? 'var(--on-primary-color-20)' : undefined
                                        }}
                                    >
                                        {isSubActive && (
                                            <motion.div 
                                                layoutId="active-sub-pill"
                                                className="absolute inset-0 bg-blue-50/50 rounded-lg -z-10"
                                            />
                                        )}
                                        {sub.label}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const currentUser = appData.currentUser;
    const getInitials = () => {
        if (currentUser?.businessName) {
            return currentUser.businessName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        }
        return currentUser?.mobile?.slice(-2) || 'RX';
    };

    return (
        <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={false}
            animate={{
                width: isHovered ? 260 : 88,
                x: typeof window !== 'undefined' && window.innerWidth < 1024 ? (showMobileSidebar ? 0 : -260) : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed lg:relative flex-shrink-0 border-r border-slate-100 flex flex-col h-full font-['Inter',sans-serif] z-50 lg:z-20 transition-colors duration-500
                ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            style={{ backgroundColor: 'var(--primary-color)' }}
        >
            {/* Logo Area */}
            <div className={`p-6 flex items-center ${isHovered ? 'justify-start' : 'justify-center'} h-20`}>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center overflow-hidden brightness-0 invert opacity-80 hover:opacity-100 transition-all">
                        <img src={mainLogo} alt="RUPIKSHA" className="h-full w-auto object-contain" />
                    </div>
                    {/* Brand Name Removed as per request */}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 scrollbar-none">
                {/* Main section */}
                {/* Main Navigation List */}
                <div className="flex flex-col px-1">
                    <MenuItem
                        item={{ id: 'dashboard', label: 'Dashboard', icon: LayoutGrid }}
                        isActive={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <MenuItem
                        item={{ id: 'all_services', label: 'All Services', icon: Smartphone }}
                        isActive={activeTab === 'all_services'}
                        onClick={() => setActiveTab('all_services')}
                    />
                    
                    {serviceItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isActive={activeTab === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeTab))}
                            onClick={() => setActiveTab(item.id)}
                        />
                    ))}

                    {businessItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isActive={activeTab === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeTab))}
                            onClick={item.onClick}
                        />
                    ))}

                    {ekycItems.map((item) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            isActive={activeTab === item.id}
                            onClick={() => setActiveTab(item.id)}
                        />
                    ))}
                </div>
                
                {/* CTA Card at bottom */}
                {isHovered && (
                    <div className="px-4 py-2 mt-auto">
                        <div className="bg-emerald-600 rounded-2xl p-4 text-white relative overflow-hidden group">
                           {/* BG Decoration */}
                           <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                           <div className="absolute -left-4 -top-4 w-16 h-16 bg-emerald-400/20 rounded-full blur-xl" />
                           
                           <h4 className="font-bold text-sm mb-1.5 relative z-10">Maximize Profits</h4>
                           <p className="text-[10px] text-emerald-50 mb-4 leading-relaxed relative z-10">Get real-time commission alerts and payout signals directly.</p>
                           
                           <button className="w-full bg-white text-emerald-600 font-bold text-[11px] py-2 rounded-xl shadow-lg shadow-emerald-900/10 hover:bg-emerald-50 transition-colors relative z-10">
                               Notify Me
                           </button>
                           
                           {/* Coins Illustration via CSS */}
                           <div className="absolute right-2 bottom-6 opacity-30 pointer-events-none">
                               <div className="relative w-12 h-12">
                                   <div className="absolute top-0 right-0 w-8 h-8 rounded-full border-2 border-white/50" />
                                   <div className="absolute bottom-0 left-0 w-6 h-6 rounded-full border-2 border-white/30" />
                               </div>
                           </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile area - minimal like Nexus */}
            <div className="p-4 border-t border-slate-50">
                <div className={`flex items-center ${isHovered ? 'justify-between px-2' : 'justify-center'} py-1.5`}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                            {currentUser?.profilePhoto ? (
                                <img src={currentUser.profilePhoto} alt="U" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[10px] font-bold text-slate-400">{getInitials()}</span>
                            )}
                        </div>
                        {isHovered && (
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800 line-clamp-1">{currentUser?.businessName || 'Merchant'}</span>
                                <span className="text-[10px] text-slate-400 font-medium">Retailer Account</span>
                            </div>
                        )}
                    </div>
                    {isHovered && <ChevronRight size={14} className="text-slate-300" />}
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;
