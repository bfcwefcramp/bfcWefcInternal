const mongoose = require('mongoose');
require('dotenv').config();

const MasterRecordSchema = new mongoose.Schema({
    category: String,
    eventName: String,
    remarks: String,
    expertName: String
}, { strict: false });

const MasterRecord = mongoose.model('MasterRecord', MasterRecordSchema, 'master_records');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bfc-wefc');
        console.log("Connected to MongoDB");

        // Search for "Exhibition" in any relevant field
        const regex = /exhibition/i;
        const records = await MasterRecord.find({
            $or: [
                { category: regex },
                { eventName: regex },
                { remarks: regex }
            ]
        }).limit(20);

        console.log(`Found ${records.length} records matching 'Exhibition'.`);

        if (records.length > 0) {
            console.log("Sample Records:");
            records.forEach((r, i) => {
                console.log(`--- [${i + 1}] ---`);
                console.log(`Expert: ${r.expertName}`);
                console.log(`Category: ${r.category}`);
                console.log(`Event: ${r.eventName}`);
                console.log(`Remarks: ${r.remarks}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

run();
