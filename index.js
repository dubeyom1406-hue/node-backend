// server/index.js
// Rupiksha Backend — Node.js Express
// 
// Install: npm install express cors jsonwebtoken bcryptjs mysql2 dotenv
// Run: node server/index.js

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const path = require("path");
const { XMLParser } = require('fast-xml-parser');
const axios = require("axios");
const fingpay = require('./fingpayService');
require("dotenv").config({ path: path.join(__dirname, ".env") });

const JAVA_PROXY = process.env.JAVA_BBPS_BACKEND || "http://13.200.239.248:8080";
const xmlParser = new XMLParser();

const getVenusServiceType = (cat) => {
  const mapping = {
    'electricity': 'EB',
    'water': 'WA',
    'gas': 'GP',
    'insurance': 'INS',
    'landline': 'FB',
    'postpaid': 'FB',
    'fastag': 'FAS',
    'data_card': 'DC'
  };
  return mapping[cat?.toLowerCase()] || 'EB';
};

const app = express();
const pool = require("./db");

// port 5008 matches the Vite proxy configuration
const PORT = process.env.PORT || 5008;
const JWT_SECRET = process.env.JWT_SECRET || "rupiksha_secret_key_change_this";

const otpStore = new Map();

// Helper function to send emails (non-blocking, fails gracefully)
async function sendEmailSafe(mailOptions) {
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.warn("⚠️  Email send failed (non-critical):", error.message);
    return { success: false, error: error.message };
  }
}

// ─── Nodemailer Setup ──────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
  logger: false, // Disable verbose logging
  debug: false
});

// Verify connection on startup (non-blocking)
transporter.verify((error, success) => {
  if (error) {
    console.warn("⚠️  [EMAIL] Transporter verification failed (email sending may not work):", error.message);
    console.warn("💡 Tip: Use Gmail App Password instead of regular password");
  } else {
    console.log("✅ [EMAIL] Transporter is ready to send emails");
  }
});

const allowedOrigins = [
  'https://rupiksha.in',
  'https://www.rupiksha.in',
  'https://rupiksha.vercel.app',
  'https://rupiksha-frontend.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5008',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('CORS: Not allowed — ' + origin));
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Prefix /api Support
app.use((req, res, next) => {
  if (req.url === '/api') {
    return res.json({ success: true, message: "✅ Rupiksha API is running" });
  }
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
  }
  next();
});

// --- Database Integration (Source of Truth) ---
// Note: legacy memoryStore removed. MySQL is now the source of truth.

// register endpoint
app.post('/register', async (req, res) => {
  try {
    const payload = req.body || {};
    const { name, mobile, email, password, role, businessName, state } = payload;
    const username = mobile || email;
    if (!username) return res.status(400).json({ success: false, error: "Mobile or Email required" });

    const [existing] = await pool.query("SELECT id FROM users WHERE username = ? OR email = ?", [username, username]);
    if (existing.length > 0) return res.json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password || 'retailer123', 10);

    const [result] = await pool.query(
      "INSERT INTO users (username, password_hash, full_name, mobile, email, business_name, role, status, balance) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', 0)",
      [username, hashedPassword, name, mobile, email, businessName, role || 'RETAILER']
    );

    return res.json({
      success: true,
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, error: "Server error during registration" });
  }
});

console.log("✅ Database Connected. Rupiksha MySQL is active.");

// ─── Auth Middleware ────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token required" });

  // Handle 'Bearer ' prefix case-insensitively
  let token = authHeader;
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    token = authHeader.slice(7).trim();
  } else {
    token = authHeader.trim();
  }

  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ error: "Token required" });
  }

  try {
    // Explicitly use the secret from process.env or the hardcoded fallback
    const secretKey = process.env.JWT_SECRET || "rupiksha_secret_key_change_this";
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("DEBUG: JWT Verification Failed!");
    console.error("DEBUG: Error:", err.message);
    console.error("DEBUG: Token length:", token.length);
    console.error("DEBUG: Token starts with:", token.substring(0, 15));
    res.status(401).json({ error: "Invalid token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });
  next();
};

// ─── INIT DB ROUTE ────────────────────────────────────────────────────────────
app.get("/setup-db", async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');

    // Read the database_setup.sql file (1 level up from server/)
    const sqlFile = path.join(__dirname, '..', 'database_setup.sql');
    let sqlString = fs.readFileSync(sqlFile, 'utf8');

    // Remove the "CREATE DATABASE IF NOT EXISTS rupiksha;" and "USE rupiksha;" lines
    sqlString = sqlString.replace(/CREATE DATABASE IF NOT EXISTS rupiksha;/g, '');
    sqlString = sqlString.replace(/USE rupiksha;/g, '');

    // Split statements by semicolon
    const statements = sqlString.split(';').filter(s => s.trim() !== '');

    let executed = 0;
    let errors = 0;
    for (let statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          executed++;
        } catch (sErr) {
          console.warn(`Statement failed (possibly already exists): ${statement.substring(0, 50)}...`, sErr.message);
          errors++;
        }
      }
    }

    res.json({ success: true, message: `Database setup process finished.`, executed, errors_ignored: errors });
  } catch (err) {
    console.error("DB Setup Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── AUTH ROUTES ────────────────────────────────────────────────────────────

// POST /api/auth/login
// POST /api/auth/login
// POST /auth/login
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check both username and mobile
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, username]);

    if (rows.length === 0 || rows[0].status === 'INACTIVE') {
      return res.status(401).json({ error: "Invalid credentials or account inactive" });
    }

    const user = rows[0];
    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET, { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.full_name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        balance: user.balance || 0,
        pin: user.fingpay_pin || "1234",
        profile_kyc_status: user.profile_kyc_status,
        aeps_kyc_status: user.aeps_kyc_status,
        permissions: [], // Permissions can be added to a separate table later
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Alias for frontend compatibility
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const isNumeric = /^\d+$/.test(username);
    const [rows] = await pool.query(
      isNumeric
        ? "SELECT * FROM users WHERE mobile = ? OR id = ?"
        : "SELECT * FROM users WHERE username = ? OR email = ?",
      isNumeric ? [username, parseInt(username)] : [username, username]
    );
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    res.json({
      success: true,
      token,
      user: {
        ...user,
        name: user.full_name,
        mobile: user.mobile,
        balance: user.balance || 0,
        pin: user.fingpay_pin || "1234",
        profile_kyc_status: user.profile_kyc_status,
        aeps_kyc_status: user.aeps_kyc_status,
        merchant_id: user.merchant_id,
        aeps_rejection_reason: user.aeps_rejection_reason
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── DEBUG LOGIN (for testing) ────────────────────────────────────────────────
app.post("/debug-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[DEBUG LOGIN] Attempting login with username: ${username}`);

    const isNumeric = /^\d+$/.test(username);
    const [rows] = await pool.query(
      isNumeric
        ? "SELECT id, username, full_name, mobile, email, password_hash, role, status FROM users WHERE mobile = ? OR id = ?"
        : "SELECT id, username, full_name, mobile, email, password_hash, role, status FROM users WHERE username = ? OR email = ?",
      isNumeric ? [username, parseInt(username)] : [username, username]
    );

    if (rows.length === 0) {
      console.log(`[DEBUG LOGIN] No user found with username/mobile: ${username}`);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        debug: "No user found in database",
        searchedFor: username
      });
    }

    const user = rows[0];
    console.log(`[DEBUG LOGIN] Found user: ${user.username} (ID: ${user.id})`);
    console.log(`[DEBUG LOGIN] User status: ${user.status}`);
    console.log(`[DEBUG LOGIN] Stored hash exists: ${!!user.password_hash}`);

    // Try bcrypt comparison
    let validPass = false;
    try {
      validPass = await bcrypt.compare(password, user.password_hash);
      console.log(`[DEBUG LOGIN] Bcrypt comparison result: ${validPass}`);
    } catch (bcryptErr) {
      console.log(`[DEBUG LOGIN] Bcrypt error: ${bcryptErr.message}`);
      return res.status(401).json({
        success: false,
        error: "Password hash validation failed",
        debug: bcryptErr.message
      });
    }

    if (!validPass) {
      console.log(`[DEBUG LOGIN] Password incorrect for user: ${username}`);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        debug: "Password mismatch"
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    console.log(`[DEBUG LOGIN] Login successful for user: ${username}`);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.full_name,
        role: user.role,
        status: user.status,
        profile_kyc_status: user.profile_kyc_status,
        aeps_kyc_status: user.aeps_kyc_status,
        merchant_id: user.merchant_id,
        aeps_rejection_reason: user.aeps_rejection_reason
      },
      debug: "Login successful"
    });
  } catch (err) {
    console.error("[DEBUG LOGIN] Server error:", err);
    res.status(500).json({
      success: false,
      error: "Server error during login",
      debug: err.message
    });
  }
});

// ─── CREATE TEST USER (for quick testing) ────────────────────────────
app.post("/create-test-user", async (req, res) => {
  try {
    const testUsername = "testuser";
    const testPassword = "Test@123";
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Check if test user already exists
    const [existing] = await pool.query("SELECT id FROM users WHERE username = ?", [testUsername]);
    if (existing.length > 0) {
      return res.json({
        success: true,
        message: "Test user already exists",
        credentials: {
          username: testUsername,
          password: testPassword
        }
      });
    }

    // Create test user
    await pool.query(
      "INSERT INTO users (username, full_name, password_hash, email, mobile, role, status, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [testUsername, "Test User", hashedPassword, "test@rupiksha.com", "9999999999", "DISTRIBUTOR", "ACTIVE", "10000.00"]
    );

    res.json({
      success: true,
      message: "Test user created successfully",
      credentials: { username: testUsername, password: testPassword }
    });
  } catch (err) {
    console.error("Create test user error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── FORCE ADMIN CREATION (for emergency login fix) ────────────────────────────
app.get("/force-admin", async (req, res) => {
  try {
    const adminUser = "admin";
    const adminPass = "admin123";
    const hashed = await bcrypt.hash(adminPass, 10);

    // Update if exists, or insert if not
    await pool.query(
      "INSERT INTO users (username, full_name, password_hash, role, status, mobile, balance) " +
      "VALUES (?, ?, ?, 'ADMIN', 'ACTIVE', '0000000000', '100000.00') " +
      "ON DUPLICATE KEY UPDATE password_hash = ?, status = 'ACTIVE', role = 'ADMIN'",
      [adminUser, "Super Admin", hashed, hashed]
    );

    res.json({
      success: true,
      message: "Admin user has been forced to: admin / admin123"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── ADMIN & USER MANAGEMENT ROUTES ──────────────────────────────────────────

// GET /api/all-users
// GET /api/all-users
app.get("/all-users", async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, username, full_name, mobile, email, business_name, role, status, balance, profile_kyc_status, aeps_kyc_status, fathers_name, pan_number, aadhaar_number, address, city, state, pincode, alternate_mobile, merchant_id, aeps_rejection_reason, updated_at FROM users WHERE status != 'TRASH'");
    res.json({
      success: true,
      users: users.map(u => ({
        ...u,
        name: u.full_name,
        mobile: u.mobile,
        kycStatus: u.profile_kyc_status,
        aepsKycStatus: u.aeps_kyc_status,
        kycDate: u.updated_at,
        panCard: u.pan_number
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/trash-users
app.get("/trash-users", async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE status = 'TRASH'");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/user-docs/:identifier
app.get("/user-docs/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);
    const query = isNumeric ?
      "SELECT id, username, mobile, aadhaar_front, aadhaar_back, shop_selfie, pan_number FROM users WHERE id = ? OR mobile = ?" :
      "SELECT id, username, mobile, aadhaar_front, aadhaar_back, shop_selfie, pan_number FROM users WHERE username = ? OR email = ?";

    const [rows] = await pool.query(query, isNumeric ? [parseInt(identifier), identifier, identifier] : [identifier, identifier]);

    if (rows.length === 0) return res.status(404).json({ success: false, error: "User not found" });

    const user = rows[0];
    res.json({
      success: true,
      docs: {
        id: user.id,
        username: user.username,
        mobile: user.mobile,
        aadhaarFront: user.aadhaar_front,
        aadhaarBack: user.aadhaar_back,
        shopSelfie: user.shop_selfie,
        panCard: user.pan_number
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// GET /api/admin/pending-kyc
app.get("/admin/pending-kyc", async (req, res) => {
  try {
    const [kycs] = await pool.query(`
      SELECT pk.*, u.username as loginId, u.mobile as userMobile 
      FROM profile_kyc pk
      JOIN users u ON pk.user_id = u.id
      WHERE pk.status = 'PENDING'
      ORDER BY pk.created_at DESC
    `);
    res.json({ success: true, kycs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/pending-aeps-kyc
app.get("/admin/pending-aeps-kyc", async (req, res) => {
  try {
    const [kycs] = await pool.query(`
      SELECT ak.*, u.username as loginId
      FROM aeps_kyc ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.status = 'PENDING'
      ORDER BY ak.created_at DESC
    `);
    res.json({ success: true, kycs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/delete-user
app.post("/delete-user", async (req, res) => {
  try {
    const { username } = req.body;
    await pool.query("UPDATE users SET status = 'TRASH' WHERE username = ? OR email = ?", [username, username]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/restore-user
app.post("/restore-user", async (req, res) => {
  try {
    const { username } = req.body;
    await pool.query("UPDATE users SET status = 'ACTIVE' WHERE username = ? OR email = ?", [username, username]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/approve-user
app.post("/approve-user", async (req, res) => {
  try {
    const { username, password, status, partyCode, parent_id } = req.body;
    let query = "UPDATE users SET status = ?";
    let params = [status || 'ACTIVE'];

    if (password) {
      query += ", password_hash = ?";
      params.push(await bcrypt.hash(password, 10));
    }
    // Note: partyCode and parent_id columns might need adding if not in initial schema
    // For now we'll just update status and password
    const isNumeric = /^\d+$/.test(username);
    if (isNumeric) {
      query += " WHERE mobile = ? OR id = ?";
      params.push(username, parseInt(username));
    } else {
      query += " WHERE username = ? OR email = ?";
      params.push(username, username);
    }

    await pool.query(query, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/approve-kyc", async (req, res) => {
  try {
    const { username, type } = req.body;
    const identifier = username;
    const isNumeric = /^\d+$/.test(identifier);

    // Find internal ID first with type safety
    let uRows;
    if (isNumeric) {
      const [rows] = await pool.query("SELECT id FROM users WHERE id = ? OR mobile = ?", [parseInt(identifier), identifier]);
      uRows = rows;
    } else {
      const [rows] = await pool.query("SELECT id FROM users WHERE username = ? OR email = ?", [identifier, identifier]);
      uRows = rows;
    }

    if (uRows.length === 0) return res.status(404).json({ success: false, error: "User not found" });
    const userId = uRows[0].id;

    if (type === 'MAIN') {
      await pool.query("UPDATE users SET status = 'ACTIVE', profile_kyc_status = 'DONE' WHERE id = ?", [userId]);
      await pool.query("INSERT INTO profile_kyc (user_id, status, admin_remark) VALUES (?, 'APPROVED', 'Approved by Admin') ON DUPLICATE KEY UPDATE status='APPROVED', admin_remark='Approved by Admin'", [userId]);
    } else if (type === 'AEPS') {
      const { merchantId } = req.body;
      await pool.query("UPDATE users SET aeps_kyc_status = 'DONE', merchant_id = ? WHERE id = ?", [merchantId || null, userId]);
      await pool.query(
        "INSERT INTO aeps_kyc (user_id, status, merchant_id) VALUES (?, 'DONE', ?) ON DUPLICATE KEY UPDATE status='DONE', merchant_id=?",
        [userId, merchantId || null, merchantId || null]
      );
    }
    res.json({ success: true, message: 'KYC Approved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/reject-kyc", async (req, res) => {
  try {
    const { username, type, reason } = req.body;
    const identifier = username;
    const isNumeric = /^\d+$/.test(identifier);

    // Find internal ID with type safety
    let uRows;
    if (isNumeric) {
      const [rows] = await pool.query("SELECT id FROM users WHERE id = ? OR mobile = ?", [parseInt(identifier), identifier]);
      uRows = rows;
    } else {
      const [rows] = await pool.query("SELECT id FROM users WHERE username = ? OR email = ?", [identifier, identifier]);
      uRows = rows;
    }

    if (uRows.length === 0) return res.status(404).json({ success: false, error: "User not found" });
    const userId = uRows[0].id;

    if (type === 'MAIN') {
      await pool.query("UPDATE users SET profile_kyc_status = 'REJECTED' WHERE id = ?", [userId]);
      await pool.query("INSERT INTO profile_kyc (user_id, status, admin_remark) VALUES (?, 'REJECTED', ?) ON DUPLICATE KEY UPDATE status='REJECTED', admin_remark=?", [userId, reason, reason]);
    } else if (type === 'AEPS') {
      await pool.query("UPDATE users SET aeps_kyc_status = 'REJECTED', aeps_rejection_reason = ? WHERE id = ?", [reason || 'Details Mismatch', userId]);
      await pool.query("INSERT INTO aeps_kyc (user_id, status, rejection_reason) VALUES (?, 'REJECTED', ?) ON DUPLICATE KEY UPDATE status='REJECTED', rejection_reason=?", [userId, reason, reason]);
    }
    res.json({ success: true, message: 'KYC Rejected' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/submit-aeps-kyc
app.post("/submit-aeps-kyc", async (req, res) => {
  try {
    const { userId, merchantName, shopName, pan, aadhaar, city, state, pincode, mobile } = req.body;

    // Generate a unique Merchant ID
    const merchantId = "MCH" + Math.floor(100000 + Math.random() * 900000);

    const identifier = userId || mobile;
    const isNumeric = /^\d+$/.test(identifier);

    if (isNumeric) {
      await pool.query(
        `UPDATE users SET aeps_kyc_status = 'PENDING', merchant_id = ?, aeps_rejection_reason = NULL WHERE id = ? OR mobile = ?`,
        [merchantId, parseInt(identifier), identifier]
      );
    } else {
      await pool.query(
        `UPDATE users SET aeps_kyc_status = 'PENDING', merchant_id = ?, aeps_rejection_reason = NULL WHERE username = ? OR email = ?`,
        [merchantId, identifier, identifier]
      );
    }

    // Sync to aeps_kyc table
    const [uGet] = await pool.query("SELECT id FROM users WHERE " + (isNumeric ? "id = ?" : "username = ?"), [isNumeric ? parseInt(identifier) : identifier]);
    if (uGet.length > 0) {
      const dbUserId = uGet[0].id;
      await pool.query(
        `INSERT INTO aeps_kyc (user_id, merchant_name, shop_name, pan, aadhaar, city, state, pincode, mobile, merchant_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
         ON DUPLICATE KEY UPDATE status='PENDING', merchant_id=VALUES(merchant_id), created_at=NOW()`,
        [dbUserId, merchantName, shopName, pan, aadhaar, city, state, pincode, mobile, merchantId]
      );
    }

    res.json({ success: true, merchantId, message: "AEPS KYC submitted and Merchant ID generated. Pending approval." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/submit-profile-kyc
app.post("/submit-profile-kyc", async (req, res) => {
  try {
    const {
      userId, fullName, fathersName, shopName, shopAddress,
      city, state, pincode, panNumber, aadhaarNumber,
      alternateMobile, email, aadhaarFront, aadhaarBack, shopSelfie
    } = req.body;

    const identifier = userId;
    const isNumeric = /^\d+$/.test(identifier);

    const query = isNumeric ?
      `UPDATE users SET 
        full_name = ?, fathers_name = ?, business_name = ?, 
        address = ?, pan_number = ?, aadhaar_number = ?,
        alternate_mobile = ?, email = ?,
        aadhaar_front = ?, aadhaar_back = ?, shop_selfie = ?,
        city = ?, state = ?, pincode = ?,
        profile_kyc_status = 'PENDING' 
       WHERE id = ? OR mobile = ?` :
      `UPDATE users SET 
        full_name = ?, fathers_name = ?, business_name = ?, 
        address = ?, pan_number = ?, aadhaar_number = ?,
        alternate_mobile = ?, email = ?,
        aadhaar_front = ?, aadhaar_back = ?, shop_selfie = ?,
        city = ?, state = ?, pincode = ?,
        profile_kyc_status = 'PENDING' 
       WHERE username = ? OR email = ?`;

    const params = [
      fullName, fathersName, shopName, shopAddress, panNumber, aadhaarNumber,
      alternateMobile, email, aadhaarFront, aadhaarBack, shopSelfie,
      city, state, pincode
    ];

    if (isNumeric) {
      params.push(parseInt(identifier), identifier);
    } else {
      params.push(identifier, identifier);
    }

    // 1. Update main users table
    await pool.query(query, params);

    // 2. Insert into dedicated profile_kyc table for history and tracking
    const [uGet] = await pool.query("SELECT id FROM users WHERE " + (isNumeric ? "id = ?" : "username = ?"), [isNumeric ? parseInt(identifier) : identifier]);
    if (uGet.length > 0) {
      const dbUserId = uGet[0].id;
      await pool.query(
        `INSERT INTO profile_kyc (
          user_id, full_name, fathers_name, business_name, address, pan_number, 
          aadhaar_number, alternate_mobile, email, aadhaar_front, aadhaar_back, 
          shop_selfie, city, state, pincode, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
        ON DUPLICATE KEY UPDATE 
          full_name=VALUES(full_name), fathers_name=VALUES(fathers_name), 
          business_name=VALUES(business_name), address=VALUES(address),
          pan_number=VALUES(pan_number), aadhaar_number=VALUES(aadhaar_number),
          status='PENDING', created_at=NOW()`,
        [
          dbUserId, fullName, fathersName, shopName, shopAddress, panNumber,
          aadhaarNumber, alternateMobile, email, aadhaarFront, aadhaarBack,
          shopSelfie, city, state, pincode
        ]
      );
    }

    res.json({ success: true, message: "KYC submitted successfully and is pending approval." });
  } catch (err) {
    console.error("KYC submission error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



// POST /api/update-user-role
app.post("/update-user-role", async (req, res) => {
  try {
    const { username, newRole } = req.body;
    const isNumeric = /^\d+$/.test(username);
    const query = isNumeric
      ? "UPDATE users SET role = ? WHERE mobile = ? OR id = ?"
      : "UPDATE users SET role = ? WHERE username = ? OR email = ?";
    await pool.query(query, isNumeric ? [newRole, username, parseInt(username)] : [newRole, username, username]);
    res.json({ success: true, role: newRole });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── WALLET & TRANSACTION ROUTES ─────────────────────────────────────────────

// POST /api/get-balance
// POST /api/get-balance
app.post("/get-balance", async (req, res) => {
  try {
    const identifier = req.body.userId || req.body.username;
    if (!identifier) return res.status(400).json({ success: false, error: "userId or username required" });

    const isNumeric = /^\d+$/.test(identifier);
    let rows;
    if (isNumeric) {
      const [results] = await pool.query("SELECT id, balance, role FROM users WHERE id = ? OR mobile = ?", [parseInt(identifier), identifier]);
      rows = results;
    } else {
      const [results] = await pool.query("SELECT id, balance, role FROM users WHERE username = ? OR email = ?", [identifier, identifier]);
      rows = results;
    }

    let venusBalance = "0.00";
    if (rows.length > 0) {
      // Fetch real balance from Venus account
      try {
        const venusRes = await fetch('https://venusrecharge.co.in/Balance.aspx?authkey=10092&authpass=RUPIKSHA@816&service=recharge');
        const venusText = await venusRes.text();
        const match = venusText.match(/<Balance>(.*?)<\/Balance>/);
        if (match) venusBalance = match[1];
      } catch (ve) {
        console.error("Venus balance fetch failed:", ve.message);
      }
    }

    res.json({
      success: true,
      balance: rows.length > 0 ? rows[0].balance : "0.00",
      venus_balance: venusBalance
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/transactions
app.get("/transactions", async (req, res) => {
  try {
    const { userId } = req.query;
    // Find internal numeric ID first if username/mobile passed
    const isNumeric = /^\d+$/.test(userId);
    let uRows;
    if (isNumeric) {
      const [results] = await pool.query("SELECT id FROM users WHERE id = ? OR mobile = ?", [parseInt(userId), userId]);
      uRows = results;
    } else {
      const [results] = await pool.query("SELECT id FROM users WHERE username = ? OR email = ?", [userId, userId]);
      uRows = results;
    }
    if (uRows.length === 0) return res.json({ success: true, transactions: [] });

    const [txns] = await pool.query("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC", [uRows[0].id]);
    res.json({ success: true, transactions: txns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/all-transactions
app.get("/all-transactions", async (req, res) => {
  try {
    const [txns] = await pool.query("SELECT t.*, u.username as userName FROM transactions t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC LIMIT 500");
    res.json({ success: true, transactions: txns });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/kyc-status
app.get("/kyc-status", async (req, res) => {
  try {
    const { userId } = req.query;
    const isNumeric = /^\d+$/.test(userId);
    let rows;
    if (isNumeric) {
      const [results] = await pool.query("SELECT profile_kyc_status, aeps_kyc_status FROM users WHERE id = ? OR mobile = ?", [parseInt(userId), userId]);
      rows = results;
    } else {
      const [results] = await pool.query("SELECT profile_kyc_status, aeps_kyc_status FROM users WHERE username = ? OR email = ?", [userId, userId]);
      rows = results;
    }
    const user = rows[0];
    const docs = [
      { name: 'Profile KYC', status: user ? user.profile_kyc_status : 'NOT_DONE' },
      { name: 'AEPS KYC', status: user ? user.aeps_kyc_status : 'NOT_DONE' }
    ];
    res.json({ success: true, documents: docs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/portal-config
app.get("/portal-config", (req, res) => {
  res.json({ success: true, config: { maintenance: false, notice: "Welcome to Rupiksha!" } });
});

// GET /api/commissions
app.get("/commissions", (req, res) => {
  res.json({ success: true, commissions: [] });
});

// POST /api/auth/logout
app.post("/auth/logout", authMiddleware, (req, res) => {
  // JWT is stateless — client deletes token
  res.json({ success: true });
});

// ─── DASHBOARD ROUTES ────────────────────────────────────────────────────────

// GET /api/dashboard/topbar
app.get("/dashboard/topbar", authMiddleware, async (req, res) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT 
        SUM(balance) as wallet,
        (SELECT SUM(commission) FROM transactions WHERE status = 'SUCCESS') as commission
      FROM users
    `);
    res.json({ charges: 0, commission: stats.commission || 0, wallet: stats.wallet || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/dashboard/live
app.get("/dashboard/live", authMiddleware, async (req, res) => {
  try {
    const [[userStats]] = await pool.query("SELECT COUNT(*) as total, SUM(status='ACTIVE') as active, SUM(status='PENDING') as pending FROM users");
    const [[walletStats]] = await pool.query("SELECT SUM(balance) as total, (SELECT COUNT(*) FROM fund_requests WHERE status='PENDING') as fundRequest FROM users");

    const [recentTxns] = await pool.query(`
      SELECT t.*, u.full_name as userName 
      FROM transactions t 
      LEFT JOIN users u ON t.user_id = u.id 
      ORDER BY t.created_at DESC LIMIT 10
    `);

    res.json({
      charges: 0,
      commission: 0,
      wallet: walletStats.total || 0,
      users: { total: userStats.total, active: userStats.active || 0, pending: userStats.pending || 0 },
      walletStats: { total: walletStats.total || 0, fundRequest: walletStats.fundRequest || 0, locked: 0 },
      recentTransactions: recentTxns
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── LOAN MANAGEMENT ROUTES ──────────────────────────────────────────────────

// GET /api/loans
app.get("/loans", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT l.name, l.mobile, la.reference_id, la.status,
             la.offer_amount, la.lender_name,
             la.interest_rate, la.updated_at, la.id as app_id,
             l.tracking_id
      FROM loan_applications la
      JOIN loan_leads l ON la.lead_id = l.id
      ORDER BY la.id DESC
    `);
    res.json({ success: true, loans: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/loans/simulate
app.post("/loans/simulate", async (req, res) => {
  try {
    const { tracking_id, status } = req.body;

    // Simulate what the PHP webhook does
    const referenceId = 'SIM_' + Math.floor(Math.random() * 900000 + 100000);
    const amount = status === 'approved' ? '75000' : null;
    const lender_name = status === 'approved' ? 'HDFC Bank' : null;
    const interest_rate = status === 'approved' ? '12.5%' : null;

    // 1. Find the lead_id
    const [leads] = await pool.query("SELECT id FROM loan_leads WHERE tracking_id = ?", [tracking_id]);
    if (leads.length === 0) return res.status(404).json({ success: false, message: "Lead not found" });
    const leadId = leads[0].id;

    // 2. Update or Insert loan_application
    // We'll use a transaction or a check-then-upsert logic
    const [existing] = await pool.query("SELECT id FROM loan_applications WHERE lead_id = ?", [leadId]);

    if (existing.length > 0) {
      await pool.query(`
        UPDATE loan_applications 
        SET status = ?, reference_id = ?, offer_amount = ?, lender_name = ?, interest_rate = ?, updated_at = NOW()
        WHERE lead_id = ?
      `, [status, referenceId, amount, lender_name, interest_rate, leadId]);
    } else {
      await pool.query(`
        INSERT INTO loan_applications (lead_id, status, reference_id, offer_amount, lender_name, interest_rate)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [leadId, status, referenceId, amount, lender_name, interest_rate]);
    }

    res.json({ success: true, message: `Loan ${status} successfully (Simulated)` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/log-txn  — record a transaction
// POST /api/log-txn — record a transaction and update balance
app.post("/log-txn", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { userId, service, amount, operator, number, status, commission, charges, description, merchant_ref, operator_txn_id } = req.body;

    await connection.beginTransaction();

    // 1. Find User ID
    const isNumeric = /^\d+$/.test(userId);
    const [uRows] = await connection.query(
      isNumeric ? "SELECT id, balance FROM users WHERE id = ? OR mobile = ?" : "SELECT id, balance FROM users WHERE username = ? OR email = ?",
      isNumeric ? [parseInt(userId), userId] : [userId, userId]
    );
    if (uRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const internalUserId = uRows[0].id;
    const currentBalance = parseFloat(uRows[0].balance) || 0;
    const txnAmount = parseFloat(amount) || 0;

    // 2. Insert Transaction
    const [tResult] = await connection.query(
      "INSERT INTO transactions (user_id, type, amount, operator, number, status, description, merchant_ref, operator_txn_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [internalUserId, (service || 'OTHER').toUpperCase(), txnAmount, operator, number, status || 'SUCCESS', description, merchant_ref, operator_txn_id]
    );

    // 3. Update Balance if SUCCESS
    if (status === 'SUCCESS' || status === 'SAC' || status === 'TXN') {
      const newBalance = currentBalance - txnAmount;
      await connection.query("UPDATE users SET balance = ? WHERE id = ?", [newBalance, internalUserId]);

      // Log wallet change
      await connection.query(
        "INSERT INTO wallet_logs (user_id, amount, type, reason, reference_id, balance_after) VALUES (?, ?, 'DEBIT', ?, ?, ?)",
        [internalUserId, txnAmount, service || 'Transaction', tResult.insertId, newBalance]
      );
    }

    await connection.commit();
    res.json({ success: true, txnId: tResult.insertId });
  } catch (err) {
    await connection.rollback();
    console.error("Log-txn error:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    connection.release();
  }
});

// POST /api/contact — Home page contact form
app.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    await pool.query(
      "INSERT INTO contact_inquiries (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name, email, subject, message]
    );
    res.json({ success: true, message: "Message sent successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/dashboard/stats
app.get("/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    // 1. User stats
    const [[userStats]] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(status = 'ACTIVE') as active,
        SUM(status = 'INACTIVE') as inactive
      FROM users
    `);

    // 2. KYC stats (Simplified)
    const [[kycStats]] = await pool.query(`
      SELECT 
        SUM(status = 'ACTIVE') as done,
        SUM(status = 'INACTIVE') as pending,
        SUM(status = 'TRASH') as rejected
      FROM users
    `);

    // 3. Wallet stats
    const [[walletStats]] = await pool.query(`
      SELECT 
        IFNULL(SUM(balance), 0) as total,
        (SELECT COUNT(*) FROM fund_requests WHERE status = 'PENDING') as fundRequest,
        0 as locked -- Placeholder
      FROM users
    `);

    const getTxnStats = async (type) => {
      const today = new Date().toISOString().split("T")[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

      const [[stats]] = await pool.query(`
        SELECT 
          COUNT(CASE WHEN DATE(created_at) = ? THEN 1 END) as todayTxn,
          SUM(CASE WHEN DATE(created_at) = ? THEN amount ELSE 0 END) as todayAmt,
          COUNT(CASE WHEN DATE(created_at) >= ? THEN 1 END) as monthlyTxn,
          SUM(CASE WHEN DATE(created_at) >= ? THEN amount ELSE 0 END) as monthlyAmt,
          SUM(CASE WHEN DATE(created_at) = ? THEN commission ELSE 0 END) as todayComm,
          SUM(CASE WHEN DATE(created_at) >= ? THEN commission ELSE 0 END) as monthlyComm
        FROM transactions 
        WHERE type = ? AND status = 'SUCCESS'
      `, [today, today, monthStart, monthStart, today, monthStart, type]);

      return stats || { todayTxn: 0, todayAmt: 0, monthlyTxn: 0, monthlyAmt: 0, todayComm: 0, monthlyComm: 0 };
    };

    res.json({
      users: {
        total: userStats.total || 0,
        active: userStats.active || 0,
        inactive: userStats.inactive || 0
      },
      kyc: { done: kycStats.done || 0, notDone: 0, pending: kycStats.pending || 0 },
      aepsKyc: { done: 0, notDone: 0, pending: 0 },
      wallet: {
        total: walletStats.total || 0,
        fundRequest: walletStats.fundRequest || 0,
        locked: walletStats.locked || 0
      },
      aeps: await getTxnStats("AEPS"),
      payout: await getTxnStats("PAYOUT"),
      cms: await getTxnStats("CMS"),
      dmt: await getTxnStats("DMT"),
      bharatConnect: await getTxnStats("BHARAT_CONNECT"),
      otherService: await getTxnStats("OTHER")
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── EMPLOYEE ROUTES ─────────────────────────────────────────────────────────

// GET /api/employees
app.get("/employees", authMiddleware, async (req, res) => {
  try {
    const [employees] = await pool.query(`
      SELECT e.*, (SELECT COUNT(*) FROM users u WHERE u.created_by = e.id) as totalUsers
      FROM users e
      WHERE e.role IN ('NATIONAL', 'STATE', 'REGIONAL')
    `);
    res.json(employees);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/employees/:id
app.get("/employees/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const isNumeric = /^\d+$/.test(id);
    const query = isNumeric ?
      "SELECT id, username, full_name, mobile, email, role, status FROM users WHERE id = ?" :
      "SELECT id, username, full_name, mobile, email, role, status FROM users WHERE username = ?";
    const [rows] = await pool.query(query, [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/employees/create
app.post("/employees/create", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, password, pin, fullName, mobile, email, address, role, territory } = req.body;
    const hashedPass = await bcrypt.hash(password || 'password123', 10);

    const [result] = await pool.query(
      "INSERT INTO users (username, password_hash, full_name, mobile, email, role, status, created_by) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?)",
      [username || mobile, hashedPass, fullName, mobile, email, role || 'RETAILER', req.user.id]
    );

    if (email) {
      try {
        await transporter.sendMail({
          from: `"RuPiKsha" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Your Login Credentials`,
          html: `<h3>Welcome to RuPiKsha</h3><p>Login ID: ${username || mobile}</p><p>Password: ${password || 'password123'}</p>`
        });
      } catch (mErr) { console.error("Mail error:", mErr.message); }
    }

    res.json({ success: true, id: result.insertId, message: "User created" });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// PUT /api/employees/:id
app.put("/employees/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { fullName, mobile, email } = req.body;
    const id = req.params.id;
    const isNumeric = /^\d+$/.test(id);
    const query = isNumeric ?
      "UPDATE users SET full_name = ?, mobile = ?, email = ? WHERE id = ?" :
      "UPDATE users SET full_name = ?, mobile = ?, email = ? WHERE username = ?";
    await pool.query(query, [fullName, mobile, email, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/employees/:id/toggle-status
app.put("/employees/:id/toggle-status", authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    const isNumeric = /^\d+$/.test(id);
    const query = isNumeric ?
      "UPDATE users SET status = IF(status='ACTIVE', 'INACTIVE', 'ACTIVE') WHERE id = ?" :
      "UPDATE users SET status = IF(status='ACTIVE', 'INACTIVE', 'ACTIVE') WHERE username = ?";
    await pool.query(query, [id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PERMISSIONS ROUTES ───────────────────────────────────────────────────────
app.get("/employees/:id/permissions", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const isNumeric = /^\d+$/.test(id);
    const query = isNumeric ?
      "SELECT module_name as module, action_name as action, is_allowed as allowed FROM permissions WHERE user_id = ?" :
      "SELECT p.module_name as module, p.action_name as action, p.is_allowed as allowed FROM permissions p JOIN users u ON p.user_id = u.id WHERE u.username = ?";
    const [perms] = await pool.query(query, [id]);
    res.json(perms);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/employees/:id/permissions", authMiddleware, adminOnly, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { permissions } = req.body;
    const id = req.params.id;
    const isNumeric = /^\d+$/.test(id);
    let userId = id;
    if (!isNumeric) {
      const [uRows] = await connection.query("SELECT id FROM users WHERE username = ?", [id]);
      if (uRows.length === 0) throw new Error("User not found");
      userId = uRows[0].id;
    }
    await connection.beginTransaction();
    await connection.query("DELETE FROM permissions WHERE user_id = ?", [userId]);
    if (permissions && permissions.length > 0) {
      for (const p of permissions) {
        await connection.query("INSERT INTO permissions (user_id, module_name, action_name, is_allowed) VALUES (?, ?, ?, ?)", [userId, p.module, p.action, p.allowed]);
      }
    }
    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally { if (connection) connection.release(); }
});

// ─── LOCATION ROUTES ─────────────────────────────────────────────────────────
app.put("/location/update", authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    await pool.query(
      "INSERT INTO user_locations (user_id, latitude, longitude) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE latitude=?, longitude=?, recorded_at=NOW()",
      [req.user.id, latitude, longitude, latitude, longitude]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/location/all", authMiddleware, async (req, res) => {
  try {
    const [locations] = await pool.query(`
      SELECT l.*, u.full_name, u.role
      FROM user_locations l
      JOIN users u ON l.user_id = u.id
      WHERE l.recorded_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ORDER BY l.recorded_at DESC
    `);
    res.json(locations);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── OTP & EMAIL ROUTES ──────────────────────────────────────────────────────

// POST /send-approval — Approval email with credentials
app.post("/send-approval", async (req, res) => {
  try {
    const { to, name, login_id, password, id_label, id_value, portal_type } = req.body;
    if (!to) return res.status(400).json({ success: false, error: "Email 'to' is required" });

    await transporter.sendMail({
      from: `"RuPiKsha Fintech" <${process.env.EMAIL_USER}>`,
      to,
      subject: `✅ ${portal_type || 'Account'} Approved — RuPiKsha`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#064e3b,#115e59);padding:28px 32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">Account Approved ✅</h1>
            <p style="color:#6ee7b7;margin:6px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase">${portal_type || 'Retailer'} Portal</p>
          </div>
          <div style="padding:28px 32px">
            <p style="color:#334155;font-size:15px">Hello <strong>${name || 'User'}</strong>,</p>
            <p style="color:#64748b;font-size:14px">Your account has been approved. Here are your login credentials:</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <tr><td style="padding:10px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px">Access Link</td><td style="padding:10px 0;font-weight:700;color:#0f172a;text-align:right"><a href="https://portal.rupiksha.in" style="color:#0d9488">portal.rupiksha.in</a></td></tr>
              <tr style="border-top:1px solid #f1f5f9"><td style="padding:10px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px">Login ID</td><td style="padding:10px 0;font-weight:700;color:#0f172a;text-align:right">${login_id || ''}</td></tr>
              <tr style="border-top:1px solid #f1f5f9"><td style="padding:10px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px">Password</td><td style="padding:10px 0;font-weight:700;color:#0f172a;text-align:right;background:#fef9c3;border-radius:6px;padding-right:8px">${password || ''}</td></tr>
              ${id_label ? `<tr style="border-top:1px solid #f1f5f9"><td style="padding:10px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px">${id_label}</td><td style="padding:10px 0;font-weight:700;color:#0f172a;text-align:right">${id_value || ''}</td></tr>` : ''}
            </table>
            <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:24px">This is a system-generated email from RuPiKsha Fintech.</p>
          </div>
        </div>
      `
    });

    res.json({ success: true, message: "Approval email sent" });
  } catch (err) {
    console.error("❌ [send-approval] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /send-credentials — Send login credentials to a new user
app.post("/send-credentials", async (req, res) => {
  try {
    const { to, name, login_id, password, pin, added_by, portal_type } = req.body;
    if (!to) return res.status(400).json({ success: false, error: "Email 'to' is required" });

    await transporter.sendMail({
      from: `"RuPiKsha Fintech" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🔑 Your ${portal_type || 'Account'} Credentials — RuPiKsha`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#1e3a5f,#0f172a);padding:28px 32px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:22px">Welcome to RuPiKsha 🎉</h1>
            <p style="color:#94a3b8;margin:6px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase">${portal_type || 'Retailer'} Account Created</p>
          </div>
          <div style="padding:28px 32px">
            <p style="color:#334155;font-size:15px">Hello <strong>${name || 'User'}</strong>,</p>
            <p style="color:#64748b;font-size:14px">Your account has been created${added_by ? ` by <strong>${added_by}</strong>` : ''}. Here are your login details:</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <tr><td style="padding:10px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px">Login ID</td><td style="padding:10px 0;font-weight:700;color:#0f172a;text-align:right">${login_id || ''}</td></tr>
              <tr style="border-top:1px solid #f1f5f9"><td style="padding:10px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px">Password</td><td style="padding:10px 0;font-weight:700;color:#0f172a;text-align:right;background:#fef9c3;border-radius:6px;padding-right:8px">${password || ''}</td></tr>
              ${pin ? `<tr style="border-top:1px solid #f1f5f9"><td style="padding:10px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px">Security PIN</td><td style="padding:10px 0;font-weight:700;color:#0f172a;text-align:right">${pin}</td></tr>` : ''}
              <tr style="border-top:1px solid #f1f5f9"><td style="padding:10px 0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1px">Portal</td><td style="padding:10px 0;font-weight:700;color:#0d9488;text-align:right"><a href="https://portal.rupiksha.in" style="color:#0d9488">portal.rupiksha.in</a></td></tr>
            </table>
            <p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:24px">This is a system-generated email from RuPiKsha Fintech.</p>
          </div>
        </div>
      `
    });

    res.json({ success: true, message: "Credentials email sent" });
  } catch (err) {
    console.error("❌ [send-credentials] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /send-admin-otp — Send OTP for admin login
app.post("/send-admin-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: Date.now() + 120000 }); // 2 min expiry

    await transporter.sendMail({
      from: `"RuPiKsha Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Admin Login OTP — RuPiKsha",
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:400px;margin:auto;text-align:center;padding:40px 30px;border:1px solid #e2e8f0;border-radius:16px">
          <h2 style="color:#064e3b;margin:0 0 8px">Admin Login OTP</h2>
          <p style="color:#64748b;font-size:13px;margin:0 0 24px">Use this code to access the Headquarters panel</p>
          <h1 style="font-size:48px;color:#0f172a;letter-spacing:8px;margin:0 0 24px;font-family:monospace">${otp}</h1>
          <p style="color:#94a3b8;font-size:11px">Valid for 2 minutes. Do not share this code.</p>
        </div>
      `
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("❌ [send-admin-otp] Error:", err.message);
    res.status(500).json({ error: "Failed to send OTP: " + err.message });
  }
});

app.post("/send-otp", async (req, res) => {
  try {
    const { email, otp: clientOtp } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const otp = clientOtp || Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 300000); // 5 mins

    await pool.query("INSERT INTO otp_store (identifier, otp, expires_at) VALUES (?, ?, ?)", [email, otp, expires]);

    await transporter.sendMail({
      from: `"RuPiKsha Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Verification",
      html: `<h1>${otp}</h1>`
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const [rows] = await pool.query("SELECT * FROM otp_store WHERE identifier = ? AND otp = ? AND expires_at > NOW()", [email, otp]);
    if (rows.length > 0) {
      await pool.query("DELETE FROM otp_store WHERE identifier = ?", [email]);
      return res.json({ success: true });
    }
    res.status(400).json({ error: "Invalid or expired OTP" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── IDENTITY VERIFICATION ROUTES (Cashfree) ─────────────────────────────────
app.post("/verify-pan", async (req, res) => {
  const { pan } = req.body;
  if (!pan || pan.length !== 10) {
    return res.status(400).json({ success: false, message: "Enter a valid 10-digit PAN" });
  }

  try {
    console.log(`📡 [PROD] Verifying PAN: ${pan} via Cashfree...`);
    const response = await axios.post("https://api.cashfree.com/verification/pan",
      { pan },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID, // Use AppID for Verification
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    const result = response.data;
    console.log("✅ [PAN] Cashfree Result:", result);

    if (result.status === "SUCCESS" || result.valid === true) {
      res.json({
        success: true,
        name: result.name_at_pan || result.registered_name || result.name || "VERIFIED PAN USER",
        data: result
      });
    } else {
      res.status(400).json({ success: false, message: result.message || "Invalid PAN" });
    }
  } catch (err) {
    const apiError = err.response?.data?.message || err.message;
    console.error("❌ [PAN] Cashfree Error Details:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      message: `Cashfree PAN Verification failed: ${apiError}`
    });
  }
});

app.post("/verify-aadhaar", async (req, res) => {
  const { aadhaar } = req.body;
  if (!aadhaar || aadhaar.length !== 12) return res.status(400).json({ success: false, message: "Invalid Aadhaar number" });

  try {
    console.log(`📡 [PROD] Verifying Aadhaar: ${aadhaar} via Cashfree...`);
    const response = await axios.post("https://api.cashfree.com/verification/aadhaar",
      { aadhaar_number: aadhaar },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID, // Use AppID for Aadhaar Lite
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    res.json({ success: true, data: response.data });
  } catch (err) {
    const apiError = err.response?.data?.message || err.message;
    console.error("❌ [AADHAAR] Cashfree Error:", apiError);
    res.status(err.response?.status || 500).json({ success: false, message: `Cashfree Error: ${apiError}` });
  }
});

// Helper for sending SMS via Fast2SMS
const sendSMS = async (mobile, message) => {
  if (!process.env.FAST2SMS_KEY) {
    console.warn("⚠️ No FAST2SMS_KEY in .env, skipping SMS...");
    return false;
  }
  try {
    const response = await axios.get(`https://www.fast2sms.com/dev/bulkV2`, {
      params: {
        authorization: process.env.FAST2SMS_KEY,
        route: "v3",
        sender_id: "TXTIND",
        message: message,
        language: "english",
        flash: 0,
        numbers: mobile,
      },
    });
    console.log(`✅ SMS Response to ${mobile}:`, response.data);
    return response.data.return === true;
  } catch (err) {
    console.error("❌ Fast2SMS Error:", err.response?.data || err.message);
    return false;
  }
};

// Added for REAL 1-step Biometric verification
app.post("/verify-aadhaar-biometric", async (req, res) => {
  const { aadhaar, pidData, mobile } = req.body;
  if (!aadhaar || !pidData) {
    return res.status(400).json({ success: false, message: "Aadhaar and Biometric (PID) data required" });
  }

  try {
    console.log(`📡 [PROD] Biometric Verification for Aadhaar: ${aadhaar} via Cashfree...`);

    // REAL CALL to Cashfree Aadhaar E-KYC Biometric (Using AppID/SecretKey for E-KYC)
    const response = await axios.post("https://api.cashfree.com/verification/aadhaar/biometric",
      {
        aadhaar_number: aadhaar,
        pid_data: pidData // XML from Mantra RD service
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID, // E-KYC uses the 'AppID' set
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json"
        },
        timeout: 25000
      }
    );

    const result = response.data;
    console.log("✅ [KYC] Biometric Success:", result);

    // If biometric passes, we follow with OTP for 2-factor (DigiLocker style)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(aadhaar, { otp, expires: Date.now() + 300000 });

    const targetMobile = mobile || (result.mobile_number) || '9876543210';
    console.log(`📤 Sending OTP to ${targetMobile}...`);
    await sendSMS(targetMobile, `Your Aadhaar DigiLocker Verification OTP is ${otp}. Valid for 5 minutes. - RuPiKsha`);

    res.json({
      success: true,
      message: "Biometric matched. OTP sent to your registered mobile.",
      sentTo: targetMobile,
      aadhaarReference: result.ref_id || "AD-" + Date.now()
    });
  } catch (err) {
    const apiError = err.response?.data?.message || err.message;
    console.error("❌ [KYC] Biometric Error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      success: false,
      message: `Cashfree Biometric Error: ${apiError}`
    });
  }
});

// REAL DIGILOCKER CONNECT (CASHFREE)
app.post("/verify-aadhaar-digilocker", async (req, res) => {
  try {
    const { aadhaar } = req.body;
    console.log(`📡 [PROD] Creating DigiLocker Session via Cashfree...`);

    const response = await axios.post("https://api.cashfree.com/verification/digital-locker",
      {
        verification_id: "VDL_" + Date.now(),
        redirect_url: "https://rupiksha.com/kyc-callback",
        user_flow: "signin",
        document_requested: ["AADHAAR", "PAN"]
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    res.json({ success: true, url: response.data.url });
  } catch (err) {
    console.error("❌ [DigiLocker] Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Could not connect to DigiLocker API" });
  }
});

app.post("/verify-aadhaar-biometric-otp", async (req, res) => {
  const { aadhaar, otp } = req.body;
  const stored = otpStore.get(aadhaar);

  if (stored && stored.otp === otp && Date.now() < stored.expires) {
    otpStore.delete(aadhaar);
    return res.json({
      success: true,
      data: {
        name: "OM DUBEY",
        dob: "15/06/1998",
        gender: "MALE",
        address: "FLAT NO 402, SHANTI APARTMENT, B-BLOCK, SECTOR 18, NOIDA, UP - 201301",
        pincode: "201301",
        state: "UTTAR PRADESH",
        city: "NOIDA"
      }
    });
  }
  res.status(400).json({ success: false, message: "Invalid or expired OTP" });
});

app.post("/verify-admin-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);
    if (stored && stored.otp === otp && Date.now() < stored.expires) {
      otpStore.delete(email);

      const [rows] = await pool.query("SELECT * FROM users WHERE username = 'admin' OR email = ?", [email]);
      const user = rows[0];
      if (!user) return res.status(404).json({ error: "Admin user not found" });

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "8h" });

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.full_name,
          role: user.role,
          balance: parseFloat(user.balance) || 0
        }
      });
    }
    res.status(400).json({ error: "Invalid or expired OTP" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ALIAS & MISSING ROUTES ──────────────────────────────────────────────────

// Health check
app.get("/health", (req, res) => res.json({ success: true, status: "OK" }));
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Rupiksha Backend Running 🚀"
  });
});

// SuperAdmin OTP alias (frontend calls /api/request-otp)
app.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 120000 });
  try {
    await transporter.sendMail({
      from: `"RuPiKsha Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Admin Login OTP - RuPiKsha",
      html: `<div style="font-family:Arial;padding:30px;text-align:center"><h2>Your OTP</h2><h1 style="font-size:48px;color:#0f172a;letter-spacing:8px">${otp}</h1><p>Valid for 2 minutes</p></div>`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Forgot password
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(404).json({ error: "Email not found" });
    const user = rows[0];

    const tempPass = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(tempPass, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, user.id]);

    await transporter.sendMail({
      from: `"RuPiKsha" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset - RuPiKsha",
      html: `<p>Your temporary password is: <b>${tempPass}</b></p>`
    });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Failed to reset password" }); }
});

// My retailers by parent
app.get("/my-retailers", async (req, res) => {
  try {
    const { parentId } = req.query;
    if (!parentId) return res.status(400).json({ success: false, error: "parentId is required" });

    const isNumeric = /^\d+$/.test(parentId);
    let internalParentId = parentId;

    if (!isNumeric) {
      const [uRows] = await pool.query("SELECT id FROM users WHERE username = ? OR email = ?", [parentId, parentId]);
      if (uRows.length === 0) return res.json({ success: true, users: [] });
      internalParentId = uRows[0].id;
    }

    const [users] = await pool.query(
      "SELECT id, full_name as name, mobile, role, status, balance, created_at FROM users WHERE created_by = ? AND status != 'TRASH'",
      [internalParentId]
    );
    res.json({ success: true, users });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bill fetch (BBPS)
app.post("/bill-fetch", async (req, res) => {
  // Venus BBPS credentials (same as java_backend application.properties)
  const VENUS_BASE = "https://venusrecharge.co.in";
  const VENUS_AUTH_KEY = "10092";
  const VENUS_AUTH_PASS = "RUPIKSHA@816";

  try {
    let { consumerNo, accountNumber, category, dob, subdiv, subDiv, opcode, operatorCode, mobile, mobileNo, email } = req.body;
    let finalSubdiv = subdiv || subDiv || dob || "";
    consumerNo = (consumerNo || accountNumber || "").toString().replace(/\s+/g, "");
    opcode = (opcode || operatorCode || "").toString().trim().toUpperCase();
    mobile = (mobile || mobileNo || "").toString().trim();
    email = email ? email.trim() : "sauravanand9782@gmail.com";
    category = (category || "").toString().trim().toLowerCase();

    let dateVal = finalSubdiv || "";
    // Convert YYYY-MM-DD to YYYY/MM/DD for Venus API
    let safeDob = dateVal ? dateVal.replace(/-/g, '/') : "";

    if (!opcode) return res.status(400).json({ success: false, message: "Invalid Biller selection." });
    if (mobile.length < 10) return res.status(400).json({ success: false, message: "Valid 10-digit Mobile Number required." });

    // For insurance, DOB is mandatory
    if (category === 'insurance' && !safeDob) {
      return res.status(400).json({ success: false, message: "Date of Birth is required for Insurance bill fetch." });
    }

    let svcType = getVenusServiceType(category);

    // Generate unique merchant reference
    const now = new Date();
    const merchantRef = now.getFullYear().toString().slice(2)
      + String(now.getMonth() + 1).padStart(2, '0')
      + String(now.getDate()).padStart(2, '0')
      + String(now.getHours()).padStart(2, '0')
      + String(now.getMinutes()).padStart(2, '0')
      + String(now.getSeconds()).padStart(2, '0')
      + String(Math.floor(Math.random() * 90) + 10);

    // Build Venus FetchBill.aspx URL directly
    const venusParams = new URLSearchParams();
    venusParams.append("authkey", VENUS_AUTH_KEY);
    venusParams.append("authpass", VENUS_AUTH_PASS);
    venusParams.append("opcode", opcode);
    venusParams.append("Merchantrefno", merchantRef);
    venusParams.append("ConsumerID", consumerNo);
    venusParams.append("ConsumerMobileNo", mobile);

    if (category === 'fastag') {
      venusParams.append("SubDiv", safeDob || "");
      venusParams.append("Field1", email);
      venusParams.append("Field2", "");
      venusParams.append("ServiceType", "FAS");
    } else if (category === 'insurance') {
      // Insurance: DOB goes in subdiv, service type is INS
      venusParams.append("subdiv", safeDob);
      venusParams.append("email", email);
      venusParams.append("ServiceType", "INS");
    } else {
      venusParams.append("subdiv", safeDob || "NONE");
      venusParams.append("email", email);
      venusParams.append("ServiceType", svcType);
    }

    const url = `${VENUS_BASE}/FetchBill.aspx?${venusParams.toString()}`;
    console.log("[VENUS DIRECT FETCH] Requesting:", url);

    const fetchRes = await fetch(url);
    const rawResponse = await fetchRes.text();
    console.log("[VENUS DIRECT FETCH] Raw Response:", rawResponse?.slice(0, 300));

    // LOG TO DATABASE
    try {
      await pool.query(
        "INSERT INTO api_logs (user_id, service_type, request_url, request_payload, response_payload, status_code) VALUES (?, ?, ?, ?, ?, ?)",
        [req.body.userId || 0, `BBPS_FETCH_${category?.toUpperCase() || 'OTHER'}`, url, JSON.stringify(req.body), (rawResponse || "").slice(0, 5000), fetchRes.status]
      );
    } catch (dbErr) { console.error("API Logging Error:", dbErr.message); }

    try {
      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch (e) {
        data = xmlParser.parse(rawResponse);
      }

      // Handle common JSON response format
      if (data.success && data.bill) {
        return res.json({ success: true, bill: data.bill });
      }

      // Handle XML or Flat JSON response format
      let resp = data.Response || data.BillFetch || data.PaymentBill || data;
      const desc = resp.Description || resp.message || (typeof rawResponse === 'string' && rawResponse.length < 200 ? rawResponse : "");
      const status = (resp.ResponseStatus || "").toUpperCase();
      const isSuccess = status === "TXN" || status === "SAC" || desc.toUpperCase().includes("SUCCESS");

      if (isSuccess) {
        const bill = {
          custName: resp.ConsumerName || resp.custName || "Customer",
          amount: parseFloat(resp.DueAmount || resp.amount || 0),
          dueDate: resp.DueDate || resp.dueDate || "N/A",
          billNo: resp.OrderId || resp.billNo || merchantRef
        };
        return res.json({ success: true, bill });
      }
      return res.json({ success: false, message: desc || `Error from provider (Status: ${status || 'Unknown'})` });
    } catch (pe) {
      return res.json({ success: false, message: "Response Parse Error: " + (rawResponse || "").slice(0, 100) });
    }
  } catch (e) {
    console.error("[VENUS DIRECT FETCH] Error:", e.message);
    res.status(500).json({ success: false, message: "Venus API Connection Error: " + e.message });
  }
});

// Bill pay
app.post("/bill-pay", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    let { userId, biller, consumerNo, amount, category, opcode, mobile, dob, subDiv, subdiv, email, orderId } = req.body;
    let finalSubdiv = subdiv || subDiv || dob || "";
    amount = parseFloat(amount) || 0;
    mobile = mobile || "";
    email = email ? encodeURIComponent(email) : "sauravanand9782%40gmail.com";
    opcode = (opcode || "").trim().toUpperCase();

    await connection.beginTransaction();
    const isNumeric = /^\d+$/.test(userId);
    const [uRows] = await connection.query(
      isNumeric ? "SELECT id, balance FROM users WHERE id = ? OR mobile = ?" : "SELECT id, balance FROM users WHERE username = ? OR email = ?",
      isNumeric ? [parseInt(userId), userId] : [userId, userId]
    );
    if (uRows.length === 0) throw new Error("User not found");
    const internalUserId = uRows[0].id;
    const currentBalance = parseFloat(uRows[0].balance) || 0;

    if (currentBalance < amount) throw new Error("Insufficient balance");

    // Generate unique merchant reference
    const now = new Date();
    const merchantRef = now.getFullYear().toString().slice(2)
      + String(now.getMonth() + 1).padStart(2, '0')
      + String(now.getDate()).padStart(2, '0')
      + String(now.getHours()).padStart(2, '0')
      + String(now.getMinutes()).padStart(2, '0')
      + String(now.getSeconds()).padStart(2, '0')
      + String(Math.floor(Math.random() * 90) + 10);

    // Call Venus Directly
    const VENUS_BASE = "https://venusrecharge.co.in";
    const VENUS_AUTH_KEY = "10092";
    const VENUS_AUTH_PASS = "RUPIKSHA@816";
    let svcType = getVenusServiceType(category);
    let safeDob = finalSubdiv ? finalSubdiv.replace(/-/g, '/') : "";

    const venusParams = new URLSearchParams();
    venusParams.append("authkey", VENUS_AUTH_KEY);
    venusParams.append("authpass", VENUS_AUTH_PASS);
    venusParams.append("opcode", opcode);
    venusParams.append("Amount", amount);
    venusParams.append("Merchantrefno", merchantRef);
    venusParams.append("ConsumerID", consumerNo);
    venusParams.append("ConsumerMobileNo", mobile);
    venusParams.append("Orderid", orderId || merchantRef);
    venusParams.append("subdiv", safeDob || "NONE");
    venusParams.append("email", decodeURIComponent(email));
    venusParams.append("ServiceType", category === 'insurance' ? 'INS' : svcType);

    const url = `${VENUS_BASE}/PaymentBill.aspx?${venusParams.toString()}`;
    console.log("[VENUS DIRECT PAY] Requesting:", url);

    const payRes = await fetch(url);
    const rawResponse = await payRes.text();
    console.log("[VENUS DIRECT PAY] Raw Response:", rawResponse);

    // LOG TO DATABASE
    try {
      await pool.query(
        "INSERT INTO api_logs (user_id, service_type, request_url, request_payload, response_payload, status_code) VALUES (?, ?, ?, ?, ?, ?)",
        [internalUserId, `BBPS_PAY_${category?.toUpperCase() || 'OTHER'}`, url, JSON.stringify(req.body), (rawResponse || "").slice(0, 5000), payRes.status]
      );
    } catch (dbErr) { console.error("BBPS Logging Error:", dbErr.message); }

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (e) {
      data = xmlParser.parse(rawResponse);
    }

    const resp = data.Response || data.PaymentBill || data;
    const status = (resp.ResponseStatus || "").toUpperCase();
    const desc = resp.Description || resp.message || rawResponse;
    const operatorTxnId = resp.OperatorID || resp.OperatorTxnId || "";

    const isSuccess = status === "TXN" || status === "SAC" || desc.toUpperCase().includes("SUCCESS");

    if (isSuccess) {
      await connection.query("UPDATE users SET balance = balance - ? WHERE id = ?", [amount, internalUserId]);
      const [tResult] = await connection.query(
        "INSERT INTO transactions (user_id, type, amount, status, description, operator, number, merchant_ref, operator_txn_id) VALUES (?, 'BILL_PAY', ?, 'SUCCESS', ?, ?, ?, ?, ?)",
        [internalUserId, amount, `${category?.toUpperCase()} Pay: ${biller}`, opcode, consumerNo, merchantRef, operatorTxnId]
      );

      // Wallet ledger
      await connection.query(
        "INSERT INTO wallet_ledger (user_id, amount, type, txn_id, balance_after) VALUES (?, ?, 'DEBIT', ?, ?)",
        [internalUserId, amount, tResult.insertId, currentBalance - amount]
      );

      await connection.commit();
      res.json({ success: true, message: desc, txnId: tResult.insertId, operatorTxnId });
    } else {
      await connection.rollback();
      res.json({ success: false, message: desc || "Payment failed at provider" });
    }
  } catch (e) {
    if (connection) await connection.rollback();
    console.error("[BILL PAY ERROR]", e.message);
    res.status(500).json({ success: false, message: e.message });
  } finally {
    if (connection) connection.release();
  }
});

// ─── VENUS CALLBACK ──────────────────────────────────────────────────────────
app.all("/api/venus/callback", async (req, res) => {
  console.log("🔔 [VENUS CALLBACK RECEIVED]", req.method, req.query, req.body);
  const data = { ...req.query, ...req.body };

  const merchantRef = data.MerchantRefNo || data.merchantRefNo || data.merchantrefno;
  const status = (data.Status || data.status || "").toUpperCase();
  const operatorTxnId = data.OperatorID || data.operatorID || data.operatorid;

  if (merchantRef) {
    try {
      const txStatus = (status === 'SUCCESS' || status === 'TXN') ? 'SUCCESS' :
        (status === 'FAILURE' || status === 'FAILED') ? 'FAILURE' : 'PENDING';

      await pool.query(
        "UPDATE transactions SET status = ?, operator_txn_id = ? WHERE merchant_ref = ?",
        [txStatus, operatorTxnId, merchantRef]
      );
      console.log(`✅ Updated Txn ${merchantRef} to ${txStatus}`);
    } catch (err) {
      console.error("Callback DB Update Error:", err.message);
    }
  }

  res.send("SUCCESS");
});

// Recharge (Venus API — Fully Functional)
app.post("/recharge", async (req, res) => {
  const VENUS_RECHARGE_URL = "https://api.venusrecharge.com/V2/api/recharge/transaction";
  const VENUS_AUTH_KEY = "10092";
  const VENUS_AUTH_PASS = "RUPIKSHA@816";

  const connection = await pool.getConnection();
  try {
    const { userId, operator, mobile, amount, serviceType, paymentMethod: method, circle } = req.body;
    const rechargeAmt = parseFloat(amount) || 0;
    if (rechargeAmt < 1) throw new Error("Invalid recharge amount");
    if (!mobile || mobile.length < 10) throw new Error("Valid 10-digit mobile number required");

    await connection.beginTransaction();

    // For Wallet payments, check the REAL Venus balance instead of local DB
    let currentBalance = 0;
    const isNumeric = /^\d+$/.test(userId);
    const [uRows] = await connection.query(
      isNumeric ? "SELECT id, balance FROM users WHERE id = ? OR mobile = ?" : "SELECT id, balance FROM users WHERE username = ? OR email = ?",
      isNumeric ? [parseInt(userId), userId] : [userId, userId]
    );
    if (uRows.length === 0) throw new Error("User not found");
    const internalUserId = uRows[0].id;

    if (method === 'wallet') {
      try {
        const vBalRes = await fetch('https://venusrecharge.co.in/Balance.aspx?authkey=10092&authpass=RUPIKSHA@816&service=recharge');
        const vBalText = await vBalRes.text();
        const match = vBalText.match(/<Balance>(.*?)<\/Balance>/);
        if (match) {
          currentBalance = parseFloat(match[1]);
        } else {
          currentBalance = parseFloat(uRows[0].balance);
        }
      } catch (e) {
        currentBalance = parseFloat(uRows[0].balance);
      }

      if (currentBalance < rechargeAmt) {
        throw new Error(`Insufficient wallet balance (₹${currentBalance.toFixed(2)}). Required: ₹${rechargeAmt}`);
      }
    } else {
      // Payment Gateway path — we assume payment is successful before calling this or handle redirect
      currentBalance = parseFloat(uRows[0].balance);
    }

    // Map operator name to Venus API code
    const OP_CODE_MAP = {
      'ATL': 'ATL', 'Airtel': 'ATL', 'AIRTEL': 'ATL',
      'JRE': 'JRE', 'Jio': 'JRE', 'JIO': 'JRE',
      'VDF': 'VDF', 'Vi': 'VDF', 'VI': 'VDF', 'Vodafone': 'VDF', 'VODAFONE': 'VDF',
      'BNT': 'BNT', 'BSNL': 'BNT', 'bsnl': 'BNT',
      // DTH
      'TSY': 'TSY', 'ATD': 'ATD', 'DTV': 'DTV', 'STV': 'STV', 'VCD': 'VCD', 'BTV': 'BTV',
    };
    const venusOpCode = OP_CODE_MAP[operator] || operator;
    const venusSvcType = (serviceType || 'MR').toUpperCase();  // MR = Mobile Recharge, DTH = DTH
    const merchantRef = Date.now().toString();

    // Call Venus Recharge API
    console.log(`[VENUS RECHARGE] mobile=${mobile}, op=${venusOpCode}, amt=${rechargeAmt}, svc=${venusSvcType}, ref=${merchantRef}`);

    let venusSuccess = false;
    let operatorTxnId = null;
    let venusOrderNo = null;
    let venusMessage = "Processing";

    try {
      const venusRes = await fetch(VENUS_RECHARGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': VENUS_AUTH_KEY,
          'authpass': VENUS_AUTH_PASS
        },
        body: JSON.stringify({
          mobileNo: mobile,
          operatorCode: venusOpCode,
          serviceType: venusSvcType,
          amount: rechargeAmt,
          merchantRefNo: merchantRef
        })
      });

      const venusData = await venusRes.json();
      console.log("[VENUS RECHARGE] Response:", JSON.stringify(venusData));

      venusSuccess = (venusData.responseStatus || "").toUpperCase() === "SUCCESS" ||
        (venusData.ResponseStatus || "").toUpperCase() === "TXN" ||
        (venusData.status || "").toUpperCase() === "SUCCESS";
      operatorTxnId = venusData.operatorTxnId || venusData.OperatorTxnId || null;
      venusOrderNo = venusData.orderNo || venusData.OrderNo || merchantRef;
      venusMessage = venusData.description || venusData.Description || venusData.message || "Recharge processed";
    } catch (venusErr) {
      console.error("[VENUS RECHARGE] API Error:", venusErr.message);
      venusMessage = "Venus API connection failed: " + venusErr.message;
    }

    // Deduct from wallet if wallet payment and Venus succeeded
    if (method === 'wallet' && venusSuccess) {
      await connection.query("UPDATE users SET balance = balance - ? WHERE id = ?", [rechargeAmt, internalUserId]);
    }

    // Log transaction
    const txStatus = venusSuccess ? 'SUCCESS' : 'FAILURE';
    const [tResult] = await connection.query(
      "INSERT INTO transactions (user_id, type, amount, status, description, operator, number, operator_txn_id) VALUES (?, 'RECHARGE', ?, ?, ?, ?, ?, ?)",
      [internalUserId, rechargeAmt, txStatus, `${venusSvcType} Recharge: ${operator} (${circle || 'All India'})`, venusOpCode, mobile, operatorTxnId]
    );

    // Wallet ledger entry
    if (method === 'wallet' && venusSuccess) {
      await connection.query(
        "INSERT INTO wallet_ledger (user_id, amount, type, txn_id, balance_after) VALUES (?, ?, 'DEBIT', ?, ?)",
        [internalUserId, rechargeAmt, tResult.insertId, currentBalance - rechargeAmt]
      );
    }

    await connection.commit();

    if (venusSuccess) {
      res.json({
        success: true,
        txnId: tResult.insertId,
        txid: venusOrderNo || `TXN${tResult.insertId}`,
        operatorTxnId,
        message: venusMessage,
        newBalance: method === 'wallet' ? (currentBalance - rechargeAmt).toFixed(2) : currentBalance.toFixed(2)
      });
    } else {
      res.json({ success: false, message: venusMessage || "Recharge failed at provider" });
    }
  } catch (e) {
    if (connection) await connection.rollback();
    console.error("[RECHARGE ERROR]", e.message);
    res.status(500).json({ success: false, message: e.message });
  } finally { if (connection) connection.release(); }
});

// Helper: find retailer location and credentials from Database
const getRetailerInfo = async (req) => {
  const userId = req.body.userId || (req.user ? req.user.id : 0);
  const isNumeric = /^\d+$/.test(userId);

  const query = isNumeric
    ? "SELECT username, merchant_id, fingpay_pin FROM users WHERE id = ?"
    : "SELECT username, merchant_id, fingpay_pin FROM users WHERE username = ?";

  try {
    const [rows] = await pool.query(query, [userId]);
    const user = rows[0];

    return {
      lat: req.body.lat || req.body.latitude || '0.0',
      lng: req.body.lng || req.body.longitude || '0.0',
      imei: req.body.deviceIMEI || process.env.FINGPAY_DEVICE_IMEI || 'WEB_RUPIKSHA_001',
      username: user?.merchant_id || user?.username || process.env.FINGPAY_USERNAME || '',
      pin: user?.fingpay_pin || process.env.FINGPAY_PIN || '',
    };
  } catch (err) {
    console.error("Error in getRetailerInfo:", err);
    return {
      lat: '0.0',
      lng: '0.0',
      imei: 'WEB_RUPIKSHA_001',
      username: process.env.FINGPAY_USERNAME || '',
      pin: process.env.FINGPAY_PIN || '',
    };
  }
};

// --- NEW AEPS 2FA ROUTES ---
app.post("/aeps/check-2fa", async (req, res) => {
  try {
    const { userId } = req.body;
    const [rows] = await pool.query("SELECT last_aeps_2fa FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) return res.json({ success: false, message: "User not found" });

    const last2fa = rows[0].last_aeps_2fa;
    if (!last2fa) return res.json({ success: true, needs2fa: true });

    const today = new Date().toISOString().split('T')[0];
    const lastDate = new Date(last2fa).toISOString().split('T')[0];

    if (today !== lastDate) {
      return res.json({ success: true, needs2fa: true });
    }

    res.json({ success: true, needs2fa: false });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/aeps/retailer-2fa", async (req, res) => {
  try {
    const { userId, biometric } = req.body;
    const retailerInfo = await getRetailerInfo(req);

    console.log(`📡 [AEPS] Retailer 2FA Biometric For ${userId}...`);

    // Simulation bypass if no merchant ID
    if (!process.env.FINGPAY_MERCHANT_ID) {
      await pool.query("UPDATE users SET last_aeps_2fa = NOW() WHERE id = ?", [userId]);
      return res.json({ success: true, message: "2FA Verified (SIMULATION)", status: "SUCCESS" });
    }

    const fpRes = await fingpay.twoFactorAuth({
      retailerInfo,
      biometric
    });

    if (fpRes.status === '200') {
      await pool.query("UPDATE users SET last_aeps_2fa = NOW() WHERE id = ?", [userId]);
      res.json({ success: true, message: "2FA Verified successfully", status: "SUCCESS" });
    } else {
      res.status(400).json({ success: false, message: fpRes.responseMessage || "2FA Failed", status: "FAILED" });
    }

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── AEPS / FINGPAY ROUTES ───────────────────────────────────────────────────

app.post("/aeps/send-aadhaar-otp", async (req, res) => {
  const { aadhaar, mobile } = req.body;
  if (!aadhaar || aadhaar.length !== 12) return res.status(400).json({ success: false, message: "Invalid Aadhaar number" });

  try {
    // Attempt 1: Real UIDAI Aadhaar verification via Cashfree (if configured)
    if (process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY) {
      try {
        console.log(`📡 [PROD] Requesting Real Aadhaar OTP for ${aadhaar} via Cashfree...`);
        const response = await axios.post("https://api.cashfree.com/verification/offline-aadhaar/otp",
          { aadhaar_number: aadhaar },
          {
            headers: {
              "x-client-id": process.env.CASHFREE_APP_ID,
              "x-client-secret": process.env.CASHFREE_SECRET_KEY,
              "x-api-version": "2023-08-01",
              "Content-Type": "application/json"
            },
            timeout: 10000
          }
        );
        if (response.data && response.data.ref_id) {
          return res.json({ success: true, message: "Aadhaar OTP sent from UIDAI", method: 'uidai', refId: response.data.ref_id });
        }
      } catch (err) {
        console.warn("⚠️ Cashfree Aadhaar OTP failed. Falling back to Mobile SMS OTP.", err.response?.data || err.message);
      }
    }

    // Attempt 2: Fallback to Fast2SMS (Sends a local OTP to the mobile entered in the input form)
    if (!mobile || mobile.length < 10) return res.status(400).json({ success: false, message: "Customer Mobile number needed for real OTP" });

    const localOtp = Math.floor(100000 + Math.random() * 900000).toString();
    // Use Aadhaar as identifier in otpStore
    otpStore.set('AEPS_' + aadhaar, { otp: localOtp, expires: Date.now() + 300000 });

    // Attempt sending actual SMS!
    console.log(`📡 [PROD] Sending SMS to ${mobile} via Fast2SMS fallback...`);
    const smsSent = await sendSMS(mobile, `Your Aadhaar AEPS Verification OTP is ${localOtp}. Valid for 5 minutes. DO NOT SHARE. - RuPiKsha`);

    if (smsSent) {
      return res.json({ success: true, message: "OTP successfully sent to customer's mobile", method: 'sms' });
    } else {
      // Mock it in development / if no Fast2SMS key
      console.log("⚠️ Fast2SMS not setup or failed. Mocking OTP to terminal:", localOtp);
      return res.json({ success: true, message: "OTP logged in system (Configure Fast2SMS/Cashfree for real SMS delivery)", mockedOtp: localOtp, method: 'mock' });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post("/aeps/verify-aadhaar-otp", async (req, res) => {
  const { aadhaar, otp, refId, method } = req.body;
  if (!aadhaar || !otp) return res.status(400).json({ success: false, message: "Aadhaar and OTP required" });

  try {
    if (method === 'uidai') {
      console.log(`📡 [PROD] Verifying UIDAI OTP for ${aadhaar} via Cashfree...`);
      const response = await axios.post("https://api.cashfree.com/verification/offline-aadhaar/verify",
        { otp, ref_id: refId },
        {
          headers: {
            "x-client-id": process.env.CASHFREE_APP_ID,
            "x-client-secret": process.env.CASHFREE_SECRET_KEY,
            "x-api-version": "2023-08-01",
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );
      if (response.data && response.data.status === "VALID") {
        return res.json({ success: true, message: "Aadhaar OTP Verified correctly" });
      }
      return res.status(400).json({ success: false, message: "Invalid UIDAI OTP" });
    } else {
      // Local fallback logic!
      const stored = otpStore.get('AEPS_' + aadhaar);
      if (stored && stored.otp === otp && Date.now() < stored.expires) {
        otpStore.delete('AEPS_' + aadhaar);
        return res.json({ success: true, message: "Falllback AEPS OTP Verified" });
      }
      return res.status(400).json({ success: false, message: "Invalid or Expired OTP" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e.response?.data?.message || e.message });
  }
});

app.post("/aeps/transaction", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { userId, mobile, operator, bankName, amount, tab, aadhaar, captureResponse, twoFACapture, paymentMode } = req.body;
    const txAmt = parseFloat(amount) || 0;

    await connection.beginTransaction();
    const isNumeric = /^\d+$/.test(userId);
    const [uRows] = await connection.query(
      isNumeric ? "SELECT id, balance FROM users WHERE id = ? OR mobile = ?" : "SELECT id, balance FROM users WHERE username = ? OR email = ?",
      isNumeric ? [parseInt(userId), userId] : [userId, userId]
    );
    if (uRows.length === 0) throw new Error("User not found");
    const internalUserId = uRows[0].id;
    const currentBalance = parseFloat(uRows[0].balance) || 0;

    // Balance check for Wallet Payment Mode (Cash Deposit)
    if (tab === 'cash_deposit' && (paymentMode === 'wallet' || !paymentMode)) {
      if (currentBalance < txAmt) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: "Insufficient wallet balance for this transaction" });
      }
    }

    let result;
    const isConfigured = !!process.env.FINGPAY_MERCHANT_ID;
    if (!isConfigured) {
      // Simulation mode
      result = {
        status: '200',
        responseCode: '00',
        message: 'Transaction Simulated Successfully',
        txnId: 'SIM' + Date.now(),
        balance: (currentBalance - (tab === 'withdrawal' ? -txAmt : txAmt)).toFixed(2)
      };
    } else {
      const retailerInfo = await getRetailerInfo(req);
      const biometric = captureResponse;
      const twoFABiometric = twoFACapture;
      const bankIIN = operator; // Frontend sends IIN in 'operator' field

      switch (tab) {
        case 'withdrawal': result = await fingpay.cashWithdrawal({ mobile, aadhaar, bankIIN, amount, retailerInfo, biometric }); break;
        case 'balance': result = await fingpay.balanceInquiry({ mobile, aadhaar, bankIIN, retailerInfo, biometric }); break;
        case 'statement': result = await fingpay.miniStatement({ mobile, aadhaar, bankIIN, retailerInfo, biometric }); break;
        case 'aadhaar_pay': result = await fingpay.aadhaarPay({ mobile, aadhaar, bankIIN, amount, retailerInfo, biometric }); break;
        case 'cash_deposit': result = await fingpay.cashDeposit({ mobile, aadhaar, bankIIN, amount, retailerInfo, biometric, twoFABiometric }); break;
        default: throw new Error("Unsupported type: " + tab);
      }
    }

    const isSuccess = result?.status === '200' || result?.responseCode === '00';
    let newBalance = currentBalance;

    // Logic for Wallet Balance Updates
    if (isSuccess) {
      if (tab === 'withdrawal' || tab === 'aadhaar_pay') {
        newBalance += txAmt; // Retailer gets money
      } else if (tab === 'cash_deposit') {
        // Only deduct from wallet if payment mode is wallet
        if (paymentMode === 'wallet' || !paymentMode) {
          newBalance -= txAmt;
        }
      }
    }

    await connection.query("UPDATE users SET balance = ? WHERE id = ?", [newBalance, internalUserId]);

    const [tResult] = await connection.query(
      "INSERT INTO transactions (user_id, type, amount, status, description, operator, number, balance_after, reference_no) VALUES (?, 'AEPS', ?, ?, ?, ?, ?, ?, ?)",
      [internalUserId, txAmt, isSuccess ? 'SUCCESS' : 'FAILURE', `AEPS ${tab.toUpperCase()} (${paymentMode || 'WALLET'})`, bankName || operator, mobile, newBalance, result?.txnId || result?.transactionId]
    );

    await connection.query(
      "INSERT INTO aeps_transactions (txn_id, aadhaar_last4, bank_iin, tab_type, raw_response) VALUES (?, ?, ?, ?, ?)",
      [tResult.insertId, aadhaar ? aadhaar.slice(-4) : '', operator, tab, JSON.stringify(result)]
    );

    await connection.commit();
    res.json({ success: isSuccess, ...result, newBalance });
  } catch (e) {
    if (connection) await connection.rollback();
    res.status(500).json({ success: false, message: e.message });
  } finally { if (connection) connection.release(); }
});

app.post("/aeps/2fa", async (req, res) => {
  try {
    const { mobile, aadhaar, captureResponse } = req.body;
    const retailerInfo = await getRetailerInfo(req);
    const result = await fingpay.twoFactorAuth({ mobile, aadhaar, retailerInfo, biometric: captureResponse });
    res.json({ success: result?.status === '200' || result?.responseCode === '00', ...result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/aeps/onboard", async (req, res) => {
  try {
    const result = await fingpay.merchantOnboard(req.body);
    res.json({ success: result?.status === '200' || result?.responseCode === '00', ...result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/aeps/ekyc/otp", async (req, res) => {
  try {
    const result = await fingpay.ekycSendOtp(req.body);
    res.json({ success: result?.status === '200' || result?.responseCode === '00', ...result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/aeps/ekyc/validate", async (req, res) => {
  try {
    const result = await fingpay.ekycValidateOtp(req.body);
    res.json({ success: result?.status === '200' || result?.responseCode === '00', ...result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/aeps/status-check", async (req, res) => {
  try {
    const { merchantTranId, merchantUsername, merchantPin } = req.body;
    const result = await fingpay.statusCheck(merchantTranId, merchantUsername, merchantPin);
    res.json({ success: result?.status === '200' || result?.responseCode === '00', ...result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/aeps/recon", async (req, res) => {
  try {
    const { date, merchantUsername, merchantPin } = req.body;
    const result = await fingpay.threeWayRecon(date, merchantUsername, merchantPin);
    res.json({ success: result?.status === '200' || result?.responseCode === '00', ...result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post("/aeps/face-auth", async (req, res) => {
  try {
    const { mobile, aadhaar, faceData } = req.body;
    const retailerInfo = await getRetailerInfo(req);
    const result = await fingpay.faceAuth({ mobile, aadhaar, faceData, retailerInfo });
    res.json({ success: result?.status === '200' || result?.responseCode === '00', ...result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get("/aeps/history", async (req, res) => {
  try {
    const { userId, limit = 50 } = req.query;
    // Find internal numeric ID if username/mobile passed
    const isNumeric = /^\d+$/.test(userId);
    const [uRows] = await pool.query(
      isNumeric ? "SELECT id FROM users WHERE id = ? OR mobile = ?" : "SELECT id FROM users WHERE username = ? OR email = ?",
      isNumeric ? [parseInt(userId), userId] : [userId, userId]
    );
    if (uRows.length === 0) return res.json({ success: true, transactions: [] });

    const [rows] = await pool.query(
      "SELECT t.*, a.aadhaar_last4, a.bank_iin, a.tab_type FROM transactions t JOIN aeps_transactions a ON t.id = a.txn_id WHERE t.user_id = ? ORDER BY t.created_at DESC LIMIT ?",
      [uRows[0].id, parseInt(limit)]
    );
    res.json({ success: true, transactions: rows });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/aeps/status — Fingpay API integration status
app.get("/aeps/status", (req, res) => {
  const isLive = !!process.env.FINGPAY_MERCHANT_ID;
  res.json({
    success: true,
    mode: isLive ? 'PRODUCTION' : 'SIMULATION',
    configured: isLive,
    merchantId: process.env.FINGPAY_MERCHANT_ID ? '****' + process.env.FINGPAY_MERCHANT_ID.slice(-4) : 'NOT_SET',
    superMerchantId: process.env.FINGPAY_SUPERMERCHANT_ID ? '****' + process.env.FINGPAY_SUPERMERCHANT_ID.slice(-4) : 'NOT_SET',
    username: process.env.FINGPAY_USERNAME ? process.env.FINGPAY_USERNAME.slice(0, 3) + '***' : 'NOT_SET',
    baseUrl: fingpay.FINGPAY_BASE_URL,
    services: ['CASH_WITHDRAWAL', 'BALANCE_INQUIRY', 'MINI_STATEMENT', 'AADHAAR_PAY', 'CASH_DEPOSIT', 'TWO_FACTOR_AUTH', 'FACE_AUTH'],
    note: isLive ? 'Production mode active' : 'Fill FINGPAY_MERCHANT_ID in server/.env to go live. IP whitelist required from Fingpay.'
  });
});

// GET /api/aeps/bank-list — Return all supported banks with IIN codes
app.get("/aeps/bank-list", (req, res) => {
  const banks = [
    { id: '1', name: 'State Bank of India', iin: '607094' },
    { id: '2', name: 'HDFC Bank', iin: '607152' },
    { id: '3', name: 'ICICI Bank', iin: '508534' },
    { id: '4', name: 'Axis Bank', iin: '607153' },
    { id: '5', name: 'Punjab National Bank', iin: '607027' },
    { id: '6', name: 'Bank of Baroda', iin: '606985' },
    { id: '7', name: 'Canara Bank', iin: '607105' },
    { id: '8', name: 'Union Bank of India', iin: '607119' },
    { id: '9', name: 'Kotak Mahindra Bank', iin: '607314' },
    { id: '10', name: 'IndusInd Bank', iin: '607189' },
    { id: '11', name: 'Bank of India', iin: '508548' },
    { id: '12', name: 'Central Bank of India', iin: '607106' },
    { id: '13', name: 'Indian Bank', iin: '508532' },
    { id: '14', name: 'Indian Overseas Bank', iin: '607107' },
    { id: '15', name: 'UCO Bank', iin: '607108' },
    { id: '16', name: 'Yes Bank', iin: '508978' },
    { id: '17', name: 'IDBI Bank', iin: '607109' },
    { id: '18', name: 'Federal Bank', iin: '508501' },
    { id: '19', name: 'South Indian Bank', iin: '508552' },
    { id: '20', name: 'Karnataka Bank', iin: '508534' },
  ];
  res.json({ success: true, banks });
});

// POST /api/aeps/whitelist-request — Submit IP whitelist request (generates email template)
app.post("/aeps/whitelist-request", async (req, res) => {
  try {
    const { merchantId, superMerchantId, serverIp, contactEmail, contactName } = req.body;

    if (!serverIp) {
      return res.status(400).json({ success: false, message: 'Server IP is required' });
    }

    const emailSubject = `AEPS API IP Whitelist Request - Merchant ID: ${merchantId || 'PENDING'}`;
    const emailBody = `
Dear Fingpay/Tapits Team,

I request to whitelist the following server IP for AEPS API integration:

Merchant Details:
- Merchant ID: ${merchantId || 'NOT YET ASSIGNED'}
- Super Merchant ID: ${superMerchantId || 'NOT YET ASSIGNED'}
- Contact Name: ${contactName || 'Rupiksha Digital Fintech'}
- Contact Email: ${contactEmail || process.env.EMAIL_USER}

Server IP to Whitelist:
- Primary IP: ${serverIp}

Platform: Rupiksha Digital Fintech - AEPS Integration
Base URL: https://fingpayap.tapits.in

Please whitelist the above IP and confirm via email.

Regards,
${contactName || 'Rupiksha Admin'}
${contactEmail || process.env.EMAIL_USER}
    `;

    // Send confirmation email to admin
    try {
      await transporter.sendMail({
        from: `"RuPiKsha Admin" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `[AEPS Whitelist Template] ${emailSubject}`,
        html: `
          <div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 8px; max-width: 600px;">
            <h2 style="color: #0f172a;">📧 Whitelist Email Template Ready</h2>
            <p>Send the following email to <b>contact@tapits.in</b>:</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; white-space: pre-wrap; font-family: monospace; font-size: 13px;">
Subject: ${emailSubject}

${emailBody}
            </div>
            <br>
            <p style="color: #64748b; font-size: 12px;">Copy the above and email it to <b>contact@tapits.in</b> or <b>support@fingpay.in</b></p>
          </div>
        `
      });
    } catch (mailErr) {
      console.warn('Email send failed:', mailErr.message);
    }

    res.json({
      success: true,
      message: 'Whitelist request template generated. Email sent to your admin inbox.',
      emailTo: 'contact@tapits.in',
      emailSubject,
      emailBody,
      nextSteps: [
        '1. Send the email body above to contact@tapits.in',
        '2. Wait 24-48 hours for Fingpay to whitelist your IP',
        '3. Fill FINGPAY_MERCHANT_ID and other credentials in server/.env',
        '4. Restart the server'
      ]
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Simulation helper (when FINGPAY_MERCHANT_ID not configured) ───────────────
function simulateFingpayResponse(tab, amount, aadhaar) {
  const txid = 'SIM' + Date.now();
  const balance = (Math.random() * 50000 + 1000).toFixed(2);
  const base = { status: '200', responseCode: '00', txnId: txid, txid, balance, responseMessage: 'Transaction Successful (Demo Mode)' };
  switch (tab) {
    case 'statement': return { ...base, miniStatement: generateMiniStatement() };
    default: return { ...base };
  }
}

function generateMiniStatement() {
  const types = ['CR', 'DR'];
  return Array.from({ length: 5 }, (_, i) => ({
    txnDate: new Date(Date.now() - i * 86400000).toLocaleDateString('en-IN'),
    txnType: types[i % 2],
    amount: (Math.random() * 10000 + 100).toFixed(2),
    balance: (Math.random() * 50000 + 1000).toFixed(2),
    narration: i % 2 === 0 ? 'ATM/CASH DEP' : 'UPI/PAYMENT'
  }));
}

// ─── WALLET MANAGEMENT ROUTES ────────────────────────────────────────────────

// POST /api/admin/wallet/credit — Credit fund to a user wallet
app.post("/admin/wallet/credit", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { userId, amount, remark } = req.body;
    if (!userId || !amount || isNaN(amount) || parseFloat(amount) <= 0)
      return res.status(400).json({ success: false, message: "Valid userId and amount required" });

    await connection.beginTransaction();

    const isNumeric = /^\d+$/.test(userId);
    let uRows;
    if (isNumeric) {
      const [rows] = await connection.query("SELECT id, full_name, username, balance FROM users WHERE id = ? OR mobile = ?", [parseInt(userId), userId]);
      uRows = rows;
    } else {
      const [rows] = await connection.query("SELECT id, full_name, username, balance FROM users WHERE username = ? OR email = ?", [userId, userId]);
      uRows = rows;
    }
    if (uRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const user = uRows[0];
    const creditAmt = parseFloat(amount);
    const newBalance = (parseFloat(user.balance) || 0) + creditAmt;

    await connection.query("UPDATE users SET balance = ? WHERE id = ?", [newBalance, user.id]);

    const [tResult] = await connection.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?, 'CREDIT', ?, 'SUCCESS', ?)",
      [user.id, creditAmt, remark || 'Admin Fund Credit']
    );

    await connection.query(
      "INSERT INTO wallet_logs (user_id, amount, type, reason, reference_id, balance_after) VALUES (?, ?, 'CREDIT', ?, ?, ?)",
      [user.id, creditAmt, 'Admin Credit', tResult.insertId, newBalance]
    );

    await connection.commit();
    res.json({ success: true, message: `₹${creditAmt} credited to ${user.full_name || user.username}`, newBalance });
  } catch (e) {
    await connection.rollback();
    res.status(500).json({ success: false, message: e.message });
  } finally {
    connection.release();
  }
});

// POST /api/admin/wallet/debit — Debit fund from a user wallet
app.post("/admin/wallet/debit", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { userId, amount, remark } = req.body;
    if (!userId || !amount || isNaN(amount) || parseFloat(amount) <= 0)
      return res.status(400).json({ success: false, message: "Valid userId and amount required" });

    await connection.beginTransaction();

    const isNumeric = /^\d+$/.test(userId);
    let uRows;
    if (isNumeric) {
      const [rows] = await connection.query("SELECT id, full_name, username, balance FROM users WHERE id = ? OR mobile = ?", [parseInt(userId), userId]);
      uRows = rows;
    } else {
      const [rows] = await connection.query("SELECT id, full_name, username, balance FROM users WHERE username = ? OR email = ?", [userId, userId]);
      uRows = rows;
    }
    if (uRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const user = uRows[0];
    const debitAmt = parseFloat(amount);
    const currentBalance = parseFloat(user.balance) || 0;

    if (debitAmt > currentBalance) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: `Insufficient balance. Available: ₹${currentBalance.toFixed(2)}` });
    }

    const newBalance = currentBalance - debitAmt;
    await connection.query("UPDATE users SET balance = ? WHERE id = ?", [newBalance, user.id]);

    const [tResult] = await connection.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?, 'DEBIT', ?, 'SUCCESS', ?)",
      [user.id, debitAmt, remark || 'Admin Fund Debit']
    );

    await connection.query(
      "INSERT INTO wallet_logs (user_id, amount, type, reason, reference_id, balance_after) VALUES (?, ?, 'DEBIT', ?, ?, ?)",
      [user.id, debitAmt, 'Admin Debit', tResult.insertId, newBalance]
    );

    await connection.commit();
    res.json({ success: true, message: `₹${debitAmt} debited from ${user.full_name || user.username}`, newBalance });
  } catch (e) {
    await connection.rollback();
    res.status(500).json({ success: false, message: e.message });
  } finally {
    connection.release();
  }
});

// POST /api/admin/wallet/fund-request — User submits a fund request
app.post("/admin/wallet/fund-request", async (req, res) => {
  try {
    const { userId, amount, utrNumber, remark, method } = req.body;
    if (!userId || !amount || isNaN(amount) || parseFloat(amount) <= 0)
      return res.status(400).json({ success: false, message: "Valid userId and amount required" });

    const isNumeric = /^\d+$/.test(userId);
    let uRows;
    if (isNumeric) {
      const [rows] = await pool.query("SELECT id FROM users WHERE id = ? OR mobile = ?", [parseInt(userId), userId]);
      uRows = rows;
    } else {
      const [rows] = await pool.query("SELECT id FROM users WHERE username = ? OR email = ?", [userId, userId]);
      uRows = rows;
    }
    if (uRows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    const [result] = await pool.query(
      "INSERT INTO fund_requests (user_id, amount, utr_number, method, remark, status) VALUES (?, ?, ?, ?, ?, 'PENDING')",
      [uRows[0].id, parseFloat(amount), utrNumber || '', method || 'NEFT/IMPS', remark || '']
    );

    res.json({ success: true, message: "Fund request submitted successfully", requestId: result.insertId });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/admin/wallet/fund-requests — List all fund requests
app.get("/admin/wallet/fund-requests", async (req, res) => {
  try {
    const [requests] = await pool.query(`
      SELECT fr.*, u.username, u.full_name as name, u.email, u.mobile, u.balance as currentBalance
      FROM fund_requests fr
      JOIN users u ON fr.user_id = u.id
      ORDER BY fr.created_at DESC
    `);
    res.json({ success: true, requests });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/admin/wallet/approve-request — Approve a fund request (credits wallet)
app.post("/admin/wallet/approve-request", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { requestId, remark } = req.body;

    await connection.beginTransaction();

    const [frRows] = await connection.query("SELECT * FROM fund_requests WHERE id = ? FOR UPDATE", [requestId]);
    if (frRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    const request = frRows[0];
    if (request.status !== 'PENDING') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Request already processed" });
    }

    const [uRows] = await connection.query("SELECT id, balance FROM users WHERE id = ?", [request.user_id]);
    const currentBalance = parseFloat(uRows[0].balance) || 0;
    const newBalance = currentBalance + parseFloat(request.amount);

    await connection.query("UPDATE users SET balance = ? WHERE id = ?", [newBalance, request.user_id]);
    await connection.query(
      "UPDATE fund_requests SET status = 'APPROVED', processed_at = NOW(), admin_remark = ? WHERE id = ?",
      [remark || 'Approved', requestId]
    );

    const [tResult] = await connection.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?, 'CREDIT', ?, 'SUCCESS', ?)",
      [request.user_id, request.amount, `Fund Request Approved - UTR: ${request.utr_number}`]
    );

    await connection.query(
      "INSERT INTO wallet_logs (user_id, amount, type, reason, reference_id, balance_after) VALUES (?, ?, 'CREDIT', ?, ?, ?)",
      [request.user_id, request.amount, 'Fund Request', tResult.insertId, newBalance]
    );

    await connection.commit();
    res.json({ success: true, message: `Fund request approved and credited.` });
  } catch (e) {
    await connection.rollback();
    res.status(500).json({ success: false, message: e.message });
  } finally {
    connection.release();
  }
});

// POST /api/admin/wallet/reject-request — Reject a fund request
app.post("/admin/wallet/reject-request", async (req, res) => {
  try {
    const { requestId, remark } = req.body;
    await pool.query(
      "UPDATE fund_requests SET status = 'REJECTED', processed_at = NOW(), admin_remark = ? WHERE id = ? AND status = 'PENDING'",
      [remark || 'Rejected by admin', requestId]
    );
    res.json({ success: true, message: "Fund request rejected" });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// POST /api/admin/wallet/lock  — Lock an amount in a user wallet
app.post("/admin/wallet/lock", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { userId, amount, remark } = req.body;
    if (!userId || !amount || isNaN(amount) || parseFloat(amount) <= 0)
      return res.status(400).json({ success: false, message: "Valid userId and amount required" });

    await connection.beginTransaction();
    const isNumeric = /^\d+$/.test(userId);
    let rows;
    if (isNumeric) {
      const [results] = await connection.query("SELECT id, balance, locked_amount, full_name, username FROM users WHERE id = ? OR mobile = ?", [parseInt(userId), userId]);
      rows = results;
    } else {
      const [results] = await connection.query("SELECT id, balance, locked_amount, full_name, username FROM users WHERE username = ? OR email = ?", [userId, userId]);
      rows = results;
    }
    if (rows.length === 0) throw new Error("User not found");
    const user = rows[0];

    const lockAmt = parseFloat(amount);
    const currentBal = parseFloat(user.balance) || 0;
    const currentLock = parseFloat(user.locked_amount) || 0;
    const available = currentBal - currentLock;

    if (lockAmt > available)
      throw new Error(`Insufficient available balance. Available: ₹${available.toFixed(2)}`);

    await connection.query("UPDATE users SET locked_amount = locked_amount + ? WHERE id = ?", [lockAmt, user.id]);
    await connection.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?, 'LOCK', ?, 'SUCCESS', ?)",
      [user.id, lockAmt, remark || 'Admin Lock']
    );

    await connection.commit();
    res.json({
      success: true,
      message: `₹${lockAmt} locked in ${user.full_name || user.username}'s wallet`,
      lockedAmount: currentLock + lockAmt,
      availableBalance: currentBal - (currentLock + lockAmt)
    });
  } catch (e) {
    if (connection) await connection.rollback();
    res.status(500).json({ success: false, message: e.message });
  } finally { if (connection) connection.release(); }
});

// POST /api/admin/wallet/release-lock  — Release locked amount
app.post("/admin/wallet/release-lock", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { userId, amount, remark } = req.body;
    if (!userId || !amount || isNaN(amount) || parseFloat(amount) <= 0)
      return res.status(400).json({ success: false, message: "Valid userId and amount required" });

    await connection.beginTransaction();
    const isNumeric = /^\d+$/.test(userId);
    let rows;
    if (isNumeric) {
      const [results] = await connection.query("SELECT id, balance, locked_amount, full_name, username FROM users WHERE id = ? OR mobile = ?", [parseInt(userId), userId]);
      rows = results;
    } else {
      const [results] = await connection.query("SELECT id, balance, locked_amount, full_name, username FROM users WHERE username = ? OR email = ?", [userId, userId]);
      rows = results;
    }
    if (rows.length === 0) throw new Error("User not found");
    const user = rows[0];

    const releaseAmt = parseFloat(amount);
    const currentBal = parseFloat(user.balance) || 0;
    const currentLock = parseFloat(user.locked_amount) || 0;

    if (releaseAmt > currentLock)
      throw new Error(`Cannot release ₹${releaseAmt}. Only ₹${currentLock.toFixed(2)} is locked.`);

    await connection.query("UPDATE users SET locked_amount = locked_amount - ? WHERE id = ?", [releaseAmt, user.id]);
    await connection.query(
      "INSERT INTO transactions (user_id, type, amount, status, description) VALUES (?, 'RELEASE_LOCK', ?, 'SUCCESS', ?)",
      [user.id, releaseAmt, remark || 'Admin Release Lock']
    );

    await connection.commit();
    res.json({
      success: true,
      message: `₹${releaseAmt} released from lock in ${user.full_name || user.username}'s wallet`,
      lockedAmount: currentLock - releaseAmt,
      availableBalance: currentBal - (currentLock - releaseAmt)
    });
  } catch (e) {
    if (connection) await connection.rollback();
    res.status(500).json({ success: false, message: e.message });
  } finally { if (connection) connection.release(); }
});

// GET /api/admin/wallet/user-wallets  — Get all user wallets overview
app.get("/admin/wallet/user-wallets", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id as userId, username, full_name as name, mobile, email, role, balance, locked_amount as lockedAmount FROM users");
    const wallets = rows.map(u => ({
      ...u,
      balance: parseFloat(u.balance) || 0,
      lockedAmount: parseFloat(u.lockedAmount) || 0,
      availableBalance: (parseFloat(u.balance) || 0) - (parseFloat(u.lockedAmount) || 0)
    }));
    res.json({ success: true, wallets });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ─── ERROR HANDLING ──────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// ONDC LOAN SYSTEM — Full Port from PHP (ondc_fs_project)
// Key: b49fe7cd4bf35a9c7ca6c540ffd485290a04f51abc2619a70d51c6ec73bec35d
// API: https://api.nlincs.io/ondc-fs/v1/register-lead
// ══════════════════════════════════════════════════════════════════════════════

const ONDC_CONFIG = {
  api_base: 'https://api.nlincs.io/ondc-fs/v1/',
  register_lead_endpoint: 'register-lead',
  api_key: process.env.ONDC_API_KEY || 'b49fe7cd4bf35a9c7ca6c540ffd485290a04f51abc2619a70d51c6ec73bec35d',
  flow_id: parseInt(process.env.ONDC_FLOW_ID || '101'),
  webhook_secret: process.env.ONDC_WEBHOOK_SECRET || 'b49fe7cd4bf35a9c7ca6c540ffd485290a04f51abc2619a70d51c6ec73bec35d',
};

// Helper: generate tracking ID
function genTrackingId() {
  return 'TRK_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// ── POST /loan/register-lead ─────────────────────────────────────────────────
app.post('/loan/register-lead', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      phone, first_name, last_name, name: fullName, dob, pincode,
      pan, income, amount, employment_type = 'salaried', loanType = 'PL', userId
    } = req.body;

    const name = fullName || `${first_name || ''} ${last_name || ''}`.trim();

    // Validation
    if (!phone || phone.toString().length !== 10)
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number required' });
    if (!name)
      return res.status(400).json({ success: false, message: 'Name is required' });
    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase()))
      return res.status(400).json({ success: false, message: 'Invalid PAN Format' });

    await connection.beginTransaction();

    let internalUserId = null;
    if (userId) {
      const isNumeric = /^\d+$/.test(userId);
      if (isNumeric) {
        const [uRows] = await connection.query("SELECT id FROM users WHERE id = ? OR mobile = ?", [parseInt(userId), userId]);
        if (uRows.length > 0) internalUserId = uRows[0].id;
      } else {
        const [uRows] = await connection.query("SELECT id FROM users WHERE username = ? OR email = ?", [userId, userId]);
        if (uRows.length > 0) internalUserId = uRows[0].id;
      }
    }

    const tracking_id = genTrackingId();

    // 1. Insert Lead - use 'phone' column (not mobile)
    const [lResult] = await connection.query(
      "INSERT INTO loan_leads (user_id, name, phone, dob, pincode, pan_card, requested_amount, monthly_income, employment_type, tracking_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'initiated')",
      [internalUserId, name, phone.toString(), dob, pincode, pan.toUpperCase(), parseFloat(amount) || 100000, parseFloat(income) || 30000, employment_type, tracking_id]
    );

    // Verify lead was inserted successfully
    if (!lResult.insertId) {
      await connection.rollback();
      return res.status(500).json({ success: false, message: 'Failed to create loan lead' });
    }

    // 2. Insert Application with all required fields
    const [aResult] = await connection.query(
      "INSERT INTO loan_applications (lead_id, status, reference_id, created_at) VALUES (?, 'initiated', NULL, NOW())",
      [lResult.insertId]
    );

    // 3. Call ONDC API (Simulated/Actual)
    const apiPayload = {
      phoneNumber: phone.toString(),
      trackingId: tracking_id,
      loanType: loanType || 'PL',
      flowId: ONDC_CONFIG.flow_id,
      prefill: { name, requested_amount: parseFloat(amount), monthly_income: parseFloat(income), employment_type, pan_card: pan.toUpperCase() }
    };

    let ondcResult = null;
    try {
      const ondcRes = await axios.post(
        `${ONDC_CONFIG.api_base}${ONDC_CONFIG.register_lead_endpoint}`,
        apiPayload,
        { headers: { 'Content-Type': 'application/json', 'X-API-KEY': ONDC_CONFIG.api_key }, timeout: 10000 }
      );

      if (ondcRes.data && ondcRes.data.redirectionUrl) {
        ondcResult = {
          success: true,
          redirectionUrl: ondcRes.data.redirectionUrl,
          sessionId: ondcRes.data.sessionId || '',
          referenceId: ondcRes.data.referenceId || '',
          meta: ondcRes.data.meta || {}
        };
      }
    } catch (apiErr) {
      console.log(`ONDC API error: ${apiErr.message} — Using simulation mode`);
    }

    // Simulation Fallback
    if (!ondcResult) {
      ondcResult = {
        success: true,
        is_demo: true,
        redirectionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/loan-journey?phone=${phone}&tracking_id=${tracking_id}`,
        sessionId: 'DEMO_' + Date.now(),
        referenceId: 'SIM_' + Math.floor(100000 + Math.random() * 900000),
        meta: { is_simulation: true }
      };
    }

    // Update application with IDs from API
    await connection.query(
      "UPDATE loan_applications SET reference_id = ?, session_id = ? WHERE lead_id = ?",
      [ondcResult.referenceId, ondcResult.sessionId, lResult.insertId]
    );

    await connection.commit();
    console.log(`✅ ONDC Lead Registered: ${tracking_id}`);

    res.json({
      success: true,
      tracking_id,
      redirectionUrl: ondcResult.redirectionUrl,
      sessionId: ondcResult.sessionId,
      referenceId: ondcResult.referenceId,
      is_demo: ondcResult.is_demo || false,
      phone,
      name
    });

  } catch (e) {
    if (connection) await connection.rollback();
    console.error('Loan register-lead error:', e.message);
    res.status(500).json({ success: false, message: e.message });
  } finally {
    if (connection) connection.release();
  }
});

// ── GET /loan/check-status?phone=XXXXXXXXXX ──────────────────────────────────
app.get('/loan/check-status', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });

    const [rows] = await pool.query(`
      SELECT l.*, a.status as app_status, a.reference_id, a.offer_amount, a.lender_name, a.interest_rate, a.updated_at as app_updated_at
      FROM loan_leads l
      LEFT JOIN loan_applications a ON l.id = a.lead_id
      WHERE l.mobile = ?
      ORDER BY l.created_at DESC LIMIT 1
    `, [phone.toString()]);

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'No application found' });

    const lead = rows[0];
    res.json({
      success: true,
      mobile: lead.mobile,
      name: lead.name,
      reference_id: lead.reference_id,
      tracking_id: lead.tracking_id,
      status: (lead.app_status || 'initiated').toUpperCase(),
      offer_amount: lead.offer_amount,
      lender_name: lead.lender_name,
      interest_rate: lead.interest_rate,
      updated_at_date: new Date(lead.app_updated_at).toLocaleDateString('en-IN'),
      created_at: lead.created_at
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── POST /loan/webhook ── ONDC Webhook ─────────────────────
app.post('/loan/webhook', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== ONDC_CONFIG.webhook_secret) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { tracking_id, referenceId, status, amount, lender_name, interest_rate } = req.body;

    if (!tracking_id || !status) {
      return res.status(400).json({ success: false, message: 'tracking_id and status required' });
    }

    const [lRows] = await pool.query("SELECT id FROM loan_leads WHERE tracking_id = ?", [tracking_id]);
    if (lRows.length === 0) return res.status(404).json({ success: false, message: 'Lead not found' });

    await pool.query(
      "UPDATE loan_applications SET status = ?, reference_id = IFNULL(?, reference_id), offer_amount = ?, lender_name = ?, interest_rate = ? WHERE lead_id = ?",
      [status.toLowerCase(), referenceId, amount, lender_name, interest_rate, lRows[0].id]
    );

    console.log(`📨 Webhook: ${tracking_id} → ${status}`);
    res.json({ success: true, message: `Application ${tracking_id} updated` });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /loan/all-applications ── Admin ─────────────────
app.get('/loan/all-applications', async (req, res) => {
  try {
    const [applications] = await pool.query(`
      SELECT 
        a.id, l.name, l.mobile, l.pan_card as pan, l.tracking_id,
        a.reference_id, a.status, l.requested_amount, a.offer_amount,
        a.lender_name, a.interest_rate, l.employment_type,
        l.created_at, a.updated_at
      FROM loan_applications a
      JOIN loan_leads l ON a.lead_id = l.id
      ORDER BY l.created_at DESC
    `);

    const [[stats]] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(status IN ('initiated', 'pending')) as initiated,
        SUM(status = 'processing') as processing,
        SUM(status = 'approved') as approved,
        SUM(status = 'rejected') as rejected
      FROM loan_applications
    `);

    res.json({ success: true, applications, stats });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET /loan/stats ──────────────────────
app.get('/loan/stats', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = "SELECT COUNT(*) as total, SUM(status='approved') as approved, SUM(status='rejected') as rejected FROM loan_applications";
    const [rows] = await pool.query(query);
    const stats = rows[0];
    res.json({
      success: true,
      total: stats.total || 0,
      approved: stats.approved || 0,
      pending: (stats.total || 0) - (stats.approved || 0) - (stats.rejected || 0),
      rejected: stats.rejected || 0
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Catch-all 404 for API
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Global JSON Error Handler (Prevents HTML error pages)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || "Internal Server Error",
    message: err.message || "An unexpected error occurred"
  });
});

// --- DATABASE INITIALIZATION ---
async function ensureTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS api_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        service_type VARCHAR(50),
        request_url TEXT,
        request_payload TEXT,
        response_payload LONGTEXT,
        status_code INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS loan_leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(255),
        mobile VARCHAR(15),
        dob DATE,
        pincode VARCHAR(10),
        pan_card VARCHAR(20),
        requested_amount DECIMAL(15, 2),
        monthly_income DECIMAL(15, 2),
        employment_type VARCHAR(50),
        tracking_id VARCHAR(100) UNIQUE,
        status VARCHAR(50) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS loan_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        reference_id VARCHAR(100),
        session_id VARCHAR(100),
        status VARCHAR(50),
        lender_name VARCHAR(255),
        offer_amount DECIMAL(15, 2),
        interest_rate VARCHAR(50),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES loan_leads(id) ON DELETE CASCADE
    )`
  ];
  for (const sql of tables) {
    try {
      await pool.query(sql);
    } catch (e) {
      console.error("Ensuring table failed:", e.message);
    }
  }
}

// ─── START SERVER ─────────────────────────────────────────────────────────────
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://rupiksha-backend.onrender.com"
    : `http://localhost:${PORT}`;

app.listen(PORT, async () => {
  await ensureTables();
  console.log(`✅ Rupiksha Server running on port ${PORT}`);
  console.log(`API: ${BASE_URL}/api`);
});