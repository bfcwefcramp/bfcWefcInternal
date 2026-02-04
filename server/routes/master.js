const express = require('express');
const router = express.Router();
const MasterRecord = require('../models/MasterRecord');

// GET: Overall Team Stats for Main Dashboard
router.get('/stats', async (req, res) => {
    try {
        const totalRecords = await MasterRecord.countDocuments();

        // Organization Breakdown
        const bfcCount = await MasterRecord.countDocuments({ organization: { $regex: /bfc/i } });
        const wefcCount = await MasterRecord.countDocuments({ organization: { $regex: /wefc/i } });

        // Activity Breakdown
        const workshops = await MasterRecord.countDocuments({ category: 'Workshop' });
        const events = await MasterRecord.countDocuments({ category: 'Event' });
        // momEvents is split now:
        // momEvents is split now:
        // Use Aggregation to count UNIQUE events (by Name + Date) to avoid double counting attendees
        const exhibitionsAgg = await MasterRecord.aggregate([
            { $match: { category: 'Exhibition' } },
            { $group: { _id: { name: "$eventName", date: "$date" } } },
            { $count: "count" }
        ]);
        const exhibitions = exhibitionsAgg.length > 0 ? exhibitionsAgg[0].count : 0;

        const deptVisitsAgg = await MasterRecord.aggregate([
            { $match: { category: 'Departmental_Visit' } },
            { $group: { _id: { name: "$eventName", date: "$date" } } },
            { $count: "count" }
        ]);
        const deptVisits = deptVisitsAgg.length > 0 ? deptVisitsAgg[0].count : 0;

        const walkins = await MasterRecord.countDocuments({ category: 'Walk-in' });

        // Unique Beneficiaries
        const uniqueBeneficiaries = (await MasterRecord.distinct('name')).length;

        // Udyam Registrations
        const udyamCount = await MasterRecord.countDocuments({
            $or: [
                { category: 'Udyam' },
                { udyamRegistrationNo: { $exists: true, $ne: '', $not: { $regex: /^\s*$/ } } }
            ]
        });

        // Event List (Distinct event names with counts)
        const eventsListAggregate = await MasterRecord.aggregate([
            { $match: { category: { $in: ['Exhibition', 'Departmental_Visit', 'Event', 'MoM_Event', 'Workshop'] } } },
            {
                $group: {
                    _id: "$eventName",
                    count: { $sum: 1 },
                    type: { $first: "$category" },
                    date: { $first: "$date" },
                    description: { $first: "$remarks" }
                }
            },
            { $sort: { date: -1 } },
            { $limit: 30 }
        ]);

        // Monthly Interventions (Bar Chart Data)
        const monthlyStats = await MasterRecord.aggregate([
            {
                $match: {
                    date: { $exists: true, $ne: null },
                    category: { $nin: ['Exhibition', 'Departmental_Visit', 'MoM_Event'] }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const formatMonth = (m) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1];

        res.json({
            total: totalRecords,
            organizations: {
                BFC: bfcCount,
                WEFC: wefcCount
            },
            breakdown: {
                workshops,
                events,
                exhibitions,
                deptVisits,
                walkins
            },
            uniqueBeneficiaries,
            udyamCount,
            monthlyInterventions: monthlyStats.map(m => ({
                name: `${formatMonth(m._id.month)} ${m._id.year}`,
                value: m.count
            })),
            eventsList: eventsListAggregate.map(e => ({
                name: e._id || 'Unnamed Event',
                count: e.count,
                type: e.type,
                date: e.date,
                description: e.description
            }))
        });

    } catch (err) {
        console.error('Error fetching master stats:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET: Expert Specific Stats
router.get('/expert/:expertName', async (req, res) => {
    try {
        const { expertName } = req.params;
        // Helper to match fuzzy names if needed, but for now using regex
        const regex = new RegExp(expertName, 'i');

        const total = await MasterRecord.countDocuments({ expertName: { $regex: regex } });

        // Activities by type
        const eventsAttended = await MasterRecord.distinct('eventName', { expertName: { $regex: regex }, category: 'Event' });
        const workshopsAttended = await MasterRecord.distinct('eventName', { expertName: { $regex: regex }, category: 'Workshop' });

        // Detailed list of records for this expert
        // Fetch detailed records including new fields
        const records = await MasterRecord.find({ expertName: { $regex: regex } })
            .sort({ date: -1 })
            .select('eventName date category udyamRegistrationNo businessName remarks agenda venue');

        // MOMs: Fetch broader set of activities for the Timeline
        // User requested "Event Exhibitions" and "Departmental Visits" to be included.
        // We will include explicitly categorized MoMs, plus Events, Workshops, and Visits.
        const moms = records.filter(r => {
            const cat = (r.category || '').toLowerCase();
            const rem = (r.remarks || '').toLowerCase();
            const name = (r.eventName || '').toLowerCase();

            // Explicit MoM category or keywords
            if (cat === 'mom' || rem.includes('mom') || rem.includes('minutes')) return true;

            // Also include Major Activities in the Timeline
            if (cat === 'event' || cat === 'workshop' || cat === 'exhibition' || cat === 'visit') return true;
            if (name.includes('exhibition') || name.includes('visit') || name.includes('delegation')) return true;

            return false;
        });

        // Count Udyam done by this expert (Restored)
        const udyamCount = await MasterRecord.countDocuments({
            expertName: { $regex: regex },
            udyamRegistrationNo: { $exists: true, $ne: '', $not: { $regex: /^\s*$/ } }
        });

        res.json({
            expertName,
            totalInteractions: total,
            udyamCount,
            eventsCount: eventsAttended.length,
            workshopsCount: workshopsAttended.length,
            eventNames: eventsAttended,
            workshopNames: workshopsAttended,
            recentActivity: records.slice(0, 10), // Preserves date: -1 sort (Newest First)
            moms: moms,

            // New: Participation Distribution (Events, Workshops, Visits)
            participationDistribution: (() => {
                const dist = { 'Events': 0, 'Workshops': 0, 'Walk-ins/Visits': 0 };
                records.forEach(r => {
                    const cat = (r.category || '').toLowerCase();
                    const name = (r.eventName || '').toLowerCase();
                    const rem = (r.remarks || '').toLowerCase();

                    if (cat === 'workshop' || name.includes('workshop') || rem.includes('workshop')) {
                        dist['Workshops']++;
                    } else if (cat === 'event' || cat === 'mom' || name.includes('event') || name.includes('exhibition')) {
                        dist['Events']++;
                    } else {
                        dist['Walk-ins/Visits']++;
                    }
                });
                return Object.entries(dist).map(([name, value]) => ({ name, value }));
            })(),

            // New: Udyam count based on Category OR udyamRegistrationNo
            udyamCount: records.filter(r =>
                (r.category === 'Udyam') ||
                (r.udyamRegistrationNo && r.udyamRegistrationNo.length > 0)
            ).length,

            participationDistribution: (() => {
                const dist = { 'Events': 0, 'Workshops': 0, 'Walk-ins/Visits': 0 };
                records.forEach(r => {
                    const cat = (r.category || '').toLowerCase();
                    const name = (r.eventName || '').toLowerCase();
                    const rem = (r.remarks || '').toLowerCase();

                    // Don't count Udyam as typical Event unless explicit
                    if (cat === 'udyam') return;

                    if (cat === 'workshop' || name.includes('workshop') || rem.includes('workshop')) {
                        dist['Workshops']++;
                    } else if (cat === 'event' || cat === 'mom' || cat === 'exhibition' || name.includes('event') || name.includes('exhibition')) {
                        dist['Events']++;
                    } else {
                        dist['Walk-ins/Visits']++;
                    }
                });
                return Object.entries(dist).map(([name, value]) => ({ name, value }));
            })(),

            // New: Udyam Source Distribution (Walk-in vs Event) based on classification
            udyamSourceDistribution: (() => {
                const dist = { 'Walk-in': 0, 'Camp/Event': 0 };
                const udyamRecords = records.filter(r =>
                    (r.category === 'Udyam') ||
                    (r.udyamRegistrationNo && r.udyamRegistrationNo.length > 0)
                );

                udyamRecords.forEach(r => {
                    const rem = (r.remarks || '').toLowerCase();
                    if (rem.includes('tsm') || rem.includes('camp') || rem.includes('workshop') || rem.includes('event')) {
                        dist['Camp/Event']++;
                    } else {
                        // Default to Walk-in
                        dist['Walk-in']++;
                    }
                });
                return Object.entries(dist).map(([name, value]) => ({ name, value }));
            })(),

            // Full Udyam Lists for Modal
            udyamRecords: records.filter(r =>
                (r.category === 'Udyam') ||
                (r.udyamRegistrationNo && r.udyamRegistrationNo.length > 0)
            ).sort((a, b) => new Date(b.date) - new Date(a.date)),

            // New: Attendance Stats (Unique Days per Month)
            attendanceStats: (() => {
                const grouped = {};
                records.forEach(r => {
                    if (!r.date) return;
                    const d = new Date(r.date);
                    const key = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`; // e.g., "January 2024"
                    const dayKey = d.toDateString(); // Unique day

                    if (!grouped[key]) grouped[key] = new Set();
                    grouped[key].add(dayKey);
                });

                const history = Object.entries(grouped).map(([month, daysSet]) => ({
                    month,
                    days: daysSet.size
                }));

                // Sort history by date (parse month/year)
                history.sort((a, b) => new Date(b.month + ' 1') - new Date(a.month + ' 1'));

                // Get "Last Month" count (Previous month relative to now, or just the most recent entry if logic requires)
                // User said "last month". Let's get the most recent completed month or the current one if active.
                // Let's just take the most recent entry from history as the "Latest Attendance"
                const latest = history[0] || { month: 'N/A', days: 0 };

                // Try to find specifically the *previous* month if possible, but fallback to latest
                const now = new Date();
                const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const prevMonthName = `${prevMonthDate.toLocaleString('default', { month: 'long' })} ${prevMonthDate.getFullYear()}`;
                const lastMonthEntry = history.find(h => h.month === prevMonthName);

                return {
                    history,
                    lastMonthLabel: prevMonthName,
                    lastMonthCount: lastMonthEntry ? lastMonthEntry.days : 0,
                    latestLabel: latest.month,
                    latestCount: latest.days
                };
            })()
        });

    } catch (err) {
        console.error('Error fetching expert master stats:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST: Create New Event (Multi-Expert)
router.post('/event', async (req, res) => {
    try {
        const { eventName, venue, date, category, agenda, remarks, attendees, udyamRegistrationNo, businessName } = req.body;

        if (!eventName || !date || !attendees || !Array.isArray(attendees)) {
            return res.status(400).json({ error: 'Missing required fields or attendees list' });
        }

        const recordsToInsert = attendees.map(expertName => ({
            expertName,
            eventName,
            venue,
            date: new Date(date),
            category: category || 'Event',
            agenda,
            remarks,
            organization: 'BFC', // Default
            udyamRegistrationNo, // Optional
            businessName,         // Optional
            createdAt: new Date()
        }));

        if (recordsToInsert.length > 0) {
            await MasterRecord.insertMany(recordsToInsert);
        }

        res.json({ message: 'Event created successfully', count: recordsToInsert.length });
    } catch (err) {
        console.error('Error creating event:', err);
        res.status(500).json({ error: err.message });
    }
});

// Export Events API
router.get('/export-events', async (req, res) => {
    try {
        const xlsx = require('xlsx');

        const records = await MasterRecord.find({
            category: { $in: ['Exhibition', 'Departmental_Visit', 'Event', 'Workshop', 'MoM', 'MoM_Event'] }
        }).sort({ date: -1 });

        const data = records.map(r => ({
            Date: r.date ? new Date(r.date).toLocaleDateString() : '',
            Category: r.category,
            Event: r.eventName,
            Venue: r.venue,
            'Attended By': r.expertName,
            Agenda: r.agenda,
            Remarks: r.remarks
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Events & MoMs");

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.set('Content-Disposition', 'attachment; filename="Events_MoMs_Export.xlsx"');
        res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
