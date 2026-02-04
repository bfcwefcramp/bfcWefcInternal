const mongoose = require('mongoose');
const MasterRecord = require('./models/MasterRecord');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const debugEvents = async () => {
    try {
        await mongoose.connect(MONGODB_URI);

        // 1. Field Visits
        console.log('--- DETECTED FIELD VISITS (17?) ---');
        const fv = await MasterRecord.aggregate([
            {
                $match: {
                    $or: [
                        { category: 'Field_Visit' },
                        { eventName: { $regex: /^TSM/i } },
                        { eventName: { $regex: /Moira/i } }
                    ]
                }
            },
            { $group: { _id: { name: "$eventName", date: "$date" } } },
            { $sort: { "_id.name": 1 } }
        ]);
        fv.forEach((e, i) => console.log(`${i + 1}. ${e._id.name} (${e._id.date ? e._id.date.toISOString().split('T')[0] : 'NoDate'})`));

        // 2. Exhibitions
        console.log('\n--- DETECTED EXHIBITIONS (22?) ---');
        const exh = await MasterRecord.aggregate([
            {
                $match: {
                    $or: [
                        { category: 'Exhibition' },
                        { eventName: { $regex: /Tarang/i } }
                    ]
                }
            },
            { $group: { _id: { name: "$eventName", date: "$date" } } },
            { $sort: { "_id.name": 1 } }
        ]);
        exh.forEach((e, i) => console.log(`${i + 1}. ${e._id.name} (${e._id.date ? e._id.date.toISOString().split('T')[0] : 'NoDate'})`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugEvents();
