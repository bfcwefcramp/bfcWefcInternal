const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const Expert = require('../models/Expert');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const dumpData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);

        const experts = await Expert.find({});
        const expertKeys = [];
        experts.forEach(e => {
            if (e.name) {
                expertKeys.push(e.name.toLowerCase());
                const parts = e.name.trim().split(' ');
                if (parts.length > 0) expertKeys.push(parts[0].toLowerCase());
            }
        });

        const filePath = path.join('c:/Users/DITC/Desktop/bfcWefcBackedupV1.1/bfcWefcInternal', 'Final Master Database sheet.xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames.find(n => n.includes('Event_Exh'));
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let output = `EXPERT KEYS:\n${JSON.stringify(expertKeys, null, 2)}\n\n`;
        output += `SHEET DATA (Officials Column Index 3):\n`;

        rawData.forEach((row, i) => {
            if (i > 0 && row) {
                output += `Row ${i}: [${row[3]}]\n`;
            }
        });

        fs.writeFileSync('debug_dump.txt', output);
        console.log("Dumped to debug_dump.txt");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

dumpData();
