const express = require('express');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');
const { sendAccessGrantedEmail, sendAccessRevokedEmail } = require('../services/emailService');

const router = express.Router();

router.post('/grant', authMiddleware, (req, res) => {
    const { sharedWithEmail, reportId, expiresAt } = req.body;

    if (!sharedWithEmail || !reportId) {
        return res.status(400).json({ error: 'Shared user email and report ID are required' });
    }

    db.get(
        'SELECT id, file_name, report_type FROM health_reports WHERE id = ? AND user_id = ?',
        [reportId, req.user.userId],
        (err, report) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!report) {
                return res.status(404).json({ error: 'Report not found or you do not own this report' });
            }

            db.get(
                'SELECT full_name FROM users WHERE id = ?',
                [req.user.userId],
                (err, owner) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    db.get(
                        'SELECT id, full_name FROM users WHERE email = ?',
                        [sharedWithEmail],
                        (err, sharedUser) => {
                            if (err) {
                                return res.status(500).json({ error: 'Database error' });
                            }

                            if (!sharedUser) {
                                return res.status(404).json({ error: 'User not found' });
                            }

                            if (sharedUser.id === req.user.userId) {
                                return res.status(400).json({ error: 'Cannot share with yourself' });
                            }

                            db.get(
                                'SELECT id FROM shared_access WHERE owner_id = ? AND shared_with_id = ? AND report_id = ?',
                                [req.user.userId, sharedUser.id, reportId],
                                (err, existing) => {
                                    if (err) {
                                        return res.status(500).json({ error: 'Database error' });
                                    }

                                    if (existing) {
                                        return res.status(400).json({ error: 'Access already granted to this user' });
                                    }

                                    db.run(
                                        'INSERT INTO shared_access (owner_id, shared_with_id, report_id, expires_at) VALUES (?, ?, ?, ?)',
                                        [req.user.userId, sharedUser.id, reportId, expiresAt || null],
                                        function (err) {
                                            if (err) {
                                                return res.status(500).json({ error: 'Failed to grant access' });
                                            }

                                            sendAccessGrantedEmail(
                                                sharedWithEmail,
                                                sharedUser.full_name,
                                                owner.full_name,
                                                report.file_name,
                                                report.report_type
                                            ).catch(err => console.error('Email notification failed:', err));

                                            res.status(201).json({
                                                message: 'Access granted successfully. Notification email sent.',
                                                accessId: this.lastID
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

router.get('/granted', authMiddleware, (req, res) => {
    const query = `
    SELECT 
      sa.id,
      sa.report_id,
      sa.granted_at,
      sa.expires_at,
      u.email as shared_with_email,
      u.full_name as shared_with_name,
      hr.report_type,
      hr.report_date,
      hr.file_name
    FROM shared_access sa
    JOIN users u ON sa.shared_with_id = u.id
    JOIN health_reports hr ON sa.report_id = hr.id
    WHERE sa.owner_id = ?
    ORDER BY sa.granted_at DESC
  `;

    db.all(query, [req.user.userId], (err, grants) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(grants);
    });
});

router.get('/received', authMiddleware, (req, res) => {
    const query = `
    SELECT 
      sa.id as access_id,
      sa.granted_at,
      sa.expires_at,
      u.email as owner_email,
      u.full_name as owner_name,
      hr.id as report_id,
      hr.report_type,
      hr.report_date,
      hr.file_name,
      hr.notes
    FROM shared_access sa
    JOIN users u ON sa.owner_id = u.id
    JOIN health_reports hr ON sa.report_id = hr.id
    WHERE sa.shared_with_id = ?
    AND (sa.expires_at IS NULL OR sa.expires_at > datetime('now'))
    ORDER BY sa.granted_at DESC
  `;

    db.all(query, [req.user.userId], (err, sharedReports) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(sharedReports);
    });
});

router.delete('/:id', authMiddleware, (req, res) => {
    db.get(
        'SELECT id FROM shared_access WHERE id = ? AND owner_id = ?',
        [req.params.id, req.user.userId],
        (err, access) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!access) {
                return res.status(404).json({ error: 'Access grant not found' });
            }

            db.run('DELETE FROM shared_access WHERE id = ?', [req.params.id], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to revoke access' });
                }

                res.json({ message: 'Access revoked successfully' });
            });
        }
    );
});

router.get('/users/search', authMiddleware, (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email query is required' });
    }

    db.all(
        'SELECT id, email, full_name FROM users WHERE email LIKE ? AND id != ? LIMIT 10',
        [`%${email}%`, req.user.userId],
        (err, users) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json(users);
        }
    );
});

router.get('/report/:reportId/download', authMiddleware, (req, res) => {
    const fs = require('fs');

    const query = `
    SELECT hr.file_path, hr.file_name
    FROM health_reports hr
    JOIN shared_access sa ON hr.id = sa.report_id
    WHERE hr.id = ? AND sa.shared_with_id = ?
    AND (sa.expires_at IS NULL OR sa.expires_at > datetime('now'))
  `;

    db.get(query, [req.params.reportId, req.user.userId], (err, report) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!report) {
            return res.status(404).json({ error: 'Report not found or access denied' });
        }

        if (!fs.existsSync(report.file_path)) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.download(report.file_path, report.file_name);
    });
});

module.exports = router;
