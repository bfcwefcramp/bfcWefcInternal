import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar, MapPin, Users, FileText, CheckCircle } from 'lucide-react';

const AddEventModal = ({ onClose, onEventAdded }) => {
    const [formData, setFormData] = useState({
        eventName: '',
        venue: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Exhibition',
        agenda: '',
        remarks: '',
        attendees: []
    });

    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    useEffect(() => {
        fetchExperts();
    }, []);

    const fetchExperts = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/experts`);
            setExperts(res.data);
        } catch (err) {
            console.error("Failed to fetch experts:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleExpert = (expertName) => {
        setFormData(prev => {
            const current = prev.attendees;
            if (current.includes(expertName)) {
                return { ...prev, attendees: current.filter(n => n !== expertName) };
            } else {
                return { ...prev, attendees: [...current, expertName] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.attendees.length === 0) {
            alert("Please select at least one expert attendee.");
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/master/event`, formData);
            alert("Event created successfully!");
            if (onEventAdded) onEventAdded();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to create event: " + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
            <div style={{
                background: 'white', width: '90%', maxWidth: '800px', borderRadius: '16px',
                padding: '2rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Calendar className="text-blue-600" /> Add New Event / MoM
                    </h2>
                    <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: '#4b5563' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
                    {/* Left Column: Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Event Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                            >
                                <option value="Exhibition">Exhibition</option>
                                <option value="Departmental_Visit">Departmental Visit</option>
                                <option value="Event">Event</option>
                                <option value="Workshop">Workshop</option>
                                <option value="MoM">General MoM</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Event Name</label>
                            <input
                                type="text"
                                name="eventName"
                                value={formData.eventName}
                                onChange={handleChange}
                                required
                                placeholder="e.g. MSME Expo 2025"
                                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Venue / Location</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} style={{ position: 'absolute', left: '10px', top: '12px', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    placeholder="Conference Hall, Delhi"
                                    style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Agenda / Summary</label>
                            <textarea
                                name="agenda"
                                value={formData.agenda}
                                onChange={handleChange}
                                placeholder="Brief description of the event agenda..."
                                rows="3"
                                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', fontFamily: 'inherit' }}
                            ></textarea>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Key Remarks / Minutes</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                placeholder="Outcome of the meeting..."
                                rows="3"
                                style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', fontFamily: 'inherit' }}
                            ></textarea>
                        </div>
                    </div>

                    {/* Right Column: Attendees Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Select Attendees</span>
                            <span style={{ color: '#6b7280', fontWeight: 400 }}>{formData.attendees.length} selected</span>
                        </label>

                        <div style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.5rem', overflowY: 'auto', background: '#f9fafb', maxHeight: '400px' }}>
                            {loading ? (
                                <p style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Loading experts...</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    {experts.map(expert => {
                                        const isSelected = formData.attendees.includes(expert.name);
                                        return (
                                            <div
                                                key={expert._id}
                                                onClick={() => toggleExpert(expert.name)}
                                                style={{
                                                    padding: '0.6rem 1rem',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    background: isSelected ? '#eff6ff' : 'white',
                                                    border: isSelected ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#1e40af' : '#374151' }}>
                                                    {expert.name}
                                                </span>
                                                {isSelected ? (
                                                    <CheckCircle size={18} className="text-blue-600" />
                                                ) : (
                                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #d1d5db' }}></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                            * Selected experts will have this event added to their timeline automatically.
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{ padding: '0.8rem 2rem', borderRadius: '8px', border: 'none', background: submitting ? '#93c5fd' : '#2563eb', color: 'white', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {submitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEventModal;
