import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Building2 } from 'lucide-react';
import './Layout.css'; // We will create this or use inline/modules

const Layout = ({ children }) => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

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
                    <h2 className="page-title">
                        {location.pathname === '/' ? 'Dashboard' :
                            location.pathname === '/form' ? 'Assistance Form' : 'Expert Profiles'}
                    </h2>
                    <div className="user-profile">
                        <div className="avatar">A</div>
                        <span>Admin User</span>
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
