import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Users, Briefcase, Factory, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        resolved: 0,
        pending: 0,
        area: [],
        sector: [],
        sectorRaw: [],
        performance: []
    });
    const [eventStats, setEventStats] = useState({ total: 0, data: [] });
    const [recent, setRecent] = useState([]);
    const [masterStats, setMasterStats] = useState(null);

    useEffect(() => {
        fetchStats();
        fetchRecent();
        fetchEventStats();
        fetchMasterStats();
    }, []);

    const fetchStats = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await axios.get(`${API_URL}/api/msme/stats`);
            setStats(res.data);
        } catch (err) {
            console.error('Stats Error:', err);
        }
    };

    const fetchEventStats = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await axios.get(`${API_URL}/api/msme/event-stats`);
            setEventStats(res.data);
        } catch (err) {
            console.error('Event Stats Error:', err);
        }
    };

    const fetchMasterStats = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await axios.get(`${API_URL}/api/master/stats`);
            setMasterStats(res.data);
        } catch (err) {
            console.error('Master Stats Error:', err);
        }
    };

    const fetchRecent = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await axios.get(`${API_URL}/api/msme`);
            setRecent(res.data.slice(0, 5));
        } catch (err) {
            console.error('Recent Error:', err);
        }
    };

    return (
        <div className="dashboard-container">
            {/* 1. KEY METRICS ROW */}
            <div className="stats-grid">
                <div className="stat-card" onClick={() => navigate('/list')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon bg-blue"><Users color="white" /></div>
                    <div>
                        <h3>{stats.total}</h3>
                        <p>Walk-in Assisted</p>
                    </div>
                </div>

                {masterStats && (
                    <>
                        <div className="stat-card">
                            <div className="stat-icon bg-purple"><Briefcase color="white" /></div>
                            <div>
                                <h3>{masterStats.breakdown.events}</h3>
                                <p>Events Organized</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon bg-orange"><Briefcase color="white" /></div>
                            <div>
                                <h3>{masterStats.breakdown.workshops}</h3>
                                <p>Workshops Conducted</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon bg-green"><Factory color="white" /></div>
                            <div>
                                <h3>{masterStats.udyamCount}</h3>
                                <p>Udyam Registered</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* 2. MASTER DB CHARTS (New Section) */}
            {masterStats && masterStats.eventsList.length > 0 && (
                <div className="dashboard-charts-row" style={{ marginTop: '2rem' }}>
                    <div className="card" style={{ padding: '1.5rem', width: '100%' }}>
                        <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>Team Performance: Events & Workshops</h3>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={masterStats.eventsList.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} fontSize={11} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" name="Participants/Registrations" fill="#8884d8">
                                        {masterStats.eventsList.slice(0, 15).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.type === 'Workshop' ? '#f59e0b' : '#8b5cf6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                            <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#8b5cf6', marginRight: 5 }}></span> Events
                            <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#f59e0b', marginLeft: 15, marginRight: 5 }}></span> Workshops
                        </div>
                    </div>
                </div>
            )}

            {/* 3. EXISTING CHARTS (Walk-in & Resolution) */}
            <div className="dashboard-charts-row" style={{ marginTop: '2rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Chart 1: Udyam Progress (Walk-ins) */}
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>Walk-in Udyam Status</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Registered', value: (stats.performance?.find(p => p.name === 'Udyam Reg.')?.value || 0) },
                                        { name: 'Pending', value: (stats.total || 0) - (stats.performance?.find(p => p.name === 'Udyam Reg.')?.value || 0) }
                                    ]}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#e5e7eb" />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Case Resolution */}
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>Case Resolution</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Resolved', value: stats.resolved || 0 },
                                        { name: 'Pending', value: stats.pending || 0 }
                                    ]}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-charts-row">
                <div className="card list-card" style={{ width: '100%' }}>
                    <h3 className="section-title">Recent Walk-ins</h3>
                    <div className="recent-list">
                        {recent.map((item) => (
                            <div key={item._id} className="recent-item" onClick={() => navigate(`/msme/${item._id}`)} style={{ cursor: 'pointer' }}>
                                <div className="recent-info">
                                    <h4>{item.businessName}</h4>
                                    <span>{item.entrepreneurName}</span>
                                </div>
                                <div className={`badge ${item.status === 'Resolved' ? 'bg-green' : 'bg-rose'}`} style={{ color: 'white', fontSize: '0.8rem' }}>
                                    {item.status || 'Pending'}
                                </div>
                            </div>
                        ))}
                        {recent.length === 0 && <p className="text-muted">No entries yet.</p>}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
