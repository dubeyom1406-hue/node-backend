import {
    Users, Repeat, FileBarChart, Map, FileText, Wallet, Percent,
    LifeBuoy, History, Monitor, MapPin, Youtube, User, Plus, Share2
} from 'lucide-react';

export const menuItems = [
    {
        title: "RETAILERS", icon: Users, path: "/distributor/retailers",
        submenu: [
            { title: "Retailer Details", icon: Monitor, path: "/distributor/retailers/details" },
            { title: "Share Rupiksha APP", icon: Share2, path: "/distributor/retailers/share" },
            { title: "Retailer Service Workflow", icon: Monitor, path: "/distributor/retailers/workflow" }
        ]
    },
    {
        title: "TRANSACTIONS", icon: Repeat, path: "/distributor/transactions",
        submenu: [
            { title: "Distributor Receipt", icon: FileText, path: "/distributor/transactions/distributor-receipt" },
            { title: "Retailer Receipt", icon: FileText, path: "/distributor/transactions/retailer-receipt" },
            { title: "Add Money", icon: Wallet, path: "/distributor/transactions/add-money" },
            { title: "Axis CDM Card", icon: Monitor, path: "/distributor/transactions/axis-cdm" },
            { title: "Axis Card Mapping", icon: Percent, path: "/distributor/transactions/axis-mapping" }
        ]
    },
    {
        title: "REPORTS", icon: FileBarChart, path: "/distributor/reports",
        submenu: [
            { title: "Retailer Balance", icon: FileText, path: "/distributor/reports/retailer-balance" },
            { title: "Payment Request", icon: Wallet, path: "/distributor/reports/payment-request" },
            { title: "Purchase Report", icon: FileBarChart, path: "/distributor/reports/purchase" },
            { title: "Charge Report", icon: Percent, path: "/distributor/reports/charges" },
            { title: "Commission Report", icon: FileBarChart, path: "/distributor/reports/commission" },
            { title: "AEPS Report", icon: Monitor, path: "/distributor/reports/aeps" },
            { title: "DMT Report", icon: Monitor, path: "/distributor/reports/dmt" },
            { title: "BBPS Report", icon: Monitor, path: "/distributor/reports/bbps" },
            { title: "CMS Report", icon: FileText, path: "/distributor/reports/cms" },
        ]
    },
    { title: "PLAN & RATES", icon: Map, path: "/distributor/plans" },
    { title: "INVOICE", icon: FileText, path: "/distributor/invoice" },
    {
        title: "ACCOUNTS", icon: Wallet, path: "/distributor/accounts",
        submenu: [
            { title: "My Ledger", icon: FileText, path: "/distributor/accounts/my-ledger" },
            { title: "Retailer Ledger", icon: Monitor, path: "/distributor/accounts/retailer-ledger" },
            { title: "Commission Reports", icon: FileBarChart, path: "/distributor/accounts/commission" }
        ]
    },
    {
        title: "PROMOTIONS", icon: Percent, path: "/distributor/promotions",
        submenu: [
            { title: "Promotions", icon: Plus, path: "/distributor/promotions/list" },
            { title: "Video / Pdf", icon: Monitor, path: "/distributor/promotions/assets" }
        ]
    },
    {
        title: "SUPPORT", icon: LifeBuoy, path: "/distributor/support",
        submenu: [
            { title: "Online New Retailers Lead", icon: MapPin, path: "/distributor/support/leads" },
            { title: "ECollect/OLP Complaints", icon: Repeat, path: "/distributor/support/complaints-ecollect" },
            { title: "Retailer Complaint", icon: User, path: "/distributor/support/retailer-complaints" },
            { title: "Training Videos", icon: Youtube, path: "/distributor/support/videos" }
        ]
    },
    { title: "OLD FY REPORTS", icon: History, path: "/distributor/old-reports" }
];
