const mongoose = require('mongoose');
const MasterRecord = require('./models/MasterRecord');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const analyzeFieldVisits = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // 1. Raw Count of docs that match logic
        const rawDocs = await MasterRecord.find({
            $or: [
                { category: 'Field_Visit' },
                { eventName: { $regex: /^TSM/i } }
            ]
        }).select('eventName date category expertName');

        console.log('\n--- Raw Documents Matched (Expert-Level Records) ---');
        console.log(`Total Docs: ${rawDocs.length}`);
        // rawDocs.forEach(d => console.log(`[${d.date ? d.date.toISOString().split('T')[0] : 'NoDate'}] ${d.eventName} (${d.expertName})`));

        // 2. Aggregated Count (Unique Events)
        const agg = await MasterRecord.aggregate([
            {
                $match: {
                    $or: [
                        { category: 'Field_Visit' },
                        { eventName: { $regex: /^TSM/i } }
                    ]
                }
            },
            { $group: { _id: { name: "$eventName", date: "$date" } } }
        ]);

        console.log('\n--- Unique Events Identified ---');
        console.log(`Total Unique Events: ${agg.length}`);
        agg.forEach(e => console.log(`  - ${e._id.name} (${e._id.date ? e._id.date.toISOString().split('T')[0] : 'No Date'})`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

analyzeFieldVisits();
