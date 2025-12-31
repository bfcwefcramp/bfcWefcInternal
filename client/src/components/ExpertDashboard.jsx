import React, { useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    LayoutDashboard, Calendar, FileText, CheckCircle,
    X, User, Activity, Trophy
} from 'lucide-react';
import './ExpertDashboard.css';

const ExpertDashboard = ({ expert, onClose, onUpdate, stats }) => {
    const [activeTab, setActiveTab] = useState('overview');


    // Mock Data for Charts (Will be replaced by real data from props)
    const activityData = [
        { name: 'Mon', events: 1, visits: 3 },
        { name: 'Tue', events: 0, visits: 5 },
        { name: 'Wed', events: 2, visits: 2 },
        { name: 'Thu', events: 1, visits: 4 },
        { name: 'Fri', events: 3, visits: 1 },
    ];

    const pieData = [
        { name: 'Events', value: stats?.eventsAttended || expert.stats?.eventsAttended || 12 },
        { name: 'Registrations', value: stats?.registrations || expert.stats?.registrationsDone || 8 },
        { name: 'MOMs', value: expert.stats?.momsCreated || 5 },
    ];

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

    const renderOverview = () => (
        <div className="overview-container">
            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-value">{stats?.totalVisits || 0}</div>
                    <div className="kpi-label">Total Visits</div>
                </div>
                <div className="kpi-card" style={{ borderLeftColor: '#10b981' }}>
                    <div className="kpi-value">{stats?.eventsAttended || expert.stats?.eventsAttended || 0}</div>
                    <div className="kpi-label">Events Attended</div>
                </div>
                <div className="kpi-card" style={{ borderLeftColor: '#f59e0b' }}>
                    <div className="kpi-value">{stats?.registrations || expert.stats?.registrationsDone || 0}</div>
                    <div className="kpi-label">Udyam Reg.</div>
                </div>
                <div className="kpi-card" style={{ borderLeftColor: '#8b5cf6' }}>
                    <div className="kpi-value">{expert.stats?.momsCreated || 0}</div>
                    <div className="kpi-label">MOMs filed</div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-container">
                <div className="chart-card">
                    <div className="chart-title">
                        <Activity size={20} />
                        Activity Distribution
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <div className="chart-title">
                        <Calendar size={20} />
                        Weekly Performance
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="events" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Events" />
                            <Bar dataKey="visits" fill="#10b981" radius={[4, 4, 0, 0]} name="Visits" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );



    // --- Monthly Report Handlers ---


    // Unified Update Helper
    const updateExpertData = async (updatedData) => {
        try {
            const res = await axios.put(`${API_URL}/api/experts/${expert._id}`, updatedData);
            onUpdate(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to update: " + (err.response?.data?.error || err.message));
        }
    };



    // --- Unified Plans & Reports State ---
    const [expandedMonth, setExpandedMonth] = useState(null);
    const [expandedWeekKey, setExpandedWeekKey] = useState(null); // 'planIdx-weekIdx'
    const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
    const [currentPlanIndexForModal, setCurrentPlanIndexForModal] = useState(null);
    const [weekFormData, setWeekFormData] = useState({
        weekNumber: '',
        startDate: '',
        endDate: '',
        plan: '',
        achievement: '',
        additional: '',
        remarks: ''
    });
    // For Editing
    const [editingWeekIndex, setEditingWeekIndex] = useState(null); // If not null, we are editing this index in the currentPlanIndexForModal

    const API_URL = 'http://localhost:5001';

    // Helper: Sort Plans
    const sortedPlans = (expert.plans || []).sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(b.month) - months.indexOf(a.month);
    });

    const currentMonthPlan = sortedPlans.find(p => p.isCurrent) || sortedPlans[0];

    // --- Modal Handlers ---
    const openAddWeekModal = (planIndex) => {
        setCurrentPlanIndexForModal(planIndex);
        setEditingWeekIndex(null);
        const plan = expert.plans[planIndex];
        setWeekFormData({
            weekNumber: plan.weeks.length + 1,
            startDate: '',
            endDate: '',
            plan: '',
            achievement: '',
            additional: '',
            remarks: ''
        });
        setIsWeekModalOpen(true);
    };

    const openEditWeekModal = (planIndex, weekIndex, weekData) => {
        setCurrentPlanIndexForModal(planIndex);
        setEditingWeekIndex(weekIndex);
        setWeekFormData({
            weekNumber: weekData.weekNumber,
            startDate: weekData.startDate ? new Date(weekData.startDate).toISOString().split('T')[0] : '',
            endDate: weekData.endDate ? new Date(weekData.endDate).toISOString().split('T')[0] : '',
            plan: weekData.plan || '',
            achievement: weekData.achievement || '',
            additional: weekData.additional || '',
            remarks: weekData.remarks || ''
        });
        setIsWeekModalOpen(true);
    };

    const handleSaveWeek = async () => {
        if (!weekFormData.startDate || !weekFormData.endDate) {
            alert("Please select Start and End dates.");
            return;
        }

        const updatedPlans = [...expert.plans];
        // Use exact index from expert.plans that matches the one passed.
        // NOTE: 'currentPlanIndexForModal' comes from 'expert.plans.indexOf(plan)'.

        const newWeek = {
            weekNumber: parseInt(weekFormData.weekNumber),
            weekLabel: `Week ${weekFormData.weekNumber}`,
            startDate: new Date(weekFormData.startDate),
            endDate: new Date(weekFormData.endDate),
            plan: weekFormData.plan,
            achievement: weekFormData.achievement,
            additional: weekFormData.additional,
            remarks: weekFormData.remarks,
            status: 'Pending'
        };

        if (editingWeekIndex !== null) {
            updatedPlans[currentPlanIndexForModal].weeks[editingWeekIndex] = newWeek;
        } else {
            updatedPlans[currentPlanIndexForModal].weeks.push(newWeek);
        }

        // Sort weeks
        updatedPlans[currentPlanIndexForModal].weeks.sort((a, b) => a.weekNumber - b.weekNumber);

        await updateExpertData({ ...expert, plans: updatedPlans });
        setIsWeekModalOpen(false);
    };

    const handleDeleteWeek = async (planIndex, weekIndex) => {
        if (!window.confirm("Are you sure you want to delete this week's data?")) return;
        const updatedPlans = [...expert.plans];
        updatedPlans[planIndex].weeks.splice(weekIndex, 1);
        await updateExpertData({ ...expert, plans: updatedPlans });
    };

    const handleAddMonth = async () => {
        const month = prompt("Enter Month (e.g., January):");
        if (!month) return;
        const year = parseInt(prompt("Enter Year:", new Date().getFullYear()));
        if (!year) return;

        const newPlan = {
            month,
            year,
            weeks: [],
            isCurrent: false
        };

        const updatedPlans = [...expert.plans, newPlan];
        await updateExpertData({ ...expert, plans: updatedPlans });
    };

    const handleSetCurrent = async (planIndex) => {
        const updatedPlans = expert.plans.map((p, idx) => ({
            ...p,
            isCurrent: idx === planIndex
        }));
        await updateExpertData({ ...expert, plans: updatedPlans });
    };

    // Helper to render bullet points
    const renderBulletPoints = (text) => {
        if (!text) return <p className="text-muted" style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>None</p>;
        return (
            <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0', color: '#4b5563', fontSize: '0.95rem' }}>
                {text.split('\n').map((line, i) => line.trim() && <li key={i}>{line.trim()}</li>)}
            </ul>
        );
    };

    const renderPlans = () => {
        // Logic to find ONLY the current week to display at the top
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let activeWeekData = null;
        let activeWeekIndex = -1;
        let activePlanIndex = -1;

        if (currentMonthPlan) {
            activePlanIndex = expert.plans.indexOf(currentMonthPlan);
            expert.plans[activePlanIndex].weeks.forEach((week, idx) => {
                const start = new Date(week.startDate);
                const end = new Date(week.endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                if (today >= start && today <= end) {
                    activeWeekData = week;
                    activeWeekIndex = idx;
                }
            });
        }

        return (
            <div className="plans-container" style={{ padding: '0 1rem', position: 'relative' }}>

                {/* --- TOP SECTION: ACTIVE WEEK ONLY --- */}
                <div className="current-plan-section" style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                                {currentMonthPlan ? `${currentMonthPlan.month} ${currentMonthPlan.year}` : 'No Month Selected'}
                            </h2>
                            <p style={{ margin: '0.2rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                                Today: {today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {currentMonthPlan && (
                            <button
                                onClick={() => openAddWeekModal(activePlanIndex)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }}
                            >
                                <Calendar size={18} /> Add Week
                            </button>
                        )}
                    </div>

                    {activeWeekData ? (
                        <div className="active-week-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => openEditWeekModal(activePlanIndex, activeWeekIndex, activeWeekData)} title="Edit Week" style={{ padding: '0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#4b5563' }}><FileText size={18} /></button>
                                <button onClick={() => handleDeleteWeek(activePlanIndex, activeWeekIndex)} title="Delete Week" style={{ padding: '0.5rem', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}><X size={18} /></button>
                            </div>

                            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-block' }}>Current Active Week</span>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0.5rem 0' }}>{activeWeekData.weekLabel}</h3>
                                <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>
                                    {new Date(activeWeekData.startDate).toLocaleDateString()} - {new Date(activeWeekData.endDate).toLocaleDateString()}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.8rem' }}>Current Plan / Targets</h4>
                                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', minHeight: '100px' }}>
                                        {renderBulletPoints(activeWeekData.plan)}
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ color: '#10b981', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.8rem' }}>Achievements / Deliverables</h4>
                                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', minHeight: '100px' }}>
                                        {renderBulletPoints(activeWeekData.achievement)}
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ color: '#8b5cf6', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.8rem' }}>Additional Section</h4>
                                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                                        {renderBulletPoints(activeWeekData.additional)}
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ color: '#f59e0b', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.8rem' }}>Remarks</h4>
                                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                                        {renderBulletPoints(activeWeekData.remarks)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f9fafb', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
                            <Calendar size={48} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
                            <h3 style={{ color: '#374151', margin: '0 0 0.5rem 0' }}>No Plan for This Week</h3>
                            <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                                There is no specific plan added for the current date ({today.toLocaleDateString()}).
                                {currentMonthPlan ? " Add a week to your current monthly plan." : " Please select or create a monthly plan."}
                            </p>
                            {currentMonthPlan && (
                                <button
                                    onClick={() => openAddWeekModal(activePlanIndex)}
                                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Create Plan for this Week
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '3rem 0' }} />

                {/* --- BOTTOM SECTION: MONTHLY REPORTS ARCHIVE --- */}
                <div className="monthly-archive-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} /> Monthly Archives
                        </h3>
                        <button
                            onClick={handleAddMonth}
                            style={{ background: 'white', border: '1px solid #d1d5db', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', color: '#374151', fontWeight: 500 }}
                        >
                            + New Month
                        </button>
                    </div>

                    <div className="accordion-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {sortedPlans.map((plan, idx) => {
                            const actualIdx = expert.plans.indexOf(plan);
                            const isExpanded = expandedMonth === idx;

                            return (
                                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div
                                        onClick={() => setExpandedMonth(isExpanded ? null : idx)}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            background: isExpanded ? '#feffff' : '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            backgroundColor: plan.isCurrent ? '#eff6ff' : 'white'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1f2937' }}>{plan.month} {plan.year}</span>
                                            {plan.isCurrent && <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1e40af', padding: '0.2rem 0.5rem', borderRadius: '99px', fontWeight: 600 }}>CURRENT</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            {!plan.isCurrent && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSetCurrent(actualIdx); }}
                                                    style={{ fontSize: '0.8rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Set as Current
                                                </button>
                                            )}
                                            <span style={{ color: '#9ca3af' }}>{isExpanded ? '▼' : '►'}</span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ padding: '1rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                                <button onClick={() => openAddWeekModal(actualIdx)} style={{ fontSize: '0.85rem', color: '#4b5563', background: 'white', border: '1px solid #d1d5db', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>+ Add Week</button>
                                            </div>
                                            {plan.weeks && plan.weeks.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                    {plan.weeks.map((week, wIdx) => {
                                                        // Unique key for week expansion state
                                                        const weekKey = `${idx}-${wIdx}`;
                                                        // We need a state for expanded weeks. 
                                                        // Since we can have multiple months, maybe just track one open week or multiple?
                                                        // Let's use a simple state "expandedWeekKey".

                                                        const isWeekExpanded = expandedWeekKey === weekKey;

                                                        return (
                                                            <div key={wIdx} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                                                {/* Week Header */}
                                                                <div
                                                                    onClick={() => setExpandedWeekKey(isWeekExpanded ? null : weekKey)}
                                                                    style={{ padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isWeekExpanded ? '#f3f4f6' : 'white' }}
                                                                >
                                                                    <div>
                                                                        <strong style={{ color: '#374151' }}>{week.weekLabel}</strong>
                                                                        <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                                                            {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>{isWeekExpanded ? 'Close ▲' : 'View Details ▼'}</span>
                                                                </div>

                                                                {/* Week Details (Rich UI) */}
                                                                {isWeekExpanded && (
                                                                    <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
                                                                            <button onClick={() => openEditWeekModal(actualIdx, wIdx, week)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#4b5563' }}><FileText size={14} /> Edit</button>
                                                                            <button onClick={() => handleDeleteWeek(actualIdx, wIdx)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}><X size={14} /> Delete</button>
                                                                        </div>

                                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                                                            <div>
                                                                                <h4 style={{ color: '#3b82f6', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.6rem' }}>Plan / Targets</h4>
                                                                                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                                                                    {renderBulletPoints(week.plan)}
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <h4 style={{ color: '#10b981', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.6rem' }}>Achievements</h4>
                                                                                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                                                                    {renderBulletPoints(week.achievement)}
                                                                                </div>
                                                                            </div>
                                                                            {week.additional && (
                                                                                <div>
                                                                                    <h4 style={{ color: '#8b5cf6', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.6rem' }}>Additional</h4>
                                                                                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                                                                        {renderBulletPoints(week.additional)}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {week.remarks && (
                                                                                <div>
                                                                                    <h4 style={{ color: '#f59e0b', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.6rem' }}>Remarks</h4>
                                                                                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                                                                        {renderBulletPoints(week.remarks)}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>No weeks recorded.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- ADD/EDIT WEEK MODAL --- */}
                {isWeekModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', width: '90%', maxWidth: '600px', borderRadius: '12px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', color: '#111827' }}>
                                {editingWeekIndex !== null ? 'Edit Week Details' : 'Add New Week'}
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Week Number</label>
                                    <input type="number" value={weekFormData.weekNumber} onChange={e => setWeekFormData({ ...weekFormData, weekNumber: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    {/* Spacer or Status */}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Start Date</label>
                                    <input type="date" value={weekFormData.startDate} onChange={e => setWeekFormData({ ...weekFormData, startDate: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>End Date</label>
                                    <input type="date" value={weekFormData.endDate} onChange={e => setWeekFormData({ ...weekFormData, endDate: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Current Plan / Targets</label>
                                <textarea value={weekFormData.plan} onChange={e => setWeekFormData({ ...weekFormData, plan: e.target.value })} rows={3} placeholder="Enter bullet points..." style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Achievements / Deliverables</label>
                                <textarea value={weekFormData.achievement} onChange={e => setWeekFormData({ ...weekFormData, achievement: e.target.value })} rows={3} placeholder="Enter bullet points..." style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Additional Section</label>
                                <textarea value={weekFormData.additional} onChange={e => setWeekFormData({ ...weekFormData, additional: e.target.value })} rows={2} placeholder="Any additional info..." style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>Remarks</label>
                                <textarea value={weekFormData.remarks} onChange={e => setWeekFormData({ ...weekFormData, remarks: e.target.value })} rows={2} placeholder="Remarks..." style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => setIsWeekModalOpen(false)} style={{ padding: '0.6rem 1.2rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                                <button onClick={handleSaveWeek} style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Save Week</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderMOMs = () => (
        <div className="moms-container" style={{ background: 'white', padding: '2rem', borderRadius: '16px' }}>
            <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 600, color: '#1f2937' }}>
                <FileText size={20} />
                Minutes of Meeting & Events
            </div>
            {expert.moms && expert.moms.length > 0 ? (
                <div className="moms-list">
                    {expert.moms.map((mom, idx) => (
                        <div key={idx} style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#111827' }}>{mom.eventName}</span>
                                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{new Date(mom.date).toLocaleDateString()}</span>
                            </div>
                            <div style={{ color: '#4b5563', lineHeight: '1.6' }}>{mom.summary}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                    <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No Minutes of Meeting recorded.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="expert-dashboard-modal">
            <div className="dashboard-content">
                {/* Sidebar */}
                <div className="dashboard-sidebar">
                    <div>
                        <div className="expert-profile-large">
                            <div className="avatar-large">
                                <User />
                            </div>
                            <div className="expert-name-large">{expert.name}</div>
                            <div className="expert-role-large">{expert.designation}</div>
                        </div>

                        <nav className="dashboard-nav">
                            <div
                                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <LayoutDashboard size={20} /> Overview
                            </div>
                            <div
                                className={`nav-item ${activeTab === 'plans' ? 'active' : ''}`}
                                onClick={() => setActiveTab('plans')}
                            >
                                <CheckCircle size={20} /> Plans & Goals
                            </div>
                            <div
                                className={`nav-item ${activeTab === 'moms' ? 'active' : ''}`}
                                onClick={() => setActiveTab('moms')}
                            >
                                <FileText size={20} /> MOMs & Events
                            </div>
                        </nav>
                    </div>

                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                        BFC & WEFC Operations<br />Internal Dashboard v1.2
                    </div>
                </div>

                {/* Main Content */}
                <div className="dashboard-main">
                    <div className="dashboard-header">
                        <div className="dashboard-title">
                            {activeTab === 'overview' && 'Dashboard Overview'}
                            {activeTab === 'plans' && 'Expert Plans & Goals'}
                            {activeTab === 'moms' && 'Event Documentation'}
                        </div>
                        <button className="close-btn" onClick={onClose}>
                            <X size={32} />
                        </button>
                    </div>

                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'plans' && renderPlans()}
                    {activeTab === 'moms' && renderMOMs()}
                </div>
            </div>
        </div>
    );
};

export default ExpertDashboard;
