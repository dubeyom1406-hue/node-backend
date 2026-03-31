import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import { dataService } from '../../services/dataService';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, LogOut } from 'lucide-react';
import RetailerEKYC from './banking/RetailerEKYC';

const RetailerLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const [appData, setAppData] = useState(dataService.getData());
    const currentUser = appData.currentUser;

    // Map path to active tab for Sidebar
    const getActiveTab = () => {
        const path = location.pathname;
        const searchParams = new URLSearchParams(location.search);
        const reportType = searchParams.get('report');

        if (path === '/dashboard') return 'dashboard';
        if (path.startsWith('/aeps')) return 'aeps_services';
        if (path.startsWith('/cms')) return 'cms';
        if (path.startsWith('/travel')) return 'travel';
        if (path.startsWith('/utility')) return 'utility';
        if (path.startsWith('/all-services')) return 'all_services';
        if (path.startsWith('/reports')) {
            return reportType || 'reports';
        }
        if (path.startsWith('/plans')) return 'plans';
        if (path.startsWith('/matm')) return 'matm';
        if (path === '/add-money') return 'add_money';
        if (path === '/personal_loan') return 'personal_loan';
        if (path === '/home_loan') return 'home_loan';
        if (path === '/gold_loan') return 'gold_loan';
        if (path === '/instant_loan') return 'instant_loan';
        if (path === '/loan_status') return 'loan_status';
        if (path === '/reports/sale-report') return 'sale_report';
        if (path === '/reports/consolidated-ledger') return 'consolidated_ledger';
        if (path === '/reports/daily-ledger') return 'daily_ledger';
        if (path === '/reports/gst-invoice') return 'gst_einvoice';
        if (path === '/reports/audit-report') return 'all';
        if (path === '/gst-invoice-report') return ['gst_einvoice', 'gst_einvoice_report'].includes(reportType) ? reportType : 'gst_einvoice_report';
        return 'dashboard';
    };

    const activeTab = getActiveTab();

    useEffect(() => {
        if (!currentUser) {
            navigate('/');
            return;
        }

        // If not admin/employee, verify they have RETAILER role
        const isStaff = ['ADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].includes(currentUser.role);
        if (!isStaff && currentUser.role !== 'RETAILER') {
            navigate('/');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        const updateData = () => setAppData(dataService.getData());
        window.addEventListener('dataUpdated', updateData);
        return () => window.removeEventListener('dataUpdated', updateData);
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setShowMobileSidebar(false);
    }, [location.pathname]);

    const handleTabChange = (tab) => {
        const reportTabs = [
            'sale_report', 'consolidated_ledger', 'daily_ledger', 
            'gstin_invoice', 'cons_gstin_invoice', 
            'cons_comm_receipt', 'tds_report', 'payment_req_history', 
            'emi_reports', 'qr_txn_report'
        ];

        const reportRoutes = {
            'sale_report': '/reports/sale-report',
            'consolidated_ledger': '/reports/consolidated-ledger',
            'daily_ledger': '/reports/daily-ledger',
            'gst_einvoice': '/reports/gst-invoice',
            'all': '/reports/audit-report',
            'gstin_invoice': '/reports/gst-invoice',
            'cons_gstin_invoice': '/reports/gst-invoice',
            'cons_comm_receipt': '/reports/audit-report',
            'tds_report': '/reports/audit-report',
            'payment_req_history': '/reports/audit-report',
            'emi_reports': '/reports/audit-report',
            'qr_txn_report': '/reports/audit-report'
        };

        if (tab === 'gst_einvoice_report') {
            navigate('/gst-invoice-report');
            setShowMobileSidebar(false);
            return;
        }

        if (reportRoutes[tab]) {
            navigate(reportRoutes[tab]);
            setShowMobileSidebar(false);
            return;
        }

        if (reportTabs.includes(tab)) {
            navigate(`/reports?report=${tab}`);
            setShowMobileSidebar(false);
            return;
        }

        const routes = {
            'dashboard': '/dashboard',
            'aeps_services': '/aeps',
            'cms': '/cms',
            'travel': '/travel',
            'utility': '/utility',
            'all_services': '/all-services',
            'reports': '/reports',
            'plans': '/plans',
            'matm': '/matm',
            'add_money': '/add-money',
            'personal_loan': '/personal_loan',
            'home_loan': '/home_loan',
            'gold_loan': '/gold_loan',
            'instant_loan': '/instant_loan',
            'loan_status': '/loan_status',
            'gst_certification': '/profile?tab=gst_certification',
            'tds_certificate': '/profile?tab=tds_certificate'
        };
        navigate(routes[tab] || '/dashboard');
        setShowMobileSidebar(false);
    };

    const isStaff = ['ADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].includes(currentUser?.role);

    // KYC checks removed as per request to bypass KYC blocking

    return (
        <div className="flex h-screen bg-[#f8fafc] font-['Inter',sans-serif] overflow-hidden relative">
            <AnimatePresence>
                {showMobileSidebar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMobileSidebar(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <Sidebar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                showMobileSidebar={showMobileSidebar}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Header
                    onAddMoney={() => navigate('/add-money')}
                    onProfileClick={(type) => {
                        if (type === 'logout') {
                            dataService.logoutUser();
                            navigate('/');
                        } else {
                            navigate(`/profile?tab=${type}`);
                        }
                    }}
                    onMenuClick={() => setShowMobileSidebar(!showMobileSidebar)}
                />
                {/* pb-16 lg:pb-0 ensures content not hidden behind mobile bottom nav */}
                <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pb-16 lg:pb-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Bottom Navigation — visible only on < lg screens */}
            <MobileBottomNav />
        </div>
    );
};

export default RetailerLayout;
