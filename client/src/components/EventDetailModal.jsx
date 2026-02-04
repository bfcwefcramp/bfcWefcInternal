import React, { useState } from 'react';
import axios from 'axios';
import { X, Calendar, MapPin, Trash2, AlertTriangle, FileText } from 'lucide-react';

const EventDetailModal = ({ event, onClose, onDeleteSuccess, onEdit }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await axios.delete(`${API_URL}/api/master/event`, {
                data: { eventName: event.name, date: event.date }
            });
            onDeleteSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to delete event", err);
            alert("Failed to delete event: " + (err.response?.data?.error || err.message));
            setIsDeleting(false);
        }
    };

    if (!event) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
            <div style={{
                background: 'white', width: '90%', maxWidth: '600px', borderRadius: '16px',
                padding: '2rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                            {event.name}
                        </h2>
                        <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                            background: event.type === 'Field_Visit' ? '#ecfccb' :
                                event.type === 'Workshop' ? '#fff7ed' :
                                    event.type === 'Exhibition' ? '#f3e8ff' : '#f0f9ff',
                            color: event.type === 'Field_Visit' ? '#3f6212' :
                                event.type === 'Workshop' ? '#c2410c' :
                                    event.type === 'Exhibition' ? '#7e22ce' : '#0369a1'
                        }}>
                            {event.type}
                        </span>
                    </div>
                    <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: '#4b5563' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563' }}>
                            <Calendar size={18} className="text-blue-500" />
                            <span style={{ fontWeight: 500 }}>{event.date ? new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date N/A'}</span>
                        </div>
                        {event.venue && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563' }}>
                                <MapPin size={18} className="text-red-500" />
                                <span>{event.venue}</span>
                            </div>
                        )}
                    </div>

                    <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
                            <FileText size={16} /> Description / Agenda
                        </h4>
                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#4b5563', fontSize: '0.95rem' }}>
                            {event.description || "No description provided."}
                        </p>
                    </div>

                    {/* Attendees List */}
                    <div style={{ background: '#f0f9ff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.75rem' }}>
                            <FileText size={16} /> Officials / Experts Attended
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {event.attendees && event.attendees.length > 0 ? (
                                event.attendees.map((attendee, idx) => (
                                    <span key={idx} style={{
                                        background: 'white', border: '1px solid #7dd3fc', borderRadius: '6px',
                                        padding: '0.25rem 0.6rem', fontSize: '0.85rem', color: '#0c4a6e', fontWeight: 500
                                    }}>
                                        {attendee}
                                    </span>
                                ))
                            ) : (
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>No attendees listed.</span>
                            )}
                        </div>
                    </div>

                    {confirmDelete ? (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1.25rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontWeight: 700, marginBottom: '0.5rem' }}>
                                <AlertTriangle size={20} /> Confirm Deletion
                            </h4>
                            <p style={{ color: '#7f1d1d', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                Are you sure you want to delete this event? This will remove it from all experts' timelines who attended. This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    style={{
                                        background: '#dc2626', color: 'white', border: 'none', padding: '0.6rem 1.2rem',
                                        borderRadius: '6px', fontWeight: 600, cursor: isDeleting ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                                </button>
                                <button
                                    onClick={() => setConfirmDelete(false)}
                                    style={{
                                        background: 'white', border: '1px solid #d1d5db', color: '#374151', padding: '0.6rem 1.2rem',
                                        borderRadius: '6px', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                            <button
                                onClick={onEdit}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                                    padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                                    transition: 'all 0.2s', marginRight: 'auto'
                                }}
                            >
                                <AlertTriangle size={18} style={{ transform: 'rotate(180deg)' }} /> Edit Event
                            </button>

                            <button
                                onClick={() => setConfirmDelete(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: '#fff1f2', color: '#e11d48', border: '1px solid #fda4af',
                                    padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Trash2 size={18} /> Delete Event
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default EventDetailModal;
