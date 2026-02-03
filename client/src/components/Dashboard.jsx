import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
    PieChart, Pie, AreaChart, Area
} from 'recharts';
import { Users, Briefcase, Factory, TrendingUp, Calendar, Zap, Award, Target, Activity, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
const EVENT_COLORS = ['#8b5cf6', '#06b6d4', '#fbcfe8', '#f59e0b']; // Purple, Cyan, Pink, Amber

// Simple Modal Component
const EventModal = ({ event, onClose }) => {
    if (!event) return null;
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <X size={24} color="#6b7280" />
                </button>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1f2937' }}>{event.name}</h3>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#4b5563' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={16} /> {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Briefcase size={16} /> {event.type}</span>
                </div>
                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#374151' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Description / Minutes:</h4>
                    {event.description || 'No detailed description available.'}
                </div>
                <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button onClick={onClose} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [masterStats, setMasterStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        fetchMasterStats();
        const interval = setInterval(fetchMasterStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchMasterStats = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await axios.get(`${API_URL}/api/master/stats`);
            setMasterStats(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Master Stats Error:', err);
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Analytics...</div>;
    if (!masterStats) return null;

    // Use "breakdown" fields directly for chart
    const momData = [
        { name: 'Exhibitions', value: masterStats.breakdown?.exhibitions || 0 },
        { name: 'Dept. Visits', value: masterStats.breakdown?.deptVisits || 0 }
    ];

    return (
        <div className="dashboard-container">
            {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.5rem' }}>Global Analytics Dashboard</h2>
                    <p style={{ color: '#6b7280' }}>Real-time overview of BFC & WEFC Performance</p>
                </div>
                <button
                    onClick={fetchMasterStats}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Activity size={18} /> Refresh Data
                </button>
            </div>

            {/* 1. KEY METRICS CARDS (Removed Total) */}
            <div className="stats-grid">
                <div className="stat-card" style={{ borderLeft: '5px solid #ec4899' }}>
                    <div className="stat-icon" style={{ background: '#fce7f3' }}><Users color="#ec4899" /></div>
                    <div>
                        <h3>{masterStats.uniqueBeneficiaries || 0}</h3>
                        <p>Unique Beneficiaries</p>
                    </div>
                </div>

                <div className="stat-card" style={{ borderLeft: '5px solid #10b981' }}>
                    <div className="stat-icon" style={{ background: '#d1fae5' }}><Award color="#10b981" /></div>
                    <div>
                        <h3>{masterStats.udyamCount}</h3>
                        <p>Udyam Registered</p>
                    </div>
                </div>

                <div className="stat-card" style={{ borderLeft: '5px solid #8b5cf6' }}>
                    <div className="stat-icon" style={{ background: '#f3e8ff' }}><Briefcase color="#8b5cf6" /></div>
                    <div>
                        <h3>{masterStats.breakdown.workshops}</h3>
                        <p>Workshops Conducted</p>
                    </div>
                </div>
            </div>

            {/* 2. MAIN CHARTS ROW */}
            <div className="dashboard-charts-row" style={{ marginTop: '1rem' }}>

                {/* Visual 1: Monthly Trends (Area Chart) */}
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} className="text-blue-500" /> Monthly Growth Trend
                    </h3>
                    <div style={{ height: 320, width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={masterStats.monthlyInterventions}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Visual 2: Events vs Visits Breakdown (Pie) - REPLACED ORG SPLIT */}
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                    <h3 className="section-title">Events & Visits</h3>
                    <div style={{ flex: 1, minHeight: 250, position: 'relative' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={momData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {momData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Exhibitions' ? '#8b5cf6' : '#06b6d4'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                                {(masterStats.breakdown?.exhibitions || 0) + (masterStats.breakdown?.deptVisits || 0)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Activities</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. RECENT EVENTS LIST (Expanded & Clickable) */}
            <div className="dashboard-charts-row" style={{ marginTop: '1rem', gridTemplateColumns: '1fr' }}>
                <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Recent Events, Workshops & Visits</h3>
                    <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#4b5563' }}>Date</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#4b5563' }}>Event / Activity Name</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#4b5563' }}>Category</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: '#4b5563' }}>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {masterStats.eventsList.map((event, idx) => (
                                    <tr
                                        key={idx}
                                        style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onClick={() => setSelectedEvent(event)}
                                        className="hover-row"
                                    >
                                        <td style={{ padding: '1rem', color: '#6b7280' }}>
                                            {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 600, color: '#1f2937' }}>{event.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                                background: event.type.includes('Exhibition') ? '#f3e8ff' :
                                                    event.type.includes('Department') ? '#ecfeff' :
                                                        event.type.includes('Workshop') ? '#fff7ed' : '#f0f9ff',
                                                color: event.type.includes('Exhibition') ? '#7e22ce' :
                                                    event.type.includes('Department') ? '#0e7490' :
                                                        event.type.includes('Workshop') ? '#c2410c' : '#0369a1'
                                            }}>
                                                {event.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>Details &rarr;</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
