const mongoose = require('mongoose');
const MasterRecord = require('../models/MasterRecord');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const checkSanketStats = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        const events = await MasterRecord.find({ expertName: /Sanket/i });
        const count = events.length;
        fs.writeFileSync(path.join(__dirname, '../../sanket_count.txt'), `Count: ${count}`);
        console.log(`Count: ${count}`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkSanketStats();
