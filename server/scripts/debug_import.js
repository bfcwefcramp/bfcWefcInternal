require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const run = async () => {
    try {
        const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');
        console.log("Checking file:", filePath);
        if (fs.existsSync(filePath)) {
            console.log("File exists.");
        } else {
            console.error("File NOT found.");
        }

        console.log("Connecting to Mongo...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
};
run();
