const mongoose = require('mongoose');
const MasterRecord = require('./models/MasterRecord');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const debugCounts = async () => {
    try {
        await mongoose.connect(MONGODB_URI);

        // 1. Analyze Field Visits (The "16")
        console.log('--- FIELD VISIT ANALYSIS ---');
        const fvAgg = await MasterRecord.aggregate([
            {
                $match: {
                    $or: [
                        { category: 'Field_Visit' },
                        { eventName: { $regex: /^TSM/i } },
                        { eventName: { $regex: /Moira/i } }
                    ]
                }
            },
            {
                $group: {
                    _id: { name: "$eventName", date: "$date" },
                    count: { $sum: 1 } // How many records per event
                }
            },
            { $sort: { "_id.date": -1 } }
        ]);

        console.log(`Unique Field Visit Events: ${fvAgg.length}`);
        fvAgg.forEach((e, i) => {
            console.log(`${i + 1}. ${e._id.name} | ${e._id.date ? e._id.date.toISOString().slice(0, 10) : 'NO_DATE'} | (Records: ${e.count})`);
        });

        // 2. Check for Missing Categories/Sheets
        console.log('\n--- CATEGORY BREAKDOWN ---');
        const catAgg = await MasterRecord.aggregate([
            { $group: { _id: "$category", distinctEvents: { $addToSet: "$eventName" } } }
        ]);

        catAgg.forEach(c => {
            console.log(`Category: ${c._id} - Unique Events: ${c.distinctEvents.length}`);
            if (c.distinctEvents.length < 5) {
                console.log(`  Events: ${c.distinctEvents.join(', ')}`);
            }
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugCounts();
