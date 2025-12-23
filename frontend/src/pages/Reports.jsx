import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Download, Trash2, Search, Filter, Calendar, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import MedicalBackground from '../components/MedicalBackground';
import { reportsAPI } from '../services/api';
import './Reports.css';

const Reports = () => {
    const location = useLocation();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
    const [filters, setFilters] = useState({
        search: '',
        reportType: '',
        startDate: '',
        endDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadReports();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [reports, filters]);

    const loadReports = async () => {
        try {
            const response = await reportsAPI.getAll();
            setReports(response.data);
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...reports];

        if (filters.search) {
            filtered = filtered.filter(report =>
                report.file_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                report.report_type.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.reportType) {
            filtered = filtered.filter(report => report.report_type === filters.reportType);
        }

        if (filters.startDate) {
            filtered = filtered.filter(report => report.report_date >= filters.startDate);
        }

        if (filters.endDate) {
            filtered = filtered.filter(report => report.report_date <= filters.endDate);
        }

        setFilteredReports(filtered);
    };

    const handleDownload = async (id, fileName) => {
        try {
            const response = await reportsAPI.download(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download report:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this report?')) {
            return;
        }

        try {
            await reportsAPI.delete(id);
            setReports(reports.filter(r => r.id !== id));
            setSuccessMessage('Report deleted successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to delete report:', error);
        }
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            reportType: '',
            startDate: '',
            endDate: ''
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const reportTypes = [...new Set(reports.map(r => r.report_type))];

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
            <div className="reports-page">
                <div className="container">
                    <div className="page-header animate-fadeIn">
                        <h1>Health Reports</h1>
                        <p>Manage and view all your medical reports</p>
                    </div>

                    {successMessage && (
                        <div className="alert alert-success animate-fadeIn">
                            {successMessage}
                        </div>
                    )}

                    <div className="reports-controls animate-fadeIn">
                        <div className="search-bar">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="search-input"
                            />
                        </div>

                        <button
                            className="btn btn-outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={20} />
                            Filters
                            {(filters.reportType || filters.startDate || filters.endDate) && (
                                <span className="filter-badge">•</span>
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="filters-panel card animate-fadeIn">
                            <div className="filters-grid">
                                <div className="input-group">
                                    <label className="input-label">Report Type</label>
                                    <select
                                        className="input"
                                        value={filters.reportType}
                                        onChange={(e) => setFilters({ ...filters, reportType: e.target.value })}
                                    >
                                        <option value="">All Types</option>
                                        {reportTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">End Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label" style={{ opacity: 0 }}>Actions</label>
                                    <button
                                        className="btn btn-outline w-full"
                                        onClick={clearFilters}
                                    >
                                        <X size={20} />
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="reports-stats">
                        <p>Showing <strong>{filteredReports.length}</strong> of <strong>{reports.length}</strong> reports</p>
                    </div>

                    {filteredReports.length === 0 ? (
                        <div className="empty-state card animate-fadeIn">
                            <FileText size={64} className="empty-icon" />
                            <h3>No reports found</h3>
                            <p>
                                {reports.length === 0
                                    ? 'Upload your first health report to get started'
                                    : 'Try adjusting your filters'}
                            </p>
                        </div>
                    ) : (
                        <div className="reports-grid animate-fadeIn">
                            {filteredReports.map((report) => (
                                <div key={report.id} className="report-card card">
                                    <div className="report-card-header">
                                        <div className="report-icon-large">
                                            <FileText size={32} />
                                        </div>
                                        <div className="report-type-badge">
                                            {report.report_type}
                                        </div>
                                    </div>

                                    <div className="report-card-body">
                                        <h3>{report.file_name}</h3>

                                        <div className="report-meta">
                                            <div className="meta-item">
                                                <Calendar size={16} />
                                                <span>{formatDate(report.report_date)}</span>
                                            </div>
                                        </div>

                                        {report.vitals && (
                                            <div className="report-vitals">
                                                <p className="vitals-label">Vitals:</p>
                                                <p className="vitals-text">{report.vitals}</p>
                                            </div>
                                        )}

                                        {report.notes && (
                                            <div className="report-notes">
                                                <p className="notes-label">Notes:</p>
                                                <p className="notes-text">{report.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="report-card-actions">
                                        <button
                                            className="btn btn-accent"
                                            onClick={() => handleDownload(report.id, report.file_name)}
                                        >
                                            <Download size={18} />
                                            Download
                                        </button>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => handleDelete(report.id)}
                                            title="Delete report"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Reports;
