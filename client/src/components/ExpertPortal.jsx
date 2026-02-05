import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ExpertDashboard from './ExpertDashboard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ExpertPortal = () => {
    const { user, logout } = useAuth();
    const [expertData, setExpertData] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    useEffect(() => {
        if (user && user.expertId) {
            fetchExpertData();
        } else if (user && user.role === 'admin') {
            // Admin shouldn't really be here, but if they are...
            setLoading(false);
        }
    }, [user]);

    const fetchExpertData = async () => {
        try {
            // Since we don't have a direct GET /experts/:id, we fetch all and find. 
            // (Optimization: Add GET /:id to backend later)
            const res = await axios.get(`${API_URL}/api/experts`);
            const myExpert = res.data.find(e => e._id === user.expertId);
            setExpertData(myExpert);
        } catch (err) {
            console.error("Failed to fetch expert data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (updatedExpert) => {
        setExpertData(updatedExpert);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Profile...</div>;
    if (!expertData) return <div style={{ padding: '2rem', textAlign: 'center' }}>Expert Profile Not Found. Please contact Admin.</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
            <div style={{
                background: '#1f2937', color: 'white', padding: '1rem 2rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Expert Portal</h2>
                    <span style={{ background: '#374151', padding: '0.2rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem' }}>
                        {user.username}
                    </span>
                </div>
                <button
                    onClick={logout}
                    style={{
                        background: '#ef4444', border: 'none', padding: '0.5rem 1.2rem',
                        borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: 500,
                        transition: 'background 0.2s'
                    }}
                >
                    Logout
                </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {/* Render Dashboard with NO delete permission and NO close button */}
                <ExpertDashboard
                    expert={expertData}
                    onUpdate={handleUpdate}
                    onClose={() => { }} // No close action
                    onDelete={null} // Hide delete expert button
                />
            </div>
        </div>
    );
};

export default ExpertPortal;
