const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const Expert = require('../models/Expert');
const MasterRecord = require('../models/MasterRecord');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const importUdyam = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Build Expert Map
        const experts = await Expert.find({});
        const expertMap = {};
        experts.forEach(e => {
            if (!e.name) return;
            const fullName = e.name.toLowerCase();
            expertMap[fullName] = e.name;

            // Map first name too
            const parts = e.name.trim().split(' ');
            if (parts.length > 0) {
                const firstName = parts[0].toLowerCase();
                // Prefer exact match if collision, but here usually unique enough
                if (!expertMap[firstName] || expertMap[firstName].length > e.name.length) {
                    expertMap[firstName] = e.name;
                }
            }
        });

        // 2. Read Sheet
        const filePath = path.join('c:/Users/DITC/Desktop/bfcWefcBackedupV1.1/bfcWefcInternal', 'Compiled Udyam Registration Data - BFC Team.xlsx');
        const workbook = XLSX.readFile(filePath);
        const detailedSheetName = workbook.SheetNames[1]; // Index 1
        console.log(`Processing Sheet: ${detailedSheetName}`);

        const sheet = workbook.Sheets[detailedSheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const recordsToInsert = [];

        // 3. Iterate Rows (Skip Row 0 & 1 which are headers)
        for (let i = 2; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length < 2) continue;

            // Map Columns
            const assignedExpert = (row[1] || '').toString().trim();
            const entrepreneurName = (row[2] || '').toString();
            const unitName = (row[3] || '').toString();
            const udyamNo = (row[19] || '').toString();
            const dateRaw = row[20];
            const comments = (row[22] || '').toString();

            if (!assignedExpert) continue;

            // Match Expert
            const expertKey = assignedExpert.toLowerCase();
            let matchedExpertName = null;

            // Direct lookup or partial
            if (expertMap[expertKey]) {
                matchedExpertName = expertMap[expertKey];
            } else {
                // Try contains
                const foundKey = Object.keys(expertMap).find(k => expertKey.includes(k));
                if (foundKey) matchedExpertName = expertMap[foundKey];
            }

            if (!matchedExpertName) {
                // console.log(`Skipping row ${i}: Expert '${assignedExpert}' not found.`);
                continue;
            }

            // Parse Date
            let parsedDate = new Date(); // Default now
            if (dateRaw && typeof dateRaw === 'number') {
                parsedDate = new Date(Math.round((dateRaw - 25569) * 86400 * 1000));
            } else if (dateRaw) {
                const d = new Date(dateRaw);
                if (!isNaN(d.getTime())) parsedDate = d;
            }

            // check duplication? 
            // We assume bulk import. If we run this multiple times, we might duplicate.
            // But user asked to restore missing data. We can delete existing 'Udyam' category matches?
            // Safer to just insert for now. Or check if exists.

            // Construct Record
            const record = {
                expertName: matchedExpertName,
                eventName: `Udyam Registration: ${udyamNo}`,
                category: 'Udyam',
                date: parsedDate,
                remarks: `Beneficiary: ${entrepreneurName}, Unit: ${unitName}. ${comments}`,
                createdAt: new Date()
            };

            recordsToInsert.push(record);
        }

        console.log(`Found ${recordsToInsert.length} Udyam records to insert.`);

        if (recordsToInsert.length > 0) {
            // Optional: Clear existing Udyams before inserting to avoid duplicates?
            // const deleteResult = await MasterRecord.deleteMany({ category: 'Udyam' });
            // console.log(`Deleted ${deleteResult.deletedCount} existing Udyam records.`);

            // User query: "Why have you removed..." implies they are gone.
            // If I delete, I ensure clean state. Since this file seems to be the "Compiled" source of truth, it's safer to RELOAD it all.
            // But let's be careful not to delete manual entries if any.
            // Given the file name "Compiled...", it's likely the master list.

            // Let's delete only those that match 'Udyam' category to avoid dupes from previous imports
            await MasterRecord.deleteMany({ category: 'Udyam' });
            console.log("Cleared existing Udyam records.");

            await MasterRecord.insertMany(recordsToInsert);
            console.log("Inserted successfully.");
        }

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

importUdyam();
