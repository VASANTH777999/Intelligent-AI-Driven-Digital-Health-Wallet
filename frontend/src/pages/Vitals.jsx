import { useState, useEffect } from 'react';
import { Activity, Plus, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Navbar from '../components/Navbar';
import MedicalBackground from '../components/MedicalBackground';
import { vitalsAPI } from '../services/api';
import './Vitals.css';

const Vitals = () => {
    const [vitals, setVitals] = useState([]);
    const [vitalTypes, setVitalTypes] = useState([]);
    const [selectedType, setSelectedType] = useState('');
    const [chartData, setChartData] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        vitalType: '',
        value: '',
        unit: '',
        recordedAt: new Date().toISOString().split('T')[0],
        notes: ''
    });

    const commonVitals = [
        { type: 'Blood Pressure', unit: 'mmHg' },
        { type: 'Heart Rate', unit: 'bpm' },
        { type: 'Blood Sugar', unit: 'mg/dL' },
        { type: 'Temperature', unit: '°F' },
        { type: 'Weight', unit: 'kg' },
        { type: 'Height', unit: 'cm' },
        { type: 'Oxygen Saturation', unit: '%' }
    ];

    useEffect(() => {
        loadVitals();
    }, []);

    useEffect(() => {
        if (selectedType) {
            loadTrends();
        }
    }, [selectedType]);

    const loadVitals = async () => {
        try {
            const [vitalsRes, typesRes] = await Promise.all([
                vitalsAPI.getAll(),
                vitalsAPI.getTypes()
            ]);

            setVitals(vitalsRes.data);
            setVitalTypes(typesRes.data);

            if (typesRes.data.length > 0) {
                setSelectedType(typesRes.data[0]);
            }
        } catch (error) {
            console.error('Failed to load vitals:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTrends = async () => {
        try {
            const response = await vitalsAPI.getTrends({ vitalType: selectedType });
            const formatted = response.data.map(v => ({
                date: new Date(v.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: parseFloat(v.value),
                fullDate: v.recorded_at
            }));
            setChartData(formatted);
        } catch (error) {
            console.error('Failed to load trends:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await vitalsAPI.add(formData);

            setShowAddForm(false);
            setFormData({
                vitalType: '',
                value: '',
                unit: '',
                recordedAt: new Date().toISOString().split('T')[0],
                notes: ''
            });

            loadVitals();
        } catch (error) {
            console.error('Failed to add vital:', error);
        }
    };

    const handleVitalSelect = (vital) => {
        setFormData({
            ...formData,
            vitalType: vital.type,
            unit: vital.unit
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
            <div className="vitals-page">
                <div className="container">
                    <div className="page-header animate-fadeIn">
                        <div>
                            <h1>Vitals Tracking</h1>
                            <p>Monitor your health vitals over time</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddForm(!showAddForm)}
                        >
                            <Plus size={20} />
                            Add Vital
                        </button>
                    </div>

                    {showAddForm && (
                        <div className="add-vital-form card animate-scaleIn">
                            <h3>Add New Vital Reading</h3>

                            <div className="quick-select">
                                <p>Quick Select:</p>
                                <div className="vital-chips">
                                    {commonVitals.map((vital) => (
                                        <button
                                            key={vital.type}
                                            type="button"
                                            className="vital-chip"
                                            onClick={() => handleVitalSelect(vital)}
                                        >
                                            {vital.type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label className="input-label">Vital Type *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g., Blood Pressure"
                                            value={formData.vitalType}
                                            onChange={(e) => setFormData({ ...formData, vitalType: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Value *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="input"
                                            placeholder="Enter value"
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Unit *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g., mmHg"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Date *</label>
                                        <input
                                            type="date"
                                            className="input"
                                            value={formData.recordedAt}
                                            onChange={(e) => setFormData({ ...formData, recordedAt: e.target.value })}
                                            max={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Notes (Optional)</label>
                                    <textarea
                                        className="input"
                                        placeholder="Add any notes..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => setShowAddForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        <Plus size={20} />
                                        Add Vital
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {vitalTypes.length === 0 ? (
                        <div className="empty-state card animate-fadeIn">
                            <Activity size={64} className="empty-icon" />
                            <h3>No vitals tracked yet</h3>
                            <p>Start tracking your health vitals to see trends and insights</p>
                        </div>
                    ) : (
                        <>
                            <div className="trends-section card animate-fadeIn">
                                <div className="trends-header">
                                    <div>
                                        <h2>
                                            <TrendingUp size={24} />
                                            Vitals Trends
                                        </h2>
                                        <p>Visualize your health data over time</p>
                                    </div>

                                    <select
                                        className="input"
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        style={{ maxWidth: '250px' }}
                                    >
                                        {vitalTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                {chartData.length > 0 ? (
                                    <div className="chart-container">
                                        <ResponsiveContainer width="100%" height={400}>
                                            <LineChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="#94a3b8"
                                                    style={{ fontSize: '0.875rem' }}
                                                />
                                                <YAxis
                                                    stroke="#94a3b8"
                                                    style={{ fontSize: '0.875rem' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: '#1e293b',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '0.5rem',
                                                        color: '#f1f5f9'
                                                    }}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#6366f1"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#6366f1', r: 6 }}
                                                    activeDot={{ r: 8 }}
                                                    fillOpacity={1}
                                                    fill="url(#colorValue)"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="no-data">
                                        <p>No data available for this vital type</p>
                                    </div>
                                )}
                            </div>

                            <div className="vitals-list-section animate-fadeIn">
                                <h2>All Readings</h2>
                                <div className="vitals-table-container">
                                    <table className="vitals-table">
                                        <thead>
                                            <tr>
                                                <th>Vital Type</th>
                                                <th>Value</th>
                                                <th>Date</th>
                                                <th>Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vitals.map((vital) => (
                                                <tr key={vital.id}>
                                                    <td>
                                                        <div className="vital-type-cell">
                                                            <Activity size={18} />
                                                            {vital.vital_type}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="vital-value">
                                                            {vital.value} <span className="unit">{vital.unit}</span>
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="date-cell">
                                                            <Calendar size={14} />
                                                            {new Date(vital.recorded_at).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td>{vital.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Vitals;
