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
    const [recent, setRecent] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchRecent();
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

    const fetchRecent = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await axios.get(`${API_URL}/api/msme`);
            setRecent(res.data.slice(0, 5));
        } catch (err) {
            console.error('Recent Error:', err);
        }
    };

    // Use sector data directly from API if available
    const chartData = stats.sectorRaw && stats.sectorRaw.length > 0 ? stats.sectorRaw : [
        { name: 'No Data', value: 0 }
    ];

    return (
        <div className="dashboard-container">
            <div className="stats-grid">
                <div className="stat-card" onClick={() => navigate('/list')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon bg-blue"><Users color="white" /></div>
                    <div>
                        <h3>{stats.total}</h3>
                        <p>Total Assisted</p>
                    </div>
                </div>
                <div className="stat-card" onClick={() => navigate('/list?status=Resolved')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon bg-green"><Factory color="white" /></div>
                    <div>
                        <h3>{stats.resolved}</h3>
                        <p>Cases Resolved</p>
                    </div>
                </div>
                <div className="stat-card" onClick={() => navigate('/list?status=Pending')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon bg-rose"><Briefcase color="white" /></div>
                    <div>
                        <h3>{stats.pending}</h3>
                        <p>Pending Cases</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-charts-row" style={{ marginTop: '2rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Chart 1: Udyam Progress */}
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>Udyam Registration</h3>
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

                {/* Chart 2: Activity Mix */}
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 className="section-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>Team Activities</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Events', value: (stats.performance?.find(p => p.name === 'Events')?.value || 0) },
                                        { name: 'Initiatives', value: (stats.performance?.find(p => p.name === 'Team Initiatives')?.value || 0) }
                                    ]}
                                    cx="50%" cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        return percent > 0 ? `${(percent * 100).toFixed(0)}%` : '';
                                    }}
                                >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#8b5cf6" />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                        Events & Team Initiatives
                    </div>
                </div>

                {/* Chart 3: Case Resolution */}
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
                    <h3 className="section-title">Recent Assistance</h3>
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
