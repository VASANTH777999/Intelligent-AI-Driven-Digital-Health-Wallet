import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadReport from './pages/UploadReport';
import Reports from './pages/Reports';
import Vitals from './pages/Vitals';
import Sharing from './pages/Sharing';
import Analysis from './pages/Analysis';
import './index.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/upload"
                    element={
                        <ProtectedRoute>
                            <UploadReport />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reports"
                    element={
                        <ProtectedRoute>
                            <Reports />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vitals"
                    element={
                        <ProtectedRoute>
                            <Vitals />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/sharing"
                    element={
                        <ProtectedRoute>
                            <Sharing />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/analysis"
                    element={
                        <ProtectedRoute>
                            <Analysis />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
