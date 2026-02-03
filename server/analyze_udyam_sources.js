const mongoose = require('mongoose');
const MasterRecord = require('./models/MasterRecord');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const analyzeSources = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Aggregation to find distinct remarks for Udyam records
        const stats = await MasterRecord.aggregate([
            {
                $match: {
                    udyamRegistrationNo: { $exists: true, $ne: '', $not: { $regex: /^\s*$/ } }
                }
            },
            {
                $group: {
                    _id: { $toLower: "$remarks" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        console.log('--- Udyam Source Distribution (based on Remarks) ---');
        stats.forEach(s => {
            console.log(`${s._id || '(Empty)'}: ${s.count}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

analyzeSources();
