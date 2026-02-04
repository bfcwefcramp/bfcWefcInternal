const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const Expert = require('../models/Expert');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.6g0ahpm.mongodb.net/bfcwefc?retryWrites=true&w=majority";

const updateExpertMoMs = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Fetch Experts
        const experts = await Expert.find({});
        console.log(`Found ${experts.length} experts.`);

        // 2. Initialize Expert Map & Clear existing MoMs
        const expertMap = {}; // name -> expertDocument

        experts.forEach(e => {
            // Reset MoMs array for fresh update
            e.moms = [];

            if (e.name) {
                expertMap[e.name.toLowerCase()] = e;
                const parts = e.name.trim().split(' ');
                if (parts.length > 0) {
                    // Add first name alias if not conflicting or just overwrite (last one wins)
                    // Using full name is safer, but let's keep the alias logic for matching inputs
                }
            }
        });

        // Helper to find expert doc by text name
        const findExpertDoc = (text) => {
            if (!text) return null;
            const clean = text.replace(/\(BFC\)/gi, '').replace(/\(WEFC\)/gi, '').trim().toLowerCase();

            // Direct match
            if (expertMap[clean]) return expertMap[clean];

            // Substring/Partial match
            // This is O(N) search, acceptable for small number of experts
            for (const key of Object.keys(expertMap)) {
                if (clean.includes(key) || key.includes(clean)) { // flexible matching
                    return expertMap[key];
                }
            }

            // Try matching by checking if any expert name is inside the text
            for (const e of experts) {
                if (e.name && clean.includes(e.name.toLowerCase())) return e;
            }

            return null;
        };

        const filePath = path.join(__dirname, '../../Final Master Database sheet.xlsx');
        if (!fs.existsSync(filePath)) throw new Error(`File not found at ${filePath}`);

        const workbook = XLSX.readFile(filePath);
        const sheetsToProcess = [
            'MoMs - Event_Exhibitions',
            ' MoMs - departmental visits'
        ];

        let totalMoMsAdded = 0;

        for (const sheetName of sheetsToProcess) {
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) {
                console.log(`Sheet skipped (not found): ${sheetName}`);
                continue;
            }
            // Headers:
            // 0: S.No, 1: Date, 2: Day, 3: Place, 4: Event, 5: Category, 6: Attended By, 7: Agenda, 8: Discussion Points
            const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            console.log(`Processing ${sheetName}, Rows: ${rawData.length}`);

            for (let i = 1; i < rawData.length; i++) {
                const row = rawData[i];
                if (!row || row.length < 2) continue;

                const attendeesRaw = row[6]; // Index 6: Attended By
                if (!attendeesRaw) continue;

                // Split attendees
                const attendeesList = attendeesRaw.toString().split(/[\r\n,]+/).map(s => s.trim()).filter(s => s);

                // Parse Data
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
                const location = row[3] || '';
                const summary = row[7] || row[8] || ''; // Agenda or Discussion Points

                // For each attendee in the row, find if they are an expert in our DB
                attendeesList.forEach(attendeeName => {
                    const expertDoc = findExpertDoc(attendeeName);
                    if (expertDoc) {
                        expertDoc.moms.push({
                            date: parsedDate,
                            eventName: eventName,
                            location: location,
                            summary: summary,
                            attendees: attendeesList // Store full list of attendees for context
                        });
                        totalMoMsAdded++;
                    }
                });
            }
        }

        console.log(`Total MoMs distributed: ${totalMoMsAdded}`);

        // Save all experts
        let savedCount = 0;
        for (const e of experts) {
            // Optional: calculate stats.momsCreated based on array length
            if (e.stats) {
                e.stats.momsCreated = e.moms.length;
            } else {
                e.stats = { momsCreated: e.moms.length };
            }

            await e.save();
            savedCount++;
        }

        console.log(`Updated ${savedCount} experts.`);
        process.exit(0);

    } catch (err) {
        console.error('Update Error:', err);
        process.exit(1);
    }
};

updateExpertMoMs();
