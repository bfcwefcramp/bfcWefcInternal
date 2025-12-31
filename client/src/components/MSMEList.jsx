

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Filter, Search, X, ChevronDown } from 'lucide-react';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const MSMEList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [msmes, setMsmes] = useState([]);
    const [stats, setStats] = useState({ area: [], sector: [], sectorRaw: [] });
    const [loading, setLoading] = useState(true);

    // Initial Filters
    const initialFilters = {
        area: '',
        sector: '',
        rawSector: '',
        enterpriseType: '',
        status: '',
        search: '',
        startDate: '',
        endDate: ''
    };

    const [filters, setFilters] = useState(() => {
        const params = new URLSearchParams(location.search);
        return {
            area: params.get('area') || '',
            sector: params.get('sector') || '',
            rawSector: params.get('rawSector') || '',
            enterpriseType: params.get('enterpriseType') || '',
            status: params.get('status') || '',
            search: params.get('search') || '',
            startDate: params.get('startDate') || '',
            endDate: params.get('endDate') || ''
        };
    });

    // UI State for Filter Menu
    const [activeFilterMenu, setActiveFilterMenu] = useState(null); // 'area', 'sector', 'date', 'category'

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            Object.keys(filters).forEach(key =>
                (filters[key] === '' || filters[key] === null) && params.delete(key)
            );

            const [listRes, statsRes] = await Promise.all([
                axios.get(`http://localhost:5001/api/msme?${params.toString()}`),
                axios.get('http://localhost:5001/api/msme/stats')
            ]);

            setMsmes(listRes.data);
            setStats({
                area: statsRes.data.area,
                sector: statsRes.data.sector, // Grouped
                sectorRaw: statsRes.data.sectorRaw // Raw for Bar Chart
            });
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        // Only update if explicit params are passed
        if (params.get('status')) setFilters(prev => ({ ...prev, status: params.get('status') }));
        if (params.get('area')) setFilters(prev => ({ ...prev, area: params.get('area') }));
        if (params.get('sector')) setFilters(prev => ({ ...prev, sector: params.get('sector'), rawSector: '' }));
    }, [location.search]);

    const handleFilterChange = (key, value) => {
        // If setting sector (broad), clear rawSector (exact) and vice versa
        if (key === 'sector') {
            setFilters(prev => ({ ...prev, sector: value, rawSector: '' }));
        } else if (key === 'rawSector') {
            setFilters(prev => ({ ...prev, rawSector: value, sector: '' }));
        } else {
            setFilters(prev => ({ ...prev, [key]: value }));
        }
    };

    const resetFilters = () => {
        setFilters(initialFilters);
        setActiveFilterMenu(null);
    };

    // Chart Click Handlers
    const onAreaClick = (data) => {
        if (data && data.activePayload && data.activePayload[0]) {
            handleFilterChange('area', data.activePayload[0].payload.name);
        }
    };

    const onSectorClick = (data) => {
        // Pie Chart click -> Broad Category Filter
        if (data && data.name) {
            if (data.name !== 'Others') {
                handleFilterChange('sector', data.name);
            }
        }
    };

    const onRawSectorClick = (data) => {
        // Bar Chart click -> Exact Raw Filter
        if (data && data.activePayload && data.activePayload[0]) {
            handleFilterChange('rawSector', data.activePayload[0].payload.name);
        }
    };


    return (
        <div className="dashboard-container">
            <h2 className="title">Visited MSMEs Analysis</h2>

            {/* Charts Section */}
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Chart 1: Area */}
                <div className="card chart-card">
                    <h3>Area Wise Distribution</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.area} onClick={onAreaClick} style={{ cursor: 'pointer' }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" fill="#8884d8" name="Count">
                                    {stats.area?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Sector Grouped */}
                <div className="card chart-card">
                    <h3>Sector Wise (Grouped)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.sector}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="50%"
                                    outerRadius="80%"
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="value"
                                    label
                                    onClick={onSectorClick}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {stats.sector?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 3: Sector Raw (Moved from Dashboard) */}
                <div className="card chart-card" style={{ gridColumn: '1 / -1' }}>
                    <h3>Detailed Sector Breakdown</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.sectorRaw} onClick={onRawSectorClick} style={{ cursor: 'pointer' }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" interval={0} height={60} tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" fill="#f59e0b" name="Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Filter Section (New Design) */}
            <div className="card" style={{ padding: '1rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>

                    {/* Search */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '200px', border: '1px solid #ddd', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>
                        <Search size={18} color="#666" />
                        <input
                            type="text"
                            placeholder="Search Name..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%' }}
                        />
                    </div>

                    <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 0.5rem' }}></div>

                    {/* Filter By Menu */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#4b5563', marginRight: '0.5rem' }}>Filter By:</span>

                        {['Area', 'Sector', 'Category', 'Date'].map(type => (
                            <button
                                key={type}
                                onClick={() => setActiveFilterMenu(activeFilterMenu === type ? null : type)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '20px',
                                    border: `1px solid ${activeFilterMenu === type ? '#3b82f6' : '#ddd'}`,
                                    background: activeFilterMenu === type ? '#eff6ff' : 'white',
                                    color: activeFilterMenu === type ? '#1d4ed8' : '#374151',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                {type} <ChevronDown size={14} />
                            </button>
                        ))}
                    </div>


                    <button onClick={resetFilters} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <X size={14} /> Reset Filters
                    </button>
                </div>

                {/* Sub-Filters Panel */}
                {activeFilterMenu && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eee', animation: 'fadeIn 0.2s' }}>

                        {activeFilterMenu === 'Area' && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['North Goa', 'South Goa'].map(opt => (
                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="area"
                                            checked={filters.area === opt}
                                            onChange={() => handleFilterChange('area', opt)}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        )}

                        {activeFilterMenu === 'Sector' && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['Manufacturing', 'Service', 'Retail Trade'].map(opt => (
                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="sector"
                                            checked={filters.sector === opt}
                                            onChange={() => handleFilterChange('sector', opt)}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        )}

                        {activeFilterMenu === 'Category' && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['Micro', 'Small', 'Medium'].map(opt => (
                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="enterpriseType"
                                            checked={filters.enterpriseType === opt}
                                            onChange={() => handleFilterChange('enterpriseType', opt)}
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        )}

                        {activeFilterMenu === 'Date' && (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                                <span>to</span>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* List Section */}
            <div className="card list-card" style={{ marginTop: '0' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Results ({msmes.length})</h3>
                    {/* Active Filters Tags could go here */}
                </div>
                <div className="recent-list">
                    {msmes.map((item) => (
                        <div key={item._id} className="recent-item" onClick={() => navigate(`/msme/${item._id}`)} style={{ cursor: 'pointer' }}>
                            <div className="recent-info">
                                <h4 style={{ fontSize: '1.1rem', color: '#1f2937' }}>{item.businessName || item.visitorName}</h4>
                                <div style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
                                    <span>{new Date(item.dateOfVisit).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{item.address?.substring(0, 30)}...</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                                {item.status && <span className="badge" style={{ background: item.status === 'Resolved' ? '#10b981' : '#e11d48', color: 'white' }}>{item.status}</span>}
                                {item.area && <span className="badge" style={{ background: item.area === 'North Goa' ? '#3b82f6' : '#8b5cf6', color: 'white' }}>{item.area}</span>}
                                {item.enterpriseType && <span className="badge" style={{ background: '#e5e7eb', color: '#374151' }}>{item.enterpriseType}</span>}
                                <span className="badge" style={{ background: '#f59e0b1a', color: '#b45309' }}>{item.sector || 'General'}</span>
                            </div>
                        </div>
                    ))}
                    {msmes.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                            <Filter size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No records found matching your filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MSMEList;
