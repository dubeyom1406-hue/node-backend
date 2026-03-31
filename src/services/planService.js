import { BACKEND_URL } from './config';

export const planService = {

    // --- LEGACY STORAGE KEYS ---
    KEYS: {
        PLANS: 'rupiksha_plans_templates',
        USER_PLANS: 'rupiksha_user_assignments',
        HISTORY: 'rupiksha_plan_history'
    },

    getPlansForType: function (role) {
        const all = this.getAllPlans();
        return all[role.toLowerCase()] || [];
    },

    getPlanById: function (planId) {
        return this.getAllPlansFlat().find(p => p.id === planId) || null;
    },

    // --- LEGACY METHODS (REQUIRED BY ADMIN/DASHBOARD) ---
    getAllPlans: function () {
        const d = localStorage.getItem(this.KEYS.PLANS);
        return d ? JSON.parse(d) : { retailer: [], distributor: [], superdistributor: [] };
    },

    getAllPlansFlat: function () {
        const all = this.getAllPlans();
        return [...all.retailer, ...all.distributor, ...all.superdistributor];
    },

    savePlans: function (plans) {
        localStorage.setItem(this.KEYS.PLANS, JSON.stringify(plans));
        window.dispatchEvent(new Event('planDataUpdated'));
    },

    getAllUserPlans: function () {
        const d = localStorage.getItem(this.KEYS.USER_PLANS);
        return d ? JSON.parse(d) : {};
    },

    getUserPlan: function (userId) {
        const assignments = this.getAllUserPlans();
        return assignments[userId] || null;
    },

    getPlanHistory: function () {
        const d = localStorage.getItem(this.KEYS.HISTORY);
        return d ? JSON.parse(d) : [];
    },

    updatePlan: function (typeId, planId, patch) {
        const all = this.getAllPlans();
        const idx = (all[typeId] || []).findIndex(p => p.id === planId);
        if (idx !== -1) {
            all[typeId][idx] = { ...all[typeId][idx], ...patch };
            this.savePlans(all);
        }
    },

    addPlan: function (typeId, plan) {
        const all = this.getAllPlans();
        const newPlan = {
            ...plan,
            id: 'PL-' + Math.floor(1000 + Math.random() * 9000),
            type: typeId,
            active: true
        };
        if (!all[typeId]) all[typeId] = [];
        all[typeId].push(newPlan);
        this.savePlans(all);
        return newPlan;
    },

    deletePlan: function (typeId, planId) {
        const all = this.getAllPlans();
        if (all[typeId]) {
            all[typeId] = all[typeId].filter(p => p.id !== planId);
            this.savePlans(all);
        }
    },

    togglePlanActive: function (typeId, planId) {
        const all = this.getAllPlans();
        const idx = (all[typeId] || []).findIndex(p => p.id === planId);
        if (idx !== -1) {
            all[typeId][idx].active = !all[typeId][idx].active;
            this.savePlans(all);
        }
    },

    assignPlan: function (userId, userName, planId, adminNote = '') {
        const assignments = this.getAllUserPlans();
        const oldPlanId = assignments[userId] || null;
        assignments[userId] = planId;
        localStorage.setItem(this.KEYS.USER_PLANS, JSON.stringify(assignments));

        // Log to history
        const history = this.getPlanHistory();
        history.unshift({
            id: Date.now(),
            userId,
            userName,
            oldPlanId,
            newPlanId: planId,
            adminNote,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history.slice(0, 50)));
        window.dispatchEvent(new Event('planDataUpdated'));
    },

    resetToDefaults: function () {
        localStorage.removeItem(this.KEYS.PLANS);
        localStorage.removeItem(this.KEYS.USER_PLANS);
        localStorage.removeItem(this.KEYS.HISTORY);
        window.dispatchEvent(new Event('planDataUpdated'));
    }
};

export default planService;
