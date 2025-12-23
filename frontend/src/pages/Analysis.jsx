import { useState, useEffect } from 'react';
import { Brain, Sparkles, MessageSquare, FileText, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import MedicalBackground from '../components/MedicalBackground';
import FlashCard from '../components/FlashCard';
import ChatInterface from '../components/ChatInterface';
import { reportsAPI, aiAPI } from '../services/api';
import './Analysis.css';

const Analysis = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);

    useEffect(() => {
        loadReports();

        if ('speechSynthesis' in window) {
            setSpeechSupported(true);
        }
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            const response = await reportsAPI.getAll();
            setReports(response.data);
        } catch (error) {
            console.error('Failed to load reports:', error);
            setError('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleReportSelect = async (reportId) => {
        setSelectedReport(reportId);
        setAnalysis(null);
        setError('');

        try {
            const response = await aiAPI.getAnalysis(reportId);
            setAnalysis(response.data);
        } catch (error) {

            console.log('No existing analysis found');
        }
    };

    const handleAnalyze = async () => {
        if (!selectedReport) {
            setError('Please select a report first');
            return;
        }

        try {
            setAnalyzing(true);
            setError('');

            const response = await aiAPI.analyzeReport(selectedReport);
            setAnalysis(response.data.analysis);
        } catch (error) {
            console.error('Analysis failed:', error);
            setError(error.response?.data?.error || 'Failed to analyze report. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleVoiceResponse = () => {
        if (!analysis || !speechSupported) return;

        if (isSpeaking) {

            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const speechText = `
            Health Report Analysis Summary.
            
            ${analysis.summary}
            
            Key Findings: ${analysis.findings?.join('. ') || 'None'}
            
            Health Condition: ${analysis.condition}
            
            Risk Factors: ${analysis.risks?.join('. ') || 'None'}
            
            Recommendations: ${analysis.recommendations?.map(r => `${r.category}: ${r.advice}`).join('. ') || 'None'}
            
            Precautions: ${analysis.precautions?.join('. ') || 'None'}
            
            When to Consult Doctor: ${analysis.consultDoctor}
        `;

        const utterance = new SpeechSynthesisUtterance(speechText);

        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {

            if (event.error !== 'canceled' && event.error !== 'interrupted') {
                setError('Voice synthesis failed. Please try again.');
            }
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <MedicalBackground />
                <div className="flex-center" style={{ minHeight: '80vh' }}>
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <MedicalBackground />
            <div className="analysis-page">
                <div className="container">
                    <div className="page-header animate-fadeIn">
                        <div>
                            <h1>
                                <Brain size={32} />
                                AI Health Analysis
                            </h1>
                            <p>Get AI-powered insights and recommendations for your health reports</p>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error animate-fadeIn">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="analysis-controls card animate-fadeIn">
                        <div className="control-group">
                            <label className="input-label">
                                <FileText size={18} />
                                Select Report to Analyze
                            </label>
                            <select
                                className="input"
                                value={selectedReport || ''}
                                onChange={(e) => handleReportSelect(e.target.value)}
                                disabled={analyzing}
                            >
                                <option value="">Choose a report...</option>
                                {reports.map((report) => (
                                    <option key={report.id} value={report.id}>
                                        {report.file_name} - {report.report_type} ({new Date(report.report_date).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            className="btn btn-primary btn-analyze"
                            onClick={handleAnalyze}
                            disabled={!selectedReport || analyzing}
                        >
                            {analyzing ? (
                                <>
                                    <Loader size={20} className="spinner-icon" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Analyze with AI
                                </>
                            )}
                        </button>
                    </div>

                    {analyzing && (
                        <div className="analyzing-state card animate-fadeIn">
                            <div className="analyzing-animation">
                                <div className="pulse-ring"></div>
                                <Brain size={48} />
                            </div>
                            <h3>AI is analyzing your health report...</h3>
                            <p>This may take a few moments. Please wait.</p>
                        </div>
                    )}

                    {analysis && !analyzing && (
                        <div className="analysis-results animate-fadeIn">
                            {}
                            <div className="summary-card card">
                                <div className="summary-header">
                                    <CheckCircle size={24} />
                                    <h2>Analysis Summary</h2>
                                </div>
                                <p className="summary-text">{analysis.summary}</p>

                                {}
                                {speechSupported && (
                                    <div className="voice-controls">
                                        <button
                                            className={`btn ${isSpeaking ? 'btn-danger' : 'btn-accent'} btn-voice`}
                                            onClick={handleVoiceResponse}
                                        >
                                            {isSpeaking ? (
                                                <>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="6" y="4" width="4" height="16"></rect>
                                                        <rect x="14" y="4" width="4" height="16"></rect>
                                                    </svg>
                                                    Stop Voice
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                                        <line x1="12" y1="19" x2="12" y2="23"></line>
                                                        <line x1="8" y1="23" x2="16" y2="23"></line>
                                                    </svg>
                                                    Voice Response
                                                </>
                                            )}
                                        </button>
                                        {isSpeaking && (
                                            <div className="voice-indicator">
                                                <span className="pulse-dot"></span>
                                                <span>AI is speaking...</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {}
                            <div className="flash-cards-grid">
                                {}
                                {analysis.findings && analysis.findings.length > 0 && (
                                    <FlashCard
                                        title="Key Findings"
                                        icon="🔍"
                                        color="primary"
                                        front={
                                            <ul className="findings-list">
                                                {analysis.findings.slice(0, 3).map((finding, idx) => (
                                                    <li key={idx}>{finding}</li>
                                                ))}
                                            </ul>
                                        }
                                        back={
                                            <ul className="findings-list-detailed">
                                                {analysis.findings.map((finding, idx) => (
                                                    <li key={idx}>{finding}</li>
                                                ))}
                                            </ul>
                                        }
                                    />
                                )}

                                {}
                                {analysis.condition && (
                                    <FlashCard
                                        title="Health Condition"
                                        icon="❤️"
                                        color="secondary"
                                        front={<p className="condition-brief">{analysis.condition.substring(0, 100)}...</p>}
                                        back={<p className="condition-full">{analysis.condition}</p>}
                                    />
                                )}

                                {}
                                {analysis.risks && analysis.risks.length > 0 && (
                                    <FlashCard
                                        title="Risk Factors"
                                        icon="⚠️"
                                        color="warning"
                                        front={
                                            <ul className="risks-list">
                                                {analysis.risks.slice(0, 2).map((risk, idx) => (
                                                    <li key={idx}>{risk}</li>
                                                ))}
                                            </ul>
                                        }
                                        back={
                                            <ul className="risks-list-detailed">
                                                {analysis.risks.map((risk, idx) => (
                                                    <li key={idx}>{risk}</li>
                                                ))}
                                            </ul>
                                        }
                                    />
                                )}

                                {}
                                {analysis.precautions && analysis.precautions.length > 0 && (
                                    <FlashCard
                                        title="Precautions"
                                        icon="🛡️"
                                        color="accent"
                                        front={
                                            <ul className="precautions-list">
                                                {analysis.precautions.slice(0, 3).map((precaution, idx) => (
                                                    <li key={idx}>{precaution}</li>
                                                ))}
                                            </ul>
                                        }
                                        back={
                                            <ul className="precautions-list-detailed">
                                                {analysis.precautions.map((precaution, idx) => (
                                                    <li key={idx}>{precaution}</li>
                                                ))}
                                            </ul>
                                        }
                                    />
                                )}
                            </div>

                            {}
                            {analysis.recommendations && analysis.recommendations.length > 0 && (
                                <div className="recommendations-section card">
                                    <h2>
                                        <Sparkles size={24} />
                                        Personalized Recommendations
                                    </h2>
                                    <div className="recommendations-grid">
                                        {analysis.recommendations.map((rec, idx) => (
                                            <div key={idx} className={`recommendation-card priority-${rec.priority || 'medium'}`}>
                                                <div className="rec-header">
                                                    <span className="rec-category">{rec.category}</span>
                                                    <span className={`rec-priority priority-${rec.priority || 'medium'}`}>
                                                        {rec.priority || 'medium'}
                                                    </span>
                                                </div>
                                                <p className="rec-advice">{rec.advice}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {}
                            {analysis.consultDoctor && (
                                <div className="consult-doctor-card card">
                                    <div className="consult-header">
                                        <AlertCircle size={24} />
                                        <h3>When to Consult a Doctor</h3>
                                    </div>
                                    <p>{analysis.consultDoctor}</p>
                                </div>
                            )}

                            {}
                            <div className="chat-toggle">
                                <button
                                    className="btn btn-accent btn-chat"
                                    onClick={() => setShowChat(!showChat)}
                                >
                                    <MessageSquare size={20} />
                                    {showChat ? 'Hide' : 'Ask'} AI Assistant
                                </button>
                            </div>

                            {}
                            {showChat && (
                                <div className="chat-section animate-scaleIn">
                                    <ChatInterface reportId={selectedReport} />
                                </div>
                            )}
                        </div>
                    )}

                    {!selectedReport && !analyzing && (
                        <div className="empty-state card animate-fadeIn">
                            <Brain size={64} className="empty-icon" />
                            <h3>No Report Selected</h3>
                            <p>Select a health report above to get AI-powered analysis and recommendations</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Analysis;
