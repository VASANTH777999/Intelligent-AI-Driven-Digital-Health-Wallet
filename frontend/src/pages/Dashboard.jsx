import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, FileText, Share2, Upload, TrendingUp, Heart, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import MedicalBackground from '../components/MedicalBackground';
import { reportsAPI, vitalsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalReports: 0,
        totalVitals: 0,
        recentReports: [],
        vitalsSummary: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [reportsRes, vitalsRes] = await Promise.all([
                reportsAPI.getAll(),
                vitalsAPI.getSummary()
            ]);

            setStats({
                totalReports: reportsRes.data.length,
                totalVitals: vitalsRes.data.reduce((sum, v) => sum + v.count, 0),
                recentReports: reportsRes.data.slice(0, 5),
                vitalsSummary: vitalsRes.data.slice(0, 4)
            });
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <>
                <Navbar />
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
            <div className="dashboard">
                <div className="container">
                    <div className="dashboard-header animate-fadeIn">
                        <div>
                            <h1>Dashboard</h1>
                            <p>Welcome to your Health Wallet</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/upload')}
                        >
                            <Upload size={20} />
                            Upload Report
                        </button>
                    </div>

                    <div className="stats-grid animate-fadeIn">
                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
                                <FileText size={32} />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.totalReports}</h3>
                                <p>Total Reports</p>
                            </div>
                        </div>

                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'var(--gradient-accent)' }}>
                                <Activity size={32} />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.totalVitals}</h3>
                                <p>Vital Readings</p>
                            </div>
                        </div>

                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'var(--gradient-secondary)' }}>
                                <Heart size={32} />
                            </div>
                            <div className="stat-content">
                                <h3>{stats.vitalsSummary.length}</h3>
                                <p>Tracked Vitals</p>
                            </div>
                        </div>

                        <div className="stat-card card-glass">
                            <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}>
                                <Share2 size={32} />
                            </div>
                            <div className="stat-content">
                                <h3>Secure</h3>
                                <p>Data Protected</p>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-content">
                        <div className="dashboard-section animate-slideInLeft">
                            <div className="section-header">
                                <h2>Recent Reports</h2>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => navigate('/reports')}
                                >
                                    View All
                                </button>
                            </div>

                            {stats.recentReports.length === 0 ? (
                                <div className="empty-state card">
                                    <FileText size={48} className="empty-icon" />
                                    <h3>No reports yet</h3>
                                    <p>Upload your first health report to get started</p>
                                    <button
                                        className="btn btn-primary mt-md"
                                        onClick={() => navigate('/upload')}
                                    >
                                        <Upload size={20} />
                                        Upload Report
                                    </button>
                                </div>
                            ) : (
                                <div className="reports-list">
                                    {stats.recentReports.map((report) => (
                                        <div key={report.id} className="report-item card">
                                            <div className="report-icon">
                                                <FileText size={24} />
                                            </div>
                                            <div className="report-details">
                                                <h4>{report.file_name}</h4>
                                                <p className="report-type">{report.report_type}</p>
                                                <p className="report-date">
                                                    <Calendar size={14} />
                                                    {formatDate(report.report_date)}
                                                </p>
                                            </div>
                                            <button
                                                className="btn btn-accent"
                                                onClick={() => navigate('/reports')}
                                            >
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="dashboard-section animate-slideInRight">
                            <div className="section-header">
                                <h2>Vitals Summary</h2>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => navigate('/vitals')}
                                >
                                    View All
                                </button>
                            </div>

                            {stats.vitalsSummary.length === 0 ? (
                                <div className="empty-state card">
                                    <Activity size={48} className="empty-icon" />
                                    <h3>No vitals tracked</h3>
                                    <p>Start tracking your health vitals</p>
                                    <button
                                        className="btn btn-primary mt-md"
                                        onClick={() => navigate('/vitals')}
                                    >
                                        <TrendingUp size={20} />
                                        Track Vitals
                                    </button>
                                </div>
                            ) : (
                                <div className="vitals-grid">
                                    {stats.vitalsSummary.map((vital, index) => (
                                        <div key={index} className="vital-card card-glass">
                                            <div className="vital-header">
                                                <Activity size={20} />
                                                <h4>{vital.vital_type}</h4>
                                            </div>
                                            <div className="vital-value">
                                                <span className="value">{vital.average?.toFixed(1)}</span>
                                                <span className="unit">{vital.unit}</span>
                                            </div>
                                            <div className="vital-stats">
                                                <div className="vital-stat">
                                                    <span className="label">Min</span>
                                                    <span className="value">{vital.min}</span>
                                                </div>
                                                <div className="vital-stat">
                                                    <span className="label">Max</span>
                                                    <span className="value">{vital.max}</span>
                                                </div>
                                                <div className="vital-stat">
                                                    <span className="label">Count</span>
                                                    <span className="value">{vital.count}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="quick-actions animate-fadeIn">
                        <h2>Quick Actions</h2>
                        <div className="actions-grid">
                            <button
                                className="action-card card"
                                onClick={() => navigate('/upload')}
                            >
                                <Upload size={32} />
                                <h3>Upload Report</h3>
                                <p>Add new health report</p>
                            </button>

                            <button
                                className="action-card card"
                                onClick={() => navigate('/vitals')}
                            >
                                <Activity size={32} />
                                <h3>Track Vitals</h3>
                                <p>Record vital readings</p>
                            </button>

                            <button
                                className="action-card card"
                                onClick={() => navigate('/sharing')}
                            >
                                <Share2 size={32} />
                                <h3>Share Access</h3>
                                <p>Manage report sharing</p>
                            </button>

                            <button
                                className="action-card card"
                                onClick={() => navigate('/reports')}
                            >
                                <FileText size={32} />
                                <h3>View Reports</h3>
                                <p>Browse all reports</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
