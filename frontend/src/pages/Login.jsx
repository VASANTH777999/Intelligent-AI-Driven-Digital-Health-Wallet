import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Mail, Lock, ArrowRight } from 'lucide-react';
import { authAPI } from '../services/api';
import MedicalBackground from '../components/MedicalBackground';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const successMessage = location.state?.message;

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
        setLoading(true);

        try {
            const response = await authAPI.login(formData);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
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
                        <h1>Welcome Back</h1>
                        <p>Login to access your health wallet</p>
                    </div>

                    {successMessage && (
                        <div className="alert alert-success animate-fadeIn">
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-error animate-fadeIn">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
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
                                placeholder="Enter your password"
                                value={formData.password}
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
                                <span>Logging in...</span>
                            ) : (
                                <>
                                    <span>Login</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Don't have an account?</p>
                        <Link to="/register" className="auth-link">
                            Register here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
