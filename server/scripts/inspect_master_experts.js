const mongoose = require('mongoose');
const MasterRecord = require('../models/MasterRecord');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const listExperts = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        const experts = await MasterRecord.distinct('expertName');
        console.log('Unique Expert Names in Master DB:', experts);

        // Also check if any simple "Sanket" match exists
        const sanketRecords = await MasterRecord.find({ expertName: { $regex: /Sanket/i } }).limit(5).select('expertName');
        console.log('Sample Sanket Records:', sanketRecords);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listExperts();
