/**
 * emailService.js
 * Automatic email system using RUPIKSHA Python Backend.
 * Uses the pre-configured SMTP settings in backend/.env
 */

import { BACKEND_URL } from './config';

/**
 * Safe JSON parser to prevent "Unexpected end of JSON input" errors
 */
async function safeJson(res, fallback = { success: false, message: 'Invalid server response' }) {
    try {
        const text = await res.text();
        if (!text || text.trim() === '') return fallback;
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('JSON Parse Error:', e, 'Text:', text);
            return fallback;
        }
    } catch (err) {
        return fallback;
    }
}

/**
 * Sends a real approval email via the Python Backend SMTP.
 */
export const sendApprovalEmail = async (params) => {
    try {
        const token = localStorage.getItem('rupiksha_token');
        const response = await fetch(`${BACKEND_URL}/send-approval`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                to: params.to,
                name: params.name,
                login_id: params.loginId,
                password: params.password,
                pin: params.pin,
                id_label: params.idLabel,
                id_value: params.idValue,
                portal_type: params.portalType
            })
        });

        return await safeJson(response, { success: false, message: 'Email service did not return a valid response' });
    } catch (err) {
        console.error('❌ [Approval Email] Failed:', err);
        return { success: false, message: err.message };
    }
};

/**
 * Sends OTP to a given email address.
 */
export const sendOTPEmail = async (email, otp, name) => {
    try {
        const token = localStorage.getItem('rupiksha_token');
        const response = await fetch(`${BACKEND_URL}/send-otp`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ to: email, otp, name })
        });
        const data = await safeJson(response, { success: false, message: 'OTP service error' });
        if (!data.success) throw new Error(data.error || data.message || "Failed to send OTP");
        return data;
    } catch (err) {
        console.error('❌ [OTP Email] Failed:', err);
        return { success: false, message: err.message };
    }
};

/**
 * Sends credentials to a newly added user, mentioning who added them.
 */
export const sendCredentialsEmail = async (params) => {
    try {
        const token = localStorage.getItem('rupiksha_token');
        const response = await fetch(`${BACKEND_URL}/send-credentials`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                to: params.to,
                name: params.name,
                login_id: params.loginId,
                password: params.password,
                pin: params.pin,
                added_by: params.addedBy,
                portal_type: params.portalType
            })
        });
        const data = await safeJson(response, { success: false, message: 'Credentials service error' });
        if (!data.success) throw new Error(data.error || data.message || "Failed to send credentials");
        return data;
    } catch (err) {
        console.error('❌ [Credentials Email] Failed:', err);
        return { success: false, message: err.message };
    }
};
