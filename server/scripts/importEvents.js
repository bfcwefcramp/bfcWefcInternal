const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const EventStat = require('../models/EventStat');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Use local fallback if env var is missing/incorrect for this script context
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const importEvents = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        const filePath = path.join(__dirname, '../../Compiled Udyam Registration Data - BFC Team.xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Specific range/column logic based on inspection
        // Column A (0) = Name/Event, Column B (1) = Count (Merged cells might be tricky, but let's try reading rows)
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        console.log('Found', data.length, 'rows in Excel.');

        // Clear existing stats to avoid duplication on re-run
        await EventStat.deleteMany({});
        console.log('Cleared existing Event Stats.');

        let countImported = 0;

        for (let i = 2; i < data.length; i++) { // Skip header rows (approx row 0-2 based on inspection)
            const row = data[i];
            const name = row[0]; // Column A
            const count = row[1]; // Column B

            // Validate: Name should be a string, Count should be a number
            if (name && typeof name === 'string' && !name.includes('Grand Total') && !name.includes('Count') && count && !isNaN(count)) {

                await EventStat.create({
                    eventName: name.trim(),
                    count: parseInt(count, 10),
                    category: 'Event' // Defaulting to Event for now
                });
                console.log(`Imported: ${name} - ${count}`);
                countImported++;
            }
        }

        console.log(`\nSuccessfully imported ${countImported} event records.`);
        process.exit(0);

    } catch (error) {
        console.error('Import Error:', error);
        process.exit(1);
    }
};

importEvents();
