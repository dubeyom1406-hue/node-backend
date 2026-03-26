/**
 * fingpayService.js
 * ─────────────────────────────────────────────────────────────────────────
 *  Complete Fingpay AEPS Integration Service
 *  Based on Fingpay Services API Doc 04-01-2025 + Cash Deposit API Doc
 *  + Two Factor Authentication Biometric v2.1
 *
 *  Encryption Flow (from PHP/C# sample code):
 *   1. Generate random 16-byte AES session key
 *   2. AES-128-CBC encrypt the JSON request payload → base64 → encrypted_json
 *   3. SHA256 hash of raw JSON payload → base64 → hash header
 *   4. RSA encrypt AES key with Fingpay public cert (X.509) → base64 → eskey header
 *   5. POST encrypted_json as body, pass headers: trnTimestamp, hash, deviceIMEI, eskey
 * ─────────────────────────────────────────────────────────────────────────────
 */

const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ── Fingpay Production Config ─────────────────────────────────────────────────
const FINGPAY_BASE_URL = process.env.FINGPAY_BASE_URL || 'https://fingpayap.tapits.in';
const FINGPAY_SUPERMERCHANT_ID = process.env.FINGPAY_SUPERMERCHANT_ID || '';
const FINGPAY_MERCHANT_ID = process.env.FINGPAY_MERCHANT_ID || '';
const FINGPAY_USERNAME = process.env.FINGPAY_USERNAME || '';
const FINGPAY_PASSWORD = process.env.FINGPAY_PASSWORD || '';
const FINGPAY_PIN = process.env.FINGPAY_PIN || '';
const FINGPAY_DEVICE_IMEI = process.env.FINGPAY_DEVICE_IMEI || 'WEB_RETAILER_001';

// ── Fingpay Public Certificate (for RSA encryption of AES session key) ────────
// This is the Fingpay production public cert from fingpay_public_production.txt
const FINGPAY_PUBLIC_CERT = `-----BEGIN CERTIFICATE-----
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
-----END CERTIFICATE-----`;

// PHP sample shows IV: '06f2f04cc530364f' — fixed IV as per Fingpay spec
const FIXED_IV = Buffer.from('06f2f04cc530364f', 'utf8');

// ── Generate 16-byte AES Session Key (matching PHP mt_rand 0-15 pattern) ──────
function generateSessionKey() {
    // PHP sample: bytes 0-15 as chr sequence. For production: use crypto.randomBytes
    if (process.env.NODE_ENV === 'production') {
        return crypto.randomBytes(16);
    }
    // Match PHP sample exactly for compatibility:
    return Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
}

// ── AES-128-CBC encrypt JSON payload ─────────────────────────────────────────
function encryptPayload(jsonStr, sessionKey) {
    const cipher = crypto.createCipheriv('aes-128-cbc', sessionKey, FIXED_IV);
    const encrypted = Buffer.concat([cipher.update(jsonStr, 'utf8'), cipher.final()]);
    return encrypted.toString('base64');
}

// ── SHA-256 hash of JSON payload ──────────────────────────────────────────────
function hashPayload(jsonStr) {
    return crypto.createHash('sha256').update(jsonStr, 'utf8').digest('base64');
}

// ── RSA encrypt AES session key with Fingpay public cert ──────────────────────
function encryptSessionKey(sessionKey) {
    return crypto.publicEncrypt(
        { key: FINGPAY_PUBLIC_CERT, padding: crypto.constants.RSA_PKCS1_PADDING },
        sessionKey
    ).toString('base64');
}

// ── Build Fingpay request headers ─────────────────────────────────────────────
function buildHeaders(jsonStr, sessionKey, deviceIMEI, withIMEI = true, withSuperMerchant = false) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yr = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const trnTimestamp = `${dd}/${mm}/${yr} ${hh}:${min}:${ss}`;

    const headers = {
        'Content-Type': 'application/json',
        'trnTimestamp': trnTimestamp,
        'hash': hashPayload(jsonStr),
        'eskey': encryptSessionKey(sessionKey),
    };

    if (withIMEI) {
        headers['deviceIMEI'] = deviceIMEI || FINGPAY_DEVICE_IMEI;
    }

    if (withSuperMerchant) {
        headers['supermerchantId'] = FINGPAY_SUPERMERCHANT_ID;
    }

    return headers;
}

// ── Core HTTP POST to Fingpay ─────────────────────────────────────────────────
async function fingpayPost(endpoint, payload, deviceIMEI, withIMEI = true, withSuperMerchant = false) {
    const jsonStr = JSON.stringify(payload);
    const sessionKey = generateSessionKey();
    const encryptedBody = encryptPayload(jsonStr, sessionKey);
    const headers = buildHeaders(jsonStr, sessionKey, deviceIMEI, withIMEI, withSuperMerchant);

    return new Promise((resolve, reject) => {
        const url = new URL(`${FINGPAY_BASE_URL}${endpoint}`);
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: 'POST',
            headers: { ...headers, 'Content-Length': Buffer.byteLength(encryptedBody) }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch {
                    resolve({ rawResponse: data });
                }
            });
        });

        req.on('error', reject);
        req.write(encryptedBody);
        req.end();
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  API FUNCTIONS — Each corresponds to a Fingpay endpoint
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Merchant Onboarding
 */
async function merchantOnboard(merchantData) {
    const payload = {
        username: FINGPAY_USERNAME,
        password: FINGPAY_PASSWORD,
        ipAddress: merchantData.ipAddress || '127.0.0.1',
        latitude: merchantData.latitude || '0.0',
        longitude: merchantData.longitude || '0.0',
        supermerchantId: FINGPAY_SUPERMERCHANT_ID,
        merchant: merchantData.merchant,
    };
    return fingpayPost('/fpaepsservice/api/merchant/onboarding', payload, null, false);
}

/**
 * eKYC - Send OTP
 */
async function ekycSendOtp({ aadhaarNumber, merchantUsername, merchantPin }) {
    const payload = {
        superMerchantId: FINGPAY_SUPERMERCHANT_ID,
        merchantUserName: merchantUsername,
        merchantPin: merchantPin,
        aadhaarNumber: aadhaarNumber,
        latitude: '0.0',
        longitude: '0.0',
        transactionType: 'OTP',
    };
    return fingpayPost('/fpaepsservice/api/eKYC/generateOTP', payload);
}

/**
 * eKYC - Validate OTP
 */
async function ekycValidateOtp(data) {
    const payload = {
        superMerchantId: FINGPAY_SUPERMERCHANT_ID,
        merchantUserName: data.merchantUserName,
        merchantPin: data.merchantPin,
        aadhaarNumber: data.aadhaarNumber,
        otp: data.otp,
        requestId: data.requestId,
        latitude: data.latitude || '0.0',
        longitude: data.longitude || '0.0',
        transactionType: 'OTP',
    };
    return fingpayPost('/fpaepsservice/api/eKYC/validateOTP', payload);
}

/**
 * Cash Withdrawal
 */
async function cashWithdrawal({ mobile, aadhaar, bankIIN, amount, retailerInfo, biometric }) {
    const payload = {
        superMerchantId: FINGPAY_SUPERMERCHANT_ID,
        merchantUserName: retailerInfo?.username || FINGPAY_USERNAME,
        merchantPin: retailerInfo?.pin || FINGPAY_PIN,
        transactionType: 'CW',
        transactionAmount: parseFloat(amount),
        mobileNumber: mobile,
        paymentType: 'AADHAAR',
        timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB'),
        latitude: retailerInfo?.lat || '0.0',
        longitude: retailerInfo?.lng || '0.0',
        deviceTransactionId: 'CW' + Date.now(),
        merchantTranId: 'MT' + Date.now(),
        bankIIN: bankIIN, // Added bankIIN
        cardnumberORUID: {
            indicatorforUID: 0,
            aadhaarNumber: aadhaar,
        },
        ...buildBiometricBlock(biometric),
        isFacialTan: false,
        isIRISTxn: false,
        languageCode: 'en',
    };
    return fingpayPost('/fpaepsservice/api/cashWithdrawal/merchant/withdrawal', payload, retailerInfo?.imei);
}

/**
 * Balance Inquiry
 */
async function balanceInquiry({ mobile, aadhaar, bankIIN, retailerInfo, biometric }) {
    const payload = {
        superMerchantId: FINGPAY_SUPERMERCHANT_ID,
        merchantUserName: retailerInfo?.username || FINGPAY_USERNAME,
        merchantPin: retailerInfo?.pin || FINGPAY_PIN,
        transactionType: 'BE',
        mobileNumber: mobile,
        paymentType: 'AADHAAR',
        timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB'),
        latitude: retailerInfo?.lat || '0.0',
        longitude: retailerInfo?.lng || '0.0',
        deviceTransactionId: 'BE' + Date.now(),
        merchantTranId: 'MT' + Date.now(),
        bankIIN: bankIIN, // Added bankIIN
        cardnumberORUID: {
            indicatorforUID: 0,
            aadhaarNumber: aadhaar,
        },
        ...buildBiometricBlock(biometric),
        isFacialTan: false,
        isIRISTxn: false,
        languageCode: 'en',
    };
    return fingpayPost('/fpaepsservice/api/balanceEnquiry/merchant/balanceenquiry', payload, retailerInfo?.imei);
}

/**
 * Mini Statement
 */
async function miniStatement({ mobile, aadhaar, bankIIN, retailerInfo, biometric }) {
    const payload = {
        superMerchantId: FINGPAY_SUPERMERCHANT_ID,
        merchantUserName: retailerInfo?.username || FINGPAY_USERNAME,
        merchantPin: retailerInfo?.pin || FINGPAY_PIN,
        transactionType: 'MS',
        mobileNumber: mobile,
        paymentType: 'AADHAAR',
        timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB'),
        latitude: retailerInfo?.lat || '0.0',
        longitude: retailerInfo?.lng || '0.0',
        deviceTransactionId: 'MS' + Date.now(),
        merchantTranId: 'MT' + Date.now(),
        bankIIN: bankIIN, // Added bankIIN
        cardnumberORUID: {
            indicatorforUID: 0,
            aadhaarNumber: aadhaar,
        },
        ...buildBiometricBlock(biometric),
        isFacialTan: false,
        isIRISTxn: false,
        languageCode: 'en',
    };
    return fingpayPost('/fpaepsservice/api/miniStatement/merchant/ministatement', payload, retailerInfo?.imei);
}

/**
 * Aadhaar Pay
 */
async function aadhaarPay({ mobile, aadhaar, bankIIN, amount, retailerInfo, biometric }) {
    const payload = {
        superMerchantId: FINGPAY_SUPERMERCHANT_ID,
        merchantUserName: retailerInfo?.username || FINGPAY_USERNAME,
        merchantPin: retailerInfo?.pin || FINGPAY_PIN,
        transactionType: 'AP',
        transactionAmount: parseFloat(amount),
        mobileNumber: mobile,
        paymentType: 'AADHAAR',
        timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB'),
        latitude: retailerInfo?.lat || '0.0',
        longitude: retailerInfo?.lng || '0.0',
        deviceTransactionId: 'AP' + Date.now(),
        merchantTranId: 'MT' + Date.now(),
        bankIIN: bankIIN, // Added bankIIN
        cardnumberORUID: {
            indicatorforUID: 0,
            aadhaarNumber: aadhaar,
        },
        ...buildBiometricBlock(biometric),
        isFacialTan: false,
        isIRISTxn: false,
        languageCode: 'en',
    };
    return fingpayPost('/fpaepsservice/api/aadhaarPay/merchant/aadhaarPay', payload, retailerInfo?.imei);
}

/**
 * Cash Deposit
 */
async function cashDeposit({ mobile, aadhaar, bankIIN, amount, retailerInfo, biometric, twoFABiometric }) {
    const payload = {
        superMerchantId: FINGPAY_SUPERMERCHANT_ID,
        merchantUserName: retailerInfo?.username || FINGPAY_USERNAME,
        merchantPin: retailerInfo?.pin || FINGPAY_PIN,
        transactionType: 'CD',
        transactionAmount: parseFloat(amount),
        mobileNumber: mobile,
        paymentType: 'AADHAAR',
        timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB'),
        latitude: retailerInfo?.lat || '0.0',
        longitude: retailerInfo?.lng || '0.0',
        deviceTransactionId: 'CD' + Date.now(),
        merchantTranId: 'MT' + Date.now(),
        requestRemarks: 'Cash Deposit',
        bankIIN: bankIIN, // Added bankIIN
        cardnumberORUID: {
            indicatorforUID: 0,
            aadhaarNumber: aadhaar,
        },
        ...buildBiometricBlock(biometric),
        isFacialTan: false,
        isIRISTxn: false,
        languageCode: 'en',
        ...(twoFABiometric ? buildTwoFABlock(twoFABiometric) : {})
    };
    return fingpayPost('/fpaepsservice/api/cashDeposit/merchant/cashdeposit', payload, retailerInfo?.imei, true, true);
}

/**
 * Two-Factor Authentication (Biometric)
 */
async function twoFactorAuth({ mobile, aadhaar, retailerInfo, biometric }) {
    const payload = {
        superMerchantId: FINGPAY_SUPERMERCHANT_ID,
        merchantUserName: retailerInfo?.username || FINGPAY_USERNAME,
        merchantPin: retailerInfo?.pin || FINGPAY_PIN,
        transactionType: 'AUO',
        latitude: retailerInfo?.lat || '0.0',
        longitude: retailerInfo?.lng || '0.0',
        ...buildBiometricBlock(biometric)
    };
    return fingpayPost('/fpaepsservice/api/authentication/merchant/twoFactorAuthentication', payload, retailerInfo?.imei);
}

/**
 * Status Check
 */
async function statusCheck(merchantTranId, merchantUsername, merchantPin) {
    const payload = {
        superMerchantId: FINGPAY_SUPERMERCHANT_ID,
        merchantUserName: merchantUsername,
        merchantPin: merchantPin,
        merchantTranId: merchantTranId,
        timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB'),
    };
    return fingpayPost('/fpaepsservice/api/transactionStatus/merchant/transactionstatus', payload);
}

/**
 * 3-Way Reconciliation
 */
async function threeWayRecon(date, merchantUsername, merchantPin) {
    const payload = {
        superMerchantId: FINGPAY_SUPERMERCHANT_ID,
        merchantUserName: merchantUsername,
        merchantPin: merchantPin,
        transactionDate: date, // format: dd/MM/yyyy
        timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB'),
    };
    return fingpayPost('/fpaepsservice/api/threeWayRecon/merchant/threewayrecon', payload);
}


// ── Build biometric block from RD capture PID data ────────────────────────────
// PID data comes from Mantra/Antra RD Service capture
function buildBiometricBlock(pid) {
    if (!pid) return {};
    return {
        fCount: pid.fCount || '1',
        fType: pid.fType || '2',
        iCount: pid.iCount || '0',
        iType: pid.iType || '',
        pCount: pid.pCount || '0',
        pType: pid.pType || '',
        nmPoints: pid.nmPoints || '',
        qScore: pid.qScore || '',
        dpID: pid.dpID || '',
        rdsID: pid.rdsID || '',
        rdsVer: pid.rdsVer || '',
        dc: pid.dc || '',
        mi: pid.mi || '',
        mc: pid.mc || '',
        ci: pid.ci || '',
        sessionKey: pid.sessionKey || '',
        hmac: pid.hmac || '',
        PidDatatype: pid.PidDatatype || 'X',
        Piddata: pid.Piddata || '',
    };
}

// ── Build 2FA biometric block (for cash deposit second auth) ──────────────────
function buildTwoFABlock(pid) {
    if (!pid) return {};
    // Prefix keys with 'twoFA_' to distinguish from primary biometric
    const block = buildBiometricBlock(pid);
    const twoFA = {};
    Object.entries(block).forEach(([k, v]) => { twoFA[`twoFA_${k}`] = v; });
    return twoFA;
}

// ── Transaction log helper ────────────────────────────────────────────────────
function buildTransactionLog(type, request, fingpayResponse, userId) {
    return {
        id: Date.now(),
        user_id: userId,
        type: `AEPS_${type}`,
        amount: parseFloat(request.amount) || 0,
        aadhaar: request.aadhaar ? `XXXX-XXXX-${request.aadhaar.slice(-4)}` : '',
        bank: request.bankIIN || '',
        mobile: request.mobile || '',
        status: fingpayResponse?.status === '200' ? 'SUCCESS' : 'FAILED',
        txId: fingpayResponse?.txnId || fingpayResponse?.transactionId || String(Date.now()),
        fingpayCode: fingpayResponse?.responseCode || '',
        fingpayMsg: fingpayResponse?.responseMessage || '',
        qScore: request.biometric?.qScore || '',
        created_at: new Date().toISOString()
    };
}

module.exports = {
    cashWithdrawal,
    balanceInquiry,
    miniStatement,
    aadhaarPay,
    cashDeposit,
    twoFactorAuth,
    merchantOnboard,
    ekycSendOtp,
    ekycValidateOtp,
    statusCheck,
    threeWayRecon,
    buildTransactionLog,
    FINGPAY_BASE_URL,
    FINGPAY_SUPERMERCHANT_ID,
};
