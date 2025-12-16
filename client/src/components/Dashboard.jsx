import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
        sectorRaw: []
    });
    const [recent, setRecent] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchRecent();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/msme/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Stats Error:', err);
        }
    };

    const fetchRecent = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/msme');
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
                    <div className="stat-icon bg-orange"><Briefcase color="white" /></div>
                    <div>
                        <h3>{stats.pending}</h3>
                        <p>Pending Cases</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-charts-row">
                <div className="card chart-card">
                    <h3 className="section-title">Assistance Breakdown (Sector)</h3>
                    <div style={{ width: '100%', height: 300, minHeight: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card list-card">
                    <h3 className="section-title">Recent Assistance</h3>
                    <div className="recent-list">
                        {recent.map((item) => (
                            <div key={item._id} className="recent-item" onClick={() => navigate(`/msme/${item._id}`)} style={{ cursor: 'pointer' }}>
                                <div className="recent-info">
                                    <h4>{item.businessName}</h4>
                                    <span>{item.entrepreneurName}</span>
                                </div>
                                <div className={`badge ${item.status === 'Resolved' ? 'bg-green' : 'bg-orange'}`} style={{ color: 'white', fontSize: '0.8rem' }}>
                                    {item.status || 'Pending'}
                                </div>
                            </div>
                        ))}
                        {recent.length === 0 && <p className="text-muted">No entries yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
