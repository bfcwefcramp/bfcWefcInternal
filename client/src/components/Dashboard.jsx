import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, Factory, ShoppingBag } from 'lucide-react';
import './Dashboard.css'; // We'll create this

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        breakdown: { manufacturing: 0, services: 0, trading: 0 }
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
            const res = await axios.get('http://localhost:5001/api/msme'); // Use limit/sort in backend ideally
            setRecent(res.data.slice(0, 5)); // Just take first 5
        } catch (err) {
            console.error('Recent Error:', err);
        }
    };

    const data = [
        { name: 'Manufacturing', value: stats.breakdown.manufacturing },
        { name: 'Services', value: stats.breakdown.services },
        { name: 'Trading', value: stats.breakdown.trading },
    ];

    return (
        <div className="dashboard-container">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon bg-blue"><Users color="white" /></div>
                    <div>
                        <h3>{stats.total}</h3>
                        <p>Total Assisted</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-green"><Factory color="white" /></div>
                    <div>
                        <h3>{stats.breakdown.manufacturing}</h3>
                        <p>Manufacturing</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-orange"><Briefcase color="white" /></div>
                    <div>
                        <h3>{stats.breakdown.services}</h3>
                        <p>Services</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-purple"><ShoppingBag color="white" /></div>
                    <div>
                        <h3>{stats.breakdown.trading}</h3>
                        <p>Trading</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-charts-row">
                <div className="card chart-card">
                    <h3 className="section-title">Assistance Breakdown</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={data}>
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
                            <div key={item._id} className="recent-item">
                                <div className="recent-info">
                                    <h4>{item.businessName}</h4>
                                    <span>{item.entrepreneurName}</span>
                                </div>
                                <div className="recent-type badge">{item.businessType}</div>
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
