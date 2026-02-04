const mongoose = require('mongoose');
const MasterRecord = require('./models/MasterRecord');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const inspectDiscrepancies = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // 1. Field Visits Analysis
        console.log('\n--- FIELD VISIT CANDIDATES ---');
        const fieldVisitCandidates = await MasterRecord.aggregate([
            {
                $match: {
                    $or: [
                        { category: 'Field_Visit' },
                        { eventName: { $regex: /^TSM/i } }, // Starts with TSM
                        { eventName: { $regex: /Moira/i } }
                    ]
                }
            },
            {
                $group: {
                    _id: { name: "$eventName", date: "$date" },
                    count: { $sum: 1 },
                    actualCategory: { $first: "$category" }
                }
            },
            { $sort: { "_id.date": -1 } }
        ]);

        console.log(`Total Field Visit Unique Groups found: ${fieldVisitCandidates.length}`);
        fieldVisitCandidates.forEach(c => {
            console.log(`[${c._id.date ? c._id.date.toISOString().split('T')[0] : 'NoDate'}]"${c._id.name}"(Cat: ${c.actualCategory}, Recs: ${c.count})`);
        });

        // 2. Exhibitions Analysis
        console.log('\n--- EXHIBITION CANDIDATES ---');
        const exhCandidates = await MasterRecord.aggregate([
            {
                $match: { category: 'Exhibition' }
            },
            {
                $group: {
                    _id: { name: "$eventName", date: "$date" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": -1 } }
        ]);
        console.log(`Total Exhibition Unique Groups found: ${exhCandidates.length} `);
        exhCandidates.forEach(c => {
            console.log(`[${c._id.date ? c._id.date.toISOString().split('T')[0] : 'NoDate'}]"${c._id.name}"(Recs: ${c.count})`);
        });

        // 3. Check Tarang
        console.log('\n--- TARANG EVENTS ---');
        const tarang = await MasterRecord.find({ eventName: { $regex: /Tarang/i } }).select('eventName category date');
        tarang.forEach(t => console.log(`"${t.eventName}" - ${t.category} - ${t.date} `));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectDiscrepancies();
