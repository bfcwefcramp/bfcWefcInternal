import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    LayoutDashboard, Calendar, FileText, CheckCircle,
    X, User, Users, Activity, Trophy, CalendarCheck // Added CalendarCheck
} from 'lucide-react';
import './ExpertDashboard.css';
import AttendanceCalendar from './AttendanceCalendar';

const ExpertDashboard = ({ expert, onClose, onUpdate, stats, onDelete }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [masterStats, setMasterStats] = useState(null);

    // Attendance Modal State
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    // Udyam Modal State
    const [isUdyamModalOpen, setIsUdyamModalOpen] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

    // ... existing ...

    // And update the Udyam card to be clickable
    /*
        <div
            className="kpi-card hover:shadow-lg"
            onClick={() => setIsUdyamModalOpen(true)}
            style={{ flex: '1 1 250px', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderLeft: '5px solid #10b981', cursor: 'pointer', transition: 'all 0.2s' }}
        >
    */

    useEffect(() => {
        if (expert && expert.name) {
            fetchExpertMasterStats();
        }
    }, [expert]);

    const fetchExpertMasterStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/master/expert/${encodeURIComponent(expert.name)}`);
            setMasterStats(res.data);
        } catch (err) {
            console.error("Failed to fetch expert master stats:", err);
        }
    };

    // Derived Data for Charts
    const eventDistribution = masterStats?.participationDistribution || [
        { name: 'Events', value: masterStats?.eventsCount || 0 },
        { name: 'Workshops', value: masterStats?.workshopsCount || 0 },
        { name: 'Walk-ins/Visits', value: masterStats?.walkinCount || 0 },
    ];

    const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

    const renderOverview = () => (
        <div className="overview-container animate-fade-in" style={{ padding: '1rem' }}>
            {/* KPI Cards (Flex Row) */}
            <div className="kpi-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="kpi-card" style={{ flex: '1 1 250px', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderLeft: '5px solid #3b82f6' }}>
                    <div className="kpi-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>{masterStats?.totalInteractions || 0}</div>
                    <div className="kpi-label" style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Interactions</div>
                </div>

                {/* Attendance Card (Clickable) */}
                <div
                    className="kpi-card hover:shadow-lg"
                    onClick={() => setIsAttendanceModalOpen(true)}
                    style={{ flex: '1 1 250px', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderLeft: '5px solid #f59e0b', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <div className="kpi-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>{masterStats?.attendanceStats?.lastMonthCount || 0}</div>
                        <CalendarCheck size={24} className="text-orange-500" style={{ opacity: 0.5 }} />
                    </div>
                    <div className="kpi-label" style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        Days Attended ({masterStats?.attendanceStats?.lastMonthLabel || 'Last Month'})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.5rem', fontWeight: 600 }}>View History &rarr;</div>
                </div>

                <div
                    className="kpi-card hover:shadow-lg"
                    onClick={() => setIsUdyamModalOpen(true)}
                    style={{ flex: '1 1 250px', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderLeft: '5px solid #10b981', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                    <div className="kpi-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>{masterStats?.udyamCount || 0}</div>
                    <div className="kpi-label" style={{ color: '#6b7280', fontSize: '0.9rem' }}>Udyam Registrations</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 600 }}>View Details &rarr;</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Activity Distribution */}
                <div className="chart-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>
                        <Activity size={20} className="text-blue-500" />
                        Participation Distribution
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={eventDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {eventDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity List */}
                <div className="chart-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>
                        <Trophy size={20} className="text-yellow-500" />
                        Recent Contributions
                    </div>
                    {masterStats && masterStats.recentActivity && masterStats.recentActivity.length > 0 ? (
                        <div className="recent-activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                            {masterStats.recentActivity.slice(0, 5).map((act, idx) => (
                                <div key={idx} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6', transition: 'all 0.2s' }} className="hover:bg-gray-50">
                                    <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.2rem' }}>{act.businessName || 'Visitor'}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280' }}>
                                        <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '12px' }}>{act.eventName || 'Office Visit'}</span>
                                        <span>{new Date(act.date).toLocaleDateString()}</span>
                                    </div>
                                    {act.remarks && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#4b5563', fontStyle: 'italic' }}>"{act.remarks}"</div>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                            <FileText size={40} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                            <p>No recent activity found in Master DB.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Udyam Drilldown Section */}
            {masterStats?.udyamCount > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>Udyam Registration Analytics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {/* Source Distribution Chart */}
                        <div className="chart-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            <div className="chart-title" style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600, color: '#4b5563' }}>Acquisition Channel</div>
                            <div style={{ height: '250px', width: '100%', minWidth: '300px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={masterStats?.udyamSourceDistribution || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="summary-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', padding: '1.5rem', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{masterStats?.udyamCount}</div>
                            <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>Total Registrations Facilitated</div>
                            <div style={{ marginTop: '1rem', height: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                            <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
                                Top Channel: {[...(masterStats?.udyamSourceDistribution || [])].sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderMoMs = () => (
        <div className="moms-container" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={24} className="text-purple-600" />
                Events & MoMs Timeline
            </h3>

            {masterStats?.moms && masterStats.moms.length > 0 ? (
                <div className="timeline" style={{ position: 'relative', borderLeft: '3px solid #e5e7eb', paddingLeft: '2rem', marginLeft: '1rem' }}>
                    {masterStats.moms.map((mom, idx) => (
                        <div key={idx} className="timeline-item" style={{ marginBottom: '2rem', position: 'relative' }}>
                            {/* Dot */}
                            <div style={{ position: 'absolute', left: '-2.6rem', top: '0.2rem', width: '1.2rem', height: '1.2rem', background: '#8b5cf6', borderRadius: '50%', border: '4px solid white', boxShadow: '0 0 0 2px #e5e7eb' }}></div>

                            {/* Card */}
                            <div
                                className="timeline-card hover:translate-x-2"
                                style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f3f4f6', cursor: 'pointer', transition: 'all 0.3s' }}
                                onClick={() => alert(`Event: ${mom.eventName}\nDate: ${new Date(mom.date).toLocaleDateString()}\n\nAgenda:\n${mom.agenda}\n\nKey Discussions:\n${mom.remarks}`)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937' }}>{mom.eventName}</h4>
                                    <span style={{ fontSize: '0.85rem', color: '#6b7280', background: '#f3f4f6', padding: '0.2rem 0.6rem', borderRadius: '99px' }}>{new Date(mom.date).toLocaleDateString()}</span>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                                    <strong>Venue:</strong> {mom.venue || 'N/A'}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#6b7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {mom.agenda || mom.remarks}
                                </p>
                                <div style={{ marginTop: '1rem', color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 600 }}>Click for Details &rarr;</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                    <Calendar size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No MoMs or Events found for this expert.</p>
                </div>
            )}
        </div>
    );



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

    // API_URL already defined above

    // --- Edit Profile State ---
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        designation: '',
        expertise: '',
        contact: ''
    });

    const handleEditProfileChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const saveProfileChanges = async () => {
        try {
            const updatedExpert = {
                ...expert,
                name: editFormData.name,
                designation: editFormData.designation,
                expertise: editFormData.expertise.split(',').map(s => s.trim()),
                contact: editFormData.contact
            };
            await updateExpertData(updatedExpert);
            setIsEditingProfile(false);
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to update profile");
        }
    };

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

    const renderWeeklyPlans = () => {
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
                        {/* ... Existing Week Modal Content ... */}
                        <div style={{ background: 'white', width: '90%', maxWidth: '600px', borderRadius: '12px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
                            {/* ... (Kept existing content implicitly by targeting correct replacement block if entire block replaced, but here I am appending the Udyam modal after) ... */}
                            {/* Actually easier to append the new modal at the end of the return */}
                        </div>
                    </div>
                )}

                {/* --- UDYAM DETAILS MODAL --- */}
                {isUdyamModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', width: '95%', maxWidth: '1000px', borderRadius: '16px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>Udyam Registrations Details</h3>
                                    <p style={{ color: '#6b7280', marginTop: '0.2rem' }}>Total Registrations: {masterStats?.udyamCount || 0}</p>
                                </div>
                                <button onClick={() => setIsUdyamModalOpen(false)} style={{ background: '#f3f4f6', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', color: '#4b5563' }}><X size={24} /></button>
                            </div>

                            {/* Breakdown Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                {(masterStats?.udyamSourceDistribution || []).map((item, idx) => (
                                    <div key={idx} style={{ background: '#f9fafb', padding: '1rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Detailed List */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Date</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Udyam Number / Event</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Entrepreneur / Unit</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Category</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#4b5563' }}>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(masterStats?.udyamRecords || [])
                                            .map((row, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '0.75rem', color: '#1f2937' }}>{new Date(row.date).toLocaleDateString()}</td>
                                                    <td style={{ padding: '0.75rem', color: '#1f2937', fontWeight: 500 }}>{row.udyamRegistrationNo || row.eventName}</td>
                                                    <td style={{ padding: '0.75rem', color: '#4b5563' }}>{row.businessName || row.name || '-'}</td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <span style={{
                                                            background: (row.remarks || '').toLowerCase().includes('camp') || (row.remarks || '').toLowerCase().includes('tsm') ? '#fce7f3' : '#dcfce7',
                                                            color: (row.remarks || '').toLowerCase().includes('camp') || (row.remarks || '').toLowerCase().includes('tsm') ? '#be185d' : '#15803d',
                                                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600
                                                        }}>
                                                            {(row.remarks || '').toLowerCase().includes('camp') || (row.remarks || '').toLowerCase().includes('tsm') ? 'Camp/Event' : 'Walk-in'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', color: '#6b7280', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.remarks}</td>
                                                </tr>
                                            ))}
                                        {(!masterStats?.udyamRecords || masterStats.udyamRecords.length === 0) && (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                                                    No detailed Udyam records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderMonthlyReports = () => (
        <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937' }}>Monthly Performance Reports</h3>
                <button
                    onClick={handleAddMonth}
                    style={{ background: '#f59e0b', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)' }}
                >
                    <Trophy size={18} /> Add New Month
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {expert.plans && expert.plans.length > 0 ? (
                    expert.plans.map((plan, idx) => (
                        <div key={idx} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', transition: 'transform 0.2s' }} className="hover:scale-[1.02]">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>{plan.month}</h4>
                                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{plan.year}</span>
                                </div>
                                {plan.isCurrent && <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#2563eb', padding: '4px 12px', borderRadius: '99px', fontWeight: 600 }}>Current</span>}
                            </div>

                            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563' }}>
                                <CheckCircle size={16} className="text-emerald-500" />
                                <span style={{ fontWeight: 500 }}>{plan.weeks?.length || 0} Weekly Plans</span>
                            </div>

                            <button
                                onClick={() => { handleSetCurrent(idx); setActiveTab('monthly'); }} // Stay on Monthly tab
                                style={{ width: '100%', padding: '0.8rem', background: '#f9fafb', color: '#374151', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                                className="hover:bg-gray-100"
                            >
                                View Detailed Plans &rarr;
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#9ca3af', padding: '4rem', background: '#f9fafb', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
                        <Trophy size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No monthly reports found.</p>
                        <p style={{ fontSize: '0.9rem' }}>Add a new month to get started with tracking.</p>
                    </div>
                )}
            </div>
        </div>
    );



    const renderMOMs = () => (
        <div className="moms-container" style={{ background: 'white', padding: '2rem', borderRadius: '16px' }}>
            <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 600, color: '#1f2937' }}>
                <FileText size={20} />
                Minutes of Meeting & Events Log
            </div>
            {masterStats && masterStats.moms && masterStats.moms.length > 0 ? (
                <div className="moms-list">
                    {masterStats.moms.map((mom, idx) => (
                        <div key={idx} style={{ padding: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#111827' }}>{mom.eventName}</span>
                                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{new Date(mom.date).toLocaleDateString()}</span>
                            </div>
                            <div style={{ color: '#4b5563', lineHeight: '1.6', background: '#f9fafb', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                                <strong>Remarks/Details:</strong> {mom.remarks || 'No details provided.'}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                    <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>No Minutes of Meeting found in Master Records for this expert.</p>
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
                            {isEditingProfile ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                    <div className="avatar-large">
                                        <User />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleEditProfileChange}
                                        placeholder="Name"
                                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%', textAlign: 'center' }}
                                    />
                                    <input
                                        type="text"
                                        name="designation"
                                        value={editFormData.designation}
                                        onChange={handleEditProfileChange}
                                        placeholder="Designation"
                                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%', textAlign: 'center', fontSize: '0.8rem' }}
                                    />
                                    <input
                                        type="text"
                                        name="contact"
                                        value={editFormData.contact}
                                        onChange={handleEditProfileChange}
                                        placeholder="Contact / Email"
                                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%', textAlign: 'center', fontSize: '0.8rem' }}
                                    />
                                    <textarea
                                        name="expertise"
                                        value={editFormData.expertise}
                                        onChange={handleEditProfileChange}
                                        placeholder="Expertise (comma separated)"
                                        rows={2}
                                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%', textAlign: 'center', fontSize: '0.8rem', resize: 'vertical' }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                                        <button onClick={saveProfileChanges} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                                        <button onClick={() => setIsEditingProfile(false)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="avatar-large">
                                        <User />
                                    </div>
                                    <div className="expert-name-large">{expert.name}</div>
                                    <div className="expert-role-large">{expert.designation}</div>
                                    <button
                                        onClick={() => {
                                            setEditFormData({
                                                name: expert.name,
                                                designation: expert.designation,
                                                expertise: expert.expertise ? expert.expertise.join(', ') : '',
                                                contact: expert.contact
                                            });
                                            setIsEditingProfile(true);
                                        }}
                                        style={{
                                            marginTop: '0.5rem',
                                            fontSize: '0.75rem',
                                            color: '#3b82f6',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                    >
                                        Edit Profile
                                    </button>
                                </>
                            )}
                        </div>

                        <nav className="dashboard-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, color: activeTab === 'overview' ? '#fff' : '#6b7280', background: activeTab === 'overview' ? '#3b82f6' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                            >
                                <LayoutDashboard size={18} style={{ marginRight: '0.5rem' }} />
                                Overview
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                                onClick={() => setActiveTab('weekly')}
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, color: activeTab === 'weekly' ? '#fff' : '#6b7280', background: activeTab === 'weekly' ? '#10b981' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                            >
                                <CheckCircle size={18} style={{ marginRight: '0.5rem' }} />
                                Plans & Goals
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                                onClick={() => setActiveTab('monthly')}
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, color: activeTab === 'monthly' ? '#fff' : '#6b7280', background: activeTab === 'monthly' ? '#f59e0b' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                            >
                                <FileText size={18} style={{ marginRight: '0.5rem' }} />
                                Monthly Reports
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'moms' ? 'active' : ''}`}
                                onClick={() => setActiveTab('moms')}
                                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, color: activeTab === 'moms' ? '#fff' : '#6b7280', background: activeTab === 'moms' ? '#8b5cf6' : 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
                            >
                                <Calendar size={18} style={{ marginRight: '0.5rem' }} />
                                MoMs & Events
                            </button>

                        </nav>
                    </div>

                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                        BFC & WEFC Operations<br />Internal Dashboard v1.2
                    </div>

                    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={onDelete}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <X size={16} /> Delete Expert
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="dashboard-main">
                    <div className="dashboard-header">
                        <div className="dashboard-title">
                            {activeTab === 'overview' && 'Dashboard Overview'}
                            {activeTab === 'weekly' && 'Expert Plans & Goals'}
                            {activeTab === 'monthly' && 'Monthly Performance'}
                            {activeTab === 'moms' && 'Event Documentation'}
                            {activeTab === 'profile' && 'Edit Profile'}
                        </div>
                        <button className="close-btn" onClick={onClose}>
                            <X size={32} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="dashboard-content" style={{ flex: 1, overflowY: 'auto' }}>
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'moms' && renderMoMs()}
                        {activeTab === 'profile' && renderEditProfile()}
                        {activeTab === 'monthly' && renderMonthlyReports()}
                        {activeTab === 'weekly' && renderWeeklyPlans()}
                    </div>
                </div>
                {/* New Interactive Attendance Calendar */}
                {isAttendanceModalOpen && (
                    <AttendanceCalendar
                        expert={expert}
                        onClose={() => setIsAttendanceModalOpen(false)}
                        onUpdate={onUpdate}
                    />
                )}
            </div>
        </div>
    );
};

export default ExpertDashboard;
