import { useState, useEffect } from 'react';
import { Share2, UserPlus, X, FileText, Calendar, Mail, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import MedicalBackground from '../components/MedicalBackground';
import { sharingAPI, reportsAPI } from '../services/api';
import './Sharing.css';

const Sharing = () => {
    const [myReports, setMyReports] = useState([]);
    const [grantedAccess, setGrantedAccess] = useState([]);
    const [receivedAccess, setReceivedAccess] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [shareForm, setShareForm] = useState({
        reportId: '',
        sharedWithEmail: '',
        expiresAt: ''
    });
    const [activeTab, setActiveTab] = useState('granted');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [reportsRes, grantedRes, receivedRes] = await Promise.all([
                reportsAPI.getAll(),
                sharingAPI.getGranted(),
                sharingAPI.getReceived()
            ]);

            setMyReports(reportsRes.data);
            setGrantedAccess(grantedRes.data);
            setReceivedAccess(receivedRes.data);
        } catch (error) {
            console.error('Failed to load sharing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchUsers = async (email) => {
        setSearchEmail(email);

        setShareForm({ ...shareForm, sharedWithEmail: email });

        if (email.length < 3) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await sharingAPI.searchUsers(email);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Failed to search users:', error);
        }
    };

    const handleGrantAccess = async (e) => {
        e.preventDefault();

        try {
            await sharingAPI.grant(shareForm);

            setShowShareModal(false);
            setShareForm({
                reportId: '',
                sharedWithEmail: '',
                expiresAt: ''
            });
            setSearchEmail('');
            setSearchResults([]);

            loadData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to grant access');
        }
    };

    const handleRevokeAccess = async (id) => {
        if (!window.confirm('Are you sure you want to revoke this access?')) {
            return;
        }

        try {
            await sharingAPI.revoke(id);
            loadData();
        } catch (error) {
            console.error('Failed to revoke access:', error);
        }
    };

    const handleDownloadShared = async (reportId, fileName) => {
        try {
            const response = await sharingAPI.downloadShared(reportId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download shared report:', error);
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
            <div className="sharing-page">
                <div className="container">
                    <div className="page-header animate-fadeIn">
                        <div>
                            <h1>Access Control</h1>
                            <p>Manage report sharing with doctors, family, and friends</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowShareModal(true)}
                            disabled={myReports.length === 0}
                        >
                            <UserPlus size={20} />
                            Share Report
                        </button>
                    </div>

                    <div className="tabs animate-fadeIn">
                        <button
                            className={`tab ${activeTab === 'granted' ? 'active' : ''}`}
                            onClick={() => setActiveTab('granted')}
                        >
                            <Share2 size={18} />
                            Access Granted ({grantedAccess.length})
                        </button>
                        <button
                            className={`tab ${activeTab === 'received' ? 'active' : ''}`}
                            onClick={() => setActiveTab('received')}
                        >
                            <FileText size={18} />
                            Shared With Me ({receivedAccess.length})
                        </button>
                    </div>

                    {activeTab === 'granted' && (
                        <div className="tab-content animate-fadeIn">
                            {grantedAccess.length === 0 ? (
                                <div className="empty-state card">
                                    <Share2 size={64} className="empty-icon" />
                                    <h3>No access granted yet</h3>
                                    <p>Share your reports with doctors, family members, or friends</p>
                                </div>
                            ) : (
                                <div className="access-grid">
                                    {grantedAccess.map((access) => (
                                        <div key={access.id} className="access-card card">
                                            <div className="access-header">
                                                <div className="user-avatar-large">
                                                    {access.shared_with_name.charAt(0)}
                                                </div>
                                                <div className="access-info">
                                                    <h4>{access.shared_with_name}</h4>
                                                    <p className="email">
                                                        <Mail size={14} />
                                                        {access.shared_with_email}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="access-details">
                                                <div className="detail-row">
                                                    <span className="label">Report:</span>
                                                    <span className="value">{access.file_name}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Type:</span>
                                                    <span className="value">{access.report_type}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Granted:</span>
                                                    <span className="value">{formatDate(access.granted_at)}</span>
                                                </div>
                                                {access.expires_at && (
                                                    <div className="detail-row">
                                                        <span className="label">Expires:</span>
                                                        <span className="value">{formatDate(access.expires_at)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                className="btn btn-outline w-full"
                                                onClick={() => handleRevokeAccess(access.id)}
                                            >
                                                <Trash2 size={18} />
                                                Revoke Access
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'received' && (
                        <div className="tab-content animate-fadeIn">
                            {receivedAccess.length === 0 ? (
                                <div className="empty-state card">
                                    <FileText size={64} className="empty-icon" />
                                    <h3>No reports shared with you</h3>
                                    <p>Reports shared by others will appear here</p>
                                </div>
                            ) : (
                                <div className="reports-grid">
                                    {receivedAccess.map((access) => (
                                        <div key={access.access_id} className="shared-report-card card">
                                            <div className="shared-badge">Shared by {access.owner_name}</div>

                                            <div className="report-icon-large">
                                                <FileText size={32} />
                                            </div>

                                            <h4>{access.file_name}</h4>

                                            <div className="report-meta">
                                                <div className="meta-item">
                                                    <span className="label">Type:</span>
                                                    <span className="value">{access.report_type}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="label">Date:</span>
                                                    <span className="value">{formatDate(access.report_date)}</span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="label">Owner:</span>
                                                    <span className="value">{access.owner_email}</span>
                                                </div>
                                            </div>

                                            {access.notes && (
                                                <div className="report-notes">
                                                    <p>{access.notes}</p>
                                                </div>
                                            )}

                                            <button
                                                className="btn btn-accent w-full"
                                                onClick={() => handleDownloadShared(access.report_id, access.file_name)}
                                            >
                                                <FileText size={18} />
                                                View Report
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showShareModal && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Share Report</h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowShareModal(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleGrantAccess}>
                            <div className="input-group">
                                <label className="input-label">Select Report *</label>
                                <select
                                    className="input"
                                    value={shareForm.reportId}
                                    onChange={(e) => setShareForm({ ...shareForm, reportId: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a report</option>
                                    {myReports.map((report) => (
                                        <option key={report.id} value={report.id}>
                                            {report.file_name} - {report.report_type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Search User by Email *</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="Enter email address"
                                    value={searchEmail}
                                    onChange={(e) => handleSearchUsers(e.target.value)}
                                />

                                {searchResults.length > 0 && (
                                    <div className="search-results">
                                        {searchResults.map((user) => (
                                            <div
                                                key={user.id}
                                                className="search-result-item"
                                                onClick={() => {
                                                    setShareForm({ ...shareForm, sharedWithEmail: user.email });
                                                    setSearchEmail(user.email);
                                                    setSearchResults([]);
                                                }}
                                            >
                                                <div className="user-avatar-small">
                                                    {user.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="user-name">{user.full_name}</p>
                                                    <p className="user-email">{user.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {}
                                {shareForm.sharedWithEmail && searchResults.length === 0 && (
                                    <div className="selected-user">
                                        <span>✓ Selected: {shareForm.sharedWithEmail}</span>
                                        <button
                                            type="button"
                                            className="clear-selection"
                                            onClick={() => {
                                                setShareForm({ ...shareForm, sharedWithEmail: '' });
                                                setSearchEmail('');
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="input-group">
                                <label className="input-label">Expiration Date (Optional)</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={shareForm.expiresAt}
                                    onChange={(e) => setShareForm({ ...shareForm, expiresAt: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowShareModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={!shareForm.reportId || !shareForm.sharedWithEmail}
                                >
                                    <Share2 size={20} />
                                    Grant Access
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sharing;
