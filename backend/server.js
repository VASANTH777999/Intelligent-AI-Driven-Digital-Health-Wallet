const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');
const vitalsRoutes = require('./routes/vitals');
const sharingRoutes = require('./routes/sharing');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Health Wallet API is running' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════╗');
            console.log('║                                                        ║');
            console.log('║        🏥 Digital Health Wallet Server Running 🏥      ║');
            console.log('║                                                        ║');
            console.log('╠════════════════════════════════════════════════════════╣');
            console.log(`║  Server URL: http://localhost:${PORT}                    ║`);
            console.log('║  Status: ✓ Ready to accept connections                ║');
            console.log('║  Database: ✓ SQLite initialized                        ║');
            console.log('╚════════════════════════════════════════════════════════╝');
            console.log('');
            console.log('📌 Open your browser and navigate to the URL above');
            console.log('');
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });

module.exports = app;
