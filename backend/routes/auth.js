const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (user) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            const passwordHash = await bcrypt.hash(password, 10);

            db.run(
                'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
                [email, passwordHash, fullName],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    res.status(201).json({
                        message: 'User registered successfully',
                        userId: this.lastID
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/me', authMiddleware, (req, res) => {
    db.get('SELECT id, email, full_name, created_at FROM users WHERE id = ?',
        [req.user.userId],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                createdAt: user.created_at
            });
        }
    );
});

module.exports = router;
