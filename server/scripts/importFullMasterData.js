// require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const MasterRecord = require('../models/MasterRecord');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...' + MONGODB_URI.split('@')[1]); // Log masked URI
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const importData = async () => {
    await connectDB();

    const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');
    console.log("Reading file:", filePath);

    let workbook;
    try {
        workbook = XLSX.readFile(filePath);
    } catch (e) {
        console.error("Error reading Excel file:", e.message);
        process.exit(1);
    }

    // 1. Clear existing Non-Udyam records
    console.log("Clearing old Master Records (excluding Udyam)...");
    const deleteRes = await MasterRecord.deleteMany({ category: { $ne: 'Udyam' } });
    console.log(`Deleted ${deleteRes.deletedCount} records.`);

    // 2. Import MASTER SHEET (Visits/Interactions)
    const masterSheet = workbook.Sheets['MASTER SHEET'];
    const masterData = XLSX.utils.sheet_to_json(masterSheet, { header: 1 }); // Array of arrays

    console.log(`Processing MASTER SHEET (${masterData.length} rows)...`);
    let masterCount = 0;
    const masterRecords = [];

    // Skip Header (Row 0)
    for (let i = 1; i < masterData.length; i++) {
        const row = masterData[i];
        if (!row || row.length === 0) continue;

        // Extract Indices
        // 1: Particular
        // 2: Event Name
        // 3: BFC/WEFC
        // 4: Date
        // 7: Name

        const particular = row[1] ? String(row[1]).trim() : '';
        const eventName = row[2] ? String(row[2]).trim() : '';
        const org = row[3] ? String(row[3]).trim() : 'BFC'; // Default to BFC

        // Date Parsing
        let dateVal = row[4];
        let dateObj = null;
        if (dateVal) {
            if (typeof dateVal === 'number') {
                dateObj = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
            } else {
                dateObj = new Date(dateVal);
            }
            if (isNaN(dateObj.getTime())) {
                dateObj = null; // Reset if invalid
            }
        }

        const name = row[7] ? String(row[7]).trim() : 'Visitor';

        // Categorize
        let category = 'Walk-in';
        const pLower = particular.toLowerCase();
        const eLower = eventName.toLowerCase();

        if (pLower.includes('event') || eLower.includes('event') || pLower.includes('exhibition')) {
            category = 'Event';
        } else if (pLower.includes('workshop')) {
            category = 'Workshop';
        } else if (pLower.includes('general') || pLower.includes('visit') || pLower.includes('walk')) {
            category = 'Walk-in';
        }

        // Only add if we have minimal data
        if (name !== 'Visitor' || eventName || particular) {
            masterRecords.push({
                particular,
                eventName,
                organization: org,
                date: dateObj,
                name,
                category,
                remarks: row[28] || '',
                fromSource: 'MASTER_SHEET'
            });
            masterCount++;
        }
    }

    if (masterRecords.length > 0) {
        try {
            await MasterRecord.insertMany(masterRecords, { ordered: false });
            console.log(`Imported ${masterCount} records from MASTER SHEET.`);
        } catch (e) {
            // Ignore duplicate insert errors
        }
    }

    // 3. Import MoM Sheets (Events)
    const momSheets = workbook.SheetNames.filter(n => n.includes('MoM'));
    console.log("Processing MoM Sheets:", momSheets);

    let momCount = 0;
    const momRecords = [];

    for (const sheetName of momSheets) {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Determine Category from Sheet Name
        let sheetCategory = 'MoM_Event';
        const sLower = sheetName.toLowerCase();
        if (sLower.includes('exhibition')) sheetCategory = 'Exhibition';
        else if (sLower.includes('department') || sLower.includes('visit')) sheetCategory = 'Departmental_Visit';

        // Skip header
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            // Assumed Structure based on inspection:
            // 0: S.No
            // 1: Date
            // 2: Time? / Event Name part 1
            // 3: Event Name / Location
            // 4: Description / Points

            let dateObj = null;
            let eventName = '';
            let description = '';

            const potentialDate = row[1];
            if (potentialDate) {
                if (typeof potentialDate === 'number') {
                    dateObj = new Date(Math.round((potentialDate - 25569) * 86400 * 1000));
                } else if (!isNaN(Date.parse(potentialDate))) {
                    dateObj = new Date(potentialDate);
                }
            }
            if (dateObj && isNaN(dateObj.getTime())) dateObj = null;

            const col2 = row[2] ? String(row[2]).trim() : '';
            const col3 = row[3] ? String(row[3]).trim() : '';
            const col4 = row[4] ? String(row[4]).trim() : '';
            const col5 = row[5] ? String(row[5]).trim() : '';

            // Heuristic for Title vs Details
            if (col2 && col2.length > 15 && !col2.includes(':')) {
                // Col 2 is likely title if long and not time
                eventName = col2;
                description = col3 + '\n' + col4;
            } else {
                // Otherwise combine Col 2 and Col 3
                eventName = col2;
                if (col3) eventName += ' ' + col3;
                description = col4 + '\n' + col5;
            }

            if (!eventName || eventName.length < 3) {
                // Fallback
                if (dateObj) eventName = `${sheetCategory} on ${dateObj.toLocaleDateString()}`;
                else continue; // Skip empty rows
            }

            momRecords.push({
                eventName: eventName.replace(/\s+/g, ' ').trim(),
                date: dateObj,
                category: sheetCategory,
                organization: 'BFC', // Default
                fromSource: sheetName,
                remarks: description.trim()
            });
            momCount++;
        }
    }

    if (momRecords.length > 0) {
        try {
            await MasterRecord.insertMany(momRecords, { ordered: false });
            console.log(`Imported ${momCount} events from MoM Sheets.`);
        } catch (e) {
            console.error("Partial Import Error (MoM):", e.message.substring(0, 200));
        }
    }

    console.log("Full Master Data Import Complete.");
    process.exit();
};

importData();
