import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ roles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        // Exception: sudo_admin can access admin routes
        if (user.role === 'sudo_admin' && roles.includes('admin')) {
            return <Outlet />;
        }

        // Redirect if role not authorized
        // If expert tries to access admin route, send to Expert Dashboard
        if (user.role === 'expert') {
            return <Navigate to="/expert-dashboard" replace />;
        }
        // If admin tries to access expert route (not likely via this protection, but safe fallback)
        if (user.role === 'admin') {
            // Admins can mostly go anywhere, but if strict:
            // return <Navigate to="/dashboard" replace />;
            // Actually admins should probably have access. But if stricter:
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
