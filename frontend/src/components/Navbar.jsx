import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Home, Upload, FileText, Activity, Share2, Brain, Menu, X, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-brand">
                    <Heart className="brand-icon" />
                    <span>Health Wallet</span>
                </Link>

                <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
                    <Link
                        to="/dashboard"
                        className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        <Home size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/upload"
                        className={`nav-link ${isActive('/upload') ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        <Upload size={20} />
                        <span>Upload</span>
                    </Link>

                    <Link
                        to="/reports"
                        className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        <FileText size={20} />
                        <span>Reports</span>
                    </Link>

                    <Link
                        to="/vitals"
                        className={`nav-link ${isActive('/vitals') ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        <Activity size={20} />
                        <span>Vitals</span>
                    </Link>

                    <Link
                        to="/sharing"
                        className={`nav-link ${isActive('/sharing') ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        <Share2 size={20} />
                        <span>Sharing</span>
                    </Link>

                    <Link
                        to="/analysis"
                        className={`nav-link ${isActive('/analysis') ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        <Brain size={20} />
                        <span>AI Analysis</span>
                    </Link>

                    <div className="navbar-user">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <span className="user-name">{user?.fullName || 'User'}</span>
                        </div>
                        <button onClick={handleLogout} className="btn-logout">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
