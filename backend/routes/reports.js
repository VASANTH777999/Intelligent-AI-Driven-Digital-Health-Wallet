const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');
const { extractVitalsFromReport } = require('../services/groqService');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { reportType, reportDate, notes, vitals } = req.body;

        if (!reportType || !reportDate) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Report type and date are required' });
        }

        db.run(
            `INSERT INTO health_reports (user_id, report_type, file_path, file_name, report_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [req.user.userId, reportType, req.file.path, req.file.originalname, reportDate, notes || ''],
            async function (err) {
                if (err) {
                    fs.unlinkSync(req.file.path);
                    return res.status(500).json({ error: 'Failed to save report' });
                }

                const reportId = this.lastID;
                let allVitals = [];

                // Parse manually added vitals
                if (vitals) {
                    try {
                        allVitals = JSON.parse(vitals);
                    } catch (e) {
                        console.error('Error parsing vitals:', e);
                    }
                }

                // Auto-extract vitals using AI
                try {
                    const extractedVitals = await extractVitalsFromReport({
                        reportType,
                        reportDate,
                        notes: notes || ''
                    });

                    if (extractedVitals && extractedVitals.length > 0) {
                        // Merge extracted vitals with manually added ones
                        allVitals = [...allVitals, ...extractedVitals];
                    }
                } catch (extractError) {
                    console.error('Error extracting vitals:', extractError);
                    // Continue without extracted vitals
                }

                // Store vitals in both tables
                if (allVitals.length > 0) {
                    try {
                        // Store in report_vitals table (links vitals to report)
                        const reportVitalsStmt = db.prepare('INSERT INTO report_vitals (report_id, vital_type, value, unit) VALUES (?, ?, ?, ?)');

                        // Store in vitals table (for tracking in vitals page)
                        const vitalsStmt = db.prepare('INSERT INTO vitals (user_id, vital_type, value, unit, recorded_at) VALUES (?, ?, ?, ?, ?)');

                        allVitals.forEach(vital => {
                            // Link to report
                            reportVitalsStmt.run(reportId, vital.type, vital.value, vital.unit);

                            // Add to vitals tracking (use report date as recorded date)
                            vitalsStmt.run(req.user.userId, vital.type, vital.value, vital.unit, reportDate);
                        });

                        reportVitalsStmt.finalize();
                        vitalsStmt.finalize();
                    } catch (e) {
                        console.error('Error storing vitals:', e);
                    }
                }

                res.status(201).json({
                    message: 'Report uploaded successfully',
                    reportId: reportId,
                    fileName: req.file.originalname,
                    vitalsExtracted: allVitals.length
                });
            }
        );
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/', authMiddleware, (req, res) => {
    const query = `
    SELECT hr.*, 
           GROUP_CONCAT(rv.vital_type || ':' || rv.value || ' ' || rv.unit) as vitals
    FROM health_reports hr
    LEFT JOIN report_vitals rv ON hr.id = rv.report_id
    WHERE hr.user_id = ?
    GROUP BY hr.id
    ORDER BY hr.report_date DESC
  `;

    db.all(query, [req.user.userId], (err, reports) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(reports);
    });
});

router.get('/:id', authMiddleware, (req, res) => {
    const query = `
    SELECT hr.*, 
           GROUP_CONCAT(rv.vital_type || ':' || rv.value || ' ' || rv.unit) as vitals
    FROM health_reports hr
    LEFT JOIN report_vitals rv ON hr.id = rv.report_id
    WHERE hr.id = ? AND hr.user_id = ?
    GROUP BY hr.id
  `;

    db.get(query, [req.params.id, req.user.userId], (err, report) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json(report);
    });
});

router.get('/:id/download', authMiddleware, (req, res) => {
    db.get(
        'SELECT * FROM health_reports WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId],
        (err, report) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!report) {
                return res.status(404).json({ error: 'Report not found' });
            }

            if (!fs.existsSync(report.file_path)) {
                return res.status(404).json({ error: 'File not found' });
            }

            res.download(report.file_path, report.file_name);
        }
    );
});

router.delete('/:id', authMiddleware, (req, res) => {
    db.get(
        'SELECT * FROM health_reports WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId],
        (err, report) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!report) {
                return res.status(404).json({ error: 'Report not found' });
            }

            if (fs.existsSync(report.file_path)) {
                fs.unlinkSync(report.file_path);
            }

            db.run('DELETE FROM health_reports WHERE id = ?', [req.params.id], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to delete report' });
                }

                res.json({ message: 'Report deleted successfully' });
            });
        }
    );
});

router.get('/search/filter', authMiddleware, (req, res) => {
    const { startDate, endDate, reportType, vitalType } = req.query;

    let query = `
    SELECT DISTINCT hr.*, 
           GROUP_CONCAT(rv.vital_type || ':' || rv.value || ' ' || rv.unit) as vitals
    FROM health_reports hr
    LEFT JOIN report_vitals rv ON hr.id = rv.report_id
    WHERE hr.user_id = ?
  `;

    const params = [req.user.userId];

    if (startDate) {
        query += ' AND hr.report_date >= ?';
        params.push(startDate);
    }

    if (endDate) {
        query += ' AND hr.report_date <= ?';
        params.push(endDate);
    }

    if (reportType) {
        query += ' AND hr.report_type = ?';
        params.push(reportType);
    }

    if (vitalType) {
        query += ' AND rv.vital_type = ?';
        params.push(vitalType);
    }

    query += ' GROUP BY hr.id ORDER BY hr.report_date DESC';

    db.all(query, params, (err, reports) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(reports);
    });
});

// Extract vitals from report metadata (for preview before upload)
router.post('/extract-vitals', authMiddleware, async (req, res) => {
    try {
        console.log('📥 Extract vitals request received:', req.body);
        const { reportType, reportDate, notes } = req.body;

        if (!reportType || !reportDate) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ error: 'Report type and date are required' });
        }

        console.log('🤖 Calling AI extraction service...');
        const extractedVitals = await extractVitalsFromReport({
            reportType,
            reportDate,
            notes: notes || ''
        });

        console.log('✅ Extraction complete:', extractedVitals);
        res.json({ vitals: extractedVitals });
    } catch (error) {
        console.error('❌ Error extracting vitals:', error);
        res.status(500).json({ error: 'Failed to extract vitals', vitals: [] });
    }
});

module.exports = router;
