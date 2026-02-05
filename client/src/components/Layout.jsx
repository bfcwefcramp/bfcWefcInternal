import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Building2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const [totalCount, setTotalCount] = useState(0);
    const { user, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const res = await axios.get(`${API_URL}/api/msme/stats`);
                setTotalCount(res.data.total);
            } catch (err) {
                console.error('Error fetching count:', err);
            }
        };
        fetchCount();
        // Poll every 30 seconds or trigger on updates (here simplified)
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Building2 size={32} color="#f59e0b" />
                    <div>
                        <h1>BFC & WEFC</h1>
                        <span>Facilitation Portal</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link to="/list" className={`nav-item ${isActive('/list') ? 'active' : ''}`}>
                        <FileText size={20} />
                        Visited MSMEs
                    </Link>
                    <Link to="/form" className={`nav-item ${isActive('/form') ? 'active' : ''}`}>
                        <FileText size={20} />
                        New Entry
                    </Link>
                    <Link to="/experts" className={`nav-item ${isActive('/experts') ? 'active' : ''}`}>
                        <Users size={20} />
                        Experts
                    </Link>
                    <Link to="/events" className={`nav-item ${isActive('/events') ? 'active' : ''}`}>
                        <Calendar size={20} />
                        Events & Workshops
                    </Link>
                    {user?.role === 'sudo_admin' && (
                        <Link to="/users" className={`nav-item ${isActive('/users') ? 'active' : ''}`}>
                            <Users size={20} />
                            Users
                        </Link>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <p>© 2024 DITC</p>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                            <h2 className="page-title">
                                {location.pathname === '/' ? 'Dashboard' :
                                    location.pathname === '/form' ? 'Assistance Form' :
                                        location.pathname === '/events' ? 'Events & Field Work' : 'Expert Profiles'}
                            </h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div className="total-stat" style={{ padding: '0.5rem 1rem', background: '#f59e0b1a', borderRadius: '8px', border: '1px solid #f59e0b33', color: '#b45309', fontWeight: '600' }}>
                                Total Reached: {totalCount}
                            </div>
                            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div className="avatar"> {user?.username?.charAt(0).toUpperCase() || 'A'} </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.username || 'Admin'}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    style={{
                                        padding: '0.4rem 0.8rem', fontSize: '0.8rem',
                                        color: '#ef4444', border: '1px solid #ef4444',
                                        background: 'transparent', borderRadius: '4px', cursor: 'pointer'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="content-area">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
