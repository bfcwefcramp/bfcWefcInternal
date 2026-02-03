const express = require('express');
const router = express.Router();
const MasterRecord = require('../models/MasterRecord');

// GET: Overall Team Stats for Main Dashboard
router.get('/stats', async (req, res) => {
    try {
        const totalRecords = await MasterRecord.countDocuments();

        // Activity Breakdown
        const workshops = await MasterRecord.countDocuments({ category: 'Workshop' });
        const events = await MasterRecord.countDocuments({ category: 'Event' });
        const walkins = await MasterRecord.countDocuments({ category: 'Walk-in' });

        // Udyam Registrations (where field exists and not empty)
        const udyamCount = await MasterRecord.countDocuments({
            udyamRegistrationNo: { $exists: true, $ne: '', $not: { $regex: /^\s*$/ } }
        });

        // Event List (Distinct event names with counts)
        const eventsListAggregate = await MasterRecord.aggregate([
            { $match: { category: { $ne: 'Walk-in' } } }, // Exclude walk-ins from event list
            { $group: { _id: "$eventName", count: { $sum: 1 }, type: { $first: "$category" } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            total: totalRecords,
            breakdown: {
                workshops,
                events,
                walkins
            },
            udyamCount,
            eventsList: eventsListAggregate.map(e => ({ name: e._id || 'Unnamed Event', count: e.count, type: e.type }))
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

        // MOMs: Fetch specifically categorized MoMs OR those with keywords
        const moms = records.filter(r =>
            r.category === 'MoM' ||
            (r.remarks && (r.remarks.toLowerCase().includes('mom') || r.remarks.toLowerCase().includes('minutes')))
        );

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
            recentActivity: records.slice(0, 10),
            moms: moms,

            // New: Udyam Source Distribution
            udyamSourceDistribution: (() => {
                const dist = { 'Walk-in': 0, 'Camp/Event': 0, 'Other': 0 };
                records.forEach(r => {
                    if (r.udyamRegistrationNo) {
                        const rem = (r.remarks || '').toLowerCase();
                        if (rem.includes('walk') || rem.includes('office')) {
                            dist['Walk-in']++;
                        } else if (rem.includes('tsm') || rem.includes('camp') || rem.includes('workshop') || rem.includes('event')) {
                            dist['Camp/Event']++;
                        } else {
                            dist['Other']++;
                        }
                    }
                });
                return Object.entries(dist).map(([name, value]) => ({ name, value }));
            })()
        });

    } catch (err) {
        console.error('Error fetching expert master stats:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
