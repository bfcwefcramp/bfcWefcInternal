
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Filter, Search } from 'lucide-react';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const MSMEList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [msmes, setMsmes] = useState([]);
    const [stats, setStats] = useState({ area: [], sector: [] });
    const [loading, setLoading] = useState(true);

    // Initialize filters from URL params if present
    const [filters, setFilters] = useState(() => {
        const params = new URLSearchParams(location.search);
        return {
            area: params.get('area') || '',
            sector: params.get('sector') || '',
            enterpriseType: params.get('enterpriseType') || '',
            status: params.get('status') || '',
            search: params.get('search') || '',
            startDate: params.get('startDate') || '',
            endDate: params.get('endDate') || ''
        };
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Build query string
            const params = new URLSearchParams(filters);
            // Remove empty keys
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
                sector: statsRes.data.sector
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

    // Update filters if URL changes (e.g. navigation from dashboard)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        // Only update status if it's in the param and different, 
        // to avoid resetting other user-set filters if we just navigated here
        if (params.get('status')) {
            setFilters(prev => ({
                ...prev,
                status: params.get('status') || prev.status
            }));
        }
    }, [location.search]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="dashboard-container">
            <h2 className="title">Visited MSMEs Analysis</h2>

            {/* Charts Section */}
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card chart-card">
                    <h3>Area Wise Distribution</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={stats.area}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" name="Count">
                                    {stats.area?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card chart-card">
                    <h3>Sector Wise Distribution</h3>
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
            </div>

            {/* Filters Section */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                    {/* Primary Filters Row */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1, width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '250px', flex: 2 }}>
                            <Search size={20} color="#666" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Search by Name..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select" style={{ flex: 1, minWidth: '150px' }}>
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>

                    {/* Secondary Filters Row */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
                        <select name="area" value={filters.area} onChange={handleFilterChange} className="filter-select" style={{ flex: 1 }}>
                            <option value="">All Areas</option>
                            <option value="North Goa">North Goa</option>
                            <option value="South Goa">South Goa</option>
                        </select>

                        <select name="sector" value={filters.sector} onChange={handleFilterChange} className="filter-select" style={{ flex: 1 }}>
                            <option value="">All Sectors</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Service">Service</option>
                            <option value="Retail Trade">Retail Trade</option>
                        </select>

                        <select name="enterpriseType" value={filters.enterpriseType} onChange={handleFilterChange} className="filter-select" style={{ flex: 1 }}>
                            <option value="">All Categories</option>
                            <option value="Micro">Micro</option>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                        </select>

                        {/* Stacked Date Inputs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input
                                type="date"
                                name="startDate"
                                value={filters.startDate || ''}
                                onChange={handleFilterChange}
                                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                                placeholder="From Date"
                            />
                            <input
                                type="date"
                                name="endDate"
                                value={filters.endDate || ''}
                                onChange={handleFilterChange}
                                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                                placeholder="To Date"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="card list-card" style={{ marginTop: '0' }}>
                <div className="recent-list">
                    {msmes.map((item) => (
                        <div key={item._id} className="recent-item" onClick={() => navigate(`/msme/${item._id}`)} style={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                            <div className="recent-info">
                                <h4 style={{ fontSize: '1.1rem', color: '#1f2937' }}>{item.businessName || item.visitorName}</h4>
                                <div style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
                                    <span>{new Date(item.dateOfVisit).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{item.address?.substring(0, 30)}...</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
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
