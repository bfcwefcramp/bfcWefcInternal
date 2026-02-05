import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, ChevronLeft, ChevronRight, X, AlertCircle, CheckCircle } from 'lucide-react';

const AttendanceCalendar = ({ expert, masterStats, onClose, onUpdate }) => {
    // Current viewed month in the Calendar
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [manualLog, setManualLog] = useState([]);
    const [saving, setSaving] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    useEffect(() => {
        if (expert && expert.attendanceLog) {
            setManualLog(expert.attendanceLog);
        }
    }, [expert]);

    // Helpers
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
        setSelectedDate(null);
    };

    const jumpToMonth = (monthName, year = new Date().getFullYear()) => {
        const monthIdx = new Date(`${monthName} 1, 2000`).getMonth();
        const newDate = new Date(year, monthIdx, 1);
        setCurrentDate(newDate);
        setSelectedDate(null);
    };

    // --- Status Logic ---
    const getDayStatus = (day) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

        // 1. Manual Log Overrides Everything
        const manualEntry = manualLog.find(log => new Date(log.date).toDateString() === dateStr);
        if (manualEntry) return manualEntry.status;

        // 2. System Events (Default Present)
        // We look for events in masterStats for this specific date
        const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).setHours(0, 0, 0, 0);

        // masterStats.attendanceStats.history is just monthly counts, not daily.
        // But masterStats.moms contains detailed event records!
        // Also expert.moms might have it. let's check masterStats.moms (which is passed as prop potentially, or we need to rely on expert.moms).
        // Actually, ExpertDashboard passes 'masterStats'. Let's see if we can use it.
        // Re-reading ExpertDashboard, it renders 'renderMoMs' using 'masterStats.moms'.

        const hasEvent = (masterStats?.moms || []).some(m => {
            const mDate = new Date(m.date);
            mDate.setHours(0, 0, 0, 0);
            return mDate.getTime() === dateKey;
        });

        if (hasEvent) return 'Present';

        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayOfWeek = dateObj.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) return 'Weekend';

        return 'Empty';
    };

    const handleSaveStatus = async (status, remarks = '') => {
        if (!selectedDate) return;
        setSaving(true);
        try {
            const dateToSave = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
            const entry = {
                date: dateToSave,
                status,
                remarks
            };

            // Optimistic update
            const updatedLog = [...manualLog];
            const existingIdx = updatedLog.findIndex(l => new Date(l.date).toDateString() === dateToSave.toDateString());

            if (existingIdx >= 0) {
                updatedLog[existingIdx] = entry;
            } else {
                updatedLog.push(entry);
            }

            setManualLog(updatedLog);

            // Persist
            const payload = {
                attendanceLog: updatedLog
            };
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/experts/${expert._id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (onUpdate) onUpdate({ ...expert, attendanceLog: updatedLog });
            setSelectedDate(null);
        } catch (err) {
            console.error(err);
            alert("Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const status = getDayStatus(i);
            const isSelected = selectedDate === i;

            let bg = 'white';
            let color = '#374151';
            let border = '1px solid #f3f4f6';

            if (status === 'Leave') { bg = '#fee2e2'; color = '#b91c1c'; border = '1px solid #fca5a5'; }
            else if (status === 'Holiday') { bg = '#dbeafe'; color = '#1e40af'; border = '1px solid #93c5fd'; }
            else if (status === 'Weekend') { bg = '#ecfccb'; color = '#3f6212'; }
            else if (status === 'Present') { bg = '#dcfce7'; color = '#15803d'; border = '1px solid #86efac'; }
            else if (status === 'Office_Work') { bg = '#fef3c7'; color = '#b45309'; }

            days.push(
                <div
                    key={i}
                    className={`calendar-day ${isSelected ? 'selected' : ''}`}
                    style={{
                        background: bg, color: color, border: isSelected ? '2px solid #3b82f6' : border
                    }}
                    onClick={() => setSelectedDate(i)}
                >
                    <span style={{ fontWeight: 600 }}>{i}</span>
                    <span style={{ fontSize: '0.6rem', marginTop: '2px', overflow: 'hidden', whiteSpace: 'nowrap' }}>{status !== 'Empty' ? status : ''}</span>
                </div>
            );
        }

        return (
            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="calendar-header">{d}</div>
                ))}
                {days}
            </div>
        );
    };

    // History Stats Merger
    // We want to show a list of past months with summary: Days Attended | Leaves
    // masterStats.attendanceStats.history has { month: 'December', days: 5 } (Only Present count)
    // We need to merge this with manual leaves for that month.

    const getMonthlyHistory = () => {
        // We need to calculate precise counts by merging Master Stats (Events) and Manual Log (Overrides)

        // 1. Collect all unique dates with their status
        const dayMap = {}; // "YYYY-MM-DD" -> Status

        // A. Populate from Events (Master Stats) -> Default to 'Present'
        (masterStats?.moms || []).forEach(m => {
            const dateStr = new Date(m.date).toDateString(); // Normalize
            dayMap[dateStr] = 'Present';
        });

        // B. Apply Manual Overrides (wins over events)
        manualLog.forEach(log => {
            const dateStr = new Date(log.date).toDateString();
            if (log.status) {
                dayMap[dateStr] = log.status; // Can be Present, Leave, Holiday, etc.
            }
        });

        // 2. Group by Month
        const historyMap = {};

        Object.entries(dayMap).forEach(([dateStr, status]) => {
            const date = new Date(dateStr);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`; // Unique key YYYY-M
            const monthLabel = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();

            if (!historyMap[monthKey]) {
                historyMap[monthKey] = {
                    key: monthKey, // for sorting
                    month: monthLabel,
                    year: year,
                    present: 0,
                    leaves: 0
                };
            }

            if (status === 'Present') {
                historyMap[monthKey].present += 1;
            } else if (status === 'Leave') {
                historyMap[monthKey].leaves += 1;
            }
        });

        // 3. Convert to array and Sort Descending (Newest Month First)
        return Object.values(historyMap).sort((a, b) => {
            const [yearA, monthA] = a.key.split('-').map(Number);
            const [yearB, monthB] = b.key.split('-').map(Number);

            if (yearA !== yearB) return yearB - yearA;
            return monthB - monthA;
        });
    };

    const monthlyHistory = getMonthlyHistory();

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
            <div className="animate-fade-in" style={{ background: 'white', width: '90%', maxWidth: '900px', borderRadius: '16px', display: 'flex', overflow: 'hidden', height: '85vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>

                {/* LEFT: Calendar Section (Main) */}
                <div style={{ flex: 2, padding: '2rem', overflowY: 'auto', borderRight: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar className="text-blue-600" size={28} />
                            Attendance Calendar
                        </h3>
                        {/* Close button for mobile only if needed, but main close is usually top right of modal. We'll put global close elsewhere or header of right panel. */}
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#f9fafb', padding: '0.8rem', borderRadius: '12px' }}>
                        <button onClick={() => changeMonth(-1)} style={{ background: 'white', border: '1px solid #e5e7eb', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#374151' }}>
                            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => changeMonth(1)} style={{ background: 'white', border: '1px solid #e5e7eb', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}><ChevronRight size={20} /></button>
                    </div>

                    {/* Grid */}
                    <div className="calendar-wrapper" style={{ marginBottom: '2rem' }}>
                        {renderCalendar()}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}><div style={{ width: 10, height: 10, background: '#15803d', borderRadius: '50%' }}></div> Present</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}><div style={{ width: 10, height: 10, background: '#3f6212', borderRadius: '50%' }}></div> Weekend</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}><div style={{ width: 10, height: 10, background: '#b91c1c', borderRadius: '50%' }}></div> Leave</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}><div style={{ width: 10, height: 10, background: '#1e40af', borderRadius: '50%' }}></div> Holiday</div>
                    </div>
                </div>

                {/* RIGHT: Sidebar (Stats & History) */}
                <div style={{ flex: 1, background: '#f8fafc', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <button onClick={onClose} style={{ background: '#e2e8f0', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <X size={20} color="#475569" />
                        </button>
                    </div>

                    {/* Action Panel for Selection */}
                    {selectedDate ? (
                        <div className="animate-slide-up" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>
                                Status for {currentDate.toLocaleString('default', { month: 'short' })} {selectedDate}
                            </h4>
                            <div style={{ display: 'grid', gap: '0.8rem' }}>
                                <button disabled={saving} onClick={() => handleSaveStatus('Present')} style={{ padding: '0.8rem', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>✅ Mark as Present</button>
                                <button disabled={saving} onClick={() => handleSaveStatus('Leave')} style={{ padding: '0.8rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>⛔ Mark as Leave</button>
                                <button disabled={saving} onClick={() => handleSaveStatus('Holiday')} style={{ padding: '0.8rem', background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>🎉 Mark as Holiday</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: '#e0f2fe', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #bae6fd' }}>
                            <h4 style={{ marginTop: 0, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={18} /> Quick Tip
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#0c4a6e' }}>Click on any date in the calendar to manually update status (Leave, Holiday, etc.).</p>
                        </div>
                    )}

                    {/* Monthly History List */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <h4 style={{ color: '#475569', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                            Monthly Summary
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {monthlyHistory.map((h, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => jumpToMonth(h.month, h.year)}
                                    className="history-card"
                                    style={{
                                        background: 'white', padding: '1rem', borderRadius: '10px',
                                        cursor: 'pointer', border: '1px solid #e2e8f0',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 600, color: '#334155' }}>{h.month}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{h.year}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#15803d' }}>
                                            <div style={{ width: 6, height: 6, background: '#15803d', borderRadius: '50%' }}></div>
                                            <b>{h.present}</b> Days
                                        </div>
                                        {h.leaves > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#b91c1c' }}>
                                                <div style={{ width: 6, height: 6, background: '#b91c1c', borderRadius: '50%' }}></div>
                                                <b>{h.leaves}</b> Leaves
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {monthlyHistory.length === 0 && (
                                <p style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>No history data yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                <style>{`
                    .calendar-grid {
                        display: grid;
                        grid-template-columns: repeat(7, 1fr);
                        gap: 0.5rem;
                    }
                    .calendar-header {
                        text-align: center;
                        font-size: 0.85rem;
                        font-weight: 700;
                        color: #94a3b8;
                        padding-bottom: 0.5rem;
                    }
                    .calendar-day {
                        aspect-ratio: 1;
                        border-radius: 12px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        transition: all 0.2s;
                        position: relative;
                    }
                    .calendar-day.empty {
                        background: transparent;
                        border: none;
                        cursor: default;
                    }
                    .calendar-day:hover:not(.empty) {
                        filter: brightness(0.97);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                        z-index: 10;
                    }
                    .calendar-day.selected {
                        transform: scale(1.05);
                        z-index: 10;
                        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                    }
                    .history-card:hover {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
                    }
                    /* Custom scrollbar for sidebar */
                    ::-webkit-scrollbar {
                        width: 6px;
                    }
                    ::-webkit-scrollbar-track {
                        background: transparent; 
                    }
                    ::-webkit-scrollbar-thumb {
                        background: #cbd5e1; 
                        border-radius: 10px;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: #94a3b8; 
                    }
                `}</style>
            </div>
        </div>
    );
};

export default AttendanceCalendar;
