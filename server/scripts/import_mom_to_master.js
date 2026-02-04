const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const MasterRecord = require('../models/MasterRecord');
const Expert = require('../models/Expert');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const importMoMsToMaster = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Fetch Experts for fuzzy matching
        const experts = await Expert.find({});
        console.log(`Loaded ${experts.length} experts for name matching.`);

        const expertMap = {}; // fast lookup map
        experts.forEach(e => {
            if (e.name) {
                // Store lower case full name
                expertMap[e.name.trim().toLowerCase()] = e.name;
                // Store lower case parts if unique? Not doing unique parts map for now to avoid false positives,
                // rely on string inclusion check in findExpert()
            }
        });

        const findExpertName = (text) => {
            if (!text) return null;
            const clean = text.replace(/\(BFC\)/gi, '').replace(/\(WEFC\)/gi, '').trim().toLowerCase();

            // 1. Exact match
            if (expertMap[clean]) return expertMap[clean];

            // 2. Contains match (longer names match shorter queries)
            // e.g. "Aditya" matches "Aditya (BFC)"
            for (const key of Object.keys(expertMap)) {
                if (clean.includes(key) || key.includes(clean)) {
                    return expertMap[key];
                }
            }

            // 3. Fallback: Check against original expert list one by one
            for (const e of experts) {
                if (clean.includes(e.name.toLowerCase())) return e.name;
            }

            return null;
        };

        // 2. Clear old MoMs from MasterRecord to avoid duplication
        // We delete by category created by this script
        await MasterRecord.deleteMany({ category: { $in: ['MoM_Event', 'Departmental_Visit', 'Exhibition'] } });
        console.log('Cleared old MoM/Event records from MasterRecord.');

        const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');
        if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);

        const workbook = XLSX.readFile(filePath);

        // Map Sheet Name to Category
        const sheetConfig = [
            { name: 'MoMs - Event_Exhibitions', category: 'Exhibition' },
            { name: ' MoMs - departmental visits', category: 'Departmental_Visit' }
        ];

        let insertCount = 0;
        let recordsToInsert = [];

        for (const config of sheetConfig) {
            const sheet = workbook.Sheets[config.name];
            if (!sheet) {
                console.log(`Sheet skipped (not found): ${config.name}`);
                continue;
            }

            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            console.log(`Processing ${config.name}, Rows: ${rawData.length}`);

            // Rows start at index 1 (0 is header)
            for (let i = 1; i < rawData.length; i++) {
                const row = rawData[i];
                if (!row || row.length < 2) continue;

                // Index 6: Attended By
                const attendeesRaw = row[6];
                if (!attendeesRaw) continue;

                const attendeesList = attendeesRaw.toString().split(/[\r\n,]+/).map(s => s.trim()).filter(s => s);

                // Parse Date
                let parsedDate = new Date();
                const dateVal = row[1];
                if (dateVal) {
                    if (typeof dateVal === 'number') {
                        parsedDate = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
                    } else {
                        const dateStr = dateVal.toString().split('To')[0].trim();
                        const d = new Date(dateStr);
                        if (!isNaN(d.getTime())) parsedDate = d;
                    }
                }

                const eventName = row[4] || row[3] || 'Unnamed Event';
                const venue = row[3] || '';
                const agenda = row[7] || '';
                const remarks = row[8] || ''; // Discussion

                // For each valid expert attendee, create a MasterRecord
                attendeesList.forEach(attendeeName => {
                    const matchedName = findExpertName(attendeeName);
                    if (matchedName) {
                        recordsToInsert.push({
                            expertName: matchedName, // CRITICAL: This links it to the expert
                            category: config.category, // Used for filter in routes/master.js
                            eventName: eventName,
                            venue: venue,
                            date: parsedDate,
                            agenda: agenda,
                            remarks: remarks, // Description
                            organization: 'BFC', // Default
                            createdAt: new Date()
                        });
                    }
                });
            }
        }

        if (recordsToInsert.length > 0) {
            await MasterRecord.insertMany(recordsToInsert);
            console.log(`Successfully inserted ${recordsToInsert.length} records into MasterRecord.`);
        } else {
            console.log('No records found to insert.');
        }

        process.exit(0);

    } catch (err) {
        console.error('Import Error:', err);
        process.exit(1);
    }
};

importMoMsToMaster();
