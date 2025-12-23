const express = require('express');
const { db } = require('../database');
const authMiddleware = require('../middleware/auth');
const { analyzeReport, chatWithAssistant, generateVitalsRecommendations } = require('../services/groqService');

const router = express.Router();

router.post('/analyze/:reportId', authMiddleware, async (req, res) => {
    try {
        const reportId = req.params.reportId;

        db.get(
            `SELECT hr.*, GROUP_CONCAT(rv.vital_type || ':' || rv.value || ' ' || rv.unit) as vitals
       FROM health_reports hr
       LEFT JOIN report_vitals rv ON hr.id = rv.report_id
       WHERE hr.id = ? AND hr.user_id = ?
       GROUP BY hr.id`,
            [reportId, req.user.userId],
            async (err, report) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (!report) {
                    return res.status(404).json({ error: 'Report not found' });
                }

                try {

                    const analysis = await analyzeReport(report);

                    db.run(
                        `INSERT INTO analyses (report_id, user_id, summary, findings, condition, risks, recommendations, precautions, consult_doctor)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            reportId,
                            req.user.userId,
                            analysis.summary,
                            JSON.stringify(analysis.findings),
                            analysis.condition,
                            JSON.stringify(analysis.risks),
                            JSON.stringify(analysis.recommendations),
                            JSON.stringify(analysis.precautions),
                            analysis.consultDoctor
                        ],
                        function (err) {
                            if (err) {
                                console.error('Error saving analysis:', err);

                            }

                            res.json({
                                success: true,
                                analysis: {
                                    ...analysis,
                                    analysisId: this?.lastID,
                                    reportId: reportId
                                }
                            });
                        }
                    );
                } catch (aiError) {
                    console.error('AI Analysis error:', aiError);
                    res.status(500).json({
                        error: 'Failed to analyze report',
                        details: aiError.message
                    });
                }
            }
        );
    } catch (error) {
        console.error('Error in analyze endpoint:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/analysis/:reportId', authMiddleware, (req, res) => {
    db.get(
        `SELECT * FROM analyses WHERE report_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [req.params.reportId, req.user.userId],
        (err, analysis) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!analysis) {
                return res.status(404).json({ error: 'Analysis not found' });
            }

            res.json({
                ...analysis,
                findings: JSON.parse(analysis.findings || '[]'),
                risks: JSON.parse(analysis.risks || '[]'),
                recommendations: JSON.parse(analysis.recommendations || '[]'),
                precautions: JSON.parse(analysis.precautions || '[]')
            });
        }
    );
});

router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, conversationId, reportId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const handleConversation = (convId) => {

            db.all(
                'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
                [convId],
                async (err, messages) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    let reportData = null;
                    if (reportId) {
                        reportData = await new Promise((resolve) => {
                            db.get(
                                'SELECT * FROM health_reports WHERE id = ? AND user_id = ?',
                                [reportId, req.user.userId],
                                (err, report) => {
                                    resolve(err ? null : report);
                                }
                            );
                        });
                    }

                    try {

                        const conversationHistory = [
                            ...messages.map(m => ({ role: m.role, content: m.content })),
                            { role: 'user', content: message }
                        ];

                        const aiResponse = await chatWithAssistant(conversationHistory, { reportData });

                        db.run(
                            'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
                            [convId, 'user', message]
                        );

                        db.run(
                            'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
                            [convId, 'assistant', aiResponse],
                            function (err) {
                                if (err) {
                                    console.error('Error saving messages:', err);
                                }

                                db.run(
                                    'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                                    [convId]
                                );

                                res.json({
                                    success: true,
                                    conversationId: convId,
                                    response: aiResponse
                                });
                            }
                        );
                    } catch (aiError) {
                        console.error('AI Chat error:', aiError);
                        res.status(500).json({
                            error: 'Failed to get AI response',
                            details: aiError.message
                        });
                    }
                }
            );
        };

        if (conversationId) {

            handleConversation(conversationId);
        } else {

            const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');

            db.run(
                'INSERT INTO conversations (user_id, report_id, title) VALUES (?, ?, ?)',
                [req.user.userId, reportId || null, title],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create conversation' });
                    }

                    handleConversation(this.lastID);
                }
            );
        }
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/conversations', authMiddleware, (req, res) => {
    db.all(
        `SELECT c.*, hr.file_name as report_name
     FROM conversations c
     LEFT JOIN health_reports hr ON c.report_id = hr.id
     WHERE c.user_id = ?
     ORDER BY c.updated_at DESC`,
        [req.user.userId],
        (err, conversations) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            res.json(conversations);
        }
    );
});

router.get('/conversations/:id', authMiddleware, (req, res) => {
    db.get(
        'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.userId],
        (err, conversation) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }

            db.all(
                'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
                [req.params.id],
                (err, messages) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }

                    res.json({
                        ...conversation,
                        messages
                    });
                }
            );
        }
    );
});

router.post('/vitals/analyze', authMiddleware, async (req, res) => {
    try {

        db.all(
            'SELECT * FROM vitals WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 10',
            [req.user.userId],
            async (err, vitals) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }

                if (vitals.length === 0) {
                    return res.status(404).json({ error: 'No vitals data found' });
                }

                try {
                    const recommendations = await generateVitalsRecommendations(vitals);
                    res.json(recommendations);
                } catch (aiError) {
                    console.error('AI Vitals analysis error:', aiError);
                    res.status(500).json({
                        error: 'Failed to analyze vitals',
                        details: aiError.message
                    });
                }
            }
        );
    } catch (error) {
        console.error('Error in vitals analyze endpoint:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
