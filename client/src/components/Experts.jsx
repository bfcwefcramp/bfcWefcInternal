import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Briefcase } from 'lucide-react';
import ExpertDashboard from './ExpertDashboard';
import './Experts.css'; // We'll create this

const Experts = () => {
    const [experts, setExperts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newExpert, setNewExpert] = useState({
        name: '',
        designation: '',
        expertise: '',
        contact: ''
    });

    const dummyExperts = [
        {
            _id: '1',
            name: 'Dr. Sarah Jones',
            designation: 'Financial Consultant',
            expertise: ['Finance', 'Taxation'],
            contact: 'sarah.j@example.com'
        },
        {
            _id: '2',
            name: 'Mr. Raj Patel',
            designation: 'Legal Advisor',
            expertise: ['Corporate Law', 'IPR'],
            contact: 'raj.p@example.com'
        }
    ];

    useEffect(() => {
        fetchExperts();
    }, []);

    const fetchExperts = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/experts');
            if (res.data.length > 0) {
                setExperts(res.data);
            } else {
                setExperts(dummyExperts);
            }
        } catch (err) {
            console.error('Experts Error:', err);
            setExperts(dummyExperts); // Fallback
        }
    };

    const handleInputChange = (e) => {
        setNewExpert({ ...newExpert, [e.target.name]: e.target.value });
    };

    const handleAddExpert = async (e) => {
        e.preventDefault();
        try {
            const expertData = {
                ...newExpert,
                expertise: newExpert.expertise.split(',').map(s => s.trim())
            };
            await axios.post('http://localhost:5001/api/experts', expertData);
            setShowModal(false);
            setNewExpert({ name: '', designation: '', expertise: '', contact: '' });
            fetchExperts(); // Refresh
        } catch (err) {
            alert('Failed to add expert');
        }
    };

    // Details Modal State
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [expertStats, setExpertStats] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Fetch stats when selectedExpert changes
    useEffect(() => {
        if (selectedExpert?.name) {
            fetchExpertStats(selectedExpert.name);
        }
    }, [selectedExpert]);

    const fetchExpertStats = async (expertName) => {
        try {
            const res = await axios.get(`http://localhost:5001/api/msme/expert-stats/${encodeURIComponent(expertName)}`);
            setExpertStats(res.data);
        } catch (err) {
            console.error("Error fetching expert stats:", err);
            setExpertStats(null);
        }
    };

    const handleCardClick = (expert) => {
        setSelectedExpert(expert);
        setEditForm(expert);
        setIsEditing(false);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSaveChanges = async () => {
        try {
            // Sanitize payload: remove _id and __v to avoid immutable field errors
            const { _id, __v, ...updateData } = editForm;

            const res = await axios.put(`http://localhost:5001/api/experts/${selectedExpert._id}`, updateData);

            // Update local state
            setExperts(experts.map(ex => ex._id === res.data._id ? res.data : ex));
            setSelectedExpert(res.data);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                alert('Expert data was outdated. Refreshing list...');
                fetchExperts();
                setSelectedExpert(null);
            } else {
                alert('Failed to update expert');
            }
        }
    };

    const handleDeleteExpert = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (window.confirm('Are you sure you want to delete this expert?')) {
            try {
                await axios.delete(`http://localhost:5001/api/experts/${selectedExpert._id}`);
                setExperts(experts.filter(ex => ex._id !== selectedExpert._id));
                setSelectedExpert(null); // Close modal
            } catch (err) {
                console.error(err);
                if (err.response && err.response.status === 404) {
                    alert('Expert already deleted or not found. Refreshing list...');
                    fetchExperts();
                    setSelectedExpert(null);
                } else {
                    alert('Failed to delete expert');
                }
            }
        }
    };

    return (
        <div className="experts-container">
            <div className="experts-header">
                <h2 className="title">Our Experts</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add New Expert</button>
            </div>

            <div className="experts-grid">
                {experts.map((expert) => (
                    <div key={expert._id} className="card expert-card" onClick={() => handleCardClick(expert)} style={{ cursor: 'pointer' }}>
                        <div className="expert-avatar">
                            <User size={40} />
                        </div>
                        <div className="expert-info">
                            <h3>{expert.name}</h3>
                            <p className="designation">{expert.designation}</p>
                            <div className="tags">
                                {expert.expertise.map((tag, idx) => (
                                    <span key={idx} className="tag">{tag}</span>
                                ))}
                            </div>
                            <p className="contact text-muted">{expert.contact}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Expert Modal */}
            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '8px', minWidth: '400px' }}>
                        <h3>Add New Expert</h3>
                        <form onSubmit={handleAddExpert} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <input type="text" name="name" placeholder="Name" value={newExpert.name} onChange={handleInputChange} required style={{ padding: '0.5rem' }} />
                            <input type="text" name="designation" placeholder="Designation" value={newExpert.designation} onChange={handleInputChange} required style={{ padding: '0.5rem' }} />
                            <input type="text" name="expertise" placeholder="Expertise (comma separated)" value={newExpert.expertise} onChange={handleInputChange} style={{ padding: '0.5rem' }} />
                            <input type="text" name="contact" placeholder="Contact/Email" value={newExpert.contact} onChange={handleInputChange} style={{ padding: '0.5rem' }} />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary">Save</button>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: '#ddd' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Standard Add Expert Modal remains same ... */}

            {/* New Expert Dashboard Modal */}
            {selectedExpert && (
                <ExpertDashboard
                    expert={selectedExpert}
                    stats={expertStats}
                    onClose={() => setSelectedExpert(null)}
                    onUpdate={(updatedExpert) => {
                        setExperts(experts.map(ex => ex._id === updatedExpert._id ? updatedExpert : ex));
                        setSelectedExpert(updatedExpert);
                    }}
                />
            )}
        </div>
    );
};

export default Experts;
