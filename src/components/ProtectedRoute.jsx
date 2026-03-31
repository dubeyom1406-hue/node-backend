import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#f7f9fc]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verifying Session...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect to appropriate login based on required role
        const targetLogin = role === 'ADMIN' ? '/admin-login' : '/login';
        return <Navigate to={targetLogin} state={{ from: location }} replace />;
    }

    if (role) {
        const userRoles = user.roles || [user.role];
        const isEmployee = ['NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].some(r => userRoles.includes(r));

        // ADMIN & SUPERADMIN have root access to all portals
        if (userRoles.includes('ADMIN') || userRoles.includes('SUPERADMIN')) {
            return children;
        }

        // Handle pseudoroles
        if (role === 'ADMIN_OR_EMPLOYEE') {
            if (isEmployee) return children;
        }
        
        if (role === 'DISTRIBUTOR') {
            if (userRoles.includes('DISTRIBUTOR') || userRoles.includes('SUPER_DISTRIBUTOR')) return children;
        }

        // Handle role mapping for Super Administrator / Distributor
        let hasAccess = userRoles.includes(role);
        if (!hasAccess && role === 'SUPERADMIN' && userRoles.includes('SUPER_DISTRIBUTOR')) {
            hasAccess = true;
        }

        if (!hasAccess) {
            // If user doesn't have the required role, redirect to their main dashboard
            const primaryRole = userRoles[0];
            if (primaryRole === 'RETAILER') return <Navigate to="/dashboard" replace />;
            if (primaryRole === 'DISTRIBUTOR') return <Navigate to="/distributor" replace />;
            if (primaryRole === 'SUPER_DISTRIBUTOR') return <Navigate to="/distributor" replace />;
            if (primaryRole === 'SUPERADMIN') return <Navigate to="/superadmin" replace />;
            if (['ADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE'].includes(primaryRole)) {
                return <Navigate to="/admin" replace />;
            }
            return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
