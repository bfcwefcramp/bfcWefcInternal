import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reuse dashboard styles for cards/list

const MSMEList = () => {
    const [msmes, setMsmes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMSMEs = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/msme');
                setMsmes(res.data);
            } catch (err) {
                console.error('Error fetching list:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMSMEs();
    }, []);

    return (
        <div className="dashboard-container">
            <h2 className="title">Visited MSMEs</h2>

            {loading ? <p>Loading...</p> : (
                <div className="card list-card" style={{ marginTop: '0' }}>
                    <div className="recent-list">
                        {msmes.map((item) => (
                            <div key={item._id} className="recent-item" onClick={() => navigate(`/msme/${item._id}`)} style={{ cursor: 'pointer' }}>
                                <div className="recent-info">
                                    <h4>{item.businessName}</h4>
                                    <span>{item.entrepreneurName} | {new Date(item.dateOfVisit).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span className="badge">{item.businessType}</span>
                                    <div className={`badge ${item.status === 'Resolved' ? 'bg-green' : 'bg-orange'}`} style={{ color: 'white', fontSize: '0.8rem' }}>
                                        {item.status || 'Pending'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {msmes.length === 0 && <p className="text-muted">No entries found.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MSMEList;
