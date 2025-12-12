import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Building2 } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const [totalCount, setTotalCount] = useState(0);

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/msme/stats');
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
                                    location.pathname === '/form' ? 'Assistance Form' : 'Expert Profiles'}
                            </h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div className="total-stat" style={{ padding: '0.5rem 1rem', background: '#f59e0b1a', borderRadius: '8px', border: '1px solid #f59e0b33', color: '#b45309', fontWeight: '600' }}>
                                Total Reached: {totalCount}
                            </div>
                            <div className="user-profile">
                                <div className="avatar">A</div>
                                <span>Admin User</span>
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
