/**
 * Demo Vulnerable Application
 * 
 * ⚠️ WARNING: This application contains INTENTIONAL security vulnerabilities
 * for testing purposes. DO NOT use in production!
 */

const express = require('express');
const mysql = require('mysql');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const serialize = require('serialize-javascript');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// VULNERABILITY 1: Hardcoded Secrets
// ============================================
const JWT_SECRET = 'super_secret_key_12345';
const API_KEY = 'sk-proj-abc123xyz789';
const DATABASE_PASSWORD = 'admin123!';
const AWS_ACCESS_KEY = 'AKIAIOSFODNN7EXAMPLE';
const AWS_SECRET_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
const GITHUB_TOKEN = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const OPENAI_API_KEY = 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

// ============================================
// VULNERABILITY 2: SQL Injection
// ============================================
app.get('/users', (req, res) => {
    const userId = req.query.id;
    // VULNERABLE: Direct string concatenation in SQL query
    const query = `SELECT * FROM users WHERE id = '${userId}'`;
    
    // Simulated database query
    console.log('Executing query:', query);
    res.json({ message: 'Query executed', query });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // VULNERABLE: SQL Injection
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log('Login query:', query);
    res.json({ message: 'Login attempted' });
});

// ============================================
// VULNERABILITY 3: Command Injection
// ============================================
app.get('/ping', (req, res) => {
    const host = req.query.host;
    // VULNERABLE: Command injection
    exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
        res.json({ output: stdout, error: stderr });
    });
});

app.post('/convert', (req, res) => {
    const { filename } = req.body;
    // VULNERABLE: Command injection via filename
    exec(`convert ${filename} output.pdf`, (error, stdout) => {
        res.json({ result: stdout });
    });
});

// ============================================
// VULNERABILITY 4: Path Traversal
// ============================================
app.get('/files', (req, res) => {
    const filename = req.query.name;
    // VULNERABLE: Path traversal
    const filepath = path.join('/uploads', filename);
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            res.status(404).json({ error: 'File not found' });
        } else {
            res.json({ content: data });
        }
    });
});

app.get('/download', (req, res) => {
    const file = req.query.file;
    // VULNERABLE: No path validation
    res.sendFile(file);
});

// ============================================
// VULNERABILITY 5: Cross-Site Scripting (XSS)
// ============================================
app.get('/search', (req, res) => {
    const query = req.query.q;
    // VULNERABLE: Reflected XSS
    res.send(`<html><body>
        <h1>Search Results</h1>
        <p>You searched for: ${query}</p>
    </body></html>`);
});

app.get('/profile', (req, res) => {
    const name = req.query.name;
    // VULNERABLE: XSS in template
    res.send(`<div class="profile">Welcome, ${name}!</div>`);
});

// ============================================
// VULNERABILITY 6: Insecure Deserialization
// ============================================
app.post('/deserialize', (req, res) => {
    const { data } = req.body;
    // VULNERABLE: Unsafe deserialization
    const obj = eval('(' + data + ')');
    res.json({ result: obj });
});

app.post('/parse-config', (req, res) => {
    const config = req.body.config;
    // VULNERABLE: eval() on user input
    const parsed = eval(config);
    res.json({ parsed });
});

// ============================================
// VULNERABILITY 7: Insecure JWT
// ============================================
app.post('/token', (req, res) => {
    const { userId } = req.body;
    // VULNERABLE: Weak secret, no expiration
    const token = jwt.sign({ userId, role: 'admin' }, JWT_SECRET);
    res.json({ token });
});

app.get('/verify', (req, res) => {
    const token = req.headers.authorization;
    // VULNERABLE: Algorithm confusion possible
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256', 'none'] });
    res.json({ user: decoded });
});

// ============================================
// VULNERABILITY 8: SSRF (Server-Side Request Forgery)
// ============================================
const axios = require('axios');

app.get('/fetch', async (req, res) => {
    const url = req.query.url;
    // VULNERABLE: SSRF - no URL validation
    try {
        const response = await axios.get(url);
        res.json({ data: response.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/webhook', async (req, res) => {
    const { callbackUrl } = req.body;
    // VULNERABLE: SSRF via callback
    await axios.post(callbackUrl, { status: 'complete' });
    res.json({ message: 'Webhook sent' });
});

// ============================================
// VULNERABILITY 9: Insecure File Upload
// ============================================
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    // VULNERABLE: No file type validation
    const file = req.file;
    // VULNERABLE: Using original filename
    const newPath = path.join('uploads', file.originalname);
    fs.renameSync(file.path, newPath);
    res.json({ path: newPath });
});

// ============================================
// VULNERABILITY 10: Prototype Pollution
// ============================================
const _ = require('lodash');

app.post('/merge', (req, res) => {
    const target = {};
    const source = req.body;
    // VULNERABLE: Prototype pollution via merge
    _.merge(target, source);
    res.json({ result: target });
});

// ============================================
// VULNERABILITY 11: NoSQL Injection
// ============================================
const mongoose = require('mongoose');

app.post('/find-user', async (req, res) => {
    const { username, password } = req.body;
    // VULNERABLE: NoSQL injection
    const user = await mongoose.model('User').findOne({
        username: username,
        password: password
    });
    res.json({ user });
});

// ============================================
// VULNERABILITY 12: XML External Entity (XXE)
// ============================================
const { DOMParser } = require('xmldom');

app.post('/parse-xml', (req, res) => {
    const xml = req.body.xml;
    // VULNERABLE: XXE - external entities enabled
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    res.json({ parsed: doc.documentElement.textContent });
});

// ============================================
// VULNERABILITY 13: Weak Cryptography
// ============================================
const crypto = require('crypto');

app.post('/encrypt', (req, res) => {
    const { data } = req.body;
    // VULNERABLE: Weak algorithm (DES)
    const cipher = crypto.createCipher('des', 'weak-key');
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    res.json({ encrypted });
});

app.post('/hash', (req, res) => {
    const { password } = req.body;
    // VULNERABLE: MD5 for password hashing
    const hash = crypto.createHash('md5').update(password).digest('hex');
    res.json({ hash });
});

// ============================================
// VULNERABILITY 14: Information Disclosure
// ============================================
app.get('/debug', (req, res) => {
    // VULNERABLE: Exposing sensitive information
    res.json({
        env: process.env,
        config: {
            dbPassword: DATABASE_PASSWORD,
            apiKey: API_KEY,
            jwtSecret: JWT_SECRET
        },
        stack: new Error().stack
    });
});

app.use((err, req, res, next) => {
    // VULNERABLE: Detailed error messages
    res.status(500).json({
        error: err.message,
        stack: err.stack,
        query: req.query,
        body: req.body
    });
});

// ============================================
// VULNERABILITY 15: Insecure CORS
// ============================================
const cors = require('cors');
app.use(cors({
    origin: '*',  // VULNERABLE: Allow all origins
    credentials: true
}));

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('⚠️  WARNING: This is a vulnerable demo application!');
});

module.exports = app;
