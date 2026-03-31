import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";

const PermissionContext = createContext(null);

// Saare permission modules aur unke actions
export const PERMISSIONS = {
  MEMBERS: {
    label: "Members Privilege",
    actions: {
      CHECK_ALL: "Check All",
      ADD_MEMBER: "Add Member",
      LIST_MEMBERS: "List Members",
      USER_REQUEST: "User Request",
      UPGRADE_MEMBER: "Upgrade Member",
      USER_COMPLAINTS: "User Complaints",
    },
  },
  KYC: {
    label: "KYC Privilege",
    actions: {
      CHECK_ALL: "Check All",
      PENDING_PROFILE_KYC: "Pending Profile KYC",
      PROFILE_KYC: "Profile KYC",
    },
  },
  PAYOUT: {
    label: "Payout Privilege",
    actions: {
      CHECK_ALL: "Check All",
      ACCOUNT_APPROVAL_REQUEST: "Account Approval Request",
      PENDING_APPROVAL_REQUEST: "Pending Approval Request",
    },
  },
  WALLET: {
    label: "Wallet Privilege",
    actions: {
      CHECK_ALL: "Check All",
      WALLET: "Wallet",
      CREDIT_FUND: "Credit Fund",
      DEBIT_FUND: "Debit Fund",
      PENDING_FUND_REQUEST: "Pending Fund Request",
      FUND_REQUEST: "Fund Request",
      LOCK_AMOUNT: "Lock Amount",
      RELEASE_LOCK_AMOUNT: "Release Lock Amount",
    },
  },
  TRANSACTIONS: {
    label: "Transactions Privilege",
    actions: {
      CHECK_ALL: "Check All",
      WALLET_TRANSACTIONS: "Wallet Transactions",
      AEPS_ICICI: "AEPS ICICI",
      BBPS: "BBPS",
      RECHARGE: "Recharge",
      DMT: "DMT",
      PAYOUT: "Payout",
      QUICK_TRANSFER: "Quick Transfer",
      PAN_REGISTRATION: "PAN Registration",
      PAN_COUPON: "PAN Coupon",
    },
  },
  SUPPORT_TICKET: {
    label: "Support Ticket Privilege",
    actions: {
      CHECK_ALL: "Check All",
      PENDING_SUPPORT_TICKET: "Pending Support Ticket",
      SUPPORT_TICKET: "Support Ticket",
    },
  },
  SETTINGS: {
    label: "Settings Privilege",
    actions: {
      CHECK_ALL: "Check All",
      MAIN_SETTINGS: "Main Settings",
      PACKAGE: "Package",
      COMMISSION_AND_CHARGES: "Commission and Charges",
      REGISTRATION_FEES: "Registration Fees",
      USER_LOGIN_LOGS: "User Login Logs",
      ADMIN_LOGIN_LOGS: "Admin Login Logs",
    },
  },
  OTHER_SERVICES: {
    label: "Other Services Privilege",
    actions: {
      CHECK_ALL: "Check All",
      ADD_SERVICE: "Add Service",
      LIST_SERVICE: "List Service",
    },
  },
  MANAGE: {
    label: "Manage Privilege",
    actions: {
      CHECK_ALL: "Check All",
      COMPANY_BANKS: "Company Banks",
      MANAGE_SERVICES: "Manage Services",
    },
  },
  EMPLOYEE_MANAGEMENT: {
    label: "Employee Management Privilege",
    actions: {
      CHECK_ALL: "Check All",
      ADD_EMPLOYEE: "Add Employee",
      VIEW_EMPLOYEE: "View Employee",
    },
  },
  DASHBOARD: {
    label: "Dashboard Privilege",
    actions: {
      VIEW_NATIONAL_DASHBOARD: "View National Dashboard",
      VIEW_STATE_DASHBOARD: "View State Dashboard",
      VIEW_REGIONAL_DASHBOARD: "View Regional Dashboard",
      VIEW_LIVE_LOCATION: "View Live Location",
      VIEW_USER_PROFILE: "View User Profile Details",
    },
  },
};

export function PermissionProvider({ children }) {
  const { hasPermission } = useAuth();
  return (
    <PermissionContext.Provider value={{ hasPermission, PERMISSIONS }}>
      {children}
    </PermissionContext.Provider>
  );
}

export const usePermission = () => useContext(PermissionContext);
