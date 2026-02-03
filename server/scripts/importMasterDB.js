const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const MasterRecord = require('../models/MasterRecord');
const Expert = require('../models/Expert');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const importMasterData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Fetch Experts to create specific matchers
        const experts = await Expert.find({});
        console.log(`Loaded ${experts.length} experts from DB for matching.`);

        const expertMap = {}; // name part -> full name
        experts.forEach(e => {
            if (!e.name) return;
            // Map full name
            expertMap[e.name.toLowerCase()] = e.name;
            // Map first name (if unique-ish)
            const parts = e.name.trim().split(' ');
            if (parts.length > 0) {
                const firstName = parts[0].toLowerCase();
                // Avoid overwriting if multiple Sankets, but usually OK for small team
                if (!expertMap[firstName] || expertMap[firstName].length > e.name.length) {
                    expertMap[firstName] = e.name;
                }
            }
        });
        console.log('Expert Match Keys:', Object.keys(expertMap));

        // 2. Read Excel
        const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');
        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            process.exit(1);
        }
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets['MASTER SHEET'];

        // Read as Matrix (Array of Arrays) to access by index
        // Header is Row 0. Data starts Row 1.
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        console.log(`Found ${rawData.length} rows (including header).`);

        // Indices based on dump:
        // 2: Event Name
        // 6: Participant Type
        // 7: Name of Entrepreneur (Sometimes expert name?)
        // 8: Enterprise Name
        // 9: Udyam No
        // 13: Mobile No
        // 27: Remarks (Contains expert name)

        const recordsToInsert = [];
        let matchedCount = 0;

        // Start from Row 1
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;

            // Extract potential expert text
            const remarks = (row[27] || '').toString();
            const entrepreneurName = (row[7] || '').toString(); // Check this too

            let matchedExpertName = '';

            // Helper to check against expert map
            const findExpert = (text) => {
                if (!text) return null;
                const lower = text.toLowerCase();
                // Check all keys in expertMap
                for (const key of Object.keys(expertMap)) {
                    // Use word boundary regex for first names to avoid "Tejas" in "Tejasvita"
                    // Escape key for regex
                    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    // Regex: \bKEY\b. e.g. "by Sanket" matches. "Sanketfoo" does not.
                    const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');
                    if (regex.test(lower)) {
                        return expertMap[key];
                    }
                }
                return null;
            };

            // Priority 1: Remarks
            matchedExpertName = findExpert(remarks);

            // Priority 2: Entrepreneur Name (For Events where expert is listed as entrepreneur?)
            if (!matchedExpertName) {
                matchedExpertName = findExpert(entrepreneurName);
            }

            if (matchedExpertName) matchedCount++;

            // Ensure date is valid
            let dateVal = row[4];
            let parsedDate = null;
            if (dateVal) {
                if (typeof dateVal === 'number') {
                    // Excel date
                    parsedDate = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
                } else {
                    const d = new Date(dateVal);
                    if (!isNaN(d.getTime())) parsedDate = d;
                }
            }
            // Fallback for sorting if date is truly missing
            if (!parsedDate) parsedDate = new Date(0); // Epoch 0 or leave null if schema allows

            recordsToInsert.push({
                expertName: matchedExpertName || '',
                eventName: row[2] || '',
                participantType: row[6] || '', // Added to schema
                businessName: row[8] || '',
                udyamRegistrationNo: row[9] || '', // Map to schema name
                contactNumber: row[13] || '', // Map to schema name (or mobile alias)
                mobile: row[13] || '',
                address: row[20] || '', // Business Address Index 20
                district: row[21] || '',
                date: parsedDate,
                remarks: remarks,
                createdAt: new Date()
            });
        }

        await MasterRecord.deleteMany({});
        console.log('Cleared existing Master Records.');

        // Insert in chunks
        // await MasterRecord.insertMany(recordsToInsert);
        // Split into chunks of 500 to avoid buffer issues or timeouts
        const chunkSize = 500;
        for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
            const chunk = recordsToInsert.slice(i, i + chunkSize);
            await MasterRecord.insertMany(chunk);
            console.log(`Inserted chunk ${i} - ${i + chunk.length}`);
        }

        console.log(`Successfully imported ${recordsToInsert.length} master records.`);
        console.log(`Matched ${matchedCount} records to an Expert.`);

        process.exit(0);
    } catch (err) {
        console.error('Import Error:', err);
        process.exit(1);
    }
};

importMasterData();
