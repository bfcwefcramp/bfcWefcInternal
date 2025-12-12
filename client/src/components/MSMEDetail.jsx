import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Layout.css'; // Reusing layout css or create specific

const MSMEDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [msme, setMsme] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMSME = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/msme/${id}`);
                setMsme(res.data);
            } catch (err) {
                console.error('Error fetching detail:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMSME();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!msme) return <div>MSME Not Found</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>&larr; Back</button>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    <div>
                        <h1 className="title" style={{ marginBottom: '0.25rem' }}>{msme.businessName}</h1>
                        <span style={{ color: '#64748b' }}>{msme.entrepreneurName}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span className={`badge ${msme.status === 'Resolved' ? 'bg-green' : 'bg-orange'}`} style={{ color: 'white', padding: '0.5rem 1rem' }}>
                            {msme.status || 'Pending'}
                        </span>
                        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ background: '#ef4444', color: 'white', border: 'none' }}>Close</button>
                    </div>
                </div>

                <div className="grid-2">
                    <div>
                        <h3 className="section-header">Visit Info</h3>
                        <p><strong>Date:</strong> {new Date(msme.dateOfVisit).toLocaleDateString()}</p>
                        <p><strong>Assisted By:</strong> {msme.assistedBy}</p>
                        <p><strong>Experts:</strong> {msme.expertName?.join(', ')}</p>
                        <p><strong>Purpose:</strong> {msme.purposeOfVisit}</p>
                    </div>
                    <div>
                        <h3 className="section-header">Business Info</h3>
                        <p><strong>Type:</strong> {msme.enterpriseType}</p>
                        <p><strong>Sector:</strong> {msme.sector}</p>
                        <p><strong>Udyam:</strong> {msme.udyamRegistrationNo || 'N/A'}</p>
                        <p><strong>Address:</strong> {msme.address}</p>
                    </div>
                </div>

                <div className="grid-2" style={{ marginTop: '2rem' }}>
                    <div>
                        <h3 className="section-header">Visitor Details</h3>
                        <p><strong>Name:</strong> {msme.visitorName}</p>
                        <p><strong>Category:</strong> {msme.visitorCategory} {msme.visitorCategoryOther ? `(${msme.visitorCategoryOther})` : ''}</p>
                        <p><strong>Contact:</strong> {msme.contactNumber}</p>
                        <p><strong>Email:</strong> {msme.email}</p>
                    </div>
                    <div>
                        <h3 className="section-header">Support & Action</h3>
                        <p><strong>Support Rendered:</strong> {msme.supportDetails}</p>
                        <p><strong>Query Resolution:</strong> {msme.queryResolutionRequired}</p>
                        <p><strong>Follow-up:</strong> {msme.followUpAction}</p>
                    </div>
                </div>

                {msme.photos && msme.photos.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                        <h3 className="section-header">Photos</h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {msme.photos.map((photo, idx) => (
                                <img
                                    key={idx}
                                    src={`http://localhost:5001${photo}`}
                                    alt={`Upload ${idx}`}
                                    style={{ width: '200px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MSMEDetail;
