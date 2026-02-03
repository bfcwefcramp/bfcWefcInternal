const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const Expert = require('../models/Expert');
const MasterRecord = require('../models/MasterRecord');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const importExhibitions = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Build Expert Map
        const experts = await Expert.find({});
        const expertMap = {};
        experts.forEach(e => {
            if (!e.name) return;
            expertMap[e.name.toLowerCase()] = e.name;
            const parts = e.name.trim().split(' ');
            if (parts.length > 0) {
                const firstName = parts[0].toLowerCase();
                if (!expertMap[firstName] || expertMap[firstName].length > e.name.length) {
                    expertMap[firstName] = e.name;
                }
            }
        });

        // 2. Read Sheet
        const filePath = path.join('c:/Users/DITC/Desktop/bfcWefcBackedupV1.1/bfcWefcInternal', 'Final Master Database sheet.xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames.find(n => n.includes('Event_Exh'));

        if (!sheetName) {
            console.error("Sheet 'Event_Exh' not found.");
            process.exit(1);
        }

        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log(`Processing ${sheetName} with ${rawData.length} rows.`);

        const recordsToInsert = [];

        // 3. Iterate & Map
        // Based on visually inspecting typical MoM sheets: 
        // Col 0: S.No ?
        // Col 1: Date ?
        // Col 2: Event Name / Place ? 
        // Col 3: Name of Official (Expert) ?
        // Col 4: Key Points / Remarks ?

        // Let's try to detect headers in Row 0 to be sure, but fallback to index
        // Row 0: ["S.No", "Date", "Name of Event/Exhibition", "Name of Officials Attended", "Key Points / Remarks"] (Hypothesis)

        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row) continue;

            const dateRaw = row[1]; // Index 1
            const eventName = (row[4] || '').toString(); // Index 4: Name of Event
            const officialsRaw = (row[6] || '').toString(); // Index 6: Attended by (Internal)

            // Combine Agenda (7) and Discussion Points (8) for remarks
            const remarks = `Agenda: ${row[7] || ''}\nPoints: ${row[8] || ''}`;

            // Parse Date
            let parsedDate = new Date(0);
            if (dateRaw) {
                if (typeof dateRaw === 'number') {
                    parsedDate = new Date(Math.round((dateRaw - 25569) * 86400 * 1000));
                } else if (typeof dateRaw === 'string') {
                    // Try parsing "dd/mm/yyyy" or range "dd/mm/yyyy To ..."
                    // Clean up range by taking first part
                    const firstDatePart = dateRaw.split('To')[0].trim();
                    // Check for dd/mm/yyyy format
                    const parts = firstDatePart.split('/');
                    if (parts.length === 3) {
                        // Swap to mm/dd/yyyy for JS Date constructor or use explicit constructor
                        // parts[0]=dd, parts[1]=mm, parts[2]=yyyy
                        // new Date(yyyy, mm-1, dd)
                        parsedDate = new Date(parts[2], parts[1] - 1, parts[0]);
                    } else {
                        const d = new Date(firstDatePart);
                        if (!isNaN(d.getTime())) parsedDate = d;
                    }
                }
            }

            // Match Expert(s)
            let matchedExperts = [];
            const officialsLower = officialsRaw.toLowerCase();

            Object.keys(expertMap).forEach(key => {
                // Simple string check
                if (officialsLower.includes(key)) {
                    if (!matchedExperts.includes(expertMap[key])) {
                        matchedExperts.push(expertMap[key]);
                    }
                }
            });

            if (matchedExperts.length === 0) continue; // Skip if no expert found

            // Create record for each matched expert
            matchedExperts.forEach(expName => {
                recordsToInsert.push({
                    expertName: expName,
                    eventName: eventName || 'Exhibition/Event',
                    category: 'Exhibition',
                    date: parsedDate,
                    remarks: remarks,
                    createdAt: new Date()
                });
            });
        }

        console.log(`Prepared ${recordsToInsert.length} exhibition records.`);
        if (recordsToInsert.length > 0) {
            await MasterRecord.insertMany(recordsToInsert);
            console.log("Inserted successfully.");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

importExhibitions();
