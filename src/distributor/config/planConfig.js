/**
 * PLAN CONFIGURATION
 * Single source of truth for what each plan allows.
 * Used across Dashboard, Retailers, sidebar, etc.
 */

export const PLAN_CONFIG = {
    free: {
        id: 'free',
        label: 'Free Plan',
        color: 'from-blue-600 to-blue-900',
        accent: '#3b82f6',
        maxRetailers: 5,
        maxSubDistributors: 0,
        features: {
            addRetailer: true,
            subDistributors: false,
            advancedReports: false,
            commissionSlabs: false,
            apiAccess: false,
            whiteLabelBranding: false,
            prioritySupport: false,
            exportReports: true,
        }
    },
    standard: {
        id: 'standard',
        label: 'Standard Plan',
        color: 'from-amber-500 to-orange-700',
        accent: '#f59e0b',
        maxRetailers: 50,
        maxSubDistributors: 25,
        features: {
            addRetailer: true,
            subDistributors: true,
            advancedReports: true,
            commissionSlabs: true,
            apiAccess: false,
            whiteLabelBranding: false,
            prioritySupport: true,
            exportReports: true,
        }
    },
    premium: {
        id: 'premium',
        label: 'Premium Plan',
        color: 'from-indigo-700 to-purple-900',
        accent: '#8b5cf6',
        maxRetailers: Infinity,
        maxSubDistributors: Infinity,
        features: {
            addRetailer: true,
            subDistributors: true,
            advancedReports: true,
            commissionSlabs: true,
            apiAccess: true,
            whiteLabelBranding: true,
            prioritySupport: true,
            exportReports: true,
        }
    },
};

/** Returns the plan config for the current distributor. Defaults to free. */
export const getDistributorPlan = (dist) => {
    const planId = dist?.plan || 'free';
    return PLAN_CONFIG[planId] || PLAN_CONFIG.free;
};

/** Returns how many retailers this distributor can still add. */
export const getRemainingRetailerSlots = (dist, currentCount) => {
    const plan = getDistributorPlan(dist);
    if (plan.maxRetailers === Infinity) return Infinity;
    return Math.max(0, plan.maxRetailers - currentCount);
};
