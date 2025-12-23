import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, Calendar, X, Plus, Sparkles, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import MedicalBackground from '../components/MedicalBackground';
import { reportsAPI } from '../services/api';
import './UploadReport.css';

const UploadReport = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        reportType: '',
        reportDate: '',
        notes: ''
    });
    const [vitals, setVitals] = useState([]);
    const [newVital, setNewVital] = useState({ type: '', value: '', unit: '' });
    const [extractedVitals, setExtractedVitals] = useState([]);
    const [extracting, setExtracting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadedVitals, setUploadedVitals] = useState([]);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const extractionTimeoutRef = useRef(null);

    const reportTypes = [
        'Blood Test',
        'X-Ray',
        'MRI Scan',
        'CT Scan',
        'Ultrasound',
        'ECG',
        'Prescription',
        'Vaccination Record',
        'Other'
    ];

    // Auto-extract vitals when form data changes
    useEffect(() => {
        console.log('🔍 Extraction useEffect triggered', {
            reportType: formData.reportType,
            reportDate: formData.reportDate,
            notes: formData.notes
        });

        // Clear previous timeout
        if (extractionTimeoutRef.current) {
            clearTimeout(extractionTimeoutRef.current);
        }

        // Only extract if we have required fields
        if (formData.reportType && formData.reportDate) {
            console.log('✅ Required fields present, scheduling extraction...');

            // Debounce extraction by 800ms
            extractionTimeoutRef.current = setTimeout(async () => {
                console.log('🚀 Starting vital extraction...');
                setExtracting(true);
                try {
                    const response = await reportsAPI.extractVitals({
                        reportType: formData.reportType,
                        reportDate: formData.reportDate,
                        notes: formData.notes
                    });
                    console.log('✅ Extraction response:', response.data);
                    const vitals = response.data.vitals || [];
                    console.log('📊 Extracted vitals:', vitals);
                    setExtractedVitals(vitals);
                } catch (err) {
                    console.error('❌ Failed to extract vitals:', err);
                    setExtractedVitals([]);
                } finally {
                    setExtracting(false);
                }
            }, 800);
        } else {
            console.log('⚠️ Missing required fields, clearing extracted vitals');
            setExtractedVitals([]);
        }

        return () => {
            if (extractionTimeoutRef.current) {
                clearTimeout(extractionTimeoutRef.current);
            }
        };
    }, [formData.reportType, formData.reportDate, formData.notes]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

        if (!validTypes.includes(selectedFile.type)) {
            setError('Invalid file type. Only PDF, JPG, and PNG are allowed.');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
        setError('');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const addVital = () => {
        if (newVital.type && newVital.value && newVital.unit) {
            setVitals([...vitals, newVital]);
            setNewVital({ type: '', value: '', unit: '' });
        }
    };

    const removeVital = (index) => {
        setVitals(vitals.filter((_, i) => i !== index));
    };

    const removeExtractedVital = (index) => {
        setExtractedVitals(extractedVitals.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        if (!formData.reportType || !formData.reportDate) {
            setError('Please fill in all required fields');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('reportType', formData.reportType);
            uploadData.append('reportDate', formData.reportDate);
            uploadData.append('notes', formData.notes);

            // Combine extracted vitals and manually added vitals
            const allVitals = [...extractedVitals, ...vitals];
            if (allVitals.length > 0) {
                uploadData.append('vitals', JSON.stringify(allVitals));
            }

            const response = await reportsAPI.upload(uploadData);
            console.log('📤 Upload response:', response.data);

            // Show success state with extracted vitals instead of redirecting
            setUploadSuccess(true);
            setUploadedVitals(allVitals);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload report');
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Navbar />
            <MedicalBackground />
            <div className="upload-page">
                <div className="container">
                    {!uploadSuccess ? (
                        <>
                            <div className="page-header animate-fadeIn">
                                <h1>Upload Health Report</h1>
                                <p>Add a new medical report to your health wallet</p>
                            </div>

                            {error && (
                                <div className="alert alert-error animate-fadeIn">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="upload-form">
                                <div className="upload-grid">
                                    <div className="upload-section animate-slideInLeft">
                                        <h3>File Upload</h3>

                                        <div
                                            className={`dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            {file ? (
                                                <div className="file-preview">
                                                    <FileText size={48} />
                                                    <p className="file-name">{file.name}</p>
                                                    <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline mt-md"
                                                        onClick={() => setFile(null)}
                                                    >
                                                        <X size={20} />
                                                        Remove File
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadIcon size={48} className="upload-icon" />
                                                    <p className="dropzone-text">Drag and drop your file here</p>
                                                    <p className="dropzone-subtext">or</p>
                                                    <label className="btn btn-primary">
                                                        <UploadIcon size={20} />
                                                        Choose File
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            onChange={(e) => handleFileSelect(e.target.files[0])}
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                    <p className="file-types">Supported: PDF, JPG, PNG (Max 10MB)</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="upload-section animate-slideInRight">
                                        <h3>Report Details</h3>

                                        <div className="input-group">
                                            <label className="input-label">Report Type *</label>
                                            <select
                                                name="reportType"
                                                className="input"
                                                value={formData.reportType}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select report type</option>
                                                {reportTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">
                                                <Calendar size={18} />
                                                Report Date *
                                            </label>
                                            <input
                                                type="date"
                                                name="reportDate"
                                                className="input"
                                                value={formData.reportDate}
                                                onChange={handleChange}
                                                max={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Notes (Optional)</label>
                                            <textarea
                                                name="notes"
                                                className="input"
                                                placeholder="Add any additional notes..."
                                                value={formData.notes}
                                                onChange={handleChange}
                                                rows="4"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Extracted Vitals Section */}
                                {(() => {
                                    console.log('🎨 Rendering extracted vitals section check:', {
                                        extracting,
                                        extractedVitalsLength: extractedVitals.length,
                                        extractedVitals,
                                        shouldShow: extracting || extractedVitals.length > 0
                                    });
                                    return (extracting || extractedVitals.length > 0) && (
                                        <div className="vitals-section card animate-fadeIn" style={{ marginTop: '2rem' }}>
                                            <h3>
                                                <Sparkles size={24} style={{ marginRight: '0.5rem', color: '#10b981' }} />
                                                AI-Extracted Vitals
                                            </h3>
                                            <p className="section-description">
                                                {extracting
                                                    ? 'Analyzing report for vital signs...'
                                                    : `Found ${extractedVitals.length} vital${extractedVitals.length !== 1 ? 's' : ''} from your report`
                                                }
                                            </p>

                                            {extracting ? (
                                                <div className="extraction-loading">
                                                    <Loader className="spinner" size={32} />
                                                    <p>Extracting vitals using AI...</p>
                                                </div>
                                            ) : extractedVitals.length > 0 ? (
                                                <div className="vitals-list">
                                                    {extractedVitals.map((vital, index) => (
                                                        <div key={index} className="vital-tag extracted">
                                                            <Sparkles size={16} style={{ color: '#10b981' }} />
                                                            <span>{vital.type}: {vital.value} {vital.unit}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExtractedVital(index)}
                                                                className="remove-btn"
                                                                title="Remove this vital"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })()}

                                <div className="vitals-section card animate-fadeIn">
                                    <h3>Associated Vitals (Optional)</h3>
                                    <p className="section-description">Manually add additional vital readings from this report</p>

                                    <div className="vitals-input">
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Vital type (e.g., Blood Pressure)"
                                            value={newVital.type}
                                            onChange={(e) => setNewVital({ ...newVital, type: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            className="input"
                                            placeholder="Value"
                                            value={newVital.value}
                                            onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Unit (e.g., mmHg)"
                                            value={newVital.unit}
                                            onChange={(e) => setNewVital({ ...newVital, unit: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-accent"
                                            onClick={addVital}
                                        >
                                            <Plus size={20} />
                                            Add
                                        </button>
                                    </div>

                                    {vitals.length > 0 && (
                                        <div className="vitals-list">
                                            {vitals.map((vital, index) => (
                                                <div key={index} className="vital-tag">
                                                    <span>{vital.type}: {vital.value} {vital.unit}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVital(index)}
                                                        className="remove-btn"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => navigate('/dashboard')}
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <UploadIcon size={20} />
                                                Upload Report
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        // Success State - Show Uploaded Vitals
                        <>
                            <div className="page-header animate-fadeIn">
                                <h1>✅ Report Uploaded Successfully!</h1>
                                <p>Your health report has been saved and vitals have been extracted</p>
                            </div>

                            {uploadedVitals.length > 0 && (
                                <div className="vitals-section card animate-fadeIn">
                                    <h3>
                                        <Sparkles size={24} style={{ marginRight: '0.5rem', color: '#10b981' }} />
                                        Extracted & Saved Vitals
                                    </h3>
                                    <p className="section-description">
                                        {uploadedVitals.length} vital{uploadedVitals.length !== 1 ? 's' : ''} extracted and saved to your vitals tracking
                                    </p>

                                    <div className="vitals-list">
                                        {uploadedVitals.map((vital, index) => (
                                            <div key={index} className="vital-tag extracted">
                                                <Sparkles size={16} style={{ color: '#10b981' }} />
                                                <span>{vital.type}: {vital.value} {vital.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => navigate('/reports')}
                                >
                                    Next → View Reports
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default UploadReport;
