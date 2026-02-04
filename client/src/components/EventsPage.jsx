import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Download, MapPin, Search, Filter, Plus, Eye } from 'lucide-react';
import AddEventModal from './AddEventModal';
import EventDetailModal from './EventDetailModal';
import './Dashboard.css'; // Reusing dashboard styles for consistency

const EventsPage = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventToEdit, setEventToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [events, activeTab, searchTerm]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            // We can reuse the master stats endpoint which now returns 'eventsList' with all types
            const res = await axios.get(`${API_URL}/api/master/stats`);
            if (res.data && res.data.eventsList) {
                setEvents(res.data.eventsList);
            }
        } catch (err) {
            console.error("Failed to fetch events", err);
        } finally {
            setLoading(false);
        }
    };

    const filterEvents = () => {
        let res = events;

        // 1. Tab Filtering (Strict Separation)
        if (activeTab === 'workshops') {
            // Only explicitly marked Workshops
            res = res.filter(e => e.type === 'Workshop' || (e.name.toLowerCase().includes('workshop') && !e.type.includes('Exhibition')));
        } else if (activeTab === 'field_visits') {
            // Field Visits: Category 'Field_Visit', TSM, or Moira
            res = res.filter(e => e.type === 'Field_Visit' || e.name.toUpperCase().startsWith('TSM') || e.name.includes('Moira'));
        } else if (activeTab === 'events') {
            // General Events: Exhibitions (including Tarang), Dept Visits, MoM Events, Generic Events
            // EXCLUDING Field Visits and Workshops
            res = res.filter(e =>
                ['Exhibition', 'Departmental_Visit', 'Event', 'MoM_Event'].includes(e.type) &&
                !e.name.toUpperCase().startsWith('TSM') &&
                !e.name.includes('Moira') &&
                e.type !== 'Workshop'
            );
        }

        // 2. Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            res = res.filter(e =>
                e.name.toLowerCase().includes(lower) ||
                (e.description && e.description.toLowerCase().includes(lower))
            );
        }

        setFilteredEvents(res);
    };

    const handleExport = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/master/export-events`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'BFC_WEFC_Events_Report.xlsx');
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to download export.");
        }
    };

    return (
        <div className="dashboard-container">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.5rem' }}>Events & Field Work</h2>
                    <p style={{ color: '#6b7280' }}>Manage Workshops, Exhibitions, and Field Visits</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleExport}
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Download size={18} /> Export Data
                    </button>
                    <button
                        onClick={() => setIsAddEventOpen(true)}
                        style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> Add New Entry
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                {['all', 'events', 'workshops', 'field_visits'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
                            fontSize: '1rem', fontWeight: 600,
                            color: activeTab === tab ? '#2563eb' : '#6b7280',
                            borderBottom: activeTab === tab ? '2px solid #2563eb' : 'none'
                        }}
                    >
                        {tab === 'all' ? 'All Activities' :
                            tab === 'field_visits' ? 'Field Visits' :
                                tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
                <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.5rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
            </div>

            {/* Event List Table */}
            <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#4b5563', width: '150px' }}>Date</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#4b5563' }}>Event / Activity Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: '#4b5563', width: '150px' }}>Category</th>
                                <th style={{ padding: '1rem', textAlign: 'right', color: '#4b5563', width: '100px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                            ) : filteredEvents.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No events found.</td></tr>
                            ) : (
                                filteredEvents.map((event, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => setSelectedEvent(event)}
                                        style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.2s' }}
                                        className="hover-row"
                                    >
                                        <td style={{ padding: '1rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                                            {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 600, color: '#1f2937' }}>{event.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                                background: event.type === 'Field_Visit' ? '#ecfccb' :
                                                    event.type === 'Workshop' ? '#fff7ed' :
                                                        (event.type === 'Exhibition' || event.type === 'Exhibition') ? '#f3e8ff' : '#f0f9ff',
                                                color: event.type === 'Field_Visit' ? '#3f6212' :
                                                    event.type === 'Workshop' ? '#c2410c' :
                                                        (event.type === 'Exhibition' || event.type === 'Exhibition') ? '#7e22ce' : '#0369a1'
                                            }}>
                                                {event.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: '#3b82f6' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <Eye size={18} /> Details
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onDeleteSuccess={() => {
                        setSelectedEvent(null);
                        fetchEvents();
                    }}
                    onEdit={() => {
                        setEventToEdit(selectedEvent);
                        setSelectedEvent(null);
                        setIsAddEventOpen(true);
                    }}
                />
            )}

            {isAddEventOpen && (
                <AddEventModal
                    onClose={() => {
                        setIsAddEventOpen(false);
                        setEventToEdit(null);
                    }}
                    onEventAdded={() => {
                        fetchEvents();
                        setEventToEdit(null);
                    }}
                    initialData={eventToEdit}
                />
            )}
        </div>
    );
};

export default EventsPage;
