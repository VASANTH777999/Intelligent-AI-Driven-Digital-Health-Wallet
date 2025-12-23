import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { authAPI } from '../services/api';
import MedicalBackground from '../components/MedicalBackground';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await authAPI.register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password
            });

            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <MedicalBackground />
            <div className="auth-background">
                <div className="auth-shape shape-1"></div>
                <div className="auth-shape shape-2"></div>
                <div className="auth-shape shape-3"></div>
            </div>

            <div className="auth-content">
                <div className="auth-card animate-scaleIn">
                    <div className="auth-header">
                        <div className="auth-icon">
                            <Heart size={48} />
                        </div>
                        <h1>Create Account</h1>
                        <p>Join Health Wallet to manage your health records</p>
                    </div>

                    {error && (
                        <div className="alert alert-error animate-fadeIn">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label className="input-label">
                                <User size={18} />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                className="input"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <Mail size={18} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <Lock size={18} />
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="input"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <Lock size={18} />
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="input"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span>Creating Account...</span>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account?</p>
                        <Link to="/login" className="auth-link">
                            Login here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
