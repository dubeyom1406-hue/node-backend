import {
    Users, Repeat, FileBarChart, Map, FileText, Wallet, Percent,
    LifeBuoy, History, Monitor, MapPin, Youtube, User, Plus, Share2,
    CheckCircle2, Settings as SettingsIcon, Landmark,
    AlertCircle, Clock, X
} from 'lucide-react';

export const menuItems = [
    { title: "APPROVALS", icon: CheckCircle2, path: "/superadmin/approvals" },
    { title: "LOAN APPROVALS", icon: Landmark, path: "/superadmin/loans" },
    {
        title: "ALL MEMBERS", icon: Users, path: "/superadmin/members",
        submenu: [
            { title: "Manage Members", icon: Users, path: "/superadmin/members" },
            { title: "Super Distributor", icon: Users, path: "/superadmin/super-distributors" },
            { title: "Distributors", icon: Users, path: "/superadmin/distributors" },
            { title: "Retailer Details", icon: Monitor, path: "/superadmin/retailers/details" },
            { title: "Share Rupiksha APP", icon: Share2, path: "/superadmin/retailers/share" },
            { title: "Service Workflow", icon: Monitor, path: "/superadmin/retailers/workflow" }
        ]
    },
    {
        title: "WALLET CONTROL", icon: Wallet, path: "/superadmin/wallet",
        submenu: [
            { title: "Credit Fund", icon: Plus, path: "/superadmin/wallet/credit" },
            { title: "Debit Fund", icon: X, path: "/superadmin/wallet/debit" },
            { title: "Fund Requests", icon: Clock, path: "/superadmin/wallet/requests" },
            { title: "Lock Amount", icon: AlertCircle, path: "/superadmin/wallet/lock" },
            { title: "Release Lock", icon: CheckCircle2, path: "/superadmin/wallet/release" }
        ]
    },
    {
        title: "TRANSACTIONS", icon: Repeat, path: "/superadmin/transactions",
        submenu: [
            { title: "SuperAdmin Receipt", icon: FileText, path: "/superadmin/transactions/superadmin-receipt" },
            { title: "Retailer Receipt", icon: FileText, path: "/superadmin/transactions/retailer-receipt" },
            { title: "Add Money", icon: Wallet, path: "/superadmin/transactions/add-money" },
            { title: "Axis CDM Card", icon: Monitor, path: "/superadmin/transactions/axis-cdm" },
            { title: "Axis Card Mapping", icon: Percent, path: "/superadmin/transactions/axis-mapping" }
        ]
    },
    {
        title: "REPORTS", icon: FileBarChart, path: "/superadmin/reports",
        submenu: [
            { title: "Sale Report", icon: FileText, path: "/superadmin/reports/sale-report" },
            { title: "Consolidated-ledger", icon: FileText, path: "/superadmin/reports/consolidated-ledger" },
            { title: "Daily ledger", icon: FileText, path: "/superadmin/reports/daily-ledger" },
            { title: "GST E-Invoice", icon: FileText, path: "/superadmin/reports/gst-einvoice" },
            { title: "GST E-Invoice Report", icon: FileText, path: "/superadmin/reports/gst-einvoice-report" },
            { title: "GSTIN Invoice", icon: FileText, path: "/superadmin/reports/gstin-invoice" },
            { title: "Consolidated GSTIN Invoice", icon: FileText, path: "/superadmin/reports/consolidated-gstin-invoice" },
            { title: "Consolidated Commission Receipt", icon: FileText, path: "/superadmin/reports/consolidated-commission" },
            { title: "TDS", icon: FileText, path: "/superadmin/reports/tds" },
            { title: "Payment Request History", icon: Wallet, path: "/superadmin/reports/payment-request" },
            { title: "EMI Reports", icon: FileText, path: "/superadmin/reports/emi-reports" },
            { title: "QR Transactions Report", icon: FileText, path: "/superadmin/reports/qr-transactions" },
        ]
    },
    { title: "PLAN & RATES", icon: Map, path: "/superadmin/plans" },
    { title: "INVOICE", icon: FileText, path: "/superadmin/invoice" },
    {
        title: "ACCOUNTS", icon: Wallet, path: "/superadmin/accounts",
        submenu: [
            { title: "My Ledger", icon: FileText, path: "/superadmin/accounts/my-ledger" },
            { title: "Retailer Ledger", icon: Monitor, path: "/superadmin/accounts/retailer-ledger" },
            { title: "Commission Reports", icon: FileBarChart, path: "/superadmin/accounts/commission" }
        ]
    },
    {
        title: "PROMOTIONS", icon: Percent, path: "/superadmin/promotions",
        submenu: [
            { title: "Promotions", icon: Plus, path: "/superadmin/promotions/list" },
            { title: "Video / Pdf", icon: Monitor, path: "/superadmin/promotions/assets" }
        ]
    },
    {
        title: "SUPPORT", icon: LifeBuoy, path: "/superadmin/support",
        submenu: [
            { title: "Online New Retailers Lead", icon: MapPin, path: "/superadmin/support/leads" },
            { title: "ECollect/OLP Complaints", icon: Repeat, path: "/superadmin/support/complaints-ecollect" },
            { title: "Retailer Complaint", icon: User, path: "/superadmin/support/retailer-complaints" },
            { title: "Training Videos", icon: Youtube, path: "/superadmin/support/videos" }
        ]
    },
    { title: "OLD FY REPORTS", icon: History, path: "/superadmin/old-reports" },
    { title: "SETTINGS", icon: SettingsIcon, path: "/superadmin/settings" }
];
