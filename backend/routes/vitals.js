const express = require('express');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
    const { vitalType, value, unit, recordedAt, notes } = req.body;

    if (!vitalType || !value || !unit || !recordedAt) {
        return res.status(400).json({ error: 'Vital type, value, unit, and recorded date are required' });
    }

    db.run(
        'INSERT INTO vitals (user_id, vital_type, value, unit, recorded_at, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.userId, vitalType, value, unit, recordedAt, notes || ''],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to add vital' });
            }

            res.status(201).json({
                message: 'Vital added successfully',
                vitalId: this.lastID
            });
        }
    );
});

router.get('/', authMiddleware, (req, res) => {
    const { startDate, endDate, vitalType } = req.query;

    let query = 'SELECT * FROM vitals WHERE user_id = ?';
    const params = [req.user.userId];

    if (startDate) {
        query += ' AND recorded_at >= ?';
        params.push(startDate);
    }

    if (endDate) {
        query += ' AND recorded_at <= ?';
        params.push(endDate);
    }

    if (vitalType) {
        query += ' AND vital_type = ?';
        params.push(vitalType);
    }

    query += ' ORDER BY recorded_at DESC';

    db.all(query, params, (err, vitals) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(vitals);
    });
});

router.get('/trends', authMiddleware, (req, res) => {
    const { vitalType, startDate, endDate } = req.query;

    if (!vitalType) {
        return res.status(400).json({ error: 'Vital type is required' });
    }

    let query = `
    SELECT vital_type, value, unit, recorded_at, notes
    FROM vitals 
    WHERE user_id = ? AND vital_type = ?
  `;

    const params = [req.user.userId, vitalType];

    if (startDate) {
        query += ' AND recorded_at >= ?';
        params.push(startDate);
    }

    if (endDate) {
        query += ' AND recorded_at <= ?';
        params.push(endDate);
    }

    query += ' ORDER BY recorded_at ASC';

    db.all(query, params, (err, vitals) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(vitals);
    });
});

router.get('/types', authMiddleware, (req, res) => {
    db.all(
        'SELECT DISTINCT vital_type FROM vitals WHERE user_id = ? ORDER BY vital_type',
        [req.user.userId],
        (err, types) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json(types.map(t => t.vital_type));
        }
    );
});

router.get('/summary', authMiddleware, (req, res) => {
    const query = `
    SELECT 
      vital_type,
      COUNT(*) as count,
      AVG(value) as average,
      MIN(value) as min,
      MAX(value) as max,
      unit,
      MAX(recorded_at) as last_recorded
    FROM vitals 
    WHERE user_id = ?
    GROUP BY vital_type
    ORDER BY last_recorded DESC
  `;

    db.all(query, [req.user.userId], (err, summary) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(summary);
    });
});

module.exports = router;
