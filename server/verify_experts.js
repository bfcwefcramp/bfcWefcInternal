const mongoose = require('mongoose');
const path = require('path');
const MasterRecord = require('./models/MasterRecord');
require('dotenv').config(); // Path default is root .env usually, or specify if needed

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const verifyExperts = async () => {
    try {
        await mongoose.connect(MONGODB_URI);

        const names = ['jatin', 'navya', 'navyateja', 'cheerladinne'];

        for (const name of names) {
            const count = await MasterRecord.countDocuments({ expertName: { $regex: name, $options: 'i' }, category: 'Udyam' });
            console.log(`Expert '${name}' (Udyam): FOUND ${count} RECORDS`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyExperts();
